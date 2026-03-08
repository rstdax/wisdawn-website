const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4.1-mini";

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

async function callOpenAI(apiKey, model, prompt) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || DEFAULT_OPENAI_MODEL,
      input: prompt,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`AI provider request failed (${response.status}): ${details.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = safeString(data?.output_text);
  if (!text) {
    throw new Error("AI provider returned empty output.");
  }
  return text;
}

async function callOpenRouter(apiKey, model, prompt, host) {
  const resolvedModel = model
    ? (model.includes("/") ? model : `openai/${model}`)
    : DEFAULT_OPENROUTER_MODEL;
  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": host || "https://vercel.app",
      "X-Title": "wisdawn-website",
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`AI provider request failed (${response.status}): ${details.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = safeString(data?.choices?.[0]?.message?.content);
  if (!text) {
    throw new Error("AI provider returned empty output.");
  }
  return text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "OPENAI_API_KEY is not configured." });
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
    const usesOpenRouter = apiKey.startsWith("sk-or-v1-");

    const rawText = usesOpenRouter
      ? await callOpenRouter(apiKey, process.env.OPENAI_MODEL, prompt, req.headers?.origin)
      : await callOpenAI(apiKey, process.env.OPENAI_MODEL, prompt);

    const parsed = extractJson(rawText);
    const normalized = parseAndNormalize(parsed, topic);
    res.status(200).json(normalized);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
}
