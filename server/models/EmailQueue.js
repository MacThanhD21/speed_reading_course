import mongoose from 'mongoose';

const emailQueueSchema = mongoose.Schema(
  {
    recipient: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailCampaign',
      required: true,
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true, // Index for efficient querying
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    sendAttempts: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    tracking: {
      sentAt: { type: Date },
      deliveredAt: { type: Date },
      openedAt: { type: Date },
      clickedAt: { type: Date },
      bounced: { type: Boolean, default: false },
      unsubscribed: { type: Boolean, default: false },
    },
    metadata: {
      source: String,
      message: String, // Original message from contact form
      improvement: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
emailQueueSchema.index({ status: 1, scheduledFor: 1 });
emailQueueSchema.index({ 'recipient.email': 1 });
emailQueueSchema.index({ contact: 1 });
emailQueueSchema.index({ user: 1 });

const EmailQueue = mongoose.model('EmailQueue', emailQueueSchema);

export default EmailQueue;

