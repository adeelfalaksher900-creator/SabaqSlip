# SabaqSlip

Small offline lessons. Private return slips. A useful next tutoring session.

[Live website](https://sabaqslip.vercel.app/) · [Devpost review draft](https://devpost.com/software/sabaqslip)

SabaqSlip is an English/Urdu web app for community tutors. A tutor creates a short activity, shares one self-contained HTML file, and imports the learner's small JSON return slip. The tutor gets question-specific explanations and follow-up prompts, ordered by the latest answers and self-reported confidence.

Built for Neighborhood Hacks 2026, **Education & Access**. This is a working prototype; no local pilot or measured learning improvement is claimed.

## Try the workflow

1. Choose one of four original starter lessons, or create an edited copy.
2. Preview the activity, or export **offline HTML**. Save the file and open it in a full browser. Some mobile file previews and messaging apps do not execute HTML.
3. Use a learner code such as `B07`, answer the questions, and save the return slip.
4. Give that JSON file to the tutor through an existing private channel. It does not send itself.
5. Import the return slip in the workspace. Inspect the answer details and next-session plan.

For a quick demonstration, **How it works → Try clearly labeled example returns** creates fictional examples. They are labeled and separated from real returns.

## Run locally

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173
```

```sh
npm test
npm run build
npm run test:sites
npm run preview -- --host 0.0.0.0 --port 4174
```

The static app is in `dist/client/`. The build also emits a self-contained `offline-example.html`, example JSON files, and a revisioned service worker. Vercel can host `dist/client/` with the repository's `vercel.json` copied into the deployment root. The original optional Sites runtime is retained.

## What is implemented

- Four original English/Urdu starter lessons: fractions, percentages, reading evidence and equations.
- Lesson authoring with optional Urdu translations, 1–8 questions, answer keys, explanations, teaching steps and follow-up questions.
- Standalone HTML export with no remote scripts, fonts, APIs or connection requirements.
- Answer and confidence capture, feedback and a small JSON return file.
- Exact lesson-version fingerprints, strict file validation, tutor-side scoring and duplicate protection.
- Latest-attempt planning, fictional example labels, local persistence, backup/restore and print styles.
- Responsive layouts, Urdu RTL, semantic controls, visible focus, dialog focus management and a skip link.

## Boundaries

This is formative practice, not a secure exam system or a diagnosis of student ability. The HTML contains its answer key. Files are self-reported and unsigned. Fingerprints catch version mismatches; they do not authenticate a learner. Confidence is a conversation prompt.

Workspace files remain in this browser's local storage, which is **not encrypted**. Downloads and backups must be kept private. Hosting still receives ordinary page requests. There are no learner accounts, analytics, paid APIs or cloud answer database. A device, JavaScript-capable browser and a way to exchange files are required.

See [research and differentiation](docs/RESEARCH.md), [security boundaries](SECURITY.md), and [validation](docs/VALIDATION.md).

## Credits and AI disclosure

Original application and lesson content were developed during the event with AI coding and design assistance. React, Vite, Zod, Noble Hashes, Phosphor Icons, Inter, Libre Baskerville and Noto Naskh Arabic are dependencies. A generated design reference informed the interface. No generated learner evidence, interviews, testimonials or impact numbers are used. AI is not required when the app runs.

MIT license covers original code and lesson text. Dependency and font licenses remain their own.
