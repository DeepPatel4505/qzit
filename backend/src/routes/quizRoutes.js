const express = require('express');
const quizController = require('../controllers/quizController');

const router = express.Router();

// Quiz routes
router.post('/', quizController.createQuiz);
router.get('/', quizController.getAllQuizzes);
router.get('/categories/list', quizController.getQuizCategories);
router.get('/:id', quizController.getQuiz);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;
