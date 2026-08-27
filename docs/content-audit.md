# Content quality audit

Measured 2026-08-27 against the 38 unconverted pages in `docs/content`.
`events.md` is already converted and is excluded.

This is the worklist for conversion. Each page gets converted **and** fixed in
one pass — converting without fixing just moves the problems into markdown.

## The corpus in one line

19,065 words. **46% of all non-blank lines are bullets, and 809 of those bullets
are three words or fewer.** That is the whole problem: a third of the content is
naked noun fragments, so nothing can stand out because nothing is subordinate to
anything.

## Four faults, in priority order

### 1. Noun-dump lists (worst offender by far)

Every page follows the same shape: heading → one hedged sentence → a list of
single words → next heading. `technical-officials` has 61 three-word bullets in
88 total. `organiser-resources` has 52 of 52.

A list earns its place when the reader **checks items off** — required documents,
form fields, a sequence. It does not when it is an adjective dump.
`become_to` offering "Attention to detail / Fairness / Confidence / Good
communication" tells a prospective official nothing they hadn't assumed.

**Fix:** convert to prose, or cut. Target: no page above 15 bullets, none with
more than 5 short ones.

### 2. The same thing explained on many pages

| Subject | Explained in full on | Should live on |
|---|---|---|
| Listed / Sanctioned / Qualification Event / National Championship | 6 pages | `event-recognition` |
| The seven-level coaching pathway | 3 pages | `coaching` |
| "You don't need to be an elite athlete" | 7 pages | wherever it is load-bearing, once |
| 100m / 400m / Short / Standard discipline list | 4 pages | `rules-regulations` |
| Named independent events (Hard as Oak, Rampage…) | 3 pages | `events` (done) |
| Recognition of Prior Learning | 2 pages | `coaching` |

The status trio is the dangerous one. It is the only content carrying real rules,
and six copies **will** drift. An athlete reading a stale copy and entering the
wrong race loses a season.

**Fix:** one canonical page per subject; every other page gets a sentence and a
link.

### 3. Near-duplicate pages

| Pair | Shared bullets | Disposition |
|---|---|---|
| `start_a_club` / `start-a-club` | 15 of 34 | Get Involved *card* copy vs the page. Card text → hub, page stays. |
| `become_to` / `technical-officials` | 17 of 46 | Same. Card → hub. |
| `become-a-coach` / `coaching` | 14 of 34 | Same. Card → hub. |
| `organise_an_event` / `work-with-ocra` | 4 of 28 | Same. Card → hub. |

`menu-proposed.txt` (2026-08-24) settles this: those four are cards on the Get
Involved hub, not pages. Earlier I read them as duplicates to delete — they are
not, they are shorter copy for a different surface.

Also per that decision log: `results` + `rankings` merge into one page with two
tabs, and `find-a-club` + `find-a-gym` merge into one finder with a filter.
**`find-a-club` is a 0-byte file** for that reason.

### 4. Nothing commits

23 hedges on `data-protection`, 21 on `event-standards`, 17 on
`technical-officials` and `complaints`. "Depending on the current OCRA
affiliation programme, support and opportunities may include" is four hedges in
one clause.

Some of this is honest — the pathways genuinely are not built. The problem is the
reader cannot tell a live rule from an aspiration, so they discount all of it.

**Fix:** separate them explicitly. Real things get plain present tense. Unbuilt
things get a `:::not-live` callout **at the top**, not buried at the bottom
after 100 lines describing a system that does not exist — which is what
`rankings` currently does.

## Accuracy — things stated that are not true

- **Insurance.** Removed, 33 references, all five languages. Done.
- **Rankings** are presented as a live membership benefit in the members app and
  marketing i18n. No ranking system exists. Not yet fixed.
- **"Certifying coaches"** in the home positioning line. No coach has been
  certified; the pathway is in development. Defensible as remit, worth a
  decision.
- **`discounts`** as a membership benefit — partner programme not signed.
- **Directories** — `find-a-club` and `find-a-gym` describe listings with no data
  source. Must not imply listings exist.
- **Documents** — `policies`, `constitution`, `codes-of-conduct` and
  `rules-regulations` describe instruments. Codes of Conduct *is* substantially
  the code itself and should be published as in force; the Constitution and the
  rulebooks are summaries of text that is not in the repo.

## Scaffolding to strip, not convert

