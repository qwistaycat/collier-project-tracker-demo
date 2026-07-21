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
| Interactive Blue | `#2563eb` | `--color-interactive-blue` | Follow button text/border, category labels, hover states, official badge text, active link color, Apply button fill, filter chip text — the sole functional accent |
| Canvas White | `#ffffff` | `--color-canvas-white` | Web page background, card surfaces, active tab fills, input backgrounds, search dropdown panel — the default resting surface |
| Soft Slate | `#f8fafc` | `--color-soft-slate` | Mobile page background, scroll view canvas — one step cooler than white for depth |
| Card Surface | `#f1f5f9` | `--color-card-surface` | Tab bar background (mobile), alternating surface for segmented controls |
| Search Background | `#f9fafb` (gray-50) | `--color-search-bg` | Search results page background — subtle gray wash behind filter sidebar and results grid |
| Light Gray | `#f3f4f6` | `--color-light-gray` | Sidebar background (web), secondary surface wash, image placeholder |
| Border Gray | `#e2e8f0` | `--color-border-gray` | Card borders, section dividers, input outlines — the universal structural separator |
| Border Light | `#e5e7eb` | `--color-border-light` | Web content borders, discussion bubble outlines, metadata dividers |
| Muted Slate | `#64748b` | `--color-muted-slate` | Timestamps, helper text, secondary labels — mid-weight gray for de-emphasized info |
| Body Gray | `#334155` | `--color-body-gray` | Mobile body text — darker than muted for comfortable reading on white |
| Body Dark | `#374151` | `--color-body-dark` | Web body text, description paragraphs, comment text |
| Action Gray | `#6b7280` | `--color-action-gray` | Inline action controls (reply, like, vote icons) in idle state, external link pill text, search icon color, map card toggle inactive |
| Heading Black | `#111827` | `--color-heading-black` | Web heading text, metadata values, bold labels, filter sidebar title, card title — near-black for maximum emphasis |
| Foreground | `#171717` | `--foreground` | Root foreground color — used as the base text color in globals.css |
| Sage Green | `#567A67` | `--color-sage-green` | Replaces all former green usage and decorative accent ambers — "I support this" vote button, supportive sentiment, published/active status, Parks category accent, success checks, avatar accents. Bright greens are retired from the system |
| Sage Tints | `#F2F7F4` / `#E4EDE7` / `#C9DAD0` | — | Light washes and borders derived from Sage Green for supportive chips, status pills, and confidence notes |
| Danger Orange | `#CD481B` | `--color-danger-orange` | Replaces all former red usage — destructive buttons, unfollow hover, "I do not support this" vote button, urgent badges, Public Safety category accent. Red hues are retired from the system |
| Notification Orange | `#CD481B` | `--color-notification-orange` | Notification bell unread dot — same Danger Orange hue |
| Warning Orange | `#FFAA55` | `--color-warning-orange` | Replaces all former yellow/amber warning usage — pending-review highlights, urgency dots, "Disagree" poll bar, lower-confidence notes, Roads category accent. Yellow hues are retired from the system. **Fills, bars, dots, and borders only — never small text** |
| Warning Text | `#B45309` (amber-700) | `--color-warning-text` | Dark companion for warning/mixed-sentiment text, chip labels, and warning icons — `#FFAA55` fails WCAG contrast at text sizes |
| Chart Cyan | `#0891B2` (cyan-600) | `--color-chart-cyan` | Muted cyan for analytics chart series and the Plan/Dev category accent — purple is retired from charts, categories, and statuses (it remains only as the AI-assist signifier) |
| Cyan Tint | `#E0F2F7` | — | Light cyan wash for Plan/Dev category chips |
| Neutral Teal | `#a8d8ea` | `--color-neutral-teal` | "Neutral / Unsure" poll bar fill — cool pastel against the navy background |
| Filter Chip Blue | `#dbeafe` (blue-50) | `--color-filter-chip-bg` | Applied filter chip background — light blue wash |
| Filter Chip Border | `#bfdbfe` (blue-200) | `--color-filter-chip-border` | Applied filter chip border |
| Filter Chip Text | `#1d4ed8` (blue-700) | `--color-filter-chip-text` | Applied filter chip label text |
| Hover Overlay | `rgba(13, 34, 64, 0.55)` | `--color-hover-overlay` | Card image hover overlay — navy-tinted dark scrim with "Click To View" text |
| Avatar Blue | `#60a5fa` | `--color-avatar-blue` | User avatar in Navbar (profile circle) |
| Demo Blue | `#003d7a` | `--color-demo-blue` | Choose-demo landing page background, demo card heading text, arrow indicator color |
| Demo Card Light | `#e8edf4` | `--color-demo-card` | Demo card surface on landing page — warm blue-gray |
| Staff Navy | `#1e3a5f` | `--color-staff-navy` | Township portal top navigation bar background |
| AI Purple | `#7c3aed` | `--color-ai-purple` | Purple accent for active AI Assistant features, toggles, badges, and suggested items |
| AI Light Wash | `#f5f3ff` (purple-50) | `--color-ai-wash` | Soft lavender background wash for AI alerts, summaries, and suggestions |
| AI Border Light | `#ddd6fe` (purple-200) | `--color-ai-border-light` | Light purple borders for AI-completed boxes |
| AI Border Dark | `#c4b5fd` (purple-300) | `--color-ai-border-dark` | Active border for AI toggle button |
| AI Text Deep | `#5b21b6` (purple-800) | `--color-ai-text-deep` | Deep purple text for AI-generated notes and summaries |
| Disabled Slate Blue | `#94a3b8` (slate-400) | `--color-disabled-slate` | Text and icons in disabled or processing states — a greyed-out slate blue paired with a `#e2e8f0` fill on disabled buttons. Never use gray-purple (or any purple tint) for disabled/processing states |
| Processing Wash | `#eff3f8` | `--color-processing-wash` | Soft slate-blue surface highlight for in-progress states (e.g. the AI document-reading glow) and selected rail items |
| Danger Tints | `#FBF0EA` / `#F9E3D8` / `#F2C6B3` / `#F2B49C` | — | Washes and borders derived from Danger Orange for alert cards, changes-requested banners, and danger-outline buttons |
| Warning Tints | `#FFFAF4` / `#FFF6EC` / `#FFEEDD` / `#FFD5AA` | — | Washes and borders derived from Warning Orange for pending-review bands, urgency chips, and quoted passages |

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

