import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, FileText, PlayCircle, Bookmark, MoveRight, Star, Download } from "lucide-react"
import { cn } from "../lib/utils"
import { useUser, type WorkshopData } from "../contexts/UserContext"
import { subscribeToWorkshops } from "../lib/firestore"

type ResourceItem = {
  id: string
  title: string
  type: "Video" | "PDF" | "Image"
  date: string
  url: string
}

function normalizeUrl(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : ""
}

function inferResourceType(url: string): "Video" | "PDF" | "Image" {
  const lowered = url.toLowerCase()
  if (lowered.includes("youtube.com") || lowered.includes("youtu.be") || lowered.endsWith(".mp4")) {
    return "Video"
  }
  if (lowered.endsWith(".pdf")) {
    return "PDF"
  }
  return "Image"
}

export function Library() {
  const { userData } = useUser()
  const [workshops, setWorkshops] = useState<WorkshopData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToWorkshops((items) => {
      setWorkshops(items)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const joinedWorkshops = useMemo(() => {
    if (!userData.joinedWorkshops.length) return [] as WorkshopData[]
    const index = new Map(workshops.map((workshop) => [workshop.id, workshop] as const))
    return userData.joinedWorkshops.map((joined) => index.get(joined.id) ?? joined)
  }, [workshops, userData.joinedWorkshops])

  const continueLearning = useMemo(() => {
    return joinedWorkshops.slice(0, 4).map((workshop) => {
      const seed = Math.abs(workshop.id) % 80
      return {
        id: String(workshop.id),
        title: workshop.name,
        instructor: workshop.author || "Anonymous",
        progress: Math.max(10, seed),
        thumbnail:
          normalizeUrl(workshop.authorAvatar) ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(workshop.name)}`,
        lastAccessed: workshop.date || "Recently joined",
      }
    })
  }, [joinedWorkshops])

  const savedResources = useMemo(() => {
    const resources: ResourceItem[] = []
    joinedWorkshops.forEach((workshop) => {
      workshop.chapters?.forEach((chapter, index) => {
        const candidates = [chapter.videoUrl, chapter.youtubeUrl, chapter.pdfUrl, chapter.imageUrl]
          .map(normalizeUrl)
          .filter(Boolean)
        candidates.forEach((url, resourceIndex) => {
          resources.push({
            id: `${workshop.id}-${chapter.id}-${resourceIndex}`,
            title: `${workshop.name} - ${chapter.title || `Chapter ${index + 1}`}`,
            type: inferResourceType(url),
            date: workshop.date || "Date TBD",
            url,
          })
        })
      })
    })
    return resources.slice(0, 8)
  }, [joinedWorkshops])

  const recommended = useMemo(() => {
    const joinedIds = new Set(joinedWorkshops.map((workshop) => workshop.id))
    return workshops
      .filter((workshop) => !joinedIds.has(workshop.id))
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 4)
      .map((workshop) => ({
        id: String(workshop.id),
        title: workshop.name,
        author: workshop.author || "Anonymous",
        rating: (4 + ((Math.abs(workshop.id) % 10) / 10)).toFixed(1),
        category: workshop.tags[0] || "GENERAL",
        cover:
          normalizeUrl(workshop.authorAvatar) ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(workshop.name + "-cover")}`,
      }))
  }, [joinedWorkshops, workshops])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-12 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Your Library</h1>
        <p className="text-neutral-400">Pick up where you left off or discover new resources.</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <PlayCircle size={20} className="text-blue-400" /> Continue Learning
          </h2>
          <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group">
            Browse all <MoveRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-neutral-400">Loading library...</div>
        ) : continueLearning.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {continueLearning.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all cursor-pointer flex flex-col sm:flex-row shadow-sm hover:shadow-md h-full"
              >
                <div className="sm:w-40 h-40 sm:h-auto shrink-0 relative overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-neutral-400">{course.instructor}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>{course.progress}% Complete</span>
                      <span>{course.lastAccessed}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-400">Join workshops to build your library.</div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              <Bookmark size={20} className="text-emerald-400" /> Saved Resources
            </h2>
          </div>

          {savedResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedResources.map((resource, i) => (
                <motion.a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.05) }}
                  className="bg-[#18181b] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all cursor-pointer group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                    <FileText size={20} className={cn(
                      resource.type === "PDF" ? "text-red-400" :
                        resource.type === "Video" ? "text-blue-400" : "text-yellow-400"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white mb-1 truncate group-hover:text-emerald-400 transition-colors">{resource.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="font-medium px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">{resource.type}</span>
                      <span>{resource.date}</span>
                    </div>
                  </div>
                  <span className="text-neutral-500 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                    <Download size={16} />
                  </span>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-400">No saved resources yet. Add chapter links in workshops to populate this section.</div>
          )}
        </section>

        <section className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-white/5 pt-8 lg:pt-0 lg:pl-8">
          <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2 mb-6">
            <BookOpen size={20} className="text-orange-400" /> Recommended
          </h2>

          {recommended.length > 0 ? (
            <div className="flex flex-col gap-6">
              {recommended.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="group flex gap-4"
                >
                  <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-lg relative">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-orange-400 mb-1">{book.category}</div>
                    <h3 className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-neutral-400 mb-2">{book.author}</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-yellow-500">
                      <Star size={12} className="fill-yellow-500" /> {book.rating}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-400">No recommendations yet.</div>
          )}
        </section>
      </div>
    </motion.div>
  )
}

