const { supabase } = require('../config/supabase');
const { generateSlug } = require('../utils/formatters');
const { uploadImages, deleteImage } = require('../services/uploadService');
const NodeCache = require('node-cache');

// Initialize cache with 5 minute TTL (Time To Live)
const propertyCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Helper function to clear cache when properties change
const clearPropertyCache = () => {
  propertyCache.flushAll();
  console.log('🗑️ Property cache cleared');
};

/**
 * Get all properties with filters (CACHED)
 */
const getProperties = async (req, res) => {
  try {
    const {
      category,
      type,
      location,
      min_price,
      max_price,
      bedrooms,
      featured,
      my,
      limit = 20,
      page = 1
    } = req.query;

    // Create a unique cache key from all query parameters
    const cacheKey = JSON.stringify({
      category, type, location, min_price, max_price, 
      bedrooms, featured, my, limit, page
    });
    
    // Check if user is logged in for 'my' filter - don't cache personal requests
    const isPersonalRequest = my === 'true' && req.user;
    
    // Only use cache for public requests (not personal 'my' requests)
    if (!isPersonalRequest) {
      const cachedData = propertyCache.get(cacheKey);
      if (cachedData) {
        console.log(`✅ Serving from cache: ${cacheKey.substring(0, 50)}...`);
        return res.json(cachedData);
      }
    }

    console.log(`🔄 Fetching from database: ${cacheKey.substring(0, 50)}...`);

    let query = supabase
      .from('properties')
      .select('*, profiles!properties_agent_id_fkey(*)', { count: 'exact' });

    if (my === 'true' && req.user) {
      query = query.eq('agent_id', req.user.id);
    } else {
      query = query.eq('status', 'active');
    }

    if (category) query = query.eq('category', category);
    if (type) query = query.eq('type', type);
    if (location) query = query.ilike('location', `%${location}%`);
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (bedrooms) query = query.eq('bedrooms', parseInt(bedrooms));
    if (featured === 'true') query = query.eq('is_featured', true);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const response = {
      success: true,
      properties: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    };
    
    // Store in cache only for public requests
    if (!isPersonalRequest) {
      propertyCache.set(cacheKey, response);
      console.log(`💾 Cached response for: ${cacheKey.substring(0, 50)}...`);
    }

    res.json(response);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single property by ID (CACHED)
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cache individual property by ID
    const cacheKey = `property_id_${id}`;
    const cachedData = propertyCache.get(cacheKey);
    
    if (cachedData) {
      console.log(`✅ Serving property ${id} from cache`);
      return res.json(cachedData);
    }
    
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const response = {
      success: true,
      property: property
    };
    
    // Cache the property
    propertyCache.set(cacheKey, response);
    console.log(`💾 Cached property ${id}`);

    res.json(response);
  } catch (error) {
    console.error('Get property by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single property by slug (CACHED)
 */
const getPropertyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Cache by slug
    const cacheKey = `property_slug_${slug}`;
    const cachedData = propertyCache.get(cacheKey);
    
    if (cachedData) {
      console.log(`✅ Serving property slug ${slug} from cache`);
      // Still increment view count asynchronously (don't wait for it)
      if (cachedData.property?.id) {
        supabase
          .from('properties')
          .update({ views: (cachedData.property.views || 0) + 1 })
          .eq('id', cachedData.property.id)
          .then(() => console.log(`📊 View count updated for ${slug}`))
          .catch(err => console.error('View update error:', err));
      }
      return res.json(cachedData);
    }

    const { data: property, error } = await supabase
      .from('properties')
      .select('*, profiles!properties_agent_id_fkey(*)')
      .eq('slug', slug);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    if (!property || property.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const propertyData = property[0];

    // Update view count
    await supabase
      .from('properties')
      .update({ views: (propertyData.views || 0) + 1 })
      .eq('id', propertyData.id);

    const response = {
      success: true,
      property: propertyData
    };
    
    // Cache the property
    propertyCache.set(cacheKey, response);
    console.log(`💾 Cached property slug ${slug}`);

    res.json(response);
  } catch (error) {
    console.error('Get property by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create new property (clears cache)
 */
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      price,
      price_period,
      location,
      address,
      bedrooms,
      bathrooms,
      area,
      area_unit,
      features,
      amenities
    } = req.body;

    if (!title || !description || !category || !price || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'description', 'category', 'price', 'location']
      });
    }

    let parsedPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    let slug = generateSlug(title);
    const { data: existing } = await supabase
      .from('properties')
      .select('slug')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      try {
        uploadedImages = await uploadImages(req.files, `properties/${Date.now()}`);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
      }
    }

    const featuresArray = features ? (Array.isArray(features) ? features : features.split(',').map(f => f.trim()).filter(f => f)) : [];
    const amenitiesArray = amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(a => a.trim()).filter(a => a)) : [];
    const imageUrls = uploadedImages.map(img => img.url);

    const propertyData = {
      title,
      slug,
      description,
      category,
      type: type || null,
      price: parsedPrice,
      price_period: price_period || null,
      location,
      address: address || null,
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseFloat(bathrooms) : null,
      area: area ? parseFloat(area) : null,
      area_unit: area_unit || 'sqft',
      features: featuresArray,
      amenities: amenitiesArray,
      images: imageUrls,
      agent_id: req.user.id,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) {
      for (const img of uploadedImages) {
        await deleteImage(img.public_id);
      }
      return res.status(400).json({ error: error.message });
    }

    // Clear cache since new property was added
    clearPropertyCache();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: data,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update property (clears cache)
 */
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // First, check if property exists
    const { data: existing, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(400).json({ error: fetchError.message });
    }
    
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = existing[0];

    // Check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id);

    const userRole = profile && profile.length > 0 ? profile[0].role : null;

    if (property.agent_id !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Ensure price is a number
    if (updates.price !== undefined) {
      let priceValue = updates.price;
      if (typeof priceValue === 'string') {
        priceValue = parseFloat(priceValue.replace(/,/g, ''));
      }
      updates.price = priceValue;
      
      if (isNaN(updates.price) || updates.price <= 0) {
        return res.status(400).json({ error: 'Invalid price value' });
      }
    }

    // Parse features and amenities if they're strings
    if (updates.features && typeof updates.features === 'string') {
      updates.features = updates.features.split(',').map(f => f.trim()).filter(f => f);
    }
    if (updates.amenities && typeof updates.amenities === 'string') {
      updates.amenities = updates.amenities.split(',').map(a => a.trim()).filter(a => a);
    }

    // Convert numeric fields
    if (updates.bedrooms !== undefined && updates.bedrooms !== null && updates.bedrooms !== '') {
      updates.bedrooms = parseInt(updates.bedrooms);
    }
    if (updates.bathrooms !== undefined && updates.bathrooms !== null && updates.bathrooms !== '') {
      updates.bathrooms = parseFloat(updates.bathrooms);
    }
    if (updates.area !== undefined && updates.area !== null && updates.area !== '') {
      updates.area = parseFloat(updates.area);
    }

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_at;
    delete updates.agent_id;
    delete updates.slug;

    // Perform the update
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Clear cache since property was updated
    clearPropertyCache();

    if (!data || data.length === 0) {
      // Try to fetch the updated property
      const { data: updatedProperty, error: fetchUpdatedError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id);

      if (fetchUpdatedError || !updatedProperty || updatedProperty.length === 0) {
        return res.status(404).json({ error: 'Property not found after update' });
      }
      
      return res.json({
        success: true,
        message: 'Property updated successfully',
        property: updatedProperty[0]
      });
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: data[0]
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

/**
 * Delete property (clears cache)
 */
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabase
      .from('properties')
      .select('agent_id, images')
      .eq('id', id);

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }
    
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = existing[0];

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id);

    const userRole = profile && profile.length > 0 ? profile[0].role : null;

    if (property.agent_id !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Clear cache since property was deleted
    clearPropertyCache();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty
};