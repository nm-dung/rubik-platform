import fs from 'node:fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

const dir = 'C:/Users/Admin/Documents/Projects/rubik-platform';
const message = 'Add lesson detail experience and coach contribution workflow';

const status = await git.statusMatrix({ fs, dir });
const hasChanges = status.some((row) => row[2] !== ' ' || row[3] !== ' ' || row[4] !== ' ');

if (!hasChanges) {
  console.log('No changes to commit.');
  process.exit(0);
}

await git.add({ fs, dir, filepath: '.' });

await git.commit({
  fs,
  dir,
  message,
  author: {
    name: 'GitHub Copilot',
    email: 'copilot@example.com',
    timestamp: Math.floor(Date.now() / 1000),
    timezoneOffset: 0,
  },
  committer: {
    name: 'GitHub Copilot',
    email: 'copilot@example.com',
    timestamp: Math.floor(Date.now() / 1000),
    timezoneOffset: 0,
  },
});

console.log('Committed successfully.');

try {
  await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'HEAD:main',
  });
  console.log('Pushed successfully.');
} catch (error) {
  console.error('Push failed:', error.message);
  process.exit(1);
}
