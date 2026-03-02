import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Select } from "./ui/Select"
import { ProgressBar } from "./ui/ProgressBar"
import { Landmark, Blocks, Sparkles } from "lucide-react"
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

export function AcademicInfo({ onNext }: { onNext: () => void }) {
    const { updateUserData } = useUser()
    const [institution, setInstitution] = useState("")
    const [department, setDepartment] = useState("")
    const [year, setYear] = useState("1st Year")
    const [semester, setSemester] = useState("1st Semester")
    const [error, setError] = useState(false)

    const handleContinue = () => {
        if (!institution.trim() || !department.trim()) {
            setError(true)
            return
        }
        setError(false)
        updateUserData({ institution, department, year, semester })
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
                    <ProgressBar progress={60} className="mb-2" />
                </motion.div>

                <motion.div variants={item}>
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-2">Academic Hub</h2>
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        This helps us personalize your experience and find relevant study groups.
                    </p>
                </motion.div>

                <div className="space-y-5 mt-6">
                    <motion.div variants={item} className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Institution Name</label>
                        <Input
                            icon={<Landmark size={18} />}
                            placeholder="e.g. Stanford University"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            error={error && !institution.trim()}
                        />
                    </motion.div>

                    <motion.div variants={item} className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Department Name</label>
                        <Input
                            icon={<Blocks size={18} />}
                            placeholder="e.g. Computer Science"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            error={error && !department.trim()}
                        />
                    </motion.div>

                    <motion.div variants={item} className="flex gap-4">
                        <div className="space-y-2 flex-1 relative">
                            <label className="text-sm font-medium text-neutral-300 ml-1">Current Year</label>
                            <Select value={year} onChange={(e) => setYear(e.target.value)}>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </Select>
                        </div>
                        <div className="space-y-2 flex-1 relative">
                            <label className="text-sm font-medium text-neutral-300 ml-1">Semester</label>
                            <Select value={semester} onChange={(e) => setSemester(e.target.value)}>
                                <option value="1st Semester">1st Semester</option>
                                <option value="2nd Semester">2nd Semester</option>
                                <option value="3rd Semester">3rd Semester</option>
                                <option value="4th Semester">4th Semester</option>
                                <option value="5th Semester">5th Semester</option>
                                <option value="6th Semester">6th Semester</option>
                                <option value="7th Semester">7th Semester</option>
                                <option value="8th Semester">8th Semester</option>
                            </Select>
                        </div>
                    </motion.div>
                </div>

                {/* Smart Connection Banner */}
                <motion.div
                    variants={item}
                    whileHover={{ scale: 1.01 }}
                    className="mt-6 bg-[#18181b] border border-white/10 rounded-2xl p-4 flex gap-4 items-center shadow-sm cursor-default"
                >
                    <div className="bg-white text-black p-2.5 rounded-xl flex-shrink-0 relative z-10">
                        <Sparkles size={18} />
                    </div>
                    <div className="relative z-10 hidden sm:block">
                        <h4 className="font-semibold text-white text-sm">Smart Connection Enabled</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-0.5 pr-4">
                            We'll automatically suggest local campus study hubs.
                        </p>
                    </div>
                </motion.div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2 text-center font-medium"
                    >
                        Please fill in all required fields.
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
