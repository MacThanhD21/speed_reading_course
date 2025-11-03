import mongoose from 'mongoose';

const emailCampaignSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên campaign'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'welcome',
        'follow_up',
        'educational',
        'promotional',
        're_engagement',
        'newsletter',
      ],
      required: true,
    },
    source: {
      type: String,
      enum: ['lead_magnet', 'homepage', 'exit_intent_popup', 'user_registration', 'all'],
      default: 'all',
    },
    subject: {
      type: String,
      required: [true, 'Vui lòng nhập subject'],
    },
    htmlContent: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung email'],
    },
    textContent: {
      type: String,
    },
    delayDays: {
      type: Number,
      default: 0, // Số ngày delay sau khi trigger
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sendConditions: {
      minDaysSinceSignup: { type: Number, default: 0 },
      maxDaysSinceSignup: { type: Number, default: null },
      requiresAction: { type: Boolean, default: false }, // Cần action cụ thể
      actionType: { type: String }, // 'login', 'reading_session', etc.
    },
    metrics: {
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      bounced: { type: Number, default: 0 },
      unsubscribed: { type: Number, default: 0 },
    },
    createdAtBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

emailCampaignSchema.index({ type: 1, source: 1, isActive: 1 });
emailCampaignSchema.index({ delayDays: 1 });

const EmailCampaign = mongoose.model('EmailCampaign', emailCampaignSchema);

export default EmailCampaign;

