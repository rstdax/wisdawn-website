import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { ArrowRight, Sparkles, Brain, Globe, Zap, Users, Shield, Target, ChevronLeft, ChevronRight, Mail, MapPin, Phone, MessageSquare, Award, Menu, X, Smartphone, ExternalLink } from "lucide-react"
import { cn } from "../lib/utils"
import { ThemeToggle } from "./ThemeToggle"

/** Official Google Play icon (4-color triangle, matches Play Store branding) */
function GooglePlayIcon({ className, size = 24 }: { className?: string; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path fill="none" d="M0,0h40v40H0V0z" />
            <g>
                <path d="M19.7,19.2L4.3,35.3c0,0,0,0,0,0c0.5,1.7,2.1,3,4,3c0.8,0,1.5-0.2,2.1-0.6l0,0l17.4-9.9L19.7,19.2z" fill="#EA4335" />
                <path d="M35.3,16.4L35.3,16.4l-7.5-4.3l-8.4,7.4l8.5,8.3l7.5-4.2c1.3-0.7,2.2-2.1,2.2-3.6C37.5,18.5,36.6,17.1,35.3,16.4z" fill="#FBBC04" />
                <path d="M4.3,4.7C4.2,5,4.2,5.4,4.2,5.8v28.5c0,0.4,0,0.7,0.1,1.1l16-15.7L4.3,4.7z" fill="#4285F4" />
                <path d="M19.8,20l8-7.9L10.5,2.3C9.9,1.9,9.1,1.7,8.3,1.7c-1.9,0-3.6,1.3-4,3c0,0,0,0,0,0L19.8,20z" fill="#34A853" />
            </g>
        </svg>
    )
}

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", bounce: 0.4 } }
}

const stagger: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
}

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.rst.wisdawn"

