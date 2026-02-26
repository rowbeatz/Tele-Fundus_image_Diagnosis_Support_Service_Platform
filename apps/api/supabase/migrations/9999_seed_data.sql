-- Seed initial data for RetinaInsight Platform
-- Passwords are mocked (any password accepted for demo)

-- ═══ Organizations ═══
INSERT INTO organizations (id, code, name, billing_name, contact_name, email, phone, address, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'SAKURA-CLINIC', 'さくら眼科クリニック', 'さくら眼科クリニック', '小林 直樹', 'info@sakura-eye.jp', '03-1234-5678', '東京都渋谷区神宮前1-2-3', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'TOKYO-CENTRAL', '東京中央病院', '東京中央病院 眼科', '中村 明美', 'eye@tokyo-central.jp', '03-9876-5432', '東京都千代田区丸の内4-5-6', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'OSAKA-MEDICAL', '大阪総合医療センター', '大阪総合医療センター', '西田 裕子', 'ophthalmo@osaka-med.jp', '06-1111-2222', '大阪府大阪市中央区本町7-8-9', 'active')
ON CONFLICT DO NOTHING;

-- ═══ Physicians ═══
INSERT INTO physicians (id, code, name, email, specialty, max_daily_cases, status)
VALUES
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PHY-001', 'Dr. 田中 康夫', 'dr.tanaka@retinainsight.jp', '眼底読影 / 糖尿病網膜症', 30, 'active'),
  ('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PHY-002', 'Dr. 佐藤 恵理子', 'dr.sato@retinainsight.jp', '眼底読影 / 緑内障', 25, 'active'),
  ('aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PHY-003', 'Dr. 山本 隆志', 'dr.yamamoto@retinainsight.jp', '眼底読影 / 一般', 20, 'active'),
  ('aaaa4444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PHY-004', 'Dr. 渡辺 香織', 'dr.watanabe@retinainsight.jp', '眼底読影 / AMD', 28, 'active')
ON CONFLICT DO NOTHING;

