// routes/postRoutes.js

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticate = require('../middleware/auth'); // <-- Make sure folder is 'middlewares', not 'middleware'

// Public routes (no authentication required)
router.get('/', postController.getAllPosts);            // GET /api/posts
router.get('/:postId', postController.getPostById);     // GET /api/posts/:postId

// Protected routes (authentication required)
router.post('/', authenticate, postController.createPost);         // POST /api/posts
router.put('/:postId', authenticate, postController.updatePost);   // PUT /api/posts/:postId
router.delete('/:postId', authenticate, postController.deletePost);// DELETE /api/posts/:postId

module.exports = router;
