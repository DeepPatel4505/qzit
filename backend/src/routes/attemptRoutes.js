const express = require('express');
const attemptController = require('../controllers/attemptController');

const router = express.Router();

// Attempt routes
router.post('/', attemptController.submitAnswers);
router.post('/progress', attemptController.saveProgress);
router.get('/progress/:quizId', attemptController.getProgress);
router.get('/quiz/:quizId', attemptController.getQuizAttempts);
router.get('/user/:userId', attemptController.getUserAttempts);
router.get('/stats/:quizId', attemptController.getQuizStatistics);
router.get('/:attemptId', attemptController.getAttempt);

module.exports = router;
