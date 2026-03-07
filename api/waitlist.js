const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function sendEmails(email, phone, totalCount) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  try {
    await t.sendMail({
      from: `"Peptide AI" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: 'New Waitlist Signup — Peptide AI',
      html: `<p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || 'not provided'}</p><p><strong>Total signups:</strong> ${totalCount}</p>`,
    });
  } catch (e) { console.error('Owner email error:', e.message); }
  try {
    await t.sendMail({
      from: `"Peptide AI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "You're on the Peptide AI waitlist!",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#060810;color:#EEF2FF;border-radius:20px;"><h2 style="color:#00E5A0;margin-bottom:12px;">You're on the list.</h2><p style="color:#7A8499;line-height:1.7;">We'll notify you the moment <strong style="color:#EEF2FF;">Peptide AI</strong> drops on the App Store and Google Play.</p><p style="color:#343D50;font-size:13px;margin-top:28px;">— The Peptide AI team</p></div>`,
    });
  } catch (e) { console.error('Confirm email error:', e.message); }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, phone } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }

  const { error } = await supabase
    .from('waitlist')
    .insert({ email, phone: phone || null });

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

  return res.status(201).json({ success: true, message: "You're on the list! We'll notify you at launch." });
};
