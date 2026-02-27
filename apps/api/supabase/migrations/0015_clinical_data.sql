-- 0015_clinical_data.sql
-- Extend examinees and screenings tables with comprehensive clinical data fields
-- Add reading_reports table for structured diagnostic reporting

-- ═══ Extend examinees (patients) ═══
ALTER TABLE examinees ADD COLUMN IF NOT EXISTS ethnicity VARCHAR(100);
ALTER TABLE examinees ADD COLUMN IF NOT EXISTS allergies_json JSONB;
ALTER TABLE examinees ADD COLUMN IF NOT EXISTS family_history_json JSONB;
ALTER TABLE examinees ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10);
ALTER TABLE examinees ADD COLUMN IF NOT EXISTS insurance_id VARCHAR(100);

-- ═══ Extend screenings with clinical intake data ═══
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS chief_complaint TEXT;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS symptoms_json JSONB;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS current_medications_json JSONB;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS ophthalmic_exam_json JSONB;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS hba1c DECIMAL(4,1);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS referring_physician VARCHAR(255);

-- ═══ Structured reading reports ═══
CREATE TABLE IF NOT EXISTS reading_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
    physician_id UUID NOT NULL REFERENCES physicians(id),

    -- Structured findings (right / left)
    findings_right_json JSONB,   -- { drusen: bool, hemorrhage: bool, exudate: bool, neovasc: bool, ... severity: 'none'|'mild'|'moderate'|'severe', notes: '' }
    findings_left_json JSONB,

    -- Judgment
    judgment_code VARCHAR(50),   -- 'A_normal', 'B_observation', 'C1_detailed_exam', 'C2_treatment', 'D_urgent'
    judgment_label VARCHAR(255),

    -- Referral
    referral_required BOOLEAN DEFAULT false,
    referral_destination VARCHAR(255),
    referral_reason TEXT,

    -- Report text
    report_text TEXT,
    template_id VARCHAR(100),

    -- Metadata
    status VARCHAR(50) DEFAULT 'draft',  -- 'draft', 'submitted', 'approved'
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
