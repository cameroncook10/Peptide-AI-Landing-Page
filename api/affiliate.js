const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const {
    firstName, lastName, email, phone,
    platforms, audienceSize, contentNiche,
    promoPlan, existingPartnerships, notes,
  } = req.body || {};

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

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const t = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await t.sendMail({
        from: `"Peptide AI" <${process.env.SMTP_USER}>`,
        to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
        subject: 'New Affiliate Application — Peptide AI',
        html: `
          <h2 style="color:#00E5A0;">New Affiliate Application</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;">
            <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td>${firstName} ${lastName}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td>${email}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td>${phone || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Platforms</td><td>${platforms.join(', ')}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Audience</td><td>${audienceSize || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Niche</td><td>${contentNiche || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Promo Plan</td><td>${promoPlan || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Partnerships</td><td>${existingPartnerships || '—'}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Notes</td><td>${notes || '—'}</td></tr>
          </table>`,
      });
    } catch (err) { console.error('Affiliate notification email failed:', err.message); }
  }

  return res.status(201).json({ success: true, message: "Application received! We'll be in touch within 2–3 business days." });
};
