export type GeneratedMcq = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type GeneratedOpenQuestion = {
  question: string;
  expectedPoints: string[];
};

export type GeneratedQuestionSet = {
  topic: string;
  mcqs: GeneratedMcq[];
  openQuestions: GeneratedOpenQuestion[];
};

type GenerateQuestionsParams = {
  topic: string;
  mcqCount?: number;
  openQuestionCount?: number;
};

export async function generateQuestionsFromTopic(params: GenerateQuestionsParams): Promise<GeneratedQuestionSet> {
  const topic = params.topic.trim();
  if (!topic) {
    throw new Error("Please enter a topic.");
  }

  const response = await fetch("/.netlify/functions/generate-quest-questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      mcqCount: params.mcqCount ?? 5,
      openQuestionCount: params.openQuestionCount ?? 3,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.error === "string" && payload.error.trim()
        ? payload.error
        : "Failed to generate questions.";
    throw new Error(message);
  }

  return payload as GeneratedQuestionSet;
}
