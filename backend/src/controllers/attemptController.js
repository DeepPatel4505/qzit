const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

const normalizeText = (value) => (value || '').trim();

const getOptionSignature = (option) => {
  if (!option) {
    return '';
  }

  return [normalizeText(option.text), normalizeText(option.imageUrl)]
    .filter(Boolean)
    .join('::');
};

const isMatchingOption = (selectedAnswer, correctAnswer, selectedAnswerId, correctAnswerId) => {
  if (!selectedAnswer || !correctAnswer) {
    return false;
  }

  if (selectedAnswerId && correctAnswerId && selectedAnswerId === correctAnswerId) {
    return true;
  }

  return getOptionSignature(selectedAnswer) === getOptionSignature(correctAnswer);
};

const parseIds = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => parseIds(entry));
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const toSet = (ids) => new Set(ids.filter(Boolean));

const evaluateAnswer = (question, answer = {}) => {
  const selectedIds = [...new Set([
    ...parseIds(answer.selectedAnswerIds),
    ...parseIds(answer.selectedAnswerId)
  ])];

  const correctIds = [...new Set([
    ...parseIds(question?.correctAnswerIds),
    ...parseIds(question?.correctAnswerId)
  ])];

  const selectedSet = toSet(selectedIds);
  const correctSet = toSet(correctIds);

  const isExactMatch =
    selectedSet.size === correctSet.size &&
    [...selectedSet].every((value) => correctSet.has(value));

  return {
    selectedIds,
    correctIds,
    isCorrect: isExactMatch
  };
};

const enrichAnswer = (question, attemptAnswer) => {
  const selectedIds = [...new Set([
    ...parseIds(attemptAnswer.selectedAnswerIds),
    ...parseIds(attemptAnswer.selectedAnswerId)
  ])];
  const correctIds = [...new Set([
    ...parseIds(question?.correctAnswerIds),
    ...parseIds(question?.correctAnswerId)
  ])];
  const selectedAnswers = (question?.answers || []).filter((option) => selectedIds.includes(option.id));
  const correctAnswers = (question?.answers || []).filter((option) => correctIds.includes(option.id));

  const isCorrect =
    selectedIds.length === correctIds.length &&
    selectedIds.every((id) => correctIds.includes(id));

  return {
    ...attemptAnswer,
    question,
    selectedAnswerIds: selectedIds,
    selectedAnswerId: selectedIds[0] || '',
    selectedAnswers,
    selectedAnswer: selectedAnswers[0] || null,
    correctAnswerIds: correctIds,
    correctAnswerId: correctIds[0] || '',
    correctAnswers,
    correctAnswer: correctAnswers[0] || null,
    isCorrect
  };
};

// Submit quiz answers and calculate results
exports.submitAnswers = async (req, res) => {
  try {
    const { quizId, answers, userId, userName, userEmail, timeTaken } = req.body;

    if (!quizId || !answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and answers are required'
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) {
        return {
          questionId: answer.questionId,
          selectedAnswerId: '',
          selectedAnswerIds: [],
          isCorrect: false
        };
      }

      const evaluated = evaluateAnswer(question, answer);
      const isCorrect = evaluated.isCorrect;

      if (isCorrect) {
        correctAnswers++;
      }

      return {
        questionId: answer.questionId,
        selectedAnswerId: evaluated.selectedIds[0] || '',
        selectedAnswerIds: evaluated.selectedIds,
        isCorrect
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= quiz.passingScore;

    const attempt = new Attempt({
      quizId,
      userId: userId || 'anonymous',
      userName: userName || 'User',
      userEmail: userEmail || '',
      status: 'completed',
      answers: processedAnswers,
      score: correctAnswers,
      percentage,
      totalQuestions,
      correctAnswers,
      timeTaken: timeTaken || 0,
      passed,
      completedAt: new Date()
    });

    await Attempt.deleteMany({
      quizId,
      userId: userId || 'anonymous',
      status: 'in_progress'
    });

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        correctAnswers,
        totalQuestions,
        percentage,
        passed,
        passingScore: quiz.passingScore,
        timeTaken
      },
      attemptId: attempt._id
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answers',
      error: error.message
    });
  }
};

// Get quiz results/attempt details
exports.getAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findById(attemptId).populate('quizId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Enrich with question details
    const enrichedAttempt = {
      ...attempt.toObject(),
      answers: attempt.answers.map((answer) => {
        const question = attempt.quizId.questions.find(
          (q) => q.id === answer.questionId
        );
        return enrichAnswer(question, answer.toObject ? answer.toObject() : answer);
      })
    };

    res.status(200).json({
      success: true,
      attempt: enrichedAttempt
    });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempt',
      error: error.message
    });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const { quizId, answers, userId, userName, userEmail, currentQuestionIndex, elapsedTime } = req.body;

    if (!quizId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and user ID are required'
      });
    }

    const quiz = await Quiz.findOne({ _id: quizId, isDeleted: false });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const normalizedAnswers = (answers || []).map((answer) => ({
      questionId: answer.questionId,
      selectedAnswerId: parseIds(answer.selectedAnswerId)[0] || parseIds(answer.selectedAnswerIds)[0] || '',
      selectedAnswerIds: [...new Set([
        ...parseIds(answer.selectedAnswerIds),
        ...parseIds(answer.selectedAnswerId)
      ])],
      isCorrect: false
    }));

    const draft = await Attempt.findOneAndUpdate(
      {
        quizId,
        userId,
        status: 'in_progress'
      },
      {
        quizId,
        userId,
        userName: userName || 'User',
        userEmail: userEmail || '',
        status: 'in_progress',
        answers: normalizedAnswers,
        score: 0,
        percentage: 0,
        totalQuestions: quiz.questions.length,
        correctAnswers: 0,
        timeTaken: elapsedTime || 0,
        passed: false,
        completedAt: null,
        startedAt: new Date(Date.now() - ((elapsedTime || 0) * 1000)),
        metadata: {
          currentQuestionIndex: Number(currentQuestionIndex || 0)
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Progress saved',
      progressId: draft._id
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save progress',
      error: error.message
    });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const progress = await Attempt.findOne({
      quizId,
      userId,
      status: 'in_progress'
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

// Get all attempts for a quiz
exports.getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;

    const attempts = await Attempt.find({ quizId })
      .select('-answers')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      attempts
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempts',
      error: error.message
    });
  }
};

// Get user attempts
exports.getUserAttempts = async (req, res) => {
  try {
    const { userId } = req.params;

    const attempts = await Attempt.find({ userId })
      .select('-answers')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      attempts
    });
  } catch (error) {
    console.error('Error fetching user attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user attempts',
      error: error.message
    });
  }
};

// Get statistics for a quiz
exports.getQuizStatistics = async (req, res) => {
  try {
    const { quizId } = req.params;

    const attempts = await Attempt.find({ quizId });

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        statistics: {
          totalAttempts: 0,
          averageScore: 0,
          averagePercentage: 0,
          passRate: 0,
          highestScore: 0,
          lowestScore: 0
        }
      });
    }

    const totalAttempts = attempts.length;
    const averageScore =
      attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts;
    const averagePercentage =
      attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const passRate = Math.round((passedAttempts / totalAttempts) * 100);
    const highestScore = Math.max(...attempts.map((a) => a.score));
    const lowestScore = Math.min(...attempts.map((a) => a.score));

    res.status(200).json({
      success: true,
      statistics: {
        totalAttempts,
        averageScore: Math.round(averageScore),
        averagePercentage: Math.round(averagePercentage),
        passRate,
        highestScore,
        lowestScore
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
