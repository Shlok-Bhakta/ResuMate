import Dexie from "dexie";
import { get } from "svelte/store";
import {
  // Core content
  resumeMd,
  resumeHtml,
  resumeKeywords,
  jobUrl,
  jobDescription,
  jobKeywords,
  combinedScore,
  overlappingKeywords,
  jobName,
  saveCount,
  saveState,
  projectId,
  availableProjects,
  created,
  updated,
  resumeTemplate,
  // Settings / header related
  header,
  name,
  email,
  phone,
  website,
  linkedin,
  github,
  address,
  cssTheme,
  openRouterKey,
  openRouterAIModel,
  knowlegeBase,
  enableEmail,
  enablePhone,
  enableWebsite,
  enableLinkedin,
  enableGithub,
  enableAddress,
  enableAddressLink,
  showUSCitizenship,
  customHeader,
  enableCustomHeader,
  customCSS,
  enableCustomCSS,
  // UI state
  modalState,
  projectEditingStage,
  // Keywords global
  keywords
} from "./stores";
import { score } from "./scoring";
import { createHeader } from "./header";

/* ========================================================================
 * Project Entity & Dexie Schema
 * ===================================================================== */
export interface Project {
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
    super("ResuMateMain");
    this.version(1).stores({
      project:
        "++id, name, md, mdKeywords, jobUrl, jobDesc, jobKeywords, score, saves, created, modified"
    });
  }
}

export const db = new ResuMateDatabase();

/* ========================================================================
 * CRUD / Persistence API
 * ===================================================================== */

/**
 * Save current in-memory project state into Dexie.
 * - Creates on first save (saveCount === 0), then updates.
 * - Updates saveState to signal UI: -1 error, 1 created, 2 updated.
 */
