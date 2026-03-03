import React, { useState } from 'react'
import { useTranslation } from '../../lib/i18n'
import { MoreHorizontal, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const initialTasks = [
    { id: 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '鈴木 花子', status: 'unassigned', priority: 'normal', date: '2026-02-20 10:30' },
    { id: 'eeee3333-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '伊藤 美穂', status: 'unassigned', priority: 'high', date: '2026-02-21 14:00' },
    { id: 'eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '山田 美咲', status: 'reading', priority: 'normal', date: '2026-02-23 11:00', physicianName: 'Dr. 田中 康夫' },
    { id: 'eeee6666-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '渡辺 大輔', status: 'reading', priority: 'high', date: '2026-02-24 09:30', physicianName: 'Dr. 佐藤 恵理子' },
    { id: 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '田中 太郎', status: 'qc_review', priority: 'normal', date: '2026-02-20 09:00', physicianName: 'Dr. 田中 康夫' },
]

export default function TaskBoard() {
    const [tasks, setTasks] = useState(initialTasks)
    const navigate = useNavigate()
    const { t } = useTranslation()

    const columns = [
        { id: 'unassigned', titleKey: 'taskboard.col.unassigned' as const },
        { id: 'reading', titleKey: 'taskboard.col.reading' as const },
        { id: 'qc_review', titleKey: 'taskboard.col.qc_review' as const },
    ]

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId)
    }
    const handleDrop = (e: React.DragEvent, statusId: string) => {
        const taskId = e.dataTransfer.getData('taskId')
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: statusId } : task))
    }
    const handleDragOver = (e: React.DragEvent) => e.preventDefault()

    return (
        <div className="space-y-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>{t('taskboard.title')}</h1>
                <button className="btn btn-primary">{t('taskboard.auto_assign')}</button>
            </div>

            <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 180px)' }}>
                {columns.map(col => {
                    const columnTasks = tasks.filter(task => task.status === col.id)
                    return (
                        <div key={col.id} className="kanban-col" style={{ flex: 1 }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className="kanban-col-header">
                                <h4 style={{ margin: 0 }}>{t(col.titleKey)}</h4>
                                <span className="badge badge-neutral">{columnTasks.length}</span>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                                {columnTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`kanban-card ${task.priority === 'high' ? 'priority-high' : 'priority-normal'}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{task.patientName}</span>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                                                <MoreHorizontal style={{ width: 16, height: 16 }} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                                            <Clock style={{ width: 12, height: 12 }} /> {task.date}
                                        </div>

                                        {task.physicianName && (
                                            <span className="badge badge-info" style={{ marginBottom: 8 }}>{task.physicianName}</span>
                                        )}

                                        {col.id === 'unassigned' && (
                                            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 4, fontSize: '0.8rem', minHeight: 32 }}>
                                                {t('taskboard.assign')}
                                            </button>
                                        )}
                                        {col.id === 'qc_review' && (
                                            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.75rem', minHeight: 30 }}
                                                    onClick={() => navigate(`/viewer/${task.id}`)}>{t('taskboard.review')}</button>
                                                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.75rem', minHeight: 30, background: 'var(--success)', borderColor: 'var(--success)' }}>
                                                    <CheckCircle2 style={{ width: 12, height: 12 }} /> {t('taskboard.approve')}
                                                </button>
                                                <button className="question-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 2 }}>
                                                    <AlertTriangle style={{ width: 12, height: 12 }} />
                                                    疑義照会
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {columnTasks.length === 0 && (
                                    <div style={{
                                        textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)',
                                        minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                                    }}>
                                        {t('taskboard.drop_here')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
