const express = require('express');
const { chatWithGemini, paraphraseWithGemini, getDailyTip } = require('../controllers/chatController.js');

const router = express.Router();
router.post('/', chatWithGemini);
router.post('/paraphrase', paraphraseWithGemini); 
router.get('/getDailyTip', getDailyTip); 


module.exports = router;