export async function saveCurrentProject(): Promise<number> {
  if (get(jobName) === "" || get(jobName) === "Change Me") {
    saveState.set(-1);
    return -1;
  }

  if (get(saveCount) === 0) {
    const newID = await db.project.add({
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
    projectId.set(newID);
    await getProjectNames();
    saveState.set(1);
  } else {
    await db.project.update(get(projectId), {
      name: get(jobName),
      md: get(resumeMd),
      mdKeywords: get(resumeKeywords),
      jobUrl: get(jobUrl),
      jobDesc: get(jobDescription),
      jobKeywords: get(jobKeywords),
      score: get(combinedScore),
      saves: get(saveCount),
      created: new Date(), // (original code overwrote created; consider preserving)
      modified: new Date()
    });
    await getProjectNames();
    saveState.set(2);
  }

  if (get(saveCount) === 0) {
    saveCount.set(get(saveCount) + 1);
  }
  return 0;
}

/**
 * Load a project by id and hydrate all reactive stores.
 */
export async function loadProject(id: number): Promise<void> {
  const project = await db.project.get(id);
  if (!project) {
    console.warn("Project not found:", id);
    return;
  }
  jobName.set(project.name);
  resumeMd.set(project.md);
  resumeKeywords.set(project.mdKeywords);
  jobUrl.set(project.jobUrl);
  jobDescription.set(project.jobDesc);
  jobKeywords.set(project.jobKeywords);
  combinedScore.set(project.score);
  created.set(project.created ?? new Date());
  updated.set(project.modified ?? new Date());
  saveCount.set(project.saves);
  projectId.set(id);
  score();
}

/**
 * Populate availableProjects store with [name, id] pairs (newest first).
 */
export async function getProjectNames(): Promise<void> {
  const all = await db.project.toArray();
  all.reverse();
  availableProjects.set(all.map(p => [p.name, p.id]));
}

/**
 * Reset current project (not the database) to defaults for new project creation.
 */
export function clearProject(): void {
  jobName.set("Change Me");
  resumeMd.set(get(resumeTemplate));
  resumeKeywords.set([]);
  jobUrl.set("https://example.com/");
  jobDescription.set(
    "Paste your job description here, or paste a link and try to fetch it"
  );
  jobKeywords.set([]);
  overlappingKeywords.set([]);
  combinedScore.set(0);
  created.set(new Date());
  updated.set(new Date());
  saveCount.set(0);
  projectId.set(-1);
  console.log("Project cleared");
}

/* ========================================================================
 * Export / Import / Reset (IndexedDB level)
 * ===================================================================== */

type DBContent = {
  [dbName: string]: {
    [storeName: string]: any[];
  };
};

/**
 * Export both application databases (ResuMateMain + svelte-persist) as JSON file.
 */
export async function downloadDBasJSON(): Promise<void> {
  const dbNames = ["ResuMateMain", "svelte-persist"];
  const exportContent: DBContent = {};

  for (const dbName of dbNames) {
    const rawDB = await openDB(dbName);
    exportContent[dbName] = {};

    for (const storeName of rawDB.objectStoreNames) {
      const transaction = rawDB.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const data: { key: any; value: any }[] = [];
      await new Promise<void>((resolve, reject) => {
        const cursorRequest = store.openCursor();
        cursorRequest.onerror = () => reject(cursorRequest.error);
        cursorRequest.onsuccess = e => {
          const cursor = (e.target as IDBRequest).result;
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
    rawDB.close();
  }

  const jsonString = JSON.stringify(exportContent, null, 2);
  downloadJSON(jsonString, "indexeddb_export.json");
}

/**
 * Import exported JSON into matching IndexedDB stores (replace existing data).
 */
export async function importIndexedDBs(jsonData: string): Promise<void> {
  const jsonContent = JSON.parse(jsonData);
  if (!(jsonContent["ResuMateMain"] && jsonContent["svelte-persist"])) {
    console.error("Required databases not found in import payload");
    return;
  }

  for (const dbName of Object.keys(jsonContent)) {
    const rawDB = await openDB(dbName);
    for (const storeName of Object.keys(jsonContent[dbName])) {
      if (!Array.from(rawDB.objectStoreNames).includes(storeName)) {
        console.warn(`Store ${storeName} missing in ${dbName}, skipping`);
        continue;
      }
      const tx = rawDB.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      await clearObjectStore(store);
      const items = jsonContent[dbName][storeName];
      for (const item of items) {
        if (store.keyPath === null) {
          await new Promise<void>((resolve, reject) => {
            const req = store.put(item.value, item.key);
            req.onerror = () => reject(req.error);
            req.onsuccess = () => resolve();
          });
        } else {
          await addItem(store, item.value);
        }
      }
      await new Promise<void>(resolve => {
        tx.oncomplete = () => resolve();
      });
    }
    rawDB.close();
  }

  await getProjectNames();
  console.log("Import completed");
}

/**
 * Full application reset: clears both app databases and restores all stores.
 */
export async function resetApplication(): Promise<void> {
  console.log("Resetting application data...");
  const dbNames = ["ResuMateMain", "svelte-persist"];
  for (const dbName of dbNames) {
    const rawDB = await openDB(dbName);
    for (const storeName of rawDB.objectStoreNames) {
      const tx = rawDB.transaction(storeName, "readwrite");
      await clearObjectStore(tx.objectStore(storeName));
      await new Promise<void>(resolve => {
        tx.oncomplete = () => resolve();
      });
    }
    rawDB.close();
  }

  // Core resets
  resumeMd.set(
    "# Go to settings and fetch my resume template from the settings! Also Update your info!"
  );
  resumeHtml.set("<h1>Hi</h1>");
  jobDescription.set(
    "Paste your job description here, or paste a link and try to fetch it"
  );
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

  // Settings defaults
  resumeTemplate.set(
    "# Go to settings and fetch my resume template from the settings! Also Update your info!"
  );
  name.set("John Doe");
  email.set("example@gmail.com");
  phone.set("999-999-9999");
  website.set("example.com");
  linkedin.set("linkedin.com/in/example");
  github.set("github.com/example");
  address.set("Moon Street 123");
  cssTheme.set("/ResuMate/style.css");
  openRouterKey.set("your_api_key_here");
  openRouterAIModel.set("openai/gpt-4.1");
  knowlegeBase.set(
    "Fetch some example knowlege to see what it looks like"
  );

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

  createHeader();
  console.log("Application reset complete");
}

/* ========================================================================
 * Internal Helpers (IndexedDB direct)
 * ===================================================================== */


function openDB(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function clearObjectStore(store: IDBObjectStore): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

function addItem(store: IDBObjectStore, item: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.add(item);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

function downloadJSON(jsonString: string, filename: string): void {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}