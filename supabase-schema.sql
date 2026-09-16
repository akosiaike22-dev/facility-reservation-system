-- Supabase Database Schema for Facility Reservation System
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'facility_staff', 'requester')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create facilities table
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('conference_room', 'laboratory', 'gym', 'auditorium', 'classroom')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    condition VARCHAR(50) NOT NULL DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'scheduled', 'in_use', 'completed', 'cancelled')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_end_after_start CHECK (end_time > start_time)
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reservations_facility_id ON reservations(facility_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_start_time ON reservations(start_time);
CREATE INDEX idx_reservations_end_time ON reservations(end_time);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_facilities_status ON facilities(status);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'requester')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON user_profiles FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Facilities RLS Policies
CREATE POLICY "Anyone can view facilities" ON facilities FOR SELECT USING (true);
CREATE POLICY "Admins can insert facilities" ON facilities FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Admins can update facilities" ON facilities FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Admins can delete facilities" ON facilities FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Reservations RLS Policies
CREATE POLICY "Requesters can view own reservations" ON reservations FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'facility_staff')
    )
);
CREATE POLICY "Requesters can insert reservations" ON reservations FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
CREATE POLICY "Requesters can update own pending reservations" ON reservations FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
);
CREATE POLICY "Admins can update any reservation" ON reservations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Facility staff can update reservation status" ON reservations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'facility_staff'
    )
);

-- Audit Logs RLS Policies
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- Insert sample data for testing
INSERT INTO facilities (name, type, capacity, location, status, condition) VALUES
('Main Conference Room', 'conference_room', 20, 'Building A, Floor 2', 'active', 'excellent'),
('Science Laboratory', 'laboratory', 15, 'Building B, Floor 1', 'active', 'good'),
('Sports Gym', 'gym', 50, 'Building C, Ground Floor', 'active', 'good'),
('University Auditorium', 'auditorium', 200, 'Main Building', 'active', 'excellent'),
('Computer Lab 1', 'classroom', 30, 'Building D, Floor 3', 'active', 'good');

-- Create a function to check for overlapping reservations
CREATE OR REPLACE FUNCTION check_reservation_overlap(
    p_facility_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    overlap_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO overlap_count
    FROM reservations
    WHERE facility_id = p_facility_id
    AND status IN ('approved', 'scheduled', 'in_use')
    AND (p_exclude_reservation_id IS NULL OR id != p_exclude_reservation_id)
    AND (
        (start_time < p_end_time) AND (end_time > p_start_time)
    );
    
    RETURN overlap_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to prevent overlapping reservations
CREATE OR REPLACE FUNCTION prevent_overlapping_reservations()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('approved', 'scheduled') THEN
        IF check_reservation_overlap(NEW.facility_id, NEW.start_time, NEW.end_time, NEW.id) THEN
            RAISE EXCEPTION 'Overlapping reservation detected for this time slot';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_overlap_trigger
    BEFORE INSERT OR UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION prevent_overlapping_reservations();
