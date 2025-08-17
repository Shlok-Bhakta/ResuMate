# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ResuMate is a fully client-side AI-powered resume builder built with Astro + Svelte + TypeScript. It helps developers tailor resumes to specific job postings using keyword matching and OpenRouter AI integration for content optimization. Everything runs in the browser with IndexedDB persistence.

## Key Commands

```bash
# Build commands (dev server should already be running)
npm run build              # Build for production (outputs to ./docs)
npm run preview            # Preview production build

# Development note: Do NOT run `npm run dev` - assume it's already running
# No test suite or linting configured in package.json
```

## Architecture & Data Flow

### Core Tech Stack
- **Astro** - Static site generator (fully client-side, no SSR)
- **Svelte 5** - Component framework with runes API
- **TypeScript** - Type safety throughout
- **TailwindCSS 4** - Styling system
- **Dexie** - IndexedDB wrapper for client-side persistence

### Key Architecture Patterns

**Client-Side Database Architecture:**
- **Dexie (`src/components/utils/db.ts`)** - Main project storage with CRUD operations for resume projects
- **Svelte Persistent Store** - Settings and UI state persisted to IndexedDB via `@macfja/svelte-persistent-store`
- **Dual Database Setup** - `ResuMateMain` (projects) + `svelte-persist` (settings/state)

**State Management (`src/components/utils/stores.ts`):**
- All reactive state uses persisted Svelte stores
- Core domains: project content, scoring/keywords, settings, UI state
- Automatic persistence to IndexedDB for offline-first experience

**AI Integration (`src/components/utils/tune.ts`):**
- OpenRouter API integration for resume optimization
- System prompts designed for truthful XYZ-format bullet points
- Processes job descriptions + knowledge base to enhance resumes

**Scoring System (`src/components/utils/scoring.ts`):**
- Keyword extraction with regex patterns handling phrases and special characters
- Simple overlap percentage calculation between resume and job description keywords
- Promotes matched keywords to top of lists for UI display

### Application Layout

**Main App Structure:**
- `src/components/app.svelte` - Root component with animated background and conditional panes
- `src/components/layout/LayoutRoot.svelte` - Main layout with sidebar and topbar
- Three-pane editing interface: Resume Editor | Job Description/Scoring | Preview

**Core Components:**
- `src/components/resume/resumeeditor.svelte` - Markdown editor with Carta-MD
- `src/components/resume/displayscores.svelte` - Keyword scoring and AI tuning interface  
- `src/components/resume/pdfpreview.svelte` - HTML preview with PDF generation
- `src/components/layout/ProjectList.svelte` - Project management sidebar

### Special Markdown Features
- `||` delimiter for left/right column alignment in resume sections
- `Alt + /` shortcut for commenting/uncommenting lines
- HTML comment support for conditional content inclusion

### Data Transfer & Sync
- **PeerJS Integration (`src/components/utils/peerSync.ts`)** - Device-to-device data transfer
- **Export/Import** - Full IndexedDB backup/restore functionality
- Transfers both project data and user settings (including API keys)

## Development Notes

**Component Focus:**
- All development work should be in `src/components/` directory
- This is where all the application logic and UI components live
- No server-side code - everything is client-side browser execution

**Design System:**
- Uses glass morphism aesthetic without blur effects for performance
- Hyprland-inspired minimal design with clean geometric elements
- Color palette: Blue → Sapphire → Teal gradients for primary elements
- Border radius: 4px for buttons, 8px for containers (no excessive rounding)
- Dynamic color coding: Score circles and progress bars reflect performance levels

**Path Aliases (tsconfig.json):**
```
$lib/* → ./src/*
$utils → ./src/components/utils.svelte.ts  
$ui/* → ./src/components/ui/*
```

**Build Configuration:**
- Outputs to `./docs` for GitHub Pages deployment
- Assets organized under `/assets/` directory
- Base path: `/ResuMate` for GitHub Pages hosting

**Key Dependencies:**
- `carta-md` - Markdown editor component
- `html2pdf.js` - PDF generation from HTML
- `dexie-export-import` - Database backup functionality
- `peerjs` - WebRTC data transfer
- `mode-watcher` - Dark/light mode detection

## Common Patterns

**Store Usage:**
```typescript
import { someStore } from "$utils";
// Read: get(someStore) or $someStore in components
// Write: someStore.set(value)
```

**Database Operations:**
```typescript
import { saveCurrentProject, loadProject } from "$lib/components/utils/db.ts";
await saveCurrentProject(); // Auto-creates or updates based on projectId
await loadProject(id);       // Loads project and hydrates all stores
```

**AI Tuning Workflow:**
1. User configures OpenRouter API key in settings
2. Job description analyzed for keywords  
3. Resume content + knowledge base sent to AI with optimization prompts
4. Returned markdown replaces current resume content