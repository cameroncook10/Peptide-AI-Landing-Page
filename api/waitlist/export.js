const { list } = require('@vercel/blob');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const secret = process.env.EXPORT_SECRET;
  if (secret && req.query.secret !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const waitlist = await getWaitlist();
  const csv = ['email,phone,joinedAt', ...waitlist.map(e =>
    `${e.email},${e.phone || ''},${e.joinedAt}`
  )].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
  return res.send(csv);
};
