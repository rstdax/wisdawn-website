import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Clock, Users, MapPin, Calendar,
    X, User as UserIcon, Flame, PlayCircle, MessageSquare, Video, LogOut
} from "lucide-react"
import { cn } from "../lib/utils"
import { useUser, type WorkshopData } from "../contexts/UserContext"
import { signOutUser } from "../lib/auth"
import { subscribeToDoubts, subscribeToWorkshops, type DoubtData } from "../lib/firestore"

export function Profile({
    onClose,
    onOpenWorkshop,
}: {
    onClose: () => void
    onOpenWorkshop?: (workshop: WorkshopData) => void
}) {
    const { currentUser, userData, updateUserData } = useUser()
    const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview')
    const [isEditing, setIsEditing] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [myCreatedWorkshops, setMyCreatedWorkshops] = useState<WorkshopData[]>([])
    const [myDoubts, setMyDoubts] = useState<DoubtData[]>([])

    // Using one of the specific avatars
    const [selectedAvatar, setSelectedAvatar] = useState(userData.avatar || "https://api.dicebear.com/7.x/avataaars/png?seed=Felix&backgroundColor=b6e3f4")

    const AVATARS = [
        "https://api.dicebear.com/7.x/avataaars/png?seed=Felix&backgroundColor=b6e3f4",
        "https://api.dicebear.com/7.x/avataaars/png?seed=Aneka&backgroundColor=c0aede",
        "https://api.dicebear.com/7.x/avataaars/png?seed=Mimi&backgroundColor=ffdfbf",
        "https://api.dicebear.com/7.x/avataaars/png?seed=Jack&backgroundColor=d1d4f9",
        "https://api.dicebear.com/7.x/avataaars/png?seed=Nala&backgroundColor=c0aede",
        "https://api.dicebear.com/7.x/avataaars/png?seed=Leo&backgroundColor=b6e3f4"
    ]

    const handleSaveAvatar = () => {
        updateUserData({ avatar: selectedAvatar })
        setIsEditing(false)
    }

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await signOutUser()
        } catch (error) {
            console.error("Failed to logout:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    useEffect(() => {
        const uid = currentUser?.uid
        if (!uid) {
            setMyCreatedWorkshops([])
            setMyDoubts([])
            return
        }

        const unsubscribeWorkshops = subscribeToWorkshops((workshops) => {
            setMyCreatedWorkshops(workshops.filter((workshop) => workshop.hostUid === uid))
        })

        const unsubscribeDoubts = subscribeToDoubts(uid, (doubts) => {
            setMyDoubts(doubts.filter((doubt) => doubt.authorUid === uid))
        })

        return () => {
            unsubscribeWorkshops()
            unsubscribeDoubts()
        }
    }, [currentUser?.uid])

    const createdWorkshops = useMemo(() => {
        const byId = new Map<number, WorkshopData>()
        myCreatedWorkshops.forEach((workshop) => byId.set(workshop.id, workshop))
        userData.createdWorkshops.forEach((workshop) => {
            if (!byId.has(workshop.id)) {
                byId.set(workshop.id, workshop)
            }
        })
        return Array.from(byId.values())
    }, [myCreatedWorkshops, userData.createdWorkshops])

    // Real User Data from context + backend subscriptions
    const user = {
        name: userData.name || "Guest User",
        role: userData.department ? `${userData.department} Student` : "Student",
        avatar: userData.avatar,
        institution: userData.institution || "Not specified",
        location: userData.location || "Not specified",
        stats: {
            joinedWorkshops: userData.joinedWorkshops.length,
            createdWorkshops: createdWorkshops.length,
            doubts: myDoubts.length,
        }
    }

    const formatTimeAgo = (timestampMs: number | undefined) => {
        if (!timestampMs || timestampMs <= 0) {
            return "Just now"
        }
        const diffMs = Date.now() - timestampMs
        const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)))
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <div className="flex flex-col h-full bg-[#09090b] text-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 bg-[#09090b]/90 backdrop-blur-md z-10 sticky top-0">
                <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                    Profile
                </h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors text-neutral-400 hover:text-white"
                    aria-label="Close profile panel"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">

                {/* User Identity Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 group cursor-pointer" onClick={() => setIsEditing(true)}>
                        <div className="w-24 h-24 rounded-full bg-[#18181b] border-2 border-white/10 flex items-center justify-center overflow-hidden transition-colors group-hover:border-white/30">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={40} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-white">Edit Profile</span>
                        </div>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight mb-1">{user.name}</h1>
                    <p className="text-neutral-400 text-sm mb-2">{user.role}</p>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-2 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <LogOut size={14} />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>

                    {/* More Details */}
                    <div className="flex flex-wrap justify-center items-center gap-3 mt-4 text-xs text-neutral-400">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"><MapPin size={14} /> {user.location}</span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5"><Calendar size={14} /> {user.institution}</span>
                    </div>
                </div>

                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="bg-[#18181b] border border-white/10 rounded-2xl p-5 shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-white">Profile Avatar</h3>
                                <button onClick={handleSaveAvatar} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Save Changes</button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mt-2 custom-scrollbar">
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar}
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`w-14 h-14 rounded-full overflow-visible shrink-0 transition-all border-2 relative ${selectedAvatar === avatar
                                            ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)] z-10'
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                            }`}
                                    >
                                        <div className="w-full h-full rounded-full overflow-hidden absolute inset-0">
                                            <img src={avatar} alt="avatar option" className="w-full h-full object-cover" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#18181b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                        <PlayCircle size={18} className="text-blue-400 mb-2" />
                        <span className="text-lg font-bold">{user.stats.joinedWorkshops}</span>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Joined</span>
                    </div>
                    <div className="bg-[#18181b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                        <Video size={18} className="text-purple-400 mb-2" />
                        <span className="text-lg font-bold">{user.stats.createdWorkshops}</span>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Created</span>
                    </div>
                    <div className="bg-[#18181b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                        <Flame size={18} className="text-orange-500 mb-2" />
                        <span className="text-lg font-bold">{user.stats.doubts}</span>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Doubts</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-white/5 pb-px">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            "text-sm font-medium pb-3 border-b-2 transition-colors duration-300",
                            activeTab === 'overview' ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-white"
                        )}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={cn(
                            "text-sm font-medium pb-3 border-b-2 transition-colors duration-300",
                            activeTab === 'activity' ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-white"
                        )}
                    >
                        Activity Log
                    </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-8"
                    >
                        {activeTab === 'overview' && (
                            <>
                                {/* Enrolled Workshops */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                                            <PlayCircle size={16} className="text-blue-400" /> Enrolled Workshops
                                        </h3>
                                        <button className="text-xs text-neutral-500 hover:text-white transition-colors">View All</button>
                                    </div>
                                    {userData.joinedWorkshops && userData.joinedWorkshops.length > 0 ? (
                                        <div className="space-y-3">
                                            {userData.joinedWorkshops.map(workshop => (
                                                <div
                                                    key={workshop.id}
                                                    className="group bg-[#18181b] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all cursor-pointer"
                                                    onClick={() => onOpenWorkshop?.(workshop)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                                            {workshop.name}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                                                        <span className="flex items-center gap-1.5"><UserIcon size={12} /> {workshop.author || "Anonymous"}</span>
                                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {workshop.date || "Date TBD"}</span>
                                                        <span className="flex items-center gap-1.5"><Users size={12} /> {workshop.participants}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center border border-white/5 rounded-2xl bg-[#18181b]/50 border-dashed">
                                            <Clock size={24} className="text-neutral-600 mb-3" />
                                            <h4 className="text-sm font-medium text-white mb-1">No Joined Workshops Yet</h4>
                                            <p className="text-xs text-neutral-500">Join a workshop from Home and it will appear here.</p>
                                        </div>
                                    )}
                                </section>

                                {/* My Doubts */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                                            <MessageSquare size={16} className="text-purple-400" /> My Doubts
                                        </h3>
                                        <button className="text-xs text-neutral-500 hover:text-white transition-colors">View All</button>
                                    </div>
                                    <div className="space-y-3">
                                        {myDoubts.length > 0 ? myDoubts.map(doubt => (
                                            <div key={doubt.id} className="group bg-[#18181b] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all flex flex-col gap-3">
                                                <h4 className="text-sm font-medium leading-snug text-neutral-200 group-hover:text-white transition-colors">
                                                    {doubt.question}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(doubt.tags.length > 0 ? doubt.tags : ["GENERAL"]).map(tag => (
                                                        <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-neutral-400 text-xs border border-white/5">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-500">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1 text-white">{doubt.replies} Replies</span>
                                                        <span>{formatTimeAgo(doubt.timestampMs || doubt.createdAt?.toMillis())}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center border border-white/5 rounded-2xl bg-[#18181b]/50 border-dashed">
                                                <Clock size={24} className="text-neutral-600 mb-3" />
                                                <h4 className="text-sm font-medium text-white mb-1">No Doubts Posted Yet</h4>
                                                <p className="text-xs text-neutral-500">Questions you post will appear here.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                        {activeTab === 'activity' && (
                            <>
                                {createdWorkshops.length > 0 ? (
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                                                <Video size={16} className="text-purple-400" /> My Workshops
                                            </h3>
                                        </div>
                                        <div className="space-y-3">
                                            {createdWorkshops.map(workshop => (
                                                <div
                                                    key={workshop.id}
                                                    className="bg-[#18181b] border border-white/10 rounded-3xl p-6 hover:bg-[#27272a] hover:border-white/20 transition-all flex flex-col gap-4 cursor-pointer"
                                                    onClick={() => onOpenWorkshop?.(workshop)}
                                                >
                                                    {/* Profile Section */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                                                            {workshop.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm font-semibold text-white truncate">{workshop.name.split(' ')[0]} {workshop.name.split(' ')[1]}</h3>
                                                            <p className="text-xs text-neutral-400">{workshop.tags[0]}</p>
                                                        </div>
                                                    </div>

                                                    {/* Workshop Title */}
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white mb-2">{workshop.name}</h4>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex items-center justify-between text-xs text-neutral-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} />
                                                            <span>{workshop.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users size={14} />
                                                            <span>{workshop.participants} participants</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border border-white/5 rounded-3xl bg-[#18181b]/50 border-dashed">
                                        <Clock size={32} className="text-neutral-600 mb-4" />
                                        <h3 className="text-sm font-medium text-white mb-1">No Workshops Created</h3>
                                        <p className="text-xs text-neutral-500">Workshops you create will appear here.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    )
}
