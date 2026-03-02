import { motion } from "framer-motion"
import { BookOpen, FileText, PlayCircle, Bookmark, MoveRight, Star, Download } from "lucide-react"
import { cn } from "../lib/utils"

export function Library() {
    // Mock Data
    const continueLearning = [
        {
            id: '1',
            title: "Advanced System Design",
            instructor: "Alex Rivera",
            progress: 68,
            thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=500&auto=format&fit=crop",
            lastAccessed: "2 hours ago"
        },
        {
            id: '2',
            title: "Go Concurrency Patterns",
            instructor: "Sarah Jenkins",
            progress: 32,
            thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=500&auto=format&fit=crop",
            lastAccessed: "Yesterday"
        }
    ]

    const savedResources = [
        { id: '1', title: "React 19 Hooks Cheat Sheet", type: "PDF", size: "2.4 MB", date: "Oct 24" },
        { id: '2', title: "Distributed Systems Architecture", type: "Article", readTime: "12 min", date: "Oct 22" },
        { id: '3', title: "CSS Grid Complete Guide", type: "Doc", size: "1.1 MB", date: "Oct 18" },
        { id: '4', title: "Machine Learning Math Primer", type: "PDF", size: "5.7 MB", date: "Oct 15" }
    ]

    const recommended = [
        {
            id: '1',
            title: "Clean Architecture",
            author: "Robert C. Martin",
            rating: 4.8,
            category: "Software Engineering",
            cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300&auto=format&fit=crop"
        },
        {
            id: '2',
            title: "Designing Data-Intensive Applications",
            author: "Martin Kleppmann",
            rating: 4.9,
            category: "System Design",
            cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop"
        }
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
                <h1 className="text-3xl font-bold tracking-tight text-white">Your Library</h1>
                <p className="text-neutral-400">Pick up where you left off or discover new resources.</p>
            </div>

            {/* Continue Learning */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                        <PlayCircle size={20} className="text-blue-400" /> Continue Learning
                    </h2>
                    <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group">
                        Browse all <MoveRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {continueLearning.map((course, i) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all cursor-pointer flex flex-col sm:flex-row shadow-sm hover:shadow-md h-full"
                        >
                            {/* Thumbnail */}
                            <div className="sm:w-40 h-40 sm:h-auto shrink-0 relative overflow-hidden">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                        <PlayCircle size={24} className="fill-white/10" />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-neutral-400">{course.instructor}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-neutral-400">
                                        <span>{course.progress}% Complete</span>
                                        <span>{course.lastAccessed}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Content Grid: Saved vs Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Saved Resources (Takes 2 columns) */}
                <section className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                            <Bookmark size={20} className="text-emerald-400" /> Saved Resources
                        </h2>
                        <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">See all folders</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {savedResources.map((resource, i) => (
                            <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.05) }}
                                className="bg-[#18181b] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all cursor-pointer group flex items-start gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                    <FileText size={20} className={cn(
                                        resource.type === 'PDF' ? "text-red-400" :
                                            resource.type === 'Article' ? "text-blue-400" : "text-yellow-400"
                                    )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-white mb-1 truncate group-hover:text-emerald-400 transition-colors">{resource.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                                        <span className="font-medium px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">{resource.type}</span>
                                        <span>{resource.size || resource.readTime}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="hidden sm:inline">{resource.date}</span>
                                    </div>
                                </div>
                                <button className="text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                                    <Download size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Recommended Reading (Takes 1 column) */}
                <section className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-white/5 pt-8 lg:pt-0 lg:pl-8">
                    <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2 mb-6">
                        <BookOpen size={20} className="text-orange-400" /> Recommended
                    </h2>

                    <div className="flex flex-col gap-6">
                        {recommended.map((book, i) => (
                            <motion.div
                                key={book.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1) }}
                                className="group cursor-pointer flex gap-4"
                            >
                                <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-lg relative">
                                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-[10px] font-bold tracking-widest uppercase text-orange-400 mb-1">{book.category}</div>
                                    <h3 className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">{book.title}</h3>
                                    <p className="text-xs text-neutral-400 mb-2">{book.author}</p>
                                    <div className="flex items-center gap-1 text-xs font-medium text-yellow-500">
                                        <Star size={12} className="fill-yellow-500" /> {book.rating}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-[#18181b] hover:text-white transition-colors text-neutral-400 text-center">
                        View all recommendations
                    </button>
                </section>

            </div>
        </motion.div>
    )
}
