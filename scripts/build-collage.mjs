#!/usr/bin/env node
/** Build the Contributor Wall from participant JSON and a shared profile card. */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PARTICIPANTS_DIR = path.join(ROOT, "participants");
const DIST = path.join(ROOT, "dist");

// Repo / Pages info (used for links in the page chrome)
const REPO_URL = "https://github.com/TYH71/CAPT-Tech-Comm-Git-Workshop";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

async function findParticipants() {
  const entries = await fs.readdir(PARTICIPANTS_DIR, { withFileTypes: true });
  const people = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folder = path.join(PARTICIPANTS_DIR, entry.name);
    const source = path.join(folder, "profile.json");
    const fail = (message) => { throw new Error(`${source}: ${message}`); };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)) fail("folder name must use lowercase letters, numbers, and hyphens");
    let data;
    try { data = JSON.parse(await fs.readFile(source, "utf8")); }
    catch (error) { fail(`cannot read valid JSON: ${error.message}`); }
    if (!data || typeof data !== "object" || Array.isArray(data)) fail("expected a JSON object");
    const limits = { name: 40, tagline: 80, telegram: 33, photo: 100, photoAlt: 120 };
    for (const key of Object.keys(data)) if (!Object.hasOwn(limits, key)) fail(`unknown field: ${key}`);
    for (const [key, max] of Object.entries(limits)) {
      if (typeof data[key] !== "string" || data[key].length > max || (key !== "photo" && !data[key].trim())) {
        fail(`${key} must be ${key === "photo" ? "a" : "a non-empty"} string of at most ${max} characters`);
      }
    }
    if (!/^@[a-zA-Z0-9_]{1,32}$/.test(data.telegram)) fail("telegram must start with @ and contain only letters, numbers, or underscores (up to 32)");
    let photoPath;
    if (data.photo) {
      if (!/^[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/i.test(data.photo)) fail("photo must be a local PNG, JPG, or WebP filename");
      photoPath = path.join(folder, data.photo);
      const stat = await fs.lstat(photoPath).catch(() => null);
      if (!stat?.isFile() || stat.isSymbolicLink()) fail("photo must exist as a regular file in your participant folder");
    }
    people.push({ slug: entry.name, data, photoPath });
  }
  return people.sort((a, b) => a.slug.localeCompare(b.slug));
}

function card({ slug, data, photoPath }, standalone = false) {
  const photo = photoPath
    ? `${standalone ? "" : `participants/${slug}/`}${data.photo}`
    : `${standalone ? "../../" : ""}assets/tech-comm-logo.jpg`;
  return `
      <article class="profile-card">
        <img class="profile-photo${photoPath ? "" : " profile-photo--logo"}" src="${escapeHtml(photo)}" alt="${escapeHtml(photoPath ? data.photoAlt : "Tech Comm logo")}" width="600" height="600" loading="lazy" />
        <div class="profile-details">
          <p class="profile-tagline">${escapeHtml(data.tagline)}</p>
          <${standalone ? "h1" : "h2"} class="profile-name">${escapeHtml(data.name)}</${standalone ? "h1" : "h2"}>
        </div>
        <a class="profile-telegram" href="https://t.me/${data.telegram.slice(1)}" target="_blank" rel="noopener">${escapeHtml(data.telegram)}</a>
      </article>`;
}