-- ═══ Users (demo login accounts) ═══
INSERT INTO users (id, organization_id, physician_id, email, password_hash, full_name, role, admin_level, is_active)
VALUES
  ('bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, NULL, 'admin@retinainsight.jp', '$2b$10$demo', 'System Administrator', 'admin', 'super_admin', true),
  ('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, NULL, 'operator@retinainsight.jp', '$2b$10$demo', 'オペレーター 山口', 'operator', 'standard', true),
  ('bbbb3333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.tanaka@retinainsight.jp', '$2b$10$demo', 'Dr. 田中 康夫', 'physician', 'standard', true),
  ('bbbb4444-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', NULL, 'client@sakura-hospital.jp', '$2b$10$demo', '小林 直樹', 'client', 'standard', true),
  ('bbbb5555-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.sato@retinainsight.jp', '$2b$10$demo', 'Dr. 佐藤 恵理子', 'physician', 'standard', true)
ON CONFLICT DO NOTHING;

-- ═══ Roles ═══
INSERT INTO roles (id, name, display_name, description, is_system) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'super_admin', 'Super Administrator', 'Full system access including admin management', true),
  ('a0000001-0000-0000-0000-000000000002', 'admin', 'Administrator', 'Platform management without super admin privileges', true),
  ('a0000001-0000-0000-0000-000000000003', 'operator', 'Operator', 'Task assignment, QC review, screening management', true),
  ('a0000001-0000-0000-0000-000000000004', 'physician', 'Physician', 'Diagnostic reading and report submission', true),
  ('a0000001-0000-0000-0000-000000000005', 'client', 'Client (Organization)', 'Image upload and report viewing', true),
  ('a0000001-0000-0000-0000-000000000006', 'individual', 'Individual Client', 'Personal image upload and consent management', true)
ON CONFLICT DO NOTHING;

-- ═══ Permissions ═══
INSERT INTO permissions (id, key, category, display_name, description) VALUES
  -- Dashboard
  ('b0000001-0000-0000-0000-000000000001', 'dashboard.view', 'dashboard', 'View Dashboard', 'Access main dashboard'),
  -- Screening
  ('b0000001-0000-0000-0000-000000000002', 'screening.create', 'screening', 'Create Screening', 'Submit new screening requests'),
  ('b0000001-0000-0000-0000-000000000003', 'screening.view_all', 'screening', 'View All Screenings', 'View screenings across all organizations'),
  ('b0000001-0000-0000-0000-000000000004', 'screening.view_own', 'screening', 'View Own Screenings', 'View screenings for own organization'),
  ('b0000001-0000-0000-0000-000000000005', 'screening.edit', 'screening', 'Edit Screening', 'Modify screening metadata'),
  ('b0000001-0000-0000-0000-000000000006', 'screening.delete', 'screening', 'Delete Screening', 'Remove screening records'),
  -- Reading
  ('b0000001-0000-0000-0000-000000000007', 'reading.create', 'reading', 'Create Reading', 'Begin diagnostic reading'),
  ('b0000001-0000-0000-0000-000000000008', 'reading.submit', 'reading', 'Submit Reading', 'Submit completed reading'),
  ('b0000001-0000-0000-0000-000000000009', 'reading.qc', 'reading', 'QC Review', 'Perform quality control review'),
  ('b0000001-0000-0000-0000-000000000010', 'reading.reassign', 'reading', 'Reassign Reading', 'Reassign reading to another physician'),
  -- Image
  ('b0000001-0000-0000-0000-000000000011', 'image.upload', 'image', 'Upload Images', 'Upload fundus images'),
  ('b0000001-0000-0000-0000-000000000012', 'image.view', 'image', 'View Images', 'View fundus images'),
  ('b0000001-0000-0000-0000-000000000013', 'image.delete', 'image', 'Delete Images', 'Delete fundus images'),
  ('b0000001-0000-0000-0000-000000000014', 'image.annotate', 'image', 'Annotate Images', 'Add annotations to images'),
  ('b0000001-0000-0000-0000-000000000015', 'image.secondary_use', 'image', 'Secondary Use', 'Access images for secondary use'),
  ('b0000001-0000-0000-0000-000000000016', 'image.export', 'image', 'Export Images', 'Export images with/without masking'),
  -- User Management
  ('b0000001-0000-0000-0000-000000000017', 'user.view', 'user', 'View Users', 'View user list'),
  ('b0000001-0000-0000-0000-000000000018', 'user.create', 'user', 'Create Users', 'Create new user accounts'),
  ('b0000001-0000-0000-0000-000000000019', 'user.edit', 'user', 'Edit Users', 'Modify user profiles'),
  ('b0000001-0000-0000-0000-000000000020', 'user.deactivate', 'user', 'Deactivate Users', 'Deactivate user accounts'),
  ('b0000001-0000-0000-0000-000000000021', 'user.manage_admins', 'user', 'Manage Admin Users', 'Create/modify admin accounts'),
  -- Role Management
  ('b0000001-0000-0000-0000-000000000022', 'role.view', 'role', 'View Roles', 'View role definitions'),
  ('b0000001-0000-0000-0000-000000000023', 'role.manage', 'role', 'Manage Roles', 'Create/modify roles'),
  ('b0000001-0000-0000-0000-000000000024', 'permission.manage', 'role', 'Manage Permissions', 'Assign/revoke permissions'),
  -- Organization
  ('b0000001-0000-0000-0000-000000000025', 'organization.view', 'organization', 'View Organizations', 'View organization list'),
  ('b0000001-0000-0000-0000-000000000026', 'organization.manage', 'organization', 'Manage Organizations', 'Create/modify organizations'),
  -- Billing
  ('b0000001-0000-0000-0000-000000000027', 'billing.view', 'billing', 'View Billing', 'View billing dashboard'),
  ('b0000001-0000-0000-0000-000000000028', 'billing.manage', 'billing', 'Manage Billing', 'Generate invoices and payments'),
  -- Settings
  ('b0000001-0000-0000-0000-000000000029', 'settings.view', 'settings', 'View Settings', 'View platform settings'),
  ('b0000001-0000-0000-0000-000000000030', 'settings.manage', 'settings', 'Manage Settings', 'Modify platform settings'),
  ('b0000001-0000-0000-0000-000000000031', 'brand.manage', 'settings', 'Manage Brand', 'Modify platform branding'),
  -- Data Governance
  ('b0000001-0000-0000-0000-000000000032', 'data.mask', 'data', 'Data Masking', 'Apply data masking for secondary use'),
  ('b0000001-0000-0000-0000-000000000033', 'data.export', 'data', 'Data Export', 'Export masked/anonymized data'),
  ('b0000001-0000-0000-0000-000000000034', 'consent.view', 'data', 'View Consent', 'View consent records'),
  ('b0000001-0000-0000-0000-000000000035', 'consent.manage', 'data', 'Manage Consent', 'Create/modify consent records'),
  ('b0000001-0000-0000-0000-000000000036', 'image_policy.view', 'data', 'View Image Policies', 'View image governance policies'),
  ('b0000001-0000-0000-0000-000000000037', 'image_policy.manage', 'data', 'Manage Image Policies', 'Modify image governance policies')
ON CONFLICT DO NOTHING;

-- ═══ Role → Permission mappings ═══
-- Super Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT DO NOTHING;

-- Admin: everything except user.manage_admins, role.manage, permission.manage
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000002', id FROM permissions
WHERE key NOT IN ('user.manage_admins', 'role.manage', 'permission.manage')
ON CONFLICT DO NOTHING;

-- Operator
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000003', id FROM permissions
WHERE key IN ('dashboard.view','screening.view_all','screening.edit','reading.qc','reading.reassign','image.view','image.annotate','user.view')
ON CONFLICT DO NOTHING;

-- Physician
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000004', id FROM permissions
WHERE key IN ('dashboard.view','screening.view_all','reading.create','reading.submit','image.view','image.annotate')
ON CONFLICT DO NOTHING;

-- Client (Organization)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000005', id FROM permissions
WHERE key IN ('dashboard.view','screening.create','screening.view_own','image.upload','image.view')
ON CONFLICT DO NOTHING;

-- Individual
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000006', id FROM permissions
WHERE key IN ('dashboard.view','screening.create','screening.view_own','image.upload','image.view','consent.view')
ON CONFLICT DO NOTHING;

-- ═══ Image Policies ═══
INSERT INTO image_policies (organization_id, client_type, deletion_policy, secondary_use, data_masking_enabled, retention_days, notes)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'organization', 'admin_only', 'requires_consent', true, 2555, 'さくら眼科: 研究利用は患者同意が必要'),
  ('22222222-2222-2222-2222-222222222222', 'organization', 'deny', 'allowed', true, 3650, '東京中央病院: 包括同意取得済み'),
  ('33333333-3333-3333-3333-333333333333', 'organization', 'admin_only', 'denied', false, 2555, '大阪総合: 二次利用不可の契約')
