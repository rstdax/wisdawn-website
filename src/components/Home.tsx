import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Globe, PlayCircle, MessageSquare, ChevronRight, Search, User as UserIcon, Target, Plus, Video, PenSquare, X, Paperclip, Calendar, Heart, Menu, BookOpen, Swords, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "../lib/utils"
import { Focus } from "./Focus"
import { Profile } from "./Profile"
import { Library } from "./Library"
import { Quests } from "./Quests"
import { LiveSessions } from "./LiveSessions"
import { DoubtPanel } from "./DoubtPanel"
import { SearchResults } from "./SearchResults"
import { useUser, type WorkshopData } from "../contexts/UserContext"
import { createDoubt, createWorkshop, subscribeToDoubts, subscribeToWorkshops, toggleDoubtLike, type DoubtData } from "../lib/firestore"
import { uploadFiles } from "../lib/storage"
import { ThemeToggle } from "./ThemeToggle"

type DoubtItem = DoubtData
type ChapterDraft = { id: number; title: string; videoUrl: string }

export function Home() {
    const { addCreatedWorkshop, addJoinedWorkshop, currentUser, userData, updateUserData } = useUser()
    const [filter, setFilter] = useState<"LOCALITY" | "GLOBAL">("LOCALITY")
    const [currentView, setCurrentView] = useState<'dashboard' | 'library' | 'quests' | 'live-sessions' | 'search'>('dashboard')
    const [activePanel, setActivePanel] = useState<'none' | 'focus' | 'notifications' | 'profile' | 'doubt'>('none')
    const [selectedDoubt, setSelectedDoubt] = useState<DoubtItem | null>(null)
    const [showCreateMenu, setShowCreateMenu] = useState(false)
    const [isPostQuestionOpen, setIsPostQuestionOpen] = useState(false)
    const [isHostSessionOpen, setIsHostSessionOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [visibleDoubtsCount, setVisibleDoubtsCount] = useState(3)
    const [chapters, setChapters] = useState<ChapterDraft[]>([{ id: 1, title: '', videoUrl: '' }])
    const [doubtFiles, setDoubtFiles] = useState<File[]>([])
    const [postingDoubt, setPostingDoubt] = useState(false)
    const [doubtPostError, setDoubtPostError] = useState("")
    const searchRef = useRef<HTMLDivElement>(null)
    const [panelWidth, setPanelWidth] = useState<string | number>("100%")
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [showLocationPopup, setShowLocationPopup] = useState(false)
    const [isRequestingLocation, setIsRequestingLocation] = useState(false)
    const [locationPopupError, setLocationPopupError] = useState("")
    const [locationPromptDismissed, setLocationPromptDismissed] = useState(false)
    const [joinedToast, setJoinedToast] = useState<{ visible: boolean, workshopName: string }>({
        visible: false,
        workshopName: "",
    })
    const [openedWorkshop, setOpenedWorkshop] = useState<WorkshopData | null>(null)
    const LOCALITY_RADIUS_KM = 10
    const normalizeAvatarUrl = (value: unknown) => {
        if (typeof value !== "string") {
            return ""
        }
        const trimmed = value.trim()
        if (!trimmed || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
            return ""
        }
        return trimmed
    }
    const headerAvatar =
        normalizeAvatarUrl(userData.avatar) ||
        normalizeAvatarUrl(currentUser?.photoURL) ||
        `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(userData.name || currentUser?.displayName || currentUser?.email || "User")}&backgroundColor=b6e3f4`

    const normalizeLocationKey = (location: string) =>
        location
            .toLowerCase()
            .replace(/[^a-z0-9,\s]/g, "")
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
            .slice(0, 2)
            .join("|")

    const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (deg: number) => (deg * Math.PI) / 180
        const earthRadiusKm = 6371
        const dLat = toRad(lat2 - lat1)
        const dLon = toRad(lon2 - lon1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return earthRadiusKm * c
    }

    useEffect(() => {
        const update = () => setPanelWidth(window.innerWidth >= 1024 ? 400 : "100%")
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchActive(false)
                setSearchQuery('')
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (mobileSidebarOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [mobileSidebarOpen])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileSidebarOpen(false)
        }
        if (mobileSidebarOpen) {
            document.addEventListener("keydown", handleEscape)
            return () => document.removeEventListener("keydown", handleEscape)
        }
    }, [mobileSidebarOpen])

    const togglePanel = (panel: 'none' | 'focus' | 'notifications' | 'profile' | 'doubt') => {
        setActivePanel(prev => prev === panel ? 'none' : panel)
    }

    const addChapter = () => {
        setChapters([...chapters, { id: Date.now(), title: '', videoUrl: '' }])
    }

    const deleteChapter = (id: number) => {
        if (chapters.length > 1) {
            setChapters(chapters.filter(ch => ch.id !== id))
        }
    }

    const resetWorkshopForm = () => {
        setChapters([{ id: 1, title: '', videoUrl: '' }])
        setIsHostSessionOpen(false)
    }

    const [workshops, setWorkshops] = useState<WorkshopData[]>([])
    const [trendingDoubts, setTrendingDoubts] = useState<DoubtItem[]>([])

    useEffect(() => {
        const unsubscribe = subscribeToWorkshops(setWorkshops)
        return unsubscribe
    }, [])

    useEffect(() => {
        const unsubscribe = subscribeToDoubts(currentUser?.uid ?? null, setTrendingDoubts)
        return unsubscribe
    }, [currentUser?.uid])

    const toggleLike = async (doubtId: number, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!currentUser) {
            return
        }
        const doubt = trendingDoubts.find((item) => item.id === doubtId)
        if (!doubt) {
            return
        }
        try {
            await toggleDoubtLike(
                doubt.docId ?? String(doubt.id),
                currentUser.uid,
                doubt.sourceCollection ?? "doubts",
            )
        } catch (error) {
            console.error("Failed to like doubt:", error)
        }
    }

    const baseFilteredWorkshops = workshops.filter(w =>
        (w.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.tags || []).some(t => (t || "").toLowerCase().includes(searchQuery.toLowerCase()))
    )
    const baseFilteredDoubts = trendingDoubts.filter(d =>
        (d.question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.tags || []).some(t => (t || "").toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const userLatitude = userData.latitude
    const userLongitude = userData.longitude

    const matchesLocalityByCoords = (params: {
        latitude?: number | null
        longitude?: number | null
    }) => {
        if (
            typeof userLatitude === "number" &&
            typeof userLongitude === "number" &&
            typeof params.latitude === "number" &&
            typeof params.longitude === "number"
        ) {
            return haversineKm(userLatitude, userLongitude, params.latitude, params.longitude) <= LOCALITY_RADIUS_KM
        }
        return false
    }

    const localWorkshops = baseFilteredWorkshops.filter(w =>
        matchesLocalityByCoords({
            latitude: w.latitude,
            longitude: w.longitude,
        })
    )
    const localDoubts = baseFilteredDoubts.filter(d =>
        matchesLocalityByCoords({
            latitude: d.latitude,
            longitude: d.longitude,
        })
    )

    const hasUserCoords = typeof userLatitude === "number" && typeof userLongitude === "number"
    const filteredWorkshops = filter === "GLOBAL"
        ? baseFilteredWorkshops
        : (hasUserCoords ? localWorkshops : [])
    const filteredDoubts = filter === "GLOBAL"
        ? baseFilteredDoubts
        : (hasUserCoords ? localDoubts : [])
    const visibleDoubts = filteredDoubts.slice(0, visibleDoubtsCount)

    const closeSidebar = () => setMobileSidebarOpen(false)

    useEffect(() => {
        if (filter === "LOCALITY" && !hasUserCoords && !showLocationPopup && !locationPromptDismissed) {
            setShowLocationPopup(true)
        }
    }, [filter, hasUserCoords, showLocationPopup, locationPromptDismissed])

    useEffect(() => {
        if (!joinedToast.visible) {
            return
        }
        const timer = setTimeout(() => {
            setJoinedToast({ visible: false, workshopName: "" })
        }, 2400)
        return () => clearTimeout(timer)
    }, [joinedToast.visible])

    const isWorkshopJoined = (workshop: WorkshopData) =>
        userData.joinedWorkshops.some((item) => item.id === workshop.id)

    const handleJoinWorkshop = (workshop: WorkshopData) => {
        if (isWorkshopJoined(workshop)) {
            setJoinedToast({
                visible: true,
                workshopName: `${workshop.name} already joined`,
            })
            return
        }
        addJoinedWorkshop(workshop)
        setJoinedToast({
            visible: true,
            workshopName: `${workshop.name} joined`,
        })
    }

    const handleOpenWorkshop = (workshop: WorkshopData) => {
        setOpenedWorkshop(workshop)
    }

    const resolveLocationName = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            )
            if (!response.ok) {
                throw new Error("reverse geocode failed")
            }
            const data = await response.json() as {
                address?: {
                    city?: string
                    town?: string
                    village?: string
                    state?: string
                    country?: string
                }
            }
            const city = data.address?.city || data.address?.town || data.address?.village || ""
            const state = data.address?.state || ""
            const country = data.address?.country || ""
            const name = [city, state, country].filter(Boolean).join(", ")
            if (name) {
                return name
            }
        } catch {
            // Fallback below.
        }
        return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
    }

    const resolveCoordinatesFromLocation = async (locationText: string) => {
        if (!locationText.trim()) {
            return { latitude: null, longitude: null }
        }
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(locationText)}&limit=1`
            )
            if (!response.ok) {
                throw new Error("forward geocode failed")
            }
            const results = await response.json() as Array<{ lat?: string, lon?: string }>
            const first = results[0]
            if (!first?.lat || !first?.lon) {
                return { latitude: null, longitude: null }
            }
            const latitude = Number(first.lat)
            const longitude = Number(first.lon)
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                return { latitude: null, longitude: null }
            }
            return { latitude, longitude }
        } catch {
            return { latitude: null, longitude: null }
        }
    }

    const requestPreciseLocation = () => {
        if (!("geolocation" in navigator)) {
            setLocationPopupError("Geolocation is not supported on this browser.")
            return
        }
        setLocationPopupError("")
        setIsRequestingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                void (async () => {
                    const { latitude, longitude } = position.coords
                    const locationName = await resolveLocationName(latitude, longitude)
                    updateUserData({
                        location: locationName,
                        latitude,
                        longitude,
                    })
                    setLocationPromptDismissed(false)
                    setIsRequestingLocation(false)
                    setShowLocationPopup(false)
                    setFilter("LOCALITY")
                })()
            },
            (error) => {
                const messageMap: Record<number, string> = {
                    1: "Location permission denied. Please allow location access.",
                    2: "Location unavailable right now. Try again.",
                    3: "Location request timed out. Please retry.",
                }
                setLocationPopupError(messageMap[error.code] || "Unable to detect location.")
                setIsRequestingLocation(false)
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        )
    }

    const sidebarLinks = [
        { id: 'dashboard' as const, label: 'Dashboard', icon: PlayCircle },
        { id: 'library' as const, label: 'Library', icon: BookOpen },
        { id: 'quests' as const, label: 'Quests', icon: Swords },
    ]

    return (
        <div className="h-screen bg-[#09090b] text-white selection:bg-white/20 flex flex-col overflow-hidden">
            {/* Top Navigation - compact on mobile with hamburger, full on md+ */}
            <nav className="shrink-0 border-b border-white/5 flex items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 bg-[#09090b]/80 backdrop-blur-md z-40">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile: hamburger. Desktop: hide */}
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <img src="/logo.png?v=3" alt="WisDawn Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover shrink-0" />
                        <span className="text-base sm:text-lg font-bold tracking-tight truncate">Wis<span className="text-neutral-400">Dawn</span></span>
                    </div>
                    {/* Desktop: tab pills */}
                    <div className="hidden md:flex bg-white/5 p-1 rounded-xl shrink-0">
                        {sidebarLinks.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setCurrentView(id)}
                                className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", currentView === id ? "bg-white/10 text-white shadow-sm" : "text-neutral-400 hover:text-white")}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <ThemeToggle variant="header" />
                    <button
                        onClick={() => { togglePanel('focus'); closeSidebar(); }}
                        className={cn("hidden md:flex px-4 py-2 rounded-xl items-center gap-2 transition-all border border-white/5 shrink-0", activePanel === 'focus' ? "bg-white/10 text-white" : "bg-white/5 text-neutral-300 hover:bg-white/10")}
                    >
                        <Target size={16} className={activePanel === 'focus' ? "text-white" : "text-neutral-400"} />
                        <span className="text-sm font-medium">Focus Mode</span>
                    </button>
                    <div ref={searchRef} className={cn("relative flex items-center transition-all duration-300", isSearchActive ? "w-64 min-w-0" : "w-10")}>
                        <button
                            onClick={() => setIsSearchActive(true)}
                            className={cn("w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors z-10", isSearchActive ? "text-white" : "text-neutral-400 hover:bg-white/10")}
                        >
                            <Search size={18} />
                        </button>
                        <input
                            type="text"
                            placeholder="Search sessions or doubts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                    setCurrentView('search')
                                }
                            }}
                            className={cn(
                                "h-9 sm:h-10 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-all pl-9 sm:pl-10 absolute left-0 right-0",
                                isSearchActive ? "w-full pr-4 opacity-100" : "w-10 opacity-0 cursor-pointer pointer-events-none"
                            )}
                        />
                    </div>
                    <button
                        onClick={() => togglePanel('profile')}
                        className={cn("w-9 h-9 rounded-full border border-white/10 flex items-center justify-center transition-all hover:bg-white/5 shrink-0 overflow-hidden", activePanel === 'profile' ? "bg-white/10 border-white/20" : "")}
                    >
                        {headerAvatar ? (
                            <img src={headerAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={16} className="text-neutral-300" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile sidebar overlay + panel */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                            onClick={closeSidebar}
                            aria-hidden="true"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[min(320px,85vw)] bg-[#0a0a0b] border-r border-white/10 shadow-2xl z-[70] md:hidden flex flex-col overflow-hidden"
                        >
                            {/* Sidebar header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png?v=3" alt="WisDawn" className="w-9 h-9 rounded-xl object-cover" />
                                    <span className="text-lg font-bold tracking-tight">Wis<span className="text-neutral-400">Dawn</span></span>
                                </div>
                                <button
                                    onClick={closeSidebar}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
                                    aria-label="Close menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Nav links with stagger */}
                            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                <div className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase mb-3 px-2">Navigate</div>
                                {sidebarLinks.map(({ id, label, icon: Icon }, i) => (
                                    <motion.button
                                        key={id}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * i, duration: 0.25 }}
                                        onClick={() => { setCurrentView(id); closeSidebar(); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left font-medium transition-all",
                                            currentView === id
                                                ? "bg-white/10 text-white border border-white/10 shadow-lg"
                                                : "text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                            currentView === id ? "bg-white/10" : "bg-white/5"
                                        )}>
                                            <Icon size={20} className={currentView === id ? "text-white" : "text-neutral-400"} />
                                        </div>
                                        <span>{label}</span>
                                        {currentView === id && <ChevronRight size={18} className="ml-auto text-white/60" />}
                                    </motion.button>
                                ))}
                            </nav>

                            {/* Sidebar footer gradient */}
                            <div className="p-4 border-t border-white/5 bg-gradient-to-t from-white/5 to-transparent">
                                <p className="text-[10px] text-neutral-500 font-medium">WisDawn • Version 2.0</p>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 relative flex overflow-hidden">
                <motion.main
                    className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth bg-[#09090b]"
                    id="main-scroll-container"
                >
                    <div className="min-h-full p-4 sm:p-6 lg:p-12 max-w-[1600px] mx-auto w-full relative flex flex-col">

                        <div className="flex-1 pb-28 sm:pb-32">
                            <AnimatePresence mode="wait">
                                {currentView === 'dashboard' && (
                                    <motion.div
                                        key="dashboard"
                                        initial={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }}
                                        animate={{ opacity: 1, x: 0, position: 'relative' }}
                                        exit={{ opacity: 0, x: 20, position: 'absolute' }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="flex flex-col gap-12 w-full"
                                    >
                                        {/* Dashboard Content Wrapper */}
                                        <div className="flex flex-col gap-12 w-full">

                                            {/* Locality / Global filter - main page */}
                                            <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
                                                <button
                                                    onClick={() => {
                                                        if (!hasUserCoords) {
                                                            setLocationPromptDismissed(false)
                                                            setShowLocationPopup(true)
                                                            return
                                                        }
                                                        setFilter("LOCALITY")
                                                    }}
                                                    className={cn(
                                                        "px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all flex items-center gap-2",
                                                        filter === "LOCALITY" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"
                                                    )}
                                                >
                                                    <MapPin size={16} /> Locality
                                                </button>
                                                <button
                                                    onClick={() => setFilter("GLOBAL")}
                                                    className={cn(
                                                        "px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all flex items-center gap-2",
                                                        filter === "GLOBAL" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"
                                                    )}
                                                >
                                                    <Globe size={16} /> Global
                                                </button>
                                            </div>

                                            {/* Workshops Section */}
                                            <section>
                                                <div className="flex items-end justify-between mb-6">
                                                    <div>
                                                        <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Workshops</h2>
                                                        <p className="text-sm text-neutral-400 leading-relaxed">Join interactive workshops and enhance your skills {filter === "LOCALITY" ? "near you" : "worldwide"}.</p>
                                                        {filter === "LOCALITY" && !hasUserCoords && (
                                                            <p className="text-xs text-amber-400 mt-1">Enable precise location to view uploads within 10km.</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setCurrentView('live-sessions')}
                                                        className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group"
                                                    >
                                                        View all <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                                    </button>
                                                </div>

                                                {/* Mobile: horizontal scroll. Desktop: grid */}
                                                <div className="flex md:grid overflow-x-auto md:overflow-visible gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3 snap-x md:snap-none snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                                                    {filteredWorkshops.map((workshop, i) => (
                                                        (() => {
                                                            const workshopName = workshop.name?.trim() || "Untitled Workshop"
                                                            const firstTag = workshop.tags?.[0] || "GENERAL"
                                                            const workshopAuthor = workshop.author?.trim() || "Anonymous"
                                                            const workshopAuthorAvatar = workshop.authorAvatar?.trim() || ""
                                                            const joined = isWorkshopJoined(workshop)
                                                            return (
                                                        <motion.div
                                                            key={workshop.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: Math.min(i * 0.1, 0.3) }}
                                                            onClick={() => handleOpenWorkshop(workshop)}
                                                            className="bg-[#18181b] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:bg-[#27272a] hover:border-white/20 transition-all relative overflow-hidden flex flex-col gap-4 md:gap-6 min-w-[260px] md:min-w-0 w-[75vw] max-w-[280px] md:w-auto md:max-w-none shrink-0 snap-center cursor-pointer"
                                                        >
                                                            {/* Profile Section */}
                                                            <div className="flex items-center gap-2.5 md:gap-3">
                                                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm md:text-xl font-bold shrink-0 overflow-hidden">
                                                                    {workshopAuthorAvatar ? (
                                                                        <img src={workshopAuthorAvatar} alt={workshopAuthor} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        workshopAuthor.charAt(0)
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-sm md:text-base font-semibold text-white truncate">{workshopAuthor}</h3>
                                                                    <p className="text-xs md:text-sm text-neutral-400">{firstTag}</p>
                                                                </div>
                                                            </div>

                                                            {/* Workshop Title */}
                                                            <div className="flex-1 min-h-0">
                                                                <h4 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-3 line-clamp-2 md:line-clamp-none">{workshopName}</h4>
                                                            </div>

                                                            {/* Info & Button */}
                                                            <div className="flex items-center justify-between mt-auto">
                                                                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-neutral-400">
                                                                    <Calendar size={14} className="md:w-4 md:h-4 shrink-0" />
                                                                    <span>{workshop.date || "Date TBD"}</span>
                                                                </div>
                                                                <button
                                                                    onClick={(event) => {
                                                                        event.stopPropagation()
                                                                        handleJoinWorkshop(workshop)
                                                                    }}
                                                                    className={cn(
                                                                        "px-5 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm transition-all active:scale-95",
                                                                        joined
                                                                            ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30"
                                                                            : "bg-white text-black hover:bg-neutral-200",
                                                                    )}
                                                                >
                                                                    {joined ? "Joined" : "Join"}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                            )
                                                        })()
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Trending Doubts Section */}
                                            <section>
                                                <div className="flex items-end justify-between mb-6">
                                                    <div>
                                                        <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Trending Doubts</h2>
                                                        <p className="text-sm text-neutral-400 leading-relaxed">Help resolving questions from the community {filter === "LOCALITY" ? "in your area" : "around the globe"}.</p>
                                                        {filter === "LOCALITY" && !hasUserCoords && (
                                                            <p className="text-xs text-amber-400 mt-1">Enable precise location to view uploads within 10km.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    {visibleDoubts.map((doubt, i) => (
                                                        (() => {
                                                            const author = doubt.author?.trim() || "Anonymous"
                                                            const question = doubt.question?.trim() || "No question text available yet."
                                                            const tags = doubt.tags && doubt.tags.length > 0 ? doubt.tags : ["GENERAL"]
                                                            const authorAvatar = doubt.authorAvatar?.trim() || ""
                                                            return (
                                                        <motion.div
                                                            key={doubt.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="bg-[#18181b] border border-white/10 rounded-2xl p-5 hover:bg-[#27272a] hover:border-white/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                                            onClick={() => {
                                                                setSelectedDoubt(doubt)
                                                                setActivePanel('doubt')
                                                            }}
                                                        >
                                                            <div className="flex flex-col gap-4">
                                                                {/* Top section with author and tags */}
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-xs text-white font-medium">
                                                                            {authorAvatar ? (
                                                                                <img src={authorAvatar} alt={author} className="w-full h-full object-cover rounded-full" />
                                                                            ) : (
                                                                                author.charAt(0)
                                                                            )}
                                                                        </div>
                                                                        <span className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">{author}</span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        {tags.map(tag => (
                                                                            <span key={tag} className="text-[10px] font-semibold tracking-wide text-neutral-400 bg-white/5 border border-white/5 px-2 py-1 rounded-md uppercase shrink-0">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Question */}
                                                                <h3 className="text-base font-medium text-white leading-relaxed">{question}</h3>

                                                                {/* Bottom section with interactions */}
                                                                <div className="flex items-center gap-4 text-xs font-medium text-neutral-400 pt-2 border-t border-white/5">
                                                                    <button
                                                                        onClick={(e) => toggleLike(doubt.id, e)}
                                                                        className={`flex items-center gap-1.5 hover:text-red-400 transition-colors ${doubt.isLiked ? 'text-red-400' : ''}`}
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
                                                            )
                                                        })()
                                                    ))}
                                                </div>

                                                {visibleDoubtsCount < filteredDoubts.length && (
                                                    <div className="mt-6 flex justify-center">
                                                        <button
                                                            onClick={() => setVisibleDoubtsCount(prev => prev + 3)}
                                                            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-neutral-300 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Show more
                                                        </button>
                                                    </div>
                                                )}
                                            </section>
                                        </div>
                                    </motion.div>
                                )}
                                {currentView === 'library' && (
                                    <motion.div
                                        key="library"
                                        initial={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }}
                                        animate={{ opacity: 1, x: 0, position: 'relative' }}
                                        exit={{ opacity: 0, x: 20, position: 'absolute' }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="w-full"
                                    >
                                        <Library />
                                    </motion.div>
                                )}
                                {currentView === 'quests' && (
                                    <motion.div
                                        key="quests"
                                        initial={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }}
                                        animate={{ opacity: 1, x: 0, position: 'relative' }}
                                        exit={{ opacity: 0, x: 20, position: 'absolute' }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="w-full"
                                    >
                                        <Quests />
                                    </motion.div>
                                )}
                                {currentView === 'live-sessions' && (
                                    <motion.div
                                        key="live-sessions"
                                        initial={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }}
                                        animate={{ opacity: 1, x: 0, position: 'relative' }}
                                        exit={{ opacity: 0, x: 20, position: 'absolute' }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="w-full h-full"
                                    >
                                        <LiveSessions onBack={() => setCurrentView('dashboard')} />
                                    </motion.div>
                                )}
                                {currentView === 'search' && (
                                    <motion.div
                                        key="search"
                                        initial={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }}
                                        animate={{ opacity: 1, x: 0, position: 'relative' }}
                                        exit={{ opacity: 0, x: 20, position: 'absolute' }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="w-full h-full"
                                    >
                                        <SearchResults
                                            searchQuery={searchQuery}
                                            workshops={workshops}
                                            doubts={trendingDoubts}
                                            onBack={() => {
                                                setCurrentView('dashboard')
                                                setSearchQuery('')
                                                setIsSearchActive(false)
                                            }}
                                            onDoubtClick={(doubt) => {
                                                setSelectedDoubt(doubt)
                                                setActivePanel('doubt')
                                            }}
                                            onToggleLike={toggleLike}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <footer className="mt-20 pt-8 border-t border-white/5 pb-12 flex flex-col md:flex-row items-center justify-between gap-4 px-4 w-full">
                            <div className="flex items-center gap-3">
                                <img src="/logo.png?v=3" alt="WisDawn Logo" className="w-6 h-6 rounded-md object-cover" />
                                <span className="font-medium text-sm text-neutral-400">© 2026 WisDawn. All rights reserved.</span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-neutral-500">
                                <button className="hover:text-white transition-colors">Privacy Policy</button>
                                <button className="hover:text-white transition-colors">Terms of Service</button>
                                <button className="hover:text-white transition-colors">Contact Support</button>
                            </div>
                        </footer>
                    </div>
                </motion.main>

                {/* Floating Action Button (FAB) relative to DashboardView */}
                {currentView === 'dashboard' && (
                    <div className="fixed bottom-6 left-4 sm:bottom-8 sm:left-8 z-50 flex flex-col items-start gap-3 sm:gap-4 pointer-events-none">
                        {/* Menu Items */}
                        <AnimatePresence>
                            {showCreateMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                    className="flex flex-col gap-3 pointer-events-auto origin-bottom-left"
                                >
                                    <button
                                        onClick={() => { setIsPostQuestionOpen(true); setShowCreateMenu(false); }}
                                        className="flex items-center gap-3 px-4 py-2 bg-[#18181b] border border-white/10 hover:border-white/30 rounded-2xl text-sm font-medium transition-all shadow-lg hover:bg-white/5 active:scale-95 text-white">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                            <PenSquare size={16} />
                                        </div>
                                        Post Question
                                    </button>
                                    <button
                                        onClick={() => { setIsHostSessionOpen(true); setShowCreateMenu(false); }}
                                        className="flex items-center gap-3 px-4 py-2 bg-[#18181b] border border-white/10 hover:border-white/30 rounded-2xl text-sm font-medium transition-all shadow-lg hover:bg-white/5 active:scale-95 text-white mb-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                            <Video size={16} />
                                        </div>
                                        Start Workshop
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Button */}
                        <button
                            onClick={() => setShowCreateMenu(!showCreateMenu)}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all pointer-events-auto z-50 relative"
                        >
                            <motion.div
                                animate={{ rotate: showCreateMenu ? 135 : 0 }}
                                transition={{ duration: 0.3, type: 'spring' }}
                            >
                                <Plus size={24} />
                            </motion.div>
                        </button>
                    </div>
                )}

                {/* Right Slide-out Panel */}
                <AnimatePresence>
                    {activePanel !== 'none' && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0, x: 50 }}
                            animate={{ width: panelWidth, opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: 50 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                            className="h-full shrink-0 border-l border-white/5 bg-[#09090b] shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.5)] overflow-hidden absolute right-0 z-50 lg:relative lg:z-auto"
                        >
                            <div className="w-full min-w-0 lg:w-[400px] h-full flex flex-col">
                                {activePanel === 'focus' && <Focus onClose={() => togglePanel('none')} />}
                                {activePanel === 'profile' && (
                                    <Profile
                                        onClose={() => togglePanel('none')}
                                        onOpenWorkshop={(workshop) => {
                                            setActivePanel('none')
                                            handleOpenWorkshop(workshop)
                                        }}
                                    />
                                )}
                                {activePanel === 'doubt' && <DoubtPanel doubt={selectedDoubt} onClose={() => togglePanel('none')} />}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Modals */}
                <AnimatePresence>
                    {showLocationPopup && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                                className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181b] p-5 shadow-2xl"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">Enable Precise Location</h3>
                                <p className="text-sm text-neutral-400 mb-4">
                                    Locality feed shows uploads within 10km. Allow precise location to continue.
                                </p>
                                {locationPopupError && (
                                    <p className="text-xs text-red-400 mb-3">{locationPopupError}</p>
                                )}
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setShowLocationPopup(false)
                                            setLocationPopupError("")
                                            setLocationPromptDismissed(true)
                                        }}
                                        className="px-4 py-2 text-sm rounded-lg border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Not now
                                    </button>
                                    <button
                                        onClick={requestPreciseLocation}
                                        disabled={isRequestingLocation}
                                        className="px-4 py-2 text-sm rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        {isRequestingLocation && <Loader2 size={14} className="animate-spin" />}
                                        Enable
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {isPostQuestionOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-white/5">
                                    <h3 className="text-lg font-semibold text-white">Post a Question</h3>
                                    <button onClick={() => setIsPostQuestionOpen(false)} className="text-neutral-400 hover:text-white transition-colors" aria-label="Close post question modal">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!currentUser) {
                                        return;
                                    }
                                    const formData = new FormData(e.currentTarget);
                                    const doubtId = typeof crypto !== "undefined" && "randomUUID" in crypto
                                        ? crypto.randomUUID()
                                        : String(Date.now());
                                    setPostingDoubt(true);
                                    setDoubtPostError("");

                                    const newDoubt = {
                                        id: doubtId,
                                        question: formData.get('question') as string,
                                        author: userData.name || currentUser.email || "Anonymous",
                                        authorUid: currentUser.uid,
                                        replies: 0,
                                        tags: (formData.get('tags') as string).split(',').map(t => t.trim().toUpperCase()).filter(Boolean),
                                        likes: 0,
                                        upvotes: 0,
                                        attachmentUrls: [] as string[],
                                        imageUrl: null as string | null,
                                        authorAvatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(userData.name || currentUser.email || "User")}&backgroundColor=c0aede`,
                                        location: userData.location || "",
                                        localityKey: normalizeLocationKey(userData.location || ""),
                                        latitude: userData.latitude,
                                        longitude: userData.longitude,
                                    };

                                    void (async () => {
                                        try {
                                            const fallbackCoords =
                                                typeof userData.latitude === "number" && typeof userData.longitude === "number"
                                                    ? { latitude: userData.latitude, longitude: userData.longitude }
                                                    : await resolveCoordinatesFromLocation(userData.location || "")
                                            const attachmentUrls = await uploadFiles(
                                                `post_images/${doubtId}`,
                                                doubtFiles,
                                            );
                                            await createDoubt({
                                                ...newDoubt,
                                                attachmentUrls,
                                                imageUrl: attachmentUrls[0] ?? null,
                                                latitude: fallbackCoords.latitude,
                                                longitude: fallbackCoords.longitude,
                                            });
                                            setIsPostQuestionOpen(false);
                                            setDoubtFiles([]);
                                        } catch (error) {
                                            console.error("Failed to create doubt:", error);
                                            setDoubtPostError("Failed to post doubt. Please try again.");
                                        } finally {
                                            setPostingDoubt(false);
                                        }
                                    })();
                                }} className="p-4 flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Your Question</label>
                                        <textarea
                                            name="question"
                                            required
                                            placeholder="What's your doubt? Be specific..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-neutral-500 min-h-[100px] resize-none focus:outline-none focus:border-white/30 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tags (comma separated)</label>
                                        <input
                                            name="tags"
                                            required
                                            type="text"
                                            placeholder="e.g. REACT, CODING, MATH"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex items-center gap-2">
                                            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 transition-colors">
                                                <Paperclip size={14} /> Attach File
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    multiple
                                                    accept="image/*,.pdf"
                                                    onChange={(event) => {
                                                        const files = Array.from(event.target.files ?? []);
                                                        setDoubtFiles(files);
                                                    }}
                                                />
                                            </label>
                                            <span className="text-[10px] text-neutral-500 hidden sm:block">
                                                {doubtFiles.length > 0
                                                    ? `${doubtFiles.length} file(s) selected`
                                                    : "Max 5MB (Image/PDF)"}
                                            </span>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={postingDoubt}
                                            className="px-5 py-2 bg-white text-black text-sm font-medium rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            Post Question
                                        </button>
                                    </div>
                                    {doubtPostError && (
                                        <p className="text-red-400 text-xs">{doubtPostError}</p>
                                    )}
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {isHostSessionOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-[#18181b] z-10">
                                    <h3 className="text-lg font-semibold text-white">Start Workshop</h3>
                                    <button onClick={resetWorkshopForm} className="text-neutral-400 hover:text-white transition-colors" aria-label="Close start workshop modal">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!currentUser) {
                                        return;
                                    }
                                    const formData = new FormData(e.currentTarget);
                                    void (async () => {
                                        try {
                                            const today = new Date();
                                            const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            const fallbackCoords =
                                                typeof userData.latitude === "number" && typeof userData.longitude === "number"
                                                    ? { latitude: userData.latitude, longitude: userData.longitude }
                                                    : await resolveCoordinatesFromLocation(userData.location || "");
                                            const newWorkshop: WorkshopData & { hostUid: string } = {
                                                id: Date.now(),
                                                name: formData.get('title') as string,
                                                date: formattedDate,
                                                participants: 0,
                                                tags: [(formData.get('topic') as string).toUpperCase()],
                                                location: userData.location || "",
                                                localityKey: normalizeLocationKey(userData.location || ""),
                                                latitude: fallbackCoords.latitude,
                                                longitude: fallbackCoords.longitude,
                                                author: userData.name || currentUser.email || "Anonymous",
                                                authorAvatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(userData.name || currentUser.email || "User")}&backgroundColor=b6e3f4`,
                                                chapters: chapters.map((chapter, index) => ({
                                                    id: typeof crypto !== "undefined" && "randomUUID" in crypto
                                                        ? crypto.randomUUID()
                                                        : String(chapter.id),
                                                    title: chapter.title?.trim() || `chapter ${index + 1}`,
                                                    videoUrl: chapter.videoUrl?.trim() || "",
                                                    pdfUrl: "",
                                                    imageUrl: "",
                                                })),
                                                hostUid: currentUser.uid,
                                            } as WorkshopData & {
                                                hostUid: string
                                                author: string
                                                authorAvatar: string
                                                chapters: Array<{
                                                    id: string
                                                    title: string
                                                    videoUrl: string
                                                    pdfUrl: string
                                                    imageUrl: string
                                                }>
                                            };

                                            await createWorkshop(newWorkshop);
                                            addCreatedWorkshop(newWorkshop);
                                            resetWorkshopForm();
                                        } catch (error) {
                                            console.error("Failed to create workshop:", error);
                                        }
                                    })();
                                }} className="p-6 flex flex-col gap-6">
                                    <div>
                                        <input
                                            name="title"
                                            required
                                            type="text"
                                            placeholder="Workshop Title"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            name="topic"
                                            required
                                            type="text"
                                            placeholder="Topic / Domain"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <h4 className="text-base font-semibold text-white mb-4">Chapters</h4>
                                        <div className="space-y-4">
                                            {chapters.map((chapter, index) => (
                                                <div key={chapter.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-medium text-white">Chapter {index + 1}</span>
                                                        {chapters.length > 1 && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => deleteChapter(chapter.id)}
                                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Chapter Title"
                                                        value={chapter.title}
                                                        onChange={(event) => {
                                                            const nextTitle = event.target.value
                                                            setChapters((prev) =>
                                                                prev.map((item) =>
                                                                    item.id === chapter.id
                                                                        ? { ...item, title: nextTitle }
                                                                        : item
                                                                )
                                                            )
                                                        }}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors mb-3"
                                                    />
                                                    <input
                                                        type="url"
                                                        placeholder="Chapter Video URL (YouTube or direct link)"
                                                        value={chapter.videoUrl}
                                                        onChange={(event) => {
                                                            const nextVideoUrl = event.target.value
                                                            setChapters((prev) =>
                                                                prev.map((item) =>
                                                                    item.id === chapter.id
                                                                        ? { ...item, videoUrl: nextVideoUrl }
                                                                        : item
                                                                )
                                                            )
                                                        }}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={addChapter}
                                            className="w-full mt-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-neutral-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={18} /> Add Chapter
                                        </button>
                                    </div>

                                    <button type="submit" className="w-full py-3 bg-white text-black rounded-xl font-semibold text-base hover:bg-neutral-200 transition-colors">
                                        Publish
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {openedWorkshop && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#18181b] p-5 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Workshop</h3>
                                    <button
                                        onClick={() => setOpenedWorkshop(null)}
                                        className="text-neutral-400 hover:text-white transition-colors"
                                        aria-label="Close opened workshop modal"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs uppercase tracking-wider text-neutral-400 mb-1">User</p>
                                        <p className="text-base font-semibold text-white">
                                            {userData.name || currentUser?.displayName || currentUser?.email || openedWorkshop.author || "Anonymous"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs uppercase tracking-wider text-neutral-400 mb-1">Workshop Name</p>
                                        <p className="text-lg font-bold text-white">{openedWorkshop.name}</p>
                                    </div>

                                    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <h4 className="text-sm font-semibold text-white mb-3">Chapters</h4>
                                        {openedWorkshop.chapters && openedWorkshop.chapters.length > 0 ? (
                                            <div className="space-y-2">
                                                {openedWorkshop.chapters.map((chapter, index) => (
                                                    <div
                                                        key={chapter.id || `${openedWorkshop.id}-chapter-${index}`}
                                                        className="rounded-lg border border-white/10 bg-[#111114] px-3 py-2"
                                                    >
                                                        <p className="text-xs text-neutral-400 mb-0.5">Chapter {index + 1}</p>
                                                        <p className="text-sm text-white font-medium">
                                                            {chapter.title?.trim() || `Chapter ${index + 1}`}
                                                        </p>
                                                        {chapter.videoUrl || chapter.youtubeUrl ? (
                                                            <a
                                                                href={(chapter.videoUrl || chapter.youtubeUrl)!}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-1 inline-block text-xs text-blue-400 hover:text-blue-300 underline"
                                                            >
                                                                Open Video
                                                            </a>
                                                        ) : (
                                                            <p className="mt-1 text-xs text-neutral-500">No video link added</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-neutral-400">No chapters available for this workshop yet.</p>
                                        )}
                                    </section>
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setOpenedWorkshop(null)
                                            setCurrentView('live-sessions')
                                        }}
                                        className="px-4 py-2 text-sm rounded-xl bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {joinedToast.visible && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.96 }}
                            className="fixed bottom-6 right-4 sm:right-8 z-[130] rounded-xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200 shadow-xl"
                        >
                            {joinedToast.workshopName}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
