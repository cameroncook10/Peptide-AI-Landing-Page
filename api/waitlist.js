const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SOURCE = 'waitlist-site';

module.exports = async function handler(req, res) {
  const origin = process.env.FRONTEND_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, phone } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required.' });
  }

  const { data, error } = await supabase
    .from('waitlist')
    .insert({ email, phone: phone || null, source: SOURCE })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: "You're already on the waitlist!" });
    }
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  // Send emails
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"Peptide AI" <${process.env.SMTP_USER}>`,
        to: process.env.OWNER_EMAIL,
        subject: 'New Waitlist Signup',
        text: `New signup:\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSource: ${SOURCE}\nTotal: ${count}`,
      });
      await transporter.sendMail({
        from: `"Peptide AI" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "You're on the Peptide AI waitlist!",
        text: `You're in! We'll notify you the moment Peptide AI launches on the App Store and Google Play.\n\n— The Peptide AI Team`,
      });
    } catch (err) {
      console.error('Email error:', err.message);
    }
  }

  return res.status(201).json({ message: "You're on the waitlist! We'll notify you at launch." });
};
