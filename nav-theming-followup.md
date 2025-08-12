# Navigation / UI Follow-up Styling & Theming Plan

Phase: Post functional navigation rewrite (after verification & legacy removal).  
Context sources: [`nav-rewrite-goals.md`](nav-rewrite-goals.md), a11y checklist [`nav-a11y-checklist.md`](nav-a11y-checklist.md), new layout components: [`LayoutRoot.svelte`](src/components/layout/LayoutRoot.svelte), [`Sidebar.svelte`](src/components/layout/Sidebar.svelte), [`Topbar.svelte`](src/components/layout/Topbar.svelte), [`ModeSwitcher.svelte`](src/components/layout/ModeSwitcher.svelte), [`ProjectList.svelte`](src/components/layout/ProjectList.svelte).

## 1. Token Architecture

Current: Direct Catppuccin variables + Tailwind utility classes inline.  
Goal: Introduce semantic alias layer to decouple raw palette from component semantics.

Proposed Semantic Groups:
- Surface: surface-base, surface-raised, surface-inset, surface-alt
- Border: border-default, border-strong, border-focus, border-muted
- Text: text-primary, text-secondary, text-muted, text-inverted, text-accent
- Accent Intents: accent-primary, accent-primary-hover, accent-danger, accent-warning, accent-success, accent-info
- State Backgrounds (lightweight badges): state-danger-bg, state-warning-bg, state-success-bg
- Focus: focus-ring (outline color + offset)
- Overlay: overlay-scrim, overlay-panel
- Scrollbar: scrollbar-track, scrollbar-thumb

Implementation Steps:
1. Add CSS custom properties referencing existing Catppuccin colors near top of global stylesheet. (File: global theme not created yet; location probably `src/styles/global.css`.)
2. Map semantic names to base palette (allow quick future palette swaps or theming variants).
3. Replace direct class utilities (e.g. bg-crust, bg-mantle) in new layout components with semantic tokens (phase 2—only after tokens stable).

Risk Mitigation:
- Introduce tokens behind opt-in body class (e.g. `.theme-semantic`) to allow incremental migration.

## 2. Primitive Components (Design System Foundations)

Initial Primitive Set (aligns with rewrite tasks):
1. Button
2. Separator
3. ScrollArea
4. Tabs (replacing current ModeSwitcher)
5. Tooltip
6. Dialog (Settings modal replacement)
7. Badge / StatusDot
8. VisuallyHidden (utility wrapper)
9. FocusScope (for trapping focus when modal open)
10. Toast (later, for save/error feedback; might integrate with aria-live)

Design Principles:
- Each primitive exports minimal API.
- Style layering: base structural styles + variant tokens (no hard-coded colors).
- Variants expressed via data attributes (e.g. data-variant='primary' / 'ghost' / 'danger').
- Size variants: sm / md (maybe lg) to keep scale consistent.

Example Variant Matrix (Button):
- variant: primary, secondary, outline, ghost, destructive
- size: sm, md
- state classes: data-loading, aria-pressed, disabled

Accessibility Baselines:
- Button: supports aria-pressed for toggle states.
- ScrollArea: consistent focusable fallback for keyboard-only users; ensure scrollbars visible / themable.
- Tabs: WAI-ARIA roles & roving tabindex (replace bespoke ModeSwitcher code).
- Tooltip: trigger focus + hover, ESC to dismiss, accessible fallback for touch (maybe long-press or skip).
- Dialog: Focus trap, aria-labelledby, aria-describedby, inert background.

## 3. ModeSwitcher Migration to Tabs Primitive

Current Implementation: [`ModeSwitcher.svelte`](src/components/layout/ModeSwitcher.svelte) implements custom roving focus.  
Tasks:
1. Build generic Tabs primitive: Tabs (container), TabList, Tab, TabPanel.
2. Support keyboard spec: ArrowLeft / ArrowRight / Home / End.
3. Provide orientation prop (default horizontal).
4. Provide activation mode (manual vs automatic). Use automatic (focus activates) or manual? Evaluate for user workflow; likely manual for performance if heavy panel switching.

## 4. Scroll Behavior & Layout Polish

- Introduce ScrollArea primitive: wrapper + viewport + optional shadow edges to signal overflow.
- Replace legacy scroll styling (deprecated) in project list region.
- Ensure reduced motion preference respected for animated scroll indicators.

