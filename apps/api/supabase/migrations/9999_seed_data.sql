-- Seed initial data for Tele-Fundus Platform
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
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PHY-001', 'Dr. 田中 康夫', 'dr.tanaka@telefundus.jp', '眼底読影 / 糖尿病網膜症', 30, 'active'),
  ('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PHY-002', 'Dr. 佐藤 恵理子', 'dr.sato@telefundus.jp', '眼底読影 / 緑内障', 25, 'active'),
  ('aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PHY-003', 'Dr. 山本 隆志', 'dr.yamamoto@telefundus.jp', '眼底読影 / 一般', 20, 'active'),
  ('aaaa4444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PHY-004', 'Dr. 渡辺 香織', 'dr.watanabe@telefundus.jp', '眼底読影 / AMD', 28, 'active')
ON CONFLICT DO NOTHING;

-- ═══ Users (demo login accounts) ═══
INSERT INTO users (id, organization_id, physician_id, email, password_hash, full_name, role, is_active)
VALUES
  ('bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, NULL, 'admin@telefundus.jp', '$2b$10$demo', 'System Administrator', 'admin', true),
  ('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, NULL, 'operator@telefundus.jp', '$2b$10$demo', 'オペレーター 山口', 'operator', true),
  ('bbbb3333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.tanaka@telefundus.jp', '$2b$10$demo', 'Dr. 田中 康夫', 'physician', true),
  ('bbbb4444-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', NULL, 'client@sakura-hospital.jp', '$2b$10$demo', '小林 直樹', 'client', true),
  ('bbbb5555-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dr.sato@telefundus.jp', '$2b$10$demo', 'Dr. 佐藤 恵理子', 'physician', true)
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

-- ═══ Images (pointing to demo files in /demo/) ═══
INSERT INTO images (id, screening_id, eye_side, image_type, original_filename, storage_key, mime_type, file_size_bytes, is_primary)
VALUES
  ('ffff1111-ffff-ffff-ffff-ffffffffffff', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_01.png', 'demo/fundus_right_01.png', 'image/png', 245000, true),
  ('ffff2222-ffff-ffff-ffff-ffffffffffff', 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_01.png', 'demo/fundus_left_01.png', 'image/png', 238000, false),
  ('ffff3333-ffff-ffff-ffff-ffffffffffff', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'right', 'fundus_color', 'fundus_right_02.png', 'demo/fundus_right_02.png', 'image/png', 252000, true),
  ('ffff4444-ffff-ffff-ffff-ffffffffffff', 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', 'left', 'fundus_color', 'fundus_left_02.png', 'demo/fundus_left_02.png', 'image/png', 241000, false)
ON CONFLICT DO NOTHING;
