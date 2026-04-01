const express = require('express');
const {
  getArticles,
  getArticleBySlug,
  getArticleById,
  getAllArticlesAdmin,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articles');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

// Admin only routes
router.get('/admin/all', verifyToken, isAdmin, getAllArticlesAdmin);
router.get('/admin/:id', verifyToken, isAdmin, getArticleById);
router.post('/', verifyToken, isAdmin, uploadSingle, createArticle);
router.put('/:id', verifyToken, isAdmin, uploadSingle, updateArticle);
router.delete('/:id', verifyToken, isAdmin, deleteArticle);

module.exports = router;