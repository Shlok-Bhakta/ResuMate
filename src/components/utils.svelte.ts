import { persist, createIndexedDBStorage } from "@macfja/svelte-persistent-store"
import { writable } from "svelte/store"
import Dexie from "dexie";
import { get } from 'svelte/store';
import type { InputEnhancer, Plugin } from "carta-md";

export let resumeMd = persist<any>(writable<any>("# Go to settings and fetch my resume template from the settings! Also Update your info!"), createIndexedDBStorage(), "resumeMd");
export let resumeHtml = persist<any>(writable<any>("<h1>Hi</h1>"), createIndexedDBStorage(), "resumeHtml");
export let jobDescription = persist<any>(writable<any>("Paste your job description here, or paste a link and try to fetch it"), createIndexedDBStorage(), "jobDescription");
export let jobUrl = persist<any>(writable<any>("https://example.com/"), createIndexedDBStorage(), "jobUrl");
export let navstate = persist<any>(writable<any>("None"), createIndexedDBStorage(), "navstate");

export let jobName = persist<any>(writable<any>("Change Me"), createIndexedDBStorage(), "jobName");


export let resumeKeywords = persist<any>(writable<any>([]), createIndexedDBStorage(), "resumeKeywords");
export let jobKeywords = persist<any>(writable<any>([]), createIndexedDBStorage(), "jobKeywords");
export let overlappingKeywords = persist<any>(writable<any>([]), createIndexedDBStorage(), "overlappingKeywords");
export let combinedScore = persist<any>(writable<any>([]), createIndexedDBStorage(), "combinedScore");
export let created = persist<any>(writable<any>([]), createIndexedDBStorage(), "createdTime");
export let updated = persist<any>(writable<any>([]), createIndexedDBStorage(), "updatedTime");
export let keywords = persist<string[]>(writable<any>([]), createIndexedDBStorage(), "keywords");
// for a later version where you can revert files
export let saveCount = persist<number>(writable<any>(0), createIndexedDBStorage(), "saveCount");
export let projectId = persist<number>(writable<any>(-1), createIndexedDBStorage(), "projectId");
export let availableProjects = persist<any>(writable<any>([]), createIndexedDBStorage(), "availableProjects");


// Settings
export let resumeTemplate = persist<any>(writable<any>("# Go to settings and fetch my resume template from the settings! Also Update your info!"), createIndexedDBStorage(), "resumeTemplate");
export let name = persist<any>(writable<any>("John Doe"), createIndexedDBStorage(), "name");
export let email = persist<any>(writable<any>("example@gmail.com"), createIndexedDBStorage(), "email");
export let phone = persist<any>(writable<any>("999-999-9999"), createIndexedDBStorage(), "phone");
export let website = persist<any>(writable<any>("example.com"), createIndexedDBStorage(), "website");
export let linkedin = persist<any>(writable<any>("linkedin.com/in/example"), createIndexedDBStorage(), "linkedin");
export let github = persist<any>(writable<any>("github.com/example"), createIndexedDBStorage(), "github");
export let address = persist<any>(writable<any>("Moon Street 123"), createIndexedDBStorage(), "address");
export let cssTheme = persist<any>(writable<any>("/ResuMate/style.css"), createIndexedDBStorage(), "cssTheme");

// enable flags incase they want to enable/disable certain things
export let enableName = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableName");
export let enableEmail = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableEmail");
export let enablePhone = persist<any>(writable<any>(true), createIndexedDBStorage(), "enablePhone");
export let enableWebsite = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableWebsite");
export let enableLinkedin = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableLinkedin");
export let enableGithub = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableGithub");
export let enableAddress = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableAddress");
export let showUSCitizenship = persist<any>(writable<any>(true), createIndexedDBStorage(), "showUSCitizenship");

