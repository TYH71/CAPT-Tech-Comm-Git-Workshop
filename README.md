# CAPT-Tech-Comm-Git-Workshop
Introductory Workshop to Git VCS and GitHub platform for CAPT 15CSC Tech Comm

## Participant posters

Copy `template/` to `participants/<your-name>/`, edit `index.html` and
`style.css`, and add your poster images. The gallery includes folders with
an `index.html` and copies their assets into the published site.

The Contributor Wall gallery and starter poster use CAPT 15CSC Tech Comm branding. Gallery
links point to this repository. The gallery stays light in all system themes,
with a beige canvas, maroon actions, and a muted yellow participant badge.
Original CAPT and Tech Comm logos live in `assets/` and are copied to `dist/`
at build time. Their proportions and original colors are preserved.
Add your own `profile.png` to the copied folder (or update the image path).
The starter uses the included `paper.png` texture.

## Build and deployment

With Node.js 20 installed, run:

```sh
node scripts/build-collage.mjs
node scripts/check-collage.mjs
```

The generated gallery is written to `dist/`, which Git ignores. With no
participant folders, the gallery shows an empty state.

The GitHub Actions workflow builds and deploys `dist/` to GitHub Pages on
pushes to `main` or manual runs. Set the repository's Pages source to
GitHub Actions to use this deployment workflow.
