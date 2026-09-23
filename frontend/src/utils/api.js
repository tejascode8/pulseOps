const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const TOKEN_KEY = 'pulseops_auth_token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data?.error || `HTTP error ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Health Check
export async function checkBackendHealth() {
  return request('/health');
}

// Auth API Endpoints
export async function registerApi(name, email, password) {
  const res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (res?.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function loginApi(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res?.token) {
    setAuthToken(res.token);
  }
  return res;
}

export async function getMeApi() {
  const res = await request('/auth/me');
  return res?.data;
}

// Projects API Endpoints (Protected by User)
export async function probeProjectUrlApi(targetUrl, timeoutMs = 25000) {
  return request('/projects/probe', {
    method: 'POST',
    body: JSON.stringify({ url: targetUrl, timeoutMs }),
  });
}

export async function fetchProjects() {
  const res = await request('/projects');
  return res?.data || [];
}

export async function createProjectApi(projectData) {
  const res = await request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
  return res?.data;
}

export async function updateProjectApi(id, projectData) {
  const res = await request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
  return res?.data;
}

export async function deleteProjectApi(id) {
  const res = await request(`/projects/${id}`, {
    method: 'DELETE',
  });
  return res?.data;
}

export async function toggleProjectApi(id) {
  const res = await request(`/projects/${id}/toggle`, {
    method: 'PATCH',
  });
  return res?.data;
}

export async function restartProjectApi(id) {
  const res = await request(`/projects/${id}/restart`, {
    method: 'POST',
  });
  return res?.data;
}

export async function resetDefaultProjectsApi() {
  const res = await request('/projects/reset-defaults', {
    method: 'POST',
  });
  return res?.data || [];
}

export async function bulkImportProjectsApi(projects) {
  const res = await request('/projects/import', {
    method: 'POST',
    body: JSON.stringify({ projects }),
  });
  return res?.data || [];
}

// Logs API Endpoints (Protected by User)
export async function fetchLogs(limit = 50) {
  const res = await request(`/logs?limit=${limit}`);
  return res?.data || [];
}

export async function createLogApi(logData) {
  const res = await request('/logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
  return res?.data;
}

export async function clearLogsApi() {
  return request('/logs', {
    method: 'DELETE',
  });
}
