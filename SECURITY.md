# Security and privacy boundaries

This document describes the prototype's design and focused verification. It is not a penetration-test certificate or a claim of complete security.

## Data flow

The host serves static HTML, JavaScript, CSS and fonts. Lesson creation, scoring, return imports and workspace persistence run in the browser. No application endpoint accepts learner answers. Downloads are generated with browser Blob URLs. File exchange is deliberate and external to the app.

The optional service worker caches public application assets only. Workspace content uses local storage. It is unencrypted and available to anyone with access to the same browser profile. Private browsing, browser cleanup, device loss or quota limits may lose local work. Export private backups.

## Untrusted file handling

- Imports are JSON, bounded to 256 KiB before parsing. Lesson and return schemas reject unknown fields.
- Lesson versions use a SHA-256 fingerprint over canonical content. Imported content must match its fingerprint.
- Returns require the exact lesson version, one recognized answer per question, a valid code, and plausible device time.
- Imported scores are rejected. Scores are recalculated from the tutor's known answer key.
- Reimporting the same attempt is idempotent. Reusing an attempt ID with altered content is rejected.
- The most recent return per learner and exact lesson version guides the plan.
- React text rendering and DOM `textContent` avoid interpreting lesson content as HTML. Embedded JSON escapes `<` and Unicode separators.
- Downloaded activities contain a script-hash CSP and `connect-src 'none'`. There are no remote resources.
- Unreadable saved work triggers recovery mode instead of silently overwriting it. Backup restoration requires an explicit review step.

## What these controls do not provide

Fingerprints are not signatures. A motivated person can edit a lesson, recompute a fingerprint or construct a return. Learner identities and clocks are not authenticated. The answer key is visible in the activity file. Do not use this prototype for grading, admissions, high-stakes decisions or adversarial exam security.

Third-party imported lesson files are content, not trusted facts. Tutors must review educational correctness and translation quality. Prefer pseudonymous codes and avoid sensitive information in lessons, learner codes or file names.

## Deployment

The Vercel configuration sets CSP for the main entry point, `nosniff`, no-referrer, same-origin framing and disabled camera, microphone and geolocation permissions. Standalone activities carry their own CSP because their script is embedded. There are no app secrets or API keys to configure.

Dependency audit results apply only to the locked dependency versions and the time of the scan. Re-run `npm audit` after updates. Report a suspected code issue through the repository; do not include private learner return files in public issues.
