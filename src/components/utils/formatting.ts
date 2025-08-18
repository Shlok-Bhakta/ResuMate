/**
 * Convert custom inline separator syntax using '||' into markdown that will
 * later be converted to ATS-friendly flexbox HTML. This preserves markdown
 * formatting (bold, italic, etc.) while avoiding problematic table structures.
 * - Scans each line; skips lines starting with '<!--' (HTML comments)
 * - If a line contains '||', marks it with special delimiters for post-processing
 * - Leaves other lines untouched.
 * - Maintains identical visual appearance but uses flexbox instead of tables
 */
export function tableify(md: string): string {
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("<!--")) continue;
    if (line.includes("||")) {
      let parts = line.split("||").slice(0, 2);
      // Use special markers that will be replaced after markdown processing
      lines[i] = `{{FLEX_START}}${parts[0].trim()}{{FLEX_MID}}${parts[1].trim()}{{FLEX_END}}`;
    }
  }
  return lines.join("\n");
}

/**
 * Post-process rendered HTML to convert flex markers into flexbox HTML.
 * This runs after markdown-it processing, so all formatting is preserved.
 * Also handles paragraph wrapping that markdown-it might add.
 * Removes HTML comments to keep PDF output clean.
 */
export function processFlexboxMarkers(html: string): string {
  // First, handle flex markers that might be wrapped in paragraphs
  let processed = html.replace(
    /<p>{{FLEX_START}}(.*?){{FLEX_MID}}(.*?){{FLEX_END}}<\/p>/g,
    '<div class="flex-row"><span class="flex-left">$1</span><span class="flex-right">$2</span></div>'
  );
  
  // Also handle cases without paragraph wrapping
  processed = processed.replace(
    /{{FLEX_START}}(.*?){{FLEX_MID}}(.*?){{FLEX_END}}/g,
    '<div class="flex-row"><span class="flex-left">$1</span><span class="flex-right">$2</span></div>'
  );
  
  // Remove HTML comments from final output (keeps PDF clean)
  processed = processed.replace(/<!--.*?-->/gs, '');
  
  return processed;
}