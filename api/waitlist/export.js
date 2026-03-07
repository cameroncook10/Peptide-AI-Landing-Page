const { createClient } = require('@supabase/supabase-js');
<<<<<<< HEAD
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (process.env.EXPORT_SECRET && req.query.secret !== process.env.EXPORT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const { data, error } = await supabase
    .from('waitlist')
    .select('email, phone, joined_at')
    .order('joined_at', { ascending: true });
  if (error) return res.status(500).json({ error: 'Could not fetch waitlist.' });
  const csv = ['email,phone,joined_at',
    ...data.map(r => `${r.email},${r.phone || ''},${r.joined_at}`)
  ].join('\n');
=======

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const secret = process.env.EXPORT_SECRET;
  if (secret && req.query.secret !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('waitlist')
    .select('email, phone, created_at, source')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase export error:', error);
    return res.status(500).json({ error: 'Could not fetch waitlist.' });
  }

  const csv = [
    'email,phone,created_at,source',
    ...data.map(e => `${e.email},${e.phone || ''},${e.created_at},${e.source || ''}`)
  ].join('\n');

>>>>>>> 56adf74c8697942e8716d4b97b78ead1dacd10cf
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
  return res.send(csv);
};
