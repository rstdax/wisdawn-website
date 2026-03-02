import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Select } from "./ui/Select"
import { ProgressBar } from "./ui/ProgressBar"
import { Mail, Phone, Lock, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { getFirebaseAuthError, signUpWithEmail } from "../lib/auth"

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

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

export function AccountCreation({ onNext }: { onNext: (email: string, phone: string) => void }) {
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code)
    const [error, setError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverError, setServerError] = useState("")

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

    const isPhoneValid = phone.replace(/\D/g, '').length === selectedCountry.length;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passMatch = password.length > 0 && password === confirmPassword;
    const passLength = password.length >= 8;

    const handleContinue = async () => {
        if (!email.trim() || !phone.trim() || !isPhoneValid || !isEmailValid || !passMatch || !passLength) {
            setError(true)
            return
        }
        setError(false)
        setServerError("")
        setIsSubmitting(true)
        try {
            await signUpWithEmail(email, password)
            onNext(email, phone)
        } catch (authError) {
            setServerError(getFirebaseAuthError(authError))
        } finally {
            setIsSubmitting(false)
        }
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
                    <ProgressBar progress={20} className="mb-2" />
                </motion.div>

                <motion.div variants={item}>
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-3">Create Account</h2>
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        Let's get started by creating your account credentials.
                    </p>
                </motion.div>

                <div className="space-y-7 mt-8">
                    <motion.div variants={item} className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Email Address</label>
                        <Input
                            type="email"
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
                        <label className="text-sm font-medium text-neutral-300 ml-1">Phone Number</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="w-full sm:w-28 shrink-0">
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
                                    type="tel"
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

                    <motion.div variants={item} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300 ml-1">Password</label>
                            <Input
                                type="password"
                                icon={<Lock size={18} />}
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={error && !passLength}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    icon={<Lock size={18} />}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    error={error && !passMatch}
                                />
                                {confirmPassword.length > 0 && passMatch && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (!passMatch || !passLength) && password.length > 0 && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                                {!passLength ? "Password must be at least 8 characters." : "Passwords do not match."}
                            </p>
                        )}
                    </motion.div>
                </div>

                {error && (!email.trim() || !phone.trim() || !isPhoneValid || !isEmailValid || !passMatch || !passLength) && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-4 text-center font-medium"
                    >
                        Please complete all fields correctly.
                    </motion.p>
                )}
                {serverError && (
                    <p className="text-red-400 text-sm mt-2 text-center font-medium">
                        {serverError}
                    </p>
                )}
            </div>

            <motion.div variants={item} className="mt-14">
                <Button onClick={handleContinue} className="group tracking-wide" disabled={isSubmitting}>
                    Create Account <ArrowRight size={20} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
                </Button>
            </motion.div>
        </motion.div>
    )
}
