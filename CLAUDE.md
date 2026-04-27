# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package

`use-ripple-hook` — a single-file React hook implementing a Material UI–style ripple effect. Published to npm; consumers install it and `import useRipple from "use-ripple-hook"`.

## Commands

Package manager: pnpm (see `pnpm-lock.yaml`). Workspace with three packages: root + `examples/*`. All shared dep versions live in the `catalog:` block of `pnpm-workspace.yaml`.

- `pnpm install` — installs deps and runs `husky` via `prepare` to wire the git hooks.
- `pnpm typecheck` — `tsc --noEmit` against `ripple.ts` (the root tsconfig pins `include: ["ripple.ts"]`).
- `pnpm lint` — `oxlint` over the repo (warnings don't fail the script).
- `pnpm format` / `pnpm format:check` — `oxfmt` (config in `.oxfmtrc.json`, ignore patterns inline; `oxfmt` also reads `.gitignore`).
- `pnpm pack` / `pnpm publish` — runs `prepack` (`tsc --declaration`) which compiles `ripple.ts` → `ripple.js` + `ripple.d.ts`, then `postpublish` cleans the build outputs. The `files` allowlist in `package.json` keeps the publish payload to `ripple.{js,d.ts,ts}` + `readme.md` + `package.json`.

The pre-commit hook (`.husky/pre-commit`) runs `pnpm typecheck && pnpm lint`. Husky 9 is wired via `core.hooksPath = .husky/_`.

## Architecture

Everything lives in `ripple.ts`. Two public exports:

- **`useRipple<T>(options?)`** — default export. Returns a `[ref, event]` tuple. Consumers attach `ref` to the host element and wire `event` to `onPointerDown`. The hook lazily creates a `<div>` ripple container (positioned absolute, `overflow: hidden`) inside the host on first event, then appends a sized circular ripple `<div>` per pointer-down. Sizing uses `Math.hypot` of the max distance from pointer to each corner so the ripple always covers the host's border box.
- **`customRipple(options)`** — HOF that returns a `useRipple` variant with baked-in defaults; per-call options merge over the baked-in ones.

Key behaviors that aren't obvious:

- If the host element is `position: static`, the hook mutates its inline style to `position: relative` so the absolute-positioned container anchors correctly.
- On non-touch devices the ripple cancels on the next document-level `mouseup`/`touchend`. On touch devices (or when `cancelAutomatically: true`) it auto-cancels at `40% * duration`. The cancel is delayed if the spawn animation hasn't reached the 40% mark yet — this prevents a jarring instant fade.
- `ignoreNonLeftClick` only filters `mousedown`-derived events (left-click check via `event.nativeEvent.which === 1`); touch/pointer events pass through regardless.
- `MinimalEvent` is the structural type accepted by the returned event handler — synthetic React events satisfy it, but so does any object with `clientX`/`clientY` (and optionally `nativeEvent.which`/`type`). Useful for custom triggering.
- The ripple element is removed via a `transitionend` listener on the `opacity` property, not a timeout — keep this in mind when modifying the cancel animation.

## Examples / smoke tests

`examples/` is a pnpm workspace (see `pnpm-workspace.yaml`) containing two host apps that consume the package via a `workspace:*` symlink:

- `examples/vite-example` — Vite 8 + React 19.
- `examples/nextjs-example` — Next 15 App Router. The hook lives in a `"use client"` component (`app/RippleDemo.tsx`) since it touches the DOM. `next.config.mjs` includes `transpilePackages: ["use-ripple-hook"]` so Next normalizes the workspace package's ESM output.

Both rely on `ripple.js` / `ripple.d.ts` existing — run `pnpm run prepack` at the repo root before `pnpm dev` in an example. Re-run after editing `ripple.ts`.

The root `tsconfig.json` pins `"include": ["ripple.ts"]` so `prepack` doesn't accidentally compile the example sources.

## Publishing notes

- `package.json` `main`/`module`/`exports`/`types` all point to compiled artifacts (`ripple.js`, `ripple.d.ts`) that only exist after `prepack`. Don't commit them — `.gitignore` doesn't list them, but they're regenerated each publish.
- Version bumps are manual edits to `package.json`. The README's "v1.1 breaking-changes vite-8 support added" line tracks the latest notable change.
