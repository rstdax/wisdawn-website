import { motion } from "framer-motion"

export function ProgressBar({ progress, className }: { progress: number; className?: string }) {
    return (
        <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/10 border border-white/5 ${className || ""}`}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, type: "spring", bounce: 0.2 }}
                className="h-full bg-white rounded-full relative overflow-hidden"
            >
                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
            </motion.div>
        </div>
    )
}
