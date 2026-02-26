# ER図レベルのテーブル定義（PostgreSQL想定）

## 1. エンティティ一覧
- organizations
- users
- roles
- contracts
- pricing_tables_client
- pricing_tables_physician
- client_orders
- examinees
- screenings
- images
- image_files
- assignments
- readings
- reading_reviews
- deliveries
- invoices
- invoice_lines
- physician_payments
- physician_payment_lines
- notifications
- audit_logs

## 2. 主要カラム定義（抜粋）

### organizations
- id (uuid, pk)
- code (text, unique)
- name (text)
- type (text) -- health_check_center/clinic/etc
- is_active (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)

### users
- id (uuid, pk)
- organization_id (uuid, fk organizations.id, null可)
- role_id (uuid, fk roles.id)
- email (text, unique)
- password_hash (text)
- display_name (text)
- is_active (boolean)
- last_login_at (timestamptz)
- created_at / updated_at

### roles
- id (uuid, pk)
- key (text, unique)
- name (text)

### contracts
- id (uuid, pk)
- organization_id (uuid, fk)
- start_date (date)
- end_date (date)
- billing_close_day (int)
- tax_category (text)
- minimum_monthly_fee (numeric(12,2))
- fixed_monthly_fee (numeric(12,2))
- created_at / updated_at

### pricing_tables_client
- id (uuid, pk)
- contract_id (uuid, fk)
- service_type (text)
- diagnosis_type (text)
- volume_from (int)
- volume_to (int)
- urgent_surcharge (numeric(12,2))
- reread_surcharge (numeric(12,2))
- unit_price (numeric(12,2))
- valid_from / valid_to (date)

### pricing_tables_physician
- id (uuid, pk)
- physician_user_id (uuid, fk users.id)
- organization_id (uuid, fk organizations.id)
- case_type (text)
- difficulty (text)
- volume_from / volume_to (int)
- unit_fee (numeric(12,2))
- urgent_addon (numeric(12,2))
- reread_ratio (numeric(5,2))
- valid_from / valid_to (date)

### client_orders
- id (uuid, pk)
- organization_id (uuid, fk)
- order_no (text, unique)
- order_date (date)
- status (text)
- priority (text)
- due_at (timestamptz)
- created_by (uuid, fk users.id)
- created_at / updated_at

### examinees
- id (uuid, pk)
- order_id (uuid, fk client_orders.id)
- external_examinee_id (text)
- anonymized_id (text)
- name (text)
- sex (text)
- birth_date (date)
- age (int)
- blood_pressure_systolic (int)
- blood_pressure_diastolic (int)
- has_diabetes (boolean)
- has_hypertension (boolean)
- has_dyslipidemia (boolean)
- smoking_status (text)
- symptoms (text)
- notes (text)
- created_at / updated_at

### screenings
- id (uuid, pk)
- examinee_id (uuid, fk examinees.id)
- shot_date (date)
- modality (text) -- fundus-color etc
- eye_side (text) -- OD/OS/BOTH
- status (text)
- is_reread (boolean)
- created_at / updated_at

### images
- id (uuid, pk)
- screening_id (uuid, fk screenings.id)
- eye_side (text)
- capture_index (int)
- format (text)
- width (int)
- height (int)
- sha256 (text)
- quality_score (numeric(5,2), null)
- storage_key (text)
- created_at

### image_files
- id (uuid, pk)
- image_id (uuid, fk images.id)
- file_kind (text) -- original/thumbnail/annotated
- storage_key (text)
- bytes (bigint)
- mime_type (text)
- created_at

### assignments
- id (uuid, pk)
- screening_id (uuid, fk screenings.id)
- physician_user_id (uuid, fk users.id)
- assigned_by (uuid, fk users.id)
- assigned_at (timestamptz)
- status (text)
- reassignment_of (uuid, fk assignments.id, null)

### readings
- id (uuid, pk)
- assignment_id (uuid, fk assignments.id)
- clinical_findings (text)
- classification (text)
- recommend_referral (boolean)
- recommend_retest (boolean)
- physician_comment (text)
- submitted_at (timestamptz)
- status (text)

### reading_reviews
- id (uuid, pk)
- reading_id (uuid, fk readings.id)
- reviewed_by (uuid, fk users.id)
- checklist_json (jsonb)
- review_comment (text)
- result (text) -- approved/rework
- reviewed_at (timestamptz)

### deliveries
- id (uuid, pk)
- order_id (uuid, fk client_orders.id)
- delivered_at (timestamptz)
- delivered_by (uuid, fk users.id)
- delivery_status (text)
- pdf_storage_key (text)

### invoices / invoice_lines
- invoices: id, organization_id, closing_month, subtotal, tax, total, status, issued_at
- invoice_lines: id, invoice_id, order_id, screening_id, unit_price, quantity, surcharge, line_total, rule_snapshot_json

### physician_payments / physician_payment_lines
- physician_payments: id, physician_user_id, closing_month, subtotal, tax, total, status, approved_at
- physician_payment_lines: id, payment_id, assignment_id, unit_fee, quantity, addon, line_total, rule_snapshot_json

### notifications
- id (uuid, pk)
- user_id (uuid, fk)
- channel (text)
- subject (text)
- body (text)
- sent_at (timestamptz)
- status (text)

### audit_logs
- id (uuid, pk)
- actor_user_id (uuid, fk users.id, null)
- action (text)
- target_type (text)
- target_id (uuid/text)
- before_json (jsonb)
- after_json (jsonb)
- ip_address (text)
- user_agent (text)
- created_at (timestamptz)

## 3. インデックス方針
- client_orders(organization_id, status, order_date)
- screenings(status, shot_date)
- assignments(physician_user_id, status, assigned_at)
- readings(status, submitted_at)
- invoices(organization_id, closing_month)
- physician_payments(physician_user_id, closing_month)
- images(sha256)
- audit_logs(target_type, target_id, created_at)
