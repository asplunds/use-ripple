# Examples

Two minimal apps that consume `use-ripple-hook` via the pnpm workspace symlink. They're meant for verifying the package works under common bundler setups.

## Setup

From the **repo root**:

```sh
pnpm install
```

## Run

```sh
pnpm --filter use-ripple-vite-example dev
pnpm --filter use-ripple-nextjs-example dev
```

Or `cd examples/<name> && pnpm dev`.

Each example has a `predev`/`prebuild` script that compiles the parent package (`tsc --declaration`) before launching, so the `ripple.js` / `ripple.d.ts` referenced by the workspace symlink always exist. If you edit `ripple.ts` while a dev server is running, restart it (or run `pnpm run prepack` at the repo root) to pick up the change.

## What each example covers

Both render three buttons exercising:

- the default ripple,
- per-call options (color, duration),
- `customRipple()` to bake in a config.

The Next.js variant additionally demonstrates that the hook lives in a `"use client"` component (it touches the DOM, so it cannot run in a Server Component).