// gonna be used if they want to add something more custom instead of the name and phone number stuff and default css
export let customHeader = persist<any>(writable<any>(""), createIndexedDBStorage(), "customHeader");
export let enableCustomHeader = persist<any>(writable<any>(false), createIndexedDBStorage(), "enableCustomHeader");
export let customCSS = persist<any>(writable<any>(""), createIndexedDBStorage(), "customCSS");
export let enableCustomCSS = persist<any>(writable<any>(false), createIndexedDBStorage(), "enableCustomCSS");



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
export function score(resume: string, jobdesc: string, keywords: string[]) {
    const jobKey = getKeywords(jobdesc, keywords);
    const resumeKey = getKeywords(resume, keywords);
    // calculate similarity score
    let totalScore = 0;
    let scoreIncrement = 100/jobKey.length;
    let overKeywords = [];
    for (let i = 0; i < jobKey.length; i++) {
        let jobKeyword = jobKey[i];
        let resumeKeyword = resumeKey.find(keyword => keyword.toLowerCase() === jobKeyword.toLowerCase());
        if (resumeKeyword) {
            overKeywords.push(jobKeyword);
            totalScore += scoreIncrement;
        }
    }

    // if its close to 100, return 100
    if (totalScore > 99.95) {
        totalScore = 100;
    }


    // sort both jobkey and resumekey by length
    jobKey.sort((a, b) => a.localeCompare(b));
    resumeKey.sort((a, b) => a.localeCompare(b));

    // for jobKey move the ones that match to the front
    for (let i = 0; i < jobKey.length; i++) {
        let key = jobKey[i];
        if(overKeywords.includes(key)) {
            // remove word from jobKey
            jobKey.splice(i, 1);
            // Add word to the front of jobKey
            jobKey.unshift(key);
        }
    }

    // for resumeKey move the ones that match to the front
    for (let i = 0; i < resumeKey.length; i++) {
        let key = resumeKey[i];
        if(overKeywords.includes(key)) {
            // remove word from resumeKey
            resumeKey.splice(i, 1);
            // Add word to the front of resumeKey
            resumeKey.unshift(key);
        }
    }

    // update the stores
    overlappingKeywords.update(() => overKeywords);
    jobKeywords.update(() => jobKey);
    resumeKeywords.update(() => resumeKey);
    combinedScore.update(() => totalScore);
}


function commentLines(input: InputEnhancer){
    const selection = input.getSelection();    
    if (selection.end > selection.start) {
        // Get the text in the selection
        const selectedText = input.textarea.value.substring(selection.start, selection.end);
        
        // Get start and end line positions
        const startLineInfo = input.getLine(selection.start);
        const endLineInfo = input.getLine(selection.end);
        
        // Get the full text of all affected lines
        const fullText = input.textarea.value.substring(startLineInfo.start, endLineInfo.end);
        const lines = fullText.split('\n');
        
        // Check if all lines are already commented
        const allCommented = lines.every(line => {
            const trimmed = line.trim();
            return trimmed === '' || (trimmed.startsWith('<!--') && trimmed.endsWith('-->'));
        });
        
        // Process each line
        const newLines = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed === '') return line; // Keep empty lines as is
            
            if (allCommented && trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
                // Uncomment
                return line.replace(/^\s*<!--\s*/, '').replace(/\s*-->\s*$/, '');
            } else if (!allCommented && !(trimmed.startsWith('<!--') && trimmed.endsWith('-->'))) {
                // Comment
                return `<!-- ${line} -->`;
            }
            return line;
        });
        
        // Replace all affected lines
        input.removeAt(startLineInfo.start, endLineInfo.end - startLineInfo.start);
        input.insertAt(startLineInfo.start, newLines.join('\n'));
    } else {
        // No selection, comment/uncomment the current line
        const line = input.getLine();
        const trimmedLine = line.value.trim();
        
        if (trimmedLine.startsWith('<!--') && trimmedLine.endsWith('-->')) {
            // Line is already commented - uncomment it
            const uncommented = line.value.replace(/^\s*<!--\s*/, '').replace(/\s*-->\s*$/, '');
            input.removeAt(line.start, line.value.length);
            input.insertAt(line.start, uncommented);
        } else if (trimmedLine !== '') {
            // Line is not commented and not empty - add comment
            input.removeAt(line.start, line.value.length);
            input.insertAt(line.start, `<!-- ${line.value} -->`);
            
        }
        
        
    }
    input.textarea.setSelectionRange(selection.start, selection.end);
}

