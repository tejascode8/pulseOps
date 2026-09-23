import { useEffect, useRef } from 'react';
import { probeProjectUrlApi } from '../utils/api';

/**
 * BackgroundWarmer maintains active keepalive traffic during stay sessions:
 * 1. Dispatches periodic lightweight HTTP keepalive pulses every 10 seconds.
 * 2. Routes probes through backend proxy (/api/projects/probe) to eliminate browser CORS/CORB.
 * 3. Falls back to lightweight image ping if backend is offline.
 * 4. Uses a ref to ensure stable 10-second intervals without re-triggering on every second's countdown tick.
 */
export default function BackgroundWarmer({ activeStaySessions }) {
  const sessionsRef = useRef(activeStaySessions);
  sessionsRef.current = activeStaySessions;

  // Extract active background session URLs signature to detect genuine additions/removals
  const backgroundUrls = Object.entries(activeStaySessions || {})
    .filter(([, s]) => s && s.mode === 'background' && s.url)
    .map(([, s]) => s.url)
    .sort()
    .join('|');

  useEffect(() => {
    if (!backgroundUrls) return;

    const dispatchPulse = (url) => {
      if (!url) return;
      // 1. Try server-side probe proxy (zero CORS, zero CORB)
      probeProjectUrlApi(url, 12000).catch(() => {
        // 2. Client fallback via image probe (does not trigger CORB issues in DevTools)
        try {
          const probeUrl = new URL(url);
          probeUrl.searchParams.set('_pulse_ts', Date.now().toString());
          const img = new Image();
          img.src = probeUrl.toString();
        } catch (e) {
          // Ignore URL parse errors
        }
      });
    };

    // Trigger initial keepalive pulse on session activation
    const currentSessions = Object.entries(sessionsRef.current || {}).filter(
      ([, s]) => s && s.mode === 'background' && s.url
    );
    currentSessions.forEach(([, s]) => dispatchPulse(s.url));

    // Send keepalive pulses every 10 seconds for active background sessions
    const intervalId = setInterval(() => {
      const active = Object.entries(sessionsRef.current || {}).filter(
        ([, s]) => s && s.mode === 'background' && s.url
      );
      active.forEach(([, s]) => dispatchPulse(s.url));
    }, 10000);

    return () => clearInterval(intervalId);
  }, [backgroundUrls]);

  return null;
}
