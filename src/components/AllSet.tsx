import { Button } from "./ui/Button"
import { Rocket } from "lucide-react"
import { motion, type Variants } from "framer-motion"

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
}

const item: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
}

export function AllSet({ onNext }: { onNext: () => void }) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex h-full flex-col items-center justify-center p-6 text-center relative"
        >
            {/* Celebration background pulses */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full filter blur-[80px] pointer-events-none"
            />

            <motion.div variants={item} className="relative z-10 w-48 h-48 mb-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-white/20 opacity-30"
                />
                <motion.video
                    src="/logo.mp4?v=2"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-full relative z-10 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
            </motion.div>

            <motion.div variants={item} className="relative z-10 max-w-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-neutral-300 border border-white/10 text-xs font-medium tracking-wide mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Setup Complete
                </div>

                <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-4 leading-tight">
                    You're all <span className="text-white/70">set.</span>
                </h2>

                <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-10 max-w-[280px] mx-auto">
                    Your personalized WisDawn is ready. Let's start the journey and unlock your potential.
                </p>

                <Button
                    onClick={onNext}
                    className="group"
                >
                    <span className="relative z-10 flex items-center text-sm font-medium">
                        Enter WisDawn <Rocket size={16} className="ml-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </Button>
            </motion.div>
        </motion.div>
    )
}
