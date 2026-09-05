import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = await mkdtemp(path.join(tmpdir(), 'capt-collage-'));
try {
  await mkdir(path.join(root, 'scripts'));
  await cp(new URL('../assets/', import.meta.url), path.join(root, 'assets'), { recursive: true });
  const script = path.join(root, 'scripts/build-collage.mjs');
  await copyFile(new URL('./build-collage.mjs', import.meta.url), script);
  const build = async () => {
    execFileSync(process.execPath, [script]);
    return readFile(path.join(root, 'dist/index.html'), 'utf8');
  };
  const empty = await build();
  assert.match(empty, /color-scheme: light/);
  assert.doesNotMatch(empty, /prefers-color-scheme: dark/);
  for (const file of ['capt-logo.png', 'tech-comm-logo.jpg']) {
    assert.ok(empty.includes('assets/' + file));
    assert.deepEqual(await readFile(path.join(root, 'dist/assets', file)), await readFile(new URL('../assets/' + file, import.meta.url)));
  }
  assert.match(empty, /Contributor Wall/);
  assert.match(empty, /<title>CAPT 15CSC Tech Comm \| Git Workshop<\/title>/);
  assert.doesNotMatch(empty, /GIT GUD/);
  assert.doesNotMatch(empty, /Wall of Bounties/);
  assert.match(empty, /CAPT 15CSC Tech Comm/);
  assert.match(empty, /0 legends on the wall/);
  assert.match(empty, /Your first PR belongs here/);
  assert.match(empty, /https:\/\/github.com\/TYH71\/CAPT-Tech-Comm-Git-Workshop\/tree\/main\/template/);
  assert.doesNotMatch(empty, /SUTD|AngKS|—|–/);
  await mkdir(path.join(root, 'participants/test-person'), { recursive: true });
  await writeFile(path.join(root, 'participants/test-person/index.html'), '<h1>Test poster</h1>');
  const filled = await build();
  assert.match(filled, /1 legend on the wall/);
  assert.match(filled, /title="test-person&#39;s workshop poster"|title="test-person's workshop poster"/);
  assert.doesNotMatch(filled, /Your first PR belongs here/);
  assert.equal(await readFile(path.join(root, 'dist/participants/test-person/index.html'), 'utf8'), '<h1>Test poster</h1>');
  console.log('Collage checks passed: branding, empty state, participant count, and copied poster.');
} finally {
  await rm(root, { recursive: true, force: true });
}
