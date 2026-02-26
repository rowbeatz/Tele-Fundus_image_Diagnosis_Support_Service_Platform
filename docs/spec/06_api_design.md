# API設計（MVP）

## 1. 認証
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`

## 2. 依頼受付
- `POST /client-orders`
- `GET /client-orders`
- `GET /client-orders/{id}`
- `POST /client-orders/{id}/examinees`
- `POST /imports/screenings/csv`

## 3. 画像
- `POST /uploads/presign`
- `POST /screenings/{id}/images`
- `GET /screenings/{id}/images`

## 4. 受付・割当・読影
- `POST /ops/screenings/{id}/reception-check`
- `POST /ops/screenings/{id}/assignments`
- `GET /physician/assignments`
- `POST /physician/assignments/{id}/readings/draft`
- `POST /physician/assignments/{id}/readings/submit`

## 5. QC・納品
- `POST /ops/readings/{id}/review`
- `POST /ops/deliveries`
- `GET /deliveries/{id}/pdf`

## 6. 会計
- `POST /accounting/invoices/generate`
- `GET /accounting/invoices`
- `POST /accounting/physician-payments/generate`
- `GET /accounting/physician-payments`

## 7. 監査
- `GET /audit-logs`

## 8. レスポンス原則
- 一覧APIは軽量DTO（必要最小限）
- 詳細APIはセクション分割（lazy load）
- エラー形式統一: `{ code, message, details? }`
