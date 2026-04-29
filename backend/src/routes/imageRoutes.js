const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const imageController = require('../controllers/imageController');

const router = express.Router();

// Image upload route
router.post('/upload', upload.single('image'), imageController.uploadImage);

// Image delete route
router.delete('/:filename', imageController.deleteImage);

module.exports = router;
