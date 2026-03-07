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
  const waitlist = await getWaitlist();
  return res.json({ count: waitlist.length });
};
