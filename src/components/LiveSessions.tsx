import { motion } from "framer-motion"
import { Search, ChevronLeft, Calendar } from "lucide-react"
import { useState } from "react"

export function LiveSessions({ onBack }: { onBack: () => void }) {
    const [searchQuery, setSearchQuery] = useState('')

    const workshops = [
        { id: 1, name: "Advanced Quantum Mechanics Workshop", date: "Mar 5, 2026", participants: 45, tags: ["PHYSICS"] },
        { id: 2, name: "Calculus III: Problem Solving", date: "Mar 8, 2026", participants: 32, tags: ["MATH"] },
        { id: 3, name: "Data Structures Masterclass", date: "Mar 10, 2026", participants: 78, tags: ["CODING"] },
        { id: 4, name: "Organic Chemistry Lab Techniques", date: "Mar 12, 2026", participants: 28, tags: ["CHEMISTRY"] },
        { id: 5, name: "Machine Learning Hands-On", date: "Mar 15, 2026", participants: 65, tags: ["AI", "CODING"] },
        { id: 6, name: "World History Discussion Forum", date: "Mar 18, 2026", participants: 40, tags: ["HISTORY"] },
        { id: 7, name: "Economics Case Studies", date: "Mar 20, 2026", participants: 35, tags: ["ECONOMICS"] },
        { id: 8, name: "Astrophysics Deep Dive", date: "Mar 22, 2026", participants: 52, tags: ["PHYSICS", "ASTRONOMY"] }
    ]

    const filteredWorkshops = workshops.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-7xl mx-auto h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={onBack}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-all text-neutral-400 hover:text-white shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-white mb-0.5 sm:mb-1">Workshops</h2>
                        <p className="text-neutral-400 text-xs sm:text-sm">Join interactive workshops and enhance your skills.</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-56 md:w-64">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search workshops..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 bg-[#18181b] border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {filteredWorkshops.map((workshop, i) => (
                    <motion.div
                        key={workshop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#18181b] border border-white/10 rounded-3xl p-6 hover:bg-[#27272a] hover:border-white/20 transition-all relative overflow-hidden flex flex-col gap-6"
                    >
                        {/* Profile Section */}
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                                {workshop.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-white truncate">{workshop.name.split(' ')[0]} {workshop.name.split(' ')[1]}</h3>
                                <p className="text-sm text-neutral-400">{workshop.tags[0]}</p>
                            </div>
                        </div>

                        {/* Workshop Title */}
                        <div>
                            <h4 className="text-2xl font-bold text-white mb-3">{workshop.name}</h4>
                        </div>

                        {/* Info & Button */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                                <Calendar size={16} />
                                <span>{workshop.date}</span>
                            </div>
                            <button
                                className="px-8 py-3 bg-white text-black rounded-2xl font-semibold text-sm hover:bg-neutral-200 transition-all active:scale-95"
                            >
                                Join
                            </button>
                        </div>
                    </motion.div>
                ))}

                {filteredWorkshops.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-neutral-500">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p>No workshops found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    )
}
