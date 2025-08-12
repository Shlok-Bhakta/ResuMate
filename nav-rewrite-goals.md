# Navigation Rewrite Goals (Sidebar + Topbar First Slice)

Status: Planning (pre-implementation)  
Scope: Functional rewrite (accessibility + clean architecture) with minimal visual styling (retain existing Catppuccin tokens usage opportunistically, no design polish yet).  
Out of Scope (this slice): Theming layer, primitive design system, settings modal overhaul, progress bar redesign, editor internals, responsive collapsed sidebar (spec only), fancy animations, token alias layer, tooltip system.

---

## 1. Objectives

1. Decouple navigation concerns from legacy monolithic UI.
2. Improve maintainability via clear component boundaries and limited store surface per component.
3. Ensure keyboard + screen reader accessibility from day one.
4. Preserve all existing functional behaviors (project selection, mode switching, save/reset/template actions, settings toggle, download) with cleaner internal APIs.
5. Provide stable extension points for later styling / primitive introduction (buttons, tabs, scroll area, tokens).
6. Eliminate legacy ad-hoc components (Pill, Seperator, Scrollbox) in favor of simpler markup first; replace visually later.

---

## 2. New Component Hierarchy

```
src/components/layout/
  LayoutRoot.svelte          (future: wraps overall app; installs Sidebar + Topbar + content slot)
  Sidebar/
    Sidebar.svelte           (composition shell)
    BrandHeader.svelte       (app title + new project / clear action)
    ProjectActions.svelte    (New Project button – may merge into BrandHeader if trivial)
    ProjectList.svelte       (async resolution of availableProjects; selection logic)
    FooterActions.svelte     (Settings toggle)
  Topbar/
    Topbar.svelte            (composition shell)
    ResetTemplateButton.svelte
    ProjectNameField.svelte
    SaveProjectButton.svelte (aria-live region for status)
    ModeSwitcher.svelte      (tabs for Content/Tuning/Preview)
    DownloadButton.svelte    (placeholder; existing logic ported)
```

Initial implementation may inline subcomponents inside Sidebar.svelte / Topbar.svelte for velocity, then extract only if complexity grows. File stubs prepared for clarity.

---

## 3. Store Contract (Read/Write Responsibilities)

| Component | Stores (read) | Stores (write/update) | Notes |
|-----------|---------------|------------------------|-------|
| ProjectList | availableProjects (Promise), modalState (read-only to avoid interfering), (optional) any selected project id (derive from loaded resume metadata if needed) | loadProject(), getProjectNames() trigger on mount | Moves current effect from legacy sidebar into onMount with explicit refresh strategy |
| BrandHeader / ProjectActions | N/A | clearProject() (new project semantic) | Wraps clearProject() to both clear & (later) focus editor |
| FooterActions | modalState | modalState | Toggle settings (aria-pressed) |
| ModeSwitcher | projectEditingStage | projectEditingStage | Implements roving tab keyboard pattern |
| ProjectNameField | jobName | jobName | Add label (visually hidden) + description if needed |
| SaveProjectButton | saveState | saveCurrentProject() | Manage aria-live polite region for status text |
| ResetTemplateButton | resumeTemplate, resumeMd | resumeMd = resumeTemplate | Provide aria-label and optional confirmation (deferred) |
| DownloadButton | resumeHtml | (no write) | Reuse existing logic (may keep as single file) |

Additional invoked utilities: createHeader() remains outside nav rewrite; not required for navigation flow.

---

## 4. Interaction & Accessibility Plan

### Project List (ul / li / button)
- Structure: <nav aria-label="Projects"> <ul role="list"> <li><button>Project Name</button>
- Keyboard:
  - Tab enters list (first item gets focus if none focused).
  - ArrowDown / ArrowUp move focus among buttons (prevent default to avoid page scroll).
  - Home jumps first, End jumps last.
  - Enter / Space activates (loadProject).
- Focus Management:
  - After creating a new project (clearProject), focus shifts to name input in Topbar (if available) for immediate renaming.
- Loading State: single <div role="status">Loading projects...</div>
- Empty State: <p>No projects yet. Create one to begin.</p>

