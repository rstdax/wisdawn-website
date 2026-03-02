import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type QuestType = "daily" | "weekly";
export type ChallengeType = "mcq" | "long";

export interface QuestDefinition {
  id: string;
  title: string;
  description?: string;
  xp: number;
  type: QuestType;
  total: number;
  isPercentage?: boolean;
  sortOrder: number;
}

export interface QuestProgress {
  progress: number;
  isCompleted: boolean;
  xpAwarded: boolean;
}

export interface QuestMilestone {
  id: string;
  title: string;
  description: string;
  iconKey: "zap" | "star" | "target" | "award";
  unlocked: boolean;
  date?: string;
  progress?: number;
  sortOrder: number;
}

export interface ChallengeQuestion {
  id: string;
  type: ChallengeType;
  xp: number;
  subject: string;
  text: string;
  options: string[];
}

export interface QuestProfileStats {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streak: number;
}

export const FALLBACK_QUESTS: QuestDefinition[] = [
  { id: "q-d-1", title: "Complete a Focus Session", xp: 150, type: "daily", total: 2, sortOrder: 1 },
  { id: "q-d-2", title: "Help a Peer", description: "Answer a doubt in your locality", xp: 300, type: "daily", total: 1, sortOrder: 2 },
  { id: "q-d-3", title: "Daily Login", xp: 50, type: "daily", total: 1, sortOrder: 3 },
  { id: "q-w-1", title: "Attend 3 Live Workshops", xp: 1000, type: "weekly", total: 3, sortOrder: 10 },
  {
    id: "q-w-2",
    title: "Mastery: System Design",
    description: "Complete the System Design module",
    xp: 2500,
    type: "weekly",
    total: 100,
    isPercentage: true,
    sortOrder: 11,
  },
];

export const FALLBACK_MILESTONES: QuestMilestone[] = [
  {
    id: "m1",
    title: "Early Bird",
    description: "Complete 10 focus sessions before 9 AM",
    iconKey: "zap",
    unlocked: true,
    date: "Oct 12, 2026",
    sortOrder: 1,
  },
  {
    id: "m2",
    title: "Community Pillar",
    description: "Receive 50 upvotes on your answers",
    iconKey: "star",
    unlocked: true,
    date: "Sep 28, 2026",
    sortOrder: 2,
  },
  {
    id: "m3",
    title: "Deep Thinker",
    description: "Log 100 hours of focus time",
    iconKey: "target",
    unlocked: false,
    progress: 82,
    sortOrder: 3,
  },
  {
    id: "m4",
    title: "Workshop Host",
    description: "Successfully host your first live session",
    iconKey: "award",
    unlocked: false,
    progress: 0,
    sortOrder: 4,
  },
];

export const FALLBACK_CHALLENGES: ChallengeQuestion[] = [
  {
    id: "q1",
    type: "mcq",
    xp: 50,
    subject: "System Design",
    text: "Which CAP theorem property guarantees every request gets a response?",
    options: ["Consistency", "Availability", "Partition Tolerance", "Latency"],
  },
  {
    id: "q2",
    type: "mcq",
    xp: 40,
    subject: "JavaScript",
    text: "What is `typeof null`?",
    options: ["null", "undefined", "object", "string"],
  },
  {
    id: "l1",
    type: "long",
    xp: 150,
    subject: "React Hooks",
    text: "Explain differences between useMemo and useCallback with a concrete scenario.",
    options: [],
  },
  {
    id: "l2",
    type: "long",
    xp: 200,
    subject: "Database Architecture",
    text: "Describe trade-offs of vertical vs horizontal scaling for read-heavy workloads.",
    options: [],
  },
];

function normalizeQuestDefinition(id: string, data: Record<string, unknown>): QuestDefinition {
  return {
    id,
    title: String(data.title ?? "Untitled Quest"),
    description: typeof data.description === "string" ? data.description : undefined,
    xp: Number(data.xp ?? 0),
    type: String(data.type ?? "daily").toLowerCase() === "weekly" ? "weekly" : "daily",
    total: Math.max(1, Number(data.total ?? data.target ?? 1)),
    isPercentage: Boolean(data.isPercentage),
    sortOrder: Number(data.sortOrder ?? data.order ?? 999),
  };
}

