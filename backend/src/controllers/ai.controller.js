const { generateAIResponse, matchTeammates } = require("../services/ai.service.js");

// ─── Match Teammates ────────────────────────────────────────────────────────
// ✅ Full fixed controller function
async function matchTeammatesController(req, res) {
  const { project, developers } = req.body;

  if (!project || !developers) {
    return res.status(400).json({ error: "Project and developers are required" });
  }

  try {
    const topDevelopers = await matchTeammates(project, developers);
    res.status(200).json(topDevelopers);
  } catch (error) {
    console.error("Match Teammates Error:", error);
    res.status(500).json({ error: error.message });
  }
}

// ─── Improve Project Idea ────────────────────────────────────────────────────
async function improveIdea(req, res) {
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "Idea is required" });
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

  try {
    const raw = await generateAIResponse(userPrompt, systemPrompt);
    res.status(200).json(JSON.parse(raw));
  } catch (error) {
    console.error("Improve Idea Error:", error.message);
    res.status(500).json({ error: "Failed to improve idea", details: error.message });
  }
}

// ─── Enhance Developer Profile ───────────────────────────────────────────────
async function enhanceProfile(req, res) {
  const { bio } = req.body;

  if (!bio) {
    return res.status(400).json({ error: "Bio is required" });
  }

  // ✅ FIX: Bio rewrite is plain text — don't JSON.parse it
  const systemPrompt = `You are a professional career coach.
Respond with plain text only — no JSON, no markdown, no bullet points.`;

  const userPrompt = `Rewrite the following developer bio professionally and concisely:

${bio}`;

  try {
    const enhanced = await generateAIResponse(userPrompt, systemPrompt);
    res.status(200).json({ result: enhanced.trim() });
  } catch (error) {
    console.error("Enhance Profile Error:", error);
    res.status(500).json({ error: "Failed to enhance profile" });
  }
}

module.exports = { matchTeammatesController, improveIdea, enhanceProfile };