import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { getFirebaseAuthError, signInWithEmail, signInWithGoogle } from "../lib/auth"

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

export function SignIn({ onSignIn, onBackToWelcome }: { onSignIn: () => void, onBackToWelcome: () => void }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverError, setServerError] = useState("")

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passLength = password.length >= 8;

    const handleSignIn = async () => {
        if (!email.trim() || !isEmailValid || !passLength) {
            setError(true)
            return
        }
        setError(false)
        setServerError("")
        setIsSubmitting(true)
        try {
            await signInWithEmail(email, password)
            onSignIn()
        } catch (authError) {
            setServerError(getFirebaseAuthError(authError))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setServerError("")
        setIsSubmitting(true)
        try {
            const result = await signInWithGoogle()
            if (result) {
                onSignIn()
            }
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
            className="flex h-full flex-col justify-center max-w-md mx-auto w-full px-4"
        >
            <div className="flex flex-col gap-8 w-full mt-10">
                <motion.div variants={item} className="text-center">
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-3">Welcome Back</h2>
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        Sign in to continue your personalized journey.
                    </p>
                </motion.div>

                <motion.div variants={item} className="flex flex-col gap-3 w-full mt-2 -mb-2">
                    <Button variant="glass" className="gap-3 group" onClick={handleGoogleSignIn}>
                        <svg className="w-5 h-5 shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </Button>

                    <div className="flex items-center gap-4 my-2">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">or log in with email</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>
                </motion.div>

                <div className="space-y-6 mt-6">
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
                        <label className="text-sm font-medium text-neutral-300 ml-1">Password</label>
                        <Input
                            type="password"
                            icon={<Lock size={18} />}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error && !passLength}
                        />
                        {error && !passLength && password.length > 0 && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                                Password must be at least 8 characters.
                            </p>
                        )}

                        <div className="flex justify-end pt-1">
                            <button className="text-xs font-medium text-slate-400 hover:text-white transition-colors underline-offset-2 hover:underline">
                                Forgot password?
                            </button>
                        </div>
                    </motion.div>
                </div>

                {error && (!email.trim() || !isEmailValid || !passLength) && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-4 text-center font-medium"
                    >
                        Please enter valid credentials to continue.
                    </motion.p>
                )}
                {serverError && (
                    <p className="text-red-400 text-sm text-center font-medium">{serverError}</p>
                )}
            </div>

            <motion.div variants={item} className="mt-14 w-full">
                <Button onClick={handleSignIn} className="group tracking-wide w-full" disabled={isSubmitting}>
                    Sign In <ArrowRight size={20} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
                </Button>

                <p className="text-center text-xs text-neutral-500 mt-6 font-medium">
                    Don't have an account?{" "}
                    <button
                        onClick={onBackToWelcome}
                        className="text-neutral-300 hover:text-white transition-colors cursor-pointer font-semibold underline-offset-2 hover:underline"
                    >
                        Sign up
                    </button>
                </p>
            </motion.div>
        </motion.div>
    )
}
