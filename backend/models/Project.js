import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customId: {
      type: String,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Project URL is required'],
      trim: true,
    },
    interval: {
      type: Number,
      default: 10, // in minutes
      min: [1, 'Interval must be at least 1 minute'],
    },
    stayDuration: {
      type: Number,
      default: 60, // in seconds
      min: [0, 'Stay duration cannot be negative'],
    },
    stayMode: {
      type: String,
      enum: ['background', 'tab', 'none'],
      default: 'background',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    completedCycles: {
      type: Number,
      default: 0,
    },
    scheduleMode: {
      type: String,
      enum: ['always', 'date_range', 'daily_window'],
      default: 'always',
    },
    scheduleStart: {
      type: String,
      default: '',
    },
    scheduleEnd: {
      type: String,
      default: '',
    },
    dailyStartTime: {
      type: String,
      default: '09:00',
    },
    dailyEndTime: {
      type: String,
      default: '20:00',
    },
    status: {
      type: String,
      enum: ['active', 'cors_warmed', 'down', 'unknown', 'checking'],
      default: 'unknown',
    },
    statusCode: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    latencyMs: {
      type: Number,
      default: null,
    },
    statusMessage: {
      type: String,
      default: 'Pending first check',
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    nextCheckTimestamp: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.customId || ret._id.toString();
        return ret;
      },
    },
  }
);

// Compound index for fast queries by user and customId
projectSchema.index({ userId: 1, customId: 1 });

export const Project = mongoose.model('Project', projectSchema);
