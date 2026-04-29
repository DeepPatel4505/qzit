const mongoose = require('mongoose');

// Answer option schema with optional image support
const answerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: String,
  imageUrl: String // URL to answer image
});

answerSchema.pre('validate', function (next) {
  const hasAnswerContent = Boolean(
    (this.text && this.text.trim()) || (this.imageUrl && this.imageUrl.trim())
  );

  if (!hasAnswerContent) {
    this.invalidate('text', 'An answer needs either text or an image');
  }

  next();
});

// Question schema with optional image support
const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: String,
  imageUrl: String, // URL to question image
  questionType: {
    type: String,
    enum: ['single', 'multiple', 'true_false'],
    default: 'single'
  },
  answers: [answerSchema],
  correctAnswerId: {
    type: String
  },
  correctAnswerIds: {
    type: [String],
    default: []
  },
  description: String // Optional explanation for the answer
});

questionSchema.pre('validate', function (next) {
  const hasQuestionContent = Boolean(
    (this.text && this.text.trim()) || (this.imageUrl && this.imageUrl.trim())
  );

  if (!hasQuestionContent) {
    this.invalidate('text', 'A question needs either text or an image');
  }

  const normalizedCorrectIds = [
    ...(Array.isArray(this.correctAnswerIds) ? this.correctAnswerIds : []),
    this.correctAnswerId
  ].filter(Boolean);
  const uniqueCorrectIds = [...new Set(normalizedCorrectIds)];

  if (uniqueCorrectIds.length === 0) {
    this.invalidate('correctAnswerId', 'A question needs at least one correct answer');
  }

  if (this.questionType === 'single' && uniqueCorrectIds.length > 1) {
    this.invalidate('correctAnswerIds', 'Single-choice questions can have only one correct answer');
  }

  const answerIds = (this.answers || []).map((answer) => answer.id);
  if (answerIds.length < 2) {
    this.invalidate('answers', 'A question must include at least two answers');
  }

  const hasUnknownCorrectId = uniqueCorrectIds.some(
    (correctId) => !answerIds.includes(correctId)
  );

  if (hasUnknownCorrectId) {
    this.invalidate('correctAnswerIds', 'Correct answers must exist in the answers list');
  }

  // Keep both fields synchronized for backward compatibility.
  this.correctAnswerIds = uniqueCorrectIds;
  this.correctAnswerId = uniqueCorrectIds[0];

  next();
});

// Main Quiz schema
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    tags: {
      type: [String],
      default: []
    },
    creator: {
      name: {
        type: String,
        trim: true,
        default: 'Anonymous'
      },
      id: {
        type: String,
        trim: true,
        default: 'anonymous'
      }
    },
    questions: [questionSchema],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    timeLimit: {
      type: Number, // in seconds
      default: 0 // 0 means no time limit
    },
    passingScore: {
      type: Number,
      default: 70 // percentage
    },
    questionTimeLimit: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    version: {
      type: Number,
      default: 1
    },
    rootQuizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      default: null
    },
    isLatestVersion: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

quizSchema.index({ title: 'text', tags: 'text', category: 'text' });
quizSchema.index({ isDeleted: 1, isLatestVersion: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
