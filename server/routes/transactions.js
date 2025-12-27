const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all transactions (audit log)
router.get('/', async (req, res) => {
  try {
    const { sku_id, warehouse_id, type, limit = 100 } = req.query;
    
    let query = supabase
      .from('transactions')
      .select(`
        *,
        sku:skus(sku_code, name),
        warehouse:warehouses(code, name)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (sku_id) query = query.eq('sku_id', sku_id);
    if (warehouse_id) query = query.eq('warehouse_id', warehouse_id);
    if (type) query = query.eq('type', type);
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        sku:skus(*),
        warehouse:warehouses(*)
      `)
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create manual transaction
router.post('/', async (req, res) => {
  try {
    const { inventory_id, sku_id, warehouse_id, type, quantity, reference_number, notes, performed_by } = req.body;
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        inventory_id,
        sku_id,
        warehouse_id,
        type,
        quantity,
        reference_number,
        notes,
        performed_by
      })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
