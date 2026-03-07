const { list, put } = require('@vercel/blob');
const nodemailer = require('nodemailer');

async function getWaitlist() {
  try {
    const { blobs } = await list({ prefix: 'waitlist.json' });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].url + '?t=' + Date.now());
    return await res.json();
  } catch {
    return [];
  }
}

async function saveWaitlist(data) {
  await put('waitlist.json', JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

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

  const waitlist = await getWaitlist();
  if (waitlist.some(e => e.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "You're already on the waitlist!" });
  }

  waitlist.push({ email, phone: phone || null, joinedAt: new Date().toISOString() });
  await saveWaitlist(waitlist);

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
        text: `New signup:\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nTotal: ${waitlist.length}`,
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
