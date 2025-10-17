import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const branches = await query(
      'SELECT * FROM branches ORDER BY name ASC'
    );
    res.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-subdomain/:subdomain', async (req, res) => {
  try {
    const branches = await query(
      'SELECT * FROM branches WHERE subdomain = ? AND is_active = TRUE',
      [req.params.subdomain]
    );

    if (branches.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json(branches[0]);
  } catch (error) {
    console.error('Get branch by subdomain error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, subdomain, is_active } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({ error: 'Name and subdomain are required' });
    }

    const result = await query(
      'INSERT INTO branches (name, subdomain, is_active) VALUES (?, ?, ?)',
      [name, subdomain, is_active !== undefined ? is_active : true]
    );

    const newBranch = await query(
      'SELECT * FROM branches WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newBranch[0]);
  } catch (error) {
    console.error('Create branch error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Subdomain already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, subdomain, is_active } = req.body;

    await query(
      'UPDATE branches SET name = ?, subdomain = ?, is_active = ? WHERE id = ?',
      [name, subdomain, is_active, req.params.id]
    );

    const updatedBranch = await query(
      'SELECT * FROM branches WHERE id = ?',
      [req.params.id]
    );

    if (updatedBranch.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json(updatedBranch[0]);
  } catch (error) {
    console.error('Update branch error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Subdomain already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM branches WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
