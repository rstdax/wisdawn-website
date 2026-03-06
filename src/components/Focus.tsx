import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Play, Pause, RotateCcw,
    CloudRain, Coffee, Wind, Music, Volume2,
    Plus, Check, X, Trash2
} from "lucide-react"
import { cn } from "../lib/utils"

export function Focus({ onClose }: { onClose: () => void }) {
    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60) // Default 25 minutes
    const [isActive, setIsActive] = useState(false)
    const [totalTime, setTotalTime] = useState(120 * 60) // Max 120 mins for the dial

    // Ambient Sound State
    const [activeSound, setActiveSound] = useState<string | null>(null)

    // Task State
    const [tasks, setTasks] = useState<{ id: string, text: string, completed: boolean }[]>([
        { id: '1', text: 'Define abstract concept', completed: true },
        { id: '2', text: 'Read chapters 4 & 5', completed: false }
    ])
    const [newTask, setNewTask] = useState('')

    // Timer Logic
    useEffect(() => {
        if (!isActive || timeLeft <= 0) return

        const interval = setInterval(() => {
            setTimeLeft((time) => {
                if (time <= 1) {
                    setIsActive(false)
                    return 0
                }
                return time - 1
            })
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [isActive, timeLeft])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const setTimer = (minutes: number) => {
        setIsActive(false)
        setTimeLeft(minutes * 60)
        setTotalTime(minutes * 60)
    }

    const toggleTimer = () => setIsActive(!isActive)
    const resetTimer = () => {
        setIsActive(false)
        setTimeLeft(totalTime)
    }

    // Interactive Timer Logic
    const svgRef = useRef<SVGSVGElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const calculateTimeFromAngle = (e: React.PointerEvent) => {
        if (!svgRef.current) return

        const rect = svgRef.current.getBoundingClientRect()
        // Calculate center of the SVG
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // Calculate angle from center to mouse/touch position
        // Math.atan2 returns angle in radians from -PI to PI
        // Note: SVG is rotated -90deg, so 0 radians is straight UP visually.
        // We need to calculate the angle based on the visual starting point (top).

        const dx = e.clientX - centerX
        const dy = e.clientY - centerY

        const angle = Math.atan2(dy, dx)

        // Convert to degrees
        let degrees = angle * (180 / Math.PI)

        // Adjust for the -90deg rotation applied via CSS on the SVG element
        // The visual top is actually the right side mathematically before rotation.
        // After -90deg rotation, visual top corresponds to mathematical -90deg.
        degrees += 90

        if (degrees < 0) degrees += 360

        // Map 0-360 degrees to 0-120 minutes
        const maxMinutes = 120
        let minutes = Math.round((degrees / 360) * maxMinutes)

        // Snap to nearest 5 minutes
        minutes = Math.round(minutes / 5) * 5

        if (minutes === 0) minutes = 1 // Minimum 1 minute
        if (minutes > maxMinutes) minutes = maxMinutes

        setTimeLeft(minutes * 60)
        setTotalTime(120 * 60) // Keep max constant for dial scale
        setIsActive(false)
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true)
        calculateTimeFromAngle(e)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isDragging) {
            calculateTimeFromAngle(e)
        }
    }

    const handlePointerUp = () => {
        setIsDragging(false)
    }

    // Circular Progress Calculation
    const radius = 90
    const circumference = 2 * Math.PI * radius
    // Ensure we don't divide by zero
    const progressOffset = circumference - (totalTime > 0 ? (timeLeft / totalTime) * circumference : 0)

    // Handle tracking logic removed.

    // Task Functions
    const addTask = (e: React.FormEvent) => {
        e.preventDefault()
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now().toString(), text: newTask.trim(), completed: false }])
            setNewTask('')
        }
    }

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    }

    const deleteTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent toggling the task
        setTasks(tasks.filter(t => t.id !== id))
    }

    const soundOptions = [
        { id: 'rain', label: 'Rain', icon: CloudRain },
        { id: 'cafe', label: 'Cafe', icon: Coffee },
        { id: 'noise', label: 'White Noise', icon: Wind },
        { id: 'lofi', label: 'Lo-Fi', icon: Music },
    ]

    return (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 sticky top-0 bg-[#09090b]/90 backdrop-blur-md z-10">
                <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                    Focus Mode
                </h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors text-neutral-400 hover:text-white"
                    aria-label="Close focus mode"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-8">
                {/* Timer Section */}
                <div className="focus-timer-card flex flex-col items-center justify-center p-6 border border-white/5 rounded-3xl bg-[#18181b]/50 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none" />

                    {/* Circular Timer Display */}
                    <div className="relative flex items-center justify-center mb-6 z-10 touch-none">
                        <svg
                            ref={svgRef}
                            width="220"
                            height="220"
                            viewBox="0 0 220 220"
                            className="-rotate-90 cursor-pointer"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        >
                            {/* Hit area for easier grabbing */}
                            <circle
                                cx="110"
                                cy="110"
                                r={radius}
                                fill="transparent"
                                stroke="transparent"
                                strokeWidth="30"
                            />
                            {/* Background track */}
                            <circle
                                cx="110"
                                cy="110"
                                r={radius}
                                fill="transparent"
                                className="focus-timer-track"
                                strokeWidth="6"
                            />
                            {/* Active time track */}
                            <motion.circle
                                cx="110"
                                cy="110"
                                r={radius}
                                fill="transparent"
                                className="focus-timer-progress"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                animate={{ strokeDashoffset: progressOffset }}
                                transition={{ duration: isDragging ? 0.05 : 0.5, ease: isDragging ? "linear" : "easeOut" }}
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <motion.div
                                key={timeLeft}
                                initial={{ opacity: 0.5, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="focus-timer-value text-4xl font-light tracking-tighter text-white font-mono"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                                {formatTime(timeLeft)}
                            </motion.div>
                            <p className="focus-timer-state text-neutral-500 text-[10px] font-medium tracking-widest uppercase mt-1">
                                {isActive ? "Focusing" : "Paused"}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 z-10 w-full justify-center">
                        <button
                            onClick={resetTimer}
                            className="w-10 h-10 rounded-full border border-white/10 text-neutral-400 flex items-center justify-center hover:bg-white/5 hover:text-white transition-all active:scale-95"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={toggleTimer}
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md relative overflow-hidden",
                                isActive
                                    ? "bg-[#27272a] border border-white/10 text-white"
                                    : "bg-white text-black border border-white/20 hover:scale-105"
                            )}
                        >
                            {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                            {!isActive && (
                                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
                            )}
                        </button>
                        <div className="w-10 h-10" /> {/* Spacer */}
                    </div>

                    {/* Shortcuts (Grid below controls) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 w-full z-10 border-t border-white/5 pt-6">
                        {[15, 25, 50, 90].map((min) => (
                            <button
                                key={min}
                                onClick={() => setTimer(min)}
                                className={cn(
                                    "focus-timer-shortcut py-2 rounded-xl text-xs font-semibold transition-all duration-300 border",
                                    totalTime === min * 60
                                        ? "focus-timer-shortcut-active bg-white text-black border-white shadow-sm"
                                        : "focus-timer-shortcut-idle bg-[#09090b] text-neutral-400 border-white/5 hover:text-white hover:border-white/20 hover:bg-white/5"
                                )}
                            >
                                {min}m
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ambient Sounds */}
                <div className="bg-[#18181b] border border-white/10 rounded-3xl p-5 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold tracking-tight text-white">Ambiance</h3>
                        <Volume2 size={14} className="text-neutral-500" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {soundOptions.map((sound) => {
                            const Icon = sound.icon
                            const IS_ACTIVE = activeSound === sound.id
                            return (
                                <button
                                    key={sound.id}
                                    onClick={() => setActiveSound(IS_ACTIVE ? null : sound.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 aspect-square group",
                                        IS_ACTIVE
                                            ? "bg-white/10 border-white/30 text-white"
                                            : "bg-[#09090b] border-white/5 text-neutral-500 hover:bg-white/5 hover:text-neutral-300 hover:border-white/10"
                                    )}
                                >
                                    <Icon size={18} className={cn("transition-transform duration-300", IS_ACTIVE && "scale-110", !IS_ACTIVE && "group-hover:scale-110")} />
                                    {IS_ACTIVE && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white mt-2 animate-pulse" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Task Manager */}
                <div className="flex-1 flex flex-col min-h-[250px] bg-[#18181b] border border-white/10 rounded-3xl p-5">
                    <h3 className="text-sm font-semibold tracking-tight text-white mb-4">Goals</h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 mb-4 -mx-2 px-2">
                        <AnimatePresence>
                            {tasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                    onClick={() => toggleTask(task.id)}
                                    className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
                                >
                                    <button className={cn(
                                        "mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                        task.completed
                                            ? "bg-white border-white text-black"
                                            : "border-neutral-600 text-transparent group-hover:border-neutral-400"
                                    )}>
                                        <Check size={10} className={cn(!task.completed && "opacity-0")} />
                                    </button>
                                    <span className={cn(
                                        "text-sm font-medium leading-snug transition-all flex-1",
                                        task.completed ? "text-neutral-600 line-through" : "text-neutral-300 group-hover:text-white"
                                    )}>
                                        {task.text}
                                    </span>
                                    <button
                                        onClick={(e) => deleteTask(task.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all ml-2 flex items-center justify-center -m-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {tasks.length === 0 && (
                            <div className="text-center text-neutral-600 text-xs py-8 my-auto">
                                No goals set.<br />Add a task to stay focused.
                            </div>
                        )}
                    </div>

                    <form onSubmit={addTask} className="mt-auto relative group">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add goal..."
                            className="w-full bg-[#09090b] border border-white/5 rounded-xl py-2.5 pl-3 pr-10 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/20 transition-colors shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!newTask.trim()}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/5"
                        >
                            <Plus size={14} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
