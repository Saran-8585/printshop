import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/design', authenticate, (req, res) => {
  upload.single('design')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      file_path: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
  });
});

export default router;
