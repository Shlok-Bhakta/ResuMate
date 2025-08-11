import { get } from "svelte/store";
import {
  jobDescription,
  resumeMd,
  keywords,
  jobKeywords,
  resumeKeywords,
  overlappingKeywords,
  combinedScore
} from "./stores";

/**
 * Extract matched keywords from text.
 * - Strips HTML comments.
 * - Case-insensitive.
 * - Handles phrases and special char tokens (e.g. C++, .NET).
 */
export function getKeywords(text: string, keywordList: string[]): string[] {
  if (!text || keywordList.length === 0) return [];
  let cleanText = text.toLowerCase();

  // Remove HTML comments
  cleanText = cleanText.replace(/<!--[\s\S]*?-->/g, "");

  const found: string[] = [];

  for (let i = 0; i < keywordList.length; i++) {
    const original = keywordList[i];
    const kw = original.toLowerCase();

    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const isPhrase = kw.includes(" ");
    const hasSpecial = /[^\w\s]/.test(kw);
    const hasDot = kw.includes(".");
    let pattern: RegExp;

    if (isPhrase || hasSpecial || hasDot) {
      pattern = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$|\\.|,|;|:|\\))`, "i");
    } else {
      pattern = new RegExp(`\\b${escaped}\\b`, "i");
    }

    if (pattern.test(cleanText)) {
      found.push(original);
      // Replace occurrences to reduce duplicate accidental matches
      cleanText = cleanText.replace(new RegExp(pattern.source, "gi"), " __MATCHED__ ");
    }
  }

  return found;
}

/**
 * Compute overlap score and update related stores.
 * Mirrors original logic with defensive guards & minor stability improvements.
 */
export function score(): void {
  // Ensure keywords loaded (defer loading trigger responsibility to caller/UI)
  const allKeywords = get(keywords);
  const jobDesc = get(jobDescription);
  const resume = get(resumeMd);

  const jobKey = getKeywords(jobDesc, allKeywords);
  const resKey = getKeywords(resume, allKeywords);

  // Simple overlap percentage
  let totalScore = 0;
  const overlap: string[] = [];
  if (jobKey.length > 0) {
    const increment = 100 / jobKey.length;
    for (let i = 0; i < jobKey.length; i++) {
      const jk = jobKey[i];
      if (resKey.find(rk => rk.toLowerCase() === jk.toLowerCase())) {
        overlap.push(jk);
        totalScore += increment;
      }
    }
  }

  if (totalScore > 99.95) totalScore = 100;

  // Sort alphabetically then bring overlaps to front (stable-ish)
  jobKey.sort((a, b) => a.localeCompare(b));
  resKey.sort((a, b) => a.localeCompare(b));

  promoteMatches(jobKey, overlap);
  promoteMatches(resKey, overlap);

  // Persist
  overlappingKeywords.set(overlap);
  jobKeywords.set(jobKey);
  resumeKeywords.set(resKey);
  combinedScore.set(totalScore);
}

function promoteMatches(arr: string[], matches: string[]) {
  for (let i = 0; i < arr.length; i++) {
    const k = arr[i];
    if (matches.includes(k)) {
      arr.splice(i, 1);
      arr.unshift(k);
    }
  }
}