import { Log } from '../models/Log.js';

// GET /api/logs - Fetch recent activity stream events for logged-in user
export async function getLogs(req, res) {
  try {
    const limit = Number(req.query.limit) || 50;
    const logs = await Log.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(limit);
    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    console.error('Error in getLogs:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/logs - Add new activity stream event for logged-in user
export async function createLog(req, res) {
  try {
    const { projectId, projectName, url, status, statusCode, latencyMs, cycle, message } = req.body;

    if (!projectName || !url) {
      return res.status(400).json({ success: false, error: 'Project name and URL are required' });
    }

    const newLog = await Log.create({
      userId: req.user._id,
      projectId: projectId || null,
      projectName,
      url,
      status: status || 'active',
      statusCode: statusCode || null,
      latencyMs: latencyMs !== undefined ? latencyMs : null,
      cycle: cycle !== undefined ? cycle : null,
      message: message || '',
      timestamp: new Date().toLocaleTimeString(),
    });

    // Enforce strict rolling cap: Keep max 50 logs per user in MongoDB
    const MAX_USER_LOGS = 50;
    Log.countDocuments({ userId: req.user._id }).then(async (total) => {
      if (total > MAX_USER_LOGS) {
        const excess = total - MAX_USER_LOGS;
        const oldestLogs = await Log.find({ userId: req.user._id })
          .sort({ createdAt: 1 })
          .limit(excess)
          .select('_id');
        if (oldestLogs.length > 0) {
          await Log.deleteMany({ _id: { $in: oldestLogs.map((l) => l._id) } });
        }
      }
    }).catch(() => {});

    return res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    console.error('Error in createLog:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// DELETE /api/logs - Clear all activity logs for logged-in user
export async function clearLogs(req, res) {
  try {
    await Log.deleteMany({ userId: req.user._id });
    return res.status(200).json({ success: true, message: 'All activity stream logs cleared' });
  } catch (error) {
    console.error('Error in clearLogs:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
