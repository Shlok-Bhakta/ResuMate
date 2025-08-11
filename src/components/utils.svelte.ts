/**
 * Barrel module for all utility exports.
 * Refactored from the monolithic previous implementation into focused modules under ./utils/
 * Update imports across the app to continue using the alias `$utils` with no behavioral changes.
 *
 * Modules:
 * - stores.ts: All persisted & volatile Svelte stores
 * - header.ts: createHeader()
 * - scoring.ts: keyword extraction & score()
 * - editorShortcuts.ts: Carta editor shortcut plugin helpers
 * - formatting.ts: tableify() markdown transformer
 * - db.ts: Dexie setup & project persistence + export/import/reset
 * - tune.ts: tuneResume() OpenRouter integration
 */

// Re-export stores (includes resumeMd, resumeHtml, jobDescription, etc.)
export * from "./utils/stores";

// Header builder
export { createHeader } from "./utils/header";

// Scoring utilities
export { getKeywords, score } from "./utils/scoring";

// Editor shortcuts plugin & helpers
export {
  editorShortcuts,
  commentLines,
  moveSelectionUp,
  moveSelectionDown
} from "./utils/editorShortcuts";

// Formatting helpers
export { tableify } from "./utils/formatting";

// Database & persistence API
export {
  db,
  saveCurrentProject,
  loadProject,
  getProjectNames,
  clearProject,
  downloadDBasJSON,
  importIndexedDBs,
  resetApplication
} from "./utils/db";

// Resume tuning (LLM)
export { tuneResume } from "./utils/tune";