## 5. Focus & Interaction States

Add consistent focus ring:
- Outline: 2px solid focus token
- Offset: 2px (avoid clipping via ring utilities)
- Reduced motion: disable any animate-pulse on focus.

Define Data State Hooks:
- data-focus-visible (polyfill or rely on :focus-visible)
- data-active / data-hover for progressive enhancement (JS not required).

## 6. Settings Dialog Rewrite

Features:
- Use Dialog primitive (modal + backdrop + focus trap).
- ESC close, backdrop click close (configurable).
- InitialFocus prop to direct focus to first actionable control.
- Return focus to invoking Settings button.

Plan:
1. Extract existing Settings content from [`settings.svelte`](src/components/settings.svelte) into slots or structured sections.
2. Add heading with id & aria-labelledby on dialog container.

## 7. Download / Export Action Redesign

Goals:
- Provide progress feedback (generating / ready / error).
- Expose failure reasons with retry (toast + inline).
- Offer multiple formats (HTML, PDF) future-friendly.
- Possibly move heavy work off main thread (Web Worker) if transformation grows.

Token Use:
- Use accent-primary for ready state, accent-warning for pending, accent-danger for error.

## 8. Save State Feedback Consolidation

Current: Dot + text "Saving..." / "Saved" in [`Topbar.svelte`](src/components/layout/Topbar.svelte).  
Enhancements:
- Add accessible polite live region for transitions only (debounce rapid state flips).
- Add idle state label (e.g. "All changes saved") after delay.
- Use StatusDot primitive + text pairing for color + text redundancy.

## 9. Theming Variants (Future)

Potential Additional Themes:
- High Contrast (WCAG AAA targets)
- Dim (less chroma)
- Solarized variant (if user demand)

Approach:
- Theme root class sets alternate semantic tokens.
- Animations between themes opt-in (prefers-reduced-motion respected).

## 10. Color Contrast Audit

Tooling:
- Run automated audit (axe-core in browser or pa11y) focusing on:
  - Navigation surfaces
  - Interactive focus & hover colors
  - Status indicators (absolute min 3:1 if non-text, ensure text label provided)

Record fails & adjustments in dedicated section appended to this file.

## 11. Implementation Order (Recommended)

1. Semantic tokens scaffold (non-breaking, optional opt-in class).
2. Button primitive + incremental replacement (Sidebar / Topbar first).
3. Separator + ScrollArea primitives.
4. Tabs primitive (replace ModeSwitcher).
5. Dialog primitive (replace Settings modal overlay).
6. Tooltip primitive (convert ad-hoc pseudo-element tooltips).
7. StatusDot + refined save state pattern.
8. Download action redesign.
9. Theme variants (if required) & high contrast adjustments.
10. Final contrast + keyboard regression audit.

## 12. Risk & Rollback Strategy

- Introduce primitives behind feature flag store (e.g. designSystemEnabled) for early validation.
- Keep legacy components only until each target region has passed a11y & regression test.
- Document any performance regressions (especially tab switching & editor re-renders) before full rollout.

## 13. Tracking Matrix (To Convert to TODO List Later)

| Area | Primitive / Token | Status (Planned / In Progress / Done) |
|------|-------------------|---------------------------------------|
| Tokens Layer | semantic variables | Planned |
| Button | button primitive | Planned |
| Separator | separator primitive | Planned |
| ScrollArea | scroll area wrapper | Planned |
| Tabs | accessible tabs | Planned |
| Tooltip | accessible tooltip | Planned |
| Dialog | modal/dialog | Planned |
| Status Feedback | status dot + live region | Planned |
| Download | redesigned action | Planned |
| Theme Variants | alt theme classes | Planned |
| Contrast Audit | results & fixes | Planned |

## 14. Definition of Done (Styling/Theming Phase)

- All navigation & common actions use primitives & semantic tokens (no raw color class leakage except spacing/typography utilities).
- A11y audit passes (no critical violations).
- Contrast meets WCAG AA for text & UI components.
- Legacy UI component directory removed or archived outside shipping bundle.
- Documentation updated (README or dedicated theming guide) with token naming rules.

---

Authoring Note: This file serves as a living plan until converted into actionable tasks; update sections with real statuses as work proceeds.
