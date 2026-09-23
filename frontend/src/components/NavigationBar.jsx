import React from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Terminal,
  Settings,
} from 'lucide-react';

export default function NavigationBar({
  activeTab,
  onSelectTab,
}) {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Monitored Projects',
    },
    {
      id: 'logs',
      label: 'Activity Stream',
      icon: Terminal,
      description: 'Real-time Live Probe & Ping Console',
    },
    {
      id: 'schedules',
      label: 'Schedules & Rules',
      icon: CalendarClock,
      description: 'Daily Windows & Calendar Automation',
    },
    {
      id: 'settings',
      label: 'Settings & Vault',
      icon: Settings,
      description: 'MongoDB Health, Backup & Preferences',
    },
  ];

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
  };

  return (
    <nav className="nav-bar-container">
      <div className="nav-tabs-wrapper">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              title={tab.description}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
