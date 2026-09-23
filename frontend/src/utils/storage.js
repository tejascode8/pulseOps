export const STORAGE_KEYS = {
  PROJECTS: 'pulseops_projects_v3',
  LOGS: 'pulseops_logs_v3',
};

export const DEFAULT_PROJECTS = [];

export function exportProjectsJson(projects) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `pulseops-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
