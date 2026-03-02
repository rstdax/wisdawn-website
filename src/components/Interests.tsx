import { useState } from "react"
import { Button } from "./ui/Button"
import { ProgressBar } from "./ui/ProgressBar"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "../lib/utils"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { useUser } from "../contexts/UserContext"

const INTERESTS = [
    "Coding", "Physics", "Math", "Biology", "History",
    "Chemistry", "Literature", "Geography", "Psychology",
    "Economics", "Art", "Philosophy", "Data Science", "Music"
]

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
}

const item: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
}

export function Interests({ onNext }: { onNext: () => void }) {
    const { updateUserData } = useUser()
    const [selected, setSelected] = useState<string[]>(["Coding", "Physics"])
    const [error, setError] = useState(false)

    const toggleInterest = (interest: string) => {
        setSelected(prev => {
            const newSelection = prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]

            if (newSelection.length >= 3) setError(false)
            return newSelection
        })
    }

    const handleContinue = () => {
        if (selected.length < 3) {
            setError(true)
            return
        }
        setError(false)
        updateUserData({ interests: selected })
        onNext()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex h-full flex-col"
        >
            <div className="flex flex-col gap-6 flex-1">
                <div className="flex flex-col mb-4">
                    <ProgressBar progress={80} className="mb-2" />
                </div>

                <div>
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight text-center mb-3">
                        What are you <br /> interested in?
                    </h2>
                    <p className="text-neutral-400 text-sm md:text-base text-center max-w-sm mx-auto">
                        Select at least 3 topics to personalize your journey.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex flex-wrap justify-center gap-3 mt-6"
                >
                    {INTERESTS.map(interest => {
                        const isSelected = selected.includes(interest)
                        return (
                            <motion.button
                                variants={item}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border shadow-sm relative overflow-hidden",
                                    isSelected
                                        ? "bg-white text-black border-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]"
                                        : "bg-[#18181b] text-neutral-300 border-white/10 hover:bg-[#27272a] hover:border-white/20"
                                )}
                            >

                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -90 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 90 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Check size={16} className="text-black" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {interest}
                            </motion.button>
                        )
                    })}
                </motion.div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-4 text-center font-medium"
                    >
                        Please select at least 3 interests.
                    </motion.p>
                )}
            </div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="mt-12 flex flex-col gap-3 relative z-10"
            >
                <Button
                    onClick={handleContinue}
                    className="group"
                >
                    Continue <ArrowRight size={18} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
                </Button>
            </motion.div>
        </motion.div>
    )
}
