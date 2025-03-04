import { persist, createIndexedDBStorage } from "@macfja/svelte-persistent-store"
import { writable } from "svelte/store"


export let resumeMd = persist<any>(writable<any>("# Hi dude"), createIndexedDBStorage(), "resumeMd");

export let resumeHtml = persist<any>(writable<any>("<h1>Hi</h1>"), createIndexedDBStorage(), "resumeHtml");

export let jobDescription = persist<any>(writable<any>("Jobtime"), createIndexedDBStorage(), "jobDescription");

export let jobUrl = persist<any>(writable<any>("https://www.linkedin.com/jobs/view/3304370400/"), createIndexedDBStorage(), "jobUrl");

export let navstate = persist<any>(writable<any>({
    mode: "Edit",
    tab: "Resume"
}), createIndexedDBStorage(), "navstate");

export let keywords = persist<string[]>(writable<any>([]), createIndexedDBStorage(), "keywords");


function getKeywords(text: string, keywords: string[]): string[] {
// Clean job description
    let cleanText = text.toLowerCase();
    
    // Find all keywords in the job description
    let textKeywords = <string[]>[];
    
    // Sort keywords by length (descending) to check longer keywords first
    // const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    for (let i = 0; i < keywords.length; i++) {
        const keywordLower = keywords[i].toLowerCase();
        
        // Escape special regex characters to prevent errors
        const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Check if keyword has special characters that would cause issues with word boundaries
        const hasSpecialChars = /[^\w\s]/.test(keywordLower);
        const isPhrase = keywordLower.includes(' ');
        const hasDot = keywordLower.includes('.');
        
        let pattern;
        
        if (isPhrase || hasSpecialChars || hasDot) {
            // For phrases or terms with special chars (like C++), don't use word boundaries
            pattern = new RegExp(`(?:^|\\s)${escapedKeyword}(?:\\s|$|\\.|,|;|:|\\))`, 'i');
        } else {
            // For simple single words, use word boundaries
            pattern = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
        }
        
        // Check if the keyword is in the job description
        if (pattern.test(cleanText)) {
            textKeywords.push(keywords[i]);
            
            // Replace all occurrences of this keyword with a placeholder
            cleanText = cleanText.replace(new RegExp(pattern.source, 'gi'), ' __MATCHED__ ');
        }
    }
    return textKeywords;
}
export function score(_resume: string, jobdesc: string, keywords: string[]) {
    console.log(getKeywords(jobdesc, keywords));
    return 0;
    // return calculate_ats_score(resume, jobdesc, skill_dict);
}

// function calculate_ats_score(resume, job_desc, skill_dict) {