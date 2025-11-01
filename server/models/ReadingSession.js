import mongoose from 'mongoose';

const readingSessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      title: {
        type: String,
        default: 'Văn bản đã dán',
      },
      text: {
        type: String,
        required: true,
      },
      wordCount: {
        type: Number,
        required: true,
      },
      source: {
        type: String,
        enum: ['pasted', 'url', 'file'],
        default: 'pasted',
      },
    },
    readingStats: {
      wpm: {
        type: Number,
        required: true,
      },
      duration: {
        type: Number, // milliseconds
        required: true,
      },
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
    },
    quizResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizResult',
      default: null,
    },
    status: {
      type: String,
      enum: ['reading', 'completed', 'abandoned'],
      default: 'reading',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
readingSessionSchema.index({ user: 1, createdAt: -1 });
readingSessionSchema.index({ status: 1 });

const ReadingSession = mongoose.model('ReadingSession', readingSessionSchema);

export default ReadingSession;

