const { createClient } = require('@supabase/supabase-js');

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

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
  return res.send(csv);
};