### Navbar (Web)
**Role:** Global header with search entry, navigation, notifications, and profile

Background `#0d2240`, height 56px, `position: relative`, `zIndex: 30`. Left: HomeIcon + "Home" link (14px, 600 weight, white). Right group: search input (300px, pill 9999px radius, white background, 13px placeholder, `focus:ring-2 focus:ring-blue-500`), clear button (CloseIcon when text present), BellIcon with `#CD481B` notification dot (8px circle, absolute top-right), profile avatar (32px circle, `#60a5fa`, white initial, 14px/600). Search input focus or icon click opens `SearchDropdownPanel` mega-menu below header. Typing + Enter navigates to `/search`. Escape or backdrop click closes panel. Dimmed backdrop: `rgba(0, 0, 0, 0.4)`, fixed from top:56 to bottom.

### Navigation Header Bar (Mobile)
**Role:** Mobile navigation header — branding, notifications, back navigation

Background `#0d2240`, white text. Height ~56px. Title centered in Poppins 600 at 16px. Right side has notification bell with unread badge counter (red dot) and notification count. Back arrow (chevron.left / arrow_back) for sub-pages via Expo Router Stack header.

### Search Dropdown Panel (Web)
**Role:** Mega-menu that expands below the Navbar when the search input is focused or icon is clicked

Full-width, absolute positioned below header, white background, `shadow-xl`, `zIndex: 50`. Two-column layout: **Left** (two sub-columns, 220px each, gap-12): Category/Department/Region facets rendered as single-click text lists (not checkboxes). Section titles: 12px bold uppercase `text-gray-900/45` with `tracking-wide`. Options: 13.5px `text-gray-700`, `hover:text-blue-600` transition. Clicking a facet replaces all filters with that single value and navigates to `/search`. **Right** (flex-1): "Recently Viewed Projects" section header with "View all" link (13px semibold blue-600). Grid of 3 recent project mini-cards (h-24 image, 10.5px blue category label, 12.5px semibold title, 10.5px gray timestamp). Cards have `border-gray-900/10`, `hover:border-blue-300 hover:shadow-sm`, image scales 1.05 on hover.

