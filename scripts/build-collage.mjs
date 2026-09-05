#!/usr/bin/env node
/**
 * build-collage.mjs
 * ---------------------------------------------------------------------------
 * Scans participants/ and builds a mobile-responsive "Wall of Bounties"
 * collage into dist/ for GitHub Pages.
 *
 * Each participant folder (participants/<name>/index.html) is copied as-is
 * into dist/participants/<name>/ and shown as an isolated <iframe> card, so
 * whatever wild CSS someone writes can never break the gallery layout.
 *
 * No npm dependencies — runs on a clean Node 18/20.
 * ---------------------------------------------------------------------------
 */

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
  let entries;
  try {
    entries = await fs.readdir(PARTICIPANTS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  const people = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const indexPath = path.join(PARTICIPANTS_DIR, e.name, "index.html");
    try {
      await fs.access(indexPath);
      people.push(e.name);
    } catch {
      // folder without an index.html — skip it
    }
  }
  // Alphabetical, but keep the seed "example" at the very end.
  people.sort((a, b) => {
    if (a === "example") return 1;
    if (b === "example") return -1;
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
  return people;
}

function card(name) {
  const safe = escapeHtml(name);
  const href = `participants/${encodeURIComponent(name)}/index.html`;
  return `
        <a class="card" href="${href}" target="_blank" rel="noopener">
          <div class="frame">
            <iframe src="${href}" title="${safe}'s bounty poster" loading="lazy" scrolling="no" tabindex="-1"></iframe>
          </div>
          <div class="handle">@${safe}</div>
        </a>`;
}

function page(people) {
  const count = people.length;
  const cards = people.map(card).join("\n");
  const emptyState = `
        <div class="empty">
          <h2>Your first PR belongs here.</h2>
          <p>Copy the starter poster, make it yours, and open a pull request. Once merged, it joins the wall.</p>
          <a class="pill link" href="${REPO_URL}/tree/main/template" target="_blank" rel="noopener">Get the template</a>
        </div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CAPT 15CSC Tech Comm | GIT GUD</title>
<meta name="description" content="The CAPT 15CSC Tech Comm Wall of Bounties. Learn Git and GitHub by shipping your own poster with a pull request." />
<meta name="color-scheme" content="light" />
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
    justify-content: space-between;
    gap: 24px;
  }
  .logos img { display: block; object-fit: contain; height: auto; }
  .capt-logo { width: 100px; }
  .tech-logo { width: 180px; }
  .hero { padding: 48px 24px 40px; text-align: center; }
  .brand { margin: 0 0 16px; color: var(--maroon); font-weight: 650; font-size: 15px; }
  .wordmark { margin: 0; font-size: clamp(3.5rem, 10vw, 6rem); line-height: 1; letter-spacing: -0.06em; font-weight: 850; }
  .wordmark .gud { color: var(--maroon); }
  .tagline { max-width: 44ch; margin: 20px auto 0; color: var(--muted); font-size: 18px; }
  code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 0.9em; }
  .pills { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; }
  /* Buttons use 6px corners; poster frames use 8px; count is a compact badge. */
  .pill { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; border: 1px solid var(--maroon); border-radius: 6px; color: var(--maroon); font-size: 14px; font-weight: 650; text-decoration: none; white-space: nowrap; }
  .pill.count { padding: 6px 12px; background: var(--yellow); border-color: transparent; border-radius: 999px; color: var(--ink); font-size: 13px; }
  .pill.link:hover { background: var(--maroon); color: var(--surface); }
  .pill.link:active { transform: scale(0.98); }
  a:focus-visible { outline: 3px solid var(--maroon); outline-offset: 4px; }
  .wall { width: 100%; max-width: 1040px; margin: 0 auto; padding: 0 24px 48px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
  .card { display: flex; flex-direction: column; gap: 12px; padding: 12px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; text-decoration: none; color: inherit; }
  .card:hover { border-color: var(--maroon); }
  .frame { position: relative; aspect-ratio: 3 / 4; border-radius: 8px; overflow: hidden; background: var(--canvas); }
  .frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; pointer-events: none; }
  .handle { font-size: 14px; font-weight: 650; overflow-wrap: anywhere; }
  .empty { border-top: 1px solid var(--line); padding: 36px 16px 12px; text-align: center; }
  .empty h2 { margin: 0; font-size: clamp(1.4rem, 4vw, 1.8rem); line-height: 1.25; letter-spacing: -0.025em; }
  .empty p { max-width: 48ch; margin: 12px auto 20px; color: var(--muted); }
  .empty .link { background: var(--maroon); color: var(--surface); }
  .empty .link:hover { background: #57142d; }
  footer { margin-top: auto; padding: 24px; text-align: center; color: var(--muted); font-size: 13px; }
  @media (max-width: 767px) {
    .logos { padding: 12px 20px; }
    .capt-logo { width: 78px; }
    .tech-logo { width: 150px; }
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
      <img class="tech-logo" src="assets/tech-comm-logo.jpg" width="414" height="216" alt="Tech Comm" />
    </div>
  </div>
  <header class="hero">
    <p class="brand">CAPT 15CSC Tech Comm</p>
    <h1 class="wordmark"><span class="git">GIT</span> <span class="gud">GUD</span></h1>
    <p class="tagline">The Wall of Bounties. Your posters, shipped to <code>main</code> with real pull requests.</p>
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
    Posters appear automatically after changes land on main.
  </footer>
</body>
</html>
`;
}

async function main() {
  // Fresh dist/
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

  await fs.cp(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });

  const people = await findParticipants();

  // Copy each participant folder verbatim into dist/participants/<name>/
  const distParticipants = path.join(DIST, "participants");
  await fs.mkdir(distParticipants, { recursive: true });
  for (const name of people) {
    await fs.cp(
      path.join(PARTICIPANTS_DIR, name),
      path.join(distParticipants, name),
      { recursive: true }
    );
  }

  await fs.writeFile(path.join(DIST, "index.html"), page(people), "utf8");
  // Stop GitHub Pages' Jekyll from ignoring folders/files it doesn't like.
  await fs.writeFile(path.join(DIST, ".nojekyll"), "", "utf8");

  console.log(`✅ Built collage with ${people.length} participant(s):`);
  for (const p of people) console.log(`   • ${p}`);
  console.log(`📁 Output: ${path.relative(ROOT, DIST)}/`);
}

main().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});