import { Button } from "./ui/Button"
import { motion, type Variants } from "framer-motion"
import { useState } from "react"
import { getFirebaseAuthError, signInWithGoogle } from "../lib/auth"

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
}

const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
}

export function Welcome({
    onNext,
    onSignIn,
    onGoogleSuccess,
}: {
    onNext: () => void,
    onSignIn: () => void,
    onGoogleSuccess?: () => void
}) {
    const [authError, setAuthError] = useState("")

    const handleGoogleContinue = async () => {
        setAuthError("")
        try {
            const result = await signInWithGoogle()
            if (result) {
                onGoogleSuccess?.()
            }
        } catch (error) {
            setAuthError(getFirebaseAuthError(error))
        }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex h-full flex-col p-6 items-center justify-center relative min-h-[500px]"
        >
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">

                {/* Subtle Glow instead of heavy blur */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full filter blur-[100px] pointer-events-none" />

                <motion.div variants={item} className="mb-10 relative flex flex-col items-center">
                    <video
                        src="/logo.mp4?v=2"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-28 h-28 rounded-3xl object-cover shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-8 hover:scale-105 transition-transform duration-500"
                    />
                    <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4 text-center leading-snug">
                        Level up <br /> your <span className="text-white/70">mind.</span>
                    </h2>
                    <p className="text-neutral-400 text-center text-sm mb-8 mx-auto leading-relaxed">
                        Begin your personalized cognitive training journey.
                    </p>
                </motion.div>

                <motion.div variants={item} className="flex flex-col gap-3 mt-auto w-full relative z-10">
                    <Button variant="glass" className="gap-3 group" onClick={handleGoogleContinue}>
                        <svg className="w-5 h-5 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </Button>

                    <div className="flex items-center gap-4 my-2">
                        <div className="flex-1 h-[1px] bg-white/5" />
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">or</span>
                        <div className="flex-1 h-[1px] bg-white/5" />
                    </div>

                    <Button variant="primary" onClick={onNext}>
                        Create Account
                    </Button>

                    {authError && (
                        <p className="text-red-400 text-xs text-center">{authError}</p>
                    )}

                    <p className="text-center text-xs text-neutral-500 mt-6 font-medium">
                        Already have an account? <button onClick={onSignIn} className="text-neutral-300 hover:text-white transition-colors cursor-pointer font-semibold underline-offset-2 hover:underline">Sign in</button>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    )
}
