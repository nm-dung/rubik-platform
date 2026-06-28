import fs from 'node:fs';
import git from 'isomorphic-git';

const dir = 'C:/Users/Admin/Documents/Projects/rubik-platform';

const currentBranch = await git.currentBranch({ fs, dir, fullname: false });
console.log('currentBranch', currentBranch);

const branches = await git.listBranches({ fs, dir });
console.log('branches', branches);

const remotes = await git.listRemotes({ fs, dir });
console.log('remotes', remotes);
