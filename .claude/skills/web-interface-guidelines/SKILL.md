---
id: web-interface-guidelines
kind: skill
name: "web-interface-guidelines"
description: "Audit built UI code against a rules checklist covering accessibility, focus, forms, animation, typography, performance, i18n, and hydration safety"
version: 1.0.0
updated: 2026-08-30
requires: []
verified: []
providers: [all]
model: any
tags: [frontend, accessibility, ui-review, web, performance]
owner: ai-studio
overrides: {}
---

<!--
Adapted from Vercel Labs' Web Interface Guidelines (vercel-labs/web-interface-guidelines,
command.md), MIT License, Copyright (c) 2025 Vercel Labs. Rules reproduced near-verbatim;
frontmatter and framing reworked for this library's contract.
Upstream: https://github.com/vercel-labs/web-interface-guidelines

These rules reflect Vercel's own product/brand choices in places (Chicago-style
Title Case, `&` over "and", specific ARIA patterns) — treat as a strong
starting checklist to review and adapt per project, not an unquestionable
standard.
-->

Review the given files (or the diff, if no files are named) against the
rules below. Read the code, don't guess from memory. Output concise but
comprehensive — sacrifice grammar for brevity, high signal-to-noise.

## Rules

### Accessibility

- Icon-only buttons need `aria-label`
- Form controls need `<label>` or `aria-label`
- Interactive elements need keyboard handlers (`onKeyDown`/`onKeyUp`)
- `<button>` for actions, `<a>`/`<Link>` for navigation (not `<div onClick>`)
- Images need `alt` (or `alt=""` if decorative)
- Decorative icons need `aria-hidden="true"`
- Async updates (toasts, validation) need `aria-live="polite"`
- Use semantic HTML (`<button>`, `<a>`, `<label>`, `<table>`) before ARIA
- Headings hierarchical `<h1>`–`<h6>`; include skip link for main content
- `scroll-margin-top` on heading anchors
- Meaningful media needs captions, transcripts, or descriptions as applicable
- Media controls need keyboard support; decorative media needs assistive-tech hiding

### Focus states

- Interactive elements need visible focus: `focus-visible:ring-*` or equivalent
- Never `outline-none` / `outline: none` without a focus replacement
- Use `:focus-visible` over `:focus` (avoid a focus ring on click)
- Group focus with `:focus-within` for compound controls
- Sticky headers/footers/overlays must not cover the focused element

### Forms

- Inputs need `autocomplete` and a meaningful `name`
- Use the correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- Never block paste (`onPaste` + `preventDefault`)
- Labels clickable (`htmlFor` or wrapping the control)
- Disable spellcheck on emails, codes, usernames (`spellCheck={false}`)
- Checkboxes/radios: label + control share a single hit target (no dead zones)
- Submit button stays enabled until the request starts; spinner during the request
- Errors inline next to fields; focus the first error on submit
- Placeholders end with `…` and show an example pattern
- `autocomplete="off"` on non-auth fields to avoid password-manager triggers
- Warn before navigation with unsaved changes (`beforeunload` or a router guard)

### Animation

- Honor `prefers-reduced-motion` (provide a reduced variant or disable)
- Animate `transform`/`opacity` only (compositor-friendly)
- Never `transition: all` — list properties explicitly
- Set the correct `transform-origin`
- SVG: transforms on a `<g>` wrapper with `transform-box: fill-box; transform-origin: center`
- Animations interruptible — respond to user input mid-animation
- Autoplay motion over 5 seconds alongside other content needs pause, stop, or hide controls
- Muted decorative loops must stop under `prefers-reduced-motion`

### Typography

- `…` not `...`
- Curly quotes `"` `"` not straight `"`
- Non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- Loading states end with `…`: "Loading…", "Saving…"
- `font-variant-numeric: tabular-nums` for number columns/comparisons
- Use `text-wrap: balance` or `text-pretty` on headings (prevents widows)

### Content handling

- Text containers handle long content: `truncate`, `line-clamp-*`, or `break-words`
- Flex children need `min-w-0` to allow text truncation
- Handle empty states — don't render broken UI for empty strings/arrays
- User-generated content: anticipate short, average, and very long inputs

