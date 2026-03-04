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
  ('b0000001-0000-0000-0000-000000000001', 'dashboard.view', 'dashboard', 'View Dashboard', 'Access main dashboard'),
  ('b0000001-0000-0000-0000-000000000002', 'screening.create', 'screening', 'Create Screening', 'Submit new screening requests'),
  ('b0000001-0000-0000-0000-000000000003', 'screening.view_all', 'screening', 'View All Screenings', 'View screenings across all organizations'),
  ('b0000001-0000-0000-0000-000000000004', 'screening.view_own', 'screening', 'View Own Screenings', 'View screenings for own organization'),
  ('b0000001-0000-0000-0000-000000000005', 'screening.edit', 'screening', 'Edit Screening', 'Modify screening metadata'),
  ('b0000001-0000-0000-0000-000000000006', 'screening.delete', 'screening', 'Delete Screening', 'Remove screening records'),
  ('b0000001-0000-0000-0000-000000000007', 'reading.create', 'reading', 'Create Reading', 'Begin diagnostic reading'),
  ('b0000001-0000-0000-0000-000000000008', 'reading.submit', 'reading', 'Submit Reading', 'Submit completed reading'),
  ('b0000001-0000-0000-0000-000000000009', 'reading.qc', 'reading', 'QC Review', 'Perform quality control review'),
  ('b0000001-0000-0000-0000-000000000010', 'reading.reassign', 'reading', 'Reassign Reading', 'Reassign reading to another physician'),
  ('b0000001-0000-0000-0000-000000000011', 'image.upload', 'image', 'Upload Images', 'Upload fundus images'),
  ('b0000001-0000-0000-0000-000000000012', 'image.view', 'image', 'View Images', 'View fundus images'),
  ('b0000001-0000-0000-0000-000000000013', 'image.delete', 'image', 'Delete Images', 'Delete fundus images'),
  ('b0000001-0000-0000-0000-000000000014', 'image.annotate', 'image', 'Annotate Images', 'Add annotations to images'),
  ('b0000001-0000-0000-0000-000000000015', 'image.secondary_use', 'image', 'Secondary Use', 'Access images for secondary use'),
  ('b0000001-0000-0000-0000-000000000016', 'image.export', 'image', 'Export Images', 'Export images with/without masking'),
  ('b0000001-0000-0000-0000-000000000017', 'user.view', 'user', 'View Users', 'View user list'),
  ('b0000001-0000-0000-0000-000000000018', 'user.create', 'user', 'Create Users', 'Create new user accounts'),
  ('b0000001-0000-0000-0000-000000000019', 'user.edit', 'user', 'Edit Users', 'Modify user profiles'),
  ('b0000001-0000-0000-0000-000000000020', 'user.deactivate', 'user', 'Deactivate Users', 'Deactivate user accounts'),
  ('b0000001-0000-0000-0000-000000000021', 'user.manage_admins', 'user', 'Manage Admin Users', 'Create/modify admin accounts'),
  ('b0000001-0000-0000-0000-000000000022', 'role.view', 'role', 'View Roles', 'View role definitions'),
  ('b0000001-0000-0000-0000-000000000023', 'role.manage', 'role', 'Manage Roles', 'Create/modify roles'),
  ('b0000001-0000-0000-0000-000000000024', 'permission.manage', 'role', 'Manage Permissions', 'Assign/revoke permissions'),
  ('b0000001-0000-0000-0000-000000000025', 'organization.view', 'organization', 'View Organizations', 'View organization list'),
  ('b0000001-0000-0000-0000-000000000026', 'organization.manage', 'organization', 'Manage Organizations', 'Create/modify organizations'),
  ('b0000001-0000-0000-0000-000000000027', 'billing.view', 'billing', 'View Billing', 'View billing dashboard'),
  ('b0000001-0000-0000-0000-000000000028', 'billing.manage', 'billing', 'Manage Billing', 'Generate invoices and payments'),
  ('b0000001-0000-0000-0000-000000000029', 'settings.view', 'settings', 'View Settings', 'View platform settings'),
  ('b0000001-0000-0000-0000-000000000030', 'settings.manage', 'settings', 'Manage Settings', 'Modify platform settings'),
  ('b0000001-0000-0000-0000-000000000031', 'brand.manage', 'settings', 'Manage Brand', 'Modify platform branding'),
  ('b0000001-0000-0000-0000-000000000032', 'data.mask', 'data', 'Data Masking', 'Apply data masking for secondary use'),
  ('b0000001-0000-0000-0000-000000000033', 'data.export', 'data', 'Data Export', 'Export masked/anonymized data'),
  ('b0000001-0000-0000-0000-000000000034', 'consent.view', 'data', 'View Consent', 'View consent records'),
  ('b0000001-0000-0000-0000-000000000035', 'consent.manage', 'data', 'Manage Consent', 'Create/modify consent records'),
  ('b0000001-0000-0000-0000-000000000036', 'image_policy.view', 'data', 'View Image Policies', 'View image governance policies'),
  ('b0000001-0000-0000-0000-000000000037', 'image_policy.manage', 'data', 'Manage Image Policies', 'Modify image governance policies')
