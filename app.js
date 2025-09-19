const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

// Fake "AI" results
const sampleResults = {
  'sahiwal': { height: 142, length: 155, score: 87 },
  'murrah': { height: 135, length: 148, score: 92 },
  'gir': { height: 138, length: 150, score: 85 },
  'default': { height: 138, length: 150, score: 85 }
};

// API to simulate analysis
app.post('/api/analyze', upload.single('image'), (req, res) => {
  setTimeout(() => {
    const breed = (req.body.breed || 'default').toLowerCase();
    const resultObj = { ...sampleResults[breed] || sampleResults['default'] };

    // Add random variation
    const variation = () => (Math.random() * 10 - 5);
    resultObj.height = Math.round(resultObj.height + variation());
    resultObj.length = Math.round(resultObj.length + variation());

    if (!req.file) {
      return res.json({ success: false, message: 'No image uploaded.' });
    }

    res.json({
      success: true,
      breed: breed,
      measurements: resultObj,
      imageUrl: `/uploads/${req.file.filename}`
    });
  }, 1200);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BovineAI Prototype running on port ${PORT}`);
});
