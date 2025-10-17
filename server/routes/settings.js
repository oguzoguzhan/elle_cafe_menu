import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { branch_id } = req.query;

    let sql = 'SELECT * FROM settings';
    let params = [];

    if (branch_id) {
      sql += ' WHERE branch_id = ? OR branch_id IS NULL';
      params.push(branch_id);
    } else {
      sql += ' WHERE branch_id IS NULL';
    }

    const settings = await query(sql, params);

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const settings = req.body;
    const { branch_id } = req.query;

    for (const [key, value] of Object.entries(settings)) {
      const existing = await query(
        'SELECT id FROM settings WHERE setting_key = ? AND (branch_id = ? OR (branch_id IS NULL AND ? IS NULL))',
        [key, branch_id || null, branch_id || null]
      );

      if (existing.length > 0) {
        await query(
          'UPDATE settings SET setting_value = ? WHERE setting_key = ? AND (branch_id = ? OR (branch_id IS NULL AND ? IS NULL))',
          [value, key, branch_id || null, branch_id || null]
        );
      } else {
        await query(
          'INSERT INTO settings (setting_key, setting_value, branch_id) VALUES (?, ?, ?)',
          [key, value, branch_id || null]
        );
      }
    }

    let sql = 'SELECT * FROM settings';
    let params = [];

    if (branch_id) {
      sql += ' WHERE branch_id = ? OR branch_id IS NULL';
      params.push(branch_id);
    } else {
      sql += ' WHERE branch_id IS NULL';
    }

    const updatedSettings = await query(sql, params);

    const settingsObj = {};
    updatedSettings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
