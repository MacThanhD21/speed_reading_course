import mongoose from 'mongoose';

const quizResultSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readingSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReadingSession',
      required: true,
    },
    quizType: {
      type: String,
      enum: ['mcq', '5w1h', 'mixed'],
      default: 'mixed',
    },
    results: {
      correctCount: {
        type: Number,
        required: true,
      },
      totalQuestions: {
        type: Number,
        required: true,
      },
      comprehensionPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    metrics: {
      wpm: {
        type: Number,
        required: true,
      },
      rei: {
        type: Number, // Reading Efficiency Index = WPM * (comprehension / 100)
        required: true,
      },
      rci: {
        type: Number, // Reading Consistency Index
        default: null,
      },
    },
    answers: [
      {
        questionId: String,
        questionType: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        explanation: String,
      },
    ],
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
quizResultSchema.index({ user: 1, createdAt: -1 });
quizResultSchema.index({ readingSession: 1 });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export default QuizResult;

