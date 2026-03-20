const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Core AI call — sends a prompt to Groq and returns the text response.
 * @param {string} userPrompt - The user-facing prompt
 * @param {string} [systemPrompt] - Optional system instructions
 * @returns {Promise<string>} Raw text response from Groq
 */
async function generateAIResponse(
  userPrompt,
  systemPrompt = "You are a helpful assistant."
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // or "mixtral-8x7b-32768"
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content ?? "";
}

/**
 * Match teammates using AI based on project requirements.
 * @param {Object} project   - { title, techStack }
 * @param {Array}  developers - Array of developer profiles
 * @returns {Promise<Object>} Parsed JSON with matched developers
 */
async function matchTeammates(project, developers) {
  const systemPrompt = `You are an expert tech team builder.
Always respond with valid JSON only — no markdown, no code fences, no explanation.`;

  const userPrompt = `Match the best developers for this project.

Project Title: ${project.title}
Required Tech Stack: ${JSON.stringify(project.techStack)}

Available Developers:
${JSON.stringify(developers, null, 2)}

Return JSON with exactly this shape:
{
  "topMatches": [
    {
      "developerId": "string",
      "name": "string",
      "matchScore": 0-100,
      "reason": "string"
    }
  ]
}`;

  try {
    const raw = await generateAIResponse(userPrompt, systemPrompt);
    return JSON.parse(raw);
  } catch (error) {
    console.error("Match Teammates Service Error:", error);
    throw new Error("Failed to match teammates");
  }
}

module.exports = { generateAIResponse, matchTeammates };