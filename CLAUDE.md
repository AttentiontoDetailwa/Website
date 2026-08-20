# Attention to Detail — client site

Mobile interior auto detailing, Pierce County WA. One-person business: **Ava
Bright** is the owner and the only detailer, and the site is written in her
voice, first person. Five pages — `index`, `services`, `gallery`, `about`,
`contact` — plus three option galleries used to pick directions.

Status: built out and being refined. The work now is almost entirely taste and
phone layout, not features.

## Running it

```bash
# preview_start with {name: "atd-site"} — python3 .claude/serve.py on :4188
```

`.claude/serve.py` sends `no-store` on everything, so a reload always shows the
edit. Never start a server with Bash; use the preview tools.

## Stack

No build step, no framework, no package manager, no dependencies. Hand-written
HTML, one stylesheet, five scripts. Google Fonts (Plus Jakarta Sans) is the only
external request. Keep it that way — the site is handed to a client who will
open the files in a text editor.

- JS is an IIFE per file, `'use strict'`, `var`, no ES modules. Match it.
- Every script is progressive enhancement. `nav.js` is the only piece the page
  truly needs; `reveal.js` applies its own hidden state so the page reads fine
  if the file never runs; the quote form is plain markup that submits in one
  pass with the script absent. Do not write anything that only works with JS.
- Images are `<picture>` with a `.webp` `<source>` and a `.jpg` `<img>`, always
  with `width`, `height` and a real `alt` that describes the car and the state.

## The stylesheet

`css/style.css` is 2,600 lines in numbered sections (`/* --- 5. Header --- */`).
Read the section comment before editing the section — most of them explain a
decision that was already argued once.

Rules that keep getting broken:

- **Use the tokens.** No raw hex in a rule that a token already covers.
- **The cyan is Ava's business card colour and it is the only colour on the
  site.** On the cream ground it is a *fill* with ink type on it. On the ink
  bands it is the *type*. `--accent` points at ink on purpose so the light
  grounds stay monochrome — do not "fix" that.
- **No uppercase in user-facing text.** Not headings, not buttons, not labels,
  not stat labels. The only exception is the small wide-tracked eyebrow labels
  that already exist. There are ~20 explicit `text-transform: none` rules in
  the file because this keeps coming back.
- Elevation is shadow and radius. Hairlines are for dividing, not for lifting.
- Contrast is checked, not guessed. Every text/ground pairing is 4.5:1 or
  better and the token comments record the ratios. If you change a colour,
  state the new ratio.

## Phone layout

375px is the target width, and the phone work matters more than the desktop
work — most of her customers arrive from a phone.

Section 20 of the stylesheet is walled off at `max-width: 40em` so nothing in
it can reach desktop or tablet, which are fine. `.u-phone-only` and
`.u-phone-hide` switch content between the two. The nav drawer is a separate
breakpoint, `max-width: 1259px`, and `nav.js` hardcodes that number — change
one and change the other.

Known trap: `.shell` carries an auto margin *and* its own padding, so on phones
content can end up sitting ~43px in on each side and fighting for room that the
gutter already took.

## Copy

Her voice, first person, plain. "Hey, I'm Ava — the owner and sole detailer."
Not brochure voice, not "we", not feature bullets that sound like a franchise.

- A link belongs at the end of the sentence that earned it, not in a second
  button competing with the primary action.
- One paragraph that does two jobs beats two paragraphs that each make a claim.
- **No hint lines under form fields.** A line of grey under every input is what
  turns a nine-field form into a wall. What the hint carried goes into the
  label instead — "Phone number or / Email — either one". Notes that *answer a
  question* rather than explain a box may stay.
- Cut captions the photograph already says.

## Accessibility

Skip link, `aria-expanded` on the toggle, labelled nav, real `alt` text, and a
`prefers-reduced-motion` guard in both the stylesheet and `reveal.js`. Reveals
only move opacity and 14px of rise — nothing that reveals may shift layout.

## Option galleries

`design-options/`, `hero-options/`, `mobile-options/` each hold numbered
variants plus an `index.html` that racks them up in phone frames side by side.
Two rules: the variants are built on the **live stylesheet** so they inherit
changes to it, and building a set of options **touches nothing in the site**.

This is the preferred way to explore a direction — five real options to look at
beats a description of five options.

## Verifying

The work is visual, so "I changed the CSS" is not a result. Before saying a
design change is done: load the page in the preview, screenshot it at 375px
*and* at desktop, and check the console. If a change touches the nav, the quote
form, the lightbox or the swipe galleries, click through it — those four are
where the regressions have been.

## Commits

Subject: imperative, three clauses max, describing the visible change —
"Swipe only the walkthrough, plain the nav, add five interior openers".
No `feat:`/`fix:` prefixes.

Body: prose paragraphs, no bullets, in the same voice as this file. Say what
changed and *why it is better*, not what files moved. Anything fixed along the
way gets its own paragraph starting "Fixes ...", naming the actual cause. Note
side effects the client would notice.

Trailer: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

## Working philosophy

- Do the thing asked. Do not widen it because something nearby looks improvable
  — say so instead and let AJ decide.
- One change at a time, looked at, then the next.
- When something is removed, the reason it existed usually has to go somewhere
  else. Find where.
- Explain a non-obvious decision in a comment at the point of the decision.
  That is why this codebase is readable, and it is the house style.
