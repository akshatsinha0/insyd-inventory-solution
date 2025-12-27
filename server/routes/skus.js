/*
 * 1.) SKU Master Routes.
 * 2.) Handles CRUD operations for Stock Keeping Units.
 * 3.) Supports ABC category filtering and search.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all SKUs
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = supabase
      .from('skus')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_active', true)
      .order('sku_code');
    
    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('code', category)
        .single();
      if (cat) query = query.eq('category_id', cat.id);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku_code.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SKU by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('skus')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create SKU
router.post('/', async (req, res) => {
  try {
    const { sku_code, name, description, category_id, unit, unit_price, reorder_level, safety_stock } = req.body;
    
    const { data, error } = await supabase
      .from('skus')
      .insert({
        sku_code,
        name,
        description,
        category_id,
        unit,
        unit_price,
        reorder_level,
        safety_stock
      })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update SKU
router.put('/:id', async (req, res) => {
  try {
    const { name, description, unit_price, reorder_level, safety_stock } = req.body;
    
    const { data, error } = await supabase
      .from('skus')
      .update({ name, description, unit_price, reorder_level, safety_stock })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('code');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
