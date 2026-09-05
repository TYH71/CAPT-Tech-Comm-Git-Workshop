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
const REPO_URL = "https://github.com/AngKS/SUTD-Git-Gud-2026-Workshop";

// A small palette so every card gets its own accent colour.
const PALETTE = ["#FF5A5A", "#5C7CFA", "#FFB020", "#42C76A", "#9B6BFF", "#FF7AB8", "#00BCD4"];

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

// Deterministic colour from a name so a person always gets the same accent.
const colourFor = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

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
  const accent = colourFor(name);
  const href = `participants/${encodeURIComponent(name)}/index.html`;
  return `
        <a class="card" href="${href}" target="_blank" rel="noopener" style="--accent:${accent}">
          <div class="frame">
            <iframe src="${href}" title="${safe}'s bounty poster" loading="lazy" scrolling="no" tabindex="-1"></iframe>
            <span class="open">View ↗</span>
          </div>
          <div class="handle"><span class="dot"></span>@${safe}</div>
        </a>`;
}

function page(people) {
  const count = people.length;
  const cards = people.map(card).join("\n");
  const emptyState = `
        <div class="empty">
          <p>No bounties yet — be the first! Open a pull request and your poster appears right here.</p>
        </div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>GIT GUD — Wall of Bounties</title>
<meta name="description" content="Every bounty poster on this wall was shipped to main with a pull request. SUTD GIT GUD 2026." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --cream: #fbf0df;
    --card-bg: #fff8ec;
    --ink: #21190f;
    --muted: #8a7c69;
    --line: #eadfca;
    --coral: #ff5a5a;
    --blue: #5c7cfa;
    --yellow: #ffc83d;
    --green: #42c76a;
    --purple: #9b6bff;
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    background: var(--cream);
    color: var(--ink);
    font-family: "Poppins", system-ui, sans-serif;
    line-height: 1.5;
    overflow-x: hidden;
  }

  /* ---------- Hero ---------- */
  .hero {
    position: relative;
    overflow: hidden;
    padding: clamp(2.5rem, 8vw, 5rem) 1.25rem clamp(1.5rem, 4vw, 2.5rem);
    text-align: center;
  }
  .branch-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }
  .hero > * { position: relative; z-index: 1; }
  .wordmark {
    font-family: "Fredoka", sans-serif;
    font-weight: 700;
    font-size: clamp(3rem, 13vw, 7.5rem);
    line-height: 0.92;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .wordmark .git { color: var(--ink); }
  .wordmark .gud { color: var(--coral); }
  .tagline {
    max-width: 40ch;
    margin: 1rem auto 0;
    font-size: clamp(1rem, 2.6vw, 1.2rem);
    color: #6f6253;
    font-weight: 500;
  }
  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    justify-content: center;
    margin-top: 1.6rem;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    background: var(--card-bg);
    border: 2px solid var(--ink);
    border-radius: 999px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    color: var(--ink);
    box-shadow: 3px 3px 0 rgba(33, 25, 15, 0.12);
  }
  .pill.count { background: var(--coral); color: #fff; border-color: var(--coral); }
  .pill.link { transition: transform 0.12s ease; }
  .pill.link:hover { transform: translateY(-2px); }
  .pill .emoji { font-size: 1.05rem; }

  /* ---------- Gallery ---------- */
  .wall {
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(1rem, 4vw, 2.5rem) clamp(0.9rem, 4vw, 2rem) 3rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(clamp(150px, 42vw, 230px), 1fr));
    gap: clamp(0.8rem, 2.5vw, 1.4rem);
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    background: var(--card-bg);
    border: 2px solid var(--line);
    border-top: 6px solid var(--accent);
    border-radius: 16px;
    padding: 0.6rem 0.6rem 0.7rem;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 6px 18px rgba(33, 25, 15, 0.07);
    transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 28px rgba(33, 25, 15, 0.16);
    border-color: var(--accent);
  }
  .frame {
    position: relative;
    aspect-ratio: 3 / 4;
    border-radius: 11px;
    overflow: hidden;
    background: #1a1a1a;
  }
  .frame iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    pointer-events: none; /* let the whole card be the link */
  }
  .open {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.62);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.22rem 0.5rem;
    border-radius: 999px;
    opacity: 0;
    transition: opacity 0.14s ease;
  }
  .card:hover .open { opacity: 1; }
  .handle {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 600;
    font-size: 0.92rem;
    padding: 0 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .handle .dot {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent);
  }

  .empty {
    text-align: center;
    color: var(--muted);
    padding: 3rem 1rem;
    font-weight: 500;
  }

  /* ---------- Footer ---------- */
  footer {
    text-align: center;
    padding: 2rem 1.25rem 3rem;
    color: #8a7c69;
    font-size: 0.9rem;
  }
  footer a { color: var(--blue); font-weight: 600; text-decoration: none; }
  footer a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <header class="hero">
    <svg class="branch-bg" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="#e7d8bd" stroke-width="10" stroke-linecap="round">
        <path d="M120 360 L120 180 Q120 120 180 120 L300 120" />
        <path d="M120 250 Q120 200 170 200 L250 200" />
        <circle cx="120" cy="360" r="10" fill="#e7d8bd" stroke="none" />
        <circle cx="300" cy="120" r="22" />
        <circle cx="250" cy="200" r="16" />
        <path d="M1080 40 L1080 230 Q1080 290 1020 290 L900 290" />
        <path d="M1080 150 Q1080 200 1030 200 L960 200" />
        <circle cx="1080" cy="40" r="22" />
        <circle cx="900" cy="290" r="16" />
        <circle cx="960" cy="200" r="13" />
      </g>
    </svg>
    <h1 class="wordmark"><span class="git">GIT</span> <span class="gud">GUD</span></h1>
    <p class="tagline">The Wall of Bounties — every poster here was shipped to <code>main</code> with a real pull request. 🏴‍☠️</p>
    <div class="pills">
      <span class="pill count"><span class="emoji">🤩</span>${count} legend${count === 1 ? "" : "s"} on the wall</span>
      <span class="pill"><span class="emoji">🎓</span>SUTD · GIT GUD 2026</span>
      <a class="pill link" href="${REPO_URL}" target="_blank" rel="noopener"><span class="emoji">⭐</span>View the repo</a>
    </div>
  </header>

  <main class="wall">
    ${count ? `<div class="grid">${cards}\n    </div>` : emptyState}
  </main>

  <footer>
    Built automatically by a GitHub Actions workflow every time a PR is merged ·
    <a href="${REPO_URL}" target="_blank" rel="noopener">source on GitHub</a>
  </footer>
</body>
</html>
`;
}

async function main() {
  // Fresh dist/
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });

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