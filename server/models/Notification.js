import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['new_contact', 'new_testimonial', 'new_user', 'new_quiz_result'],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

