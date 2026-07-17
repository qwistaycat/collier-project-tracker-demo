---
name: verify
description: Build, launch, and drive the my-app Next.js web app (resident portal + /staff township portal) to verify changes end-to-end.
---

# Verifying my-app (Next.js 16)

## Build / launch

```bash
cd my-app
npx tsc --noEmit          # typecheck
npx eslint app/<dir>      # lint (npm run lint == bare `eslint`; don't use `next lint`)
npm run build             # production build
npm run dev               # dev server — NOTE: daemonizes itself, prints "Run kill <pid> to stop it"
```

Gotchas:
- `npm run dev -- --port NNNN` is ignored; the daemon binds **port 3000**. Find it with
  `lsof -nP -iTCP -sTCP:LISTEN | grep next` and stop it with the printed `kill <pid>`.
- The dev overlay renders a small dark "N" button on the left edge — it's Next.js devtools,
  not app UI.
- React StrictMode double-invokes state updaters in dev: side effects (toasts) inside
  `setState(fn)` fire twice. Keep effects outside updaters.

## Driving the UI

No Playwright in the repo. Install `playwright-core` in a scratch dir and launch system
Chrome directly:

```js
const { chromium } = require("playwright-core");
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
```

## Flows worth driving

- `/staff`: Sign In → gallery (pending-review queue only for Manager's Office dept) →
  navbar search → Insights (toggle AI Assistance OFF/ON changes sentiment columns) →
  project detail (stage editor dirty-state + nav guard, Feedback moderation queue,
  Poll Results) → Preview as Resident → + New Project wizard (AI sample → extraction →
  review → timeline → compliance checklist gates Publish) → Reports (4 sub-tabs) →
  profile menu → Trash.
- Selector traps: "Pending Review" matches both the status filter chip and the queue
  header — assert the queue via its unique "Review all →" link; the queue's "Review"
  buttons need `{ name: "Review", exact: true }`.
- `/` → choose demo; `/dashboard` → resident portal; search lives in the navbar.
