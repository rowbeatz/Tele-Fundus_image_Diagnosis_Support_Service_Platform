export const en = {
    // Global
    'app.name': 'Tele-Fundus',
    'app.tagline': 'Remote Fundus Image Diagnosis Support Platform',
    'app.version': 'v0.1.0 Enterprise',
    'app.secure': 'HIPAA-Compliant Secure Medical Platform',

    // Auth
    'auth.title': 'Sign In',
    'auth.subtitle': 'Enter your credentials to access the platform',
    'auth.email': 'Email Address',
    'auth.email.placeholder': 'your@hospital.jp',
    'auth.password': 'Password',
    'auth.password.placeholder': '••••••••',
    'auth.forgot': 'Forgot password?',
    'auth.signin': 'Sign In',
    'auth.signing_in': 'Signing in…',
    'auth.error.invalid': 'Invalid email or password',
    'auth.demo.title': 'Demo Accounts',
    'auth.demo.admin': 'Admin: admin@telefundus.jp',
    'auth.demo.operator': 'Operator: operator@telefundus.jp',
    'auth.demo.physician': 'Physician: dr.tanaka@telefundus.jp',
    'auth.demo.client': 'Client: client@sakura-hospital.jp',
    'auth.signout': 'Sign Out',

    // Hero
    'hero.title': 'Next-Generation\nFundus Diagnosis',
    'hero.subtitle': 'AI-powered retinal image analysis supporting ophthalmologists with secure, HIPAA-compliant telemedicine workflows.',
    'hero.stat1.value': '50,000+',
    'hero.stat1.label': 'Images Analyzed',
    'hero.stat2.value': '99.2%',
    'hero.stat2.label': 'Accuracy Rate',
    'hero.stat3.value': '< 24h',
    'hero.stat3.label': 'Avg. Turnaround',

    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.patients': 'Patients',
    'nav.uploads': 'Upload Images',
    'nav.readings': 'My Readings',
    'nav.tasks': 'Task Board',
    'nav.qc': 'Quality Control',
    'nav.organizations': 'Organizations',
    'nav.billing': 'Billing & Payments',
    'nav.settings': 'Settings',
    'nav.viewer': 'Diagnostic Viewer',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.stat.screenings': 'Total Screenings',
    'dashboard.stat.pending': 'Pending Review',
    'dashboard.stat.completed': 'Completed Today',
    'dashboard.stat.physicians': 'Active Physicians',
    'dashboard.recent': 'Recent Screenings',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.view_all': 'View All',

    // Task Board
    'taskboard.title': 'Operator Task Board',
    'taskboard.auto_assign': 'Auto-Assign',
    'taskboard.col.unassigned': 'To Assign',
    'taskboard.col.reading': 'In Reading',
    'taskboard.col.qc_review': 'QC Review',
    'taskboard.assign': 'Assign',
    'taskboard.review': 'Review',
    'taskboard.approve': 'Approve',
    'taskboard.drop_here': 'Drop items here',

    // Uploads
    'uploads.title': 'New Screening Registration',
    'uploads.examinee': 'Examinee Details',
    'uploads.id': 'Examinee ID / Chart No.',
    'uploads.name': 'Full Name',
    'uploads.systolic': 'Systolic BP',
    'uploads.diastolic': 'Diastolic BP',
    'uploads.images': 'Fundus Images',
    'uploads.drop': 'Click to upload',
    'uploads.drop_hint': 'or drag and drop',
    'uploads.format': 'JPEG, PNG up to 10MB each',
    'uploads.submit': 'Submit Screening',
    'uploads.uploading': 'Uploading…',

    // Billing
    'billing.title': 'Financial Dashboard',
    'billing.run_month': 'Run Month-End',
    'billing.processing': 'Processing…',
    'billing.total_billed': 'Total Billed',
    'billing.total_paid': 'Total Paid',
    'billing.gross_margin': 'Gross Margin',
    'billing.margin_pct': 'Margin %',
    'billing.recent': 'Recent Activity',

    // Viewer
    'viewer.brightness': 'Brightness',
    'viewer.contrast': 'Contrast',
    'viewer.invert': 'Invert Colors',
    'viewer.reset': 'Reset Filters',
    'viewer.adjustments': 'Image Adjustments',
    'viewer.findings': 'Findings / Annotations',
    'viewer.findings_placeholder': 'Enter diagnostic notes here…',
    'viewer.discuss': 'Open Case Discussion',
    'viewer.prev': 'Previous',
    'viewer.next': 'Next',
    'viewer.submit': 'Submit Reading',
    'viewer.submitting': 'Submitting…',
    'viewer.hint': 'Scroll to zoom • Drag to pan • Space to invert',

    // Table
    'table.patient': 'Patient',
    'table.status': 'Status',
    'table.date': 'Date',
    'table.physician': 'Physician',
    'table.organization': 'Organization',
    'table.action': 'Action',
    'table.view': 'View',

    // Status
    'status.submitted': 'Submitted',
    'status.reading_assigned': 'Reading Assigned',
    'status.in_reading': 'In Reading',
    'status.qc_review': 'QC Review',
    'status.completed': 'Completed',
    'status.draft': 'Draft',

    // Language
    'lang.en': 'EN',
    'lang.ja': 'JP',
} as const

export type TranslationKey = keyof typeof en
