import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { branch_id } = req.query;

    let sql = 'SELECT * FROM categories';
    let params = [];

    if (branch_id) {
      sql += ' WHERE branch_id = ? OR branch_id IS NULL';
      params.push(branch_id);
    } else {
      sql += ' WHERE branch_id IS NULL';
    }

    sql += ' ORDER BY sort_order ASC, name ASC';

    const categories = await query(sql, params);
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const categories = await query(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(categories[0]);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, sort_order, branch_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await query(
      'INSERT INTO categories (name, sort_order, branch_id) VALUES (?, ?, ?)',
      [name, sort_order || 0, branch_id || null]
    );

    const newCategory = await query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, sort_order, branch_id } = req.body;

    await query(
      'UPDATE categories SET name = ?, sort_order = ?, branch_id = ? WHERE id = ?',
      [name, sort_order || 0, branch_id || null, req.params.id]
    );

    const updatedCategory = await query(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (updatedCategory.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updatedCategory[0]);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
