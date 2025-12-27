/*
 * 1.) Purchase Order Routes for 3-Way Matching.
 * 2.) Managed PO creation, approval, and line items.
 * 3.) Tracked PO status from draft to received.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all purchase orders
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        warehouse:warehouses(code, name),
        line_items:po_line_items(
          *,
          sku:skus(sku_code, name, unit)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single PO
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        warehouse:warehouses(code, name),
        line_items:po_line_items(
          *,
          sku:skus(sku_code, name, unit, unit_price)
        )
      `)
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new PO
router.post('/', async (req, res) => {
  try {
    const {
      vendor_name,
      warehouse_id,
      expected_delivery,
      notes,
      created_by,
      line_items
    } = req.body;
    
    // Generate PO number
    const po_number = `PO-${Date.now()}`;
    
    // Calculate total
    const total_amount = line_items.reduce((sum, item) => 
      sum + (item.quantity_ordered * item.unit_price), 0
    );
    
    // Create PO
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        po_number,
        vendor_name,
        warehouse_id,
        expected_delivery,
        notes,
        created_by,
        total_amount,
        status: 'DRAFT'
      })
      .select()
      .single();
    
    if (poError) throw poError;
    
    // Create line items
    const lineItemsWithPO = line_items.map(item => ({
      po_id: po.id,
      sku_id: item.sku_id,
      quantity_ordered: item.quantity_ordered,
      unit_price: item.unit_price
    }));
    
    const { error: lineError } = await supabase
      .from('po_line_items')
      .insert(lineItemsWithPO);
    
    if (lineError) throw lineError;
    
    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve PO
router.post('/:id/approve', async (req, res) => {
  try {
    const { approved_by } = req.body;
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({
        status: 'APPROVED',
        approved_by,
        approved_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send PO to vendor
router.post('/:id/send', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ status: 'SENT' })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
