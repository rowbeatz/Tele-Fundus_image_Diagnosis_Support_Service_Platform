-- 0000_base_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    billing_name VARCHAR(255),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Physicians
CREATE TABLE IF NOT EXISTS physicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    specialty VARCHAR(255),
    max_daily_cases INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    physician_id UUID REFERENCES physicians(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'operator', 'physician', 'client'
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Examinees (Patients)
CREATE TABLE IF NOT EXISTS examinees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    external_examinee_id VARCHAR(50),
    display_name VARCHAR(255) NOT NULL,
    sex VARCHAR(10),
    birth_date DATE,
    age INTEGER,
    medical_history_json JSONB,
    ocular_history_json JSONB,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Client Orders
CREATE TABLE IF NOT EXISTS client_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    order_no VARCHAR(100) NOT NULL,
    external_order_no VARCHAR(100),
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    total_cases INTEGER DEFAULT 0,
    submitted_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Screenings
CREATE TABLE IF NOT EXISTS screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_order_id UUID NOT NULL REFERENCES client_orders(id) ON DELETE CASCADE,
    examinee_id UUID NOT NULL REFERENCES examinees(id),
    screening_date TIMESTAMP WITH TIME ZONE NOT NULL,
    urgency_flag BOOLEAN DEFAULT false,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    has_diabetes BOOLEAN,
    has_hypertension BOOLEAN,
    has_dyslipidemia BOOLEAN,
    smoking_status VARCHAR(50),
    questionnaire_text TEXT,
    questionnaire_json JSONB,
    special_notes TEXT,
    status VARCHAR(50) DEFAULT 'submitted',
    qc_issue_flag BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Images
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
    eye_side VARCHAR(10) NOT NULL, -- 'left', 'right'
    image_type VARCHAR(50) DEFAULT 'fundus_color',
    original_filename VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    width_px INTEGER,
    height_px INTEGER,
    sha256_hash VARCHAR(64),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    annotations_json JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
    physician_id UUID NOT NULL REFERENCES physicians(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'assigned',
    is_current BOOLEAN DEFAULT true,
    reassign_reason TEXT
);

-- 9. Readings
CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    physician_id UUID NOT NULL REFERENCES physicians(id),
    status VARCHAR(50) DEFAULT 'draft',
    finding_text TEXT,
    judgment_code VARCHAR(50),
    referral_required BOOLEAN DEFAULT false,
    physician_comment TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Reading Reviews (QC)
CREATE TABLE IF NOT EXISTS reading_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
    reviewed_by UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    checklist_json JSONB,
    review_comment TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Billing Plans
CREATE TABLE IF NOT EXISTS billing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    volume_tiers_json JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Physician Payout Tiers
CREATE TABLE IF NOT EXISTS physician_payout_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    physician_id UUID REFERENCES physicians(id),
    base_rate DECIMAL(12, 2) NOT NULL,
    urgent_rate_modifier DECIMAL(12, 2) DEFAULT 0,
    penalty_rate_modifier DECIMAL(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Infrastructure: Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    issued_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL
);
