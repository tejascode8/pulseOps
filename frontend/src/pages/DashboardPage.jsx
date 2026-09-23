import React from 'react';
import InfoBanner from '../components/InfoBanner';
import ProjectList from '../components/ProjectList';

export default function DashboardPage({
  projects = [],
  now = Date.now(),
  checkingIds,
  activeStaySessions = {},
  popupBlocked,
  setPopupBlocked,
  onOpenAddModal,
  onPing,
  onPingAll,
  onOpenAll,
  onRestart,
  onEdit,
  onDelete,
  onToggle,
  onLoadDefaults,
  onEnableAll,
  onDisableAll,
  onClearAll,
}) {
  return (
    <div className="page-container page-fade-in">
      {/* Info & Notification Alert Banner */}
      {popupBlocked && (
        <InfoBanner
          popupBlocked={popupBlocked}
          onDismissPopupWarning={() => setPopupBlocked(false)}
        />
      )}

      {/* Project Cards List & Fleet Management */}
      <ProjectList
        projects={projects}
        now={now}
        checkingIds={checkingIds}
        activeStaySessions={activeStaySessions}
        onPing={onPing}
        onPingAll={onPingAll}
        onOpenAll={onOpenAll}
        onRestart={onRestart}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onOpenAddModal={onOpenAddModal}
        onLoadDefaults={onLoadDefaults}
        onEnableAll={onEnableAll}
        onDisableAll={onDisableAll}
        onClearAll={onClearAll}
      />
    </div>
  );
}
