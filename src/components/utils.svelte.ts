import { persist, createIndexedDBStorage } from "@macfja/svelte-persistent-store"
import { writable } from "svelte/store"
import Dexie, { add } from "dexie";
import { get } from 'svelte/store';
// import {importDB, exportDB, importInto, peakImportFile} from "dexie-export-import";
import type { InputEnhancer, Plugin } from "carta-md";
import { r } from "docs/assets/render.CG3mZHYP";

export let resumeMd = persist<any>(writable<any>("# Go to settings and fetch my resume template from the settings! Also Update your info!"), createIndexedDBStorage(), "resumeMd");
export let resumeHtml = persist<any>(writable<any>("<h1>Hi</h1>"), createIndexedDBStorage(), "resumeHtml");
export let jobDescription = persist<any>(writable<any>("Paste your job description here, or paste a link and try to fetch it"), createIndexedDBStorage(), "jobDescription");
export let jobUrl = persist<any>(writable<any>("https://example.com/"), createIndexedDBStorage(), "jobUrl");
export let modalState = persist<any>(writable<any>("None"), createIndexedDBStorage(), "navstate");
export let projectEditingStage = persist<any>(writable<any>("Content"), createIndexedDBStorage(), "pagestate");
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
export let saveState = persist<number>(writable<any>(0), createIndexedDBStorage(), "saveState");
export let projectId = persist<number>(writable<any>(-1), createIndexedDBStorage(), "projectId");
export let availableProjects = persist<any>(writable<any>([]), createIndexedDBStorage(), "availableProjects");
// Create Header for the resume (with name and stuff)
export const header = persist<any>(writable<any>(""), createIndexedDBStorage(), "header");
export let tuning = writable(false);

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
// export let llmProvider = persist<any>(writable<any>("openrouter"), createIndexedDBStorage(), "llmProvider");
// export let openAIKey = persist<any>(writable<any>("your_api_key_here"), createIndexedDBStorage(), "openAIKey");
// export let googleAIKey = persist<any>(writable<any>("your_api_key_here"), createIndexedDBStorage(), "googleAIKey");
export let openRouterKey = persist<any>(writable<any>("your_api_key_here"), createIndexedDBStorage(), "openRouterKey");
// export let openAIModel = persist<any>(writable<any>("o3-mini-2025-01-31"), createIndexedDBStorage(), "openAIModel");
// export let googleAIModel = persist<any>(writable<any>("gemini-2.0-flash"), createIndexedDBStorage(), "googleAIModel");
export let openRouterAIModel = persist<any>(writable<any>("gemini-2.0-flash"), createIndexedDBStorage(), "openRouterAIModel");

export let knowlegeBase = persist<any>(writable<any>("Fetch some example knowlege to see what it looks like"), createIndexedDBStorage(), "knowlegeBase");

// enable flags incase they want to enable/disable certain things
export let enableEmail = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableEmail");
export let enablePhone = persist<any>(writable<any>(true), createIndexedDBStorage(), "enablePhone");
export let enableWebsite = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableWebsite");
export let enableLinkedin = persist<any>(writable<any>(false), createIndexedDBStorage(), "enableLinkedin");
export let enableGithub = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableGithub");
export let enableAddress = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableAddress");
export let enableAddressLink = persist<any>(writable<any>(true), createIndexedDBStorage(), "enableAddressLink");
export let showUSCitizenship = persist<any>(writable<any>(true), createIndexedDBStorage(), "showUSCitizenship");

// gonna be used if they want to add something more custom instead of the name and phone number stuff and default css
export let customHeader = persist<any>(writable<any>(""), createIndexedDBStorage(), "customHeader");
export let enableCustomHeader = persist<any>(writable<any>(false), createIndexedDBStorage(), "enableCustomHeader");
export let customCSS = persist<any>(writable<any>(""), createIndexedDBStorage(), "customCSS");
export let enableCustomCSS = persist<any>(writable<any>(false), createIndexedDBStorage(), "enableCustomCSS");


