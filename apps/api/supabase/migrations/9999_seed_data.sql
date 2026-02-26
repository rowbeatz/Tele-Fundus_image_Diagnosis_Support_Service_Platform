-- Seed initial admin user and sample data
-- Passwords hash for 'admin123' (simulated)
INSERT INTO organizations (code, name, status) VALUES ('DEMO-CLIENT', 'Demo Medical Center', 'active') ON CONFLICT DO NOTHING;
INSERT INTO users (email, password_hash, full_name, role, is_active) 
VALUES ('admin@telefundus.jp', '$2b$10$YourAdminPasswordHashHere', 'System Administrator', 'admin', true) ON CONFLICT DO NOTHING;