export function LandingPage({
    onLogin,
    onGetStarted,
    hideLogin = false,
    showThemeToggle = false,
}: {
    onLogin: () => void,
    onGetStarted: () => void,
    hideLogin?: boolean
    showThemeToggle?: boolean
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const previewImages = [
        "/app-preview-1.png",
        "/app-preview-2.png",
        "/app-preview-3.png",
        "/app-preview-4.png"
    ]

    const mobilePreviewImages = [
        "/mobile-preview-1.png",
        "/mobile-preview-2.jpeg",
        "/mobile-preview-3.jpeg",
        "/mobile-preview-4.jpeg"
    ]

    const [currentMobileIndex, setCurrentMobileIndex] = useState(0)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const nextImage = useCallback(() => {
        setCurrentImageIndex((prev) => (prev + 1) % previewImages.length)
    }, [previewImages.length])

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? previewImages.length - 1 : prev - 1))
    }

    const nextMobileImage = useCallback(() => {
        setCurrentMobileIndex((prev) => (prev + 1) % mobilePreviewImages.length)
    }, [mobilePreviewImages.length])

    const prevMobileImage = () => {
        setCurrentMobileIndex((prev) => (prev === 0 ? mobilePreviewImages.length - 1 : prev - 1))
    }

    const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault()
        setMobileMenuOpen(false)
        const el = document.getElementById(sectionId)
        if (el) {
            setTimeout(() => {
                el.scrollIntoView({ behavior: "smooth", block: "start" })
            }, 150)
        }
    }

    // Auto-advance sliders
    useEffect(() => {
        const interval = setInterval(() => {
            nextImage()
        }, 2000)
        return () => clearInterval(interval)
    }, [nextImage])

    useEffect(() => {
        const interval = setInterval(() => {
            nextMobileImage()
        }, 2000)
        return () => clearInterval(interval)
    }, [nextMobileImage])

    return (
        <div className="min-h-screen bg-bg-dark text-white selection:bg-white/20 overflow-x-hidden relative">
            {/* Ambient Base Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full border-b border-white/5 bg-bg-dark/80 backdrop-blur-xl z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png?v=3" alt="WisDawn Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover shrink-0" />
                        <span className="text-lg sm:text-xl font-bold tracking-tight">Wis<span className="text-neutral-400">Dawn</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-neutral-400">
                        <a href="#features" className="hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
                        <a href="#about-us" className="hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>About Us</a>
                        <a href="#contact-us" className="hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact Us</a>
                    </nav>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {showThemeToggle && <ThemeToggle variant="header" />}
                        {!hideLogin && (
                            <button
                                onClick={onLogin}
                                className="px-4 py-2 sm:px-5 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 text-sm font-medium transition-all text-white hidden sm:flex"
                            >
                                Login
                            </button>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/5 text-white"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
                {/* Mobile menu dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/5 bg-bg-dark/95 backdrop-blur-xl overflow-hidden"
                        >
                            <nav className="flex flex-col px-4 py-4 gap-1">
                                <a href="#features" className="py-3 text-neutral-400 hover:text-white transition-colors cursor-pointer" onClick={(e) => handleMobileNavClick(e, "features")}>Features</a>
                                <a href="#about-us" className="py-3 text-neutral-400 hover:text-white transition-colors cursor-pointer" onClick={(e) => handleMobileNavClick(e, "about-us")}>About Us</a>
                                <a href="#contact-us" className="py-3 text-neutral-400 hover:text-white transition-colors cursor-pointer" onClick={(e) => handleMobileNavClick(e, "contact-us")}>Contact Us</a>
                                {!hideLogin && (
                                    <button type="button" onClick={() => { setMobileMenuOpen(false); onLogin(); }} className="py-3 text-left text-white font-medium border-t border-white/5 mt-2 w-full cursor-pointer">
                                        Login
                                    </button>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="relative z-10 pt-24 sm:pt-32 lg:pt-48 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
                {/* Hero Section */}
                <motion.section
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 max-w-6xl mx-auto"
                >
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 order-2 lg:order-1">
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-medium text-neutral-300 mb-6 sm:mb-8 backdrop-blur-sm">
                            <Sparkles size={14} className="sm:w-4 sm:h-4 text-yellow-500 shrink-0" />
                            <span className="hidden sm:inline">Welcome to the future of learning - Version 2.0</span>
                            <span className="sm:hidden">Version 2.0</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.1]">
                            Unlock your true <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-neutral-200 to-neutral-600">potential.</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-neutral-400 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
                            WisDawn brings world-class cognitive testing, live academic sessions, and vibrant community problem solving into one beautiful platform.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <button
                                onClick={onGetStarted}
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] group"
                            >
                                Get Started
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a
                                href={PLAY_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#1a1a1a] border border-white/20 text-white font-medium text-base flex items-center justify-center gap-3 hover:bg-[#252525] hover:border-white/30 transition-all group"
                            >
                                <div className="flex items-center justify-center">
                                    <GooglePlayIcon size={24} className="shrink-0" />
                                </div>
                                <span>Download on Google Play</span>
                                <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                            </a>
                        </motion.div>
                    </div>

                    {/* Brand Character - on mobile/tablet shown first (top) */}
                    <motion.div
                        variants={fadeUp}
                        className="relative flex-shrink-0 order-1 lg:order-2"
                    >
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
                            {/* Glow effect behind character */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
                            
                            {/* Character video */}
                            <motion.video
                                src="/logo.mp4?v=2"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="relative w-full h-full object-cover rounded-3xl shadow-2xl"
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            />
                        </div>
                    </motion.div>
                </motion.section>

                {/* App Interface Card Slider */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1, type: "spring" }}
                    className="mt-16 sm:mt-24 md:mt-32 relative mx-auto max-w-6xl px-2 sm:px-4 group"
                >
                    <div className="relative min-h-[200px] sm:min-h-[280px] md:min-h-[340px] flex items-center justify-center">
                        <AnimatePresence initial={false} mode="popLayout">
                            {previewImages.map((src, idx) => {
                                // Calculate distance from center to scale and position cards
                                const offset = idx - currentImageIndex;
                                const isCenter = offset === 0;
                                const zIndex = 10 - Math.abs(offset);

                                // Only render cards that are relatively close to center to save DOM nodes
                                if (Math.abs(offset) > 2) return null;

                                return (
                                    <motion.div
                                        key={src}
                                        initial={{ opacity: 0, x: offset > 0 ? 1000 : -1000, scale: 0.5 }}
                                        animate={{
                                            opacity: 1 - Math.abs(offset) * 0.15,
                                            x: offset * 140, // Spread out further to see the rotation
                                            y: Math.abs(offset) * 40, // Drop down in an arc
                                            rotate: offset * 8, // Fan rotation angle
                                            scale: 1 - Math.abs(offset) * 0.05,
                                            zIndex
                                        }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
                                        className={`absolute w-[90vw] sm:w-[80vw] max-w-4xl aspect-video rounded-2xl sm:rounded-3xl border ${isCenter ? 'border-white/20 shadow-[0_0_100px_rgba(40,100,255,0.2)]' : 'border-white/5'} bg-[#18181b] overflow-hidden cursor-pointer`}
                                        onClick={() => {
                                            if (offset !== 0) setCurrentImageIndex(idx)
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-linear-to-t from-bg-dark/80 via-transparent to-transparent z-10 pointer-events-none" />
                                        <img
                                            src={src}
                                            alt={`Platform Preview ${idx + 1}`}
                                            className={`w-full h-full object-cover transition-all duration-700 ${isCenter ? 'mix-blend-normal' : 'mix-blend-luminosity'}`}
                                        />

                                        {/* Overlay UI elements only on center card */}
                                        {isCenter && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="absolute inset-x-10 bottom-10 z-20 hidden md:flex justify-between items-end pointer-events-none"
                                            >
                                                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-64 shadow-2xl">
                                                    <div className="w-10 h-10 rounded-full bg-white/20 mb-3" />
                                                    <div className="h-2 w-3/4 bg-white/20 rounded-full mb-2" />
                                                    <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                                                </div>
                                                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-48 shadow-2xl flex flex-col items-center">
                                                    <Target className="text-blue-400 mb-2" size={32} />
                                                    <div className="h-3 w-1/2 bg-white/30 rounded-full mb-1" />
                                                    <div className="text-xs text-white/50">Focus Mode</div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {/* Slider Controls */}
                        <div className="absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-2 sm:px-10 pointer-events-none">
                            <button
                                onClick={prevImage}
                                className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Pagination Indicators */}
                    <div className="flex justify-center gap-3 mt-6">
                        {previewImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* Mobile App Interface Card Slider */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, type: "spring" }}
                    className="mt-20 sm:mt-32 relative mx-auto max-w-5xl px-2 sm:px-4 group"
                >
                    <div className="text-center mb-8 sm:mb-12 px-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Available everywhere you go.</h2>
                        <p className="text-neutral-400 text-sm sm:text-base">Experience seamless learning on our mobile application.</p>
                    </div>

                    <div className="relative min-h-[380px] sm:min-h-[480px] md:min-h-[550px] flex items-center justify-center">
                        <AnimatePresence initial={false} mode="popLayout">
                            {mobilePreviewImages.map((src, idx) => {
                                const offset = idx - currentMobileIndex;
                                const isCenter = offset === 0;
                                const zIndex = 10 - Math.abs(offset);

                                if (Math.abs(offset) > 2) return null;

                                return (
                                    <motion.div
                                        key={src}
                                        initial={{ opacity: 0, x: offset > 0 ? 500 : -500, scale: 0.5 }}
                                        animate={{
                                            opacity: 1 - Math.abs(offset) * 0.15,
                                            x: offset * 60, // Tighter horizontal spread for portrait cards
                                            y: Math.abs(offset) * 20, // Gentle arc
                                            rotate: offset * 6, // Less extreme fan rotation for portrait
                                            scale: 1 - Math.abs(offset) * 0.05,
                                            zIndex
                                        }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
                                        className={`absolute w-44 sm:w-56 md:w-64 aspect-[9/19] rounded-[2rem] sm:rounded-[2.5rem] border-4 sm:border-[6px] ${isCenter ? 'border-neutral-800 shadow-[0_0_100px_rgba(168,85,247,0.2)]' : 'border-neutral-900'} bg-[#18181b] overflow-hidden cursor-pointer`}
                                        onClick={() => {
                                            if (offset !== 0) setCurrentMobileIndex(idx)
                                        }}
                                    >
                                        <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 flex justify-center">
                                            <div className="w-1/3 h-4 bg-neutral-900 rounded-b-xl" />
                                        </div>
                                        <div className="absolute inset-0 bg-linear-to-t from-bg-dark/80 via-transparent to-transparent z-10 pointer-events-none" />
                                        <img
                                            src={src}
                                            alt={`Mobile Preview ${idx + 1}`}
                                            className={`w-full h-full object-cover transition-all duration-700 pt-6 ${isCenter ? 'mix-blend-normal' : 'mix-blend-luminosity'}`}
                                        />
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {/* Slider Controls */}
                        <div className="absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-2 sm:px-10 pointer-events-none">
                            <button
                                onClick={prevMobileImage}
                                className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl opacity-0 xl:opacity-100 group-hover:opacity-100"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextMobileImage}
                                className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl opacity-0 xl:opacity-100 group-hover:opacity-100"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Pagination Indicators */}
                    <div className="flex justify-center gap-3 mt-8">
                        {mobilePreviewImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentMobileIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentMobileIndex ? 'w-10 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                aria-label={`Go to mobile slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* Download the app - CTA section */}
                <motion.section
                    id="download-app"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                    className="mt-20 sm:mt-28"
                >
                    <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent p-8 sm:p-12 shadow-[0_0_60px_-20px_rgba(168,85,247,0.15)]">
                        <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,rgba(168,85,247,0.08)_0%,transparent_50%,rgba(59,130,246,0.06)_100%)] pointer-events-none" />
                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                            <div className="flex items-center gap-5 md:gap-6 text-center md:text-left">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                                    <Smartphone size={36} className="text-white sm:w-10 sm:h-10" />
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Take WisDawn with you</h2>
                                    <p className="text-neutral-400 text-sm sm:text-base max-w-md">
                                        Download the app for Android and learn on the go—workshops, doubts, and focus mode in your pocket.
                                    </p>
                                </div>
                            </div>
                            <a
                                href={PLAY_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white text-black font-semibold text-base hover:bg-neutral-100 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shrink-0 group"
                            >
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white to-neutral-50 flex items-center justify-center shadow-sm border border-neutral-100">
                                    <GooglePlayIcon size={28} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Get it on</span>
                                    <span className="block text-sm font-bold">Google Play</span>
                                </div>
                                <ExternalLink size={18} className="text-neutral-500 group-hover:text-black transition-colors" />
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* Features Grid */}
                <section id="features" className="mt-20 sm:mt-32 pt-12 sm:pt-20 border-t border-white/5">
                    <div className="text-center mb-10 sm:mb-16 px-2">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Everything you need to succeed</h2>
                        <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">Master complex subjects faster with our community and AI-driven tools.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[
                            { icon: Brain, title: "Cognitive Load Balancing", desc: "Adaptive learning algorithms adjust difficulty based on your mental fatigue." },
                            { icon: Users, title: "Global Peer Networks", desc: "Connect with study partners worldwide based on shared interests and majors." },
                            { icon: Zap, title: "Live Doubt Resolution", desc: "Get unstuck instantly with trending doubts answered by top scholars." },
                            { icon: Target, title: "Zen Focus Mode", desc: "Block distractions and track deep work with our integrated pomodoro and ambient tools." },
                            { icon: Globe, title: "Local & Global Hubs", desc: "Toggle between campus-specific content and world-wide academic resources." },
                            { icon: Shield, title: "Verified Credentials", desc: "Build a persistent academic profile mapped to real-world achievements." },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group flex items-center gap-4 sm:flex-col sm:items-stretch sm:gap-0",
                                    i % 2 === 0 ? "flex-row" : "flex-row-reverse sm:flex-row"
                                )}
                            >
                                <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 sm:mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon size={24} className="text-white w-6 h-6 sm:w-6 sm:h-6" />
                                </div>
                                <div className="min-w-0 flex-1 sm:flex-initial">
                                    <h3 className="text-base sm:text-xl font-semibold text-white mb-1 sm:mb-2">{feature.title}</h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* About Us Section */}
                <section id="about-us" className="mt-20 sm:mt-32 pt-12 sm:pt-20 border-t border-white/5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-10 sm:mb-16 px-2"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Pioneering the Future of <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">Global Education</span></h2>
                        <p className="text-neutral-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            WisDawn was founded on a simple principle: World-class education should be accessible to everyone, everywhere, at any time. We are building the infrastructure for the next generation of online learning, combining elite academia with powerful community networks.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20">
                        {[
                            { icon: Users, title: "Our Community", desc: "Over 500,000 active students and educators driving collaborative problem-solving across 150+ countries." },
                            { icon: Shield, title: "Our Promise", desc: "We guarantee an ad-free, completely secure learning environment where your data is your own." },
                            { icon: Globe, title: "Global Reach", desc: "Our localized chapters ensure that whether you're in New York or New Delhi, you have access to regionally relevant resources." },
                            { icon: Award, title: "Excellence First", desc: "Partnered with top global institutions to bring you Ivy League level rigor, straight to your screen." },
                        ].map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/5"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                    <item.icon size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="w-full aspect-video sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay z-10" />
                        <img
                            src="/team-photo.jpeg"
                            alt="Our Team"
                            className="w-full h-full object-cover grayscale opacity-60"
                        />
                        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-8 text-center bg-black/40">
                            <div>
                                <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4">Join the Movement</h2>
                                <p className="text-neutral-300 max-w-lg mx-auto text-sm sm:text-base">We're always looking for brilliant educators, developers, and designers to join our core team.</p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Contact Us Section */}
                <section id="contact-us" className="mt-20 sm:mt-32 pt-12 sm:pt-20 border-t border-white/5 flex flex-col lg:flex-row gap-10 sm:gap-16 lg:gap-24">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 lg:max-w-md"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Get in <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">touch with us.</span></h2>
                        <p className="text-neutral-400 text-base sm:text-lg mb-8 sm:mb-12 leading-relaxed">
                            Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.
                        </p>

                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center gap-3 text-white mb-2">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Mail size={20} /></div>
                                    <h3 className="font-semibold">Email</h3>
                                </div>
                                <p className="text-neutral-400 pl-12 hover:text-blue-400 transition-colors cursor-pointer">rstrohan1@gmail.com</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 text-white mb-2">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Phone size={20} /></div>
                                    <h3 className="font-semibold">Phone</h3>
                                </div>
                                <p className="text-neutral-400 pl-12">+91 70995 52355</p>
                                <p className="text-neutral-400 pl-12">Mon-Fri from 8am to 5pm (PST)</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 text-white mb-2">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/10"><MapPin size={20} /></div>
                                    <h3 className="font-semibold">Headquarters</h3>
                                </div>
                                <p className="text-neutral-400 pl-12">Nagaon , 782002<br />Assam<br />India</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex-1 bg-white/5 border border-white/5 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden"
                    >
                        {/* Subtle glow behind form */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                        <form className="relative z-10 space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-300 ml-1">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-600"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-300 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-600"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-600"
                                    placeholder="jane@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300 ml-1">Message</label>
                                <textarea
                                    rows={5}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-600 resize-none"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <button
                                className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 mt-4"
                            >
                                Send Message
                                <MessageSquare size={18} />
                            </button>
                        </form>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-black/40 mt-12 sm:mt-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 text-center md:text-left">
                        <img src="/logo.png?v=3" alt="WisDawn Logo" className="w-6 h-6 rounded-md object-cover shrink-0" />
                        <span className="font-medium text-xs sm:text-sm text-neutral-400">© 2026 WisDawn. All rights reserved.</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium text-neutral-500">
                        <a href="#about-us" className="hover:text-white transition-colors">About Us</a>
                        <a href="#contact-us" className="hover:text-white transition-colors">Contact Us</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
