-- 0014_permissions_system.sql
-- Granular RBAC permission system with admin hierarchy

-- ═══ 1. Roles ═══
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,   -- e.g. 'super_admin', 'admin', 'operator', 'physician', 'client', 'individual'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,     -- system roles cannot be deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ═══ 2. Permissions (capabilities) ═══
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,    -- e.g. 'screening.create', 'image.delete'
    category VARCHAR(50) NOT NULL,       -- grouping for UI: 'dashboard', 'screening', 'image', etc.
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ═══ 3. Role → Permission mapping ═══
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- ═══ 4. Per-user permission overrides ═══
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    effect VARCHAR(10) NOT NULL DEFAULT 'grant',  -- 'grant' or 'deny'
    granted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permission_id)
);

-- ═══ 5. Admin level on users ═══
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_level VARCHAR(20) DEFAULT 'standard';

-- ═══ 6. Image governance policies per organization ═══
CREATE TABLE IF NOT EXISTS image_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_type VARCHAR(20) DEFAULT 'organization',  -- 'organization' or 'individual'
    deletion_policy VARCHAR(20) DEFAULT 'admin_only', -- 'allow', 'deny', 'admin_only'
    secondary_use VARCHAR(30) DEFAULT 'requires_consent', -- 'allowed', 'denied', 'requires_consent'
    data_masking_enabled BOOLEAN DEFAULT false,
    retention_days INTEGER DEFAULT 2555,  -- ~7 years
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ═══ 7. Consent records (direct consent from individuals or organizations) ═══
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_type VARCHAR(20) NOT NULL,   -- 'individual', 'organization', 'examinee'
    subject_id UUID NOT NULL,            -- FK to examinees, users, or organizations
    consent_type VARCHAR(50) NOT NULL,   -- 'secondary_use', 'data_sharing', 'research', 'ai_training'
    status VARCHAR(20) DEFAULT 'pending', -- 'granted', 'revoked', 'pending', 'expired'
    granted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    granted_by_name VARCHAR(255),
    ip_address VARCHAR(50),
    consent_text TEXT,
    metadata_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_image_policies_org ON image_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_subject ON consent_records(subject_type, subject_id);
