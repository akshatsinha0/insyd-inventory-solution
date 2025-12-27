const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const { warehouse_id, category } = req.query;
    
    let query = supabase
      .from('inventory')
      .select(`
        *,
        sku:skus(*,category:categories(*)),
        warehouse:warehouses(*),
        bin_location:bin_locations(*)
      `);
    
    if (warehouse_id) {
      query = query.eq('warehouse_id', warehouse_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Filter by category if specified
    let result = data;
    if (category) {
      result = data.filter(item => item.sku?.category?.code === category);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single inventory item
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        sku:skus(*,category:categories(*)),
        warehouse:warehouses(*),
        bin_location:bin_locations(*)
      `)
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new inventory
router.post('/', async (req, res) => {
  try {
    const { sku_id, warehouse_id, bin_location_id, quantity, batch_number } = req.body;
    
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        sku_id,
        warehouse_id,
        bin_location_id,
        quantity,
        batch_number
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Log transaction
    await supabase.from('transactions').insert({
      inventory_id: data.id,
      sku_id,
      warehouse_id,
      type: 'RECEIVE',
      quantity,
      reference_number: batch_number,
      notes: 'Initial stock entry'
    });
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory quantity
router.put('/:id', async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    
    // Get current inventory
    const { data: current } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Log adjustment transaction
    const diff = quantity - current.quantity;
    await supabase.from('transactions').insert({
      inventory_id: data.id,
      sku_id: data.sku_id,
      warehouse_id: data.warehouse_id,
      type: 'ADJUST',
      quantity: diff,
      notes: notes || 'Manual adjustment'
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Soft allocate stock (atomic transaction)
router.post('/:id/allocate', async (req, res) => {
  try {
    const { quantity, reference_number, expires_in_hours = 24 } = req.body;
    
    // Get current inventory with lock simulation
    const { data: inventory, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Check available quantity
    const available = inventory.quantity - inventory.allocated_quantity;
    if (quantity > available) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available,
        requested: quantity
      });
    }
    
    // Create allocation record
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expires_in_hours);
    
    const { data: allocation, error: allocError } = await supabase
      .from('allocations')
      .insert({
        inventory_id: req.params.id,
        quantity,
        reference_number,
        status: 'PENDING',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    if (allocError) throw allocError;
    
    // Update allocated quantity
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        allocated_quantity: inventory.allocated_quantity + quantity 
      })
      .eq('id', req.params.id);
    
    if (updateError) throw updateError;
    
    // Log transaction
    await supabase.from('transactions').insert({
      inventory_id: req.params.id,
      sku_id: inventory.sku_id,
      warehouse_id: inventory.warehouse_id,
      type: 'ALLOCATE',
      quantity,
      reference_number,
      notes: `Soft allocation until ${expiresAt.toISOString()}`
    });
    
    res.status(201).json(allocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Receive goods (GRN)
router.post('/:id/receive', async (req, res) => {
  try {
    const { quantity, reference_number, notes } = req.body;
    
    const { data: inventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        quantity: inventory.quantity + quantity 
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Log transaction
    await supabase.from('transactions').insert({
      inventory_id: data.id,
      sku_id: data.sku_id,
      warehouse_id: data.warehouse_id,
      type: 'RECEIVE',
      quantity,
      reference_number,
      notes: notes || 'Goods received'
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
