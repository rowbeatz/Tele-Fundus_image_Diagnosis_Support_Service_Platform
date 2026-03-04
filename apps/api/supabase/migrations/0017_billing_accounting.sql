-- 0017_billing_accounting.sql
-- Accounting and Billing Core Schema corresponding to repository definitions

DROP TABLE IF EXISTS physician_payments CASCADE;
DROP TABLE IF EXISTS physician_payouts CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS physician_payout_tiers CASCADE;
DROP TABLE IF EXISTS billing_plans CASCADE;

-- 1. Billing Plans
CREATE TABLE billing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    volume_tiers_json JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Physician Payout Tiers
CREATE TABLE physician_payout_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id UUID REFERENCES physicians(id),
    base_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    urgent_rate_modifier DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    penalty_rate_modifier DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    billing_month VARCHAR(7) NOT NULL, -- e.g., '2025-01'
    base_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    invoice_file_path VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Physician Payments
CREATE TABLE physician_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id UUID NOT NULL REFERENCES physicians(id),
    payment_month VARCHAR(7) NOT NULL, -- e.g., '2025-01'
    base_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
