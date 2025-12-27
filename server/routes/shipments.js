/*
 * 1.) Shipments Routes for 3PL Integration.
 * 2.) Managed in-transit inventory tracking.
 * 3.) Implemented webhook endpoints for logistics providers.
 * 4.) Tracked shipment status from dispatch to delivery.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('shipments')
      .select(`
        *,
        sku:skus(sku_code, name),
        warehouse:warehouses(code, name)
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

// Create new shipment (ASN - Advanced Shipping Notice)
router.post('/', async (req, res) => {
  try {
    const { 
      sku_id, 
      warehouse_id, 
      quantity, 
      vendor_name,
      tracking_number,
      expected_arrival 
    } = req.body;
    
    const { data, error } = await supabase
      .from('shipments')
      .insert({
        sku_id,
        warehouse_id,
        quantity,
        vendor_name,
        tracking_number,
        expected_arrival,
        status: 'DISPATCHED'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Log transaction
    await supabase.from('transactions').insert({
      sku_id,
      warehouse_id,
      type: 'RECEIVE',
      quantity: 0,
      reference_number: tracking_number,
      notes: `ASN created - ${quantity} units in transit from ${vendor_name}`
    });
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for 3PL status updates
router.post('/webhook', async (req, res) => {
  try {
    const { tracking_number, status, location, timestamp } = req.body;
    
    // Find shipment by tracking number
    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_number', tracking_number)
      .single();
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    // Update shipment status
    const { data, error } = await supabase
      .from('shipments')
      .update({ 
        status,
        current_location: location,
        updated_at: timestamp || new Date().toISOString()
      })
      .eq('tracking_number', tracking_number)
      .select()
      .single();
    
    if (error) throw error;
    
    // If delivered, update inventory
    if (status === 'DELIVERED') {
      // Get existing inventory or create new
      const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('sku_id', shipment.sku_id)
        .eq('warehouse_id', shipment.warehouse_id)
        .single();
      
      if (inventory) {
        await supabase
          .from('inventory')
          .update({ quantity: inventory.quantity + shipment.quantity })
          .eq('id', inventory.id);
      }
      
      // Log receive transaction
      await supabase.from('transactions').insert({
        sku_id: shipment.sku_id,
        warehouse_id: shipment.warehouse_id,
        type: 'RECEIVE',
        quantity: shipment.quantity,
        reference_number: tracking_number,
        notes: `Goods received from ${shipment.vendor_name}`
      });
    }
    
    res.json({ success: true, shipment: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update shipment status manually
router.put('/:id/status', async (req, res) => {
  try {
    const { status, location } = req.body;
    
    const { data, error } = await supabase
      .from('shipments')
      .update({ 
        status,
        current_location: location
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

// Get in-transit summary
router.get('/in-transit', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        sku:skus(sku_code, name, unit_price),
        warehouse:warehouses(code, name)
      `)
      .in('status', ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY']);
    
    if (error) throw error;
    
    const summary = {
      total_shipments: data.length,
      total_units: data.reduce((sum, s) => sum + s.quantity, 0),
      total_value: data.reduce((sum, s) => sum + (s.quantity * (s.sku?.unit_price || 0)), 0),
      shipments: data
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
