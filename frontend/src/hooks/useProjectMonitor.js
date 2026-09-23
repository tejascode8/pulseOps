import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS, DEFAULT_PROJECTS } from '../utils/storage';
import { checkProjectUrl, normalizeUrl } from '../utils/projectChecker';
import { checkScheduleStatus } from '../utils/scheduleHelper';
import { useAuth } from '../context/AuthContext';
import {
  fetchProjects,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  toggleProjectApi,
  restartProjectApi,
  resetDefaultProjectsApi,
  bulkImportProjectsApi,
  fetchLogs,
  createLogApi,
  clearLogsApi,
  checkBackendHealth,
} from '../utils/api';

export function useProjectMonitor() {
  const { user, isAuthenticated } = useAuth();

  const userProjectsKey = user ? `${STORAGE_KEYS.PROJECTS}_${user.id || user._id}` : STORAGE_KEYS.PROJECTS;
  const userLogsKey = user ? `${STORAGE_KEYS.LOGS}_${user.id || user._id}` : STORAGE_KEYS.LOGS;

  const [projects, setProjects] = useLocalStorage(userProjectsKey, DEFAULT_PROJECTS);
  const [logs, setLogs] = useLocalStorage(userLogsKey, []);
  const [checkingIds, setCheckingIds] = useState(new Set());
  const [activeStaySessions, setActiveStaySessions] = useState({}); // { [projectId]: { stayUntil, stayDurationSec, mode, url } }
  const [now, setNow] = useState(Date.now());
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting'); // 'connected' | 'connecting' | 'offline'
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Keep references to open tab window handles for auto-closing
  const openTabsRef = useRef({});
  const projectsRef = useRef(projects);
  const lastSyncMapRef = useRef({}); // { [projectId]: { timestamp, status } }
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Sync with MongoDB backend when user logs in or mounts
  useEffect(() => {
    let isMounted = true;

    async function initDbSync() {
      try {
        const health = await checkBackendHealth().catch(() => null);
        if (health && health.success) {
          if (isMounted) setDbStatus('connected');
        } else {
          if (isMounted) setDbStatus('offline');
        }

        if (isAuthenticated && health && health.success) {
          // Fetch user-specific projects from MongoDB
          const remoteProjects = await fetchProjects().catch(() => []);
          if (isMounted && Array.isArray(remoteProjects) && remoteProjects.length > 0) {
            const formatted = remoteProjects.map((p) => ({
              ...p,
              id: p.customId || p.id || p._id,
              interval: Number(p.interval) || 10,
              stayDuration: Number(p.stayDuration !== undefined ? p.stayDuration : 60),
              stayMode: p.stayMode || 'background',
              completedCycles: Number(p.completedCycles) || 0,
              autoOpenTab: (p.stayMode || 'background') === 'tab',
              nextCheckTimestamp: p.nextCheckTimestamp || (p.enabled ? Date.now() + (p.interval || 10) * 60 * 1000 : null),
            }));
            setProjects(formatted);
          }

          // Fetch user-specific logs from MongoDB
          const remoteLogs = await fetchLogs(50).catch(() => []);
          if (isMounted && Array.isArray(remoteLogs) && remoteLogs.length > 0) {
            setLogs(remoteLogs);
          }
        } else if (!isAuthenticated) {
          // When logged out, reset to empty
          setProjects([]);
          setLogs([]);
        }
      } catch {
        if (isMounted) setDbStatus('offline');
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    }

    initDbSync();

    // Check DB health periodically (every 30 seconds)
    const healthInterval = setInterval(async () => {
      try {
        const res = await checkBackendHealth();
        if (res && res.success && isMounted) {
          setDbStatus('connected');
        }
      } catch (e) {
        if (isMounted) setDbStatus('offline');
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(healthInterval);
    };
  }, [user, isAuthenticated, setProjects, setLogs]);

  // Log adding helper - records locally with 0ms latency and selectively syncs key events to MongoDB
  const addLog = useCallback(
    (logEntry, isPersistent = true) => {
      const newEntry = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString(),
        ...logEntry,
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);

      if (isAuthenticated && isPersistent) {
        // Save significant telemetry / audit events to MongoDB
        createLogApi(logEntry).catch(() => {});
      }
    },
    [isAuthenticated, setLogs]
  );

  // Global 1-second ticker to update countdowns, clean up finished stay sessions, and activate interval countdowns sequentially
  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      // Check finished stay sessions and trigger interval countdown activation
      setActiveStaySessions((prev) => {
        let changed = false;
        const next = { ...prev };

        Object.keys(next).forEach((id) => {
          if (currentNow >= next[id].stayUntil) {
            const finishedSession = next[id];

            // 1. If an external tab was opened, auto-close it now
            if (openTabsRef.current[id]) {
              try {
                if (!openTabsRef.current[id].closed) {
                  openTabsRef.current[id].close();
                }
              } catch (e) {}
              delete openTabsRef.current[id];
            }

            // 2. Transition from Stay phase -> Complete Cycle & Activate Interval Countdown
            const project = projectsRef.current.find((p) => p.id === id);
            if (project) {
              const nextCycles = (project.completedCycles || 0) + 1;
              const intervalMs = (project.interval || 10) * 60 * 1000;
              const nextTimestamp = currentNow + intervalMs;

              setProjects((prevProjects) =>
                prevProjects.map((p) =>
                  p.id === id
                    ? {
                        ...p,
                        completedCycles: nextCycles,
                        nextCheckTimestamp: nextTimestamp, // Starts interval timer right now!
                      }
                    : p
                )
              );

              if (isAuthenticated) {
                // Sync updated cycle to MongoDB and update sync timestamp
                lastSyncMapRef.current[id] = {
                  timestamp: currentNow,
                  status: 'active',
                };
                updateProjectApi(id, {
                  completedCycles: nextCycles,
                  nextCheckTimestamp: nextTimestamp,
                }).catch(() => {});
              }

              addLog({
                projectName: project.name,
                url: project.url,
                status: 'active',
                cycle: nextCycles,
                message: `Cycle #${nextCycles} Completed • Stay on site finished (${finishedSession.stayDurationSec}s) • Next check in ${project.interval}m`,
              });
            }

            delete next[id];
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, addLog, setProjects]);

  // Execute single project ping & initiate stay duration
  const pingProject = useCallback(
    async (projectId, manual = false) => {
      const project = projectsRef.current.find((p) => p.id === projectId);
      if (!project) return;

      setCheckingIds((prev) => new Set(prev).add(projectId));

      const stayDurationSec = Number(project.stayDuration !== undefined ? project.stayDuration : 60); // default 60s
      const stayMode = project.stayMode || (project.autoOpenTab ? 'tab' : 'background');

      // 1. If Stay Duration is configured, start Stay Session and PAUSE the interval timer
      if (stayDurationSec > 0 && stayMode !== 'none') {
        const startTime = Date.now();
        const stayUntil = startTime + stayDurationSec * 1000;
        setActiveStaySessions((prev) => ({
          ...prev,
          [projectId]: {
            startTime,
            stayUntil,
            stayDurationSec,
            durationSec: stayDurationSec,
            mode: stayMode,
            url: normalizeUrl(project.url),
          },
        }));

        // If tab mode is enabled, open tab
        if (stayMode === 'tab' || project.autoOpenTab) {
          try {
            if (openTabsRef.current[projectId] && !openTabsRef.current[projectId].closed) {
              openTabsRef.current[projectId].close();
            }

            const opened = window.open(normalizeUrl(project.url), '_blank');
            if (opened && !opened.closed) {
              openTabsRef.current[projectId] = opened;
            } else {
              setPopupBlocked(true);
            }
          } catch (e) {
            setPopupBlocked(true);
          }
        }
      }

      // 2. Perform HTTP probe to measure response latency
      const checkResult = await checkProjectUrl(project.url);

      // 3. Update project status:
      // Note: If stayDuration > 0, nextCheckTimestamp remains null until the stay session completes!
      // If stayDuration == 0 (instant), complete cycle immediately and activate interval.
      const intervalMs = (project.interval || 10) * 60 * 1000;
      const willHaveStaySession = stayDurationSec > 0 && stayMode !== 'none';
      const nextTimestamp = willHaveStaySession ? null : Date.now() + intervalMs;
      const nextCycles = willHaveStaySession ? project.completedCycles || 0 : (project.completedCycles || 0) + 1;

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: checkResult.status,
              statusCode: checkResult.statusCode,
              latencyMs: checkResult.latencyMs,
              lastLatency: checkResult.latencyMs,
              statusMessage: checkResult.message,
              lastChecked: checkResult.timestamp,
              completedCycles: nextCycles,
              nextCheckTimestamp: nextTimestamp,
            };
          }
          return p;
        })
      );

      if (isAuthenticated) {
        // Intelligent Write Throttling: Sync to MongoDB on manual action, on status transitions, or at most once every 3 minutes
        const lastSync = lastSyncMapRef.current[projectId];
        const statusChanged = !lastSync || lastSync.status !== checkResult.status;
        const timeSinceLastSync = lastSync ? Date.now() - lastSync.timestamp : Infinity;
        const shouldSyncToDb = manual || statusChanged || timeSinceLastSync >= 180000;

        if (shouldSyncToDb) {
          lastSyncMapRef.current[projectId] = {
            timestamp: Date.now(),
            status: checkResult.status,
          };
          updateProjectApi(projectId, {
            status: checkResult.status,
            statusCode: checkResult.statusCode,
            latencyMs: checkResult.latencyMs,
            statusMessage: checkResult.message,
            lastChecked: new Date(),
            completedCycles: nextCycles,
            nextCheckTimestamp: nextTimestamp,
          }).catch(() => {});
        }
      }

      const stayText = willHaveStaySession
        ? ` • Staying on site for ${stayDurationSec}s (${stayMode === 'tab' ? 'Auto-Close Tab' : 'Silent Background Frame'})`
        : '';

      // Selective persistence: Save to MongoDB for manual actions, status changes, or down events
      const isStatusChange = !project.status || project.status !== checkResult.status;
      const isDown = checkResult.status === 'down';
      const shouldPersistLog = manual || isStatusChange || isDown;

      addLog(
        {
          projectName: project.name,
          url: project.url,
          status: checkResult.status,
          statusCode: checkResult.statusCode,
          latencyMs: checkResult.latencyMs,
          message: `${manual ? '[Manual Ping] ' : ''}${checkResult.message}${stayText}`,
        },
        shouldPersistLog
      );

      setCheckingIds((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    },
    [isAuthenticated, setProjects, addLog]
  );

  // Restart / Reset cycle count to 0 and start a fresh cycle
  const restartProject = useCallback(
    async (projectId) => {
      const project = projectsRef.current.find((p) => p.id === projectId);
      if (!project) return;

      // Close open tab if any
      if (openTabsRef.current[projectId] && !openTabsRef.current[projectId].closed) {
        try {
          openTabsRef.current[projectId].close();
        } catch (e) {}
        delete openTabsRef.current[projectId];
      }

      // Clear active stay session
      setActiveStaySessions((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });

      // Reset cycle count to 0 and trigger fresh ping
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                completedCycles: 0,
                nextCheckTimestamp: null,
              }
            : p
        )
      );

      if (isAuthenticated) {
        // Sync restart in MongoDB
        restartProjectApi(projectId).catch(() => {});
      }

      addLog({
        projectName: project.name,
        url: project.url,
        status: 'active',
        message: `Restarted warming sequence • Cycle count reset to #0`,
      });

      // Trigger immediate fresh cycle
      pingProject(projectId, true);
    },
    [isAuthenticated, addLog, pingProject, setProjects]
  );

  // Ping All enabled projects
  const pingAll = useCallback(async () => {
    const enabledProjects = projectsRef.current.filter((p) => p.enabled);
    if (enabledProjects.length === 0) return;

    await Promise.all(enabledProjects.map((p) => pingProject(p.id, true)));
  }, [pingProject]);

  // Open all enabled project tabs
  const openAll = useCallback(() => {
    const enabledProjects = projectsRef.current.filter((p) => p.enabled);
    let blocked = false;
    enabledProjects.forEach((p) => {
      try {
        const opened = window.open(normalizeUrl(p.url), '_blank');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          blocked = true;
        }
      } catch (e) {
        blocked = true;
      }
    });
    if (blocked) {
      setPopupBlocked(true);
    }
  }, []);

  // Monitor automated checks loop with Schedule window evaluation
  useEffect(() => {
    const intervalRunner = setInterval(() => {
      const currentProjects = projectsRef.current;
      const currentTimestamp = Date.now();

      currentProjects.forEach((proj) => {
        if (!proj.enabled) return;

        // Skip if this project is currently in the middle of a Stay Session
        if (activeStaySessions[proj.id]) {
          return;
        }

        // Verify if project is within active schedule window
        const scheduleInfo = checkScheduleStatus(proj, currentTimestamp);
        if (!scheduleInfo.isInSchedule) {
          return; // Skip auto-ping when outside scheduled date/time range
        }

        // If nextCheckTimestamp is not set, initialize it
        if (!proj.nextCheckTimestamp) {
          const intervalMs = (proj.interval || 10) * 60 * 1000;
          const nextTimestamp = currentTimestamp + intervalMs;
          setProjects((prev) =>
            prev.map((p) => (p.id === proj.id ? { ...p, nextCheckTimestamp: nextTimestamp } : p))
          );
          if (isAuthenticated) {
            updateProjectApi(proj.id, { nextCheckTimestamp: nextTimestamp }).catch(() => {});
          }
          return;
        }

        // If interval countdown reached 0 and not currently checking, execute ping and stay cycle!
        if (currentTimestamp >= proj.nextCheckTimestamp && !checkingIds.has(proj.id)) {
          pingProject(proj.id, false);
        }
      });
    }, 1500);

    return () => clearInterval(intervalRunner);
  }, [isAuthenticated, activeStaySessions, checkingIds, pingProject, setProjects]);

  // CRUD Functions connected to MongoDB & User
  const addProject = useCallback(
    async (projectData) => {
      const intervalMinutes = Number(projectData.interval) || 10;
      const stayDurationSec = Number(projectData.stayDuration !== undefined ? projectData.stayDuration : 60);

      const localProject = {
        id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: projectData.name.trim(),
        url: normalizeUrl(projectData.url),
        interval: intervalMinutes,
        stayDuration: stayDurationSec, // in seconds (default: 60 = 1 min)
        stayMode: projectData.stayMode || 'background', // 'background' | 'tab' | 'none'
        enabled: projectData.enabled ?? true,
        completedCycles: 0, // Cycle Counter
        autoOpenTab: projectData.stayMode === 'tab',
        scheduleMode: projectData.scheduleMode || 'always',
        scheduleStart: projectData.scheduleStart || '',
        scheduleEnd: projectData.scheduleEnd || '',
        dailyStartTime: projectData.dailyStartTime || '09:00',
        dailyEndTime: projectData.dailyEndTime || '18:00',
        lastChecked: null,
        nextCheckTimestamp: Date.now() + intervalMinutes * 60 * 1000,
        status: 'unknown',
        latencyMs: null,
        statusMessage: 'Pending first check',
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setProjects((prev) => [localProject, ...prev]);

      if (isAuthenticated) {
        try {
          const saved = await createProjectApi(projectData);
          if (saved) {
            const finalId = saved.customId || saved.id || saved._id;
            setProjects((prev) =>
              prev.map((p) => (p.id === localProject.id ? { ...p, ...saved, id: finalId } : p))
            );
          }
        } catch {
          // Fallback to local state silently
        }
      }

      return localProject;
    },
    [isAuthenticated, setProjects]
  );

  const updateProject = useCallback(
    async (id, updatedFields) => {
      const intervalMinutes = Number(updatedFields.interval);
      const stayDurationSec = Number(
        updatedFields.stayDuration !== undefined ? updatedFields.stayDuration : 60
      );

      // Optimistic update
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const hasUrlChanged = updatedFields.url && normalizeUrl(updatedFields.url) !== p.url;
            return {
              ...p,
              ...updatedFields,
              url: updatedFields.url ? normalizeUrl(updatedFields.url) : p.url,
              interval: intervalMinutes || p.interval,
              stayDuration: stayDurationSec ?? p.stayDuration ?? 60,
              stayMode: updatedFields.stayMode || p.stayMode || 'background',
              autoOpenTab: (updatedFields.stayMode || p.stayMode) === 'tab',
              status: hasUrlChanged ? 'unknown' : p.status,
              nextCheckTimestamp: Date.now() + (intervalMinutes || p.interval) * 60 * 1000,
            };
          }
          return p;
        })
      );

      if (isAuthenticated) {
        try {
          await updateProjectApi(id, updatedFields);
        } catch {
          // Fallback to local state silently
        }
      }
    },
    [isAuthenticated, setProjects]
  );

  const deleteProject = useCallback(
    async (id) => {
      if (openTabsRef.current[id] && !openTabsRef.current[id].closed) {
        try {
          openTabsRef.current[id].close();
        } catch (e) {}
        delete openTabsRef.current[id];
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setActiveStaySessions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      if (isAuthenticated) {
        try {
          await deleteProjectApi(id);
        } catch {
          // Fallback to local state silently
        }
      }
    },
    [isAuthenticated, setProjects]
  );

  const toggleProject = useCallback(
    async (id) => {
      const project = projectsRef.current.find((p) => p.id === id);
      const isCurrentlyEnabled = project ? project.enabled : false;
      const willBeEnabled = !isCurrentlyEnabled;

      // Close open tab if any
      if (openTabsRef.current[id] && !openTabsRef.current[id].closed) {
        try {
          openTabsRef.current[id].close();
        } catch (e) {}
        delete openTabsRef.current[id];
      }

      // If pausing, remove active stay session
      if (!willBeEnabled) {
        setActiveStaySessions((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }

      // Reset cycle count to 0 upon pause or resume as requested
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const intervalMs = (p.interval || 10) * 60 * 1000;
            return {
              ...p,
              enabled: willBeEnabled,
              completedCycles: 0, // Reset to 0 upon pause/resume
              nextCheckTimestamp: willBeEnabled ? Date.now() + intervalMs : null,
            };
          }
          return p;
        })
      );

      if (project) {
        addLog({
          projectName: project.name,
          url: project.url,
          status: willBeEnabled ? 'active' : 'unknown',
          message: willBeEnabled
            ? `Monitoring resumed • Cycle count reset to #0`
            : `Monitoring paused • Cycle count reset to #0`,
        });
      }

      if (isAuthenticated) {
        try {
          await toggleProjectApi(id);
        } catch {
          // Fallback to local state silently
        }
      }
    },
    [isAuthenticated, addLog, setProjects]
  );

  const enableAll = useCallback(() => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.enabled) return p; // Already enabled, skip redundant update
        const intervalMs = (p.interval || 10) * 60 * 1000;
        if (isAuthenticated) {
          updateProjectApi(p.id, { enabled: true, completedCycles: 0, nextCheckTimestamp: Date.now() + intervalMs }).catch(() => {});
        }
        return {
          ...p,
          enabled: true,
          completedCycles: 0,
          nextCheckTimestamp: Date.now() + intervalMs,
        };
      })
    );
  }, [isAuthenticated, setProjects]);

  const disableAll = useCallback(() => {
    // Close all open tabs
    Object.keys(openTabsRef.current).forEach((id) => {
      try {
        if (openTabsRef.current[id] && !openTabsRef.current[id].closed) {
          openTabsRef.current[id].close();
        }
      } catch (e) {}
    });
    openTabsRef.current = {};
    setActiveStaySessions({});

    setProjects((prev) =>
      prev.map((p) => {
        if (!p.enabled) return p; // Already disabled, skip redundant update
        if (isAuthenticated) {
          updateProjectApi(p.id, { enabled: false, completedCycles: 0, nextCheckTimestamp: null }).catch(() => {});
        }
        return {
          ...p,
          enabled: false,
          completedCycles: 0,
          nextCheckTimestamp: null,
        };
      })
    );
  }, [isAuthenticated, setProjects]);

  const clearAllProjects = useCallback(async () => {
    Object.keys(openTabsRef.current).forEach((id) => {
      try {
        if (openTabsRef.current[id] && !openTabsRef.current[id].closed) {
          openTabsRef.current[id].close();
        }
      } catch (e) {}
    });
    openTabsRef.current = {};
    setActiveStaySessions({});
    setProjects([]);

    if (isAuthenticated) {
      try {
        await bulkImportProjectsApi([]);
      } catch (e) {}
    }
  }, [isAuthenticated, setProjects]);

  const loadDefaultProjects = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const defaults = await resetDefaultProjectsApi();
        if (Array.isArray(defaults)) {
          setProjects(defaults);
          return;
        }
      } catch {
        // Fallback to default projects silently
      }
    }
    setProjects(DEFAULT_PROJECTS);
  }, [isAuthenticated, setProjects]);

  const clearLogs = useCallback(async () => {
    setLogs([]);
    if (isAuthenticated) {
      try {
        await clearLogsApi();
      } catch (e) {}
    }
  }, [isAuthenticated, setLogs]);

  const importProjects = useCallback(
    async (importedList, mode = 'replace') => {
      if (!Array.isArray(importedList)) return false;
      const validated = importedList
        .filter((p) => p && p.name && p.url)
        .map((p) => ({
          id: p.id || 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          customId: p.id || 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: String(p.name).trim(),
          url: normalizeUrl(String(p.url)),
          interval: Number(p.interval) || 10,
          stayDuration: Number(p.stayDuration !== undefined ? p.stayDuration : 60),
          stayMode: p.stayMode || 'background',
          enabled: p.enabled ?? true,
          completedCycles: Number(p.completedCycles) || 0,
          autoOpenTab: (p.stayMode || 'background') === 'tab',
          scheduleMode: p.scheduleMode || 'always',
          scheduleStart: p.scheduleStart || '',
          scheduleEnd: p.scheduleEnd || '',
          dailyStartTime: p.dailyStartTime || '09:00',
          dailyEndTime: p.dailyEndTime || '18:00',
          lastChecked: p.lastChecked || null,
          nextCheckTimestamp: Date.now() + (Number(p.interval) || 10) * 60 * 1000,
          status: p.status || 'unknown',
          latencyMs: p.latencyMs || null,
          statusMessage: p.statusMessage || 'Imported',
          createdAt: p.createdAt || new Date().toISOString(),
        }));

      if (validated.length > 0) {
        let finalProjects = validated;
        if (mode === 'merge') {
          const map = new Map();
          projects.forEach((p) => map.set(p.url.toLowerCase(), p));
          validated.forEach((newP) => {
            const urlKey = newP.url.toLowerCase();
            if (map.has(urlKey)) {
              const prev = map.get(urlKey);
              map.set(urlKey, { ...prev, ...newP, id: prev.id, customId: prev.customId || prev.id });
            } else {
              map.set(urlKey, newP);
            }
          });
          finalProjects = Array.from(map.values());
        }

        setProjects(finalProjects);
        if (isAuthenticated) {
          try {
            await bulkImportProjectsApi(finalProjects);
          } catch (e) {}
        }
        return true;
      }
      return false;
    },
    [isAuthenticated, projects, setProjects]
  );

  return {
    projects,
    logs,
    now,
    checkingIds,
    activeStaySessions,
    popupBlocked,
    dbStatus,
    isLoadingProjects,
    setPopupBlocked,
    addProject,
    updateProject,
    deleteProject,
    toggleProject,
    restartProject,
    pingProject,
    pingAll,
    openAll,
    enableAll,
    disableAll,
    clearAllProjects,
    loadDefaultProjects,
    clearLogs,
    importProjects,
  };
}

export default useProjectMonitor;
