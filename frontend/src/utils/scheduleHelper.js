/**
 * Schedule evaluation helpers for pulseOps projects
 * 
 * Supports simultaneous Date Range + Daily Hours evaluation:
 * Stage 1. Calendar Date Range: Permanent (Always) or between scheduleStart and scheduleEnd
 * Stage 2. Daily Operating Hours: 24/7 Continuous or recurring daily window (dailyStartTime - dailyEndTime)
 */

export function checkScheduleStatus(project, currentTimestamp = Date.now()) {
  const mode = project.scheduleMode || 'always';
  const now = new Date(currentTimestamp);

  // 1. Calendar Date Range Check (Stage 1)
  const hasDateRange = (mode === 'date_range' || mode === 'custom_combined' || (project.scheduleStart && project.scheduleEnd)) && mode !== 'always_date';
  const start = project.scheduleStart ? new Date(project.scheduleStart).getTime() : null;
  const end = project.scheduleEnd ? new Date(project.scheduleEnd).getTime() : null;

  if (hasDateRange && (start || end)) {
    if (start && currentTimestamp < start) {
      return {
        isInSchedule: false,
        reason: `Starts on ${new Date(start).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
        label: 'Upcoming Range',
        nextScheduledStart: start,
        expired: false,
      };
    }

    if (end && currentTimestamp > end) {
      return {
        isInSchedule: false,
        reason: `Schedule ended on ${new Date(end).toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
        label: 'Expired Range',
        nextScheduledStart: null,
        expired: true,
      };
    }
  }

  // 2. Daily Operating Hours Check (Stage 2)
  const isDailyWindow = mode === 'daily_window' || mode === 'custom_combined' || (project.dailyStartTime && project.dailyEndTime && !(project.dailyStartTime === '00:00' && project.dailyEndTime === '23:59'));
  
  if (isDailyWindow && project.dailyStartTime && project.dailyEndTime) {
    const startStr = project.dailyStartTime; // HH:MM
    const endStr = project.dailyEndTime;     // HH:MM

    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
      // Normal daytime range (e.g. 09:00 to 18:00)
      const inWindow = nowMinutes >= startMinutes && nowMinutes <= endMinutes;
      if (inWindow) {
        return {
          isInSchedule: true,
          reason: `Active until ${formatTime12h(endStr)}`,
          label: 'Active Hours',
          nextScheduledStart: null,
          expired: false,
        };
      } else {
        return {
          isInSchedule: false,
          reason: `Outside daily hours (${formatTime12h(startStr)} - ${formatTime12h(endStr)})`,
          label: 'Off Hours',
          nextScheduledStart: null,
          expired: false,
        };
      }
    } else {
      // Overnight range (e.g. 22:00 to 06:00)
      const inWindow = nowMinutes >= startMinutes || nowMinutes <= endMinutes;
      if (inWindow) {
        return {
          isInSchedule: true,
          reason: `Active until ${formatTime12h(endStr)}`,
          label: 'Active Hours',
          nextScheduledStart: null,
          expired: false,
        };
      } else {
        return {
          isInSchedule: false,
          reason: `Outside daily hours (${formatTime12h(startStr)} - ${formatTime12h(endStr)})`,
          label: 'Off Hours',
          nextScheduledStart: null,
          expired: false,
        };
      }
    }
  }

  return {
    isInSchedule: true,
    reason: hasDateRange ? 'Active Date Window (24/7 Continuous)' : 'Always Active (24/7 Continuous)',
    label: hasDateRange ? 'Active Range' : 'Continuous',
    nextScheduledStart: null,
    expired: false,
  };
}

