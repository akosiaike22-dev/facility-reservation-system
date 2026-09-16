// Supabase Configuration
const SUPABASE_URL = 'https://ibwuhyrylzgcxsbdeqsn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tz7N612mYAtGfxBWFTFHLg_KI4Lo6YD';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase };
}
