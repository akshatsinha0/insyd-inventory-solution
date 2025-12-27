/*
 * 1.) Supabase Client Configuration.
 * 2.) Initialized connection using service role key.
 * 3.) Enabled server-side database operations.
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
