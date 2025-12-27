/*
 * 1.) Invoice Routes for 3-Way Matching.
 * 2.) Managed invoice entry and validation.
 * 3.) Triggered 3-way match on invoice creation.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('invoices')
      .select(`
        *,
        po:purchase_orders(po_number, vendor_name),
        grn:grns(grn_number),
        line_items:invoice_line_items(
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

// Create invoice
router.post('/', async (req, res) => {
  try {
    const {
      invoice_number,
      po_id,
      grn_id,
      vendor_name,
      invoice_date,
      due_date,
      tax_amount,
      payment_terms,
      notes,
      line_items
    } = req.body;
    
    // Calculate total
    const total_amount = line_items.reduce((sum, item) => 
      sum + (item.quantity_invoiced * item.unit_price), 0
    ) + (tax_amount || 0);
    
    // Create invoice
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        invoice_number,
        po_id,
        grn_id,
        vendor_name,
        invoice_date,
        due_date,
        total_amount,
        tax_amount,
        payment_terms,
        notes,
        status: 'PENDING'
      })
      .select()
      .single();
    
    if (invError) throw invError;
    
    // Create line items
    const invoiceLineItems = line_items.map(item => ({
      invoice_id: invoice.id,
      sku_id: item.sku_id,
      quantity_invoiced: item.quantity_invoiced,
      unit_price: item.unit_price
    }));
    
    const { error: lineError } = await supabase
      .from('invoice_line_items')
      .insert(invoiceLineItems);
    
    if (lineError) throw lineError;
    
    // Trigger 3-way match
    await performThreeWayMatch(po_id, grn_id, invoice.id);
    
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Perform 3-way match
async function performThreeWayMatch(po_id, grn_id, invoice_id) {
  try {
    // Get PO data
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('*, line_items:po_line_items(*)')
      .eq('id', po_id)
      .single();
    
    // Get GRN data
    const { data: grn } = await supabase
      .from('grns')
      .select('*, line_items:grn_line_items(*)')
      .eq('id', grn_id)
      .single();
    
    // Get Invoice data
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, line_items:invoice_line_items(*)')
      .eq('id', invoice_id)
      .single();
    
    // Calculate totals
    const po_total = po.total_amount;
    const grn_total = grn.line_items.reduce((sum, item) => 
      sum + (item.quantity_accepted * (po.line_items.find(p => p.id === item.po_line_item_id)?.unit_price || 0)), 0
    );
    const invoice_total = invoice.total_amount;
    
    // Calculate variances
    const quantity_variance = grn.line_items.reduce((sum, item) => sum + item.quantity_accepted, 0) -
                             invoice.line_items.reduce((sum, item) => sum + item.quantity_invoiced, 0);
    const amount_variance = Math.abs(grn_total - invoice_total);
    
    // Determine match status
    let match_status = 'MATCHED';
    let discrepancy_notes = '';
    
    if (Math.abs(quantity_variance) > 0) {
      match_status = 'DISCREPANCY';
      discrepancy_notes += `Quantity variance: ${quantity_variance} units. `;
    }
    
    if (amount_variance > 0.01) {
      match_status = 'DISCREPANCY';
      discrepancy_notes += `Amount variance: ₹${amount_variance.toFixed(2)}. `;
    }
    
    // Create match record
    await supabase
      .from('three_way_matches')
      .insert({
        po_id,
        grn_id,
        invoice_id,
        match_status,
        po_total,
        grn_total,
        invoice_total,
        quantity_variance,
        amount_variance,
        discrepancy_notes: discrepancy_notes || null
      });
    
    // Update invoice status
    await supabase
      .from('invoices')
      .update({ status: match_status === 'MATCHED' ? 'MATCHED' : 'DISPUTED' })
      .eq('id', invoice_id);
    
  } catch (error) {
    console.error('3-way match error:', error);
  }
}

// Get 3-way match results
router.get('/matches', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('three_way_matches')
      .select(`
        *,
        po:purchase_orders(po_number, vendor_name, total_amount),
        grn:grns(grn_number),
        invoice:invoices(invoice_number, total_amount)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve matched invoice for payment
router.post('/:id/approve', async (req, res) => {
  try {
    const { approved_by } = req.body;
    
    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'APPROVED' })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update match record
    await supabase
      .from('three_way_matches')
      .update({
        match_status: 'APPROVED',
        approved_by,
        approved_at: new Date().toISOString()
      })
      .eq('invoice_id', req.params.id);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
