const { generateAIResponse, matchTeammates } = require("../services/ai.service.js");
const ApiResponse = require("../utils/api-response");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

// ─── Match Teammates ────────────────────────────────────────────────────────
// ✅ Full fixed controller function
const matchTeammatesController = asyncHandler(async (req, res, next) => {
  const { project, developers } = req.body;

  if (!project || !developers) {
    throw new ApiError(400, "Project and developers are required");
  }

  const topDevelopers = await matchTeammates(project, developers);
  res.status(200).json(new ApiResponse(200, topDevelopers));
})

// ─── Improve Project Idea ────────────────────────────────────────────────────
const improveIdea = asyncHandler(async (req, res, next) => {
  const { idea } = req.body;

  if (!idea) {
    throw new ApiError(400, "Idea is required");
  }

  const systemPrompt = `You are a senior software architect.
Always respond with valid JSON only — no markdown, no code fences, no explanation.`;

  const userPrompt = `Improve the following project idea professionally.

Idea: ${idea}

Return JSON with exactly this shape:
{
  "title": "string",
  "description": "string",
  "keyFeatures": ["string"],
  "techStack": ["string"],
  "rolesNeeded": ["string"]
}`;

  const raw = await generateAIResponse(userPrompt, systemPrompt);
  res.status(200).json(new ApiResponse(200, JSON.parse(raw)));
})

// ─── Enhance Developer Profile ───────────────────────────────────────────────
const enhanceProfile = asyncHandler(async (req, res, next) => {
  const { bio } = req.body;

  if (!bio) {
    throw new ApiError(400, "Bio is required");
  }

  // ✅ FIX: Bio rewrite is plain text — don't JSON.parse it
  const systemPrompt = `You are a professional career coach.
Respond with plain text only — no JSON, no markdown, no bullet points.`;

  const userPrompt = `Rewrite the following developer bio professionally and concisely:

${bio}`;

  const enhanced = await generateAIResponse(userPrompt, systemPrompt);
  res.status(200).json(new ApiResponse(200, { result: enhanced.trim() }));
})

module.exports = { matchTeammatesController, improveIdea, enhanceProfile };