### Filter Sidebar (Web /search)
**Role:** Left-column faceted filter panel on the search results page

312px width, sticky `top: 1.5rem`, white background, `rounded-xl`, `border-gray-900/10`, `shadow-sm`, overflow hidden. Header row: "Selected Filters" title (17px bold) + single action button that morphs between "Apply" (blue-600 fill, white text, disabled at 40% opacity) and "Reset" (white background, gray border). Body: Category/Department/Region checkbox groups, always expanded (no collapse). Section titles: 12.5px bold uppercase `text-gray-900/50`. Checkboxes: 16px square, `text-blue-600`, `focus:ring-blue-500`. Sections divided by `border-gray-900/10` top borders.

### Applied Filters Bar (Web /search)
**Role:** Header row above search results showing page title, result count, sort control, and removable filter chips

Flush with page background (no card wrapper), bottom border `border-gray-900/10`. Row 1: page title (28px bold, `tracking-tight`) + result count (sm, `text-gray-900/55`) ... Sort pill (right: pill border `border-gray-900/12`, white background, 13.5px, select dropdown for Newest/Oldest). Row 2 (conditional): removable FilterChips in a flex wrap row with gap-2.

### Filter Chip (Web)
**Role:** Removable pill for each committed filter value

Pill shape (`rounded-full`), `border-blue-200`, `bg-blue-50`, `text-blue-700`, sm text. Close button: CloseIcon 10px, `text-blue-400 hover:text-blue-600`. Keyword chips have a leading SearchIcon (11px, `text-blue-400`). Clicking × commits removal immediately — no Apply needed.

### Project Map Card (Web)
**Role:** Combined info + map/photos viewer on proposal detail page (replaces old standalone map iframe)

Flex row, 12px radius, 1px `#e5e7eb` border, min-height 360px. **Left column** (260px): project title (18px/700), metadata rows (sponsor department, duration, estimated cost) with 11px uppercase gray labels and 14px values. Toggle buttons at bottom: Map/Photos (34px square, 8px radius, active = navy fill + white icon, inactive = white + gray border). **Right column** (flex-1): OpenStreetMap iframe (map mode) or photo carousel (photos mode). Carousel has prev/next chevron buttons (32px circles, `rgba(0,0,0,0.55)` background, white icons), touch swipe support, dot indicators at bottom. Photos count displayed as "Photo 1/3" label.

### Demo Card (Landing Page)
**Role:** Role-selection cards on the choose-demo page

Background `#e8edf4`, border-radius 15px, padding 22px. Heading in Poppins 700 at 17px, color `#003d7a`. Description in Poppins 400 at 13px, color `#3a5a80`. Active cards show a right-facing arrow (`→`) inside a 32px circle with 1px `#003d7a` border, 24px margin-left from text. Disabled cards show at 0.55 opacity with a "COMING SOON" badge (background `rgba(0, 61, 122, 0.5)`, white text, 8px radius). Web hover: background shifts to `#d6dde8`, gains `boxShadow` and a 1.5px `#003d7a` outline. Pressed state: 0.9 opacity.

### Proposal Card (Dashboard)
**Role:** Clickable project summary cards in the dashboard and search results grids

Shared component from `shared/components/ProposalCard.tsx`. Image container (160px height, `#f3f4f6` placeholder background), body with meta row (category in blue 11px/600 · department in gray 11px/500 · updated in light gray 11px), title (15px/600, `#111827`), description (13px/400, `#6b7280`). Web resting shadow: `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)`, `border: 1px solid #e5e7eb`. **Hover overlay:** navy-tinted scrim (`rgba(13, 34, 64, 0.55)`) covers image area with centered "Click To View Project Detail" text (14px/400 white, 60% opacity). Card hover border shifts to `#2563eb`, shadow increases. Follow button (pill, absolute top-right): unfollowed = white/gray border, following = `#2563eb` fill/white text, following+hover = `#CD481B` fill ("✕ Unfollow"), unfollowed+hover = `#eff6ff` fill/blue border. Button visibility: only shown when card is hovered or already following. `onPress` callback supports `recordView` for recently-viewed tracking.

### Follow / Following Button
**Role:** Toggle follow state on proposals

Two variants exist:

