/**
 * Convert custom inline separator syntax using '||' into a simple
 * two-column markdown table snippet. Mirrors original behavior:
 * - Scans each line; skips lines starting with '<!--' (HTML comments)
 * - If a line contains '||', splits on first two occurrences producing:
 *     | left | right | 
 *     |:-|-:|
 * - Appends the alignment row immediately after the transformed line.
 * - Leaves other lines untouched.
 *
 * Note: Original implementation inserted a newline plus the alignment row
 * directly into the line array position. We replicate that by embedding
 * the alignment row with a trailing newline.
 */
export function tableify(md: string): string {
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("<!--")) continue;
    if (line.includes("||")) {
      let parts = line.split("||").slice(0, 2);
      lines[i] = "| " + parts.join(" | ") + " |" + "\n|:-|-:|\n";
    }
  }
  return lines.join("\n");
}