ON CONFLICT DO NOTHING;

-- ═══ Role → Permission mappings ═══
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000002', id FROM permissions
WHERE key NOT IN ('user.manage_admins', 'role.manage', 'permission.manage')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000003', id FROM permissions
WHERE key IN ('dashboard.view','screening.view_all','screening.edit','reading.qc','reading.reassign','image.view','image.annotate','user.view')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000004', id FROM permissions
WHERE key IN ('dashboard.view','screening.view_all','reading.create','reading.submit','image.view','image.annotate')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000001-0000-0000-0000-000000000005', id FROM permissions
WHERE key IN ('dashboard.view','screening.create','screening.view_own','image.upload','image.view')
ON CONFLICT DO NOTHING;

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

-- ═══ Examinees (with clinical extensions) ═══
INSERT INTO examinees (id, organization_id, external_examinee_id, display_name, sex, birth_date, age, ethnicity, blood_type, allergies_json, family_history_json)
VALUES
  ('cccc1111-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EX-10001', '田中 太郎', 'male', '1965-03-15', 60, '日本人', 'A+',
    '["ペニシリン系抗菌薬"]', '["母: 2型糖尿病", "父: 高血圧"]'),
  ('cccc2222-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EX-10002', '鈴木 花子', 'female', '1972-07-22', 53, '日本人', 'O+',
    '[]', '["母: 緑内障"]'),
  ('cccc3333-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'EX-20001', '佐藤 健一', 'male', '1958-11-03', 67, '日本人', 'B+',
    '["スルホンアミド系"]', '["父: 糖尿病性網膜症", "母: 高血圧"]'),
  ('cccc4444-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'EX-20002', '山田 美咲', 'female', '1980-01-30', 46, '日本人', 'AB+',
    '[]', '[]'),
  ('cccc5555-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'EX-30001', '高橋 翔太', 'male', '1990-09-12', 35, '日本人', 'A+',
    '["花粉（スギ）"]', '[]'),
  ('cccc6666-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EX-10003', '伊藤 美穂', 'female', '1955-06-18', 70, '日本人', 'O-',
    '["セフェム系抗菌薬", "造影剤（ヨード系）"]', '["母: 加齢黄斑変性", "父: 糖尿病"]'),
  ('cccc7777-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'EX-20003', '渡辺 大輔', 'male', '1948-12-05', 77, '日本人', 'A+',
    '["NSAIDs（アスピリン）"]', '["父: 緑内障", "母: 白内障"]'),
  ('cccc8888-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'EX-30002', '中村 裕美', 'female', '1988-04-25', 37, '日本人', 'B+',
    '[]', '[]'),
  ('cccc9999-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'EX-30003', '小林 誠', 'male', '1975-08-14', 50, '日本人', 'O+',
    '["ラテックス"]', '["父: 2型糖尿病"]'),
  ('cccc0000-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EX-10004', '加藤 さくら', 'female', '1962-02-28', 64, '日本人', 'AB-',
    '[]', '["母: 加齢黄斑変性"]')
