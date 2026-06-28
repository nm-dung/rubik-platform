import fs from 'node:fs';
import git from 'isomorphic-git';

const dir = 'C:/Users/Admin/Documents/Projects/rubik-platform';
const head = await git.resolveRef({ fs, dir, ref: 'HEAD' });
const status = await git.statusMatrix({ fs, dir });
console.log('HEAD', head);
console.log('status entries', status.length);
console.log(JSON.stringify(status.slice(0, 20), null, 2));