ON CONFLICT DO NOTHING;

-- ═══ Sample Consent Records ═══
INSERT INTO consent_records (subject_type, subject_id, consent_type, status, granted_at, granted_by_name, consent_text)
VALUES
  ('examinee', 'cccc1111-cccc-cccc-cccc-cccccccccccc', 'secondary_use', 'granted', '2026-01-15 10:00+09', '田中 太郎', '眼底画像の研究・AI学習目的での二次利用に同意します。'),
  ('examinee', 'cccc2222-cccc-cccc-cccc-cccccccccccc', 'secondary_use', 'pending', NULL, NULL, NULL),
  ('organization', '22222222-2222-2222-2222-222222222222', 'data_sharing', 'granted', '2025-04-01 09:00+09', '中村 明美', '包括的データ共有同意書に基づく同意。')
ON CONFLICT DO NOTHING;

-- ═══ Examinees ═══
INSERT INTO examinees (id, organization_id, external_examinee_id, display_name, sex, birth_date, age)
VALUES
  ('cccc1111-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EX-10001', '田中 太郎', 'male', '1965-03-15', 61),
  ('cccc2222-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EX-10002', '鈴木 花子', 'female', '1972-07-22', 53),
  ('cccc3333-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'EX-20001', '佐藤 健一', 'male', '1958-11-03', 67),
  ('cccc4444-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'EX-20002', '山田 美咲', 'female', '1980-01-30', 46),
  ('cccc5555-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'EX-30001', '高橋 翔太', 'male', '1990-09-12', 35),
  ('cccc6666-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EX-10003', '伊藤 美穂', 'female', '1955-06-18', 70),
  ('cccc7777-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'EX-20003', '渡辺 大輔', 'male', '1948-12-05', 77),
  ('cccc8888-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'EX-30002', '中村 裕美', 'female', '1988-04-25', 37),
  ('cccc9999-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'EX-30003', '小林 誠', 'male', '1975-08-14', 50),
  ('cccc0000-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EX-10004', '加藤 さくら', 'female', '1962-02-28', 64)
ON CONFLICT DO NOTHING;

-- ═══ Client Orders ═══
INSERT INTO client_orders (id, organization_id, order_no, order_date, status, total_cases, submitted_by)
VALUES
  ('dddd1111-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'ORD-2026-001', '2026-02-20', 'submitted', 4, 'bbbb4444-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('dddd2222-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'ORD-2026-002', '2026-02-22', 'submitted', 3, 'bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('dddd3333-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'ORD-2026-003', '2026-02-25', 'submitted', 3, 'bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT DO NOTHING;

-- ═══ Screenings ═══
INSERT INTO screenings (id, client_order_id, examinee_id, screening_date, urgency_flag, blood_pressure_systolic, blood_pressure_diastolic, has_diabetes, status)
VALUES
  ('eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd1111-dddd-dddd-dddd-dddddddddddd', 'cccc1111-cccc-cccc-cccc-cccccccccccc', '2026-02-20 09:00', false, 135, 85, true, 'completed'),
  ('eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd1111-dddd-dddd-dddd-dddddddddddd', 'cccc2222-cccc-cccc-cccc-cccccccccccc', '2026-02-20 10:30', false, 120, 78, false, 'submitted'),
  ('eeee3333-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd1111-dddd-dddd-dddd-dddddddddddd', 'cccc6666-cccc-cccc-cccc-cccccccccccc', '2026-02-21 14:00', true, 165, 95, true, 'submitted'),
  ('eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd2222-dddd-dddd-dddd-dddddddddddd', 'cccc3333-cccc-cccc-cccc-cccccccccccc', '2026-02-22 08:45', false, 142, 88, true, 'completed'),
  ('eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd2222-dddd-dddd-dddd-dddddddddddd', 'cccc4444-cccc-cccc-cccc-cccccccccccc', '2026-02-23 11:00', false, 118, 76, false, 'submitted'),
  ('eeee6666-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd2222-dddd-dddd-dddd-dddddddddddd', 'cccc7777-cccc-cccc-cccc-cccccccccccc', '2026-02-24 09:30', true, 175, 100, true, 'submitted'),
  ('eeee7777-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd3333-dddd-dddd-dddd-dddddddddddd', 'cccc5555-cccc-cccc-cccc-cccccccccccc', '2026-02-25 10:00', false, 125, 80, false, 'submitted'),
  ('eeee8888-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd3333-dddd-dddd-dddd-dddddddddddd', 'cccc8888-cccc-cccc-cccc-cccccccccccc', '2026-02-25 13:00', false, 130, 82, false, 'submitted'),
  ('eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd3333-dddd-dddd-dddd-dddddddddddd', 'cccc9999-cccc-cccc-cccc-cccccccccccc', '2026-02-26 08:00', true, 155, 92, true, 'submitted'),
  ('eeee0000-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd1111-dddd-dddd-dddd-dddddddddddd', 'cccc0000-cccc-cccc-cccc-cccccccccccc', '2026-02-26 10:00', false, 128, 80, false, 'submitted')
ON CONFLICT DO NOTHING;

-- ═══ Images ═══
INSERT INTO images (id, screening_id, eye_side, image_type, original_filename, storage_key, mime_type, file_size_bytes, is_primary)
VALUES
  ('ffff1111-ffff-ffff-ffff-ffffffffffff', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_01.png', 'demo/fundus_right_01.png', 'image/png', 245000, true),
  ('ffff2222-ffff-ffff-ffff-ffffffffffff', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_01.png', 'demo/fundus_left_01.png', 'image/png', 238000, false),
  ('ffff3333-ffff-ffff-ffff-ffffffffffff', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_02.png', 'demo/fundus_right_02.png', 'image/png', 252000, true),
  ('ffff4444-ffff-ffff-ffff-ffffffffffff', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_02.png', 'demo/fundus_left_02.png', 'image/png', 241000, false)
ON CONFLICT DO NOTHING;
