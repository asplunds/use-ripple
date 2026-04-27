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
- `pnpm pack` / `pnpm publish` — runs `prepack` (`tsc --declaration`) which compiles `ripple.ts` → `dist/ripple.js` + `dist/ripple.d.ts`, then `postpublish` runs `rm -rf dist`. `dist/` is gitignored. The `files` allowlist keeps the publish payload to `dist/`, `readme.md`, `LICENSE`, and `package.json`.

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

Both rely on `dist/ripple.js` / `dist/ripple.d.ts` existing — each example has a `predev`/`prebuild` script that runs the parent's `prepack` automatically.

The root `tsconfig.json` pins `"include": ["ripple.ts"]` so `prepack` doesn't accidentally compile the example sources.

## Publishing notes

- `package.json` `main`/`module`/`exports`/`types` all point to `dist/`, which only exists after `prepack`. `dist/` is gitignored. Examples invoke `prepack` automatically via their `predev` script.
- React is a peer dep (`^17 || ^18 || ^19`). `sideEffects: false` is set so bundlers can tree-shake.
- Version bumps are manual edits to `package.json`.
