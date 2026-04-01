const { supabase } = require('../config/supabase');

/**
 * Create a new inquiry (public)
 * POST /api/inquiries
 */
const createInquiry = async (req, res) => {
  try {
    const { property_id, name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const inquiryData = {
      property_id: property_id || null,
      name,
      email,
      phone: phone || null,
      message,
      status: 'new'
    };

    const { data, error } = await supabase
      .from('inquiries')
      .insert([inquiryData])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      inquiry: data
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get inquiries for agent's properties
 * GET /api/inquiries
 */
const getInquiries = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    // Get user's properties if they're an agent
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    let query = supabase
      .from('inquiries')
      .select('*, properties(*)', { count: 'exact' });

    // If not admin, only show inquiries for their properties
    if (profile?.role !== 'admin') {
      const { data: userProperties } = await supabase
        .from('properties')
        .select('id')
        .eq('agent_id', req.user.id);

      const propertyIds = userProperties?.map(p => p.id) || [];
      
      if (propertyIds.length === 0) {
        return res.json({
          success: true,
          inquiries: [],
          pagination: { total: 0, page: 1, limit, pages: 0 }
        });
      }

      query = query.in('property_id', propertyIds);
    }

    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      inquiries: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update inquiry status
 * PATCH /api/inquiries/:id
 */
const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry: data
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createInquiry, getInquiries, updateInquiry };