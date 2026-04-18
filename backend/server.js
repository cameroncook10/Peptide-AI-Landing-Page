require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SOURCE = 'waitlist-site';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ── Email ─────────────────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendEmails(email, phone, totalCount) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured. New signup:', email, phone || '');
    return;
  }
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: `"Peptide AI" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: 'New Waitlist Signup — Peptide AI',
      html: `<p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || 'not provided'}</p><p><strong>Total signups:</strong> ${totalCount}</p>`,
    });
  } catch (err) { console.error('Owner email failed:', err.message); }

  try {
    await transporter.sendMail({
      from: `"Peptide AI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "You're on the Peptide AI waitlist!",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#060810;color:#EEF2FF;border-radius:20px;">
          <h2 style="color:#00E5A0;margin-bottom:12px;">You're on the list.</h2>
          <p style="color:#7A8499;line-height:1.7;">We'll notify you the moment <strong style="color:#EEF2FF;">Peptide AI</strong> drops on the App Store and Google Play.</p>
          <p style="color:#343D50;font-size:13px;margin-top:28px;">— The Peptide AI team</p>
        </div>`,
    });
  } catch (err) { console.error('Confirm email failed:', err.message); }
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/waitlist — join the waitlist
app.post('/api/waitlist', async (req, res) => {
  const { email, phone } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }

  const { data, error } = await supabase
    .from('waitlist')
    .insert({ email, phone: phone || null, source: SOURCE })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This email is already on the waitlist.' });
    }
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  await sendEmails(email, phone, count);

  res.json({ success: true, message: "You're on the list! We'll notify you at launch." });
});

// GET /api/waitlist/count — public signup count
app.get('/api/waitlist/count', async (req, res) => {
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Supabase count error:', error);
    return res.status(500).json({ error: 'Could not fetch count.' });
  }

  res.json({ count });
});

// GET /api/waitlist — admin: list all signups (requires API key)
app.get('/api/waitlist', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { data, error } = await supabase
    .from('waitlist')
    .select('id, email, phone, created_at, source')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    return res.status(500).json({ error: 'Could not fetch waitlist.' });
  }

  res.json({ count: data.length, entries: data });
});

// POST /api/affiliate — submit affiliate application
app.post('/api/affiliate', async (req, res) => {
  const {
    firstName, lastName, email, phone,
    platforms, audienceSize, contentNiche,
    promoPlan, existingPartnerships, notes,
  } = req.body;

  if (!firstName?.trim() || !lastName?.trim()) {
    return res.status(400).json({ error: 'First and last name are required.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'Select at least one platform.' });
  }

  const { error } = await supabase.from('affiliates').insert({
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone || null,
    platforms,
    audience_size: audienceSize || null,
    content_niche: contentNiche || null,
    promo_plan: promoPlan || null,
    existing_partnerships: existingPartnerships || null,
    notes: notes || null,
  });

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'This email already has an application on file.' });
    }
    console.error('Affiliate insert error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Peptide AI" <${process.env.SMTP_USER}>`,
        to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
        subject: 'New Affiliate Application — Peptide AI',
        html: `
          <h2>New Affiliate Application</h2>
          <table style="border-collapse:collapse;">
            <tr><td style="padding:4px 12px;font-weight:bold;">Name</td><td>${firstName} ${lastName}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Email</td><td>${email}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Phone</td><td>${phone || '—'}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Platforms</td><td>${platforms.join(', ')}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Audience</td><td>${audienceSize || '—'}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Niche</td><td>${contentNiche || '—'}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Promo Plan</td><td>${promoPlan || '—'}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Partnerships</td><td>${existingPartnerships || '—'}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Notes</td><td>${notes || '—'}</td></tr>
          </table>`,
      });
    } catch (err) { console.error('Affiliate notification email failed:', err.message); }
  }

  res.json({ success: true, message: "Application received! We'll be in touch within 2–3 business days." });
});

// GET /api/affiliates — admin: list all affiliate applications
app.get('/api/affiliates', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { data, error } = await supabase
    .from('affiliates')
    .select('*')
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Supabase affiliates fetch error:', error);
    return res.status(500).json({ error: 'Could not fetch affiliates.' });
  }

  res.json({ count: data.length, entries: data });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
