# LOVELYCRAFTS DESIGN SYSTEM & MOBILE EXPERIENCE GUIDELINES

## Core Philosophy
1. **Apple Design & Fluidity (Emil Kowalski)**: Interfaces should feel like a physical extension of the person. Animations are spring-based, interruptible, and never start from `scale(0)` (start from `scale(0.95)` with `opacity: 0`).
2. **Mobile Native Baseline**:
   - Touch devices require `-webkit-tap-highlight-color: transparent` and `touch-action: manipulation` on all pressable controls.
   - Text inputs, textareas, and selects must have `font-size: 16px` minimum to eliminate unwanted iOS Safari auto-zoom.
   - Always pad for safe-area insets (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
   - Use `100dvh` for full-screen drawers/modals and `100svh` for above-the-fold heroes.
3. **Typography**:
   - Display headings: `font-family: var(--font-display)` (Playfair Display) with negative tracking (`letter-spacing: -0.02em`) and tight leading (`1.15-1.25`).
   - Clean UI labels & body: `font-family: var(--font-inter)` with normal tracking and comfortable leading (`1.5`).
   - Cursive accents: `font-family: var(--font-cursive)` (Caveat) for personal warmth.
4. **Surfaces & Elevation**:
   - Floating chrome (headers, bottom tab bar, sheets) uses `backdrop-filter: blur(20px) saturate(180%)` with semi-transparent backgrounds and delicate borders (`rgba(255, 255, 255, 0.6)` or `rgba(92, 72, 52, 0.1)`).
   - Soft, organic shadows (`0 8px 24px -4px rgba(47, 34, 21, 0.08)`) instead of heavy opaque outlines.
5. **Motion Tokens**:
   - `--ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` (instant feedback, snappier than default browser curves).
   - `--ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)`.
   - `--ease-drawer`: `cubic-bezier(0.32, 0.72, 0, 1)`.
   - Micro-interactions (buttons, pills, tabs): 120ms–160ms with `:active { transform: scale(0.97); }`.
   - Modals and sheets: 250ms–350ms springs with momentum projection and rubber-banding.
   - Always respect `@media (prefers-reduced-motion: reduce)`.
