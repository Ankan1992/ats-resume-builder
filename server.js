const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { parseResume } = require('./utils/parser');
const { generatePDF } = require('./utils/pdfGenerator');
const { generateDOCX } = require('./utils/docxGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Use /tmp on serverless (Vercel), local uploads/ dir otherwise
const TEMP_DIR = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(TEMP_DIR, 'output');

// Ensure directories exist
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// Routes

// Upload and parse resume
app.post('/api/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const parsed = await parseResume(filePath, ext);

    // Clean up uploaded file
    fs.unlink(filePath, () => {});

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

// Generate resume
app.post('/api/generate', async (req, res) => {
  try {
    const { resumeData, template, format, keywords, tone } = req.body;

    if (!resumeData || !template || !format) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const results = {};

    if (format === 'pdf' || format === 'both') {
      const pdfPath = path.join(OUTPUT_DIR, `${id}.pdf`);
      await generatePDF(resumeData, template, keywords || [], pdfPath, tone);
      results.pdf = `/api/download/${id}.pdf`;
    }

    if (format === 'docx' || format === 'both') {
      const docxPath = path.join(OUTPUT_DIR, `${id}.docx`);
      await generateDOCX(resumeData, template, keywords || [], docxPath, tone);
      results.docx = `/api/download/${id}.docx`;
    }

    res.json({ success: true, files: results });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate resume' });
  }
});

// Download generated file
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  const ext = path.extname(req.params.filename);
  const contentType = ext === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="ATS_Resume${ext}"`);
  res.sendFile(filePath);
});

// Cleanup old files periodically (every hour) — only on non-serverless
if (!process.env.VERCEL) {
  setInterval(() => {
    if (!fs.existsSync(OUTPUT_DIR)) return;
    const files = fs.readdirSync(OUTPUT_DIR);
    const now = Date.now();
    files.forEach(file => {
      const fp = path.join(OUTPUT_DIR, file);
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > 3600000) {
        fs.unlink(fp, () => {});
      }
    });
  }, 3600000);
}

// Only start listening when not on Vercel (Vercel handles this)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 ATS Resume Builder running at http://localhost:${PORT}\n`);
  });
}

// Export for Vercel serverless
module.exports = app;
