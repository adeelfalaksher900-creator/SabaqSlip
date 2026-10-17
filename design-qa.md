# Design QA

Status: **passed for the inspected desktop and mobile states**, with explicit device/assistive-technology limits in `docs/VALIDATION.md`.

## Source and comparison

The selected generated reference is `generated_images/exec-dd35e434-ecc5-4630-881c-f110cccacd7d.png` in the build workspace. It is a design reference, not a claimed screenshot or user research artifact.

The implementation was rendered in Chrome at a **1440 × 1024 CSS-pixel iframe viewport**. The QA fixture displayed that iframe at scale **0.88**. The source raster (1487 × 1058) was normalized to the same rendered content dimensions, 1267 × 901, and compared side by side with a crop of the real browser screenshot. Comparison v2 was visually inspected after corrections. The temporary QA fixture is excluded from deployment and source distribution.

Local evidence files: `qa/desktop-comparison-v2.jpg`, browser screenshots of desktop v2 and English/Urdu mobile states. QA images are internal verification records, not the deferred submission gallery.

## Findings and corrections

| Area | Initial finding | Final disposition |
|---|---|---|
| Density | Tall lesson rows and extra actions pushed Returned slips/footer below the reference viewport. | Reduced desktop row and panel spacing; moved edit to the heading and examples into Help. Returned slips and footer are visible at the matched viewport. |
| Type | Headline and section headings were lighter/smaller than the source. | Corrected desktop weight and sizes; Libre Baskerville/Inter retained. |
| Palette | Ivory paper, forest text, sage selection and thin rules matched the concept. | Retained, with stronger interactive borders for contrast. |
| Anatomy | Two-column list/preview, search, three learning stages and empty return state matched. | Passed; working import/edit/export controls added without changing the structure. |
| Assets | Source uses a text wordmark and line icons. | Implemented as text plus a consistent Phosphor icon family; no placeholder photos. |
| Mobile | Needs natural stacking and usable navigation rather than shrinking desktop content. | One column at 390px, full-size controls, no horizontal overflow in measured English/Urdu states. |
| Urdu | Requires translated text, Arabic font and RTL layout. | `lang=ur`, `dir=rtl`, Noto Naskh Arabic and mirrored directional arrows verified. |
| Contrast | Original field/answer boundaries were below 3:1. | Corrected to 3.85:1 and 4.02:1 respectively. |

No unresolved P0/P1/P2 visual defect was identified in the inspected states. No claim is made of pixel identity or universal browser/device accessibility. Primary flows and known test limits are recorded in `docs/VALIDATION.md`.
