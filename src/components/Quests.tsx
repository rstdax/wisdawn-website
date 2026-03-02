import { motion } from "framer-motion"
import { Trophy, Target, Zap, ChevronRight, CheckCircle2, Circle, Star, Award, HelpCircle, PenTool } from "lucide-react"

export function Quests() {
    // Mock Data
    const levelInfo = {
        level: 12,
        title: "Knowledge Seeker",
        currentXp: 8450,
        nextLevelXp: 10000,
        streak: 14
    }

    const dailyQuests = [
        { id: '1', title: "Complete a Focus Session", xp: 150, progress: 1, total: 2, isCompleted: false },
        { id: '2', title: "Help a Peer", description: "Answer a doubt in your locality", xp: 300, progress: 1, total: 1, isCompleted: true },
        { id: '3', title: "Daily Login", xp: 50, progress: 1, total: 1, isCompleted: true },
    ]

    const weeklyQuests = [
        { id: 'w1', title: "Attend 3 Live Workshops", xp: 1000, progress: 1, total: 3, isCompleted: false },
        { id: 'w2', title: "Mastery: System Design", description: "Complete the System Design module", xp: 2500, progress: 40, total: 100, isCompleted: false, isPercentage: true },
    ]

    const milestones = [
        { id: 'm1', title: "Early Bird", description: "Complete 10 focus sessions before 9 AM", icon: <Zap size={24} className="text-yellow-400" />, unlocked: true, date: "Oct 12, 2026" },
        { id: 'm2', title: "Community Pillar", description: "Receive 50 upvotes on your answers", icon: <Star size={24} className="text-blue-400" />, unlocked: true, date: "Sep 28, 2026" },
        { id: 'm3', title: "Deep Thinker", description: "Log 100 hours of focus time", icon: <Target size={24} className="text-purple-400" />, unlocked: false, progress: 82 },
        { id: 'm4', title: "Workshop Host", description: "Successfully host your first live session", icon: <Award size={24} className="text-emerald-400" />, unlocked: false, progress: 0 }
    ]

    const mcqQuestions = [
        { id: 'q1', type: 'mcq', xp: 50, subject: "System Design", text: "Which property in the CAP theorem states that every request receives a (non-error) response, without the guarantee that it contains the most recent write?", options: ["Consistency", "Availability", "Partition Tolerance", "Latency"] },
        { id: 'q2', type: 'mcq', xp: 40, subject: "JavaScript", text: "What will `console.log(typeof null)` output?", options: ["null", "undefined", "object", "string"] },
    ]

    const longAnswerQuestions = [
        { id: 'l1', type: 'long', xp: 150, subject: "React Hooks", text: "Explain the main differences between useMemo and useCallback, and provide a scenario where you would absolutely need to use one over the other." },
        { id: 'l2', type: 'long', xp: 200, subject: "Database Architecture", text: "Describe the trade-offs between vertical scaling (scaling up) and horizontal scaling (scaling out) for a relational database experiencing heavy read traffic." },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-12 pb-12"
        >
            {/* Header Area */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">Your Quests</h1>
                <p className="text-neutral-400">Complete objectives to earn XP and unlock exclusive rewards.</p>
            </div>

            {/* Level & Streak Panel */}
            <section className="bg-[#18181b] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-[2px] shadow-lg shadow-amber-500/20 shrink-0">
                            <div className="w-full h-full bg-[#18181b] rounded-[14px] flex items-center justify-center flex-col">
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-0.5">Lvl</span>
                                <span className="text-2xl font-black text-white leading-none">{levelInfo.level}</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-white tracking-tight">{levelInfo.title}</h2>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    Current Tier
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
                                <span>{levelInfo.currentXp.toLocaleString()} XP</span>
                                <span className="text-neutral-600">/</span>
                                <span>{levelInfo.nextLevelXp.toLocaleString()} XP</span>
                            </div>
                            <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(levelInfo.currentXp / levelInfo.nextLevelXp) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[160px]">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                                <path d="M8.5 14.5A2.5 2.5 0 0011 12c-2.2 0-4-1.8-4-4 0-1.5.8-2.8 2-3.5"></path>
                                <path d="M15.5 14.5A2.5 2.5 0 0113 12c2.2 0 4-1.8 4-4 0-1.5-.8-2.8-2-3.5"></path>
                                <path d="M12 22a8 8 0 008-8c0-3.5-2.5-6.5-6-8-3.5 1.5-6 4.5-6 8a8 8 0 008 8z"></path>
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white leading-none mb-1">{levelInfo.streak}</div>
                            <div className="text-xs font-medium text-orange-400 uppercase tracking-wider">Day Streak</div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Objectives */}
                <section className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2 mb-4">
                            <Target size={20} className="text-blue-400" /> Daily Objectives
                        </h2>
                        <div className="flex flex-col gap-3">
                            {dailyQuests.map((quest, i) => (
                                <motion.div
                                    key={quest.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`bg-[#18181b] p-4 rounded-2xl border transition-all flex items-center gap-4 ${quest.isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="shrink-0">
                                        {quest.isCompleted ? (
                                            <CheckCircle2 size={24} className="text-emerald-500" />
                                        ) : (
                                            <Circle size={24} className="text-neutral-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-semibold mb-1 truncate ${quest.isCompleted ? 'text-white' : 'text-neutral-200'}`}>{quest.title}</h3>
                                        {quest.description && <p className="text-xs text-neutral-500 truncate mb-2">{quest.description}</p>}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${quest.isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${(quest.progress / quest.total) * 100}%` }} />
                                            </div>
                                            <span className="text-[10px] font-medium text-neutral-400 w-8 text-right">
                                                {quest.progress}/{quest.total}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-1 font-semibold text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                                        +{quest.xp} XP
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2 mb-4 mt-4">
                            <Trophy size={20} className="text-purple-400" /> Weekly Objectives
                        </h2>
                        <div className="flex flex-col gap-3">
                            {weeklyQuests.map((quest, i) => (
                                <motion.div
                                    key={quest.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="bg-[#18181b] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-4"
                                >
                                    <div className="shrink-0">
                                        <Circle size={24} className="text-neutral-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-neutral-200 mb-1 truncate">{quest.title}</h3>
                                        {quest.description && <p className="text-xs text-neutral-500 truncate mb-2">{quest.description}</p>}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(quest.progress / quest.total) * 100}%` }} />
                                            </div>
                                            <span className="text-[10px] font-medium text-neutral-400 w-8 text-right">
                                                {quest.isPercentage ? `${quest.progress}%` : `${quest.progress}/${quest.total}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-1 font-semibold text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                                        +{quest.xp.toLocaleString()} XP
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Milestones / Badges */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                            <Award size={20} className="text-emerald-400" /> Milestones
                        </h2>
                        <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group">
                            View all <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {milestones.map((milestone, i) => (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className={`relative p-5 rounded-2xl border transition-all h-full flex flex-col ${milestone.unlocked ? 'bg-[#18181b] border-white/10 hover:border-white/20' : 'bg-white/[0.02] border-white/5 border-dashed grayscale-[0.8] opacity-60'}`}
                            >
                                <div className="mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${milestone.unlocked ? 'bg-white/5 border border-white/5 shadow-inner' : 'bg-black/20 text-neutral-600'}`}>
                                        {milestone.icon}
                                    </div>
                                    <h3 className="text-sm font-semibold text-white mb-1.5">{milestone.title}</h3>
                                    <p className="text-xs text-neutral-400 leading-relaxed">{milestone.description}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/5">
                                    {milestone.unlocked ? (
                                        <div className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <CheckCircle2 size={12} /> Unlocked on {milestone.date}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-neutral-500 rounded-full" style={{ width: `${milestone.progress}%` }} />
                                            </div>
                                            <span className="text-[10px] font-medium text-neutral-500 w-6 text-right">
                                                {milestone.progress}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Questions Arena */}
            <div className="flex flex-col gap-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Challenge Arena</h2>
                    <p className="text-neutral-400">Test your knowledge and earn massive XP by answering community questions directly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Multiple Choice Questions */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                                <HelpCircle size={20} className="text-cyan-400" /> Quick Fire (MCQ)
                            </h3>
                        </div>

                        <div className="flex flex-col gap-6">
                            {mcqQuestions.map((q, i) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + (i * 0.1) }}
                                    className="bg-[#18181b] border border-white/10 rounded-2xl p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20">{q.subject}</span>
                                        <span className="text-xs font-semibold text-amber-400">+{q.xp} XP</span>
                                    </div>
                                    <h4 className="text-[15px] font-medium text-white mb-5 leading-relaxed">{q.text}</h4>

                                    <div className="flex flex-col gap-2">
                                        {q.options.map((opt, optIndex) => (
                                            <button key={optIndex} className="w-full text-left px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 text-sm font-medium text-neutral-300 hover:text-white transition-all">
                                                <span className="text-neutral-500 mr-3">{["A", "B", "C", "D"][optIndex]}</span>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-5 pt-5 border-t border-white/5 flex justify-end">
                                        <button className="px-5 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors">Submit Answer</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Long Answer Questions */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                                <PenTool size={20} className="text-pink-400" /> Deep Dive (Long Answer)
                            </h3>
                        </div>

                        <div className="flex flex-col gap-6">
                            {longAnswerQuestions.map((q, i) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="bg-[#18181b] border border-white/10 rounded-2xl p-6 flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-400/10 px-2 py-1 rounded-md border border-pink-400/20">{q.subject}</span>
                                        <span className="text-xs font-semibold text-amber-400">+{q.xp} XP</span>
                                    </div>
                                    <h4 className="text-[15px] font-medium text-white mb-5 leading-relaxed">{q.text}</h4>

                                    <textarea
                                        className="w-full flex-1 min-h-[140px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-white/20 resize-none mb-5"
                                        placeholder="Formulate your detailed response here..."
                                    />

                                    <div className="mt-auto pt-5 border-t border-white/5 flex justify-end">
                                        <button className="px-5 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors">Submit Response</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </motion.div>
    )
}
