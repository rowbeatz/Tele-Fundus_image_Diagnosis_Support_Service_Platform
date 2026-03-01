import { useState } from 'react'
import { Settings, Bell, Shield, Database, Globe, Palette, Save, ToggleLeft, ToggleRight, Monitor, Moon, Sun } from 'lucide-react'

interface SettingSection {
    id: string
    icon: any
    labelJa: string
    labelEn: string
}

const sections: SettingSection[] = [
    { id: 'general', icon: Settings, labelJa: '一般設定', labelEn: 'General' },
    { id: 'notifications', icon: Bell, labelJa: '通知設定', labelEn: 'Notifications' },
    { id: 'security', icon: Shield, labelJa: 'セキュリティ', labelEn: 'Security' },
    { id: 'data', icon: Database, labelJa: 'データ管理', labelEn: 'Data Management' },
    { id: 'display', icon: Monitor, labelJa: '表示設定', labelEn: 'Display' },
]

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: value ? 'var(--primary)' : 'var(--border)',
                position: 'relative', transition: 'background 0.2s',
            }}
        >
            <div style={{
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 2,
                left: value ? 22 : 2,
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </button>
    )
}

export default function PlatformSettings() {
    const lang = (localStorage.getItem('lang') || 'ja')
    const [activeSection, setActiveSection] = useState('general')
    const [settings, setSettings] = useState({
        sessionTimeout: 30,
        autoAssign: true,
        notifyOnSubmission: true,
        notifyOnQC: true,
        notifyOnUrgent: true,
        twoFactorRequired: false,
        ipWhitelisting: false,
        auditLogRetention: 365,
        imageRetention: 2555,
        autoBackup: true,
        timezone: 'Asia/Tokyo',
        dateFormat: 'YYYY-MM-DD',
        defaultViewerLayout: '1x1',
        darkMode: true,
    })

    const update = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{lang === 'ja' ? 'プラットフォーム設定' : 'Platform Settings'}</h1>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                        {lang === 'ja' ? 'システム全体の設定を管理します' : 'Manage system-wide configuration'}
                    </p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Save style={{ width: 16, height: 16 }} />
                    {lang === 'ja' ? '保存' : 'Save Changes'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
                {/* Sidebar */}
                <div className="panel" style={{ width: 220, minWidth: 220, padding: '8px 0', flexShrink: 0, alignSelf: 'flex-start' }}>
                    {sections.map(s => {
                        const Icon = s.icon
                        return (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 16px', border: 'none', cursor: 'pointer',
                                    background: activeSection === s.id ? 'rgba(var(--primary-rgb, 13,148,136), 0.1)' : 'transparent',
                                    color: activeSection === s.id ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: activeSection === s.id ? 600 : 400,
                                    fontSize: '0.85rem', textAlign: 'left', transition: 'all 0.15s',
                                    borderLeft: activeSection === s.id ? '3px solid var(--primary)' : '3px solid transparent',
                                }}
                            >
                                <Icon style={{ width: 16, height: 16 }} />
                                {lang === 'ja' ? s.labelJa : s.labelEn}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    {activeSection === 'general' && (
                        <div className="panel" style={{ padding: 24 }}>
                            <h3 style={{ margin: '0 0 20px 0' }}>{lang === 'ja' ? '一般設定' : 'General Settings'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? 'セッションタイムアウト' : 'Session Timeout'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '非アクティブ時の自動ログアウト時間（分）' : 'Auto-logout after inactivity (minutes)'}</div>
                                    </div>
                                    <input type="number" value={settings.sessionTimeout} onChange={e => update('sessionTimeout', Number(e.target.value))}
                                        style={{ width: 80, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-main)', color: 'var(--text-primary)', textAlign: 'center' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? '自動アサイン' : 'Auto-Assign Readings'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '新規スクリーニングを自動的に読影医に割り当て' : 'Automatically assign new screenings to physicians'}</div>
                                    </div>
                                    <Toggle value={settings.autoAssign} onChange={v => update('autoAssign', v)} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? 'タイムゾーン' : 'Timezone'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? 'システムのデフォルトタイムゾーン' : 'Default system timezone'}</div>
                                    </div>
                                    <select value={settings.timezone} onChange={e => update('timezone', e.target.value)}
                                        style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America/New_York (EST)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="panel" style={{ padding: 24 }}>
                            <h3 style={{ margin: '0 0 20px 0' }}>{lang === 'ja' ? '通知設定' : 'Notification Settings'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? '提出時に通知' : 'Notify on Submission'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '新しいスクリーニングが提出されたとき' : 'When a new screening is submitted'}</div>
                                    </div>
                                    <Toggle value={settings.notifyOnSubmission} onChange={v => update('notifyOnSubmission', v)} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? 'QCレビュー通知' : 'Notify on QC Review'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? 'QCレビューが必要な読影があるとき' : 'When readings require QC review'}</div>
                                    </div>
                                    <Toggle value={settings.notifyOnQC} onChange={v => update('notifyOnQC', v)} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? '緊急症例通知' : 'Urgent Case Alerts'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '緊急フラグ付きの症例がアサインされたとき' : 'When urgent-flagged cases are assigned'}</div>
                                    </div>
                                    <Toggle value={settings.notifyOnUrgent} onChange={v => update('notifyOnUrgent', v)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="panel" style={{ padding: 24 }}>
                            <h3 style={{ margin: '0 0 20px 0' }}>{lang === 'ja' ? 'セキュリティ' : 'Security'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? '二要素認証' : 'Two-Factor Authentication'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? 'すべてのユーザーに二要素認証を要求' : 'Require 2FA for all users'}</div>
                                    </div>
                                    <Toggle value={settings.twoFactorRequired} onChange={v => update('twoFactorRequired', v)} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? 'IPホワイトリスト' : 'IP Whitelisting'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '許可されたIPアドレスからのみアクセスを許可' : 'Allow access only from approved IPs'}</div>
                                    </div>
                                    <Toggle value={settings.ipWhitelisting} onChange={v => update('ipWhitelisting', v)} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? '監査ログ保持期間' : 'Audit Log Retention'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '監査ログの保持日数' : 'Days to retain audit logs'}</div>
                                    </div>
                                    <input type="number" value={settings.auditLogRetention} onChange={e => update('auditLogRetention', Number(e.target.value))}
                                        style={{ width: 80, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-main)', color: 'var(--text-primary)', textAlign: 'center' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'data' && (
                        <div className="panel" style={{ padding: 24 }}>
                            <h3 style={{ margin: '0 0 20px 0' }}>{lang === 'ja' ? 'データ管理' : 'Data Management'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? '画像保持期間' : 'Image Retention'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? 'アップロードされた画像の保持日数' : 'Days to retain uploaded images'}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <input type="number" value={settings.imageRetention} onChange={e => update('imageRetention', Number(e.target.value))}
                                            style={{ width: 80, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-main)', color: 'var(--text-primary)', textAlign: 'center' }} />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '日' : 'days'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? '自動バックアップ' : 'Auto Backup'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '毎日自動バックアップを実行' : 'Run daily automated backups'}</div>
                                    </div>
                                    <Toggle value={settings.autoBackup} onChange={v => update('autoBackup', v)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'display' && (
                        <div className="panel" style={{ padding: 24 }}>
                            <h3 style={{ margin: '0 0 20px 0' }}>{lang === 'ja' ? '表示設定' : 'Display Settings'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? 'デフォルトビューアレイアウト' : 'Default Viewer Layout'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? 'ビューアの初期レイアウト' : 'Initial viewer layout'}</div>
                                    </div>
                                    <select value={settings.defaultViewerLayout} onChange={e => update('defaultViewerLayout', e.target.value)}
                                        style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                        <option value="1x1">1×1</option>
                                        <option value="1x2">1×2</option>
                                        <option value="2x2">2×2</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{lang === 'ja' ? '日付フォーマット' : 'Date Format'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '日付の表示形式' : 'Date display format'}</div>
                                    </div>
                                    <select value={settings.dateFormat} onChange={e => update('dateFormat', e.target.value)}
                                        style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
