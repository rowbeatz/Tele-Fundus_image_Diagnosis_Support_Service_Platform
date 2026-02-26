-- Create audit_logs table to track PHI access and modifications
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- e.g., 'READ', 'CREATE', 'UPDATE', 'DELETE'
    resource_type VARCHAR(50) NOT NULL, -- e.g., 'examinees', 'screenings', 'images', 'diagnostic_reports'
    resource_id UUID NOT NULL, -- The ID of the accessed resource
    details JSONB, -- The differences, specific fields accessed, or state before/after
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching audit logs by resource or user efficiently
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Add deleted_at to Examing and Screenings for Soft Deletes (HIPAA Data minimization / retention)
ALTER TABLE examinees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Update indexes for Soft Deletes
DROP INDEX IF EXISTS idx_examinees_client_id;
CREATE INDEX idx_examinees_client_id ON examinees(client_organization_id) WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS idx_screenings_examinee_id;
CREATE INDEX idx_screenings_examinee_id ON screenings(examinee_id) WHERE deleted_at IS NULL;
