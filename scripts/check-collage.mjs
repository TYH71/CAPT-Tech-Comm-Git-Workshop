import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = await mkdtemp(path.join(tmpdir(), 'capt-collage-'));
try {
  await mkdir(path.join(root, 'scripts'));
  await cp(new URL('../assets/', import.meta.url), path.join(root, 'assets'), { recursive: true });
  await cp(new URL('../template/', import.meta.url), path.join(root, 'template'), { recursive: true });
  await mkdir(path.join(root, 'participants'));
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
  const profile = { name: 'Test <Person>', heading: 'WANTED', tagline: 'Learning Git', bounty: '1,000', photo: '', photoAlt: 'Portrait' };
  const source = path.join(root, 'participants/test-person/profile.json');
  await writeFile(source, JSON.stringify(profile));
  const filled = await build();
  assert.match(filled, /1 legend on the wall/);
  assert.match(filled, /Test &lt;Person&gt;/);
  assert.doesNotMatch(filled, /Your first PR belongs here/);
  const posterPath = path.join(root, 'dist/participants/test-person/index.html');
  const poster = await readFile(posterPath, 'utf8');
  assert.match(poster, /Test &lt;Person&gt;/);
  assert.match(poster, /assets\/tech-comm-logo.jpg/);
  assert.doesNotMatch(poster, /\{\{/);
  await copyFile(new URL('../assets/capt-logo.png', import.meta.url), path.join(root, 'participants/test-person/photo.png'));
  await writeFile(source, JSON.stringify({ ...profile, photo: 'photo.png' }));
  await build();
  assert.match(await readFile(posterPath, 'utf8'), /src="photo.png"/);
  assert.deepEqual(await readFile(path.join(root, 'dist/participants/test-person/photo.png')), await readFile(new URL('../assets/capt-logo.png', import.meta.url)));
  for (const bad of [{ ...profile, name: '' }, { ...profile, photo: '../secret.png' }, { ...profile, photo: 'missing.png' }, { ...profile, extra: true }, null]) {
    await writeFile(source, JSON.stringify(bad));
    assert.throws(() => execFileSync(process.execPath, [script], { stdio: 'pipe' }), /profile.json/);
  }
  await writeFile(source, '{');
  assert.throws(() => execFileSync(process.execPath, [script], { stdio: 'pipe' }), /valid JSON/);
  console.log('Collage checks passed: branding, empty state, participant count, and copied poster.');
} finally {
  await rm(root, { recursive: true, force: true });
}