**Proposal Detail Page (web):** Pill-shaped (9999px), padding 10px 22px, border 2px. Three states:
1. **Unfollowed:** White background, `#2563eb` text/border, "+ Follow Project" with PlusIcon
2. **Following:** `#0d2240` background, white text/border, "✓ Following" with CheckIcon, shadow `0 1px 4px rgba(0,0,0,0.18)`
3. **Unfollow hover:** `#FBF0EA` background, `#CD481B` text/border, "✕ Unfollow" with CloseIcon

**Proposal Card (shared):** Pill-shaped (9999px), padding 6px 14px, border 1px. Compact labels: "+ Follow" / "✓ Following" / "✕ Unfollow". Colors: unfollowed = white/`#e5e7eb` border, following = `#2563eb` fill, following+hover = `#CD481B` fill, unfollowed+hover = `#eff6ff`/`#2563eb` border. Follow press clears hover to prevent label jump.

Transition: background/color/border 0.15s ease. Custom tooltip on detail page reads "Get notifications and saves to Your Following Projects in home page".

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

### Staff Navbar (Web)
**Role:** Top-level navigation and utility header for the Township Staff portal

Background `#1e3a5f`, height 58px, z-index 40, sticky top, with a `0 1px 0 rgba(255,255,255,.06)` bottom border. Left: "Collier Connect | Staff" with white text. Center: Nav tabs (Projects, Feedback, Insights, Reports) styled as 34px buttons with 13px padding, active tab has `rgba(255,255,255,.14)` fill and white text, inactive has transparent background and `#CBD5E1` text. Right group: "Preview Resident View" button (34px, 20px radius, transparent fill, `#ffffff` border/text), "AI Assistance" toggle button (active = purple fill/border, inactive = transparent fill, white text), notification bell with red unread badge ("4"), and profile pill showing "Amy Medway" with blue initials circle (AM) and department. Profile click opens a 230px dropdown menu (`border-gray-900/10`, white background, `shadow-xl`).

### AI Assistance Toggle
**Role:** Portal-wide switch that toggles the AI-assisted sentiment analysis and summaries

Active state: background `#7C3AED` (solid purple), border `#7C3AED`, white text, lavender dot (`#C4B5FD`). Inactive state: background `rgba(255,255,255,.06)`, border `rgba(255,255,255,.2)`, white text, slate dot (`#64748B`). Layout: height 34px, 14px padding, 20px radius, 12.5px font size, 600 weight. Transitions: background/border 0.3s.

### Insights Dashboard (Staff)
**Role:** Analytics portal for monitoring resident engagement volumes and sentiments

Contains two views driven by the AI Assistance Toggle:
1. **AI Assistance OFF:** Sentiment column in projects table shows grey progress bars indicating relative comment volume; Overall Sentiment shows "Not classified" gray label; Top Theme column shows "AI Assistance required" with warning icon.
2. **AI Assistance ON:** Sentiment column shows sage (`#567A67`), orange (`#FFAA55`), and red (`#CD481B`) segmented bars representing supportive, mixed, and concerns percentages; Overall Sentiment shows color-coded text (Supportive, Mixed, Concerns, or Split); Top theme displays AI-generated summary sentence.
Page also features: (1) Filter dropdowns (Timeframe, Scope, Status) with white backgrounds and `#E2E8F0` borders, (2) Metrics bar (Projects, Comments, Residents, Overall Sentiment segments, Response Rate), and (3) Sorted projects grid table.

### Reports Panel (Staff)
**Role:** engagement compiler to compile resident feedback for township board reporting and grant support

Two-column layout under Reports tab. Search input with leading SearchIcon (18px, `#94A3B8`), text input `#0F172A` on white background, and category/type filter chips. **AI summary of results** card sits above results (when AI is ON) styled with a lavender-purple gradient background, purple star icon (`#7c3aed`), and deep purple text (`#5b21b6`). Export button (DownloadIcon + "Export") triggers CSV file generation. List of templates includes Road Paving, Park Improvement, Zoning Amendment, Building Renovation, and Comprehensive Plan.

## Do's and Don'ts

