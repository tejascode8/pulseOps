import { Project } from '../models/Project.js';

// Helper to find by customId or MongoDB _id, strictly scoped to userId
function getProjectFilter(id, userId) {
  const isMongoId = Boolean(id && id.match(/^[0-9a-fA-F]{24}$/));
  if (isMongoId) {
    return {
      userId,
      $or: [{ _id: id }, { customId: id }],
    };
  }
  return {
    userId,
    customId: id,
  };
}

// GET /api/projects - Get all projects for logged-in user
export async function getProjects(req, res) {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Error in getProjects:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/projects - Create new project for logged-in user
export async function createProject(req, res) {
  try {
    const {
      name,
      url,
      interval,
      stayDuration,
      stayMode,
      enabled,
      scheduleMode,
      scheduleStart,
      scheduleEnd,
      dailyStartTime,
      dailyEndTime,
    } = req.body;

    if (!name || !url) {
      return res.status(400).json({ success: false, error: 'Project name and URL are required' });
    }

    const customId = 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const newProject = await Project.create({
      userId: req.user._id,
      customId,
      name: name.trim(),
      url: url.trim(),
      interval: Number(interval) || 10,
      stayDuration: Number(stayDuration !== undefined ? stayDuration : 60),
      stayMode: stayMode || 'background',
      enabled: enabled ?? true,
      completedCycles: 0,
      scheduleMode: scheduleMode || 'always',
      scheduleStart: scheduleStart || '',
      scheduleEnd: scheduleEnd || '',
      dailyStartTime: dailyStartTime || '09:00',
      dailyEndTime: dailyEndTime || '20:00',
      status: 'unknown',
      statusMessage: 'Pending first check',
      nextCheckTimestamp: Date.now() + (Number(interval) || 10) * 60 * 1000,
    });

    return res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    console.error('Error in createProject:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// PUT /api/projects/:id - Update existing project for logged-in user
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const filter = getProjectFilter(id, req.user._id);

    const project = await Project.findOne(filter);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found or unauthorized' });
    }

    const updated = await Project.findOneAndUpdate(filter, { $set: req.body }, { new: true, runValidators: true });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateProject:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// DELETE /api/projects/:id - Delete project for logged-in user
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const filter = getProjectFilter(id, req.user._id);

    const deleted = await Project.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found or unauthorized' });
    }

    return res.status(200).json({ success: true, message: 'Project deleted successfully', data: deleted });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// PATCH /api/projects/:id/toggle - Toggle project enabled status and reset cycle
export async function toggleProject(req, res) {
  try {
    const { id } = req.params;
    const filter = getProjectFilter(id, req.user._id);

    const project = await Project.findOne(filter);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found or unauthorized' });
    }

    const newEnabled = !project.enabled;
    const intervalMs = (project.interval || 10) * 60 * 1000;

    project.enabled = newEnabled;
    project.completedCycles = 0; // Reset to 0 upon toggle
    project.nextCheckTimestamp = newEnabled ? Date.now() + intervalMs : null;

    await project.save();

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Error in toggleProject:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/projects/:id/restart - Reset cycle counter to 0 & activate
export async function restartProject(req, res) {
  try {
    const { id } = req.params;
    const filter = getProjectFilter(id, req.user._id);

    const project = await Project.findOne(filter);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found or unauthorized' });
    }

    project.completedCycles = 0;
    project.nextCheckTimestamp = null;
    await project.save();

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Error in restartProject:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/projects/reset-defaults - Clear user's projects
export async function resetDefaultProjects(req, res) {
  try {
    await Project.deleteMany({ userId: req.user._id });
    return res.status(200).json({ success: true, message: 'Cleared all projects', data: [] });
  } catch (error) {
    console.error('Error in resetDefaultProjects:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/projects/import - Bulk import projects for user
export async function bulkImportProjects(req, res) {
  try {
    const { projects } = req.body;
    if (!Array.isArray(projects)) {
      return res.status(400).json({ success: false, error: 'Expected an array of projects' });
    }

    const validated = projects
      .filter((p) => p && p.name && p.url)
      .map((p) => ({
        userId: req.user._id,
        customId: p.customId || p.id || 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: String(p.name).trim(),
        url: String(p.url).trim(),
        interval: Number(p.interval) || 10,
        stayDuration: Number(p.stayDuration !== undefined ? p.stayDuration : 60),
        stayMode: p.stayMode || 'background',
        enabled: p.enabled ?? true,
        completedCycles: Number(p.completedCycles) || 0,
        scheduleMode: p.scheduleMode || 'always',
        scheduleStart: p.scheduleStart || '',
        scheduleEnd: p.scheduleEnd || '',
        dailyStartTime: p.dailyStartTime || '09:00',
        dailyEndTime: p.dailyEndTime || '20:00',
        status: p.status || 'unknown',
        statusMessage: p.statusMessage || 'Imported',
      }));

    await Project.deleteMany({ userId: req.user._id });
    if (validated.length > 0) {
      await Project.insertMany(validated);
    }
    const saved = await Project.find({ userId: req.user._id }).sort({ createdAt: 1 });

    return res.status(200).json({ success: true, count: saved.length, data: saved });
  } catch (error) {
    console.error('Error in bulkImportProjects:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/projects/probe - Proxy ping any external URL without CORS issues
export async function probeProjectUrl(req, res) {
  try {
    const { url, timeoutMs = 25000 } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const pingUrl = new URL(normalizedUrl);
    pingUrl.searchParams.set('_pulse_ts', Date.now().toString());

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), Math.min(timeoutMs, 30000));

    try {
      const response = await fetch(pingUrl.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'pulseOps-Dyno-Warmer/1.0 (+https://pulseops.dev)',
          'Accept': '*/*',
        },
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const statusCode = response.status;

      // Status codes 200-499 mean the server is running and awake (even 401 Unauthorized or 404 Not Found)
      const isAwake = statusCode < 500;

      return res.status(200).json({
        success: true,
        status: isAwake ? 'active' : 'down',
        statusCode,
        latencyMs,
        message: `HTTP ${statusCode} ${response.statusText || (statusCode === 401 ? 'Awake (Unauthorized)' : 'OK')}`,
        timestamp: new Date().toISOString(),
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const isTimeout = fetchErr.name === 'AbortError';

      return res.status(200).json({
        success: true,
        status: 'down',
        statusCode: isTimeout ? 504 : null,
        latencyMs,
        message: isTimeout ? 'Ping timed out (>25s)' : (fetchErr.message || 'Connection failed'),
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error in probeProjectUrl:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
