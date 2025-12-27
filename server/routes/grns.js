/*
 * 1.) Goods Received Note Routes for 3-Way Matching.
 * 2.) Managed GRN creation against POs.
 * 3.) Updated inventory upon GRN approval.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all GRNs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('grns')
      .select(`
        *,
        po:purchase_orders(po_number, vendor_name),
        warehouse:warehouses(code, name),
        line_items:grn_line_items(
          *,
          sku:skus(sku_code, name, unit)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create GRN from PO
router.post('/', async (req, res) => {
  try {
    const {
      po_id,
      warehouse_id,
      received_by,
      notes,
      line_items
    } = req.body;
    
    // Generate GRN number
    const grn_number = `GRN-${Date.now()}`;
    
    // Create GRN
    const { data: grn, error: grnError } = await supabase
      .from('grns')
      .insert({
        grn_number,
        po_id,
        warehouse_id,
        received_by,
        notes,
        status: 'PENDING'
      })
      .select()
      .single();
    
    if (grnError) throw grnError;
    
    // Create GRN line items
    const grnLineItems = line_items.map(item => ({
      grn_id: grn.id,
      po_line_item_id: item.po_line_item_id,
      sku_id: item.sku_id,
      quantity_received: item.quantity_received,
      quantity_accepted: item.quantity_accepted || item.quantity_received,
      quantity_rejected: item.quantity_rejected || 0,
      batch_number: item.batch_number,
      rejection_reason: item.rejection_reason
    }));
    
    const { error: lineError } = await supabase
      .from('grn_line_items')
      .insert(grnLineItems);
    
    if (lineError) throw lineError;
    
    // Update PO line items received quantity
    for (const item of line_items) {
      const { data: poLine } = await supabase
        .from('po_line_items')
        .select('quantity_received')
        .eq('id', item.po_line_item_id)
        .single();
      
      await supabase
        .from('po_line_items')
        .update({
          quantity_received: (poLine?.quantity_received || 0) + item.quantity_received
        })
        .eq('id', item.po_line_item_id);
    }
    
    // Update PO status
    await supabase
      .from('purchase_orders')
      .update({ status: 'PARTIALLY_RECEIVED' })
      .eq('id', po_id);
    
    res.status(201).json(grn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve GRN and update inventory
router.post('/:id/approve', async (req, res) => {
  try {
    const { data: grn } = await supabase
      .from('grns')
      .select(`
        *,
        line_items:grn_line_items(*)
      `)
      .eq('id', req.params.id)
      .single();
    
    // Update inventory for each line item
    for (const item of grn.line_items) {
      // Find or create inventory record
      const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('sku_id', item.sku_id)
        .eq('warehouse_id', grn.warehouse_id)
        .maybeSingle();
      
      if (inventory) {
        await supabase
          .from('inventory')
          .update({
            quantity: inventory.quantity + item.quantity_accepted
          })
          .eq('id', inventory.id);
      }
      
      // Log transaction
      await supabase.from('transactions').insert({
        sku_id: item.sku_id,
        warehouse_id: grn.warehouse_id,
        type: 'RECEIVE',
        quantity: item.quantity_accepted,
        reference_number: grn.grn_number,
        notes: `GRN approved - ${item.quantity_accepted} units received`
      });
    }
    
    // Update GRN status
    const { data, error } = await supabase
      .from('grns')
      .update({ status: 'APPROVED' })
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
