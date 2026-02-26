import React, { useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { MoreHorizontal, CheckCircle2, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Mock data representing screenings and readings
const initialTasks = [
    { id: 'scr-1', patientName: 'John Doe', status: 'unassigned', priority: 'high', date: '2026-02-26 09:30' },
    { id: 'scr-2', patientName: 'Jane Smith', status: 'reading', priority: 'normal', date: '2026-02-26 10:15', physicianName: 'Dr. Sarah Connor' },
    { id: 'scr-3', patientName: 'Robert Johnson', status: 'qc_review', priority: 'high', date: '2026-02-26 08:45', physicianName: 'Dr. House' },
    { id: 'scr-4', patientName: 'Emily Davis', status: 'unassigned', priority: 'normal', date: '2026-02-26 11:00' },
]

export default function TaskBoard() {
    const [tasks, setTasks] = useState(initialTasks)
    const navigate = useNavigate()

    const columns = [
        { id: 'unassigned', title: 'To Assign' },
        { id: 'reading', title: 'In Reading' },
        { id: 'qc_review', title: 'QC Review' },
    ]

    // Extremely simple mock drag and drop implementation since we don't have dnd-kit installed
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId)
    }

    const handleDrop = (e: React.DragEvent, statusId: string) => {
        const taskId = e.dataTransfer.getData('taskId')
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: statusId } : t
        ))
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Operator Task Board</h1>
                <Button>Auto-Assign Pending</Button>
            </div>

            <div className="flex gap-6 h-[calc(100vh-140px)]">
                {columns.map(col => {
                    const columnTasks = tasks.filter(t => t.status === col.id)
                    return (
                        <div
                            key={col.id}
                            className="flex-1 bg-gray-100 rounded-lg p-4 flex flex-col"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-700">{col.title}</h3>
                                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                                    {columnTasks.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {columnTasks.map(task => (
                                    <Card
                                        key={task.id}
                                        className={`cursor-grab active:cursor-grabbing border-l-4 ${task.priority === 'high' ? 'border-l-red-500' : 'border-l-blue-500'}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-sm">{task.patientName}</span>
                                                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                                            </div>

                                            <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                                <Clock className="w-3 h-3" /> {task.date}
                                            </div>

                                            {task.physicianName && (
                                                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit mb-2">
                                                    {task.physicianName}
                                                </div>
                                            )}

                                            {col.id === 'unassigned' && (
                                                <Button size="sm" variant="outline" className="w-full mt-2 text-xs">Assign</Button>
                                            )}
                                            {col.id === 'qc_review' && (
                                                <div className="flex gap-2 mt-2">
                                                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => navigate(`/viewer/${task.id}`)}>Review</Button>
                                                    <Button size="sm" className="flex-1 bg-green-600 text-xs text-white"><CheckCircle2 className="w-3 h-3 mr-1" /> Approve</Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                {columnTasks.length === 0 && (
                                    <div className="text-center text-sm text-gray-400 min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                        Drop items here
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
