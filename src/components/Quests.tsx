import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Zap,
  ChevronRight,
  CheckCircle2,
  Circle,
  Star,
  Award,
  HelpCircle,
  PenTool,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import {
  FALLBACK_CHALLENGES,
  FALLBACK_MILESTONES,
  FALLBACK_QUESTS,
  advanceQuestProgress,
  submitChallengeAnswer,
  subscribeToChallengeProgress,
  subscribeToChallengeQuestions,
  subscribeToQuestDefinitions,
  subscribeToQuestMilestones,
  subscribeToUserQuestProgress,
  subscribeToUserQuestStats,
  type ChallengeQuestion,
  type QuestDefinition,
  type QuestMilestone,
  type QuestProfileStats,
  type QuestProgress,
} from "../lib/quests";
import {
  generateQuestionsFromTopic,
  type GeneratedQuestionSet,
} from "../lib/aiQuestions";

const fallbackStats: QuestProfileStats = {
  level: 12,
  currentXp: 8450,
  nextLevelXp: 10000,
  streak: 14,
};

export function Quests() {
  const { currentUser } = useUser();
  const [questDefinitions, setQuestDefinitions] = useState<QuestDefinition[]>(FALLBACK_QUESTS);
  const [questProgressMap, setQuestProgressMap] = useState<Record<string, QuestProgress>>({});
  const [milestones, setMilestones] = useState<QuestMilestone[]>(FALLBACK_MILESTONES);
  const [challengeQuestions, setChallengeQuestions] = useState<ChallengeQuestion[]>(FALLBACK_CHALLENGES);
  const [challengeProgressMap, setChallengeProgressMap] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<QuestProfileStats>(fallbackStats);
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [submittingQuestIds, setSubmittingQuestIds] = useState<Record<string, boolean>>({});
  const [submittingChallengeIds, setSubmittingChallengeIds] = useState<Record<string, boolean>>({});
  const [aiTopic, setAiTopic] = useState("");
  const [isGeneratingAiQuestions, setIsGeneratingAiQuestions] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState("");
  const [generatedQuestionSet, setGeneratedQuestionSet] = useState<GeneratedQuestionSet | null>(null);

  useEffect(() => {
    const unsubs = [
      subscribeToQuestDefinitions(setQuestDefinitions),
      subscribeToQuestMilestones(setMilestones),
      subscribeToChallengeQuestions(setChallengeQuestions),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) {
      setQuestProgressMap({});
      setChallengeProgressMap({});
      setStats(fallbackStats);
      return;
    }

    const unsubs = [
      subscribeToUserQuestProgress(uid, setQuestProgressMap),
      subscribeToChallengeProgress(uid, setChallengeProgressMap),
      subscribeToUserQuestStats(uid, setStats),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [currentUser?.uid]);

  const dailyQuests = useMemo(
    () => questDefinitions.filter((quest) => quest.type === "daily"),
    [questDefinitions],
  );
  const weeklyQuests = useMemo(
    () => questDefinitions.filter((quest) => quest.type === "weekly"),
    [questDefinitions],
  );
  const mcqQuestions = useMemo(
    () => challengeQuestions.filter((question) => question.type === "mcq"),
    [challengeQuestions],
  );
  const longAnswerQuestions = useMemo(
    () => challengeQuestions.filter((question) => question.type === "long"),
    [challengeQuestions],
  );

  const iconMap = {
    zap: <Zap size={24} className="text-yellow-400" />,
    star: <Star size={24} className="text-blue-400" />,
    target: <Target size={24} className="text-purple-400" />,
    award: <Award size={24} className="text-emerald-400" />,
  } as const;

  const handleQuestProgress = async (quest: QuestDefinition) => {
    if (!currentUser?.uid) return;
    setSubmittingQuestIds((prev) => ({ ...prev, [quest.id]: true }));
    try {
      await advanceQuestProgress({
        uid: currentUser.uid,
        quest,
        step: quest.isPercentage ? 10 : 1,
      });
    } catch (error) {
      console.error("Failed to update quest progress:", error);
    } finally {
      setSubmittingQuestIds((prev) => ({ ...prev, [quest.id]: false }));
    }
  };

  const handleChallengeSubmit = async (question: ChallengeQuestion) => {
    if (!currentUser?.uid) return;
    const answerText = (answerInputs[question.id] ?? "").trim();
    if (!answerText) return;

    setSubmittingChallengeIds((prev) => ({ ...prev, [question.id]: true }));
    try {
      await submitChallengeAnswer({
        uid: currentUser.uid,
        question,
        answerText,
      });
    } catch (error) {
      console.error("Failed to submit challenge answer:", error);
    } finally {
      setSubmittingChallengeIds((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const handleGenerateAiQuestions = async () => {
    const topic = aiTopic.trim();
    if (!topic) {
      setAiGenerationError("Please enter a topic first.");
      return;
    }

    setAiGenerationError("");
    setIsGeneratingAiQuestions(true);
    try {
      const generated = await generateQuestionsFromTopic({
        topic,
      });
      setGeneratedQuestionSet(generated);
    } catch (error) {
      setAiGenerationError(error instanceof Error ? error.message : "Failed to generate questions.");
    } finally {
      setIsGeneratingAiQuestions(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-12 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Your Quests</h1>
        <p className="text-neutral-400">Complete objectives to earn XP and unlock exclusive rewards.</p>
      </div>

      <section className="bg-[#18181b] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-[2px] shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-[#18181b] rounded-[14px] flex items-center justify-center flex-col">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-0.5">Lvl</span>
                <span className="text-2xl font-black text-white leading-none">{stats.level}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Quest Progress</h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Live
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
                <span>{stats.currentXp.toLocaleString()} XP</span>
                <span className="text-neutral-600">/</span>
                <span>{stats.nextLevelXp.toLocaleString()} XP</span>
              </div>
              <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.currentXp / stats.nextLevelXp) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[160px]">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <Zap size={22} className="text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-white leading-none mb-1">{stats.streak}</div>
              <div className="text-xs font-medium text-orange-400 uppercase tracking-wider">Day Streak</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2 mb-4">
              <Target size={20} className="text-blue-400" /> Daily Objectives
            </h2>
            <div className="flex flex-col gap-3">
              {dailyQuests.map((quest, i) => {
                const state = questProgressMap[quest.id];
                const progress = Math.min(quest.total, state?.progress ?? 0);
                const isCompleted = state?.isCompleted ?? false;
                const isSubmitting = Boolean(submittingQuestIds[quest.id]);
                return (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-[#18181b] p-4 rounded-2xl border transition-all flex items-center gap-4 ${isCompleted ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 hover:border-white/10"}`}
                  >
                    <div className="shrink-0">
                      {isCompleted ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} className="text-neutral-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold mb-1 truncate ${isCompleted ? "text-white" : "text-neutral-200"}`}>{quest.title}</h3>
                      {quest.description && <p className="text-xs text-neutral-500 truncate mb-2">{quest.description}</p>}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isCompleted ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${(progress / quest.total) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-neutral-400 w-10 text-right">
                          {quest.isPercentage ? `${progress}%` : `${progress}/${quest.total}`}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 font-semibold text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                        +{quest.xp} XP
                      </div>
                      <button
                        onClick={() => void handleQuestProgress(quest)}
                        disabled={isCompleted || isSubmitting || !currentUser}
                        className="px-3 py-1.5 text-[10px] font-bold rounded-md bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleted ? "Completed" : isSubmitting ? "Saving..." : "Add Progress"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2 mb-4 mt-4">
              <Trophy size={20} className="text-purple-400" /> Weekly Objectives
            </h2>
            <div className="flex flex-col gap-3">
              {weeklyQuests.map((quest, i) => {
                const state = questProgressMap[quest.id];
                const progress = Math.min(quest.total, state?.progress ?? 0);
                const isCompleted = state?.isCompleted ?? false;
                const isSubmitting = Boolean(submittingQuestIds[quest.id]);
                return (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="bg-[#18181b] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-4"
                  >
                    <div className="shrink-0">
                      {isCompleted ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} className="text-neutral-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-neutral-200 mb-1 truncate">{quest.title}</h3>
                      {quest.description && <p className="text-xs text-neutral-500 truncate mb-2">{quest.description}</p>}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(progress / quest.total) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-neutral-400 w-10 text-right">
                          {quest.isPercentage ? `${progress}%` : `${progress}/${quest.total}`}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 font-semibold text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                        +{quest.xp.toLocaleString()} XP
                      </div>
                      <button
                        onClick={() => void handleQuestProgress(quest)}
                        disabled={isCompleted || isSubmitting || !currentUser}
                        className="px-3 py-1.5 text-[10px] font-bold rounded-md bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleted ? "Completed" : isSubmitting ? "Saving..." : "Add Progress"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              <Award size={20} className="text-emerald-400" /> Milestones
            </h2>
            <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group">
              View all <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {milestones.map((milestone, i) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className={`relative p-5 rounded-2xl border transition-all h-full flex flex-col ${milestone.unlocked ? "bg-[#18181b] border-white/10 hover:border-white/20" : "bg-white/[0.02] border-white/5 border-dashed grayscale-[0.8] opacity-60"}`}
              >
                <div className="mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${milestone.unlocked ? "bg-white/5 border border-white/5 shadow-inner" : "bg-black/20 text-neutral-600"}`}>
                    {iconMap[milestone.iconKey]}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{milestone.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{milestone.description}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-white/5">
                  {milestone.unlocked ? (
                    <div className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> Unlocked{milestone.date ? ` on ${milestone.date}` : ""}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, milestone.progress ?? 0))}%` }} />
                      </div>
                      <span className="text-[10px] font-medium text-neutral-500 w-8 text-right">
                        {Math.max(0, Math.min(100, milestone.progress ?? 0))}%
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Challenge Arena</h2>
          <p className="text-neutral-400">Test your knowledge and earn XP by answering backend-tracked challenges.</p>
        </div>

        <section className="bg-[#18181b] border border-white/10 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-indigo-400" />
            <h3 className="text-xl font-semibold tracking-tight text-white">AI Question Generator</h3>
          </div>
          <p className="text-sm text-neutral-400 mb-5">
            Enter any topic and generate practice MCQs plus descriptive questions.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={aiTopic}
              onChange={(event) => setAiTopic(event.target.value)}
              placeholder="e.g. Photosynthesis, Trigonometry, Operating Systems"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-white/20"
            />
            <button
              onClick={() => void handleGenerateAiQuestions()}
              disabled={isGeneratingAiQuestions}
              className="shrink-0 px-5 py-3 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGeneratingAiQuestions ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Questions"
              )}
            </button>
          </div>

          {aiGenerationError && (
            <p className="mt-3 text-sm text-rose-400">{aiGenerationError}</p>
          )}

          {generatedQuestionSet && (
            <div className="mt-7 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
                <h4 className="text-base font-semibold text-white mb-4">MCQs on {generatedQuestionSet.topic}</h4>
                <div className="space-y-4">
                  {generatedQuestionSet.mcqs.map((mcq, index) => (
                    <div key={`ai-mcq-${index}`} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                      <p className="text-sm text-white font-medium mb-3">{index + 1}. {mcq.question}</p>
                      <div className="space-y-2">
                        {mcq.options.map((option, optionIndex) => {
                          const isAnswer = optionIndex === mcq.answerIndex;
                          return (
                            <div
                              key={`ai-mcq-opt-${index}-${optionIndex}`}
                              className={`text-xs rounded-lg px-3 py-2 border ${isAnswer ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/[0.02] text-neutral-300"}`}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </div>
                          );
                        })}
                      </div>
                      {mcq.explanation && (
                        <p className="mt-3 text-xs text-neutral-400">Why: {mcq.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-2xl p-5">
                <h4 className="text-base font-semibold text-white mb-4">Long Answer Practice</h4>
                <div className="space-y-4">
                  {generatedQuestionSet.openQuestions.map((question, index) => (
                    <div key={`ai-open-${index}`} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                      <p className="text-sm text-white font-medium mb-3">{index + 1}. {question.question}</p>
                      <div className="space-y-2">
                        {question.expectedPoints.map((point, pointIndex) => (
                          <p key={`ai-open-point-${index}-${pointIndex}`} className="text-xs text-neutral-400">
                            - {point}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-cyan-400" /> Quick Fire (MCQ)
              </h3>
            </div>
            <div className="flex flex-col gap-6">
              {mcqQuestions.map((question, i) => {
                const isCompleted = Boolean(challengeProgressMap[question.id]);
                const isSubmitting = Boolean(submittingChallengeIds[question.id]);
                const selected = answerInputs[question.id] ?? "";
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + (i * 0.1) }}
                    className="bg-[#18181b] border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20">{question.subject}</span>
                      <span className="text-xs font-semibold text-amber-400">+{question.xp} XP</span>
                    </div>
                    <h4 className="text-[15px] font-medium text-white mb-5 leading-relaxed">{question.text}</h4>
                    <div className="flex flex-col gap-2">
                      {question.options.map((option, optionIndex) => {
                        const value = `${String.fromCharCode(65 + optionIndex)}. ${option}`;
                        const isActive = selected === value;
                        return (
                          <button
                            key={value}
                            onClick={() => setAnswerInputs((prev) => ({ ...prev, [question.id]: value }))}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${isActive ? "border-cyan-400/50 bg-cyan-400/10 text-white" : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 text-neutral-300 hover:text-white"}`}
                            disabled={isCompleted}
                          >
                            <span className="text-neutral-500 mr-3">{String.fromCharCode(65 + optionIndex)}</span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-5 pt-5 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => void handleChallengeSubmit(question)}
                        disabled={isCompleted || isSubmitting || !selected || !currentUser}
                        className="px-5 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleted ? "Completed" : isSubmitting ? "Submitting..." : "Submit Answer"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                <PenTool size={20} className="text-pink-400" /> Deep Dive (Long Answer)
              </h3>
            </div>
            <div className="flex flex-col gap-6">
              {longAnswerQuestions.map((question, i) => {
                const isCompleted = Boolean(challengeProgressMap[question.id]);
                const isSubmitting = Boolean(submittingChallengeIds[question.id]);
                const answer = answerInputs[question.id] ?? "";
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="bg-[#18181b] border border-white/10 rounded-2xl p-6 flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-400/10 px-2 py-1 rounded-md border border-pink-400/20">{question.subject}</span>
                      <span className="text-xs font-semibold text-amber-400">+{question.xp} XP</span>
                    </div>
                    <h4 className="text-[15px] font-medium text-white mb-5 leading-relaxed">{question.text}</h4>
                    <textarea
                      className="w-full flex-1 min-h-[140px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-white/20 resize-none mb-5"
                      placeholder="Formulate your detailed response here..."
                      value={answer}
                      onChange={(event) =>
                        setAnswerInputs((prev) => ({ ...prev, [question.id]: event.target.value }))
                      }
                      disabled={isCompleted}
                    />
                    <div className="mt-auto pt-5 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => void handleChallengeSubmit(question)}
                        disabled={isCompleted || isSubmitting || answer.trim().length < 20 || !currentUser}
                        className="px-5 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleted ? "Completed" : isSubmitting ? "Submitting..." : "Submit Response"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

