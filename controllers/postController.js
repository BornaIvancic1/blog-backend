// controllers/postController.js
const { json } = require('express');
const Post = require('../models/Post');

// Create Post
exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const author = req.user.id; // From JWT middleware

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const post = new Post({ title, content, author });
    await post.save();
    
    // Populate author details
    const newPost = await Post.findById(post._id)
      .populate('author', 'userName firstName lastName');
      
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ 
      message: 'Error creating post',
      error: err.message 
    });
  }
};

// Update Post
exports.updatePost = async (req, res) => {
  const { title, content } = req.body;
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findOneAndUpdate(
      { _id: postId, author: userId },
      { title, content },
      { new: true, runValidators: true }
    ).populate('author', 'userName firstName lastName');

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found or unauthorized' 
      });
    }

    res.json(post);
  } catch (err) {
    res.status(400).json({ 
      message: 'Error updating post',
      error: err.message 
    });
  }
};

// Delete Post
exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findOneAndDelete({ 
      _id: postId, 
      author: userId 
    });

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found or unauthorized' 
      });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error deleting post',
      error: err.message 
    });
  }
};


// Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'userName firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching posts',
      error: err.message
    });
  }
};

// Get Single Post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'userName firstName lastName');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching post',
      error: err.message
    });
  }
};
