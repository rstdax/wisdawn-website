import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

type ThemeToggleVariant = "floating" | "header"

export function ThemeToggle({ variant = "floating" }: { variant?: ThemeToggleVariant }) {
  const getSystemPrefersLight = () => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-color-scheme: light)").matches
  }

  const [isLight, setIsLight] = useState(() => {
    if (typeof window === "undefined") return false
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "light") return true
    if (storedTheme === "dark") return false
    return getSystemPrefersLight()
  })

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", isLight)
  }, [isLight])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem("theme")) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)")
    const handler = (event: MediaQueryListEvent) => {
      setIsLight(event.matches)
    }
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
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

  const baseClassName =
    "rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all shadow-2xl active:scale-95 group"
  const className =
    variant === "header"
      ? `w-10 h-10 inline-flex items-center justify-center ${baseClassName} hover:scale-105`
      : `fixed bottom-6 right-6 z-[100] p-4 ${baseClassName} hover:scale-110`

  return (
    <button
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Moon className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors" />
      ) : (
        <Sun className="w-5 h-5 text-white group-hover:text-yellow-400 transition-colors" />
      )}
    </button>
  )
}