export function createHeader(){
    let headerString = "";
    // First Line is Name in Big Text
    headerString += "# " + get(name) + "\n";
    // check if any of the flags are enabled
    if(get(enableEmail) || get(enablePhone) || get(enableWebsite) || get(enableLinkedin) || get(enableGithub) || get(enableAddress) || get(showUSCitizenship)){
        headerString += "\n";
        headerString += "#### "
    }
    // Next is Phone Number
    if(get(enablePhone)){
        // format ![Phone](https://api.iconify.design/material-symbols:call-sharp.svg) [+1 (254)-251-9749](tel:12542519749)
        headerString += "![Phone](https://shlok-bhakta.github.io/ResuMate/icons/phone.svg) " + get(phone) +  " |";
    }
    // Next is Email 
    if(get(enableEmail)){
        // format ![Mail](https://api.iconify.design/material-symbols:mail.svg) [shlokbhakta1@gmail.com](mailto:shlokbhakta1@gmail.com)
        headerString += "![Mail](https://shlok-bhakta.github.io/ResuMate/icons/mail.svg) [" + get(email) + "](mailto:" + get(email) + ") |";
    }
    // Next is Address
    if(get(enableAddress)){
        // ![Globe](https://api.iconify.design/material-symbols:globe.svg) [Cisco TX](https://www.google.com/maps/place/Cisco,+TX+76437/@32.3962813,-99.0238931,28527m/data=!3m2!1e3!4b1!4m6!3m5!1s0x865138702bc7e13f:0xd45a9eba224cde84!8m2!3d32.3881861!4d-98.9792336!16zL20vMDEwMGhi?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D)
        headerString += "![Globe](https://shlok-bhakta.github.io/ResuMate/icons/globe.svg) " + get(address) + " |";
    }
    // Next is Website
    if(get(enableWebsite)){
        // ![Internet](https://api.iconify.design/pepicons-pop:internet.svg) [shlokbhakta.dev](https://shlokbhakta.dev/)
        headerString += "![Website](https://shlok-bhakta.github.io/ResuMate/icons/internet.svg) [" + get(website) + "](https://" + get(website) + ") |";
    }
    // Next is Github
    if(get(enableGithub)){
        // ![Github](https://api.iconify.design/mdi:github.svg) [gh.shlokbhakta.dev](https://github.com/Shlok-Bhakta)
        headerString += "![Github](https://shlok-bhakta.github.io/ResuMate/icons/github.svg) [" + get(github) + "](https://" + get(github) + ") |";
    }
    // Next is Linkedin
    if(get(enableLinkedin)){
        // ![Linkedin](https://api.iconify.design/mdi:linkedin.svg) [linkedin.com/in/shlokbhakta](https://linkedin.com/in/shlokbhakta)
        headerString += "![Linkedin](https://shlok-bhakta.github.io/ResuMate/icons/linkedin.svg) [" + get(linkedin) + "](https://" + get(linkedin) + ") |";
    }
    // Next is Address
    if(get(showUSCitizenship)){
        // ![Passport](https://api.iconify.design/mdi:passport.svg) [US CITIZEN](https://www.linkedin.com/in/shlokbhakta/)
        headerString += "![Passport](https://shlok-bhakta.github.io/ResuMate/icons/passport.svg) US CITIZEN|";
    }

    // Remove the last | from the headerString
    headerString = headerString.slice(0, -1);

    // add a couple newline at the end so the content doesnt merge into the resume
    headerString += "\n\n";


    // Update the store so that the whole site can use it
    header.update(() => {return headerString});
    console.log(headerString);
}


