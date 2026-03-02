import { motion } from "framer-motion"
import { ChevronLeft, Calendar, MessageSquare, Heart, Search as SearchIcon } from "lucide-react"
import { useState } from "react"

interface Workshop {
    id: number
    name: string
    date: string
    participants: number
    tags: string[]
    author?: string
    authorAvatar?: string
}

interface Doubt {
    id: number
    question: string
    author: string
    authorAvatar?: string
    replies: number
    tags: string[]
    likes: number
    isLiked: boolean
}

interface SearchResultsProps {
    searchQuery: string
    workshops: Workshop[]
    doubts: Doubt[]
    onBack: () => void
    onDoubtClick: (doubt: Doubt) => void
    onToggleLike: (doubtId: number, e: React.MouseEvent) => void
}

export function SearchResults({ searchQuery, workshops, doubts, onBack, onDoubtClick, onToggleLike }: SearchResultsProps) {
    const [activeFilter, setActiveFilter] = useState<'all' | 'workshops' | 'doubts'>('all')

    const filteredWorkshops = workshops.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const filteredDoubts = doubts.filter(d =>
        d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const totalResults = filteredWorkshops.length + filteredDoubts.length

    const showWorkshops = activeFilter === 'all' || activeFilter === 'workshops'
    const showDoubts = activeFilter === 'all' || activeFilter === 'doubts'

    return (
        <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-7xl mx-auto h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={onBack}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-all text-neutral-400 hover:text-white shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight text-white mb-1">Search Results</h2>
                        <p className="text-neutral-400 text-sm">
                            {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeFilter === 'all' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        All ({totalResults})
                    </button>
                    <button
                        onClick={() => setActiveFilter('workshops')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeFilter === 'workshops' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        Workshops ({filteredWorkshops.length})
                    </button>
                    <button
                        onClick={() => setActiveFilter('doubts')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeFilter === 'doubts' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                        Doubts ({filteredDoubts.length})
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-8 pb-20">
                {/* Workshops Section */}
                {showWorkshops && filteredWorkshops.length > 0 && (
                    <section>
                        <h3 className="text-xl font-semibold text-white mb-4">Workshops</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredWorkshops.map((workshop, i) => (
                                (() => {
                                    const workshopAuthor = workshop.author?.trim() || "Anonymous"
                                    const workshopAuthorAvatar = workshop.authorAvatar?.trim() || ""
                                    return (
                                <motion.div
                                    key={workshop.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-[#18181b] border border-white/10 rounded-3xl p-6 hover:bg-[#27272a] hover:border-white/20 transition-all relative overflow-hidden flex flex-col gap-6"
                                >
                                    {/* Profile Section */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
                                            {workshopAuthorAvatar ? (
                                                <img src={workshopAuthorAvatar} alt={workshopAuthor} className="w-full h-full object-cover" />
                                            ) : (
                                                workshopAuthor.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-white truncate">{workshopAuthor}</h3>
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
                                    )
                                })()
                            ))}
                        </div>
                    </section>
                )}

                {/* Doubts Section */}
                {showDoubts && filteredDoubts.length > 0 && (
                    <section>
                        <h3 className="text-xl font-semibold text-white mb-4">Doubts</h3>
                        <div className="flex flex-col gap-4">
                            {filteredDoubts.map((doubt, i) => (
                                <motion.div
                                    key={doubt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-[#18181b] border border-white/10 rounded-2xl p-5 hover:bg-[#27272a] hover:border-white/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    onClick={() => onDoubtClick(doubt)}
                                >
                                    <div className="flex flex-col gap-4">
                                        {/* Top section with author and tags */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-xs text-white font-medium">
                                                    {doubt.authorAvatar ? (
                                                        <img src={doubt.authorAvatar} alt={doubt.author} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        doubt.author.charAt(0)
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                                                    {doubt.author}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {doubt.tags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="text-[10px] font-semibold tracking-wide text-neutral-400 bg-white/5 border border-white/5 px-2 py-1 rounded-md uppercase shrink-0"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Question */}
                                        <h3 className="text-base font-medium text-white leading-relaxed">{doubt.question}</h3>

                                        {/* Bottom section with interactions */}
                                        <div className="flex items-center gap-4 text-xs font-medium text-neutral-400 pt-2 border-t border-white/5">
                                            <button
                                                onClick={(e) => onToggleLike(doubt.id, e)}
                                                className={`flex items-center gap-1.5 hover:text-red-400 transition-colors ${
                                                    doubt.isLiked ? 'text-red-400' : ''
                                                }`}
                                            >
                                                <Heart size={14} fill={doubt.isLiked ? 'currentColor' : 'none'} />
                                                {doubt.likes}
                                            </button>
                                            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                <MessageSquare size={14} />
                                                {doubt.replies} replies
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* No Results */}
                {totalResults === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <SearchIcon size={48} className="text-neutral-600 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                        <p className="text-neutral-400">
                            Try searching with different keywords or check your spelling
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
