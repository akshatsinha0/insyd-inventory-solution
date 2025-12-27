const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all warehouses
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true)
      .order('code');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get warehouse with bin locations
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select(`
        *,
        bin_locations(*)
      `)
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bin locations for warehouse
router.get('/:id/bins', async (req, res) => {
  try {
    const { zone, available } = req.query;
    
    let query = supabase
      .from('bin_locations')
      .select('*')
      .eq('warehouse_id', req.params.id)
      .order('aisle')
      .order('rack')
      .order('bin');
    
    if (zone) query = query.eq('zone', zone);
    if (available === 'true') query = query.eq('is_available', true);
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create warehouse
router.post('/', async (req, res) => {
  try {
    const { code, name, address, city } = req.body;
    
    const { data, error } = await supabase
      .from('warehouses')
      .insert({ code, name, address, city })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
