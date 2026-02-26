-- Create BillingPlan table
create table if not exists billing_plans (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references organizations(id) on delete restrict,
    name varchar(255) not null,
    base_price integer not null default 800,
    volume_tiers_json jsonb, -- e.g. [{"max_readings": 100, "price": 800}, {"max_readings": 500, "price": 700}]
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create PhysicianPayoutTier table
create table if not exists physician_payout_tiers (
    id uuid primary key default gen_random_uuid(),
    physician_id uuid references physicians(id) on delete restrict,
    base_rate integer not null default 500,
    urgent_rate_modifier integer default 0, -- additional amount for urgent readings
    penalty_rate_modifier integer default 0, -- deduction amount or percentage for poor quality
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Extend Examinee with clinical history
alter table examinees add column if not exists medical_history_json jsonb;
alter table examinees add column if not exists ocular_history_json jsonb;

-- Extend Screening with specific runtime clinical context
alter table screenings add column if not exists questionnaire_json jsonb;
