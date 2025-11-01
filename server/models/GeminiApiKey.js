import mongoose from 'mongoose';

const geminiApiKeySchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      default: 'Gemini API Key',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'error', 'rate_limited', 'unknown'],
      default: 'unknown',
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
    stats: {
      totalRequests: {
        type: Number,
        default: 0,
      },
      successfulRequests: {
        type: Number,
        default: 0,
      },
      failedRequests: {
        type: Number,
        default: 0,
      },
      rateLimitedCount: {
        type: Number,
        default: 0,
      },
      lastUsed: {
        type: Date,
        default: null,
      },
    },
    quota: {
      maxRequestsPerMinute: {
        type: Number,
        default: 15,
      },
      maxRequestsPerHour: {
        type: Number,
        default: 1000,
      },
      resetAt: {
        type: Date,
        default: null,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
geminiApiKeySchema.index({ isActive: 1 });
geminiApiKeySchema.index({ healthStatus: 1 });
geminiApiKeySchema.index({ 'stats.lastUsed': -1 });

// Method to mask key for display
geminiApiKeySchema.methods.getMaskedKey = function() {
  if (!this.key || this.key.length < 10) {
    return '****';
  }
  return this.key.substring(0, 10) + '...' + this.key.substring(this.key.length - 4);
};

// Method to check if key is rate limited
geminiApiKeySchema.methods.isRateLimited = function() {
  if (!this.quota.resetAt) return false;
  return new Date() < new Date(this.quota.resetAt);
};

const GeminiApiKey = mongoose.model('GeminiApiKey', geminiApiKeySchema);

export default GeminiApiKey;

