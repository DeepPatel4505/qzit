const express = require('express');
const attemptController = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Attempt routes
router.post('/', protect, attemptController.submitAnswers);
router.post('/progress', protect, attemptController.saveProgress);
router.get('/progress/:quizId', protect, attemptController.getProgress);
router.get('/quiz/:quizId', attemptController.getQuizAttempts);
router.get('/user/:userId', protect, attemptController.getUserAttempts);
router.get('/stats/:quizId', attemptController.getQuizStatistics);
router.get('/:attemptId', attemptController.getAttempt);

module.exports = router;
