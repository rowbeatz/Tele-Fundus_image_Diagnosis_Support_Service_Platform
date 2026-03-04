import React, { useState, useEffect } from 'react'
import { useTranslation } from '../../lib/i18n'
import { MoreHorizontal, CheckCircle2, Clock, AlertTriangle, Building2, Activity, UserPlus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchScreenings, fetchPhysicians, assignPhysician, type Physician } from '../../lib/screeningApi'

type Task = {
    id: string
    patientName: string
    organizationName: string
    status: string
    priority: 'normal' | 'high'
    date: string
    physicianName?: string
    clinicalHints: string[]
}

export default function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [physicians, setPhysicians] = useState<Physician[]>([])
    const [loading, setLoading] = useState(true)
    const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null)
    const [selectedPhysicianId, setSelectedPhysicianId] = useState<string>('')

    const navigate = useNavigate()
    const { t, lang } = useTranslation()

    const load = async () => {
        try {
            setLoading(true)
            const [data, physData] = await Promise.all([
                fetchScreenings(),
                fetchPhysicians()
            ])
            setPhysicians(physData)

            const loadedTasks: Task[] = data.map(s => {
                let status = 'unassigned'
                if (s.status === 'completed') status = 'qc_review'
                else if (s.urgencyFlag) status = 'reading'

                const hints = []
                if (s.hasDiabetes) hints.push('DM')
                if (s.bloodPressureSystolic && s.bloodPressureSystolic >= 140) hints.push('HTN')

                return {
                    id: s.id,
                    patientName: s.patientName,
                    organizationName: s.organizationName,
                    status,
                    priority: s.urgencyFlag ? 'high' : 'normal',
                    date: new Date(s.screeningDate).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    clinicalHints: hints
                }
            })
            setTasks(loadedTasks)
        } catch (err) {
            console.error("Failed to load tasks", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [lang])

    const handleAssignSubmit = async (taskId: string) => {
        if (!selectedPhysicianId) return
        try {
            await assignPhysician(taskId, selectedPhysicianId)
            setAssigningTaskId(null)
            setSelectedPhysicianId('')
            await load() // refresh board
        } catch (err) {
            console.error('Failed to assign physician:', err)
            alert('アサインに失敗しました。')
        }
    }

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
                                        onClick={() => navigate(`/viewer/${task.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{task.patientName}</span>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                                                <MoreHorizontal style={{ width: 16, height: 16 }} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                            <Building2 style={{ width: 12, height: 12 }} /> {task.organizationName}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                                            <Clock style={{ width: 12, height: 12 }} /> {task.date}
                                        </div>

                                        {task.clinicalHints.length > 0 && (
                                            <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                                                {task.clinicalHints.map((hint, i) => (
                                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600 }}>
                                                        <Activity style={{ width: 10, height: 10 }} /> {hint}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {task.physicianName && (
                                            <span className="badge badge-info" style={{ marginBottom: 8, display: 'inline-block' }}>{task.physicianName}</span>
                                        )}

                                        {col.id === 'unassigned' && (
                                            <div style={{ marginTop: 4 }}>
                                                {assigningTaskId === task.id ? (
                                                    <div style={{ background: 'var(--surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)', marginTop: 8 }} onClick={e => e.stopPropagation()}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t('taskboard.assign')}</span>
                                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setAssigningTaskId(null)}><X style={{ width: 14, height: 14 }} /></button>
                                                        </div>
                                                        <select
                                                            className="input"
                                                            style={{ width: '100%', fontSize: '0.8rem', padding: '4px 8px', marginBottom: 8 }}
                                                            value={selectedPhysicianId}
                                                            onChange={e => setSelectedPhysicianId(e.target.value)}
                                                        >
                                                            <option value="">{t('common.select')}...</option>
                                                            {physicians.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name} ({p.specialty})</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ width: '100%', fontSize: '0.8rem', padding: '4px' }}
                                                            disabled={!selectedPhysicianId}
                                                            onClick={() => handleAssignSubmit(task.id)}
                                                        >
                                                            {t('common.confirm')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', minHeight: 32 }}
                                                        onClick={(e) => { e.stopPropagation(); setAssigningTaskId(task.id); setSelectedPhysicianId(''); }}>
                                                        <UserPlus style={{ width: 14, height: 14, marginRight: 4 }} />
                                                        {t('taskboard.assign')}
                                                    </button>
                                                )}
                                            </div>
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
                                {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Loading...</div>}
                                {!loading && columnTasks.length === 0 && (
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
