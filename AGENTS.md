# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.


# Project decisions

SabaqSlip uses the Education & Access track and English/Urdu layouts. The user delegated concept and visual selection. Preserve the warm ivory/forest design and the narrow offline lesson → private return → tutoring plan workflow. Do not invent local research or impact outcomes. The current instruction is to let the creator review the working website and Devpost draft first; create the narrated Hyperframes video, thumbnail and 15 gallery images only after a later instruction authorizes that phase. Final eligibility and a specific firsthand community example require creator verification.
