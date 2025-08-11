import type { InputEnhancer, Plugin } from "carta-md";

/**
 * Toggle HTML comment markers for the current selection or current line.
 * Behaves like original implementation but with clearer structure.
 */
export function commentLines(input: InputEnhancer) {
  const selection = input.getSelection();

  if (selection.end > selection.start) {
    // Multi-line or partial selection covering >=1 char
    const startLineInfo = input.getLine(selection.start);
    const endLineInfo = input.getLine(selection.end);

    const fullText = input.textarea.value.substring(
      startLineInfo.start,
      endLineInfo.end
    );
    const lines = fullText.split("\n");

    // Determine if all non-empty lines are already commented
    const allCommented = lines.every((line) => {
      const trimmed = line.trim();
      return (
        trimmed === "" ||
        (trimmed.startsWith("<!--") && trimmed.endsWith("-->"))
      );
    });

    const newLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed === "") return line;
      const isCommented =
        trimmed.startsWith("<!--") && trimmed.endsWith("-->");
      if (allCommented && isCommented) {
        // Uncomment
        return line
          .replace(/^\s*<!--\s*/, "")
          .replace(/\s*-->\s*$/, "");
      } else if (!allCommented && !isCommented) {
        // Comment
        return `<!-- ${line} -->`;
      }
      return line;
    });

    input.removeAt(
      startLineInfo.start,
      endLineInfo.end - startLineInfo.start
    );
    input.insertAt(startLineInfo.start, newLines.join("\n"));
  } else {
    // Single line toggle
    const line = input.getLine();
    const trimmed = line.value.trim();
    if (trimmed.startsWith("<!--") && trimmed.endsWith("-->")) {
      const uncommented = line.value
        .replace(/^\s*<!--\s*/, "")
        .replace(/\s*-->\s*$/, "");
      input.removeAt(line.start, line.value.length);
      input.insertAt(line.start, uncommented);
    } else if (trimmed !== "") {
      input.removeAt(line.start, line.value.length);
      input.insertAt(line.start, `<!-- ${line.value} -->`);
    }
  }

  // Restore original selection range
  input.textarea.setSelectionRange(selection.start, selection.end);
}

/**
 * Move the selected block of lines up by one line.
 * (Currently disabled in shortcuts but exported for potential future use.)
 */
export function moveSelectionUp(input: InputEnhancer) {
  const selection = input.getSelection();
  const startLineInfo = input.getLine(selection.start);
  const endLineInfo = input.getLine(selection.end);

  if (startLineInfo.start === 0) return; // Already at top

  const lineAboveInfo = input.getLine(startLineInfo.start - 1);
  const lineAboveLength = lineAboveInfo.value.length;
  const content = input.textarea.value.substring(
    startLineInfo.start,
    endLineInfo.end
  );
  const contentLength = endLineInfo.end - startLineInfo.start;

  input.removeAt(startLineInfo.start, contentLength);
  input.insertAt(lineAboveInfo.start, content + "\n");

  // Recalculate selection indexes
  const newSelectionStart = selection.start - lineAboveLength - 1;
  const newSelectionEnd = selection.end - lineAboveLength - 1;
  input.textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
}

/**
 * Placeholder for downward movement (not yet implemented in original code).
 */
export function moveSelectionDown(_input: InputEnhancer) {
  // Intentionally left as a stub (original implementation incomplete).
  // Future: mirror logic of moveSelectionUp with line below.
  return;
}

/**
 * Carta plugin exposing keyboard shortcuts.
 */
export const editorShortcuts: Plugin = {
  shortcuts: [
    {
      id: "commentselection",
      combination: new Set(["control", "/"]),
      action: (input) => commentLines(input),
    },
    {
      id: "underline",
      combination: new Set(["control", "u"]),
      action: (input) => input.toggleSelectionSurrounding("__"),
    },
    // Potential future:
    // {
    //   id: "shiftup",
    //   combination: new Set(["alt", "k"]),
    //   action: (input) => moveSelectionUp(input)
    // },
    // {
    //   id: "shiftdown",
    //   combination: new Set(["alt", "j"]),
    //   action: (input) => moveSelectionDown(input)
    // },
  ],
};