- `Proposed URL:` — 37 files. Becomes frontmatter `url`.
- `Suggested Calls to Action:` — 35 files. Up to 5 per page with no priority
  order; pick one primary, one secondary.
- Form and document templates in `complaints`, `contact`, `constitution`,
  `data-protection`, `policies`, `submit-an-event` — `Version:` / `Approved:` /
  `Recommended fields` / `Developer Recommendation`. These are build
  instructions, not reader copy. They belong in a build note.
- The boilerplate opener — **37 of 38 pages** begin "The Obstacle Course Racing
  Association of Ireland (OCRA ÉIREANN)…". Expand once on About, then "OCRA".

## Per-page worklist

Sorted by short-bullet count — the top of this list is where the reading
experience is worst.

| Page | Words | Bullets | ≤3 words | Hedges | Main job |
|---|---|---|---|---|---|
| technical-officials | 965 | 88 | 61 | 17 | Rewrite. Absorb TO card copy. |
| event-standards | 597 | 63 | 56 | 21 | Rewrite. Keep real checklists only. |
| organiser-resources | 510 | 52 | 52 | 6 | Rewrite as a hub of pointers. |
| coaching | 864 | 78 | 51 | 11 | Rewrite. Canonical for the pathway + RPL. |
| data-protection | 653 | 73 | 50 | 24 | Rewrite. It is the privacy notice. |
| partner-with-ocra | 463 | 48 | 42 | 8 | Prose, not four parallel lists. |
| safeguarding | 518 | 46 | 37 | 11 | Prose. Escalation route as `:::escalate`. |
| courses-and-training | 631 | 49 | 37 | 13 | Link pathway, don't restate it. |
| community | 514 | 42 | 35 | 4 | Trim; roll-call → link to events. |
| results | 472 | 34 | 34 | 16 | Merge rankings in as second section. |
| membership | 457 | 42 | 34 | 5 | Trim. Benefits must be true. |
| equality_inclusion | 432 | 37 | 34 | 9 | Prose. Rename to `equality-inclusion`. |
| volunteer | 486 | 42 | 33 | 8 | Trim. |
| event-recognition | 524 | 35 | 32 | 11 | Canonical for the status trio. |
| codes-of-conduct | 509 | 44 | 30 | 6 | Publish as in-force code. |
| governance | 519 | 36 | 29 | 7 | Trim. |
| complaints | 544 | 46 | 29 | 17 | Trim; route to contact form. |
| submit-an-event | 396 | 36 | 28 | 1 | Strip form spec. |
| find-a-gym | 381 | 34 | 28 | 8 | Merge with find-a-club per decision log. |
| team-ireland | 475 | 43 | 27 | 10 | Trim; conduct list → codes-of-conduct. |
| championships | 476 | 31 | 27 | 8 | Two near-identical lists → one. |
| start-a-club | 566 | 41 | 25 | 5 | Trim. Canonical for starting a club. |
| rules-regulations | 497 | 38 | 25 | 14 | Canonical for disciplines. |
| constitution | 359 | 30 | 20 | 5 | Trim. Summary, flag as such. |
| club-affiliation | 471 | 30 | 20 | 7 | Trim. |
| qualification | 582 | 31 | 19 | 12 | Trim. Stays standalone. |
| work-with-ocra | 545 | 28 | 10 | 6 | Trim. Absorb organiser card copy. |
| policies | 336 | 11 | 9 | 4 | Index of in-force policies. |
| rankings | 477 | 20 | 8 | 8 | Merge into results. `:::not-live` at top. |
| anti-doping | 498 | 9 | 6 | 14 | Light trim; de-hedge. |
| what_is_ocr | 557 | 0 | 0 | 6 | Already good. Rename, add `h3`s. |
| contact | 310 | 0 | 0 | 8 | Strip form spec. |
| about-ocra | 369 | 0 | 0 | 1 | Already good. Expand name here only. |
| find-a-club | 0 | — | — | — | Empty. Merges with find-a-gym. |

Card copy, not pages: `become_to`, `become-a-coach`, `start_a_club`,
`organise_an_event`.

## Worth protecting

Three lines in 19,000 words sound like a person wrote them, and they are the
three most memorable things in the corpus:

- "bought seventeen tyres and accidentally appointed their neighbour as Supreme
  Head Coach for Life" — `start-a-club`
- "a sack race and optimism" — `organiser-resources`
- "deciding whether somebody touched a bell" — `technical-officials`

They survive conversion.
