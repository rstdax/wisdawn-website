const GOOGLE_GENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GOOGLE_MODEL = "gemini-2.0-flash";

function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseAndNormalize(raw, topic) {
  const mcqs = Array.isArray(raw?.mcqs)
    ? raw.mcqs
        .map((item) => {
          const question = safeString(item?.question);
          const options = Array.isArray(item?.options)
            ? item.options.map((option) => safeString(option)).filter(Boolean).slice(0, 4)
            : [];
          const answerIndex = Number(item?.answerIndex);
          const explanation = safeString(item?.explanation);

          if (!question || options.length !== 4 || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
            return null;
          }

          return {
            question,
            options,
            answerIndex,
            explanation,
          };
        })
        .filter(Boolean)
    : [];

  const openQuestions = Array.isArray(raw?.openQuestions)
    ? raw.openQuestions
        .map((item) => {
          const question = safeString(item?.question);
          const expectedPoints = Array.isArray(item?.expectedPoints)
            ? item.expectedPoints.map((point) => safeString(point)).filter(Boolean).slice(0, 5)
            : [];

          if (!question || expectedPoints.length === 0) {
            return null;
          }

          return {
            question,
            expectedPoints,
          };
        })
        .filter(Boolean)
    : [];

  if (mcqs.length === 0 && openQuestions.length === 0) {
    throw new Error("Model returned an invalid response format.");
  }

  return {
    topic,
    mcqs,
    openQuestions,
  };
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Failed to parse AI output as JSON.");
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

function buildPrompt(topic, mcqCount, openQuestionCount) {
  return [
    "You are an educational question generator.",
    "Generate high-quality assessment questions for the given topic.",
    "Return only JSON, with no markdown fences.",
    "Use exactly this schema:",
    '{ "mcqs": [{"question":"", "options":["","","",""], "answerIndex":0, "explanation":""}], "openQuestions": [{"question":"", "expectedPoints":["","",""]}] }',
    `Generate ${mcqCount} MCQs and ${openQuestionCount} open-ended questions.`,
    "Rules:",
    "- MCQs must have exactly 4 options.",
    "- answerIndex must be 0 to 3.",
    "- Questions should be suitable for high-school/undergraduate learners.",
    "- Keep language clear and concise.",
    `Topic: ${topic}`,
  ].join("\n");
}

async function callGoogleAI(apiKey, model, prompt) {
  const cleanedModel = safeString(model).replace(/^models\//, "");
  const preferredModels = [
    cleanedModel || DEFAULT_GOOGLE_MODEL,
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
  ].filter(Boolean);

  const tried = new Set();
  let lastError = "AI provider request failed.";

  for (const candidateModel of preferredModels) {
    if (tried.has(candidateModel)) continue;
    tried.add(candidateModel);

    const response = await fetch(`${GOOGLE_GENAI_BASE_URL}/${candidateModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 900,
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      lastError = `AI provider request failed (${response.status}) on model ${candidateModel}: ${details.slice(0, 300)}`;
      if (response.status === 404) {
        continue;
      }
      throw new Error(lastError);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts)
      ? safeString(parts.map((part) => safeString(part?.text)).join("\n"))
      : "";

    if (text) {
      return text;
    }
  }

  throw new Error(lastError);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const apiKey = safeString(process.env.GOOGLE_API_KEY);

    if (!apiKey) {
      res.status(500).json({ error: "GOOGLE_API_KEY is not configured." });
      return;
    }

    const body = req.body ?? {};
    const topic = safeString(body.topic);
    const mcqCount = Math.max(1, Math.min(10, Number(body.mcqCount) || 5));
    const openQuestionCount = Math.max(1, Math.min(10, Number(body.openQuestionCount) || 3));

    if (!topic) {
      res.status(400).json({ error: "Topic is required." });
      return;
    }

    const prompt = buildPrompt(topic, mcqCount, openQuestionCount);
    const rawText = await callGoogleAI(apiKey, process.env.GOOGLE_MODEL, prompt);

    const parsed = extractJson(rawText);
    const normalized = parseAndNormalize(parsed, topic);
    res.status(200).json(normalized);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
}
