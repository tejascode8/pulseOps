import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import SchedulesPage from './pages/SchedulesPage';
import ActivityStreamPage from './pages/ActivityStreamPage';
import SettingsPage from './pages/SettingsPage';
import ProjectModal from './components/ProjectModal';
import ConfirmModal from './components/ConfirmModal';
import ImportExportModal from './components/ImportExportModal';
import BackgroundWarmer from './components/BackgroundWarmer';
import AuthModal from './components/AuthModal';
import UniversalSkeleton from './components/UniversalSkeleton';
import { useProjectMonitor } from './hooks/useProjectMonitor';
import { useAuth } from './context/AuthContext';
import { getAuthToken } from './utils/api';
import { Activity } from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'schedules' | 'logs' | 'settings'

  const {
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
  } = useProjectMonitor();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [editingProject, setEditingProject] = useState(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenAdd = () => {
    if (!isAuthenticated) {
      handleOpenAuthModal('signup');
      return;
    }
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData) => {
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
  };

  const handleDeletePrompt = (project) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete "${project.name}"?`,
      message: `Are you sure you want to remove ${project.name} (${project.url}) from pulseOps? This action cannot be undone.`,
      confirmLabel: 'Delete Project',
      onConfirm: () => {
        deleteProject(project.id);
      },
    });
  };

  const handleClearAllPrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Monitored Projects?',
      message: 'This will remove all projects from your dashboard and local storage. Make sure to download a JSON backup first if needed.',
      confirmLabel: 'Clear All Projects',
      confirmVariant: 'danger',
      onConfirm: () => {
        clearAllProjects();
      },
    });
  };

  const handleClearLogsPrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Purge Activity Stream?',
      message: 'Are you sure you want to clear all telemetry audit logs? This will wipe your recorded response latencies and event history from local and database storage.',
      confirmLabel: 'Purge Logs',
      confirmVariant: 'danger',
      onConfirm: () => {
        clearLogs();
      },
    });
  };

  const handleLogoutPrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sign Out of pulseOps?',
      message: 'Are you sure you want to sign out? Your projects and schedules will remain safely stored in your account.',
      confirmLabel: 'Sign Out',
      confirmVariant: 'primary',
      onConfirm: () => {
        logout();
      },
    });
  };

  const handlePingAllPrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Ping All Monitored Targets?',
      message: `Send an immediate keepalive probe to all ${projects.length} monitored projects to wake dynos and refresh telemetry?`,
      confirmLabel: 'Ping All',
      confirmVariant: 'primary',
      onConfirm: () => {
        pingAll();
      },
    });
  };

  const handleOpenAllPrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Open All Projects in Tabs?',
      message: `Launch browser tabs for all ${projects.length} active projects? Please ensure browser popups are enabled for pulseOps.`,
      confirmLabel: 'Open All',
      confirmVariant: 'primary',
      onConfirm: () => {
        openAll();
      },
    });
  };

  const handleEnableAllPrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Enable & Resume All Projects?',
      message: `Activate automated keepalive probes and countdown timers across all ${projects.length} monitored projects?`,
      confirmLabel: 'Enable All',
      confirmVariant: 'primary',
      onConfirm: () => {
        enableAll();
      },
    });
  };

  const handleDisableAllPrompt = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Pause All Projects?',
      message: `Temporarily suspend keepalive probes across all ${projects.length} monitored projects?`,
      confirmLabel: 'Pause All',
      confirmVariant: 'warning',
      onConfirm: () => {
        disableAll();
      },
    });
  };

  // Show universal skeleton on initial page load / authentication hydration
  if (isLoading) {
    const hasCachedToken = Boolean(getAuthToken());
    return <UniversalSkeleton variant={hasCachedToken ? 'app' : 'landing'} />;
  }

  // If unauthenticated, render the Landing Page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onOpenAuthModal={handleOpenAuthModal} />

        {/* Top-Level Popup Auth Modal with Background Freeze */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setActiveTab('dashboard');
          }}
          initialMode={authInitialMode}
        />
      </>
    );
  }

  const handleBrandClick = () => {
    setActiveTab('dashboard');
  };

  return (
    <div className="app-container">
      {/* Background Atmosphere Orbs */}
      <div className="app-atmosphere">
        <div className="blob-orb blob-orb-1" />
        <div className="blob-orb blob-orb-2" />
        <div className="blob-orb blob-orb-3" />
      </div>

      {/* Header */}
      <Header
        onOpenAddModal={handleOpenAdd}
        onOpenAuthModal={() => handleOpenAuthModal('login')}
        onBrandClick={handleBrandClick}
        onLogout={handleLogoutPrompt}
      />

      {/* Modern Multi-Page Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Page Content Switching & Universal Skeleton Loading */}
      {isLoadingProjects ? (
        <UniversalSkeleton variant={activeTab} />
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <DashboardPage
              projects={projects}
              now={now}
              checkingIds={checkingIds}
              activeStaySessions={activeStaySessions}
              popupBlocked={popupBlocked}
              setPopupBlocked={setPopupBlocked}
              onOpenAddModal={handleOpenAdd}
              onPing={pingProject}
              onRestart={restartProject}
              onEdit={handleOpenEdit}
              onDelete={handleDeletePrompt}
              onToggle={(id) => {
                toggleProject(id);
              }}
              onLoadDefaults={() => {
                loadDefaultProjects();
              }}
              onEnableAll={handleEnableAllPrompt}
              onDisableAll={handleDisableAllPrompt}
              onPingAll={handlePingAllPrompt}
              onOpenAll={handleOpenAllPrompt}
              onClearAll={handleClearAllPrompt}
            />
          )}

          {activeTab === 'schedules' && (
            <SchedulesPage
              projects={projects}
              now={now}
              onEdit={handleOpenEdit}
              onToggle={(id) => {
                toggleProject(id);
              }}
              onOpenAddModal={handleOpenAdd}
              onUpdateProject={updateProject}
              onEnableAll={handleEnableAllPrompt}
              onDisableAll={handleDisableAllPrompt}
            />
          )}

          {activeTab === 'logs' && (
            <ActivityStreamPage
              logs={logs}
              projects={projects}
              onPingAll={handlePingAllPrompt}
              onPing={pingProject}
              onClearLogs={handleClearLogsPrompt}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              user={user}
              isAuthenticated={isAuthenticated}
              projects={projects}
              logs={logs}
              dbStatus={dbStatus}
              onOpenAuthModal={handleOpenAuthModal}
              onOpenImportExport={() => setIsImportExportOpen(true)}
              onClearAll={handleClearAllPrompt}
              onClearLogs={handleClearLogsPrompt}
              onLogout={handleLogoutPrompt}
            />
          )}
        </>
      )}

      {/* Continuous Headless Background Warmer Frames (Runs across all pages) */}
      <BackgroundWarmer activeStaySessions={activeStaySessions} />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setActiveTab('dashboard');
        }}
        initialMode={authInitialMode}
      />

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleModalSubmit}
        initialProject={editingProject}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        projects={projects}
        onImport={importProjects}
      />
    </div>
  );
}
