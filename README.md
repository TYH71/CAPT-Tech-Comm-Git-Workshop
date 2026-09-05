# CAPT-Tech-Comm-Git-Workshop
Introductory Workshop to Git VCS and GitHub platform for CAPT 15CSC Tech Comm

## Participant posters

Copy `template/` to `participants/<your-name>/`, edit `index.html` and
`style.css`, and add your poster images. The gallery includes folders with
an `index.html` and copies their assets into the published site.

The starter currently retains SUTD branding and repository links. It also
references `profile.png`, `sutd-logo.png`, and `paper.jpg`; supply or update
those references before using it (the included texture is `paper.png`).

## Build and deployment

With Node.js 20 installed, run:

```sh
node scripts/build-collage.mjs
```

The generated gallery is written to `dist/`, which Git ignores. With no
participant folders, the gallery shows an empty state.

The GitHub Actions workflow builds and deploys `dist/` to GitHub Pages on
pushes to `main` or manual runs. Set the repository's Pages source to
GitHub Actions to use this deployment workflow.
