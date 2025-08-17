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
 * Call OpenRouter to produce a tuned resume markdown with streaming support.
 * Features:
 * - Streaming response with throttled updates (250ms intervals)
 * - Visual feedback with streaming state management
 * - Prevents concurrent runs and handles cleanup
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
  }
}

/**
 * Process streaming response directly into resumeMd
 */
async function processStreamingResponse(response: Response): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available");

  const decoder = new TextDecoder();
  let buffer = "";
  let accumulatedContent = "";
  let lastUpdateTime = 0;
  const UPDATE_INTERVAL = 100; // ms - update more frequently for smoother streaming

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
              
              // Throttled updates directly to resumeMd
              const now = Date.now();
              if (now - lastUpdateTime >= UPDATE_INTERVAL) {
                const cleanedContent = cleanStreamingContent(accumulatedContent);
                resumeMd.set(cleanedContent);
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
 * Clean streaming content for display (lighter cleanup during streaming)
 */
function cleanStreamingContent(content: string): string {
  if (!content.trim()) return content;
  
  // Basic cleanup during streaming - just remove obvious artifacts
  let cleaned = content.replace(/```/g, "");
  
  // Try to start from first heading if content doesn't start with one
  if (!cleaned.startsWith("##")) {
    const idx = cleaned.indexOf("##");
    if (idx !== -1) cleaned = cleaned.slice(idx);
  }
  
  return cleaned;
}

/**
 * Apply final cleanup and set the resume content
 */
function finalizeContent(content: string): void {
  if (!content.trim()) {
    console.warn("Streamed content empty; resumeMd left unchanged");
    return;
  }

  // Apply more thorough cleanup for final content
  content = content.replace(/```\n.*?\n```/, "");
  content = content.replace(/```/g, "");

  if (!content.startsWith("#")) {
    const idx = content.indexOf("#");
    if (idx !== -1) content = content.slice(idx);
  }

  if (content.trim().length > 0) {
    resumeMd.set(content);
  }
}

/* ------------------------------------------------------------------------ */
/* Prompt Builders                                                          */
/* ------------------------------------------------------------------------ */

function buildSystemPrompt(): string {
  return `
<about-you>
You are a Resume Tuner who cannot tell a lie!

You must truthfully tune a resume to match the job description and requirements.
</about-you>

<resume-format>
The resume is markdown. '||' denotes a two-column left/right alignment transform later.
</resume-format>

<important-rules>
You are a tool: output ONLY the final markdown resume. The first character CANNOT be the first header (# ...) this is already done and can be ignored.
Get to the good stuff with the ## headers.
Do NOT add explanations or fences. Remove HTML comments (<!-- -->). Keep overall uncommented length stable.
</important-rules>

<guidelines>
- Delete irrelevant content; substitute with relevant knowledge-base content ONLY if present (no fabrications).
- Use XYZ bullet format:
  Buzzword X by doing Y resulting in Z (quantitative where possible, but truthful).
- Maintain existing section headers (##, ###, etc.) unless removing an irrelevant section.
- Skills ordering should mirror job description ordering of technologies. Do not make more bullets for skills. keep it simple just use the categories present and order skills into them.
- Adjust casing to exactly match job description tokens (e.g. C++ vs c++).
- Bold different technology terms such as CSS, React, Docker, etc. to highlight them. Everywhere except the Skills section!
- Italicize metrics such as "100k lines of code" or "50 commits per week" or "60FPS" anythin that is a number pretty much.
- Coursework: only refine to include technologies explicitly mentioned (e.g. "Database Systems" -> "Database Systems in MySQL & MongoDB" if applicable).
- Experience: Reword bullets to highlight relevant stack items when justified by existing knowledge base or resume comments.
- Projects: Reorder most relevant first; swap or modify to maximize truthful relevance.
- Events/Certifications: Keep only those relevant to the job focus area (e.g. security vs development).
- No lying. If evidence not present in knowledge base/resume, omit.
- Pay extra attention to the user prompt if given one!
- CSS is good so all you need to really do is use ## normal text and - to make it look good. DO NOT use any --- or em dashes in your output it will break stuff.
- DO NOT HAVE ANY EXTRA TEXT. only exactly what is supposed to be in the resume. remember you are a tool so explaining anything wont be seen by anyone.
- Maintain length. If you remove a bullet, then add one somewhere else, if you add more into a project because it is more relevant than see if you can remove one.
</guidelines>

<scoring-system>
Scoring system is simplistic keyword overlap; optimize overlap AND authentic recruiter impact.Scoring system is simplistic keyword overlap; optimize overlap AND authentic recruiter impact.
</scoring-system>

<style>
Keep the vibes professional.
ONE SHOT: Provide final best version.
NO extraneous text.
</style>`;
}

function buildUserContent(): string {
  return `
<job-description>
${get(jobDescription)}
</job-description>

<job-keywords>
${JSON.stringify(get(jobKeywords))}
</job-keywords>

<knowledge-base>
${get(knowlegeBase)}
</knowledge-base>

<resume>
${get(resumeMd)}
</resume>

<resume-keywords>
${JSON.stringify(get(resumeKeywords))}
</resume-keywords>

<score>
${get(combinedScore)}
</score>

`;
}