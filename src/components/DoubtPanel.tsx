import { useEffect, useState } from "react"
import { X, Paperclip, Lock, Globe, MessageSquare, Send, User as UserIcon } from "lucide-react"
import { createDoubtReply, subscribeToDoubtReplies, type ReplyData } from "../lib/firestore"
import { uploadFiles } from "../lib/storage"
import { useUser } from "../contexts/UserContext"
import type { Timestamp } from "firebase/firestore"

interface Doubt {
    id: number
    docId?: string
    sourceCollection?: "doubts" | "posts"
    repliesCollection?: "replies" | "comments"
    question: string
    author: string
    authorAvatar?: string
    tags: string[]
    timeAgo?: string
    attachmentUrls?: string[]
}

export function DoubtPanel({ doubt, onClose }: { doubt: Doubt | null, onClose: () => void }) {
    const { currentUser, userData } = useUser()
    const [replyText, setReplyText] = useState("")
    const [replies, setReplies] = useState<ReplyData[]>([])
    const [replyFiles, setReplyFiles] = useState<File[]>([])
    const [isReplying, setIsReplying] = useState(false)
    const [replyError, setReplyError] = useState("")
    const normalizeAvatarUrl = (value: unknown) => {
        if (typeof value !== "string") {
            return ""
        }
        const trimmed = value.trim()
        if (!trimmed || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
            return ""
        }
        return trimmed
    }
    const fallbackAvatar = (seed: string) =>
        `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed || "User")}&backgroundColor=c0aede`

    useEffect(() => {
        if (!doubt) {
            return;
        }
        const unsubscribe = subscribeToDoubtReplies(
            doubt.docId ?? String(doubt.id),
            currentUser?.uid ?? null,
            setReplies,
            doubt.sourceCollection ?? "doubts",
            doubt.repliesCollection ?? "replies",
        )
        return unsubscribe
    }, [doubt?.id, doubt?.docId, doubt?.sourceCollection, doubt?.repliesCollection, currentUser?.uid])

    useEffect(() => {
        setReplyText("")
        setReplyFiles([])
        setReplyError("")
    }, [doubt?.id])

    const formatTimeAgo = (createdAt?: Timestamp) => {
        if (!createdAt) return "Just now"
        const seconds = Math.floor((Date.now() - createdAt.toMillis()) / 1000)
        if (seconds < 60) return "Just now"
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    const handleReply = (isPrivate: boolean) => {
        if (!replyText.trim() || !doubt || !currentUser) return
        setIsReplying(true)
        setReplyError("")

        void (async () => {
            try {
                const attachmentUrls = await uploadFiles(
                    `doubts/${doubt.id}/replies`,
                    replyFiles,
                )
                const resolvedAuthorName = userData.name || currentUser.displayName || currentUser.email || "Anonymous"
                const resolvedAuthorAvatar =
                    normalizeAvatarUrl(userData.avatar) ||
                    normalizeAvatarUrl(currentUser.photoURL) ||
                    fallbackAvatar(resolvedAuthorName)

                await createDoubtReply(doubt.docId ?? String(doubt.id), {
                    author: resolvedAuthorName,
                    authorAvatar: resolvedAuthorAvatar,
                    authorUid: currentUser.uid,
                    content: replyText.trim(),
                    isPrivate,
                    attachmentUrls,
                }, doubt.sourceCollection ?? "doubts", doubt.repliesCollection ?? "replies")
                setReplyText("")
                setReplyFiles([])
            } catch (error) {
                console.error("Failed to post reply:", error)
                setReplyError("Failed to send reply. Please try again.")
            } finally {
                setIsReplying(false)
            }
        })()
    }

    const isImageAttachment = (url: string) => {
        const cleanUrl = url.split("?")[0].toLowerCase()
        return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"].some(ext => cleanUrl.endsWith(ext))
    }

    const getAttachmentLabel = (url: string, index: number) => {
        const cleanUrl = url.split("?")[0]
        const filename = cleanUrl.split("/").pop() || `file-${index + 1}`
        return decodeURIComponent(filename)
    }

    if (!doubt) return null;

    return (
        <div className="flex flex-col h-full bg-[#09090b] text-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 bg-[#09090b]/90 backdrop-blur-md z-10 sticky top-0">
                <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                    Doubt Thread
                </h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors text-neutral-400 hover:text-white"
                    aria-label="Close doubt thread"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-0">
                {/* Original Question */}
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center">
                            {normalizeAvatarUrl(doubt.authorAvatar) ? (
                                <img src={normalizeAvatarUrl(doubt.authorAvatar)} alt={doubt.author} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <UserIcon size={20} className="text-white/70" />
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">{doubt.author}</div>
                            <div className="text-xs text-neutral-500">Asked {doubt.timeAgo || "recently"}</div>
                        </div>
                    </div>
                    <h1 className="text-lg font-medium text-white mb-4 leading-relaxed tracking-tight">{doubt.question}</h1>
                    <div className="flex flex-wrap gap-2">
                        {doubt.tags?.map((tag: string) => (
                            <span key={tag} className="text-[10px] font-semibold tracking-wide text-neutral-400 bg-white/5 border border-white/5 px-2 py-1 rounded-md uppercase">
                                {tag}
                            </span>
                        ))}
                    </div>
                    {doubt.attachmentUrls && doubt.attachmentUrls.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {doubt.attachmentUrls.map((url, index) => (
                                <a
                                    key={`${url}-${index}`}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-xl border border-white/10 bg-[#18181b] hover:border-white/20 transition-colors overflow-hidden"
                                >
                                    {isImageAttachment(url) ? (
                                        <div className="aspect-video w-full bg-black/30">
                                            <img src={url} alt={`attachment-${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video w-full flex items-center justify-center text-neutral-400 text-xs px-3 text-center">
                                            Preview unavailable
                                        </div>
                                    )}
                                    <div className="px-3 py-2 border-t border-white/10 text-xs text-neutral-300 truncate">
                                        {getAttachmentLabel(url, index)}
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Replies Area */}
                <div className="p-6 flex-1 flex flex-col gap-6">
                    <h3 className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                        <MessageSquare size={16} /> {replies.length} Replies
                    </h3>

                    {replies.map(reply => (
                        <div key={reply.id} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center shrink-0">
                                {normalizeAvatarUrl(reply.authorAvatar) ? (
                                    <img src={normalizeAvatarUrl(reply.authorAvatar)} alt={reply.author} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <img src={fallbackAvatar(reply.author || "Anonymous")} alt={reply.author} className="w-full h-full object-cover rounded-full" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-sm font-medium text-white">{reply.author}</span>
                                    <span className="text-xs text-neutral-500">{formatTimeAgo(reply.createdAt)}</span>
                                    {reply.isPrivate && (
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase tracking-widest">
                                            <Lock size={10} /> Private
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-neutral-300 leading-relaxed bg-[#18181b] border border-white/5 p-4 rounded-xl rounded-tl-none">
                                    {reply.content}
                                </div>
                                {reply.attachmentUrls.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                        {reply.attachmentUrls.map((url, index) => (
                                            <a
                                                key={`${reply.id}-${index}`}
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block rounded-lg border border-white/10 bg-black/20 hover:border-white/20 transition-colors overflow-hidden"
                                            >
                                                {isImageAttachment(url) ? (
                                                    <div className="aspect-video w-full">
                                                        <img src={url} alt={`reply-attachment-${index + 1}`} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video w-full flex items-center justify-center text-neutral-500 text-[11px] px-2 text-center">
                                                        Preview unavailable
                                                    </div>
                                                )}
                                                <div className="px-2 py-1.5 border-t border-white/10 text-[11px] text-neutral-300 truncate">
                                                    {getAttachmentLabel(url, index)}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky Reply Footer */}
            <div className="shrink-0 p-4 border-t border-white/5 bg-[#09090b]/90 backdrop-blur-md">
                <div className="bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden focus-within:border-white/30 transition-colors shadow-lg">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your answer..."
                        className="w-full bg-transparent p-4 text-sm text-white placeholder-neutral-500 focus:outline-none resize-none min-h-[100px] custom-scrollbar"
                    />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-t border-white/5 bg-white/[0.02] gap-3">
                        <div className="flex items-center gap-2">
                            <label className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer" title="Attach file">
                                <Paperclip size={18} />
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={(event) => {
                                        const files = Array.from(event.target.files ?? [])
                                        setReplyFiles(files)
                                    }}
                                />
                            </label>
                            {replyFiles.length > 0 && (
                                <span className="text-[10px] text-neutral-500">{replyFiles.length} file(s)</span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => handleReply(true)}
                                disabled={!replyText.trim() || isReplying}
                                className="flex-1 sm:flex-none justify-center px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock size={14} /> Reply Privately
                            </button>
                            <button
                                onClick={() => handleReply(false)}
                                disabled={!replyText.trim() || isReplying}
                                className="flex-1 sm:flex-none justify-center px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Globe size={14} /> Reply Publicly <Send size={14} />
                            </button>
                        </div>
                    </div>
                    {replyError && (
                        <p className="text-red-400 text-xs px-3 pb-3">{replyError}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
