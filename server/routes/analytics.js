/*
 * 1.) Analytics Routes.
 * 2.) Calculated inventory summary by ABC category.
 * 3.) Identified low stock items below reorder level.
 * 4.) Computed inventory turnover ratio metrics.
 */
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Get inventory summary by category
router.get('/summary', async (req, res) => {
  try {
    const { data: inventory } = await supabase
      .from('inventory')
      .select(`
        quantity,
        allocated_quantity,
        sku:skus(unit_price, category:categories(code, name))
      `);

    const summary = {
      total_items: inventory.length,
      total_quantity: 0,
      total_allocated: 0,
      total_value: 0,
      by_category: { A: { count: 0, value: 0 }, B: { count: 0, value: 0 }, C: { count: 0, value: 0 } }
    };

    inventory.forEach(item => {
      summary.total_quantity += item.quantity || 0;
      summary.total_allocated += item.allocated_quantity || 0;
      
      const value = (item.quantity || 0) * (item.sku?.unit_price || 0);
      summary.total_value += value;
      
      const cat = item.sku?.category?.code;
      if (cat && summary.by_category[cat]) {
        summary.by_category[cat].count += 1;
        summary.by_category[cat].value += value;
      }
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const { data: inventory } = await supabase
      .from('inventory')
      .select(`
        *,
        sku:skus(sku_code, name, reorder_level, safety_stock, category:categories(code))
      `);

    const lowStock = inventory.filter(item => {
      const available = item.quantity - item.allocated_quantity;
      return available <= (item.sku?.reorder_level || 0);
    });

    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory turnover metrics
router.get('/turnover', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data: transactions } = await supabase
      .from('transactions')
      .select('sku_id, type, quantity')
      .gte('created_at', startDate.toISOString())
      .in('type', ['SHIP', 'PICK']);

    const { data: inventory } = await supabase
      .from('inventory')
      .select('sku_id, quantity');

    // Calculate turnover by SKU
    const turnover = {};
    transactions.forEach(tx => {
      if (!turnover[tx.sku_id]) {
        turnover[tx.sku_id] = { sold: 0, current: 0 };
      }
      turnover[tx.sku_id].sold += Math.abs(tx.quantity);
    });

    inventory.forEach(inv => {
      if (turnover[inv.sku_id]) {
        turnover[inv.sku_id].current = inv.quantity;
      }
    });

    // Calculate ratio
    const results = Object.entries(turnover).map(([sku_id, data]) => ({
      sku_id,
      sold: data.sold,
      current: data.current,
      turnover_ratio: data.current > 0 ? (data.sold / data.current).toFixed(2) : 0
    }));

    res.json({
      period_days: parseInt(days),
      items: results.sort((a, b) => b.turnover_ratio - a.turnover_ratio)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
