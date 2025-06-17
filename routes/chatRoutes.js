const express = require('express');
const { chatWithGemini, paraphraseWithGemini } = require('../controllers/chatController.js');

const router = express.Router();
router.post('/', chatWithGemini);
router.post('/paraphrase', paraphraseWithGemini); // Uncomment if needed

module.exports = router;
