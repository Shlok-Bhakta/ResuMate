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
  tuning,
  streamingContent,
  isStreaming
} from "./stores";

/**
 * Call OpenRouter to produce a tuned resume markdown with streaming support.
 * Features:
 * - Streaming response with throttled updates (250ms intervals)
 * - Visual feedback with streaming state management
 * - Prevents concurrent runs and handles cleanup
 */
export async function tuneResume(): Promise<void> {
  if (get(tuning)) return; // prevent concurrent runs
  
  tuning.set(true);
  isStreaming.set(true);
  streamingContent.set("");

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
        stream: true,
      }),
    });

    if (!resp.ok) {
      console.error("OpenRouter request failed", resp.status, resp.statusText);
      return;
    }

    await processStreamingResponse(resp);
  } catch (err) {
    console.error("Error tuning resume:", err);
  } finally {
    tuning.set(false);
    isStreaming.set(false);
  }
}

/**
 * Process streaming response with throttled updates every 250ms
 */
async function processStreamingResponse(response: Response): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available");

  const decoder = new TextDecoder();
  let buffer = "";
  let accumulatedContent = "";
  let lastUpdateTime = 0;
  const UPDATE_INTERVAL = 250; // ms

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // Final update
            finalizeContent(accumulatedContent);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed?.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedContent += content;
              
              // Throttled updates
              const now = Date.now();
              if (now - lastUpdateTime >= UPDATE_INTERVAL) {
                streamingContent.set(accumulatedContent);
                lastUpdateTime = now;
              }
            }
          } catch (e) {
            // Skip invalid JSON (comments, etc.)
            continue;
          }
        }
      }
    }

    // Ensure final content is processed
    finalizeContent(accumulatedContent);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Apply final cleanup and set the resume content
 */
function finalizeContent(content: string): void {
  if (!content.trim()) {
    console.warn("Streamed content empty; resumeMd left unchanged");
    return;
  }

  // Apply same cleanup as original
  content = content.replace(/```\n.*?\n```/, "");
  content = content.replace(/```/g, "");

  if (!content.startsWith("#")) {
    const idx = content.indexOf("#");
    if (idx !== -1) content = content.slice(idx);
  }

  if (content.trim().length > 0) {
    resumeMd.set(content);
    streamingContent.set(""); // Clear streaming content
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