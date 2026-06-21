import db from '../db/database.js';

export function listAddresses(req, res) {
  try {
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(req.user.id);
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
}

export function createAddress(req, res) {
  try {
    const { label, line1, line2, city, state, pincode, is_default } = req.body;
    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }
    const result = db.prepare(
      'INSERT INTO addresses (user_id, label, line1, line2, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, label || 'Home', line1, line2 || '', city, state, pincode, is_default ? 1 : 0);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Address created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create address' });
  }
}

export function updateAddress(req, res) {
  try {
    const addr = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });

    const { label, line1, line2, city, state, pincode, is_default } = req.body;
    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }
    db.prepare(
      'UPDATE addresses SET label=?, line1=?, line2=?, city=?, state=?, pincode=?, is_default=? WHERE id=?'
    ).run(label, line1, line2 || '', city, state, pincode, is_default ? 1 : 0, req.params.id);
    res.json({ message: 'Address updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address' });
  }
}

export function deleteAddress(req, res) {
  try {
    const addr = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    db.prepare('DELETE FROM addresses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
}