function page(people) {
  const count = people.length;
  const cards = people.map(person => card(person)).join("\n");
  const emptyState = `
        <div class="empty">
          <h2>Your first PR belongs here.</h2>
          <p>Copy the JSON template, add your details, and open a pull request. Once merged, it joins the wall.</p>
          <a class="pill link" href="${REPO_URL}/tree/main/template" target="_blank" rel="noopener">Get the template</a>
        </div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CAPT 15CSC Tech Comm | Git Workshop</title>
<meta name="description" content="The CAPT 15CSC Tech Comm Contributor Wall. Learn Git and GitHub by sharing your profile with a pull request." />
<meta name="color-scheme" content="light" />
<link rel="stylesheet" href="assets/profile.css" />
<style>
  :root {
    color-scheme: light;
    --canvas: #f5efe3;
    --surface: #fcfaf5;
    --ink: #28231f;
    --muted: #675c52;
    --line: #ded5c7;
    --maroon: #741b3c;
    --yellow: #efdfa4;
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--canvas);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
    line-height: 1.6;
  }
  /* White masthead preserves the supplied logos' original backgrounds. */
  .masthead { background: #fff; border-bottom: 1px solid var(--line); }
  .logos {
    max-width: 1040px;
    margin: auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }
  .logos img { display: block; object-fit: contain; height: auto; }
  .capt-logo { width: 76px; }
  .tech-logo { width: 136px; }
  .hero { padding: 48px 24px 40px; text-align: center; }
  .brand { margin: 0; color: var(--maroon); font-weight: 650; font-size: 15px; }
  .wordmark { margin: 0; font-size: clamp(2.5rem, 8vw, 5.5rem); line-height: 1; letter-spacing: -0.06em; font-weight: 850; }
  .wordmark .workshop { color: var(--maroon); }
  .tagline { max-width: 44ch; margin: 20px auto 0; color: var(--muted); font-size: 18px; }
  code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 0.9em; }
  .pills { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; }
  /* Buttons use 6px corners; profile cards use 8px; count is a compact badge. */
  .pill { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; border: 1px solid var(--maroon); border-radius: 6px; color: var(--maroon); font-size: 14px; font-weight: 650; text-decoration: none; white-space: nowrap; }
  .pill.count { padding: 6px 12px; background: var(--yellow); border-color: transparent; border-radius: 999px; color: var(--ink); font-size: 13px; }
  .pill.link:hover { background: var(--maroon); color: var(--surface); }
  .pill.link:active { transform: scale(0.98); }
  a:focus-visible { outline: 3px solid var(--maroon); outline-offset: 4px; }
  .wall { width: 100%; max-width: 1040px; margin: 0 auto; padding: 0 24px 48px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
  .empty { border-top: 1px solid var(--line); padding: 36px 16px 12px; text-align: center; }
  .empty h2 { margin: 0; font-size: clamp(1.4rem, 4vw, 1.8rem); line-height: 1.25; letter-spacing: -0.025em; }
  .empty p { max-width: 48ch; margin: 12px auto 20px; color: var(--muted); }
  .empty .link { background: var(--maroon); color: var(--surface); }
  .empty .link:hover { background: #57142d; }
  footer { margin-top: auto; padding: 24px; text-align: center; color: var(--muted); font-size: 13px; }
  @media (max-width: 767px) {
    .logos { padding: 16px 20px; flex-wrap: wrap; gap: 12px 24px; }
    .brand { flex-basis: 100%; text-align: center; order: 1; }
    .capt-logo { width: 64px; }
    .tech-logo { width: 124px; }
    .hero { padding: 32px 20px; }
    .tagline { font-size: 16px; }
    .wall { padding: 0 20px 24px; }
    .grid { grid-template-columns: 1fr; max-width: 420px; margin: auto; }
    .empty { padding: 28px 0 8px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pill.link:active { transform: none; }
  }
</style>
</head>
<body>
  <div class="masthead">
    <div class="logos" aria-label="Workshop organisers">
      <img class="capt-logo" src="assets/capt-logo.png" width="338" height="356" alt="College of Alice &amp; Peter Tan, National University of Singapore" />
      <p class="brand">CAPT 15CSC Tech Comm</p>
      <img class="tech-logo" src="assets/tech-comm-logo.jpg" width="414" height="216" alt="Tech Comm" />
    </div>
  </div>
  <header class="hero">
    <h1 class="wordmark"><span class="git">Git</span> <span class="workshop">Workshop</span></h1>
    <p class="tagline">The Contributor Wall. Your profiles, shipped to <code>main</code> with real pull requests.</p>
    <div class="pills">
      <span class="pill count">${count} legend${count === 1 ? "" : "s"} on the wall</span>
      <a class="pill link" href="${REPO_URL}" target="_blank" rel="noopener">View the repo</a>
    </div>
  </header>

  <main class="wall">
    ${count ? `<div class="grid">${cards}\n    </div>` : emptyState}
  </main>

  <footer>
    CAPT 15CSC Tech Comm Git &amp; GitHub Workshop.<br />
    Profiles appear automatically after changes land on main.
  </footer>
</body>
</html>
`;
}

async function main() {
  // Validate all submissions before replacing the previous build.
  const people = await findParticipants();
  const template = await fs.readFile(path.join(ROOT, "template/index.html"), "utf8");
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  await fs.cp(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });
  await fs.copyFile(path.join(ROOT, "template/style.css"), path.join(DIST, "assets/profile.css"));
  for (const person of people) {
    const { slug, data, photoPath } = person;
    const destination = path.join(DIST, "participants", slug);
    await fs.mkdir(destination, { recursive: true });
    const html = template.replace(/\{\{(name|card)\}\}/g, (_, key) => key === "card" ? card(person, true) : escapeHtml(data.name));
    await fs.writeFile(path.join(destination, "index.html"), html);
    if (photoPath) await fs.copyFile(photoPath, path.join(destination, data.photo));
  }

  await fs.writeFile(path.join(DIST, "index.html"), page(people), "utf8");
  // Stop GitHub Pages' Jekyll from ignoring folders/files it doesn't like.
  await fs.writeFile(path.join(DIST, ".nojekyll"), "", "utf8");

  console.log(`✅ Built collage with ${people.length} participant(s):`);
  for (const p of people) console.log(`   • ${p.slug}`);
  console.log(`📁 Output: ${path.relative(ROOT, DIST)}/`);
}

main().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});