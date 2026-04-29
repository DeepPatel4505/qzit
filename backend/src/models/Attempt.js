const mongoose = require('mongoose');

// User answer schema
const userAnswerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  selectedAnswerId: {
    type: String
  },
  selectedAnswerIds: {
    type: [String],
    default: []
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

userAnswerSchema.pre('validate', function (next) {
  const normalizedSelectedIds = [
    ...(Array.isArray(this.selectedAnswerIds) ? this.selectedAnswerIds : []),
    this.selectedAnswerId
  ].filter(Boolean);
  const uniqueSelectedIds = [...new Set(normalizedSelectedIds)];

  // Keep both fields synchronized for backward compatibility.
  this.selectedAnswerIds = uniqueSelectedIds;
  this.selectedAnswerId = uniqueSelectedIds[0];

  next();
});

// Quiz attempt schema (results)
const attemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    userId: {
      type: String,
      required: true,
      default: 'anonymous'
    },
    userName: {
      type: String,
      default: 'User'
    },
    userEmail: {
      type: String,
      default: ''
    },
    metadata: {
      currentQuestionIndex: {
        type: Number,
        default: 0
      }
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'completed'
    },
    answers: [userAnswerSchema],
    score: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0
    },
    passed: {
      type: Boolean,
      required: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

attemptSchema.index({ quizId: 1, status: 1, createdAt: -1 });
attemptSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
