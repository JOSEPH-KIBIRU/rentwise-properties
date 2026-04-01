const { supabase } = require('../config/supabase');
const { generateSlug } = require('../utils/formatters');
const { uploadImages, deleteImage } = require('../services/uploadService'); // Add this line

/**
 * Get all published articles (public)
 * GET /api/articles
 */
const getArticles = async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;

    let query = supabase
      .from('articles')
      .select('*, profiles!articles_author_id_fkey(full_name)', { count: 'exact' })
      .eq('is_published', true);

    if (category) query = query.eq('category', category);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('published_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      articles: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single article by slug (public)
 * GET /api/articles/:slug
 */
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: article, error } = await supabase
      .from('articles')
      .select('*, profiles!articles_author_id_fkey(full_name)')
      .eq('slug', slug)
      .single();

    if (error || !article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Only show published articles to public
    if (!article.is_published && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view count
    await supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', article.id);

    res.json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get article by ID (Admin only)
 * GET /api/articles/admin/:id
 */
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: article, error } = await supabase
      .from('articles')
      .select('*, profiles!articles_author_id_fkey(full_name)')
      .eq('id', id)
      .single();

    if (error || !article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Get article by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all articles for admin (including unpublished)
 * GET /api/articles/admin/all
 */
const getAllArticlesAdmin = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    let query = supabase
      .from('articles')
      .select('*, profiles!articles_author_id_fkey(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      articles: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create new article (Admin only)
 * POST /api/articles
 */
const createArticle = async (req, res) => {
  try {
   

    const { title, excerpt, content, category, is_published } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'content', 'category']
      });
    }

    let slug = generateSlug(title);
    
    // Check if slug exists
    const { data: existing } = await supabase
      .from('articles')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

    // Handle cover image upload if present
    let coverImageUrl = null;
    if (req.file) {
      try {
        const uploadedImages = await uploadImages([req.file], 'articles');
        coverImageUrl = uploadedImages[0].url;
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError.message);
        // Continue without image
      }
    }

    const articleData = {
      title,
      slug,
      excerpt: excerpt || content.substring(0, 200),
      content,
      category,
      cover_image: coverImageUrl,
      author_id: req.user.id,
      is_published: is_published === 'true' || is_published === true,
      published_at: is_published === 'true' || is_published === true ? new Date() : null
    };


    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return res.status(400).json({ error: error.message });
    }


    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      article: data
    });
  } catch (error) {
    console.error('❌ Create article error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

/**
 * Update article (Admin only)
 * PUT /api/articles/:id
 */
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
  
    // Handle new cover image
    if (req.file) {
      try {
        const uploadedImages = await uploadImages([req.file], 'articles');
        updates.cover_image = uploadedImages[0].url;
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError.message);
      }
    }

    // Handle removal of existing cover image
    if (updates.remove_cover === 'true') {
      updates.cover_image = null;
      delete updates.remove_cover;
    }

    // Update published_at if publishing
    if (updates.is_published === true || updates.is_published === 'true') {
      if (!updates.published_at) {
        updates.published_at = new Date();
      }
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      return res.status(400).json({ error: error.message });
    }


    res.json({
      success: true,
      message: 'Article updated successfully',
      article: data
    });
  } catch (error) {
    console.error('❌ Update article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete article (Admin only)
 * DELETE /api/articles/:id
 */
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  getArticleById,
  getAllArticlesAdmin,
  createArticle,
  updateArticle,
  deleteArticle
};