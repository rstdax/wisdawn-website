import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserData, WorkshopData } from "../contexts/UserContext";

export interface DoubtData {
  docId?: string;
  sourceCollection?: "doubts" | "posts";
  repliesCollection?: "replies" | "comments";
  id: number;
  question: string;
  author: string;
  authorUid?: string;
  authorAvatar?: string;
  replies: number;
  tags: string[];
  likes: number;
  isLiked: boolean;
  attachmentUrls?: string[];
  createdAt?: Timestamp;
  location?: string;
  localityKey?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationSource?: "precise" | "approx";
  timestampMs?: number;
}

export interface ReplyData {
  id: string;
  author: string;
  authorAvatar: string;
  authorUid: string;
  content: string;
  isPrivate: boolean;
  attachmentUrls: string[];
  createdAt: Timestamp | undefined;
}

const healedPostImageUrlDocs = new Set<string>();
const healedReplyAvatarDocs = new Set<string>();
const userProfileCache = new Map<string, { name: string; avatar: string }>();

function normalizeNonEmptyString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
    return "";
  }
  return trimmed;
}

function normalizeCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function buildFallbackAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed || "User")}&backgroundColor=c0aede`;
}

async function resolveUserIdentity(
  uid: string | undefined,
  fallbackName: string,
  fallbackAvatar?: string,
): Promise<{ name: string; avatar: string }> {
  const safeFallbackName = normalizeNonEmptyString(fallbackName) || "Anonymous";
  const safeFallbackAvatar =
    normalizeNonEmptyString(fallbackAvatar) || buildFallbackAvatar(safeFallbackName);

  if (!uid) {
    return { name: safeFallbackName, avatar: safeFallbackAvatar };
  }

  const cached = userProfileCache.get(uid);
  if (cached) {
    return {
      name: normalizeNonEmptyString(cached.name) || safeFallbackName,
      avatar: normalizeNonEmptyString(cached.avatar) || safeFallbackAvatar,
    };
  }

  try {
    const profileSnap = await getDoc(doc(db, "users", uid));
    if (profileSnap.exists()) {
      const profile = profileSnap.data() as Partial<UserData>;
      const resolved = {
        name: normalizeNonEmptyString(profile.name) || safeFallbackName,
        avatar: normalizeNonEmptyString(profile.avatar) || safeFallbackAvatar,
      };
      userProfileCache.set(uid, resolved);
      return resolved;
    }
  } catch (error) {
    console.error(`Failed to resolve user identity for uid ${uid}:`, error);
  }

  const fallback = { name: safeFallbackName, avatar: safeFallbackAvatar };
  userProfileCache.set(uid, fallback);
  return fallback;
}

export async function getUserProfile(uid: string): Promise<Partial<UserData> | null> {
  const profileRef = doc(db, "users", uid);
  const profileSnap = await getDoc(profileRef);
  if (!profileSnap.exists()) {
    return null;
  }
  return profileSnap.data() as Partial<UserData>;
}

export async function upsertUserProfile(uid: string, data: Partial<UserData>) {
  const profileRef = doc(db, "users", uid);
  const safeName = normalizeNonEmptyString(data.name);
  const safeEmail = normalizeNonEmptyString(data.email);
  const safeAvatar = normalizeNonEmptyString(data.avatar);
  const safeLocation = normalizeNonEmptyString(data.location);
  const nowMs = Date.now();

  const payload: Record<string, unknown> = {
    ...data,
    uid,
    id: uid,
    userId: uid,
    timestamp: nowMs,
    updatedAt: serverTimestamp(),
  };

  if (safeName) {
    payload.name = safeName;
    payload.displayName = safeName;
    payload.author = safeName;
    payload.authorName = safeName;
    payload.userName = safeName;
  }

  if (safeEmail) {
    payload.email = safeEmail;
  }

  if (safeAvatar) {
    payload.avatar = safeAvatar;
    payload.authorAvatar = safeAvatar;
    payload.photoURL = safeAvatar;
    payload.photoUrl = safeAvatar;
    payload.profileImage = safeAvatar;
    payload.imageUrl = safeAvatar;
  }

  if (safeLocation) {
    payload.location = safeLocation;
    payload.localityKey = normalizeLocationKey(safeLocation);
  }

  if (data.locationSource === "precise" || data.locationSource === "approx") {
    payload.locationSource = data.locationSource;
  }

  const normalizedLatitude = normalizeCoordinate(data.latitude);
  const normalizedLongitude = normalizeCoordinate(data.longitude);

  if (normalizedLatitude !== null) {
    payload.latitude = normalizedLatitude;
    payload.lat = normalizedLatitude;
  }

  if (normalizedLongitude !== null) {
    payload.longitude = normalizedLongitude;
    payload.lng = normalizedLongitude;
  }

  await setDoc(
    profileRef,
    payload,
    { merge: true },
  );

  if (safeName || safeAvatar) {
    userProfileCache.set(uid, {
      name: safeName || "Anonymous",
      avatar: safeAvatar || buildFallbackAvatar(safeName || uid),
    });
  }
}

export async function createWorkshop(workshop: WorkshopData & { hostUid: string }) {
  const workshopId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now());
  const nowMs = Date.now();
  const workshopRef = doc(db, "workshops", workshopId);
  const location = workshop.location ?? "";
  const normalizedLatitude = normalizeCoordinate(workshop.latitude);
  const normalizedLongitude = normalizeCoordinate(workshop.longitude);
  const normalizedTags = workshop.tags ?? [];
  const primaryTopic = normalizedTags[0] ?? "GENERAL";
  const resolvedHostIdentity = await resolveUserIdentity(
    workshop.hostUid,
    (workshop as WorkshopData & { author?: string }).author ?? "Anonymous",
    (workshop as WorkshopData & { authorAvatar?: string }).authorAvatar ?? "",
  );
  const chapters = Array.isArray((workshop as WorkshopData & { chapters?: unknown[] }).chapters)
    ? ((workshop as WorkshopData & { chapters?: unknown[] }).chapters as Array<Record<string, unknown>>).map((chapter, index) => ({
        id: String(chapter.id ?? `${workshopId}-ch-${index + 1}`),
        title: String(chapter.title ?? `chapter ${index + 1}`),
        // Keep both keys for strict mobile/web parser compatibility.
        videoUrl: String(chapter.videoUrl ?? chapter.youtubeUrl ?? ""),
        youtubeUrl: String(chapter.youtubeUrl ?? chapter.videoUrl ?? ""),
        pdfUrl: String(chapter.pdfUrl ?? ""),
        imageUrl: String(chapter.imageUrl ?? ""),
      }))
    : [];

  await setDoc(workshopRef, {
    ...workshop,
    id: workshopId,
    workshopId,
    sessionId: workshopId,
    hostId: workshop.hostUid,
    // Canonical + compatibility fields for mobile/web parity.
    title: workshop.name,
    workshopName: workshop.name,
    topic: primaryTopic,
    tag: primaryTopic,
    tags: normalizedTags,
    attendees: workshop.participants,
    status: "published",
    isLive: false,
    visibility: "public",
    published: true,
    author: resolvedHostIdentity.name,
    authorAvatar: resolvedHostIdentity.avatar,
    authorId: workshop.hostUid,
    hostUid: workshop.hostUid,
    chapters,
    location,
    localityKey: workshop.localityKey ?? normalizeLocationKey(location),
    locationSource: workshop.locationSource ?? "precise",
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
    lat: normalizedLatitude,
    lng: normalizedLongitude,
    timestamp: nowMs,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function toNumericId(rawId: unknown, fallback: string): number {
  if (typeof rawId === "number" && Number.isFinite(rawId)) {
    return rawId;
  }

  if (typeof rawId === "string") {
    const parsed = Number(rawId);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  let hash = 0;
  for (let i = 0; i < fallback.length; i += 1) {
    hash = (hash << 5) - hash + fallback.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function timestampToMillis(value: unknown): number {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  return 0;
}

function mapDoubtDoc(
  doubtDoc: { id: string; data: () => Record<string, unknown> },
  currentUid: string | null,
  sourceCollection: "doubts" | "posts",
): DoubtData {
  const data = doubtDoc.data();
  const likedBy = Array.isArray(data.likedBy) ? data.likedBy.map(String) : [];
  const location = String(
    data.location ?? data.locality ?? data.city ?? data.state ?? "");
  const normalizedLatitude = normalizeCoordinate(data.latitude ?? data.lat);
  const normalizedLongitude = normalizeCoordinate(data.longitude ?? data.lng);
  const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl.trim() : null;
  const tags = Array.isArray(data.tags)
    ? data.tags.map(String)
    : data.tag
      ? [String(data.tag)]
      : data.topic
        ? [String(data.topic)]
        : [];

  const timestampMs =
    typeof data.timestamp === "number" && Number.isFinite(data.timestamp)
      ? data.timestamp
      : 0;

  return {
    sourceCollection,
    repliesCollection: sourceCollection === "posts" ? "comments" : "replies",
    docId: doubtDoc.id,
    id: toNumericId(data.id ?? doubtDoc.id, doubtDoc.id),
    question: String(data.question ?? data.title ?? data.content ?? data.text ?? data.body ?? ""),
    author: String(data.author ?? data.authorName ?? data.userName ?? "Anonymous"),
    authorUid: String(data.authorUid ?? data.uid ?? data.userId ?? data.authorId ?? ""),
    authorAvatar: String(data.authorAvatar ?? data.avatar ?? data.profileImage ?? ""),
    replies: Number(data.replies ?? data.replyCount ?? data.commentsCount ?? 0),
    tags,
    likes: Number(data.likes ?? data.upvotes ?? 0),
    isLiked: currentUid ? likedBy.includes(currentUid) : false,
    attachmentUrls: [
      ...(
        Array.isArray(data.attachmentUrls)
          ? data.attachmentUrls.map(String)
          : []
      ),
      ...(imageUrl ? [imageUrl] : []),
    ],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
    location,
    localityKey: String(data.localityKey ?? normalizeLocationKey(location)),
    locationSource: data.locationSource === "approx" ? "approx" : "precise",
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
    timestampMs,
  } satisfies DoubtData;
}

function normalizeLocationKey(location: string): string {
  return location
    .toLowerCase()
    .replace(/[^a-z0-9,\s]/g, "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join("|");
}

export function subscribeToWorkshops(
  onChange: (workshops: WorkshopData[]) => void,
): Unsubscribe {
  const workshopsRef = collection(db, "workshops");

  return onSnapshot(workshopsRef, (snap) => {
    const workshops = snap.docs.map((workshopDoc) => {
      const data = workshopDoc.data();
      const location = String(
        data.location ?? data.locality ?? data.city ?? data.state ?? "",
      );
      const normalizedLatitude = normalizeCoordinate(data.latitude ?? data.lat);
      const normalizedLongitude = normalizeCoordinate(data.longitude ?? data.lng);
      const tags = Array.isArray(data.tags)
        ? data.tags.map(String)
        : data.tag
          ? [String(data.tag)]
        : data.topic
          ? [String(data.topic)]
          : data.subject
            ? [String(data.subject)]
            : data.domain
              ? [String(data.domain)]
          : [];
      const derivedName = String(
        data.name ??
        data.title ??
        data.workshopName ??
        data.workshopTitle ??
        data.sessionTitle ??
        data.topic ??
        "Untitled Workshop",
      );
      const derivedDate =
        String(data.date ?? data.scheduledDate ?? data.time ?? "").trim() ||
        (data.createdAt instanceof Timestamp
          ? new Date(data.createdAt.toMillis()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Date TBD");
      const chapters = Array.isArray(data.chapters)
        ? data.chapters
            .map((chapter, index) => {
              if (typeof chapter !== "object" || chapter === null) {
                return null;
              }
              const c = chapter as Record<string, unknown>;
              return {
                id: String(c.id ?? `${workshopDoc.id}-ch-${index + 1}`),
                title: String(c.title ?? `Chapter ${index + 1}`),
                videoUrl: String(c.videoUrl ?? ""),
                youtubeUrl: String(c.youtubeUrl ?? c.videoUrl ?? ""),
                pdfUrl: String(c.pdfUrl ?? ""),
                imageUrl: String(c.imageUrl ?? ""),
              };
            })
            .filter((chapter): chapter is NonNullable<typeof chapter> => chapter !== null)
        : [];
      return {
        id: toNumericId(data.id ?? workshopDoc.id, workshopDoc.id),
        name: derivedName,
        date: derivedDate,
        participants: Number(data.participants ?? data.attendees ?? 0),
        tags,
        hostUid: String(data.hostUid ?? data.hostId ?? data.authorId ?? data.uid ?? ""),
        chapters,
        author: String(data.author ?? data.authorName ?? data.userName ?? "Anonymous"),
        authorAvatar: String(
          data.authorAvatar ?? data.avatar ?? data.profileImage ?? data.photoURL ?? data.photoUrl ?? "",
        ),
        location,
        localityKey: String(data.localityKey ?? normalizeLocationKey(location)),
        locationSource: data.locationSource === "approx" ? "approx" : "precise",
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
      } satisfies WorkshopData;
    });
    onChange(
      workshops.sort((a, b) => b.id - a.id),
    );
  });
}

export async function createDoubt(
  doubt: {
    id: string | number;
    question: string;
    author: string;
    authorUid: string;
    replies: number;
    tags: string[];
    likes: number;
    upvotes?: number;
    attachmentUrls?: string[];
    imageUrl?: string | null;
    authorAvatar?: string;
    location?: string;
    localityKey?: string;
    latitude?: number | null;
    longitude?: number | null;
    locationSource?: "precise" | "approx";
  },
) {
  const doubtId = String(doubt.id);
  const nowMs = Date.now();
  const doubtRef = doc(db, "posts", doubtId);
  const location = doubt.location ?? "";
  const normalizedLatitude = normalizeCoordinate(doubt.latitude);
  const normalizedLongitude = normalizeCoordinate(doubt.longitude);
  const normalizedImageUrl =
    (typeof doubt.imageUrl === "string" && doubt.imageUrl.trim().length > 0)
      ? doubt.imageUrl
      : null;
  const normalizedTags = doubt.tags ?? [];
  const primaryTopic = normalizedTags[0] ?? "GENERAL";
  const resolvedAuthorIdentity = await resolveUserIdentity(
    doubt.authorUid,
    doubt.author,
    doubt.authorAvatar,
  );
  await setDoc(doubtRef, {
    ...doubt,
    id: doubtId,
    doubtId,
    postId: doubtId,
    // Canonical + compatibility fields for mobile/web parity.
    question: doubt.question,
    title: doubt.question,
    content: doubt.question,
    text: doubt.question,
    author: resolvedAuthorIdentity.name,
    authorName: resolvedAuthorIdentity.name,
    userName: resolvedAuthorIdentity.name,
    topic: primaryTopic,
    tag: primaryTopic,
    tags: normalizedTags,
    replyCount: doubt.replies,
    commentsCount: doubt.replies,
    likes: doubt.likes,
    upvotes: doubt.upvotes ?? doubt.likes,
    status: "published",
    visibility: "public",
    published: true,
    authorAvatar: resolvedAuthorIdentity.avatar,
    avatar: resolvedAuthorIdentity.avatar,
    profileImage: resolvedAuthorIdentity.avatar,
    imageUrl: normalizedImageUrl,
    location,
    localityKey: doubt.localityKey ?? normalizeLocationKey(location),
    locationSource: doubt.locationSource ?? "precise",
    latitude: normalizedLatitude,
    longitude: normalizedLongitude,
    lat: normalizedLatitude,
    lng: normalizedLongitude,
    timestamp: nowMs,
    attachmentUrls: doubt.attachmentUrls ?? [],
    likedBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToDoubts(
  currentUid: string | null,
  onChange: (doubts: DoubtData[]) => void,
): Unsubscribe {
  const doubtsRef = collection(db, "doubts");
  const postsRef = collection(db, "posts");

  let doubtsState: DoubtData[] = [];
  let postsState: DoubtData[] = [];

  const emit = () => {
    const merged = [...doubtsState, ...postsState];
    onChange(
      merged.sort((a, b) => {
        const bTime = timestampToMillis(b.createdAt) || (b.timestampMs ?? 0);
        const aTime = timestampToMillis(a.createdAt) || (a.timestampMs ?? 0);
        const timeDiff = bTime - aTime;
        if (timeDiff !== 0) {
          return timeDiff;
        }
        return b.id - a.id;
      }),
    );
  };

  const unsubscribeDoubts = onSnapshot(doubtsRef, (snap) => {
    doubtsState = snap.docs.map((doubtDoc) => mapDoubtDoc(doubtDoc, currentUid, "doubts"));
    emit();
  });

  const unsubscribePosts = onSnapshot(postsRef, (snap) => {
    snap.docs.forEach((postDoc) => {
      const data = postDoc.data();
      const isBlankImageUrl =
        typeof data.imageUrl === "string" && data.imageUrl.trim().length === 0;
      if (isBlankImageUrl && !healedPostImageUrlDocs.has(postDoc.id)) {
        healedPostImageUrlDocs.add(postDoc.id);
        void setDoc(
          doc(db, "posts", postDoc.id),
          { imageUrl: null, updatedAt: serverTimestamp() },
          { merge: true },
        ).catch(() => {
          console.error(`Failed to normalize imageUrl for post ${postDoc.id}`);
          healedPostImageUrlDocs.delete(postDoc.id);
        });
      }
    });

    postsState = snap.docs.map((postDoc) => mapDoubtDoc(postDoc, currentUid, "posts"));
    emit();
  });

  return () => {
    unsubscribeDoubts();
    unsubscribePosts();
  };
}

export async function toggleDoubtLike(
  doubtDocId: string,
  uid: string,
  sourceCollection: "doubts" | "posts" = "doubts",
) {
  const doubtRef = doc(db, sourceCollection, doubtDocId);
  await runTransaction(db, async (transaction) => {
    const doubtSnap = await transaction.get(doubtRef);
    if (!doubtSnap.exists()) {
      return;
    }

    const data = doubtSnap.data();
    const currentLikedBy = Array.isArray(data.likedBy)
      ? data.likedBy.map(String)
      : [];
    const alreadyLiked = currentLikedBy.includes(uid);

    const nextLikedBy = alreadyLiked
      ? currentLikedBy.filter((likedUid) => likedUid !== uid)
      : [...currentLikedBy, uid];
    const nextLikes = Math.max(0, Number(data.likes ?? 0) + (alreadyLiked ? -1 : 1));

    transaction.update(doubtRef, {
      likedBy: nextLikedBy,
      likes: nextLikes,
      upvotes: nextLikes,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function createDoubtReply(
  doubtDocId: string,
  reply: Omit<ReplyData, "id" | "createdAt">,
  sourceCollection: "doubts" | "posts" = "doubts",
  repliesCollection: "replies" | "comments" = "replies",
) {
  const doubtRef = doc(db, sourceCollection, doubtDocId);
  const repliesRef = collection(doubtRef, repliesCollection);
  const nowMs = Date.now();
  const content = reply.content ?? "";
  const normalizedAttachmentUrls = reply.attachmentUrls ?? [];
  const firstImageUrl = normalizedAttachmentUrls[0] ?? null;
  const visibility = reply.isPrivate ? "private" : "public";
  const resolvedAuthorIdentity = await resolveUserIdentity(
    reply.authorUid,
    reply.author,
    reply.authorAvatar,
  );

  await addDoc(repliesRef, {
    ...reply,
    // Canonical + compatibility fields for web/mobile parity.
    author: resolvedAuthorIdentity.name,
    authorName: resolvedAuthorIdentity.name,
    userName: resolvedAuthorIdentity.name,
    authorAvatar: resolvedAuthorIdentity.avatar,
    avatar: resolvedAuthorIdentity.avatar,
    profileImage: resolvedAuthorIdentity.avatar,
    photoURL: resolvedAuthorIdentity.avatar,
    photoUrl: resolvedAuthorIdentity.avatar,
    authorPhotoUrl: resolvedAuthorIdentity.avatar,
    authorImageUrl: resolvedAuthorIdentity.avatar,
    userAvatar: resolvedAuthorIdentity.avatar,
    authorUid: reply.authorUid,
    uid: reply.authorUid,
    userId: reply.authorUid,
    authorId: reply.authorUid,
    content,
    text: content,
    message: content,
    reply: content,
    comment: content,
    body: content,
    attachmentUrls: normalizedAttachmentUrls,
    imageUrl: firstImageUrl,
    isPrivate: reply.isPrivate,
    visibility,
    timestamp: nowMs,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    doubtRef,
    {
      replies: increment(1),
      replyCount: increment(1),
      commentsCount: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function subscribeToDoubtReplies(
  doubtDocId: string,
  currentUid: string | null,
  onChange: (replies: ReplyData[]) => void,
  sourceCollection: "doubts" | "posts" = "doubts",
  repliesCollection: "replies" | "comments" = "replies",
): Unsubscribe {
  const repliesRef = collection(db, sourceCollection, doubtDocId, repliesCollection);
  let activeRequestId = 0;
  return onSnapshot(repliesRef, (snap) => {
    activeRequestId += 1;
    const requestId = activeRequestId;
    const toTimestamp = (value: unknown): Timestamp | undefined => {
      if (value instanceof Timestamp) {
        return value;
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        return Timestamp.fromMillis(value);
      }
      if (typeof value === "object" && value !== null) {
        const maybeSeconds = (value as { seconds?: unknown }).seconds;
        const maybeNanoseconds = (value as { nanoseconds?: unknown }).nanoseconds;
        if (typeof maybeSeconds === "number" && Number.isFinite(maybeSeconds)) {
          const nanos =
            typeof maybeNanoseconds === "number" && Number.isFinite(maybeNanoseconds)
              ? maybeNanoseconds
              : 0;
          return new Timestamp(maybeSeconds, nanos);
        }
      }
      return undefined;
    };

    const baseReplies = snap.docs
      .map((replyDoc) => {
        const data = replyDoc.data();
        const visibility = typeof data.visibility === "string" ? data.visibility.toLowerCase() : "";
        const isPrivate = Boolean(data.isPrivate) || visibility === "private";
        const authorUid = String(data.authorUid ?? data.uid ?? data.userId ?? data.authorId ?? "");

        if (isPrivate && authorUid && currentUid !== authorUid) {
          return null;
        }

        const imageUrl = typeof data.imageUrl === "string" && data.imageUrl.trim().length > 0
          ? data.imageUrl
          : null;
        const attachmentUrls = [
          ...(Array.isArray(data.attachmentUrls) ? data.attachmentUrls.map(String) : []),
          ...(imageUrl ? [imageUrl] : []),
        ];

        const createdAt = toTimestamp(data.createdAt) ?? toTimestamp(data.timestamp);
        const rawAvatar = String(data.authorAvatar ?? data.avatar ?? data.profileImage ?? data.photoURL ?? data.photoUrl ?? "");
        const normalizedAvatar = normalizeNonEmptyString(rawAvatar);

        if (!normalizedAvatar && authorUid) {
          const healKey = `${sourceCollection}/${doubtDocId}/${repliesCollection}/${replyDoc.id}`;
          if (!healedReplyAvatarDocs.has(healKey)) {
            healedReplyAvatarDocs.add(healKey);
            void resolveUserIdentity(authorUid, String(data.author ?? data.authorName ?? data.userName ?? "Anonymous"), "")
              .then((identity) =>
                setDoc(
                  doc(db, sourceCollection, doubtDocId, repliesCollection, replyDoc.id),
                  {
                    author: identity.name,
                    authorName: identity.name,
                    userName: identity.name,
                    authorAvatar: identity.avatar,
                    avatar: identity.avatar,
                    profileImage: identity.avatar,
                    photoURL: identity.avatar,
                    photoUrl: identity.avatar,
                    authorPhotoUrl: identity.avatar,
                    authorImageUrl: identity.avatar,
                    userAvatar: identity.avatar,
                    updatedAt: serverTimestamp(),
                  },
                  { merge: true },
                ),
              )
              .catch(() => {
                healedReplyAvatarDocs.delete(healKey);
              });
          }
        }

        return {
          id: replyDoc.id,
          author: String(data.author ?? data.authorName ?? data.userName ?? "Anonymous"),
          authorAvatar: normalizedAvatar,
          authorUid,
          content: String(data.content ?? data.text ?? data.message ?? data.reply ?? data.comment ?? data.body ?? ""),
          isPrivate,
          attachmentUrls,
          createdAt,
        } satisfies ReplyData;
      })
      .filter((reply): reply is ReplyData => reply !== null)
      .sort((a, b) => {
        const aMs = a.createdAt ? a.createdAt.toMillis() : 0;
        const bMs = b.createdAt ? b.createdAt.toMillis() : 0;
        return aMs - bMs;
      });

    void (async () => {
      const replies = await Promise.all(
        baseReplies.map(async (reply) => {
          if (!reply.authorUid) {
            return reply;
          }
          const resolvedIdentity = await resolveUserIdentity(
            reply.authorUid,
            reply.author,
            reply.authorAvatar,
          );
          return {
            ...reply,
            author: resolvedIdentity.name,
            authorAvatar: resolvedIdentity.avatar,
          } satisfies ReplyData;
        }),
      );

      if (requestId === activeRequestId) {
        onChange(replies);
      }
    })();
  });
}
