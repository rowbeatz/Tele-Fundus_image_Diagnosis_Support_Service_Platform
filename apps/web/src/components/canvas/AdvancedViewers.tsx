import { Maximize, Layers } from 'lucide-react'

interface PlaceholderProps {
    title: string
    description: string
    lang: string
    icon: React.ReactNode
}

function AdvancedPlaceholder({ title, description, lang, icon }: PlaceholderProps) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', width: '100%', background: 'var(--bg-card)', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', color: 'var(--text-muted)'
        }}>
            <div style={{ opacity: 0.5, marginBottom: 16, transform: 'scale(1.5)' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', maxWidth: 300, textAlign: 'center' }}>
                {description}
            </p>
            <div style={{ marginTop: 24, padding: '6px 16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius)', fontSize: '0.75rem', fontWeight: 600 }}>
                {lang === 'ja' ? '高機能オプション（開発中）' : 'Advanced Feature (In Development)'}
            </div>
        </div>
    )
}

export function EnFaceViewer({ lang }: { lang: string }) {
    return (
        <AdvancedPlaceholder
            lang={lang}
            title={lang === 'ja' ? '3D / En-Face ビューア' : '3D / En-Face Viewer'}
            description={lang === 'ja' ? 'OCTボリュームデータから生成された3DレンダリングおよびEn-Face画像を表示します。' : 'Displays 3D renderings and En-Face images generated from OCT volume data.'}
            icon={<Layers size={48} />}
        />
    )
}

export function OCTAViewer({ lang }: { lang: string }) {
    return (
        <AdvancedPlaceholder
            lang={lang}
            title={lang === 'ja' ? 'OCTA 血管強調ビューア' : 'OCTA Angiography Viewer'}
            description={lang === 'ja' ? '網膜血流を強調表示し、無血管野や新生血管をシミュレーションします。' : 'Highlights retinal blood flow and simulates avascular zones or neovascularization.'}
            icon={<Maximize size={48} />}
        />
    )
}
