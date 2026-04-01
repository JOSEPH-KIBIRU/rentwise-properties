const { supabase } = require('../config/supabase');
const { generateSlug } = require('../utils/formatters');
const { uploadImages, deleteImage } = require('../services/uploadService');

/**
 * Get all properties with filters
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

    res.json({
      success: true,
      properties: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single property by ID
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();  // Use .single() to get a single object

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      success: true,
      property: property
    });
  } catch (error) {
    console.error('Get property by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get single property by slug
 */
const getPropertyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

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

    await supabase
      .from('properties')
      .update({ views: (propertyData.views || 0) + 1 })
      .eq('id', propertyData.id);

    res.json({
      success: true,
      property: propertyData
    });
  } catch (error) {
    console.error('Get property by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create new property
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
 * Update property
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
 * Delete property
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