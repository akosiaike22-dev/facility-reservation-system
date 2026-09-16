// Supabase Configuration
const SUPABASE_URL = 'https://ibwuhyrylzgcxsbdeqsn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tz7N612mYAtGfxBWFTFHLg_KI4Lo6YD';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
