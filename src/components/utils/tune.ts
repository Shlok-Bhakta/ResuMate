import { get } from "svelte/store";
import {
  openRouterKey,
  openRouterAIModel,
  jobDescription,
  jobKeywords,
  resumeMd,
  resumeKeywords,
  combinedScore,
  knowlegeBase,
  tuning
} from "./stores";

/**
 * Call OpenRouter to produce a tuned resume markdown.
 * Mirrors original logic while:
 * - Returning a Promise for upstream awaiting
 * - Adding basic defensive checks
 * - Isolating prompt construction for easier future customization
 */
export async function tuneResume(): Promise<void> {
  if (get(tuning)) return; // prevent concurrent runs
  tuning.set(true);

  try {
    const systemPrompt = buildSystemPrompt();
    const userContent = buildUserContent();

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${get(openRouterKey)}`,
      },
      body: JSON.stringify({
        model: get(openRouterAIModel),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!resp.ok) {
      console.error("OpenRouter request failed", resp.status, resp.statusText);
      return;
    }

    const data = await resp.json();
    let content: string = data?.choices?.[0]?.message?.content ?? "";

    // Cleanup steps (retain original intent):
    content = content.replace(/```\n.*?\n```/, "");
    content = content.replace(/```/g, "");

    if (!content.startsWith("#")) {
      // Attempt to trim any leading chatter before first header
      const idx = content.indexOf("#");
      if (idx !== -1) content = content.slice(idx);
    }

    if (content.trim().length > 0) {
      resumeMd.set(content);
    } else {
      console.warn("Tuned content empty; resumeMd left unchanged");
    }
  } catch (err) {
    console.error("Error tuning resume:", err);
  } finally {
    tuning.set(false);
  }
}

/* ------------------------------------------------------------------------ */
/* Prompt Builders                                                          */
/* ------------------------------------------------------------------------ */

function buildSystemPrompt(): string {
  return `
You are a Resume Tuner who cannot tell a lie!

You must truthfully tune a resume to match the job description and requirements.

The resume is markdown. '||' denotes a two-column left/right alignment transform later.

You are a tool: output ONLY the final markdown resume. The first character MUST be the first header (# ...)
Do NOT add explanations or fences. Remove HTML comments (<!-- -->). Keep overall uncommented length stable.

Guidelines:
- Delete irrelevant content; substitute with relevant knowledge-base content ONLY if present (no fabrications).
- Use XYZ bullet format:
  Buzzword X by doing Y resulting in Z (quantitative where possible, but truthful).
- Maintain existing section headers (##, ###, etc.) unless removing an irrelevant section.
- Skills ordering should mirror job description ordering of technologies.
- Adjust casing to exactly match job description tokens (e.g. C++ vs c++).
- Avoid bolding inside skills list to prevent parser issues.
- Coursework: only refine to include technologies explicitly mentioned (e.g. "Database Systems" -> "Database Systems in MySQL & MongoDB" if applicable).
- Experience: Reword bullets to highlight relevant stack items when justified by existing knowledge base or resume comments.
- Projects: Reorder most relevant first; swap or modify to maximize truthful relevance.
- Events/Certifications: Keep only those relevant to the job focus area (e.g. security vs development).
- No lying. If evidence not present in knowledge base/resume, omit.

Scoring system is simplistic keyword overlap; optimize overlap AND authentic recruiter impact.

ONE SHOT: Provide final best version.
NO extraneous text.`;
}

function buildUserContent(): string {
  return `
JOB DESCRIPTION:
${get(jobDescription)}

JOB KEYWORDS (maximize overlap):
${JSON.stringify(get(jobKeywords))}

CURRENT RESUME (markdown):
${get(resumeMd)}

RESUME KEYWORDS:
${JSON.stringify(get(resumeKeywords))}

CURRENT COMBINED SCORE:
${get(combinedScore)}

KNOWLEDGE BASE (safe source of truthful additions):
${get(knowlegeBase)}

Remember:
- Remove comments
- Keep section structure logical
- Maintain approximate length of uncommented material
- Start output with first '#' header
`;
}