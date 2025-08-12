# Navigation Rewrite Accessibility Checklist (Functional Slice)

Scope: New navigation shell components ([`Sidebar.svelte`](src/components/layout/Sidebar.svelte), [`Topbar.svelte`](src/components/layout/Topbar.svelte), [`LayoutRoot.svelte`](src/components/layout/LayoutRoot.svelte), [`ProjectList.svelte`](src/components/layout/ProjectList.svelte), [`ModeSwitcher.svelte`](src/components/layout/ModeSwitcher.svelte)) integrated into [`app.svelte`](src/components/app.svelte).

Run this manual checklist before deprecating legacy nav components.

## 1. Landmarks / Structure
- [ ] One <aside> (sidebar) present with aria-label="Primary".
- [ ] Top bar uses role="banner".
- [ ] Main content region is <main tabindex="-1"> and can be programmatically focused after route / mode change.
- [ ] Modal overlay (Settings) sets role="dialog" and aria-modal="true" only when active.

## 2. Keyboard Navigation Order (Tab Sequence)
Expected initial tab order (no modal open):
1. Brand button (ResuMate / New Project via title button)
2. "New Project" button
3. First project list item (if any) then each subsequent item
4. "Settings" toggle
5. "Reset" button (Topbar)
6. Project Name input
7. "Save" button
8. Status text (should be skipped if not focusable; confirm it is NOT tabbable)
9. Mode Switcher first tab (roving: only active has tabindex="0")
10. Download placeholder button (disabled)
11. Resume editor content (ensure editor container is reachable)
12. Job URL input (inside content panel)
13. Fetch button
14. Job description textarea

Checklist:
- [ ] Tabbing never traps.
- [ ] Shift+Tab reverses correctly.
- [ ] Focus visibly indicated (browser default or minimal outline acceptable at this stage).

## 3. ProjectList Roving Focus
- [ ] ArrowUp / ArrowDown move active item without using Tab.
- [ ] Home jumps to first; End jumps to last.
- [ ] Enter/Space activate selection (loads project).
- [ ] Tab leaves list from currently focused item (no extra stops).
- [ ] Empty state: focus skips list (no dead stops) when zero projects.

## 4. ModeSwitcher (Temporary Implementation)
- [ ] role="tablist" on container.
- [ ] role="tab" on each tab.
- [ ] Exactly one tab has aria-selected="true" and tabindex="0".
- [ ] Others have aria-selected="false" and tabindex="-1".
- [ ] Left/Right (or implemented Arrow keys) move focus & selection according to spec (verify current key handling).
- [ ] Space / Enter activate tab (if not already).
- [ ] Screen reader announces "Content tab selected" (similar phrasing) for active.

## 5. Buttons / Toggles / Inputs
- [ ] Settings button reflects pressed state via aria-pressed (true when modal open).
- [ ] Save button has aria-label or accessible text "Save".
- [ ] Reset button labeled clearly (aria-label present: "Reset resume content to template").
- [ ] Download placeholder has aria-disabled="true" and is removed from functional workflow.
- [ ] Project Name input has a visible & programmatic label (label for="project-name").

## 6. Live Regions / Status
- [ ] Save status element uses role="status" (implicit polite) or aria-live="polite".
- [ ] Changing save state (-1,0,1,2) yields an announcement only when text changes ("Saving...", "Saved", "Error saving").
- [ ] Status dot (colored circle) is aria-hidden.

## 7. Modal Behavior (Settings)
- [ ] Opening modal traps focus inside (CURRENT: Not implemented – confirm and document gap).
- [ ] Background content visually subdued (overlay applied).
- [ ] Esc closes modal (CURRENT: Not implemented – document).
- [ ] Focus returns to invoking Settings toggle after close (CURRENT: Not implemented – document).

Action Items (post functional slice):
- [ ] Add focus trap utility.
- [ ] Add Esc & backdrop click handlers.
- [ ] Restore focus on close.

## 8. Color Contrast (Catppuccin Palette Quick Pass)
Test a representative sample using a contrast checker:
- [ ] Text (text-text) on background (bg-crust / bg-mantle) ≥ 4.5:1 (if failures, log).
- [ ] Blue interactive states meet 4.5:1 against backgrounds.
- [ ] Red / Yellow / Green status dots have non-color redundant text ("Saving...", etc.).

## 9. Responsive / Overflow
- [ ] Narrow viewport: Sidebar content scrollable (min-h-0 + flex-1 working).
- [ ] Project list scrolls independently without causing page scroll when tall.
- [ ] No horizontal scrollbars introduced by layout wrappers at typical widths (≥320px).

## 10. Screen Reader Labels (Spot Checks)
Use NVDA / VoiceOver:
- [ ] Brand button announced "ResuMate, button".
- [ ] Settings toggle announces pressed state.
- [ ] Mode tabs announced with selected state.
- [ ] Project list items announced as plain buttons (acceptable for now); future: role="option" pattern evaluation.

## 11. Performance / No Regression
- [ ] No excessive re-renders when moving between project list items (observe devtools).
- [ ] Save status updates only when store changes (no spurious announcements).

## 12. Known Gaps (Documented for Subsequent Iteration)
- Focus trap + return for modal.
- Escape handling for modal close.
- Download functionality (placeholder only).
- Missing Button primitive (semantics duplicated).
- Potential migration of ModeSwitcher to a Tabs primitive (ARIA pattern consolidation).
- Color contrast audit pending full theming layer.

## Sign-off
Complete all MUST items (sections 1–7 minus acknowledged intentional gaps) before deleting or moving legacy nav components.

Reviewer Sign / Date:
- Functional:
- Accessibility: