const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  generateBlogIdeas,
  writeBlogPost,
  generateOutline,
  autoComplete,
  optimizeSEO
} = require('../services/aiService');

const router = express.Router();

// All AI routes require admin authentication
router.use(verifyToken, isAdmin);

// Generate blog ideas
router.post('/generate-ideas', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const result = await generateBlogIdeas(topic);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error || 'Failed to generate ideas' });
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Write complete blog post
router.post('/write-post', async (req, res) => {
  try {
    const { title, category, keywords } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    const result = await writeBlogPost(title, category, keywords || []);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate article outline
router.post('/generate-outline', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await generateOutline(title);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-complete text
router.post('/auto-complete', async (req, res) => {
  try {
    const { text, context } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const result = await autoComplete(text, context);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// SEO optimize content
router.post('/optimize-seo', async (req, res) => {
  try {
    const { content, keywords } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const result = await optimizeSEO(content, keywords || []);
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;