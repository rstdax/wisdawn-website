import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { ProgressBar } from "./ui/ProgressBar"
import { Calendar } from "lucide-react"
import { cn } from "../lib/utils"
import { motion, type Variants } from "framer-motion"
import { useUser } from "../contexts/UserContext"

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const item: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function PersonalDetails({ onNext }: { onNext: () => void }) {
    const { updateUserData } = useUser()
    const [gender, setGender] = useState("Male")
    const [dob, setDob] = useState("")
    const [error, setError] = useState(false)

    const handleContinue = () => {
        if (!dob.trim()) {
            setError(true)
            return
        }
        setError(false)
        updateUserData({ gender, dob })
        onNext()
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex h-full flex-col"
        >
            <div className="flex flex-col gap-6 flex-1">
                <motion.div variants={item} className="flex flex-col mb-4">
                    <ProgressBar progress={100} className="mb-2" />
                </motion.div>

                <motion.div variants={item}>
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-2">Personal Details</h2>
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        This helps us personalize your experience.
                    </p>
                </motion.div>

                <div className="space-y-8 mt-4">
                    <motion.div variants={item} className="space-y-3">
                        <h3 className="font-semibold text-white tracking-wide">Gender identity</h3>
                        <div className="flex flex-wrap gap-3">
                            {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={g}
                                    onClick={() => setGender(g)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border shadow-sm relative overflow-hidden",
                                        gender === g
                                            ? "bg-white text-black border-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]"
                                            : "bg-[#18181b] text-neutral-300 hover:bg-[#27272a] border-white/10 hover:border-white/20"
                                    )}
                                >
                                    {g}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="space-y-2 relative">
                        <h3 className="font-semibold text-white tracking-wide mb-2">Age Verification</h3>
                        <div className="relative">
                            <Input
                                icon={<Calendar size={18} />}
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                error={error && !dob.trim()}
                                className="[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer block min-h-auto"
                            />
                        </div>
                        <p className="text-xs text-neutral-500 mt-2 px-1 font-medium">
                            Your birthday helps us ensure content is age-appropriate.
                        </p>
                    </motion.div>
                </div>



                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-4 text-center font-medium"
                    >
                        Please enter your date of birth.
                    </motion.p>
                )}
            </div>

            <motion.div variants={item} className="mt-8 flex flex-col gap-3">
                <Button onClick={handleContinue} className="tracking-wide">
                    Continue
                </Button>
            </motion.div>
        </motion.div>
    )
}
