# Collier Township Project Tracker — Style Reference
> civic navy on clean slate

**Theme:** light

The Collier Township Project Tracker renders government information as clean, trustworthy civic interface — a deep navy header anchors an otherwise bright white canvas, while a curated set of blues (#0d2240 deep navy, #2563eb interactive blue, #0f2d59 heading navy) carry authority without heaviness. Card surfaces are crisp white with hairline `#e2e8f0` borders, sitting on a cool slate background (#f8fafc mobile, #ffffff web). Typography is single-family Poppins across every surface and platform, weight-driven from 700 bold headings to 400 regular body, creating visual hierarchy through mass rather than font variety. The system avoids decoration — no gradients, no loud shadows — letting generous spacing, tonal card contrast, and a tight blue-gray palette express civic professionalism. Interactive elements wear blue (#2563eb) and transitions are subtle 0.15s eases; the one exception is the Vote Banner, a deep navy (#0d3266) floating panel that introduces the only dark-on-dark surface in the system.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Deep Navy | `#0d2240` | `--navy` | Navigation bar, primary button fills, discussion tab active state, CTA backgrounds — the dominant dark surface of the system |
| Navy Deep | `#0d3266` | `--navy-deep` | Vote banner background, poll drawer fill — slightly brighter navy used for floating overlay panels |
| Heading Navy | `#0f2d59` | `--color-heading-navy` | Page titles, section headings, card titles on mobile — a warmer navy that reads well at large sizes on white |
| Interactive Blue | `#2563eb` | `--color-interactive-blue` | Follow button text/border, category labels, hover states, official badge text, active link color — the sole functional accent |
| Canvas White | `#ffffff` | `--color-canvas-white` | Web page background, card surfaces, active tab fills, input backgrounds — the default resting surface |
| Soft Slate | `#f8fafc` | `--color-soft-slate` | Mobile page background, scroll view canvas — one step cooler than white for depth |
| Card Surface | `#f1f5f9` | `--color-card-surface` | Tab bar background (mobile), alternating surface for segmented controls |
| Light Gray | `#f3f4f6` | `--color-light-gray` | Sidebar background (web), secondary surface wash |
| Border Gray | `#e2e8f0` | `--color-border-gray` | Card borders, section dividers, input outlines — the universal structural separator |
| Border Light | `#e5e7eb` | `--color-border-light` | Web content borders, discussion bubble outlines, metadata dividers |
| Muted Slate | `#64748b` | `--color-muted-slate` | Timestamps, helper text, secondary labels — mid-weight gray for de-emphasized info |
| Body Gray | `#334155` | `--color-body-gray` | Mobile body text — darker than muted for comfortable reading on white |
| Body Dark | `#374151` | `--color-body-dark` | Web body text, description paragraphs, comment text |
| Action Gray | `#6b7280` | `--color-action-gray` | Inline action controls (reply, like, vote icons) in idle state, external link pill text |
| Heading Black | `#111827` | `--color-heading-black` | Web heading text, metadata values, bold labels — near-black for maximum emphasis |
| Foreground | `#171717` | `--foreground` | Root foreground color — used as the base text color in globals.css |
| Success Green | `#22c55e` | `--color-success-green` | "I support this" vote button, user avatar accent, "agree" poll bar fill |
| Danger Red | `#f87171` | `--color-danger-red` | "I do not support this" vote button, unfollow hover state border |
| Warning Orange | `#f97316` | `--color-warning-orange` | "Disagree" poll result bar fill, opposing vote visualization |
| Neutral Teal | `#a8d8ea` | `--color-neutral-teal` | "Neutral / Unsure" poll bar fill — cool pastel against the navy background |
| Demo Blue | `#003d7a` | `--color-demo-blue` | Choose-demo landing page background, demo card heading text, arrow indicator color |
| Demo Card Light | `#e8edf4` | `--color-demo-card` | Demo card surface on landing page — warm blue-gray |

## Tokens — Typography

### Poppins — The sole typeface powering every surface: navigation headers, display headings, body copy, badge text, button labels, input placeholders, and micro-labels. Four weights (400, 500, 600, 700) create all hierarchy. · `--font-poppins`
- **Source:** Google Fonts (web: `next/font/google`, mobile: `@expo-google-fonts/poppins`)
- **Weights:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Web family names:** `Poppins_400Regular`, `Poppins_500Medium`, `Poppins_600SemiBold`, `Poppins_700Bold`
- **Mobile family names:** `Poppins_400Regular`, `Poppins_500Medium`, `Poppins_600SemiBold`, `Poppins_700Bold`
- **Fallback (web):** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Role:** The single typeface across both platforms. Weight 700 for headings and CTAs, 600 for semi-bold labels and nav text, 500 for medium-emphasis labels and links, 400 for body and helper text.

### Type Scale

| Role | Size | Weight | Line Height | Platform | Token |
|------|------|--------|-------------|----------|-------|
| page-title | 24px | 700 | 30px | mobile | `Poppins_700Bold` |
| page-title | 24px (text-2xl) | 700 (font-bold) | default | web | `text-2xl font-bold` |
| section-heading | 20px (text-xl) | 700 (font-bold) | default | web | `text-xl font-bold` |
| nav-header | 16px | 600 | default | both | `Poppins_600SemiBold` |
| card-heading | 17px | 700 | default | shared | `Poppins_700Bold` |
| body | 14px | 400 | 22px | mobile | `Poppins_400Regular` |
| body | 13-14px | 400 | 1.7 | web | inline |
| tab-text | 13px | 600 | default | mobile | `Poppins_600SemiBold` |
| metadata-label | 12px | 600 | default | web | inline |
| button-text | 13px | 600 | default | both | `Poppins_600SemiBold` |
| badge-text | 10-11px | 600 | default | both | `Poppins_600SemiBold` |
| caption | 12px | 400 | default | both | `Poppins_400Regular` |
| eyebrow-label | 10-11px | 600 | default | mobile | `Poppins_600SemiBold` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** comfortable (mobile), compact (web sidebar/timeline)

### Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Inner gaps, icon-to-text spacing |
| sm | 6-8px | Badge padding, tight element gaps |
| md | 10-14px | Button padding, card internal padding |
| lg | 16-20px | Section padding, card margins, page horizontal padding (mobile: 20px) |
| xl | 24-28px | Hero section padding, section vertical gaps |
| 2xl | 32-40px | Section separators, large vertical spacing |
| 3xl | 48px | Content bottom padding |

### Border Radius

| Element | Value | Platform |
|---------|-------|----------|
| cards (proposal) | 12px | both |
| cards (demo) | 15px | shared |
| buttons (follow) | 9999px (pill) | web |
| buttons (follow) | 20px | mobile |
| tab bar container | 24px | mobile |
| tab buttons | 20px | mobile |
| segmented controls | 8px container, 6px buttons | mobile |
| inputs | 6-8px | both |
| badges | 6-8px | both |
| map container | 12px | both |
| avatars | 50% (circle) | both |
| vote buttons | 9999px (pill) | both |
| comment bubbles | 6px | web |
| external link pills | 9999px | web |
| tooltip | 6px | web |

### Shadows

| Name | Value | Usage |
|------|-------|-------|
| card-hover | `0 4px 12px rgba(0, 0, 0, 0.12)` | Dashboard card hover, demo card hover |
| sidebar-hover | `0 4px 10px rgba(0, 0, 0, 0.1)` | Sidebar project card hover |
| tab-active | `0 1px 2px rgba(0, 0, 0, 0.08)` | Active segmented tab (mobile), elevation: 2 |
| follow-btn | `0 1px 4px rgba(0, 0, 0, 0.18)` | Following button resting state (web) |
| tooltip | `0 4px 12px rgba(0, 0, 0, 0.15)` | Custom tooltip popover |
| vote-banner | `0 8px 32px rgba(0, 0, 0, 0.35)` | Floating vote banner (web) |
| poll-drawer | offset(-4, 0) radius 16, opacity 0.35 | Poll side drawer (mobile) |

### Layout

- **Web page max-width:** 800px (content container within detail page)
- **Web sidebar width:** 288px (collapsible)
- **Web hero image height:** 260px
- **Mobile hero image height:** 200px
- **Web section gap:** 2-2.5rem
- **Mobile page horizontal padding:** 20px
- **Mobile content bottom padding:** 48px
- **Dashboard grid:** 3 columns, 24px gap (web)
- **Dashboard grid:** single column (mobile)
- **Demo cards grid:** 2 columns, 20px gap (web), single column (mobile)

## Components

### Navigation Header Bar
**Role:** Top-level navigation — branding, notifications, profile

Background `#0d2240`, white text. Height ~56px. Title centered in Poppins 600 at 16px. On mobile, right side has notification bell with unread badge counter (red dot) and notification count. Back arrow (chevron.left / arrow_back) for sub-pages. Consistent across web (not implemented as a dedicated component but embedded in layout) and mobile (Expo Router Stack header).

### Demo Card (Landing Page)
**Role:** Role-selection cards on the choose-demo page

Background `#e8edf4`, border-radius 15px, padding 22px. Heading in Poppins 700 at 17px, color `#003d7a`. Description in Poppins 400 at 13px, color `#3a5a80`. Active cards show a right-facing arrow (`→`) inside a 32px circle with 1px `#003d7a` border, 24px margin-left from text. Disabled cards show at 0.55 opacity with a "COMING SOON" badge (background `rgba(0, 61, 122, 0.5)`, white text, 8px radius). Web hover: background shifts to `#d6dde8`, gains `boxShadow` and a 1.5px `#003d7a` outline. Pressed state: 0.9 opacity.

### Proposal Card (Dashboard)
**Role:** Clickable project summary cards in the dashboard grid

Shared component re-exported from `shared/components/ProposalCard.tsx`. Image at top (h-44 / 176px, object-cover), title and description below. Follow/Following pill badge positioned absolute top-right of image. On web, follow badge appears on hover for unfollowed cards, always visible for followed. Card hover dims image to `brightness(0.62)` and turns title blue (`#2563eb`). Web-specific: uses `card-follow-btn` CSS class for hover-reveal behavior.

### Follow / Following Button
**Role:** Toggle follow state on proposals

Pill-shaped (9999px web, 20px mobile). Three states:
1. **Unfollowed:** White background, `#2563eb` text/border, "+ Follow Project" text
2. **Following:** `#0d2240` background, white text/border, "✓ Following" text, subtle shadow
3. **Unfollow hover (web only):** `#fef2f2` background, `#dc2626` text/border, "✕ Unfollow" text

Transition: background/color 0.15s ease. Custom tooltip on web reads "Get notifications and saves to Your Following Projects in home page".

### Segmented Tab Bar
**Role:** Content tab switcher — Overview / Timeline / Feedback (mobile proposal), Private / Public (feedback sub-tabs)

Container: rounded rectangle (`#f1f5f9` mobile tab bar, `#e2e8f0` feedback segment bar), 4px padding, pill radius (24px outer, 20px inner buttons). Active tab: white background with subtle shadow (elevation 2 mobile). Inactive tab: transparent. Text: Poppins 600 at 13px, active color `#0f2d59`, inactive `#64748b`. Web discussion uses flat border-tab style: active = `#0d2240` fill with white text, inactive = white with gray text.

### Discussion / Comments
**Role:** Public comment threads with replies, voting, and inline reply forms

Comment structure: Avatar (32px circle, colored background, white initial) → name (600 weight, 13px) + optional OFFICIAL badge (blue background, white caps text) → timestamp (12px gray) → message bubble (1px `#e5e7eb` border, 6px radius, 10px 14px padding, 13px text in `#374151`). Action row below: Reply, Like, Dislike icons in `#6b7280` idle → `#2563eb` hover/active. Reply form: textarea with cancel (white, gray border) and submit (`#0d2240` fill, white text, 6px radius) buttons. One-level-deep nesting max — replies indent 24px with a 1.5px left border in `#cbd5e1`.

### Vote Banner (Web)
**Role:** Floating poll voting panel — slides up when discussion section is scrolled into view

Fixed position bottom-right, 380px wide, background `#0d3266`, 16px radius. Three panels: **voting** (three pill buttons: green agree, red disagree, outlined neutral), **results** (SVG pie chart with legend, "Edit my vote" white button), and **chip** (minimized 198×44px pill). Draggable vertically via mouse drag handle with `DragHandleIcon`. Animated entry: `slideUp` keyframe at 0.4s cubic-bezier. Minimize button in top-right corner.

### Poll Drawer (Mobile)
**Role:** Slide-in poll voting panel from the right edge — mobile equivalent of Vote Banner

Animated.View sliding from right, 82% screen width, background `#0d3266`. Floating tab on right edge: `#0d3266` pill with drag dots (3×2 grid of 3px white dots), 📊 emoji, and "Vote"/"Results" label. Tab is vertically draggable via PanResponder with spring animation, visual feedback (1.08 scale, color shift to `#1e3a8a` while dragging). Drawer contains voting buttons (same green/red/outlined layout as web) or results view with horizontal bar charts instead of pie chart. Backdrop overlay at `rgba(0,0,0,0.35)`.

### Sidebar (Web)
**Role:** Collapsible project navigation sidebar on proposal detail page

288px width, `#f3f4f6` background, `#e5e7eb` right border, sticky `top: 0`, full viewport height. Collapsible via chevron toggle button. Projects grouped by functional category with accordion expand/collapse (ChevronDownIcon rotation). Each project card shows title, category, stage badge, and active indicator. Current project highlighted with left border accent. Hover: `translateY(-1px)` + shadow.

### Timeline (Web)
**Role:** Vertical stage timeline with descriptive cards

Left column: vertical line with stage indicators (completed = green checkmark circle, current = pulsing blue dot, future = gray hollow). Right column: description cards with stage label, date, description text, and bullet points. State-driven hover: hovering either side highlights both the indicator and the card (managed via `hoveredIdx` React state, not CSS :hover). Transitions: background 0.15s, border-color 0.3s, box-shadow 0.15s, transform 0.15s.

### Timeline (Mobile)
**Role:** Vertical stage timeline adapted for single-column mobile layout

Same structure as web but rendered in React Native StyleSheet. Stage indicators: completed (green circle with SymbolView checkmark), current (navy circle with white inner dot), future (gray circle). Connected by vertical lines. Description cards: white background, 1px `#e2e8f0` border, 12px radius, padding 14px. CURRENT badge: navy background, white text, small pill.

### Notification Item (Mobile)
**Role:** Swipeable notification rows with mark-as-unread action

Swipeable right-to-reveal via PanResponder. Unread items: bold title (Poppins_700Bold). Read items: regular weight title (Poppins_400Regular). Swipe threshold: 80px to snap open, 160px to auto-trigger. Behind-card action: "Mark Unread" stacked text on blue background. Spring animation: tension 40, friction 7. Long-press also reveals the action button.

### Tooltip (Web)
**Role:** Contextual help popover on interactive elements

Positioned above trigger (bottom: calc(100% + 8px)), `#1e293b` background, white text, 11px/600 weight, 6px 10px padding, 6px radius, shadow. Arrow: 5px CSS border triangle. Right-aligned variant available via `.tooltip-align-right`. Show on hover with 0.15s opacity transition.

### External Link Pill
**Role:** Outbound resource links (project link, meeting notes)

Pill shape (9999px radius), 1px `#e5e7eb` border, white background, `#6b7280` text, 12px/500 weight, 6px 14px padding. ExternalLinkIcon (15px) left-aligned. No hover background change.

### Avatar
**Role:** User identity in comment threads

32px circle, colored background (per-user color from data), white initial letter (12px, 700 weight). Mobile equivalent: 28px circle in StyleSheet.

### Input Field
**Role:** Search bars, comment composers, reply text areas

Background white, 1px `#e2e8f0` border (mobile) or `#e5e7eb` (web), 6-8px radius. Placeholder in `#94a3b8` (mobile) or `#9ca3af` (web). Text: 13px Poppins 400 in `#1e293b`. Focus state: no visual change beyond browser/platform default.

## Do's and Don'ts

### Do
- Use `#0d2240` as the sole dark surface for navigation bars, primary action buttons, and active tab fills — never introduce a second dark surface tone.
- Set all headings in Poppins 700, all labels/buttons in Poppins 600, all body text in Poppins 400 — the weight IS the hierarchy; never rely on size alone.
- Use `#2563eb` as the single interactive accent for links, hover states, follow buttons, and official badges — never promote it to a surface fill.
- Apply `#e2e8f0` (mobile) or `#e5e7eb` (web) as the universal hairline border — never use colored borders except for follow button states.
- Build card elevation from tonal contrast (white card on slate/gray background) rather than shadow — shadows are reserved for hover feedback and floating panels.
- Use pill radius (9999px) for all action buttons and external link badges; use 12px for content cards; use 15px for demo cards; use 6-8px for inputs and comment bubbles.
- Transition interactive states at 0.15s ease — this is the system's signature timing.
- Use `Animated.spring` with `tension: 40, friction: 7` for mobile swipe-to-reveal and snap animations — this is the established spring profile.
- Use `PanResponder` for all custom drag/swipe gestures on mobile — never use `Gesture Handler` since it is not installed.
- Keep mobile page horizontal padding at 20px consistently across all tab views.

### Don't
- Do not introduce additional typefaces — Poppins is the only font. No serif, no monospace, no display faces.
- Do not use pure `#000000` for text — the system uses warm near-blacks (#111827, #171717, #0f2d59) and grays (#334155, #374151).
- Do not add gradients to any surface or button — the system is flat with tonal contrast.
- Do not use elevation/shadow as the primary card separation method — reserve shadows for hover states and floating overlays only.
- Do not place interactive blue (#2563eb) as a background fill — it is text/border/icon only; `#0d2240` is the filled action color.
- Do not use `useNativeDriver: true` in Animated calls when running on Expo web — it logs a console warning. The codebase keeps it for native compatibility but accept the web warning.
- Do not nest replies more than one level deep in comment threads — the system enforces single-depth threading.
- Do not use CSS `:hover` for cross-element highlight effects — use React state (e.g. `hoveredIdx`) to synchronize hover across disconnected DOM elements (timeline left/right sync).
- Do not introduce red/danger colors outside of vote "disagree" and "unfollow" contexts — the system rations chromatic color.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas White | `#ffffff` | Web page background, card fills, active tab surfaces |
| 0.5 | Soft Slate | `#f8fafc` | Mobile page background — cooler base for card contrast |
| 1 | Card Surface | `#f1f5f9` | Tab bar background, segmented control background, alternating wash |
| 1.5 | Light Gray | `#f3f4f6` | Sidebar background, secondary panels |
| 2 | Deep Navy | `#0d2240` | Navigation bar, primary buttons, active tab fills |
| 3 | Navy Deep | `#0d3266` | Vote banner, poll drawer — floating dark overlays |
| 4 | Demo Blue | `#003d7a` | Choose-demo page background — full-bleed dark blue |

## Elevation

- **Resting cards:** No shadow — separation through tonal contrast only
- **Hovered cards (web):** `0 4px 12px rgba(0, 0, 0, 0.12)` + optional outline
- **Sidebar project hover:** `0 4px 10px rgba(0, 0, 0, 0.1)` + `translateY(-1px)`
- **Active segmented tab (mobile):** `shadowOpacity: 0.08, shadowRadius: 2, elevation: 2`
- **Following button (web):** `0 1px 4px rgba(0, 0, 0, 0.18)`
- **Vote banner (web):** `0 8px 32px rgba(0, 0, 0, 0.35)` — the heaviest shadow in the system
- **Poll drawer (mobile):** `shadowOffset: {-4, 0}, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10`

## Imagery

Hero images are full-width photography at 260px (web) or 200px (mobile), object-fit cover, placed at the top of proposal detail pages. Dashboard cards use cropped images at h-44 (176px). On hover, card images dim to `brightness(0.62)` while the title turns blue — the image serves as a backdrop for the interactive overlay. No decorative illustrations, no icons as imagery, no background patterns. Maps use OpenStreetMap iframe embeds (web) or Image-based fallbacks (mobile), contained in 12px-radius bordered containers.

## Interaction Patterns

### Swipe-to-Reveal (Mobile Notifications)
Horizontal PanResponder gesture on notification items. Right-swipe reveals "Mark Unread" action behind the card. Threshold: 80px to snap open (spring: tension 40, friction 7), 160px to auto-trigger action. Resistance at 140px+ (35% dampening). Long-press also opens the action. Closing: spring back to 0.

### Draggable Poll Tab (Mobile)
Vertical PanResponder on the floating poll tab. Press activates drag (isDraggingTab state). Visual feedback: scale 1.08, background shift `#0d3266` → `#1e3a8a`. Release clamps position between -45% and +35% of screen height, snaps via spring (tension 80, friction 12). Tap discriminator: if total movement < 5px in both axes, treat as tap to open drawer.

### Poll Drawer Slide-in (Mobile)
`Animated.spring` entrance (tension 65, friction 11) translating from screen width to 0. Exit: `Animated.timing` 250ms back to screen width. Backdrop: `rgba(0,0,0,0.35)` touchable overlay that dismisses on tap.

### Vote Banner Morph (Web)
Three-state morph: voting panel → results panel → chip (minimized). Entry: `slideUp` keyframe animation at 0.4s with cubic-bezier(0.22, 1, 0.36, 1). Triggered by IntersectionObserver when discussion section enters top 20% of viewport (rootMargin: "0px 0px -80% 0px"). Vertically draggable via mousedown/mousemove/mouseup handlers.

### Card Hover (Web Dashboard)
CSS-driven multi-element hover: `.card:hover .card-img` dims, `.card:hover .card-title` turns blue, `.card:hover .card-follow-btn:not(.is-following)` reveals hidden follow badge. No JavaScript state needed — pure CSS cascade.

### Follow Button State Machine
Three visual states with animated transitions (background/color 0.15s):
1. Unfollowed → blue outline pill
2. Following → solid navy pill with shadow
3. Hover while following → red danger outline (web only; mobile uses simple toggle)

### Timeline Synchronized Hover (Web)
React state (`hoveredIdx`) drives simultaneous highlight of timeline indicator (left) and description card (right). Cannot use CSS `:hover` because the two elements are in separate DOM branches. Transition classes `.tl-item` and `.tl-card` provide the animation timing.

## Layout

### Web — Dashboard
Full-width header (`#0d2240`). Content area: centered container with search bar, category/department filters, sort controls, and "Include Archived" toggle at top. Below: sectioned grid of proposal cards (3 columns, 24px gap). "Your Following" dynamic section at top, followed by functional category sections.

### Web — Proposal Detail
Three-column structure: collapsible sidebar (288px, left) + main content (flex: 1, center) + floating vote banner (fixed, bottom-right). Main content: hero image → title/follow/metadata → description → funding/details grid → metadata strip (3-col grid with vertical dividers) → map → timeline → discussion. Content capped at 800px max-width, centered.

### Mobile — Dashboard
Stack navigation with `#0d2240` header. All/Followed toggle tabs at top. Search bar + collapsible filters below. Single-column scrolling card list, grouped by sections. Cards show image, title, description, stage badge.

### Mobile — Proposal Detail
Stack navigation with back arrow. Hero image full-width at top. Segmented tab bar (Overview / Timeline / Feedback) below the title/follow section. Content scrolls within each tab. Poll tab floats on right edge during Feedback tab (draggable, opens side drawer).

## Platform Differences

| Feature | Web (Next.js) | Mobile (Expo/React Native) |
|---------|---------------|---------------------------|
| Font loading | `next/font/google` Poppins | `@expo-google-fonts/poppins` with `useFonts` |
| Styling | Inline styles + Tailwind CSS utilities + globals.css | React Native `StyleSheet.create` |
| Navigation | Next.js App Router (`<Link>`) | Expo Router (`router.push/back`) |
| Dashboard grid | 3-column CSS grid | Single-column ScrollView |
| Proposal layout | Sidebar + main + floating banner | Stack screens with segmented tabs |
| Vote interface | Floating bottom-right panel with pie chart | Right-edge drawer with bar charts |
| Follow hover | Three-state (follow/following/unfollow) with hover | Two-state toggle (no hover) |
| Card hover effects | CSS `:hover` cascade | `TouchableOpacity` press feedback |
| Map | OpenStreetMap `<iframe>` | `<Image>` fallback |
| Icons | Custom SVG components (`icons.tsx`) | `expo-symbols` SymbolView |
| Swipe gestures | N/A | PanResponder-based |
| Tooltips | CSS hover tooltips | N/A |

## Agent Prompt Guide

Quick Color Reference:
- nav/header: #0d2240
- text (heading): #0f2d59 (mobile), #111827 (web)
- text (body): #334155 (mobile), #374151 (web)
- text (muted): #64748b
- text (link/accent): #2563eb
- border: #e2e8f0 (mobile), #e5e7eb (web)
- background (canvas): #ffffff (web), #f8fafc (mobile)
- background (card surface): #f1f5f9
- accent / primary action fill: #0d2240 (filled button)
- accent / interactive: #2563eb (text/border only)

Example Component Prompts:

1. Create a Primary Button: `#0d2240` background, `#ffffff` text, 6px radius, padding 8px 18px. Poppins 600 at 12px. Disabled state: 0.65 opacity with `cursor: default`.

2. Create a Follow Pill Button: 9999px radius (web) or 20px radius (mobile), padding 10px 22px, border 2px solid `#2563eb`, `#2563eb` text, white background. Icons: PlusIcon (unfollowed), CheckIcon (following), CloseIcon (unfollow hover).

3. Create a Proposal Card: 12px radius, white background, 1px `#e2e8f0` border. Image area h-44, title at 17px Poppins 700, description at 13px Poppins 400. Follow badge positioned absolute top-right at 10px offset.

4. Create a Segmented Tab Bar: Container `#f1f5f9`, 24px radius outer, 4px padding. Buttons flex: 1, 20px radius, 8px vertical padding. Active: white with shadow. Text: 13px Poppins 600, active `#0f2d59`, inactive `#64748b`.

5. Create a Comment Thread: Avatar (32px circle) left-aligned, name (13px/600 `#111827`) + timestamp (12px `#6b7280`) header, message in bordered bubble (1px `#e5e7eb`, 6px radius, 13px `#374151`). Reply indented 24px with left border 1.5px `#cbd5e1`.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Core Colors */
  --background: #ffffff;
  --foreground: #171717;
  --navy: #0d2240;
  --navy-deep: #0d3266;

  /* Extended Palette */
  --color-heading-navy: #0f2d59;
  --color-interactive-blue: #2563eb;
  --color-canvas-white: #ffffff;
  --color-soft-slate: #f8fafc;
  --color-card-surface: #f1f5f9;
  --color-light-gray: #f3f4f6;
  --color-border-gray: #e2e8f0;
  --color-border-light: #e5e7eb;
  --color-muted-slate: #64748b;
  --color-body-gray: #334155;
  --color-body-dark: #374151;
  --color-action-gray: #6b7280;
  --color-heading-black: #111827;
  --color-success-green: #22c55e;
  --color-danger-red: #f87171;
  --color-warning-orange: #f97316;
  --color-neutral-teal: #a8d8ea;
  --color-demo-blue: #003d7a;
  --color-demo-card: #e8edf4;

  /* Typography */
  --font-poppins: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;
  --spacing-4xl: 48px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 15px;
  --radius-2xl: 20px;
  --radius-3xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-sidebar-hover: 0 4px 10px rgba(0, 0, 0, 0.1);
  --shadow-follow-btn: 0 1px 4px rgba(0, 0, 0, 0.18);
  --shadow-tooltip: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-vote-banner: 0 8px 32px rgba(0, 0, 0, 0.35);

  /* Layout */
  --content-max-width: 800px;
  --sidebar-width: 288px;
  --hero-height-web: 260px;
  --hero-height-mobile: 200px;
  --page-padding-mobile: 20px;
}
```

### React Native StyleSheet Tokens

```typescript
// Core palette — use these values in StyleSheet.create()
const tokens = {
  colors: {
    navy: "#0d2240",
    navyDeep: "#0d3266",
    headingNavy: "#0f2d59",
    interactiveBlue: "#2563eb",
    canvasWhite: "#ffffff",
    softSlate: "#f8fafc",
    cardSurface: "#f1f5f9",
    borderGray: "#e2e8f0",
    mutedSlate: "#64748b",
    bodyGray: "#334155",
    headingBlack: "#111827",
    successGreen: "#22c55e",
    dangerRed: "#f87171",
    warningOrange: "#f97316",
    neutralTeal: "#a8d8ea",
    demoBlue: "#003d7a",
    demoCard: "#e8edf4",
  },
  fonts: {
    regular: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semiBold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 48,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 15,
    "2xl": 20,
    "3xl": 24,
    full: 9999,
  },
  animation: {
    swipeSpring: { tension: 40, friction: 7 },
    dragSpring: { tension: 80, friction: 12 },
    drawerSpring: { tension: 65, friction: 11 },
    drawerExit: { duration: 250 },
    transitionTiming: 150, // ms — standard transition duration
  },
} as const;
```

## Similar Brands

- **City of Pittsburgh** — Government project tracker with navy header, clean white content surfaces, blue interactive accent, and structured card grids
- **Code for America** — Civic-tech interfaces with blue-dominant palette, Poppins/Inter typography, card-based project layouts, and accessible government aesthetics
- **OpenGov** — Government transparency platform with navy branding, white surfaces, clean data presentation, and minimal decorative elements
- **Neighborland** — Community engagement tool with structured card layouts, blue accent colors, comment threading, and municipal branding
