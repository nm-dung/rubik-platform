import fs from 'node:fs';
import git from 'isomorphic-git';

const dir = 'C:/Users/Admin/Documents/Projects/rubik-platform';
const headOid = await git.resolveRef({ fs, dir, ref: 'HEAD' });
const commit = await git.readCommit({ fs, dir, oid: headOid });

if (!commit.commit.parent || commit.commit.parent.length === 0) {
  throw new Error('No parent commit found to reset to.');
}

const parentOid = commit.commit.parent[0];
const branch = await git.currentBranch({ fs, dir });
const ref = branch && branch.startsWith('refs/heads/') ? branch : branch ? `refs/heads/${branch}` : 'HEAD';

await git.writeRef({ fs, dir, ref, value: parentOid, force: true });
console.log(`Reset branch ref ${ref} to ${parentOid}`);
