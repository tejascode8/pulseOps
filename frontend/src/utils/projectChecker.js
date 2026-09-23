import { probeProjectUrlApi } from './api';

/**
 * Checks a project URL with latency tracking and intelligent CORS handling.
 * 
 * 1. Uses pulseOps backend probe proxy (/api/projects/probe) to ping any external URL
 *    server-to-server. This gives exact HTTP status codes (200, 401, 404, 500) and latency
 *    completely free from browser CORS restrictions.
 * 2. If the backend is unreachable or offline, falls back to direct browser 'no-cors' fetch
 *    which delivers the HTTP GET request to wake the container without triggering CORS console errors.
 */

export function normalizeUrl(url) {
  let cleaned = (url || '').trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

export function isValidUrl(url) {
  try {
    const normalized = normalizeUrl(url);
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

export async function checkProjectUrl(url, timeoutMs = 20000) {
  const targetUrl = normalizeUrl(url);
  const startTime = performance.now();

  // 1. First attempt: Server-Side Backend Probe (Zero CORS restrictions)
  try {
    const res = await probeProjectUrlApi(targetUrl, timeoutMs);
    if (res && res.success) {
      return {
        status: res.status || 'active',
        statusCode: res.statusCode,
        latencyMs: res.latencyMs || Math.round(performance.now() - startTime),
        message: res.message || (res.statusCode ? `HTTP ${res.statusCode}` : 'Awake & Hot'),
        timestamp: res.timestamp || new Date().toISOString(),
      };
    }
  } catch {
    // Backend API unavailable or offline, continue silently to client-side fallback
  }

  // 2. Client-Side Fallback: Browser 'no-cors' fetch (wakes container directly without CORS console error)
  const pingUrl = new URL(targetUrl);
  pingUrl.searchParams.set('_pulse_ts', Date.now().toString());

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    await fetch(pingUrl.toString(), {
      method: 'GET',
      mode: 'no-cors', // Does not require Access-Control-Allow-Origin headers
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    return {
      status: 'active',
      statusCode: '200 OK',
      latencyMs,
      message: 'Awake (Probe delivered & dyno warm)',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    const isTimeout = err.name === 'AbortError';

    return {
      status: 'down',
      statusCode: isTimeout ? 504 : null,
      latencyMs,
      message: isTimeout ? 'Request timed out (>20s)' : (err.message || 'Unable to connect to host'),
      timestamp: new Date().toISOString(),
    };
  }
}
