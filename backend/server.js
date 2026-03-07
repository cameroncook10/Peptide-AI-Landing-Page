require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const WAITLIST_FILE = path.join(__dirname, 'waitlist.json');

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

function loadWaitlist() {
  if (!fs.existsSync(WAITLIST_FILE)) fs.writeFileSync(WAITLIST_FILE, '[]');
  return JSON.parse(fs.readFileSync(WAITLIST_FILE, 'utf-8'));
}
function saveWaitlist(list) {
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2));
}
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

app.post('/api/waitlist', async (req, res) => {
  const { email, phone } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }

  const waitlist = loadWaitlist();
  if (waitlist.some((e) => e.email === email)) {
    return res.status(409).json({ error: 'This email is already on the waitlist.' });
  }

  const entry = {
    email,
    phone: phone || null,
    joinedAt: new Date().toISOString(),
  };
  waitlist.push(entry);
  saveWaitlist(waitlist);

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = createTransporter();
    try {
      await transporter.sendMail({
        from: '"Peptide AI" <' + process.env.SMTP_USER + '>',
        to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
        subject: 'New Waitlist Signup — Peptide AI',
        html: '<p><strong>Email:</strong> ' + email + '</p><p><strong>Phone:</strong> ' + (phone || 'not provided') + '</p><p><strong>Total:</strong> ' + waitlist.length + '</p>',
      });
    } catch (err) { console.error('Owner email failed:', err.message); }

    try {
      await transporter.sendMail({
        from: '"Peptide AI" <' + process.env.SMTP_USER + '>',
        to: email,
        subject: "You're on the Peptide AI waitlist!",
        html: '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#060810;color:#EEF2FF;border-radius:20px;"><h2 style="color:#00E5A0;margin-bottom:12px;">You\'re on the list.</h2><p style="color:#7A8499;line-height:1.7;">We\'ll notify you the moment <strong style="color:#EEF2FF;">Peptide AI</strong> drops on the App Store and Google Play.</p><p style="color:#343D50;font-size:13px;margin-top:28px;">— The Peptide AI team</p></div>',
      });
    } catch (err) { console.error('Confirm email failed:', err.message); }
  } else {
    console.log('SMTP not configured. New signup:', email, phone || '');
  }

  res.json({ success: true, message: "You're on the list! We'll notify you at launch." });
});

app.get('/api/waitlist/count', (req, res) => {
  res.json({ count: loadWaitlist().length });
});

app.listen(PORT, () => console.log('Backend running on http://localhost:' + PORT));
