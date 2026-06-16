# Amity Admission — Sign-Up Redesign

A redesign of the Amity University application sign-up page
(`portal.amity.edu/NewOnlineForm/Candidate/SignUp`).

## Files

- **index.html** — primary version. Split-screen layout: navy + gold brand
  panel with a sign-up form (Full name, Email, Mobile, math captcha, consent).
- **index_2.html** — variant with a playful **media collage** in the brand
  panel (big looping video centre + drifting image circles, rings, glass/gold
  accents) and an inline stat row.
- **assets/** — Amity logos (`logo.png`, `logo-amity.png`) and campus imagery
  under `assets/amity/`.

## Design notes

- Self-contained HTML/CSS/JS — no build step. Open the file in a browser.
- Palette: Amity navy `#1a55a0` + gold `#f7bd0c`. Headings in **Fraunces**
  (serif), body in **PT Sans** — warm, academic feel inspired by Estudiar.
- Pill-shaped buttons/tabs, staggered entrance animations, hover
  micro-interactions; honors `prefers-reduced-motion`.
- Responsive: split-screen on laptop/desktop (form panel scrolls internally),
  compact full-screen form on mobile.

## Placeholders to replace for production

- `index_2.html` centre **video** is a CC0 placeholder loop — Amity's site has
  no hosted video, only a YouTube channel (`@amityuni`). Drop in a campus
  `.mp4` or switch to a YouTube embed.
- Captcha + form submission are front-end only; wire to the real backend.
