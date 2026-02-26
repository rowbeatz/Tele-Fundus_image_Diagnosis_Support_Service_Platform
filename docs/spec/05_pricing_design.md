# 料金テーブル設計書

## 1. 依頼元請求ルール
### 判定キー
- organization_id
- contract_term(valid_from/to)
- service_type
- diagnosis_type
- monthly_volume_band
- urgent_flag
- reread_flag

### 計算式
- 基本: `base = unit_price * quantity`
- 加算: `surcharge = urgent_surcharge + reread_surcharge + special_surcharge`
- 小計: `subtotal = base + surcharge + fixed_monthly_fee + option_fee`
- 下限保証: `subtotal = max(subtotal, minimum_monthly_fee)`
- 税: `tax = round(subtotal * tax_rate, rounding_rule)`
- 合計: `total = subtotal + tax`

## 2. 医師支払ルール
### 判定キー
- physician_user_id
- organization_id
- case_type
- difficulty
- monthly_volume_band
- urgent_flag
- reread_flag

### 計算式
- `base = unit_fee * quantity`
- `addon = urgent_addon + difficulty_addon + volume_incentive`
- `reread_adjustment = base * reread_ratio`
- `subtotal = base + addon + reread_adjustment`
- `tax = withholding_or_tax_rule`
- `total = subtotal - withholding`

## 3. 締め・再計算ルール
- 月次締め: `closing_month` 単位で集計
- 締め後修正: 再計算ジョブで差額明細を追加
- キャンセル: マイナス明細を発行して相殺
- 返金/再請求: 相殺明細と再請求明細を分離

## 4. 監査要件
- 計算時に `rule_snapshot_json` を明細へ保持
- レート・丸め・税率・数量ソースを明示
- 再計算前後差分を audit_logs へ保存
