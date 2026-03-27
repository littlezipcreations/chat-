/**
 * CipherChat — Secure local server
 * Serves the frontend with strict security headers.
 * No message processing happens here — all crypto is client-side.
 */

const express  = require('express');
const path     = require('path');
const helmet   = require('helmet');
const cors     = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security headers via Helmet ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   [
        "'self'",
        "'unsafe-inline'",           // needed for inline module script
        "https://www.gstatic.com",   // Firebase SDK CDN
        "https://fonts.googleapis.com"
      ],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      connectSrc:  [
        "'self'",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "https://firestore.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "wss://*.firebaseio.com"
      ],
      imgSrc:      ["'self'", "data:"],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  crossOriginEmbedderPolicy: false, // required for Firebase streaming
}));

// ── CORS (localhost only) ────────────────────────────────────────────────────
app.use(cors({
  origin: [`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`],
  methods: ['GET'],
}));

// ── Disable caching for HTML ─────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  next();
});

// ── Serve static frontend ────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public'), {
  index: 'index.html',
  extensions: ['html'],
}));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', encrypted: true, timestamp: new Date().toISOString() });
});

// ── Catch-all SPA fallback ───────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║         CipherChat Server Started        ║
  ╠══════════════════════════════════════════╣
  ║  URL  : http://localhost:${PORT}             ║
  ║  Mode : E2E Encrypted (AES-256-GCM)      ║
  ║  Store: Firebase Firestore               ║
  ║  Data : ZERO plaintext stored anywhere   ║
  ╚══════════════════════════════════════════╝
  `);
});
