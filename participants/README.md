# Add your profile to the Contributor Wall

Create your own folder here, fill in a JSON profile, and submit a pull request.
Your card appears on the [Contributor Wall](https://tyh71.github.io/CAPT-Tech-Comm-Git-Workshop/)
after your pull request is merged and deployment succeeds.

## 1. Get the repository and create a branch

You need Git and a GitHub account. Follow the [clone instructions](../README.md#clone-the-repository)
first. If you do not have write access, fork the repository and clone your fork.

Run all commands below from the repository root, not inside `participants/`.
Replace `your-name` with your lowercase GitHub username. Use letters, numbers,
and single hyphens between them; do not start or end with a hyphen.

```sh
git switch -c participant/your-name
```

## 2. Create your profile file

Copy the [JSON template](../template/profile.json) into your own folder.

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

Edit `participants/your-name/profile.json` using this template:

```json
{
  "name": "Your name",
  "tagline": "Learning Git together",
  "photo": "",
  "photoAlt": "My portrait",
  "telegram": "@your_username"
}
```

| Field | What to enter |
| --- | --- |
| `name` | Your display name, up to 40 characters. |
| `tagline` | A short introduction, up to 80 characters. |
| `photo` | Leave empty for the Tech Comm logo, or enter a local image filename (up to 100 characters). |
| `photoAlt` | A description of your photo, up to 120 characters. Keep this filled even without a photo. |
| `telegram` | Your handle: `@` followed by 1–32 letters, numbers, or underscores. |

Keep all five fields. Values must be strings in double quotes; only `photo` may
be empty. Do not add extra fields, comments, or trailing commas.

For your own photo, place a PNG, JPG/JPEG, or WebP file in your folder and set
`photo` to its filename, such as `"portrait.jpg"`. Match the filename exactly.
Use only letters, numbers, underscores, or hyphens before the extension.
Image URLs, subdirectories, and symbolic links are not supported.

Your folder should look like this:

```text
participants/
  your-name/
    profile.json
    portrait.jpg    (optional)
```

Edit only your own folder. The shared HTML and CSS generate your card for you.
See [yuhoe/profile.json](yuhoe/profile.json) for a completed example.

## 3. Check and preview your card

With Node.js 20 installed, validate your profile and build the site:

```sh
node scripts/build-collage.mjs
```

If the build fails, fix the file and field named in the error, then run it again.
No package installation is needed.

To preview with Python 3:

```sh
python3 -m http.server 8000 --directory dist
```

On Windows, use `py -m http.server 8000 --directory dist` instead.
Open [localhost:8000](http://localhost:8000) and check your details, photo, and
Telegram link. Rebuild and refresh after edits. Press `Ctrl+C` to stop the server.

## 4. Commit, push, and open a pull request

```sh
git add participants/your-name
git commit -m "Add my workshop profile card"
git push -u origin participant/your-name
```

On GitHub, click **Compare & pull request**. Choose
`TYH71/CAPT-Tech-Comm-Git-Workshop` as the base repository, `main` as the base
branch, and your `participant/your-name` branch as the compare branch.
Check that the diff contains only your profile and optional photo, then submit.

A maintainer reviews and merges your pull request. After the GitHub Pages
deployment succeeds, refresh the Contributor Wall to see your card.
