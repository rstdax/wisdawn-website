import { useState } from "react"
import { Button } from "./ui/Button"
import { ProgressBar } from "./ui/ProgressBar"
import { MapPin, Crosshair, ArrowRight, Loader2 } from "lucide-react"
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

export function Location({ onNext }: { onNext: () => void }) {
    const { updateUserData, userData } = useUser()
    const [location, setLocation] = useState(userData.location || "Los Angeles, California")
    const [coords, setCoords] = useState<{ latitude: number | null, longitude: number | null }>({
        latitude: userData.latitude ?? null,
        longitude: userData.longitude ?? null,
    })
    const [error, setError] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [locationMessage, setLocationMessage] = useState("")
    const [locationMessageType, setLocationMessageType] = useState<"success" | "error">("success")

    const resolveLocationName = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            )

            if (!response.ok) {
                throw new Error("Failed reverse geocode")
            }

            const data = await response.json() as {
                address?: {
                    city?: string
                    town?: string
                    village?: string
                    state?: string
                    country?: string
                }
            }

            const city = data.address?.city || data.address?.town || data.address?.village || ""
            const state = data.address?.state || ""
            const country = data.address?.country || ""
            const namedLocation = [city, state, country].filter(Boolean).join(", ")

            if (namedLocation) {
                return namedLocation
            }
        } catch {
            // Use lat/long fallback below.
        }

        return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
    }

    const resolveCoordinatesFromLocation = async (locationText: string) => {
        if (!locationText.trim()) {
            return { latitude: null, longitude: null }
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(locationText)}&limit=1`
            )
            if (!response.ok) {
                throw new Error("Failed forward geocode")
            }

            const results = await response.json() as Array<{ lat?: string; lon?: string }>
            const first = results[0]
            if (!first?.lat || !first?.lon) {
                return { latitude: null, longitude: null }
            }

            const latitude = Number(first.lat)
            const longitude = Number(first.lon)
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                return { latitude: null, longitude: null }
            }

            return { latitude, longitude }
        } catch {
            return { latitude: null, longitude: null }
        }
    }

    const handleUsePreciseLocation = () => {
        setLocationMessage("")

        if (!("geolocation" in navigator)) {
            setLocationMessageType("error")
            setLocationMessage("Geolocation is not supported on this browser.")
            return
        }

        setIsLocating(true)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                void (async () => {
                    const { latitude, longitude } = position.coords
                    const resolvedLocation = await resolveLocationName(latitude, longitude)

                    setLocation(resolvedLocation)
                    setCoords({ latitude, longitude })
                    setError(false)
                    setLocationMessageType("success")
                    setLocationMessage("Location detected successfully.")
                    setIsLocating(false)
                })()
            },
            (geoError) => {
                const messageMap: Record<number, string> = {
                    1: "Location permission denied. Please allow location access.",
                    2: "Location is unavailable right now. Try again.",
                    3: "Location request timed out. Please retry.",
                }

                setLocationMessageType("error")
                setLocationMessage(messageMap[geoError.code] || "Unable to detect location.")
                setIsLocating(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0,
            }
        )
    }

    const handleContinue = async () => {
        if (!location.trim()) {
            setError(true)
            return
        }

        let nextCoords = coords
        if (nextCoords.latitude === null || nextCoords.longitude === null) {
            nextCoords = await resolveCoordinatesFromLocation(location)
        }

        if (nextCoords.latitude === null || nextCoords.longitude === null) {
            setError(true)
            setLocationMessageType("error")
            setLocationMessage("Unable to resolve exact coordinates. Use Precise Location to continue.")
            return
        }

        setError(false)
        updateUserData({
            location,
            latitude: nextCoords.latitude,
            longitude: nextCoords.longitude,
        })
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
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-2">Where are you?</h2>
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        Let us know your area to suggest localized study groups.
                    </p>
                </motion.div>

                <div className="space-y-6 mt-4">
                    <motion.button
                        variants={item}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUsePreciseLocation}
                        disabled={isLocating}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-[#18181b] border border-white/10 hover:bg-[#27272a] hover:border-white/20 transition-all group shadow-sm relative overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} />}
                            </div>
                            <div className="text-left">
                                <h3 className="font-medium text-white text-sm">Use Precise Location</h3>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    {isLocating ? "Detecting your location..." : "Enable for better suggestions"}
                                </p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <ArrowRight size={16} className="text-white" />
                        </div>
                    </motion.button>

                    {locationMessage && (
                        <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "text-xs ml-1",
                                locationMessageType === "success" ? "text-emerald-400" : "text-red-400"
                            )}
                        >
                            {locationMessage}
                        </motion.p>
                    )}

                    <motion.div variants={item} className="flex items-center gap-4 my-2">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Or enter manually</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </motion.div>

                    {/* Location Textarea */}
                    <motion.div variants={item} className="space-y-3">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Your Location</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-3 text-neutral-500 group-focus-within:text-white transition-colors z-10">
                                <MapPin size={18} />
                            </div>
                            <textarea
                                className={cn(
                                    "w-full h-32 rounded-xl bg-[#18181b] border border-white/10 p-3 pl-11 text-white text-sm placeholder-neutral-500 resize-none transition-all focus-visible:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 hover:bg-[#27272a] shadow-sm",
                                    error && "border-red-500/50 focus:ring-red-500/20"
                                )}
                                placeholder="City, State, Country or Zip Code"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value)
                                    setCoords({ latitude: null, longitude: null })
                                }}
                            />
                        </div>
                    </motion.div>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-4 text-center font-medium"
                    >
                        Please enter your location.
                    </motion.p>
                )}
            </div>

            <motion.div variants={item} className="mt-8">
                <Button onClick={handleContinue} className="tracking-wide">
                    Finish Setup
                </Button>
            </motion.div>
        </motion.div>
    )
}