ON CONFLICT (id) DO UPDATE SET
  ethnicity = EXCLUDED.ethnicity,
  blood_type = EXCLUDED.blood_type,
  allergies_json = EXCLUDED.allergies_json,
  family_history_json = EXCLUDED.family_history_json;

-- ═══ Client Orders ═══
INSERT INTO client_orders (id, organization_id, order_no, order_date, status, total_cases, submitted_by)
VALUES
  ('dddd1111-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'ORD-2026-001', '2026-02-20', 'submitted', 4, 'bbbb4444-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('dddd2222-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'ORD-2026-002', '2026-02-22', 'submitted', 3, 'bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('dddd3333-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'ORD-2026-003', '2026-02-25', 'submitted', 3, 'bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT DO NOTHING;

-- ═══ Screenings (with clinical intake data) ═══
INSERT INTO screenings (id, client_order_id, examinee_id, screening_date, urgency_flag, blood_pressure_systolic, blood_pressure_diastolic, has_diabetes, status,
  chief_complaint, symptoms_json, current_medications_json, ophthalmic_exam_json, hba1c, referring_physician)
VALUES
  ('eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd1111-dddd-dddd-dddd-dddddddddddd', 'cccc1111-cccc-cccc-cccc-cccccccccccc', '2026-02-20 09:00', false, 135, 85, true, 'completed',
    '右眼の視力低下が1週間前から徐々に進行している。飛蚊症の自覚もあり。',
    '["視力低下", "飛蚊症"]',
    '["アムロジピン 5mg 1日1回", "メトホルミン 500mg 1日2回", "アトルバスタチン 10mg"]',
    '{"vaRight": "0.7 (1.0×)", "vaLeft": "1.0 (1.2×)", "iopRight": 14, "iopLeft": 16, "anteriorFindings": "両眼 水晶体軽度混濁"}',
    7.2, '佐藤 一郎'),
  ('eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd1111-dddd-dddd-dddd-dddddddddddd', 'cccc2222-cccc-cccc-cccc-cccccccccccc', '2026-02-20 10:30', false, 120, 78, false, 'submitted',
    '定期健診。特に自覚症状なし。',
    '[]',
    '["レボチロキシン 50μg"]',
    '{"vaRight": "1.0 (1.2×)", "vaLeft": "1.0 (1.2×)", "iopRight": 13, "iopLeft": 14, "anteriorFindings": "異常なし"}',
    5.4, '山田 花子'),
  ('eeee3333-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd1111-dddd-dddd-dddd-dddddddddddd', 'cccc6666-cccc-cccc-cccc-cccccccccccc', '2026-02-21 14:00', true, 165, 95, true, 'submitted',
    '両眼の急な視力低下。2日前から物が歪んで見える。',
    '["急性視力低下", "変視症", "中心暗点"]',
    '["インスリン グラルギン 20単位", "メトホルミン 1000mg", "エナラプリル 10mg", "アスピリン 100mg"]',
    '{"vaRight": "0.3 (0.5×)", "vaLeft": "0.4 (0.6×)", "iopRight": 18, "iopLeft": 17, "anteriorFindings": "両眼 白内障(NS2)"}',
    8.5, '鈴木 太郎'),
  ('eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd2222-dddd-dddd-dddd-dddddddddddd', 'cccc3333-cccc-cccc-cccc-cccccccccccc', '2026-02-22 08:45', false, 142, 88, true, 'completed',
    '糖尿病網膜症の定期フォローアップ。前回より硬性白斑が増加傾向。',
    '["硬性白斑増加"]',
    '["メトホルミン 750mg 1日2回", "グリメピリド 1mg", "ニフェジピン 20mg"]',
    '{"vaRight": "0.8 (1.0×)", "vaLeft": "0.9 (1.0×)", "iopRight": 15, "iopLeft": 14, "anteriorFindings": "両眼 水晶体軽度混濁"}',
    7.8, '高橋 美紀'),
  ('eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd2222-dddd-dddd-dddd-dddddddddddd', 'cccc4444-cccc-cccc-cccc-cccccccccccc', '2026-02-23 11:00', false, 118, 76, false, 'submitted',
    '職場健診で眼底異常を指摘された。自覚症状なし。',
    '[]',
    '[]',
    '{"vaRight": "1.2 (n.c.)", "vaLeft": "1.2 (n.c.)", "iopRight": 12, "iopLeft": 13, "anteriorFindings": "異常なし"}',
    5.1, '伊藤 翔'),
  ('eeee6666-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd2222-dddd-dddd-dddd-dddddddddddd', 'cccc7777-cccc-cccc-cccc-cccccccccccc', '2026-02-24 09:30', true, 175, 100, true, 'submitted',
    '右眼の急激な視野欠損。3日前から下半分が見えにくい。高血圧・糖尿病の既往あり。',
    '["視野欠損", "飛蚊症増悪"]',
    '["インスリン リスプロ 食前", "メトホルミン 1000mg", "アムロジピン 10mg", "ワルファリン 3mg"]',
    '{"vaRight": "0.2 (0.4×)", "vaLeft": "0.6 (0.8×)", "iopRight": 22, "iopLeft": 16, "anteriorFindings": "右眼 前房細胞(+), 両眼 後嚢下白内障"}',
    9.1, '太田 隆'),
  ('eeee7777-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd3333-dddd-dddd-dddd-dddddddddddd', 'cccc5555-cccc-cccc-cccc-cccccccccccc', '2026-02-25 10:00', false, 125, 80, false, 'submitted',
    'コンタクトレンズ処方のための定期検査。',
    '[]',
    '[]',
    '{"vaRight": "1.5 (n.c.)", "vaLeft": "1.5 (n.c.)", "iopRight": 11, "iopLeft": 12, "anteriorFindings": "異常なし"}',
    4.8, '中島 恵'),
  ('eeee8888-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd3333-dddd-dddd-dddd-dddddddddddd', 'cccc8888-cccc-cccc-cccc-cccccccccccc', '2026-02-25 13:00', false, 130, 82, false, 'submitted',
    '妊娠中の定期眼科検査。妊娠28週。',
    '[]',
    '["葉酸サプリメント", "鉄剤"]',
    '{"vaRight": "1.0 (1.2×)", "vaLeft": "1.0 (1.2×)", "iopRight": 13, "iopLeft": 13, "anteriorFindings": "異常なし"}',
    4.9, '松本 由美'),
  ('eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd3333-dddd-dddd-dddd-dddddddddddd', 'cccc9999-cccc-cccc-cccc-cccccccccccc', '2026-02-26 08:00', true, 155, 92, true, 'submitted',
    '糖尿病性網膜症の進行が疑われる。右眼に新しい出血を自覚。',
    '["新規出血", "かすみ目"]',
    '["メトホルミン 500mg 1日2回", "シタグリプチン 50mg", "バルサルタン 80mg"]',
    '{"vaRight": "0.5 (0.8×)", "vaLeft": "0.7 (1.0×)", "iopRight": 16, "iopLeft": 15, "anteriorFindings": "両眼 水晶体軽度混濁"}',
    7.6, '木村 健太'),
  ('eeee0000-eeee-eeee-eeee-eeeeeeeeeeee', 'dddd1111-dddd-dddd-dddd-dddddddddddd', 'cccc0000-cccc-cccc-cccc-cccccccccccc', '2026-02-26 10:00', false, 128, 80, false, 'submitted',
    '左眼のかすみが2週間続いている。近見障害あり。',
    '["かすみ目", "近見障害"]',
    '["ロサルタン 50mg"]',
    '{"vaRight": "0.8 (1.0×)", "vaLeft": "0.6 (0.8×)", "iopRight": 14, "iopLeft": 15, "anteriorFindings": "左眼 皮質白内障(C1)"}',
    5.8, '佐々木 律子')
ON CONFLICT (id) DO UPDATE SET
  chief_complaint = EXCLUDED.chief_complaint,
  symptoms_json = EXCLUDED.symptoms_json,
  current_medications_json = EXCLUDED.current_medications_json,
  ophthalmic_exam_json = EXCLUDED.ophthalmic_exam_json,
  hba1c = EXCLUDED.hba1c,
  referring_physician = EXCLUDED.referring_physician;

-- ═══ Images (R+L for ALL 10 screenings) ═══
INSERT INTO images (id, screening_id, eye_side, image_type, original_filename, storage_key, mime_type, file_size_bytes, is_primary)
VALUES
  -- 1. 田中太郎 (eeee1111)
  ('ffff1111-ffff-ffff-ffff-ffffffffffff', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_01.png', 'demo/fundus_right_01.png', 'image/png', 31335, true),
  ('ffff2222-ffff-ffff-ffff-ffffffffffff', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_01.png', 'demo/fundus_left_01.png', 'image/png', 42243, false),
  -- 2. 鈴木花子 (eeee2222)
  ('ffff0201-ffff-ffff-ffff-ffffffffffff', 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_03.png', 'demo/fundus_right_03.png', 'image/png', 533124, true),
  ('ffff0202-ffff-ffff-ffff-ffffffffffff', 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_03.png', 'demo/fundus_left_03.png', 'image/png', 477965, false),
  -- 3. 伊藤美穂 (eeee3333)
  ('ffff0301-ffff-ffff-ffff-ffffffffffff', 'eeee3333-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_10.png', 'demo/fundus_right_10.png', 'image/png', 565632, true),
  ('ffff0302-ffff-ffff-ffff-ffffffffffff', 'eeee3333-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_10.png', 'demo/fundus_left_10.png', 'image/png', 475121, false),
  -- 4. 佐藤健一 (eeee4444)
  ('ffff3333-ffff-ffff-ffff-ffffffffffff', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_02.png', 'demo/fundus_right_02.png', 'image/png', 30223, true),
  ('ffff4444-ffff-ffff-ffff-ffffffffffff', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_02.png', 'demo/fundus_left_02.png', 'image/png', 30223, false),
  -- 5. 山田美咲 (eeee5555)
  ('ffff0501-ffff-ffff-ffff-ffffffffffff', 'eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_05.png', 'demo/fundus_right_05.png', 'image/png', 504799, true),
  ('ffff0502-ffff-ffff-ffff-ffffffffffff', 'eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_05.png', 'demo/fundus_left_05.png', 'image/png', 493574, false),
  -- 6. 渡辺大輔 (eeee6666)
  ('ffff0601-ffff-ffff-ffff-ffffffffffff', 'eeee6666-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_04.png', 'demo/fundus_right_04.png', 'image/png', 516855, true),
  ('ffff0602-ffff-ffff-ffff-ffffffffffff', 'eeee6666-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_04.png', 'demo/fundus_left_04.png', 'image/png', 525871, false),
  -- 7. 高橋翔太 (eeee7777)
  ('ffff0701-ffff-ffff-ffff-ffffffffffff', 'eeee7777-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_07.png', 'demo/fundus_right_07.png', 'image/png', 477621, true),
  ('ffff0702-ffff-ffff-ffff-ffffffffffff', 'eeee7777-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_07.png', 'demo/fundus_left_07.png', 'image/png', 474986, false),
  -- 8. 中村裕美 (eeee8888)
  ('ffff0801-ffff-ffff-ffff-ffffffffffff', 'eeee8888-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_08.png', 'demo/fundus_right_08.png', 'image/png', 492554, true),
  ('ffff0802-ffff-ffff-ffff-ffffffffffff', 'eeee8888-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_08.png', 'demo/fundus_left_08.png', 'image/png', 529980, false),
  -- 9. 小林誠 (eeee9999)
  ('ffff0901-ffff-ffff-ffff-ffffffffffff', 'eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_09.png', 'demo/fundus_right_09.png', 'image/png', 515699, true),
  ('ffff0902-ffff-ffff-ffff-ffffffffffff', 'eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_09.png', 'demo/fundus_left_09.png', 'image/png', 483586, false),
  -- 10. 加藤さくら (eeee0000)
  ('ffff1001-ffff-ffff-ffff-ffffffffffff', 'eeee0000-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_06.png', 'demo/fundus_right_06.png', 'image/png', 480788, true),
  ('ffff1002-ffff-ffff-ffff-ffffffffffff', 'eeee0000-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_06.png', 'demo/fundus_left_06.png', 'image/png', 536109, false)
ON CONFLICT (id) DO UPDATE SET
  storage_key = EXCLUDED.storage_key,
  file_size_bytes = EXCLUDED.file_size_bytes;

-- ═══ Assignments (all screenings assigned to physicians) ═══
INSERT INTO assignments (id, screening_id, physician_id, assigned_by, assigned_at, due_at, status, is_current)
VALUES
  ('aa110000-0000-0000-0000-000000000001', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-20 09:30', '2026-02-22', 'completed', true),
  ('aa110000-0000-0000-0000-000000000002', 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-20 11:00', '2026-02-23', 'assigned', true),
  ('aa110000-0000-0000-0000-000000000003', 'eeee3333-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-21 14:30', '2026-02-22', 'assigned', true),
  ('aa110000-0000-0000-0000-000000000004', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-22 09:00', '2026-02-24', 'completed', true),
  ('aa110000-0000-0000-0000-000000000005', 'eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-23 11:30', '2026-02-26', 'assigned', true),
  ('aa110000-0000-0000-0000-000000000006', 'eeee6666-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-24 10:00', '2026-02-25', 'assigned', true),
  ('aa110000-0000-0000-0000-000000000007', 'eeee7777-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-25 10:30', '2026-02-28', 'assigned', true),
  ('aa110000-0000-0000-0000-000000000008', 'eeee8888-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-25 13:30', '2026-02-28', 'assigned', true),
  ('aa110000-0000-0000-0000-000000000009', 'eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-26 08:30', '2026-02-27', 'assigned', true),
  ('aa110000-0000-0000-0000-000000000010', 'eeee0000-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa4444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-02-26 10:30', '2026-02-28', 'assigned', true)
ON CONFLICT DO NOTHING;

-- ═══ Readings (all screenings have readings) ═══
INSERT INTO readings (id, screening_id, assignment_id, physician_id, status, finding_text, judgment_code, referral_required, physician_comment, submitted_at)
VALUES
  ('b1110000-0000-0000-0000-000000000001', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000001', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'submitted',
    '右眼: 軽度の非増殖糖尿病網膜症（NPDR）。散在する微小動脈瘤、点状出血あり。黄斑浮腫なし。左眼: 正常範囲内。', 'B_observation', false,
    '3ヶ月後の再検査を推奨。血糖コントロールの改善が望ましい。', '2026-02-21 10:00'),
  ('b1110000-0000-0000-0000-000000000002', 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000002', 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft',
    NULL, NULL, false, NULL, NULL),
  ('b1110000-0000-0000-0000-000000000003', 'eeee3333-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000003', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft',
    NULL, NULL, false, NULL, NULL),
  ('b1110000-0000-0000-0000-000000000004', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000004', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'submitted',
    '両眼: 中等度の非増殖糖尿病網膜症。硬性白斑が黄斑近傍に増加。毛細血管閉塞域あり。', 'C1_detailed_exam', true,
    '蛍光眼底造影検査を推奨。レーザー光凝固術の適応を検討。', '2026-02-23 14:00'),
  ('b1110000-0000-0000-0000-000000000005', 'eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000005', 'aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft',
    NULL, NULL, false, NULL, NULL),
  ('b1110000-0000-0000-0000-000000000006', 'eeee6666-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000006', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft',
    NULL, NULL, false, NULL, NULL),
  ('b1110000-0000-0000-0000-000000000007', 'eeee7777-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000007', 'aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft',
    NULL, NULL, false, NULL, NULL),
  ('b1110000-0000-0000-0000-000000000008', 'eeee8888-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000008', 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft',
    NULL, NULL, false, NULL, NULL),
  ('b1110000-0000-0000-0000-000000000009', 'eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000009', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft',
    NULL, NULL, false, NULL, NULL),
  ('b1110000-0000-0000-0000-000000000010', 'eeee0000-eeee-eeee-eeee-eeeeeeeeeeee', 'aa110000-0000-0000-0000-000000000010', 'aaaa4444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft',
    NULL, NULL, false, NULL, NULL)
ON CONFLICT DO NOTHING;

-- ═══ Reading Reports (for completed screenings) ═══
INSERT INTO reading_reports (id, reading_id, screening_id, physician_id, findings_right_json, findings_left_json, judgment_code, judgment_label, referral_required, report_text, status, submitted_at)
VALUES
  ('b2220000-0000-0000-0000-000000000001', 'b1110000-0000-0000-0000-000000000001', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '{"drusen": false, "hemorrhage": true, "hardExudate": false, "softExudate": false, "neovasc": false, "microCapillaryAnomaly": true, "macula": false, "opticNerve": false, "severity": "mild"}',
    '{"drusen": false, "hemorrhage": false, "hardExudate": false, "softExudate": false, "neovasc": false, "microCapillaryAnomaly": false, "macula": false, "opticNerve": false, "severity": "none"}',
    'B_observation', 'B: 要経過観察', false,
    '右眼に軽度の非増殖糖尿病網膜症所見を認めます。散在する微小動脈瘤と点状出血がありますが、黄斑浮腫は認められません。左眼は正常範囲内です。3ヶ月後の定期フォローアップと、HbA1c 7.0%未満を目標とした血糖コントロールの改善をお勧めします。',
    'submitted', '2026-02-21 10:00'),
  ('b2220000-0000-0000-0000-000000000002', 'b1110000-0000-0000-0000-000000000004', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '{"drusen": false, "hemorrhage": true, "hardExudate": true, "softExudate": true, "neovasc": false, "microCapillaryAnomaly": true, "macula": true, "opticNerve": false, "severity": "moderate"}',
    '{"drusen": false, "hemorrhage": true, "hardExudate": true, "softExudate": false, "neovasc": false, "microCapillaryAnomaly": true, "macula": false, "opticNerve": false, "severity": "moderate"}',
    'C1_detailed_exam', 'C1: 要精密検査', true,
    '両眼に中等度の非増殖糖尿病網膜症を認めます。右眼では硬性白斑が黄斑近傍に増加しており、clinically significant macular edema（CSME）への進展に注意が必要です。蛍光眼底造影検査による詳細評価と、レーザー光凝固術の適応検討をお勧めします。',
    'submitted', '2026-02-23 14:00')
ON CONFLICT DO NOTHING;

-- ═══ Case Discussion Messages ═══
INSERT INTO case_discussions (id, screening_id, user_id, message, created_at)
VALUES
  -- 田中太郎の症例ディスカッション
  ('c0000001-0000-0000-0000-000000000001', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbb3333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '田中さんの右眼にNPDR所見を確認しました。微小動脈瘤が散見されますが、黄斑浮腫は認めません。', '2026-02-21 09:30+09'),
  ('c0000001-0000-0000-0000-000000000002', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '了解しました。HbA1cが7.2%と高めですので、主治医への情報提供も検討してください。', '2026-02-21 09:35+09'),
  -- 佐藤健一の症例ディスカッション
  ('c0000002-0000-0000-0000-000000000001', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbb3333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '佐藤さんの眼底所見ですが、前回と比較して硬性白斑が増加しています。精密検査をお勧めします。', '2026-02-23 13:45+09'),
  ('c0000002-0000-0000-0000-000000000002', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbb5555-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '同意します。蛍光眼底造影も検討した方が良いでしょう。', '2026-02-23 13:50+09'),
  -- 小林誠の症例ディスカッション
  ('c0000003-0000-0000-0000-000000000001', 'eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbb3333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '小林さんの右眼に新規出血所見を確認。糖尿病性網膜症の進行が疑われます。', '2026-02-26 08:45+09')
ON CONFLICT DO NOTHING;

--
-- =====================================================================
-- ACCOUNTING & BILLING MOCK DATA
-- =====================================================================

INSERT INTO billing_plans (id, organization_id, name, base_price, volume_tiers_json, is_active) VALUES
  ('acc11111-acc1-acc1-acc1-acc111111111', '11111111-1111-1111-1111-111111111111', 'Enterprise Hybrid', 50000.00, '[{"maxReadings": 100, "price": 0}, {"maxReadings": null, "price": 1500}]', true),
  ('acc22222-acc2-acc2-acc2-acc222222222', '22222222-2222-2222-2222-222222222222', 'Pay As You Go', 0.00, '[{"maxReadings": null, "price": 2000}]', true),
  ('acc33333-acc3-acc3-acc3-acc333333333', '33333333-3333-3333-3333-333333333333', 'Premium Sub', 150000.00, '[{"maxReadings": null, "price": 0}]', true)
ON CONFLICT DO NOTHING;

INSERT INTO physician_payout_tiers (id, physician_id, base_rate, urgent_rate_modifier, penalty_rate_modifier, is_active) VALUES
  ('71e11111-71e1-71e1-71e1-71e111111111', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 800.00, 200.00, 0.00, true),
  ('71e22222-71e2-71e2-71e2-71e222222222', 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1000.00, 250.00, 0.00, true)
ON CONFLICT DO NOTHING;

INSERT INTO invoices (id, organization_id, billing_month, base_amount, tax_amount, total_amount, status) VALUES
  ('117c1111-117c-117c-117c-117c11111111', '11111111-1111-1111-1111-111111111111', '2025-01', 117500.00, 11750.00, 129250.00, 'paid'),
  ('117c2222-117c-117c-117c-117c22222222', '11111111-1111-1111-1111-111111111111', '2025-02', 68000.00, 6800.00, 74800.00, 'draft'),
  ('117c3333-117c-117c-117c-117c33333333', '22222222-2222-2222-2222-222222222222', '2025-02', 60000.00, 6000.00, 66000.00, 'issued')
ON CONFLICT DO NOTHING;

INSERT INTO physician_payments (id, physician_id, payment_month, base_amount, tax_amount, total_amount, status) VALUES
  ('ba171111-ba17-ba17-ba17-ba1711111111', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-01', 35000.00, 0.00, 35000.00, 'paid'),
  ('ba172222-ba17-ba17-ba17-ba1722222222', 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-02', 15400.00, 0.00, 15400.00, 'pending'),
  ('ba173333-ba17-ba17-ba17-ba1733333333', 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-02', 94500.00, 0.00, 94500.00, 'pending')
ON CONFLICT DO NOTHING;
