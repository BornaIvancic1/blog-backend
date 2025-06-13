const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: {
    type: [String],
    validate: {
      validator: tags => tags.length <= 5,
      message: 'Cannot have more than 5 tags'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true
});

postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
