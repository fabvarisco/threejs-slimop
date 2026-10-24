# Repository Guidelines

## Project Structure & Module Organization

This is a Vite-based Three.js browser game. The main application logic lives in `src/main.js`, with styling in `src/styles.css` and the HTML shell in `index.html`. Visual and interaction tests are in `tests/`, currently `tests/visual.spec.js`. Playwright configuration is in `playwright.config.js`.

Large game assets live under `Assets/`, grouped by kit and format, for example `Assets/City Kit - Commercial/Models/GLB format/`. Prefer GLB assets already referenced by `src/main.js`; keep asset paths stable because Vite resolves them through `new URL(..., import.meta.url)`.

## Build, Test, and Development Commands

- `npm install`: install project dependencies from `package-lock.json`.
- `npm run dev`: start the Vite dev server on `127.0.0.1`.
- `npm run build`: create the production build with Vite.
- `npm run preview`: serve the built app locally for a production-like check.
- `npm run test:visual`: run Playwright tests against the dev server on port `4173`.

## Coding Style & Naming Conventions

Use ES modules and modern JavaScript. Follow the existing style: two-space indentation, semicolons, single quotes in JavaScript, and descriptive constants in `UPPER_SNAKE_CASE` for shared configuration such as asset URL lists and colors. Use `camelCase` for variables, methods, and object fields.

Keep CSS selectors readable and scoped to the game UI. Use stable IDs for elements accessed from JavaScript, such as `#game-canvas` and `#center-state`.

## Testing Guidelines

Playwright is the active test framework. Add or update tests in `tests/*.spec.js` when changing rendering, asset loading, animation, controls, or HUD behavior. Existing tests wait for `window.__SLIMOP_READY__` and inspect `window.__SLIMOP_DEBUG__`; keep those debug hooks accurate when changing scene construction or movement logic.

Run `npm run test:visual` before submitting UI, rendering, or gameplay changes. The test suite captures canvas screenshots and validates both desktop and mobile viewports.

## Commit & Pull Request Guidelines

This repository has no established commit history yet. Use short, imperative commit messages, for example `Add traffic movement test` or `Tune mobile HUD layout`.

Pull requests should include a concise description, the commands run, and screenshots or Playwright output for visual changes. Link related issues when available. Note any added assets, especially large files under `Assets/`, and explain why they are needed.

## Agent-Specific Instructions

Keep changes focused. Do not reorganize `Assets/` or rename model files unless the importing code and tests are updated together. For Three.js changes, verify the canvas is nonblank, correctly framed, and interactive on both configured Playwright projects.

Do not hand-create or procedurally build game models unless the user explicitly requests it. Always use the existing project assets under `Assets/` for characters, pedestrians, vehicles, buildings, props, and other scene models, and inspect the available assets before adding new visual entities.
