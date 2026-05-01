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

// POST /api/affiliate — submit affiliate application
app.post('/api/affiliate', async (req, res) => {
  const { firstName, lastName, email, phone, platforms, audienceSize, contentNiche, promoPlan, existingPartnerships, notes } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'First and last name are required.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'At least one platform must be selected.' });
  }

  const { data, error } = await supabase
    .from('affiliates')
    .insert({
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
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An application from this email already exists.' });
    }
    console.error('Affiliate insert error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  // Notify owner
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Peptide AI" <${process.env.SMTP_USER}>`,
        to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
        subject: 'New Affiliate Application — Peptide AI',
        html: `
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'not provided'}</p>
          <p><strong>Platforms:</strong> ${platforms.join(', ')}</p>
          <p><strong>Audience Size:</strong> ${audienceSize || 'not provided'}</p>
          <p><strong>Content Niche:</strong> ${contentNiche || 'not provided'}</p>
          <p><strong>Promo Plan:</strong> ${promoPlan || 'not provided'}</p>
          <p><strong>Existing Partnerships:</strong> ${existingPartnerships || 'none'}</p>
          <p><strong>Notes:</strong> ${notes || 'none'}</p>
        `,
      });
    } catch (err) { console.error('Affiliate owner email failed:', err.message); }
  }

  res.json({ success: true, message: "Application received! We'll be in touch within 2–3 business days." });
});

// POST /api/partner — submit brand/sponsor partnership application
app.post('/api/partner', async (req, res) => {
  const { companyName, contactName, email, phone, brandCategory, website, partnershipIdea, notes } = req.body;

  if (!companyName || !companyName.trim()) {
    return res.status(400).json({ error: 'Company name is required.' });
  }
  if (!contactName || !contactName.trim()) {
    return res.status(400).json({ error: 'Contact name is required.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }
  if (!brandCategory) {
    return res.status(400).json({ error: 'Brand category is required.' });
  }

  const { data, error } = await supabase
    .from('partners')
    .insert({
      company_name: companyName.trim(),
      contact_name: contactName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      brand_category: brandCategory,
      website: website || null,
      partnership_idea: partnershipIdea || null,
      notes: notes || null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An application from this email already exists.' });
    }
    console.error('Partner insert error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  // Notify owner
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Peptide AI" <${process.env.SMTP_USER}>`,
        to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
        subject: 'New Brand Partnership Application — Peptide AI',
        html: `
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Contact:</strong> ${contactName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'not provided'}</p>
          <p><strong>Brand Category:</strong> ${brandCategory}</p>
          <p><strong>Website:</strong> ${website || 'not provided'}</p>
          <p><strong>Partnership Idea:</strong> ${partnershipIdea || 'not provided'}</p>
          <p><strong>Notes:</strong> ${notes || 'none'}</p>
        `,
      });
    } catch (err) { console.error('Partner owner email failed:', err.message); }
  }

  res.json({ success: true, message: "Application received! We'll review your submission and be in touch within 3–5 business days." });
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

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
