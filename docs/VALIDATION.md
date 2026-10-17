# Validation record

Checked 17 October 2026. This is a bounded prototype review, not a guarantee of a judging score, universal device compatibility or complete security.

## Automated checks

- **11/11 core tests passed:** canonical fingerprints, JSON round trips, changed answer keys, duplicate IDs, scoring, untrusted score/option rejection, idempotent imports, changed attempt-ID rejection, foreign lessons, incomplete answers, future timestamps, file limits, latest-attempt planning, confidence behavior and safe standalone export.
- **4/4 hosting tests passed:** asset serving, navigation fallback, API/write-request boundaries and build packaging.
- Production build passed. Build-tool dependency advisories were fixed; the dependency audit reported **0 known vulnerabilities** for the lockfile at review time.
- The generated standalone fractions activity is **13,928 bytes**. The compact fictional return example is **457 bytes**. These are example-file sizes, not a guarantee for every custom lesson.

## Browser checks completed

| Check | Observed result |
|---|---|
| Workspace loading | Four original lesson packs and an empty state render correctly. |
| Learner validation | Continuing without an answer/confidence shows an actionable message. |
| Full web activity | A deliberately mixed attempt gives 2/3 with the expected explanations. |
| Actual return-file download/import | The learner's downloaded `TEST07` file imports and shows 2/3. |
| Planning | Confident wrong answer prompts explanation, correct unsure answer prompts practice, correct sure answer is ready to extend. |
| Duplicate return | Reimport reports no duplicate and the count stays at one. |
| Persistence | Reload retains the imported return and tutor plan. |
| Lesson authoring | An edited copy saves as a fifth lesson with a distinct fingerprint. |
| Search | A nonsense query shows the empty-search message and clear control. |
| Invalid return | A malformed return with a supplied score shows an error and does not replace work. |
| Keyboard dialog | Escape closes Help and returns focus to its trigger. |
| Backup/restore | A downloaded backup contains five lessons and one return; reimport validates it, shows replacement confirmation, and restores the same counts. |
| Standalone activity | The generated HTML runs under its own CSP, completes all three questions and downloads a return. No application console errors were observed in that tab; unrelated browser-extension errors were excluded. |
| Mobile English/Urdu | At a 390px CSS iframe viewport, content width and scroll width are both 375px after the scrollbar. No horizontal overflow; Urdu switches `lang=ur`, `dir=rtl` and renders translated content. |
| Mobile workspace controls | Visible links/buttons/inputs measured at least 44px tall in the inspected state. |
| Visual layout | Desktop reference and actual browser capture compared at the same normalized 1440 × 1024 viewport. See `design-qa.md`. |

## Contrast measurements

Calculated using the WCAG relative-luminance formula on implemented colors:

| Pair | Ratio |
|---|---:|
| Body text / paper | 11.01:1 |
| Muted text / paper | 5.93:1 |
| White / primary button | 8.03:1 |
| Review signal / card | 6.61:1 |
| Input border / input surface, after correction | 3.85:1 |
| Answer border / white, after correction | 4.02:1 |

A contrast issue in the initial input and answer borders was corrected. These checks cover specified colors, not an automated certification of every state.

## Material limits and remaining verification

- Physical iOS/Android devices, different mobile HTML-opening behaviors, screen-reader speech output and browser zoom combinations have not all been tested.
- The standalone artifact has no external resource dependencies and blocks connections. A real device with networking disabled should still be tested in a local pilot. A network-disconnected PWA session has not yet been independently verified.
- Small-file formats and local storage are intentional constraints. This is not an LMS, authenticated exam platform or cloud sync service.
- No user study, measured learning gain or firsthand community observation is claimed.
- The final 2–6 minute video, thumbnail and gallery are intentionally deferred for creator review. Final eligibility and community evidence require creator verification.

## Judging alignment, not a score prediction

| Criterion | Weight | Current evidence | Gap before final submission |
|---|---:|---|---|
| Community relevance | 25% | Narrow tutoring workflow; sourced national context. | A real, specific creator-observed local example is essential. |
| Impact potential | 20% | Small standalone files, no accounts, manual private return, tutor-centered actions. | Pilot usability and preparation-time measures; learning impact remains unproven. |
| Technical execution | 20% | Working authoring/learner/export/import/plan/backup flows; 15 automated checks. | Public deployment and production smoke test passed; real-device offline checks remain. |
| Creativity | 15% | English/Urdu micro-lesson → return file → next-session actions. | Existing offline tools are acknowledged; no first-in-market claim. |
| Presentation and clarity | 10% | Focused interface, explanations, honest research and boundaries. | Final 2–6 minute working demo after review. |
| Accessibility | 10% | RTL, responsive layout, readable contrast, semantic controls, keyboard focus styles, no login. | Physical device and assistive-technology pilot. |

No defensible measurement can promise that judges will award 100%. The prototype's readiness and its evidence gaps are reported separately.

## Production deployment and final smoke test

- Vercel production deployment: **READY**, 17 October 2026. Public URL: https://sabaqslip.vercel.app/
- Public repository: https://github.com/adeelfalaksher900-creator/SabaqSlip
- Functional source commit: `3d6a88b25643521af590f1da0e135f8ab81e84e2`. Subsequent changes are documentation only.
- Public site opens without a login wall; its footer reports the application cache ready. No application errors were observed in the inspected production console; extension logs were excluded.
- A complete production learner attempt gives **3/3**. Saving its return twice produces identical files with the same attempt ID, preventing accidental double counting.
- Production-generated HTML download: **12,994 bytes** after minification. Its script matches the embedded CSP hash, it blocks connections, and it contains no remote resource references. The build-time unminified example remains 13,928 bytes.
- This browser environment does not allow `file:` navigation. Therefore, direct local-file opening and a physically disconnected network test are explicitly not claimed. The hosted standalone runtime was tested end to end.
- Devpost preview persists the project story, tools, live link and repository link. The event entry remains **DRAFT, 3/5 steps complete**, awaiting media and creator review. Terms were not accepted and final submission was not performed.