export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m || 0).padStart(2, '0')} ${period}`;
}

export function formatScheduleSummary(project) {
  const mode = project.scheduleMode || 'always';
  const hasDateRange = (mode === 'date_range' || mode === 'custom_combined' || (project.scheduleStart && project.scheduleEnd)) && Boolean(project.scheduleEnd);
  const isDailyWindow = mode === 'daily_window' || mode === 'custom_combined' || (project.dailyStartTime && project.dailyEndTime && !(project.dailyStartTime === '00:00' && project.dailyEndTime === '23:59'));

  let datePart = 'Permanent (Always)';
  if (hasDateRange) {
    const startFormatted = project.scheduleStart
      ? new Date(project.scheduleStart).toLocaleDateString([], { month: 'short', day: 'numeric' })
      : 'Now';
    const endFormatted = project.scheduleEnd
      ? new Date(project.scheduleEnd).toLocaleDateString([], { month: 'short', day: 'numeric' })
      : 'End';
    datePart = `${startFormatted} → ${endFormatted}`;
  }

  let hoursPart = '24/7 All Day';
  if (isDailyWindow && project.dailyStartTime && project.dailyEndTime) {
    hoursPart = `${formatTime12h(project.dailyStartTime)} - ${formatTime12h(project.dailyEndTime)}`;
  }

  if (!hasDateRange && !isDailyWindow) {
    return '24/7 Always Active';
  }

  return `${datePart} • ${hoursPart}`;
}

export function getScheduleTimeline(project, currentTimestamp = Date.now()) {
  const mode = project.scheduleMode || 'always';
  const hasDateRange = (mode === 'date_range' || mode === 'custom_combined' || (project.scheduleStart && project.scheduleEnd)) && Boolean(project.scheduleEnd);
  const isDailyWindow = mode === 'daily_window' || mode === 'custom_combined' || (project.dailyStartTime && project.dailyEndTime && !(project.dailyStartTime === '00:00' && project.dailyEndTime === '23:59'));
  const now = new Date(currentTimestamp);
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const currentPercent = Math.min(100, Math.max(0, (nowMinutes / 1440) * 100));

  // Date range boundaries
  const start = project.scheduleStart ? new Date(project.scheduleStart).getTime() : null;
  const end = project.scheduleEnd ? new Date(project.scheduleEnd).getTime() : null;
  const isOutsideDateRange = hasDateRange && ((start && currentTimestamp < start) || (end && currentTimestamp > end));

  // If running in specific daily window hours
  if (isDailyWindow && project.dailyStartTime && project.dailyEndTime) {
    const startStr = project.dailyStartTime;
    const endStr = project.dailyEndTime;

    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const startMin = startH * 60 + (startM || 0);
    const endMin = endH * 60 + (endM || 0);

    const startPercent = (startMin / 1440) * 100;
    const endPercent = (endMin / 1440) * 100;

    const isOvernight = startMin > endMin;
    let inDailyWindow = false;
    let countdownText = '';

    if (!isOvernight) {
      inDailyWindow = nowMinutes >= startMin && nowMinutes <= endMin;
      if (inDailyWindow) {
        const remainingMinutes = Math.round(endMin - nowMinutes);
        const remH = Math.floor(remainingMinutes / 60);
        const remM = Math.max(0, remainingMinutes % 60);
        countdownText = `Active for next ${remH > 0 ? `${remH}h ` : ''}${remM}m (until ${formatTime12h(endStr)})`;
      } else if (nowMinutes < startMin) {
        const untilStart = Math.round(startMin - nowMinutes);
        const untH = Math.floor(untilStart / 60);
        const untM = Math.max(0, untilStart % 60);
        countdownText = `Wakes up in ${untH > 0 ? `${untH}h ` : ''}${untM}m (at ${formatTime12h(startStr)})`;
      } else {
        const untilNextDayStart = Math.round(1440 - nowMinutes + startMin);
        const untH = Math.floor(untilNextDayStart / 60);
        const untM = Math.max(0, untilNextDayStart % 60);
        countdownText = `Wakes up tomorrow in ${untH > 0 ? `${untH}h ` : ''}${untM}m (at ${formatTime12h(startStr)})`;
      }
    } else {
      inDailyWindow = nowMinutes >= startMin || nowMinutes <= endMin;
      if (inDailyWindow) {
        const remainingMinutes = nowMinutes >= startMin
          ? Math.round(1440 - nowMinutes + endMin)
          : Math.round(endMin - nowMinutes);
        const remH = Math.floor(remainingMinutes / 60);
        const remM = Math.max(0, remainingMinutes % 60);
        countdownText = `Active for next ${remH > 0 ? `${remH}h ` : ''}${remM}m (until ${formatTime12h(endStr)})`;
      } else {
        const untilStart = Math.round(startMin - nowMinutes);
        const untH = Math.floor(untilStart / 60);
        const untM = Math.max(0, untilStart % 60);
        countdownText = `Wakes up tonight in ${untH > 0 ? `${untH}h ` : ''}${untM}m (at ${formatTime12h(startStr)})`;
      }
    }

    const inWindow = inDailyWindow && !isOutsideDateRange;

    return {
      mode: hasDateRange ? 'custom_combined' : 'daily_window',
      is247: false,
      startPercent,
      endPercent,
      currentPercent,
      inWindow,
      statusBadge: inWindow ? 'Active Window' : isOutsideDateRange ? (end && currentTimestamp > end ? 'Expired Date Range' : 'Upcoming Date Range') : 'Resting (Off-Hours)',
      countdownText: isOutsideDateRange ? (end && currentTimestamp > end ? 'Expired Date Range' : 'Upcoming Date Range') : countdownText,
      isOvernight,
      startFormatted: formatTime12h(startStr),
      endFormatted: formatTime12h(endStr),
    };
  }

  // Otherwise continuous 24/7 during date window or always
  const inWindow = !isOutsideDateRange;
  return {
    mode: hasDateRange ? 'date_range' : 'always',
    is247: !hasDateRange,
    startPercent: 0,
    endPercent: 100,
    currentPercent,
    inWindow,
    statusBadge: inWindow ? (hasDateRange ? 'Active Date Window' : '24/7 Active') : (end && currentTimestamp > end ? 'Expired Range' : 'Upcoming Range'),
    countdownText: hasDateRange ? (isOutsideDateRange ? (end && currentTimestamp > end ? 'Expired Date Range' : 'Upcoming Date Range') : 'Active (Continuous 24/7 during dates)') : 'Continuous Keepalive 24/7',
    isOvernight: false,
  };
}
