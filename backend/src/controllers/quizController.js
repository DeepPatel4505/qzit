const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

const hasContent = (value) => Boolean(value?.text?.trim() || value?.imageUrl?.trim());

const parseIds = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => parseIds(entry));
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const parseTags = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((tag) => String(tag || '').split(','))
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const normalizeQuestion = (question) => {
  const normalizedCorrectIds = [
    ...parseIds(question?.correctAnswerIds),
    ...parseIds(question?.correctAnswerId)
  ];
  const uniqueCorrectIds = [...new Set(normalizedCorrectIds)];

  return {
    ...question,
    text: question?.text || '',
    imageUrl: question?.imageUrl || '',
    description: question?.description || '',
    questionType: uniqueCorrectIds.length > 1 ? 'multiple' : (question?.questionType || 'single'),
    correctAnswerId: uniqueCorrectIds[0],
    correctAnswerIds: uniqueCorrectIds
  };
};

const isValidQuestion = (question) => {
  const answers = question?.answers || [];
  const validAnswers = answers.filter(hasContent);
  const answerIds = answers.map((answer) => answer.id);
  const normalizedCorrectIds = [
    ...parseIds(question?.correctAnswerIds),
    ...parseIds(question?.correctAnswerId)
  ];
  const hasValidCorrectIds =
    normalizedCorrectIds.length > 0 &&
    normalizedCorrectIds.every((correctId) => answerIds.includes(correctId));

  return Boolean(hasContent(question) && validAnswers.length >= 2 && hasValidCorrectIds);
};

const getCreator = (body = {}) => ({
  name: String(body.creatorName || body.creator?.name || 'Anonymous').trim() || 'Anonymous',
  id: String(body.creatorId || body.creator?.id || 'anonymous').trim() || 'anonymous'
});

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      difficulty,
      category,
      tags,
      timeLimit,
      questionTimeLimit,
      passingScore,
      status
    } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and at least one question are required'
      });
    }

    if (!questions.every(isValidQuestion)) {
      return res.status(400).json({
        success: false,
        message: 'Each question needs text or an image, at least 2 answers with text or image, and valid correct answer IDs'
      });
    }

    const normalizedQuestions = questions.map(normalizeQuestion);

    const quiz = new Quiz({
      title,
      description,
      category: category || 'General',
      tags: parseTags(tags),
      creator: getCreator(req.body),
      questions: normalizedQuestions,
      difficulty: difficulty || 'medium',
      timeLimit: timeLimit || 0,
      questionTimeLimit: questionTimeLimit || 0,
      passingScore: passingScore || 70,
      status: status || 'published'
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const {
      q,
      category,
      difficulty,
      sort = 'newest',
      includeDeleted = 'false',
      includeOldVersions = 'false'
    } = req.query;

    const filter = {};

    if (includeDeleted !== 'true') {
      filter.isDeleted = false;
    }

    if (includeOldVersions !== 'true') {
      filter.isLatestVersion = true;
    }

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $elemMatch: { $regex: q, $options: 'i' } } }
      ];
    }

    let sortConfig = { createdAt: -1 };
    if (sort === 'oldest') {
      sortConfig = { createdAt: 1 };
    }
    if (sort === 'updated') {
      sortConfig = { updatedAt: -1 };
    }

    const quizzes = await Quiz.find(filter).sort(sortConfig).lean();
    const quizIds = quizzes.map((quiz) => quiz._id);

    const attemptsAgg = await Attempt.aggregate([
      {
        $match: {
          quizId: { $in: quizIds },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$quizId',
          count: { $sum: 1 }
        }
      }
    ]);

    const attemptMap = attemptsAgg.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const quizSummaries = quizzes.map((quiz) => {
      const { questions = [], ...summary } = quiz;
      return {
        ...summary,
        questionCount: questions.length,
        attemptsCount: attemptMap[quiz._id.toString()] || 0
      };
    });

    if (sort === 'popular') {
      quizSummaries.sort((a, b) => b.attemptsCount - a.attemptsCount);
    }

    res.status(200).json({
      success: true,
      quizzes: quizSummaries
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Get a single quiz with all details
exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findOne({ _id: id, isDeleted: false });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
};

// Update a quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      questions,
      difficulty,
      category,
      tags,
      timeLimit,
      questionTimeLimit,
      passingScore,
      status
    } = req.body;

    const quiz = await Quiz.findOne({ _id: id, isDeleted: false });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (category) quiz.category = category;
    if (tags) quiz.tags = parseTags(tags);
    if (questions) {
      if (!questions.every(isValidQuestion)) {
        return res.status(400).json({
          success: false,
          message: 'Each question needs text or an image, at least 2 answers with text or image, and valid correct answer IDs'
        });
      }
      quiz.questions = questions.map(normalizeQuestion);
    }
    if (difficulty) quiz.difficulty = difficulty;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (questionTimeLimit !== undefined) quiz.questionTimeLimit = questionTimeLimit;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (status) quiz.status = status;
    quiz.creator = getCreator(req.body);

    const completedAttempts = await Attempt.countDocuments({
      quizId: quiz._id,
      status: 'completed'
    });

    const shouldCreateVersion = completedAttempts > 0;

    if (shouldCreateVersion) {
      const newQuiz = new Quiz({
        ...quiz.toObject(),
        _id: undefined,
        version: (quiz.version || 1) + 1,
        rootQuizId: quiz.rootQuizId || quiz._id,
        isLatestVersion: true,
        createdAt: undefined,
        updatedAt: undefined
      });

      await newQuiz.save();

      quiz.isLatestVersion = false;
      await quiz.save();

      return res.status(201).json({
        success: true,
        message: 'Quiz has existing attempts, so a new version was created',
        quiz: newQuiz,
        previousVersionId: quiz._id
      });
    }

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = 'false' } = req.query;

    let quiz;

    if (hardDelete === 'true') {
      const adminToken = req.header('x-admin-token');
      if (!process.env.ADMIN_DELETE_TOKEN || adminToken !== process.env.ADMIN_DELETE_TOKEN) {
        return res.status(403).json({
          success: false,
          message: 'Admin authorization required for hard delete'
        });
      }

      quiz = await Quiz.findByIdAndDelete(id);
    } else {
      quiz = await Quiz.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          isLatestVersion: false,
          status: 'archived'
        },
        { new: true }
      );
    }

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: hardDelete === 'true' ? 'Quiz hard-deleted successfully' : 'Quiz soft-deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

exports.getQuizCategories = async (req, res) => {
  try {
    const categories = await Quiz.distinct('category', {
      isDeleted: false,
      isLatestVersion: true
    });

    res.status(200).json({
      success: true,
      categories: categories.filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};
