# 遠隔眼底画像診断支援サービス・統合プラットフォーム
**Tele-Fundus Image Diagnosis Support Service Platform**

このREADMEは、本リポジトリを**単独で復元・運用・拡張できるレベル**の統合仕様書です。  
対象読者は、開発者・運用担当・インフラ担当・プロダクト責任者を想定しています。

---

## 0. このシステムの役割（何を担うか）

本アプリケーションは、眼底画像診断業務の以下を**単一プラットフォームで一気通貫**に担います。

1. 依頼元（健診センター/病院）からの症例登録
2. 受診者情報・問診情報・画像ファイルの管理
3. オペレーターによる受付・割当・進捗監視
4. 読影医による読影・所見作成・提出
5. QC（品質確認）と差し戻し/確定
6. 請求（依頼元向け）と支払（読影医向け）の会計処理
7. 症例に紐づくコミュニケーション（チャット/症例ディスカッション）

このため、単なる画像ビューアではなく、**業務ワークフロー + 医療データ管理 + 会計管理**を統合した基幹アプリです。

---

## 1. リポジトリ構成

```text
.
├─ apps/
│  ├─ api/                  # Hono + TypeScript API
│  │  ├─ src/
│  │  │  ├─ routes/         # 画面/機能別API
│  │  │  ├─ repositories/   # DBアクセス層
│  │  │  ├─ middleware/     # 認証・監査・セキュリティ
│  │  │  └─ lib/            # DB, 認証, ストレージ等の共通処理
│  │  └─ supabase/migrations/
│  │                         # PostgreSQLマイグレーションとシード
│  └─ web/                  # React + Vite フロントエンド
│     └─ src/
│        ├─ pages/          # 画面単位UI
│        ├─ components/     # 再利用UI/業務コンポーネント
│        ├─ contexts/       # 認証/設定コンテキスト
│        └─ lib/            # APIクライアント
├─ docs/spec/               # 要件・業務フロー・画面遷移・ERなどの仕様群
├─ docker-compose.yml       # db/api/web の起動定義
└─ Dockerfile.api           # APIコンテナ定義
```

---

## 2. 技術スタック（実装実態）

### Backend
- **Node.js + TypeScript**
- **Hono**（ルーティング/HTTP層）
- **pg（PostgreSQL driver）**
- **AWS SDK（S3 Presigned URL）**

### Frontend
- **React + Vite + TypeScript**
- **Tailwind CSSベースのスタイル運用**
- 一部UIで診断ビューア/チャット/業務パネルを提供

### Infrastructure
- **PostgreSQL 15**（docker-composeで起動）
- **Docker Compose**（db/api/web）
- オブジェクトストレージはS3互換を想定

---

## 3. ドメインモデル（業務エンティティ全体像）

以下が中核のデータモデルです。

### 3.1 マスタ系
- `organizations`：依頼元施設
- `physicians`：読影医
- `users`：ログインユーザー（admin/operator/physician/client）

### 3.2 臨床系
- `examinees`：受診者
- `client_orders`：依頼バッチ（施設単位）
- `screenings`：症例本体（問診・バイタル等を内包）
- `images`：症例に紐づく眼底画像

### 3.3 ワークフロー系
- `assignments`：症例の読影割当
- `readings`：読影レコード
- `reading_reports`：構造化所見レポート
- `reading_reviews`：QC履歴

### 3.4 会計系
- `billing_plans`：依頼元課金プラン
- `physician_payout_tiers`：医師支払単価
- `invoices` / `physician_payments`：請求・支払確定データ

### 3.5 コミュニケーション系
- `communication_threads`：症例スレッド
- `messages`：スレッドメッセージ
- `thread_participants`：参加者
- `case_discussions`：症例ディスカッションメッセージ

### 3.6 権限・監査系
- `roles`, `permissions`, `role_permissions`, `user_roles`
- `audit_logs`

---

## 4. 症例中心のデータ接続（ID連携ルール）

このシステムの整合性の中心は**screening_id（症例ID）**です。

### 基本の接続チェーン
`organization -> client_order -> screening -> image/assignment/reading -> reading_report/review`

### コミュニケーション接続
- `communication_threads.screening_id` によりスレッドは症例へ紐づく
- `messages.thread_id` で会話が症例スレッドへ紐づく
- `case_discussions.screening_id` で症例直結の議論ログを保持

### 重要制約
- スレッドは症例ごとに一意（1症例1スレッド）
- 症例アクセス権のないユーザーは、該当症例のチャット/ディスカッションにアクセス不可
- メッセージは空データ禁止（本文/音声URL/アノテーションのいずれか必須）

---

## 5. DB仕様（復元可能な粒度）

## 5.1 マイグレーション適用順
`apps/api/supabase/migrations` を順番に適用します。

1. `0000_base_schema.sql`（基本スキーマ）
2. `0012_add_audit_logs.sql`
3. `0013_communication_tables.sql`
4. `0014_permissions_system.sql`
5. `0015_clinical_data.sql`
6. `0016_case_discussions.sql`
7. `0017_communication_integrity.sql`
8. `9999_seed_data.sql`（初期データ）

> docker-composeでは `db` サービスの `docker-entrypoint-initdb.d` にマウントされ、初回起動時に実行されます。

## 5.2 データベースエンジン
- PostgreSQL 15
- UUID主キー中心
- JSONBで問診・所見・アノテーション等を表現

