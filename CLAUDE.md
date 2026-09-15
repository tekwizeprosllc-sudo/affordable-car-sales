# Affordable Car Sales — dev notes

## Canonical directory
This directory (`/home/me/affordable-car-sales`) is the one connected to
`origin/main` on GitHub and is the one to edit. There are other similarly-named
directories on this machine (`/home/me/projects/affordable-car-sales`,
`/home/me/affordable-ai-dealership`, `/home/me/websites/affordable`) — they are
NOT this repo. Don't assume they're in sync with this one.

## Dev server
Launch config name is `acs-main-dev` (renamed from the generic
`affordable-car-sales-dev` because the `/home/me/projects/affordable-car-sales`
duplicate had an identical name and port 3000, which caused `preview_start`
to sometimes attach to the wrong directory's server). If a preview ever shows
content that doesn't match the source on disk, check `fuser 3000/tcp` and
`ls -la /proc/<pid>/cwd` before debugging further — it's probably pointed at
the wrong process, not a caching bug.

## Git push
`git push` over the default HTTPS remote fails in this sandbox — no stored
credentials (`fatal: could not read Username for 'https://github.com'`).
SSH auth to GitHub as `tekwizeprosllc-sudo` already works. Push with:

```bash
git push git@github.com:tekwizeprosllc-sudo/affordable-car-sales.git main
```

(This doesn't change the configured `origin` remote, which stays HTTPS.)

## Before pushing
Always `git fetch` and check how far behind `origin/main` the local branch is
first — this repo has had long-lived local checkouts fall many commits behind,
including at least one security fix. Merge/rebase onto latest main rather than
force-pushing a stale branch.

## Don't run `npm run build` while the dev server is running
Both `next dev` and `next build` write to the same `.next/` directory. Running
a build while a `next dev` process is up corrupts its in-memory asset manifest
— the dev server keeps responding 200 to page requests but 404s on CSS/JS
chunks, and the page renders as unstyled raw content. If that happens: kill
the dev process, `rm -rf .next`, and start it fresh. If you need to run a
build to verify compilation, stop the dev server first (or accept you'll need
to restart it after).

## Local dev database (no DATABASE_URL set)
Without `DATABASE_URL`/`ADMIN_PASSWORD` in the environment, `lib/db.js` falls
back to an embedded PGlite database at `./data/pgdata`. That directory is
gitignored and does NOT exist in a fresh checkout — PGlite's client doesn't
auto-create the parent `data/` folder, so the first lead-form submission
fails with `ENOENT: no such file or directory, mkdir '.../data/pgdata'`.
Fix: `mkdir data` once. Also note `getDevClient()` caches a *rejected* promise
in memory on first failure and never retries it — creating the directory
after a failed attempt isn't enough, the dev server process must be restarted
too. `/admin` requires `ADMIN_PASSWORD` to be set (by design, see `lib/auth.js`
— no fallback password) — set it only for local verification, don't commit it.

## Admin area architecture (Dealer Command Center)
The admin was rebuilt around a sidebar shell + shared leads workspace:
- `components/admin/AdminShell.jsx` — sidebar layout, holds the mobile-drawer
  toggle context (`useAdminSidebarToggle`) that `AdminTopbar`'s hamburger reads.
- `components/admin/LeadsWorkspace.jsx` — the leads inbox + detail panel. Used
  directly by `/admin` (with the banner+KPI hero via `AdminDashboard.jsx`),
  `/admin/leads` (no hero), and `/admin/messenger` (via `AdminMessenger.jsx`,
  `lockChannel="facebook"`). Don't fork this component per page — extend its
  props instead, the way `lockChannel`/`heading`/`afterGrid` already do.
- `components/admin/LeadDetailPanel.jsx` mounts only once at a time (guarded
  by an `isDesktop` media-query check in `LeadsWorkspace`) — it fetches vehicle
  + timeline data on mount, so a naive "hidden lg:block" / "lg:hidden" pair of
  wrappers would double-fire every request. If you add another responsive
  wrapper around it, follow the same isDesktop-gated pattern.
- Vehicle availability (Available/Pending/Sold/Unknown) is the single
  `lib/vehicles.js` `VEHICLE_STATUSES`/override system — same read/write path
  whether it's changed from `/admin/inventory` or from a lead's vehicle card.
- Lead status/channel colors live once in `lib/leads.js` (`STATUS_COLORS`,
  `CHANNELS`) and `lib/vehicles.js` (`VEHICLE_STATUS_COLORS`) — don't
  reintroduce inline hex per component. They were deliberately darkened from
  more obvious brand shades (Facebook blue, a lighter amber/green/teal) because
  those failed WCAG AA contrast for white text at the ~9px badge size; axe
  caught this in `tests/accessibility.spec.js` — rerun it if you touch these.

## Playwright (`npm run test:e2e`)
Only the Chromium binary is installed (`npx playwright install chromium`) —
`npx playwright install --with-deps` fails in this sandbox (needs passwordless
sudo we don't have), and device presets like `devices['iPhone 13']` default to
WebKit, which isn't installed. `tests/mobile.spec.js` emulates a phone with a
manual `{ viewport, isMobile: true, hasTouch: true }` instead of a device
preset for this reason — reuse that pattern rather than a `devices[...]` entry.

The suite runs against the same PGlite file database as manual dev testing
(`playwright.config.js` sets `ADMIN_PASSWORD=test-admin-password` and reuses
port 3000 if something's already listening there). Tests that create leads
either tag them for `deleteDemoLeads()` (via `/api/admin/simulate-fb-lead`,
source `facebook (demo)`) or give themselves a `Date.now()`-suffixed unique
name — do the same for new tests, and prefer locating a just-created lead by
that unique name/response id rather than `.first()` in the list, since sort
order and leftover rows from earlier runs make position-based lookups flaky.
