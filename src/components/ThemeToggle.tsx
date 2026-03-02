import { useEffect, useMemo, useState } from "react"
import { Laptop, Moon, Sun } from "lucide-react"

type ThemeToggleVariant = "floating" | "header"
type ThemeMode = "light" | "system" | "dark"

const THEME_MODES: ThemeMode[] = ["light", "system", "dark"]

function getSystemPrefersLight() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-color-scheme: light)").matches
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system"

  const mode = localStorage.getItem("themeMode")
  if (mode === "light" || mode === "system" || mode === "dark") {
    return mode
  }

  if (mode === "manual") {
    const legacyTheme = localStorage.getItem("theme")
    if (legacyTheme === "light" || legacyTheme === "dark") {
      return legacyTheme
    }
  }

  return "system"
}

export function ThemeToggle({ variant = "floating" }: { variant?: ThemeToggleVariant }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getStoredThemeMode())
  const [systemIsLight, setSystemIsLight] = useState(() => getSystemPrefersLight())

  const resolvedTheme = useMemo<"light" | "dark">(
    () => (themeMode === "system" ? (systemIsLight ? "light" : "dark") : themeMode),
    [themeMode, systemIsLight],
  )

  useEffect(() => {
    const isLight = resolvedTheme === "light"
    document.documentElement.classList.toggle("light-theme", isLight)
    document.body.classList.toggle("light-theme", isLight)
  }, [resolvedTheme])

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)")
    setSystemIsLight(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setSystemIsLight(event.matches)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const setMode = (nextMode: ThemeMode) => {
    setThemeMode(nextMode)
    localStorage.setItem("themeMode", nextMode)
  }

  const selectedIndex = THEME_MODES.indexOf(themeMode)
  const wrapperClassName =
    variant === "header"
      ? "w-[132px] h-10"
      : "fixed bottom-6 right-6 z-[100] w-[150px] h-11"

  return (
    <div
      className={`${wrapperClassName} relative grid grid-cols-3 items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-1`}
      role="group"
      aria-label="Theme mode toggle"
    >
      <span
        className="absolute top-1 bottom-1 left-1 rounded-full bg-white/90 shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out"
        style={{
          width: "calc((100% - 0.5rem) / 3)",
          transform: `translateX(calc(${selectedIndex} * 100%))`,
        }}
      />

      <button
        type="button"
        onClick={() => setMode("light")}
        className="relative z-10 h-full inline-flex items-center justify-center rounded-full text-xs transition-colors"
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun size={16} className={themeMode === "light" ? "text-black" : "text-white"} />
      </button>

      <button
        type="button"
        onClick={() => setMode("system")}
        className="relative z-10 h-full inline-flex items-center justify-center rounded-full text-xs transition-colors"
        aria-label="System mode"
        title="System mode"
      >
        <Laptop size={16} className={themeMode === "system" ? "text-black" : "text-white"} />
      </button>

      <button
        type="button"
        onClick={() => setMode("dark")}
        className="relative z-10 h-full inline-flex items-center justify-center rounded-full text-xs transition-colors"
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon size={16} className={themeMode === "dark" ? "text-black" : "text-white"} />
      </button>
    </div>
  )
}