## 5.3 代表テーブル仕様（要点）

### screenings（症例）
- 主キー: `id UUID`
- 外部キー:
  - `client_order_id -> client_orders.id`
  - `examinee_id -> examinees.id`
- 主データ:
  - `screening_date`, `urgency_flag`, `status`
  - `blood_pressure_*`, `has_diabetes`, `smoking_status`
  - `chief_complaint`, `symptoms_json`, `ophthalmic_exam_json`

### images（画像）
- 主キー: `id UUID`
- 外部キー: `screening_id -> screenings.id`
- 主データ:
  - `eye_side`, `image_type`, `storage_key`, `sha256_hash`
  - `annotations_json`

### readings（読影）
- 主キー: `id UUID`
- 外部キー:
  - `screening_id -> screenings.id`
  - `assignment_id -> assignments.id`
  - `physician_id -> physicians.id`
- 主データ: `status`, `finding_text`, `judgment_code`

### reading_reports（構造化レポート）
- 主キー: `id UUID`
- 外部キー:
  - `reading_id -> readings.id`
  - `screening_id -> screenings.id`
  - `physician_id -> physicians.id`
- 主データ:
  - `findings_right_json`, `findings_left_json`
  - `judgment_code`, `referral_required`, `report_text`

### communication_threads / messages
- `communication_threads.screening_id` が症例への参照軸
- `messages.thread_id` で会話をスレッドへ紐づけ
- 1症例1スレッド、メッセージ実体必須制約あり

---

## 6. API責務（主要エンドポイント群）

> 詳細は `apps/api/src/routes` 配下の実装に準拠します。

- `auth`：ログイン/セッション
- `screenings`：症例作成/一覧/更新
- `images`, `uploads`：画像登録と保存連携
- `viewer-data`：診断ビューア向け統合データ
- `reading-reports`：所見保存・提出
- `ops-*`：運用者向け管理
- `accounting`：請求/支払集計
- `communication`：症例チャットスレッド
- `case-discussions`：症例コメント時系列

### viewer-data の設計思想
診断画面に必要なもの（症例・患者・画像URL・読影・既存レポート）を単一APIで取得し、GUIのID取り違えを防止します。

---

## 7. フロントエンド機能責務

### 依頼元ポータル
- 受診者登録
- 症例登録
- 画像アップロード
- 結果閲覧

### 読影ビューア
- 症例情報パネル
- 画像表示（左右眼/比較）
- 所見入力
- 症例チャット/症例ディスカッション

### 運用管理
- タスクボード
- 品質管理（QC）
- 組織管理/権限管理
- 請求・支払ダッシュボード

---

## 8. ローカル環境復元手順（最短）

## 8.1 前提
- Docker / Docker Compose が利用可能
- 5432, 3000, 5173 ポートが空いていること

## 8.2 起動
```bash
docker compose up --build
```

起動後:
- DB: `localhost:5432`
- API: `localhost:3000`
- Web: `localhost:5173`

## 8.3 初期データ
初回DB作成時に migration + seed が流れるため、デモアカウント/症例が投入されます。

---

## 9. 環境変数（代表）

API側で主に以下を利用します。

- `DATABASE_URL`（必須）
- `NODE_ENV`
- `AWS_REGION`
- S3接続に必要な各種資格情報（運用環境で設定）

Compose開発では `DATABASE_URL=postgres://postgres:postgres@db:5432/tfp` を使用します。

---

## 10. セキュリティ/整合性の設計原則

1. **症例中心アクセス制御**
   - admin/operator/client/physician の役割に応じて `screening` へのアクセスを制限
2. **DB外部キーによる参照保全**
   - 症例削除時に関連データをカスケードする箇所を明示
3. **監査ログ**
   - 主要操作は監査可能な形で保存
4. **メッセージ整合性**
   - 空メッセージの禁止
   - 症例スレッド重複防止（1症例1スレッド）

---

## 11. 運用ガイド（本番想定）

### バックアップ
- PostgreSQLの定期ダンプ
- 画像S3バケットのライフサイクルとバージョニング

### 障害復旧
1. DBをバックアップから復元
2. APIを再起動
3. 必要に応じて画像キー整合性をチェック

### 監視
- APIエラーレート
- DB接続数・スロークエリ
- 画像アップロード失敗率
- 読影完了までのリードタイム

---

## 12. 仕様変更時の更新ルール

以下を**同時更新**してください。

- README（この統合仕様書）
- `docs/spec/*` の該当資料
- API実装 (`apps/api/src/routes`, `repositories`)
- DBマイグレーション (`apps/api/supabase/migrations`)
- フロント表示/入力制約 (`apps/web/src`)

これにより、ドキュメントと実装の乖離を防ぎます。

---

## 13. 将来拡張（設計余地）

- WebRTC本実装による症例連動ビデオ会議
- AI補助読影（所見提案/アノテーション支援）
- ベクトル検索による類似症例参照
- FHIR連携の強化
- 会計ロジックのルールエンジン化

---

## 14. 補足

本READMEは「全体像の復元性」を重視して記述しています。  
画面遷移・ER・業務フローの図表が必要な場合は `docs/spec` 配下を一次参照とし、最終的な実装挙動は `apps/api`, `apps/web` のコードを正としてください。
