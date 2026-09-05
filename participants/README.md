# Add your profile to the Contributor Wall

Create your own folder here, fill in a JSON profile, and submit a pull request.
Your card appears on the [Contributor Wall](https://tyh71.github.io/CAPT-Tech-Comm-Git-Workshop/)
after your pull request is merged and deployment succeeds.

## 1. Get the repository and create a branch

You need Git and a GitHub account. Follow the [clone instructions](../README.md#clone-the-repository)
first. If you do not have write access, fork the repository and clone your fork.

Run all commands below from the `CAPT-Tech-Comm-Git-Workshop` folder
(the repository root). Replace `your-name` everywhere with your lowercase GitHub
username, for example `alex-tan`. Use letters, numbers, and single hyphens
between them; do not start or end with a hyphen.

```sh
git checkout -b participants/your-name
```

This creates your branch and switches to it. Run it once, before editing.

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

Open `participants/your-name/profile.json` in your text editor. Replace the
example details below with your own, then save the file:

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

Keep all five fields and the double quotes around each value. Only `photo` may
be empty. Do not add fields or comments, or put a comma after the last value.

For your own photo, place a PNG, JPG/JPEG, or WebP file in your folder and set
`photo` to its filename, such as `"portrait.jpg"`. Match the filename exactly.
Use only letters, numbers, underscores, or hyphens before the extension.
Use an actual image file directly in your folder, not a web link, nested folder,
or file shortcut (symbolic link).

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

With Node.js 20 installed, check your profile and generate the website:

```sh
node scripts/build-collage.mjs
```

If the build fails, fix the file and field named in the error, then run it again.
No package installation is needed.

Optional: start a local preview with Python 3:

```sh
python3 -m http.server 8000 --directory dist
```

On Windows, use `py -m http.server 8000 --directory dist` instead.
Open [localhost:8000](http://localhost:8000) and check your details, photo, and
Telegram link. After edits, press `Ctrl+C`, run the build command again, and
restart the server. Press `Ctrl+C` before moving to the Git commands below.

## 4. Commit, push, and open a pull request

Run these commands to select your files, save a commit, and upload your branch:

```sh
git add participants/your-name
git commit -m "Add my workshop profile card"
git push -u origin participants/your-name
```

On GitHub, click **Compare & pull request**. Choose
`TYH71/CAPT-Tech-Comm-Git-Workshop` as the base repository, `main` as the base
branch, and your `participants/your-name` branch as the compare branch.
In **Files changed**, check that only your profile and optional photo are included.
Add a title such as **Add Alex’s profile card**, then click **Create pull request**.

A maintainer reviews and merges your pull request. After the GitHub Pages
deployment succeeds, refresh the Contributor Wall to see your card.
