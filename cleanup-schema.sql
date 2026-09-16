-- Clean up existing tables and recreate schema
-- Run this FIRST if you get "relation already exists" errors

-- Drop triggers
DROP TRIGGER IF EXISTS prevent_overlap_trigger ON reservations;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS prevent_overlapping_reservations();
DROP FUNCTION IF EXISTS check_reservation_overlap(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID);
DROP FUNCTION IF EXISTS handle_new_user();

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Now run the full schema from supabase-schema.sql
