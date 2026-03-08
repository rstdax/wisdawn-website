const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

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

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonResponse(500, { error: "OPENAI_API_KEY is not configured." });
    }

    const body = JSON.parse(event.body ?? "{}");
    const topic = safeString(body.topic);
    const mcqCount = Math.max(1, Math.min(10, Number(body.mcqCount) || 5));
    const openQuestionCount = Math.max(1, Math.min(10, Number(body.openQuestionCount) || 3));

    if (!topic) {
      return jsonResponse(400, { error: "Topic is required." });
    }

    const prompt = [
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

    const openAiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        input: prompt,
      }),
    });

    if (!openAiResponse.ok) {
      const errorPayload = await openAiResponse.text();
      return jsonResponse(502, {
        error: "AI provider request failed.",
        details: errorPayload.slice(0, 500),
      });
    }

    const responseData = await openAiResponse.json();
    const outputText = responseData?.output_text;
    if (!safeString(outputText)) {
      return jsonResponse(502, { error: "AI provider returned empty output." });
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      const jsonStart = outputText.indexOf("{");
      const jsonEnd = outputText.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        return jsonResponse(502, { error: "Failed to parse AI output as JSON." });
      }
      parsed = JSON.parse(outputText.slice(jsonStart, jsonEnd + 1));
    }

    const normalized = parseAndNormalize(parsed, topic);
    return jsonResponse(200, normalized);
  } catch (error) {
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
}
