import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    projectName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cors_warmed', 'down', 'unknown'],
      default: 'active',
    },
    statusCode: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    latencyMs: {
      type: Number,
      default: null,
    },
    cycle: {
      type: Number,
      default: null,
    },
    message: {
      type: String,
      default: '',
    },
    timestamp: {
      type: String,
      default: () => new Date().toLocaleTimeString(),
    },
  },
  {
    timestamps: true,
  }
);

logSchema.index({ userId: 1, createdAt: -1 });

export const Log = mongoose.model('Log', logSchema);