export function subscribeToQuestDefinitions(onChange: (quests: QuestDefinition[]) => void): Unsubscribe {
  const questsRef = collection(db, "quests");
  return onSnapshot(
    questsRef,
    (snap) => {
      const items = snap.docs
        .map((questDoc) => normalizeQuestDefinition(questDoc.id, questDoc.data()))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onChange(items.length > 0 ? items : FALLBACK_QUESTS);
    },
    () => onChange(FALLBACK_QUESTS),
  );
}

export function subscribeToQuestMilestones(onChange: (milestones: QuestMilestone[]) => void): Unsubscribe {
  const milestonesRef = collection(db, "questMilestones");
  return onSnapshot(
    milestonesRef,
    (snap) => {
      const items = snap.docs
        .map((milestoneDoc) => {
          const data = milestoneDoc.data();
          return {
            id: milestoneDoc.id,
            title: String(data.title ?? "Untitled Milestone"),
            description: String(data.description ?? ""),
            iconKey:
              String(data.iconKey ?? "award").toLowerCase() === "zap"
                ? "zap"
                : String(data.iconKey ?? "award").toLowerCase() === "star"
                  ? "star"
                  : String(data.iconKey ?? "award").toLowerCase() === "target"
                    ? "target"
                    : "award",
            unlocked: Boolean(data.unlocked),
            date: typeof data.date === "string" ? data.date : undefined,
            progress: typeof data.progress === "number" ? data.progress : undefined,
            sortOrder: Number(data.sortOrder ?? data.order ?? 999),
          } satisfies QuestMilestone;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onChange(items.length > 0 ? items : FALLBACK_MILESTONES);
    },
    () => onChange(FALLBACK_MILESTONES),
  );
}

export function subscribeToChallengeQuestions(onChange: (questions: ChallengeQuestion[]) => void): Unsubscribe {
  const questionsRef = collection(db, "questChallenges");
  return onSnapshot(
    questionsRef,
    (snap) => {
      const items = snap.docs
        .map((questionDoc) => {
          const data = questionDoc.data();
          return {
            id: questionDoc.id,
            type: String(data.type ?? "mcq").toLowerCase() === "long" ? "long" : "mcq",
            xp: Number(data.xp ?? 0),
            subject: String(data.subject ?? "General"),
            text: String(data.text ?? ""),
            options: Array.isArray(data.options) ? data.options.map(String) : [],
          } satisfies ChallengeQuestion;
        })
        .sort((a, b) => a.subject.localeCompare(b.subject));
      onChange(items.length > 0 ? items : FALLBACK_CHALLENGES);
    },
    () => onChange(FALLBACK_CHALLENGES),
  );
}

export function subscribeToUserQuestProgress(
  uid: string,
  onChange: (progressMap: Record<string, QuestProgress>) => void,
): Unsubscribe {
  const progressRef = collection(db, "users", uid, "questProgress");
  return onSnapshot(progressRef, (snap) => {
    const nextMap: Record<string, QuestProgress> = {};
    snap.docs.forEach((progressDoc) => {
      const data = progressDoc.data();
      nextMap[progressDoc.id] = {
        progress: Math.max(0, Number(data.progress ?? 0)),
        isCompleted: Boolean(data.isCompleted),
        xpAwarded: Boolean(data.xpAwarded),
      };
    });
    onChange(nextMap);
  });
}

export function subscribeToUserQuestStats(uid: string, onChange: (stats: QuestProfileStats) => void): Unsubscribe {
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (snap) => {
    const data = snap.data() ?? {};
    onChange({
      level: Math.max(1, Number(data.questLevel ?? 12)),
      currentXp: Math.max(0, Number(data.questCurrentXp ?? 8450)),
      nextLevelXp: Math.max(1000, Number(data.questNextLevelXp ?? 10000)),
      streak: Math.max(0, Number(data.questStreak ?? 14)),
    });
  });
}

export async function advanceQuestProgress(params: {
  uid: string;
  quest: QuestDefinition;
  step?: number;
}): Promise<void> {
  const { uid, quest, step = 1 } = params;
  const progressRef = doc(db, "users", uid, "questProgress", quest.id);
  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const progressSnap = await transaction.get(progressRef);
    const userSnap = await transaction.get(userRef);
    const progressData = progressSnap.exists() ? progressSnap.data() : {};
    const userData = userSnap.exists() ? userSnap.data() : {};

    const previousProgress = Math.max(0, Number(progressData.progress ?? 0));
    const nextProgress = Math.min(quest.total, previousProgress + Math.max(1, step));
    const isCompleted = nextProgress >= quest.total;
    const alreadyAwarded = Boolean(progressData.xpAwarded);
    const shouldAwardXp = isCompleted && !alreadyAwarded;

    const currentXp = Math.max(0, Number(userData.questCurrentXp ?? 8450));
    let level = Math.max(1, Number(userData.questLevel ?? 12));
    let nextLevelXp = Math.max(1000, Number(userData.questNextLevelXp ?? 10000));
    let updatedXp = currentXp;

    if (shouldAwardXp) {
      updatedXp += quest.xp;
      while (updatedXp >= nextLevelXp) {
        level += 1;
        nextLevelXp += 1000;
      }
    }

    transaction.set(
      progressRef,
      {
        questId: quest.id,
        progress: nextProgress,
        isCompleted,
        xpAwarded: alreadyAwarded || shouldAwardXp,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    if (shouldAwardXp) {
      transaction.set(
        userRef,
        {
          questCurrentXp: updatedXp,
          questLevel: level,
          questNextLevelXp: nextLevelXp,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  });
}

export async function submitChallengeAnswer(params: {
  uid: string;
  question: ChallengeQuestion;
  answerText: string;
}): Promise<void> {
  const { uid, question, answerText } = params;
  const challengeProgressRef = doc(db, "users", uid, "challengeProgress", question.id);
  const userRef = doc(db, "users", uid);
  const attemptsRef = collection(db, "users", uid, "challengeAttempts");

  await runTransaction(db, async (transaction) => {
    const challengeProgressSnap = await transaction.get(challengeProgressRef);
    const userSnap = await transaction.get(userRef);

    const challengeData = challengeProgressSnap.exists() ? challengeProgressSnap.data() : {};
    if (Boolean(challengeData.isCompleted)) {
      return;
    }

    const userData = userSnap.exists() ? userSnap.data() : {};
    let currentXp = Math.max(0, Number(userData.questCurrentXp ?? 8450));
    let level = Math.max(1, Number(userData.questLevel ?? 12));
    let nextLevelXp = Math.max(1000, Number(userData.questNextLevelXp ?? 10000));

    currentXp += question.xp;
    while (currentXp >= nextLevelXp) {
      level += 1;
      nextLevelXp += 1000;
    }

    transaction.set(
      challengeProgressRef,
      {
        challengeId: question.id,
        isCompleted: true,
        answerText,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    transaction.set(
      userRef,
      {
        questCurrentXp: currentXp,
        questLevel: level,
        questNextLevelXp: nextLevelXp,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  await addDoc(attemptsRef, {
    challengeId: question.id,
    type: question.type,
    subject: question.subject,
    answerText,
    xp: question.xp,
    submittedAt: serverTimestamp(),
  });
}

export function subscribeToChallengeProgress(
  uid: string,
  onChange: (completedMap: Record<string, boolean>) => void,
): Unsubscribe {
  const progressRef = collection(db, "users", uid, "challengeProgress");
  return onSnapshot(progressRef, (snap) => {
    const map: Record<string, boolean> = {};
    snap.docs.forEach((item) => {
      map[item.id] = Boolean(item.data().isCompleted);
    });
    onChange(map);
  });
}

