const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middlewares/auth'); 

router.get('/posts', authenticate, postController.getAllPosts);
router.get('/posts/:postId', authenticate, postController.getPostById);



router.post('/posts', authenticate, postController.createPost);
router.put('/posts/:postId', authenticate, postController.updatePost);
router.delete('/posts/:postId', authenticate, postController.deletePost);

module.exports = router;
