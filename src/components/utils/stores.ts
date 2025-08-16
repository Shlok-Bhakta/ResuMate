import { persist, createIndexedDBStorage } from "@macfja/svelte-persistent-store";
import { writable, type Writable } from "svelte/store";

/**
 * Helper to create a persisted writable store with typed initial value.
 */
function persisted<T>(key: string, initial: T): Writable<T> {
  return persist<T>(writable<T>(initial), createIndexedDBStorage(), key);
}

/* ========================================================================
 * Core Project Content Stores
 * ===================================================================== */
export const resumeMd = persisted<string>(
  "resumeMd",
  "# Go to settings and fetch my resume template from the settings! Also Update your info!"
);
export const resumeHtml = writable<string | Promise<string>>("<h1>Hi</h1>");
export const jobDescription = persisted<string>(
  "jobDescription",
  "Paste your job description here, or paste a link and try to fetch it"
);
export const jobUrl = persisted<string>("jobUrl", "https://example.com/");
export const modalState = persisted<string>("navstate", "None");
export const projectEditingStage = persisted<string>("pagestate", "Content");
export const jobName = persisted<string>("jobName", "Change Me");

/* ========================================================================
 * Keyword / Scoring Stores
 * ===================================================================== */
export const resumeKeywords = persisted<string[]>("resumeKeywords", []);
export const jobKeywords = persisted<string[]>("jobKeywords", []);
export const overlappingKeywords = persisted<string[]>("overlappingKeywords", []);
// Store as number (was [] initially in legacy code but always used numerically)
export const combinedScore = persisted<number>("combinedScore", 0);
export const created = persisted<any>("createdTime", []);
export const updated = persisted<any>("updatedTime", []);
export const keywords = persisted<string[]>("keywords", []);

/* Versioning / Save State */
export const saveCount = persisted<number>("saveCount", 0);
export const saveState = persisted<number>("saveState", 0);
export const projectId = persisted<number>("projectId", -1);
export const availableProjects = persisted<any[]>("availableProjects", []);

/* Header & Tuning */
export const header = persisted<string>("header", "");
export const tuning = writable(false);
export const streamingContent = writable<string>("");
export const isStreaming = writable(false);

/* ========================================================================
 * Settings Stores
 * ===================================================================== */
export const resumeTemplate = persisted<string>(
  "resumeTemplate",
  "# Go to settings and fetch my resume template from the settings! Also Update your info!"
);
export const name = persisted<string>("name", "John Doe");
export const email = persisted<string>("email", "example@gmail.com");
export const phone = persisted<string>("phone", "999-999-9999");
export const website = persisted<string>("website", "example.com");
export const linkedin = persisted<string>("linkedin", "linkedin.com/in/example");
export const github = persisted<string>("github", "github.com/example");
export const address = persisted<string>("address", "Moon Street 123");
export const cssTheme = persisted<string>("cssTheme", "/ResuMate/style.css");
export const openRouterKey = persisted<string>("openRouterKey", "your_api_key_here");
export const openRouterAIModel = persisted<string>("openRouterAIModel", "openai/gpt-4.1");
export const knowlegeBase = persisted<string>(
  "knowlegeBase",
  "Fetch some example knowlege to see what it looks like"
);

/* Feature Flags */
export const enableEmail = persisted<boolean>("enableEmail", true);
export const enablePhone = persisted<boolean>("enablePhone", true);
export const enableWebsite = persisted<boolean>("enableWebsite", true);
export const enableLinkedin = persisted<boolean>("enableLinkedin", false);
export const enableGithub = persisted<boolean>("enableGithub", true);
export const enableAddress = persisted<boolean>("enableAddress", true);
export const enableAddressLink = persisted<boolean>("enableAddressLink", true);
export const showUSCitizenship = persisted<boolean>("showUSCitizenship", false);

/* Customization */
export const customHeader = persisted<string>("customHeader", "");
export const enableCustomHeader = persisted<boolean>("enableCustomHeader", false);
export const customCSS = persisted<string>("customCSS", "");
export const enableCustomCSS = persisted<boolean>("enableCustomCSS", false);

export const hasSeenWelcome = persisted<boolean>("hasSeenWelcome", false);

/* ========================================================================
 * Re-export helper type(s)
 * ===================================================================== */
export type { Writable } from "svelte/store";