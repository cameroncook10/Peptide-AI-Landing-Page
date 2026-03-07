const { createClient } = require('@supabase/supabase-js');
<<<<<<< HEAD
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ error: 'Could not fetch count.' });
  return res.json({ count: count || 0 });
=======

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Supabase count error:', error);
    return res.status(500).json({ error: 'Could not fetch count.' });
  }

  return res.json({ count });
>>>>>>> 56adf74c8697942e8716d4b97b78ead1dacd10cf
};
