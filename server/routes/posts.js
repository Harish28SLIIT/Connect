const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');

// Get all posts (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar');

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Create new post
router.post('/', auth, async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = new Post({
      content,
      image,
      author: req.user.userId,
    });

    await post.save();
    await post.populate('author', 'username avatar');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user.userId);
    let liked = false;
    if (likeIndex === -1) {
      post.likes.push(req.user.userId);
      liked = true;
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate('author', 'username avatar');
    await post.populate('comments.author', 'username avatar');

    // Create notification if liked and not by self
    if (liked && post.author._id.toString() !== req.user.userId) {
      const notification = await Notification.create({
        user: post.author._id,
        type: 'like',
        post: post._id,
        fromUser: req.user.userId,
      });
      console.log('Notification created (like):', notification);
      getIO().to(post.author._id.toString()).emit('notification', notification);
      console.log('Socket.io emit (like) to:', post.author._id.toString());
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating like', error: error.message });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      content,
      author: req.user.userId,
    });

    await post.save();
    await post.populate('author', 'username avatar');
    await post.populate('comments.author', 'username avatar');

    // Create notification if not by self
    if (post.author._id.toString() !== req.user.userId) {
      const notification = await Notification.create({
        user: post.author._id,
        type: 'comment',
        post: post._id,
        fromUser: req.user.userId,
      });
      console.log('Notification created (comment):', notification);
      getIO().to(post.author._id.toString()).emit('notification', notification);
      console.log('Socket.io emit (comment) to:', post.author._id.toString());
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

// Get posts by user ID
router.get('/user/:id', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar')
      .populate('comments.author', 'username avatar');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user posts', error: error.message });
  }
});

module.exports = router; 