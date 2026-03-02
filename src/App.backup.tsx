import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LandingPage } from "./components/LandingPage"
import { Welcome } from "./components/Welcome"
import { SignIn } from "./components/SignIn"
import { AccountCreation } from "./components/AccountCreation"
import { BasicInfo } from "./components/BasicInfo"
import { AcademicInfo } from "./components/AcademicInfo"
import { Interests } from "./components/Interests"
import { PersonalDetails } from "./components/PersonalDetails"
import { Location } from "./components/Location"
import { AllSet } from "./components/AllSet"
import { ChevronLeft, Sun, Moon } from "lucide-react"
import { Home } from "./components/Home"

function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light") {
      setIsLight(true)
      document.documentElement.classList.add("light-theme")
    }
  }, [])

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove("light-theme")
      localStorage.setItem("theme", "dark")
      setIsLight(false)
    } else {
      document.documentElement.classList.add("light-theme")
      localStorage.setItem("theme", "light")
      setIsLight(true)
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all shadow-2xl hover:scale-110 active:scale-95 group"
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Moon className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" />
      ) : (
        <Sun className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
      )}
    </button>
  )
}

export default function App() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward
  const [accountEmail, setAccountEmail] = useState("")
  const [accountPhone, setAccountPhone] = useState("")
  const [showLanding, setShowLanding] = useState(true)

  const handleNext = () => {
    setDirection(1)
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setDirection(-1)
    setStep(prev => prev === 0 ? 1 : Math.max(prev - 1, 1))
  }

  if (showLanding) {
    return (
      <>
        <ThemeToggle />
        <LandingPage
          onLogin={() => { setShowLanding(false); setStep(0); }}
          onGetStarted={() => { setShowLanding(false); setStep(1); }}
        />
      </>
    )
  }

  if (step === 9) {
    return (
      <>
        <ThemeToggle />
        <Home />
      </>
    )
  }

  // Variants for the page slide transition
  const pageVariants: any = {
    initial: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
      scale: 0.98
    }),
    in: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, type: "spring", stiffness: 400, damping: 30 }
    },
    out: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.3 }
    })
  }

  // Titles mapping (index 0 is unused here as SignIn has its own header/no nav bar)
  const titles = ["", "Account Creation", "Profile Setup", "Academic Hub", "Your Interests", "Personal Details", "Location", "Ready!"]

  return (
    <>
      <ThemeToggle />
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden selection:bg-white/20">

        {/* Main Container */}
        <motion.div
          className="w-full max-w-5xl rounded-xl sm:rounded-2xl md:rounded-[2rem] flex flex-col md:flex-row overflow-hidden z-10 min-h-[85vh] sm:min-h-[650px] lg:min-h-[750px] lg:h-[750px] max-h-[100vh] md:max-h-[90vh] bg-[#09090b] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_60px_-12px_rgba(0,0,0,0.8)] relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Inner subtle glow ring */}
          <div className="absolute inset-0 rounded-[2rem] border border-white/5 pointer-events-none z-50 mix-blend-overlay" />

          {/* Left Side Branding */}
          <div className="hidden md:flex flex-col relative w-1/3 min-w-[320px] lg:w-5/12 p-10 lg:p-14 border-r border-white/5 items-start justify-between bg-[#000000]">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png?v=3" alt="WisDawn Logo" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-semibold tracking-wide text-lg text-white">WisDawn</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-medium tracking-tight mb-4 text-white leading-tight">
                Unlock your true <br /> <span className="text-white/50">potential.</span>
              </h1>
            </motion.div>

            <motion.div
              className="w-full relative mt-auto flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {/* Elegant character presentation */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full filter blur-md shadow-[0_0_30px_rgba(255,255,255,0.2)] z-0" />
              <motion.video
                src="/logo.mp4?v=2"
                autoPlay
                loop
                muted
                playsInline
                className="w-56 h-56 lg:w-72 lg:h-72 object-cover rounded-[2rem] relative z-10 drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
            </motion.div>

            <div className="mt-12 text-xs text-white/30 tracking-widest uppercase font-semibold">
              Version 2.0 • Pro
            </div>
          </div>

          {/* Right Side Content Area */}
          <div className="flex-1 flex flex-col relative bg-[#09090b]">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_50%)] pointer-events-none" />

            {/* Top Navigation Bar... */}
            {step > 1 && step < 8 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 sm:p-6 md:px-8 border-b border-white/5 relative z-20"
              >
                <button
                  onClick={handleBack}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-all hover:scale-105 active:scale-95 text-slate-300 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-sm font-semibold tracking-widest uppercase text-slate-400">
                  {titles[step - 1]}
                </div>
                <div className="w-10 h-10 flex items-center justify-center font-bold text-blue-400 text-sm">
                  {step - 1}/7
                </div>
              </motion.div>
            )}

            {/* Form Content Area with AnimatePresence */}
            <div className="flex-1 relative overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 custom-scrollbar min-h-0">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={step}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="in"
                  exit="out"
                  className="h-full flex flex-col pt-10"
                >
                  {step === 0 && <SignIn onSignIn={() => setStep(9)} onBackToWelcome={() => setStep(1)} />}
                  {step === 1 && <Welcome onNext={handleNext} onSignIn={() => setStep(0)} />}
                  {step === 2 && <AccountCreation onNext={(email, phone) => { setAccountEmail(email); setAccountPhone(phone); handleNext(); }} />}
                  {step === 3 && <BasicInfo onNext={handleNext} initialEmail={accountEmail} initialPhone={accountPhone} />}
                  {step === 4 && <AcademicInfo onNext={handleNext} />}
                  {step === 5 && <Interests onNext={handleNext} />}
                  {step === 6 && <PersonalDetails onNext={handleNext} />}
                  {step === 7 && <Location onNext={handleNext} />}
                  {step === 8 && <AllSet onNext={handleNext} />}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>

      </div>
    </>
  )
}