### Mode Switcher (role="tablist")
- Markup: container role="tablist" aria-label="Editor mode"; each button role="tab" aria-selected boolean, tabindex (0 active, -1 others).
- Keyboard: ArrowRight / ArrowLeft cycle; Home / End jump extremes; Enter / Space activate.
- Activation sets projectEditingStage.

### Save Status
- Aria-live region (polite) inside SaveProjectButton reflecting:
  - -1: "Save failed"
  - 0: "Saving..."
  - 1/2: "Saved"
- Visual indicator minimal (colored dot retained or simplified).

### Settings Toggle
- Button with aria-pressed = modalState !== "None"
- Purpose: toggles settings modal (legacy behavior unchanged).

### Reset Template
- Simple button; aria-label="Reset resume to template"
- (Optional future) two-step confirmation (deferred).

### Download
- Icon button with aria-label="Download PDF"

### General
- All icon-only buttons: explicit aria-label.
- Use semantic elements: <header> for Topbar, <nav> for Sidebar, <main> remains in app content.
- Minimal styling: rely on existing utility classes for spacing & contrast; postpone tokens.

---

## 5. State & Data Flow Diagram (Conceptual)

Sidebar
  ProjectList (fetch names on mount) --(select project)--> loadProject() -> stores update -> Editor / Display content reacts
Topbar
  ProjectNameField (bind jobName)
  SaveProjectButton --(click or maybe autosave triggers already elsewhere)--> saveCurrentProject()
  ModeSwitcher --(activate)--> projectEditingStage
  ResetTemplateButton --(click)--> resumeMd = resumeTemplate
  DownloadButton --(click)--> side-effect (window print logic based on resumeHtml)

---

## 6. Migration Strategy

1. Create new layout files under src/components/layout/.
2. Temporarily keep legacy imports in [`app.svelte`](src/components/app.svelte); add feature flag const USE_NEW_NAV = true for controlled swap.
3. When new nav functions (keyboard + basic actions validated), remove legacy Sidebar / Topbar usage.
4. Mark legacy nav & UI utility components with `/** @deprecated Replaced by layout rewrite (date) */`.
5. After confirmation, remove feature flag and (optionally) relocate deprecated files to `old/legacy-ui/` or delete.

---

## 7. Testing Checklist (Manual)

| Area | Action | Expected |
|------|--------|----------|
| Project loading | Click each project | Editor content updates; focus remains stable |
| Keyboard list nav | Arrow keys cycle | Focus indicator moves; no scroll jump |
| Home/End in list | Press Home/End | Focus first/last project |
| Mode switcher | Arrow keys cycle tabs | aria-selected updates; projectEditingStage store updates |
| Save status | Trigger save (edit resume content) | aria-live announces "Saving..." then "Saved" |
| Settings toggle | Activate | modalState toggles; aria-pressed changes |
| Reset template | Activate | resumeMd replaced with resumeTemplate contents |
| Download | Activate | Print dialog (existing behavior) |
| Focus return | After New Project -> project name input | Input receives focus |

---

## 8. Deferred Enhancements (Next Phases)

- Semantic token alias layer (global.css)
- Primitive extraction (Button, Tabs, ScrollArea, Tooltip, etc.)
- Responsive sidebar collapse
- Rich tooltips / status toasts
- Mode switcher extracted to generic Tabs primitive
- Visual polish (hover, active, focus ring standardization)
- Settings modal rewrite leveraging Dialog primitive
- Progress component for match score
- Color contrast audit & adjustments

---

## 9. Implementation Order (Concise)

1. Scaffolding: layout directory & stub components.
2. Implement ProjectList with keyboard support.
3. Implement ModeSwitcher with roving tabindex.
4. Build Sidebar (compose BrandHeader, ProjectList, FooterActions).
5. Build Topbar (project name, reset, save, mode switcher, download).
6. Integrate into app with feature flag.
7. Manual a11y validation.
8. Deprecate/remove legacy nav components.
9. Summarize & proceed to theming/styling phase planning.

---

## 10. Open Questions (If Any Emerge Later)

- Should project creation open an inline rename flow (currently yes via focusing input)?
- Do we need persistence of last focused project list item across reload? (Not now)
- Will settings modal adopt Dialog soon enough to influence sidebar toggle semantics? (Deferred)

(Assuming all acceptable; no blocking open issues at this phase.)

---

End of goals document.