function getKeywords(text: string, keywords: string[]): string[] {
    // make everything lowercase for matching
    let cleanText = text.toLowerCase();

    // remove all html comments <!-- -->
    cleanText = cleanText.replace(/<!--[\s\S]*?-->/g, "");

    
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
export function score() {

    if(get(keywords).length <= 1000) {
        console.log("something might be wrong with the keywords refetching");
        if (get(keywords).length === 0) {
        fetch("/ResuMate/keywords.txt")
                .then((response) => response.text())
                .then((text) => {
                    // split skills by new line set all to lowercase and remove duplicates
                    let textcleaned = text
                        .split("\n")
                        .map((skill) => skill.toLowerCase())
                        .filter(
                            (skill, index, self) => self.indexOf(skill) === index,
                        );
                    // sort the skills by length for comparison later
                    textcleaned.sort((a, b) => b.length - a.length);
                    keywords.update(() => textcleaned);
                    // $keywords = text.split("\n").map((skill) => skill.toLowerCase());
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    console.log("score");
    const jobKey = getKeywords(get(jobDescription), get(keywords));
    const resumeKey = getKeywords(get(resumeMd), get(keywords));
    console.log(get(jobDescription));
    console.log(jobKey);
    console.log(resumeKey);
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

function moveSelectionUp(input: InputEnhancer) {
    const selection = input.getSelection();
    
    // Get the start and end lines
    const startLineInfo = input.getLine(selection.start);
    const endLineInfo = input.getLine(selection.end);
    
    // Check if already at the top of the document
    if (startLineInfo.start === 0) {
        return; // Can't move up if already at the top
    }
    
    // Get the line above the selection
    const lineAboveInfo = input.getLine(startLineInfo.start - 1);
    const lineAboveLength = lineAboveInfo.value.length;
    
    // Get the content to move
    const contentToMove = input.textarea.value.substring(startLineInfo.start, endLineInfo.end);
    
    // Calculate the new position for selection
    const newSelectionStart = selection.start - lineAboveLength - 1; // -1 for newline
    const newSelectionEnd = selection.end - lineAboveLength - 1;
    
    // Calculate content length being moved
    const contentLength = endLineInfo.end - startLineInfo.start;
    
    // Remove the selected lines
    input.removeAt(startLineInfo.start, contentLength);
    
    // Insert the content above the line above
    input.insertAt(lineAboveInfo.start, contentToMove + '\n');
    
    // Restore selection at new position
    // setTimeout(() => {
    //     input.textarea.setSelectionRange(
    //         Math.max(0, newSelectionStart),
    //         Math.max(0, newSelectionEnd)
    //     );
    // }, 0);
    input.textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
}

function moveSelectionDown(input: InputEnhancer) {
    const selection = input.getSelection();
    console.log(selection);
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
        },
        // {
        //     id: 'shiftup',
        //     combination: new Set(['alt', 'k']),
        //     action: (input) => moveSelectionUp(input)
        // },
        // {
        //     id: 'shiftdown',
        //     combination: new Set(['alt', 'j']),
        //     action: (input) => moveSelectionDown(input)
        // },
    ]
};


// Plugin to turn || into left and right alligned content
export function tableify(md: string) {
    let text = md.split("\n");
    for (let i = 0; i < text.length; i++) {
        // if text starts with comment <!-- then skip
        if (text[i].startsWith("<!--")) {
            continue;
        }
        // if text has a || then split
        if (text[i].includes("||")) {
            let splitText = text[i].split("||");
            // only take the first 2 elements discard the rest
            splitText = splitText.slice(0, 2);
            // return the corrected text
            text[i] = "| " + splitText.join(" | ") + " |" + "\n|:-|-:|\n";
        }
    }
    return text.join("\n");
}



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
        saveState.update(() => {return -1}); // error - no name
        return -1; // ERR - no name
    }
    // Then in your saveCurrentProject function:
    if(get(saveCount) === 0) {
        // temprarily stress test add 100 at a time
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
        getProjectNames();
        // jobName.update(() => {return get(jobName)});
        saveState.update(() => {return 1}); // created!
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
        saveState.update(() => {return 2}); // updated!
    }
    // Update the saveCount
    if (get(saveCount) === 0) {
        saveCount.update(() => {return get(saveCount) + 1});
    }
    // console.log(db.project.toArray());
    return 0; // success
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
        saveCount.update(() => project.saves);
        projectId.update(() => id);
        score();
    } else {
        console.log("project not found");
    }
}

export async function getProjectNames() {
    // get all the project names
    let projectIds = await db.project.toArray();
    // reverse the order so the newest projects are at the top
    projectIds.reverse();
    availableProjects.update(() => {return projectIds.map((project) => [project.name, project.id])});
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

type DBContent = {
    [dbName: string]: {
      [storeName: string]: any[]
    }
  };    

export async function downloadDBasJSON(): Promise<void> {
    const dbNames = ['ResuMateMain', 'svelte-persist'];
    const exportContent: DBContent = {};
    
    for (const dbName of dbNames) {
        const db = await openDB(dbName);
        exportContent[dbName] = {};

        for (const storeName of db.objectStoreNames) {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            
            // Use cursor to get both keys and values
            const data: {key: any, value: any}[] = [];
            await new Promise<void>((resolve, reject) => {
                const cursorRequest = store.openCursor();
                cursorRequest.onerror = () => reject(cursorRequest.error);
                cursorRequest.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor) {
                        data.push({ key: cursor.key, value: cursor.value });
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };
            });
            
            exportContent[dbName][storeName] = data;
        }

        db.close();
    }

    const jsonString = JSON.stringify(exportContent, null, 2);
    downloadJSON(jsonString, 'indexeddb_export.json');
}

export async function importIndexedDBs(jsonData: string): Promise<void> {
    try {
        console.log('Importing IndexedDBs...');
        const jsonContent = JSON.parse(jsonData);
        
        // Check if required databases exist
        if (!(jsonContent['ResuMateMain'] && jsonContent['svelte-persist'])) {
            console.error('Required databases not found in import data');
            return;
        }

        // Process each database in the export
        for (const dbName of Object.keys(jsonContent)) {
            const db = await openDB(dbName);
            
            // Process each store in the database
            for (const storeName of Object.keys(jsonContent[dbName])) {
                // Check if this store exists in the current database
                if (!Array.from(db.objectStoreNames).includes(storeName)) {
                    console.warn(`Object store ${storeName} not found in database ${dbName}, skipping`);
                    continue;
                }
                
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Clear existing data
                await clearObjectStore(store);
                
                // Add all items from the export
                const items = jsonContent[dbName][storeName];
                for (const item of items) {
                    // If the store uses out-of-line keys, use the key explicitly
                    if (store.keyPath === null) {
                        await new Promise<void>((resolve, reject) => {
                            const request = store.put(item.value, item.key);
                            request.onerror = () => reject(request.error);
                            request.onsuccess = () => resolve();
                        });
                    } else {
                        // Otherwise, let the store handle the key
                        await addItem(store, item.value);
                    }
                }
                
                await new Promise<void>((resolve) => {
                    transaction.oncomplete = () => resolve();
                });
            }
            
            db.close();
        }
        
        console.log('Import completed successfully');
        
        // Refresh the application state to reflect the imported data
        await getProjectNames();
        
    } catch (error) {
        console.error('Error importing data:', error);
        throw error;
    }
}
export async function resetApplication(): Promise<void> {
    try {
        console.log('Resetting application data...');
        
        // Clear all databases
        const dbNames = ['ResuMateMain', 'svelte-persist'];
        
        for (const dbName of dbNames) {
            const db = await openDB(dbName);
            
            // Clear all object stores in this database
            for (const storeName of db.objectStoreNames) {
                const transaction = db.transaction(storeName, 'readwrite');
                await clearObjectStore(transaction.objectStore(storeName));
                await new Promise<void>((resolve) => {
                    transaction.oncomplete = () => resolve();
                });
            }
            
            db.close();
        }
        
        // Reset all stores to default values
        resumeMd.set("# Go to settings and fetch my resume template from the settings! Also Update your info!");
        resumeHtml.set("<h1>Hi</h1>");
        jobDescription.set("Paste your job description here, or paste a link and try to fetch it");
        jobUrl.set("https://example.com/");
        modalState.set("None");
        projectEditingStage.set("Content");
        jobName.set("Change Me");
        resumeKeywords.set([]);
        jobKeywords.set([]);
        overlappingKeywords.set([]);
        combinedScore.set(0);
        created.set([]);
        updated.set([]);
        keywords.set([]);
        saveCount.set(0);
        projectId.set(-1);
        availableProjects.set([]);
        header.set("");
        
        // Reset settings
        resumeTemplate.set("# Go to settings and fetch my resume template from the settings! Also Update your info!");
        name.set("John Doe");
        email.set("example@gmail.com");
        phone.set("999-999-9999");
        website.set("example.com");
        linkedin.set("linkedin.com/in/example");
        github.set("github.com/example");
        address.set("Moon Street 123");
        cssTheme.set("/ResuMate/style.css");
        // llmProvider.set("openrouter");
        // openAIKey.set("your_api_key_here");
        // googleAIKey.set("your_api_key_here");
        openRouterKey.set("your_api_key_here");
        knowlegeBase.set("Fetch some example knowlege to see what it looks like");
        
        // Reset enable flags
        enableEmail.set(true);
        enablePhone.set(true);
        enableWebsite.set(true);
        enableLinkedin.set(false);
        enableGithub.set(true);
        enableAddress.set(true);
        enableAddressLink.set(true);
        showUSCitizenship.set(true);
        customHeader.set("");
        enableCustomHeader.set(false);
        customCSS.set("");
        enableCustomCSS.set(false);
        
        console.log('Application reset complete');
        
        // Force recreation of the header
        createHeader();
        
        return Promise.resolve();
    } catch (error) {
        console.error('Error resetting application:', error);
        return Promise.reject(error);
    }
}
  
  // Helper functions
  
  function openDB(name: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  function getAllData(store: IDBObjectStore): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  function clearObjectStore(store: IDBObjectStore): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  function addItem(store: IDBObjectStore, item: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  function downloadJSON(jsonString: string, filename: string): void {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  export async function tuneResume() {
    tuning.set(true);

    let prompt = `
    You are a Resume Tuner who cannot tell a lie!

    You need to truthfully tune a resume to match the job description and the job requirements.

    The resume is in markdown with the only difference being that || allows for having text on the right and left of the html

    You are also a tool so you can only output the markdown for the resume.
    do not output anything else. as this will break the tool. The first character should be the first header and the last character should be your tuned version
    make sure not to forget the headers. the ## is super important so dont skip it!
    
    get rid of the comments (<!-- -->) and really only include the parts you specificly want to maximize that score!

    for example:

    if the job is for C#
    - then you can delete a cpu development project and instead uncomment a game development project and tune a bullet to contain C#
    - You can remove a bullet thats about writing documentation and instead uncomment a bullet about C# so that the length remains the same but there are more keyword matches

    here is your knowlege base, draw from this to boost the score higher when needed:
    ${get(knowlegeBase)}

    try changing words in the resume to match closer like for example
    if the job description has "C++" and the resume has "c++" then change the resume to "C++" to match the job description
    `;


    let content = `
    remember to get rid of the comments (<!-- -->) and really only include the parts you specificly want to maximize that score!


    Here is the job description:
    ${get(jobDescription)}

    here is the job requirements:
    ${get(jobKeywords)}

    here is the resume:
    ${get(resumeMd)}

    here is the resume keywords:
    ${get(resumeKeywords)}

    Here is the combined score:
    ${get(combinedScore)}
    `;
    await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${get(openRouterKey)}`,
        },
        body: JSON.stringify({
            model: get(openRouterAIModel),
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
                {
                    role: "user",
                    content: content,
                },
            ],
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            // cleanup
            // remove anything before first #
            // data.choices[0].message.content = data.choices[0].message.content.replace(/.*?\n/, "");
            // remove the last ``` and everything after it
            data.choices[0].message.content = data.choices[0].message.content.replace(/```\n.*?\n```/, "");
            // remove the ``` if it exists
            data.choices[0].message.content = data.choices[0].message.content.replace(/```/, "");
            console.log(data);
            console.log(data.choices[0].message.content);
            resumeMd.set(data.choices[0].message.content);
        })
        .catch((err) => {
            console.log(err);
        });
    tuning.set(false);
  }