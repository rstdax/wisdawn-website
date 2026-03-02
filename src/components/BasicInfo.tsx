import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Select } from "./ui/Select"
import { ProgressBar } from "./ui/ProgressBar"
import { Mail, User, Phone, ArrowRight, Camera } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { useUser } from "../contexts/UserContext"

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/png?seed=Felix&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Aneka&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Mimi&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Jack&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Nala&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/avataaars/png?seed=Leo&backgroundColor=b6e3f4"
]

const COUNTRY_CODES = [
    { code: '+91', country: 'IN', label: 'India (+91)', format: '##### #####', length: 10 },
    { code: '+1', country: 'US', label: 'United States (+1)', format: '(###) ###-####', length: 10 },
    { code: '+44', country: 'UK', label: 'United Kingdom (+44)', format: '#### ######', length: 10 },
    { code: '+61', country: 'AU', label: 'Australia (+61)', format: '### ### ###', length: 9 },
    { code: '+81', country: 'JP', label: 'Japan (+81)', format: '###-####-####', length: 11 },
    { code: '+49', country: 'DE', label: 'Germany (+49)', format: '#### #######', length: 11 },
]

const item: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

const formatPhoneNumber = (value: string, format: string, maxLength: number) => {
    const raw = value.replace(/\D/g, '').substring(0, maxLength);
    let formatted = '';
    let rawIndex = 0;
    for (let i = 0; i < format.length; i++) {
        if (rawIndex >= raw.length) break;
        if (format[i] === '#') {
            formatted += raw[rawIndex];
            rawIndex++;
        } else {
            formatted += format[i];
        }
    }
    return formatted;
};

export function BasicInfo({
    onNext,
    initialName,
    initialEmail,
    initialPhone
}: {
    onNext: () => void,
    initialName?: string,
    initialEmail?: string,
    initialPhone?: string
}) {
    const { updateUserData } = useUser()
    const [name, setName] = useState(initialName || "")
    const [email, setEmail] = useState(initialEmail || "")
    const [phone, setPhone] = useState(initialPhone || "")
    const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code)
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
    const [error, setError] = useState(false)

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

    const isPhoneValid = phone.replace(/\D/g, '').length === selectedCountry.length;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleContinue = () => {
        if (!name.trim() || !email.trim() || !phone.trim() || !isPhoneValid || !isEmailValid) {
            setError(true)
            return
        }
        setError(false)
        updateUserData({ name, email, phone, avatar: selectedAvatar })
        onNext()
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex h-full flex-col"
        >
            <div className="flex flex-col gap-8 flex-1">
                <motion.div variants={item} className="flex flex-col mb-4">
                    <ProgressBar progress={40} className="mb-2" />
                </motion.div>

                <motion.div variants={item}>
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-3">Basic Info</h2>
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        Please provide your details so we can personalize your experience.
                    </p>
                </motion.div>

                <div className="space-y-7 mt-8">
                    <motion.div variants={item} className="space-y-4 mb-8">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Choose an Avatar or Upload Photo</label>
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar items-center">
                            {/* Custom Upload Placeholder */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative w-16 h-16 rounded-full border flex items-center justify-center cursor-pointer group transition-all shrink-0 ${selectedAvatar === "upload"
                                    ? 'border-white bg-[#27272a] shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110'
                                    : 'border-dashed border-white/20 bg-[#18181b] hover:bg-[#27272a] opacity-80 hover:opacity-100 text-neutral-500'
                                    }`}
                                onClick={() => setSelectedAvatar("upload")}
                            >
                                <User size={26} className={`transition-opacity ${selectedAvatar === "upload" ? "opacity-100 text-white" : "opacity-50 group-hover:opacity-100"}`} />
                                <div className="absolute inset-0 bg-white/5 rounded-full pointer-events-none" />

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute -bottom-1 -right-1 bg-white text-black p-1.5 rounded-full border border-bg-dark shadow-sm z-10"
                                >
                                    <Camera size={12} />
                                </motion.button>
                            </motion.div>

                            <div className="w-px h-10 bg-white/10 shrink-0 mx-1" />

                            {AVATARS.map((avatar) => (
                                <button
                                    key={avatar}
                                    onClick={() => setSelectedAvatar(avatar)}
                                    className={`w-16 h-16 rounded-full overflow-hidden shrink-0 transition-all border-2 ${selectedAvatar === avatar
                                        ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                        }`}
                                >
                                    <img src={avatar} alt="avatar option" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Email Address</label>
                        <Input
                            icon={<Mail size={18} />}
                            placeholder="e.g. alex.smith@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={error && (!email.trim() || !isEmailValid)}
                        />
                        {error && !isEmailValid && email.length > 0 && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                                Please enter a valid email address.
                            </p>
                        )}
                    </motion.div>

                    <motion.div variants={item} className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Full Name</label>
                        <Input
                            icon={<User size={18} />}
                            placeholder="e.g. Alex Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={error && !name.trim()}
                        />
                    </motion.div>

                    <motion.div variants={item} className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Phone Number</label>
                        <div className="flex gap-3">
                            <div className="w-35">
                                <Select
                                    value={countryCode}
                                    onChange={(e) => {
                                        setCountryCode(e.target.value);
                                        setPhone(''); // reset phone when country changes
                                    }}
                                >
                                    {COUNTRY_CODES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.country} {c.code}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Input
                                    icon={<Phone size={18} />}
                                    placeholder={selectedCountry.format.replace(/#/g, '0')}
                                    value={phone}
                                    onChange={(e) => {
                                        const formatted = formatPhoneNumber(e.target.value, selectedCountry.format, selectedCountry.length);
                                        setPhone(formatted);
                                    }}
                                    error={error && !isPhoneValid}
                                />
                            </div>
                        </div>
                        {error && !isPhoneValid && phone.length > 0 && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                                {`Phone number must be ${selectedCountry.length} digits.`}
                            </p>
                        )}
                    </motion.div>
                </div>

                {error && (!name.trim() || !email.trim() || !phone.trim() || !isPhoneValid || !isEmailValid) && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-4 text-center font-medium"
                    >
                        Please fill in all required fields correctly.
                    </motion.p>
                )}
            </div>

            <motion.div variants={item} className="mt-14">
                <Button onClick={handleContinue} className="group tracking-wide">
                    Continue <ArrowRight size={20} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
                </Button>
                <p className="text-center text-xs text-slate-500 max-w-xs mx-auto px-4 leading-relaxed mt-5">
                    By continuing, you agree to our <a href="#" className="text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-2">Terms of Service</a> and <a href="#" className="text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-2">Privacy Policy</a>.
                </p>
            </motion.div>
        </motion.div>
    )
}
