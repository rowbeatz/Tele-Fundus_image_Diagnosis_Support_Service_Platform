import type { TranslationKey } from './en'

export const ja: Record<TranslationKey, string> = {
    // Global
    'app.name': 'テレファンダス',
    'app.tagline': '遠隔眼底画像診断支援プラットフォーム',
    'app.version': 'v0.1.0 エンタープライズ',
    'app.secure': 'HIPAA準拠 セキュア医療プラットフォーム',

    // Auth
    'auth.title': 'サインイン',
    'auth.subtitle': 'アカウントにログインしてください',
    'auth.email': 'メールアドレス',
    'auth.email.placeholder': 'your@hospital.jp',
    'auth.password': 'パスワード',
    'auth.password.placeholder': '••••••••',
    'auth.forgot': 'パスワードをお忘れですか？',
    'auth.signin': 'サインイン',
    'auth.signing_in': 'サインイン中…',
    'auth.error.invalid': 'メールアドレスまたはパスワードが正しくありません',
    'auth.demo.title': 'デモアカウント',
    'auth.demo.admin': '管理者: admin@telefundus.jp',
    'auth.demo.operator': 'オペレーター: operator@telefundus.jp',
    'auth.demo.physician': '読影医: dr.tanaka@telefundus.jp',
    'auth.demo.client': 'クライアント: client@sakura-hospital.jp',
    'auth.signout': 'サインアウト',

    // Hero
    'hero.title': '次世代\n眼底画像診断',
    'hero.subtitle': 'AI搭載の網膜画像解析が、安全なHIPAA準拠の遠隔医療ワークフローで眼科医を支援します。',
    'hero.stat1.value': '50,000+',
    'hero.stat1.label': '解析済み画像',
    'hero.stat2.value': '99.2%',
    'hero.stat2.label': '精度',
    'hero.stat3.value': '< 24時間',
    'hero.stat3.label': '平均所要時間',

    // Nav
    'nav.dashboard': 'ダッシュボード',
    'nav.patients': '患者一覧',
    'nav.uploads': '画像アップロード',
    'nav.readings': '読影一覧',
    'nav.tasks': 'タスクボード',
    'nav.qc': '品質管理',
    'nav.organizations': '医療機関管理',
    'nav.billing': '請求・決済',
    'nav.settings': '設定',
    'nav.viewer': '診断ビューワ',

    // Dashboard
    'dashboard.title': 'ダッシュボード',
    'dashboard.welcome': 'おかえりなさい',
    'dashboard.stat.screenings': '総スクリーニング数',
    'dashboard.stat.pending': 'レビュー待ち',
    'dashboard.stat.completed': '本日完了',
    'dashboard.stat.physicians': '稼働中の読影医',
    'dashboard.recent': '最近のスクリーニング',
    'dashboard.quick_actions': 'クイックアクション',
    'dashboard.view_all': 'すべて表示',

    // Task Board
    'taskboard.title': 'オペレータータスクボード',
    'taskboard.auto_assign': '自動割り当て',
    'taskboard.col.unassigned': '未割当',
    'taskboard.col.reading': '読影中',
    'taskboard.col.qc_review': 'QCレビュー',
    'taskboard.assign': '割り当て',
    'taskboard.review': 'レビュー',
    'taskboard.approve': '承認',
    'taskboard.drop_here': 'ここにドロップ',

    // Uploads
    'uploads.title': '新規スクリーニング登録',
    'uploads.examinee': '受診者情報',
    'uploads.id': '受診者ID / カルテ番号',
    'uploads.name': '氏名',
    'uploads.systolic': '収縮期血圧',
    'uploads.diastolic': '拡張期血圧',
    'uploads.images': '眼底画像',
    'uploads.drop': 'クリックしてアップロード',
    'uploads.drop_hint': 'またはドラッグ＆ドロップ',
    'uploads.format': 'JPEG, PNG（各10MBまで）',
    'uploads.submit': 'スクリーニング送信',
    'uploads.uploading': 'アップロード中…',

    // Billing
    'billing.title': '財務ダッシュボード',
    'billing.run_month': '月末処理実行',
    'billing.processing': '処理中…',
    'billing.total_billed': '請求総額',
    'billing.total_paid': '支払総額',
    'billing.gross_margin': '粗利益',
    'billing.margin_pct': '利益率',
    'billing.recent': '最近のアクティビティ',

    // Viewer
    'viewer.brightness': '明るさ',
    'viewer.contrast': 'コントラスト',
    'viewer.invert': '色反転',
    'viewer.reset': 'フィルターリセット',
    'viewer.adjustments': '画像調整',
    'viewer.findings': '所見 / アノテーション',
    'viewer.findings_placeholder': '診断所見を入力してください…',
    'viewer.discuss': 'ケースディスカッション',
    'viewer.prev': '前へ',
    'viewer.next': '次へ',
    'viewer.submit': '読影結果送信',
    'viewer.submitting': '送信中…',
    'viewer.hint': 'スクロールでズーム・ドラッグで移動・スペースで反転',

    // Table
    'table.patient': '患者名',
    'table.status': 'ステータス',
    'table.date': '日付',
    'table.physician': '読影医',
    'table.organization': '医療機関',
    'table.action': '操作',
    'table.view': '表示',

    // Status
    'status.submitted': '提出済',
    'status.reading_assigned': '読影割当済',
    'status.in_reading': '読影中',
    'status.qc_review': 'QCレビュー',
    'status.completed': '完了',
    'status.draft': '下書き',

    // Language
    'lang.en': 'EN',
    'lang.ja': 'JP',
}
