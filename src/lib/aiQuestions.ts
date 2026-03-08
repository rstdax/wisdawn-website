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

  const body = JSON.stringify({
    topic,
    mcqCount: params.mcqCount ?? 5,
    openQuestionCount: params.openQuestionCount ?? 3,
  });
  const endpoints = [
    "/api/generate-quest-questions",
    "/.netlify/functions/generate-quest-questions",
  ];

  let lastError = "Failed to generate questions.";

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      return payload as GeneratedQuestionSet;
    }

    const errorFromPayload =
      typeof payload?.error === "string" && payload.error.trim()
        ? payload.error
        : "";

    if (response.status === 404) {
      lastError = errorFromPayload || "Question generation endpoint not found.";
      continue;
    }

    throw new Error(errorFromPayload || `Failed to generate questions (HTTP ${response.status}).`);
  }

  throw new Error(lastError);
}
