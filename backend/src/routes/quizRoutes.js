const express = require('express');
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Quiz routes
router.post('/', protect, quizController.createQuiz);
router.get('/', quizController.getAllQuizzes);
router.get('/categories/list', quizController.getQuizCategories);
router.get('/:id', quizController.getQuiz);
router.put('/:id', protect, quizController.updateQuiz);
router.delete('/:id', protect, quizController.deleteQuiz);

module.exports = router;