// Export the keyboard shortcuts
export const editorShortcuts: Plugin = {
    shortcuts: [
        {
            id: 'commentselection',
            combination: new Set(['control', '/']),
            action: (input) => commentLines(input)
        },
        {
            id: 'underline',
            combination: new Set(['control', 'u']),
            action: (input) => input.toggleSelectionSurrounding('__')
        }
    ]
};

interface Project {
    id?: number;
    name: any;
    md: any;
    mdKeywords: any;
    jobUrl: any;
    jobDesc: any;
    jobKeywords: any;
    score: any;
    saves: number;
    created?: Date;
    modified?: Date;
}

class ResuMateDatabase extends Dexie {
    project!: Dexie.Table<Project, number>;

    constructor() {
        super('ResuMateMain');
        this.version(1).stores({
            project: '++id, name, md, mdKeywords, jobUrl, jobDesc, jobKeywords, score, saves,created, modified'
        });
    }
}

export const db = new ResuMateDatabase();

export async function saveCurrentProject() {
    console.log("saving: " + get(projectId));
    // check if name is empty then dont save
    if(get(jobName) === "" || get(jobName) === "Change Me") {
        alert("Please a project name (EX: Apple Music Developer)");
        return;
    }
    // Then in your saveCurrentProject function:
    if(get(saveCount) === 0) {
        let newID = await db.project.add({
            name: get(jobName),
            md: get(resumeMd),
            mdKeywords: get(resumeKeywords),
            jobUrl: get(jobUrl),
            jobDesc: get(jobDescription),
            jobKeywords: get(jobKeywords),
            score: get(combinedScore),
            saves: get(saveCount),
            created: new Date(),
            modified: new Date()
        });
        console.log("new id: " + newID);
        projectId.update(() => {return newID});
        // update so that the sidebar can update
        availableProjects.update(() => {return get(availableProjects).unshift(get(jobName))});
        // jobName.update(() => {return get(jobName)});
    }else{
        // update instead
        console.log("updating");
        
        await db.project.update(get(projectId), {
            name: get(jobName),
            md: get(resumeMd),
            mdKeywords: get(resumeKeywords),
            jobUrl: get(jobUrl),
            jobDesc: get(jobDescription),
            jobKeywords: get(jobKeywords),
            score: get(combinedScore),
            saves: get(saveCount),
            created: new Date(),
            modified: new Date()
        });
        await getProjectNames();
    }
    // Update the saveCount
    if (get(saveCount) === 0) {
        saveCount.update(() => {return get(saveCount) + 1});
    }
    console.log(db.project.toArray());
}


export async function loadProject(id: number) {
    console.log("loading project: " + id);
    let project = await db.project.get(id);
    console.log(project);
    if (project) {
        console.log("project found");
        // update the stores
        jobName.update(() => project.name);
        resumeMd.update(() => project.md);
        resumeKeywords.update(() => project.mdKeywords);
        jobUrl.update(() => project.jobUrl);
        jobDescription.update(() => project.jobDesc);
        jobKeywords.update(() => project.jobKeywords);
        combinedScore.update(() => project.score);
        created.update(() => project.created);
        updated.update(() => project.modified);
    } else {
        console.log("project not found");
    }
}

export async function getProjectNames() {
    // get all the project names
    let projectIds = await db.project.toArray();
    availableProjects.update(() => {return projectIds.map((project) => project.name)});
}


export function clearProject() {
    // clear the project so they can start a new one, pretty much used for the new project button
    jobName.update(() => {return "Change Me"});
    resumeMd.update(() => {return get(resumeTemplate)});
    resumeKeywords.update(() => {return []});
    jobUrl.update(() => {return "https://example.com/"});
    jobDescription.update(() => {return "Paste your job description here, or paste a link and try to fetch it"});
    jobKeywords.update(() => {return []});
    combinedScore.update(() => {return 0});
    created.update(() => {return new Date()});
    updated.update(() => {return new Date()});
    saveCount.update(() => {return 0});
    projectId.update(() => {return -1});
    // availableProjects.update(() => {return []}); // This one should not be cleared so the people can still see what projects exist
    console.log("cleared");
}