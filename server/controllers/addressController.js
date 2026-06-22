import Address from '../models/Address.js';

export async function listAddresses(req, res) {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ is_default: -1, created_at: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
}

export async function createAddress(req, res) {
  try {
    const { label, line1, line2, city, state, pincode, is_default } = req.body;
    if (is_default) {
      await Address.updateMany({ user: req.user.id }, { is_default: false });
    }
    const addr = await Address.create({
      user: req.user.id,
      label: label || 'Home',
      line1,
      line2: line2 || '',
      city,
      state,
      pincode,
      is_default: is_default || false,
    });
    res.status(201).json({ id: addr._id.toString(), message: 'Address created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create address' });
  }
}

export async function updateAddress(req, res) {
  try {
    const addr = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    const { label, line1, line2, city, state, pincode, is_default } = req.body;
    if (is_default) {
      await Address.updateMany({ user: req.user.id }, { is_default: false });
    }
    await Address.findByIdAndUpdate(req.params.id, { label, line1, line2: line2 || '', city, state, pincode, is_default: is_default || false });
    res.json({ message: 'Address updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address' });
  }
}

export async function deleteAddress(req, res) {
  try {
    const addr = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!addr) return res.status(404).json({ error: 'Address not found' });
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
}