### Images

- `<img>` needs explicit `width` and `height` (prevents layout shift)
- Below-fold images: `loading="lazy"`
- Above-fold critical images: `priority` or `fetchpriority="high"`

### Performance

- Large lists (50+ items): virtualize
- No layout reads in render (`getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`)
- Batch DOM reads/writes; avoid interleaving
- Prefer uncontrolled inputs; controlled inputs must be cheap per keystroke
- Add `<link rel="preconnect">` for CDN/asset domains
- Critical fonts: `<link rel="preload" as="font">` with `font-display: swap`
- Prefer `<video autoplay muted loop playsinline>` over an animated GIF; provide a still alternative

### Navigation & state

- URL reflects state — filters, tabs, pagination, expanded panels in query params
- Links use `<a>`/`<Link>` (Cmd/Ctrl+click, middle-click support)
- Deep-link stateful UI (state held in `useState` — consider syncing it to the URL)
- Destructive actions need a confirmation modal or an undo window — never immediate

### Touch & interaction

- `touch-action: manipulation` (prevents double-tap zoom delay)
- `-webkit-tap-highlight-color` set intentionally
- `overscroll-behavior: contain` in modals/drawers/sheets
- During drag: disable text selection, `inert` on dragged elements
- Drag/swipe/pinch/path gestures need tap/click and keyboard alternatives unless essential
- `autoFocus` sparingly — desktop only, single primary input; avoid on mobile

### Safe areas & layout

- Full-bleed layouts need `env(safe-area-inset-*)` for notches
- Avoid unwanted scrollbars: `overflow-x-hidden` on containers, fix content overflow
- Flex/grid over JS measurement for layout

### Dark mode & theming

- `color-scheme: dark` on `<html>` for dark themes (fixes scrollbar, inputs)
- `<meta name="theme-color">` matches the page background
- Native `<select>`: explicit `background-color` and `color` (Windows dark mode)

### Locale & i18n

- Dates/times: use `Intl.DateTimeFormat`, not hardcoded formats
- Numbers/currency: use `Intl.NumberFormat`, not hardcoded formats
- Detect language via `Accept-Language` / `navigator.languages`, not IP
- Brand names, code tokens, identifiers: wrap with `translate="no"` to prevent garbled auto-translation

### Hydration safety

- Inputs with `value` need `onChange` (or use `defaultValue` for uncontrolled)
- Date/time rendering: guard against a server/client hydration mismatch
- `suppressHydrationWarning` only where truly needed

### Hover & interactive states

- Buttons/links need a `hover:` state (visual feedback)
- Interactive states increase contrast: hover/active/focus more prominent than rest

### Content & copy

- Active voice: "Install the CLI" not "The CLI will be installed"
- Numerals for counts: "8 deployments" not "eight"
- Specific button labels: "Save API Key" not "Continue"
- Error messages include the fix/next step, not just the problem
- Second person; avoid first person

### Anti-patterns (flag these)

- `user-scalable=no` or `maximum-scale=1` disabling zoom
- `onPaste` with `preventDefault`
- `transition: all`
- `outline-none` without a focus-visible replacement
- Inline `onClick` navigation without `<a>`
- `<div>` or `<span>` with click handlers (should be `<button>`)
- Images without dimensions
- Large arrays `.map()` without virtualization
- Form inputs without labels
- Icon buttons without `aria-label`
- Hardcoded date/number formats (use `Intl.*`)
- `autoFocus` without clear justification
- Animated GIF when a compressed video would do
- Gesture-only action without a tap/click and keyboard alternative

## Output format

Group by file. Use `file:line` format (clickable in most editors). Terse
findings — state the issue and location, skip explanation unless the fix
isn't obvious, no preamble.

```text
## src/Button.tsx

src/Button.tsx:42 - icon button missing aria-label
src/Button.tsx:18 - input lacks label
src/Button.tsx:55 - animation missing prefers-reduced-motion
src/Button.tsx:67 - transition: all → list properties

## src/Modal.tsx

src/Modal.tsx:12 - missing overscroll-behavior: contain

## src/Card.tsx

✓ pass
```
