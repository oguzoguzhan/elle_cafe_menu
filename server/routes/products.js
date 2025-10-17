import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category_id, branch_id } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (category_id) {
      sql += ' AND category_id = ?';
      params.push(category_id);
    }

    if (branch_id) {
      sql += ' AND (branch_id = ? OR branch_id IS NULL)';
      params.push(branch_id);
    } else {
      sql += ' AND branch_id IS NULL';
    }

    sql += ' ORDER BY sort_order ASC, name ASC';

    const products = await query(sql, params);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const products = await query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category_id, name, price, image_url, warning_text, sort_order, branch_id } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ error: 'category_id, name and price are required' });
    }

    const result = await query(
      'INSERT INTO products (category_id, name, price, image_url, warning_text, sort_order, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category_id, name, price, image_url || null, warning_text || null, sort_order || 0, branch_id || null]
    );

    const newProduct = await query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { category_id, name, price, image_url, warning_text, sort_order, branch_id } = req.body;

    await query(
      'UPDATE products SET category_id = ?, name = ?, price = ?, image_url = ?, warning_text = ?, sort_order = ?, branch_id = ? WHERE id = ?',
      [category_id, name, price, image_url || null, warning_text || null, sort_order || 0, branch_id || null, req.params.id]
    );

    const updatedProduct = await query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );

    if (updatedProduct.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