### Do
- Use `#0d2240` as the sole dark navy surface for the public/resident portal.
- Use `#1e3a5f` as the dark navy surface for the staff/township portal header — keeping the portals visually distinct at first glance.
- Set all headings in Poppins 700, all labels/buttons in Poppins 600, all body text in Poppins 400 — the weight IS the hierarchy; never rely on size alone.
- Use `#2563eb` as the single interactive accent for public portal links, hover states, follow buttons, and official badges.
- Use `#7c3aed` (solid purple) and `#f5f3ff` (lavender wash) exclusively for AI features, toggles, summaries, and AI-suggested fields.
- Apply `#e2e8f0` (mobile) or `#e5e7eb` (web) as the universal hairline border — never use colored borders except for follow buttons and active AI states.
- Build card elevation from tonal contrast (white card on slate/gray background) rather than shadow — shadows are reserved for hover feedback and floating panels.
- Use pill radius (9999px) for all action buttons and external link badges; use 12px for content cards; use 15px for demo cards; use 6-8px for inputs and comment bubbles.
- Transition interactive states at 0.15s ease — this is the system's signature timing.
- Use `Animated.spring` with `tension: 40, friction: 7` for mobile swipe-to-reveal and snap animations — this is the established spring profile.
- Use `PanResponder` for all custom drag/swipe gestures on mobile — never use `Gesture Handler` since it is not installed.
- Keep mobile page horizontal padding at 20px consistently across all tab views.

