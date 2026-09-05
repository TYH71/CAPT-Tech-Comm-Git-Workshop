<div align="center">
<img src="assets/capt-logo.png" alt="College of Alice & Peter Tan" width="100" />
<img src="assets/tech-comm-logo.jpg" alt="Tech Comm" width="180" />

# Git Workshop
**CAPT 15CSC Tech Comm | Contributor Wall**

Make your own poster by editing JSON, submit a pull request, and see it on the workshop website.

[View the Contributor Wall](https://tyh71.github.io/CAPT-Tech-Comm-Git-Workshop/)
</div>

## What is this?

This hands-on activity introduces the workflow used by software teams:

**clone → branch → edit → commit → push → pull request → merge → deploy**

Every participant edits their own JSON file. Shared HTML and CSS generate consistent posters;
you do not need to write web code. After changes reach `main`, GitHub Actions builds the gallery
and publishes it to GitHub Pages.

## A quick Git refresher

| Term | Meaning |
| --- | --- |
| Repository | A project and its tracked history. |
| Working directory | Files you are currently editing. |
| `git add` | Stage changes for your next commit. |
| `git commit` | Save staged changes as a local checkpoint. |
| `git push` | Send local commits to GitHub. |
| `git clone` | Download a repository and its history. |
| `git pull` | Fetch and integrate changes from the remote. |
| Branch | A separate line of work, keeping your edits off `main`. |
| Pull request | A request for maintainers to review and merge your changes. |

## Activity: create your poster

You need Git and a GitHub account. Local preview also requires Node.js 20 and Python 3.
Replace `your-name` below with your lowercase GitHub username, using letters, numbers, and hyphens.

### Clone the repository

If the host has granted you write access:

```sh
git clone https://github.com/TYH71/CAPT-Tech-Comm-Git-Workshop.git
cd CAPT-Tech-Comm-Git-Workshop
```

Otherwise, fork this repository on GitHub first, then clone your fork using its URL.
Your pull request should target `TYH71/CAPT-Tech-Comm-Git-Workshop`.

### Create your branch

```sh
git switch -c participant/your-name
```

### Copy the JSON template

macOS / Linux:

```sh
mkdir -p participants/your-name
cp template/profile.json participants/your-name/profile.json
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force participants/your-name
Copy-Item template/profile.json participants/your-name/profile.json
```

Copy only the JSON file. Do not copy or edit the shared HTML, CSS, or texture.

### Fill in your details

Edit `participants/your-name/profile.json`:

```json
{
  "name": "Your name",
  "heading": "WANTED",
  "tagline": "Learning Git together",
  "bounty": "1,000,000",
  "photo": "",
  "photoAlt": "My portrait"
}
```

| Field | Content | Maximum characters |
| --- | --- | --- |
| `name` | Your display name | 40 |
| `heading` | Short poster heading | 12 |
| `tagline` | Your poster tagline | 40 |
| `bounty` | Fictional amount, written as text | 20 |
| `photo` | Local PNG, JPG, or WebP filename | 100 |
| `photoAlt` | Description of your photo | 120 |

All six fields are required strings. Only `photo` may be empty: it uses the Tech Comm logo
until you add a photo. For your own image, put `portrait.jpg` in your folder and set `photo`
to `"portrait.jpg"`. Use a simple filename containing letters, numbers, underscores, or hyphens.
Remote URLs, subdirectories, and symbolic links are not supported.

JSON uses double quotes and does not support comments or trailing commas.
Every participant folder must contain a valid `profile.json`. The build reports the file
and field to correct when validation fails.

### Preview your poster

From the repository root:

```sh
node scripts/build-collage.mjs
python3 -m http.server 8000 --directory dist
```

Open [the local gallery](http://localhost:8000), then click your poster to view it separately.
Run the build again after changing JSON or photos, then refresh your browser.
The shared poster uses a paper texture; the gallery uses CAPT maroon, yellow, and beige.

### Commit and push

```sh
git add participants/your-name
git commit -m "Add my workshop poster"
git push -u origin participant/your-name
```

### Open a pull request

On GitHub, choose **Compare & pull request**. Set the base repository to
`TYH71/CAPT-Tech-Comm-Git-Workshop`, base branch to `main`, and compare branch to your participant branch.
Describe your poster and create the pull request. Maintainers review and merge it.

### See your contribution

Once the Pages deployment succeeds, your poster appears on the
[Contributor Wall](https://tyh71.github.io/CAPT-Tech-Comm-Git-Workshop/).
Check the Actions tab if your merged poster has not appeared yet.

## Repository structure

```text
assets/                       Original CAPT and Tech Comm logos
participants/
  your-name/
    profile.json              Your editable details
    portrait.jpg              Optional photo
template/
  profile.json                Copy this file to start
  index.html                  Shared layout, maintained by the host
  style.css                   Shared poster styling
  paper.png                   Poster texture
scripts/
  build-collage.mjs            Validate JSON and generate the site
  check-collage.mjs            Build and validation regression checks
.github/workflows/deploy.yml   GitHub Pages build and deployment
```

The example participant path above is illustrative; the repository starts with an empty wall.

## How the build works

The builder validates participant JSON before replacing `dist/`, escapes text for HTML,
and renders each poster from the shared template. It publishes only generated HTML and
referenced photos from participant folders. Participant HTML and CSS are not published.
Posters appear inside gallery iframes, with links to their standalone pages.

Original organiser logos keep their proportions and colors. The gallery stays light
regardless of system theme. Generated `dist/` is ignored by Git.

Existing HTML-only participant folders must move their details into `profile.json`.

## For the host

1. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
2. Push to `main` or run the deployment workflow manually.
3. Give participants repository access, or ask them to fork and open pull requests.
4. Consider protecting `main` and requiring review before merges.

Run regression checks before publishing generator or template changes:

```sh
node scripts/check-collage.mjs
node scripts/build-collage.mjs
```

The checks cover empty and populated galleries, branding assets, escaped text,
photo copying, malformed JSON, and invalid fields and image paths.

## Reference workshop

Adapted from [AngKS's SUTD Git Gud workshop](https://github.com/AngKS/SUTD-Git-Gud-2026-Workshop).
See its [original activity website](https://angks.github.io/SUTD-Git-Gud-2026-Workshop/)
for the source workshop. This CAPT version uses its own branding and JSON submissions.
Reference slide decks and illustrations are not bundled in this repository.