### Don't
- Do not introduce additional typefaces — Poppins is the only font. No serif, no monospace, no display faces.
- Do not use pure `#000000` for text — the system uses warm near-blacks (#111827, #171717, #0f2d59) and grays (#334155, #374151).
- Do not add gradients to any surface or button — the system is flat with tonal contrast (with the exception of AI wash overlays and category headers in staff view).
- Do not use elevation/shadow as the primary card separation method — reserve shadows for hover states and floating overlays only.
- Do not place interactive blue (#2563eb) or AI purple (#7c3aed) as a general page background — they are reserved for interactive and AI accents respectively.
- Do not mix the resident dark navy (#0d2240) and the staff navy (#1e3a5f) in the same layout.
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
| 1.5 | Light Gray | `#f3f4f6` | Sidebar background, secondary panels, image placeholder |
| 1.5 | Search BG | `#f9fafb` (gray-50) | Search results page background |
| 2 | Deep Navy | `#0d2240` | Navigation bar, primary buttons, active tab fills, map card active toggle |
| 3 | Navy Deep | `#0d3266` | Vote banner, poll drawer — floating dark overlays |
| 4 | Demo Blue | `#003d7a` | Choose-demo page background — full-bleed dark blue |

## Elevation

- **Resting cards (shared ProposalCard):** `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)` — subtle resting shadow
- **Hovered cards (web):** `0 6px 12px -3px rgba(0,0,0,0.08), 0 3px 5px -2px rgba(0,0,0,0.04)` + blue border
- **Sidebar project hover:** `0 4px 10px rgba(0, 0, 0, 0.1)` + `translateY(-1px)`
- **Filter sidebar:** `shadow-sm` (Tailwind)
- **Search dropdown panel:** `shadow-xl` (Tailwind) — heavy shadow for mega-menu
- **Active segmented tab (mobile):** `shadowOpacity: 0.08, shadowRadius: 2, elevation: 2`
- **Following button (detail page):** `0 1px 4px rgba(0, 0, 0, 0.18)`
- **Vote banner (web):** `0 8px 32px rgba(0, 0, 0, 0.35)` — the heaviest shadow in the system
- **Poll drawer (mobile):** `shadowOffset: {-4, 0}, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10`

## Imagery

Hero images are full-width photography at 260px (web) or 200px (mobile), object-fit cover, placed at the top of proposal detail pages. Dashboard/search cards use 160px image containers with `#f3f4f6` placeholder background. On hover, card image area is covered by a navy-tinted scrim (`rgba(13, 34, 64, 0.55)`) with "Click To View Project Detail" centered text — the overlay replaces the old CSS `brightness(0.62)` dim. No decorative illustrations, no icons as imagery, no background patterns. Maps use OpenStreetMap iframe embeds inside ProjectMapCard (web) with a companion photo carousel mode, or Image-based fallbacks (mobile). Project photos are presented in a carousel with prev/next navigation, swipe support, and dot indicators.

## Interaction Patterns

### Swipe-to-Reveal (Mobile Notifications)
Horizontal PanResponder gesture on notification items. Right-swipe reveals "Mark Unread" action behind the card. Threshold: 80px to snap open (spring: tension 40, friction 7), 160px to auto-trigger action. Resistance at 140px+ (35% dampening). Long-press also opens the action. Closing: spring back to 0.

### Draggable Poll Tab (Mobile)
Vertical PanResponder on the floating poll tab. Press activates drag (isDraggingTab state). Visual feedback: scale 1.08, background shift `#0d3266` → `#1e3a8a`. Release clamps position between -45% and +35% of screen height, snaps via spring (tension 80, friction 12). Tap discriminator: if total movement < 5px in both axes, treat as tap to open drawer.

### Poll Drawer Slide-in (Mobile)
`Animated.spring` entrance (tension 65, friction 11) translating from screen width to 0. Exit: `Animated.timing` 250ms back to screen width. Backdrop: `rgba(0,0,0,0.35)` touchable overlay that dismisses on tap.

### Vote Banner Morph (Web)
Three-state morph: voting panel → results panel → chip (minimized). Entry: `slideUp` keyframe animation at 0.4s with cubic-bezier(0.22, 1, 0.36, 1). Triggered by IntersectionObserver when discussion section enters top 20% of viewport (rootMargin: "0px 0px -80% 0px"). Vertically draggable via mousedown/mousemove/mouseup handlers.

### Card Hover (Web Dashboard & Search)
React state-driven hover via `onHoverIn`/`onHoverOut` on Pressable (react-native-web). `isCardHovered` controls: (1) image overlay scrim appearance, (2) border color shift to `#2563eb`, (3) shadow increase, (4) follow button visibility. Image overlay is a navy-tinted View (`rgba(13, 34, 64, 0.55)`) with centered prompt text. The follow button has its own `isHovered` state for the follow→unfollow label transition. CSS `.card:hover` cascade still used in `globals.css` for older components.

### Follow Button State Machine
Three visual states with animated transitions (background/color 0.15s):
1. Unfollowed → blue outline pill
2. Following → solid navy pill with shadow
3. Hover while following → red danger outline (web only; mobile uses simple toggle)

### Timeline Synchronized Hover (Web)
React state (`hoveredIdx`) drives simultaneous highlight of timeline indicator (left) and description card (right). Cannot use CSS `:hover` because the two elements are in separate DOM branches. Transition classes `.tl-item` and `.tl-card` provide the animation timing.

## Layout

### Web — Dashboard
Navbar (`#0d2240`) with integrated search entry. Content area: `max-w-5xl`, centered, padding 32px horizontal / 40px vertical. Page title "Project Tracking" at 24px bold. Below: sectioned grid of proposal cards (3 columns, 24px gap). "Your Following" dynamic section at top, followed by functional category sections. Search, filtering, and sorting have moved to the Navbar search panel and the dedicated `/search` route — the dashboard is now an unfiltered home view.

### Web — Search Results (/search)
Two-column layout on `bg-gray-50` background, `min-h-[calc(100vh-56px)]`. Left: FilterSidebar (312px, sticky). Right: AppliedFiltersBar (title + count + sort + chips) above a responsive card grid (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`, gap-5). Empty state: large search icon, "No results found" heading, descriptive text, "Reset filters" blue button. Filter semantics: OR within a facet, AND across facets. Sort: real date-based sort against `updatedAt`.

### Web — Proposal Detail
Three-column structure: collapsible sidebar (288px, left) + main content (flex: 1, center) + floating vote banner (fixed, bottom-right). Main content: hero image → title/follow/metadata → description → funding/details grid → ProjectMapCard (combined info + map/photos viewer) → timeline → discussion. Content capped at 800px max-width, centered. ProjectMapCard replaces the old standalone map iframe + metadata strip.

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
| State management | `SearchFilterContext`, `RecentlyViewedContext`, `useFollowedProjects` hook | Local component state, localStorage |
| Dashboard grid | 3-column CSS grid | Single-column ScrollView |
| Search & filters | Navbar search + `/search` route with FilterSidebar | Mobile Filters component (in-page) |
| Proposal layout | Sidebar + main + floating banner | Stack screens with segmented tabs |
| Map/Photos | ProjectMapCard with map/photo toggle + carousel | `<Image>` fallback |
| Vote interface | Floating bottom-right panel with pie chart | Right-edge drawer with bar charts |
| Follow hover | Three-state (follow/following/unfollow) with hover | Two-state toggle (no hover) |
| Card hover effects | React state `onHoverIn`/`onHoverOut` overlay | `TouchableOpacity` press feedback |
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

3. Create a Proposal Card: 12px radius, white background, 1px `#e5e7eb` border. Image area 160px. Meta row: category (11px/600 blue) · department (11px/500 gray) · updated (11px gray). Title 15px/600, description 13px/400. Hover overlay: navy scrim with prompt text. Follow badge pill absolute top-right at 10px offset.

4. Create a Segmented Tab Bar: Container `#f1f5f9`, 24px radius outer, 4px padding. Buttons flex: 1, 20px radius, 8px vertical padding. Active: white with shadow. Text: 13px Poppins 600, active `#0f2d59`, inactive `#64748b`.

5. Create a Comment Thread: Avatar (32px circle) left-aligned, name (13px/600 `#111827`) + timestamp (12px `#6b7280`) header, message in bordered bubble (1px `#e5e7eb`, 6px radius, 13px `#374151`). Reply indented 24px with left border 1.5px `#cbd5e1`.

6. Create a Filter Sidebar: 312px sticky white card, `rounded-xl`, `border-gray-900/10`. Header: "Selected Filters" (17px bold) + Apply/Reset morphing button. Checkbox groups: title 12.5px bold uppercase `gray-900/50`, 16px checkboxes with `text-blue-600`. Sections divided by `border-gray-900/10`.

7. Create a Filter Chip: `rounded-full`, `border-blue-200`, `bg-blue-50`, `text-blue-700`. CloseIcon (10px) `text-blue-400 hover:text-blue-600`. Optional leading icon for keyword chips.

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
  --color-sage-green: #567A67;
  --color-danger-orange: #CD481B;
  --color-notification-orange: #CD481B;
  --color-warning-orange: #FFAA55;
  --color-neutral-teal: #a8d8ea;
  --color-filter-chip-bg: #dbeafe;
  --color-filter-chip-border: #bfdbfe;
  --color-filter-chip-text: #1d4ed8;
  --color-hover-overlay: rgba(13, 34, 64, 0.55);
  --color-avatar-blue: #60a5fa;
  --color-demo-blue: #003d7a;
  --color-demo-card: #e8edf4;
  --color-staff-navy: #1e3a5f;
  --color-ai-purple: #7c3aed;
  --color-ai-wash: #f5f3ff;
  --color-ai-border-light: #ddd6fe;
  --color-ai-border-dark: #c4b5fd;
  --color-ai-text-deep: #5b21b6;

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
  --shadow-card-rest: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-card-hover: 0 6px 12px -3px rgba(0, 0, 0, 0.08), 0 3px 5px -2px rgba(0, 0, 0, 0.04);
  --shadow-sidebar-hover: 0 4px 10px rgba(0, 0, 0, 0.1);
  --shadow-follow-btn: 0 1px 4px rgba(0, 0, 0, 0.18);
  --shadow-tooltip: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-vote-banner: 0 8px 32px rgba(0, 0, 0, 0.35);

  /* Layout */
  --content-max-width: 800px;
  --sidebar-width: 288px;
  --filter-sidebar-width: 312px;
  --hero-height-web: 260px;
  --hero-height-mobile: 200px;
  --card-image-height: 160px;
  --page-padding-mobile: 20px;
  --search-max-width: 80rem; /* max-w-7xl for search dropdown */
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
    borderLight: "#e5e7eb",
    mutedSlate: "#64748b",
    bodyGray: "#334155",
    headingBlack: "#111827",
    actionGray: "#6b7280",
    sageGreen: "#567A67",
    dangerOrange: "#CD481B",
    notificationRed: "#CD481B",
    warningOrange: "#FFAA55",
    neutralTeal: "#a8d8ea",
    hoverOverlay: "rgba(13, 34, 64, 0.55)",
    avatarBlue: "#60a5fa",
    demoBlue: "#003d7a",
    demoCard: "#e8edf4",
    staffNavy: "#1e3a5f",
    aiPurple: "#7c3aed",
    aiWash: "#f5f3ff",
    aiBorderLight: "#ddd6fe",
    aiBorderDark: "#c4b5fd",
    aiTextDeep: "#5b21b6",
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
