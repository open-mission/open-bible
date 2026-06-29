#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to ask questions in console
const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
};

function runCmd(cmd, dryRun = false) {
  console.log(`\x1b[36m$ ${cmd}\x1b[0m`);
  if (dryRun) {
    console.log(`[Dry Run] Would execute: ${cmd}`);
    return '';
  }
  try {
    const output = execSync(cmd, { stdio: 'inherit' });
    return output ? output.toString() : '';
  } catch (error) {
    console.error(`\x1b[31mError executing: ${cmd}\x1b[0m`);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const bumpArg = args.find(arg => ['patch', 'minor', 'major'].includes(arg));

  console.log('\x1b[35mStarting Release Process...\x1b[0m');
  if (dryRun) {
    console.log('\x1b[33mDRY RUN MODE ENABLED - No changes will be committed, tagged, or pushed.\x1b[0m');
  }

  // 1. Check if git working directory is clean
  let statusOutput = '';
  try {
    statusOutput = execSync('git status --porcelain').toString().trim();
  } catch (e) {
    console.error('Failed to run git status. Is git installed?');
    process.exit(1);
  }

  if (statusOutput) {
    console.warn('\x1b[33mWarning: Working directory is not clean:\x1b[0m');
    console.log(statusOutput);
    const proceed = await askQuestion('Do you want to proceed anyway? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Release aborted.');
      process.exit(0);
    }
  }

  // 2. Read package.json
  const pkgPath = path.resolve(__dirname, '../package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error(`Could not find package.json at ${pkgPath}`);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const currentVersion = pkg.version;
  console.log(`Current version: \x1b[32m${currentVersion}\x1b[0m`);

  // 3. Determine new version
  let bumpType = bumpArg;
  if (!bumpType) {
    console.log('\nSelect release type:');
    console.log('1) patch (bug fixes)');
    console.log('2) minor (new features, non-breaking)');
    console.log('3) major (breaking changes)');
    console.log('4) custom (specify version)');
    const choice = await askQuestion('Choice (1-4): ');

    if (choice === '1') bumpType = 'patch';
    else if (choice === '2') bumpType = 'minor';
    else if (choice === '3') bumpType = 'major';
    else if (choice === '4') bumpType = 'custom';
    else {
      console.log('Invalid choice. Aborting.');
      process.exit(1);
    }
  }

  let nextVersion = '';
  const parts = currentVersion.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    console.error(`Invalid version format in package.json: ${currentVersion}`);
    process.exit(1);
  }

  if (bumpType === 'patch') {
    nextVersion = `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  } else if (bumpType === 'minor') {
    nextVersion = `${parts[0]}.${parts[1] + 1}.0`;
  } else if (bumpType === 'major') {
    nextVersion = `${parts[0] + 1}.0.0`;
  } else if (bumpType === 'custom') {
    nextVersion = await askQuestion('Enter custom version (e.g. 1.0.0): ');
    if (!/^\d+\.\d+\.\d+(-.+)?$/.test(nextVersion)) {
      console.error('Invalid version format.');
      process.exit(1);
    }
  }

  console.log(`Bumping version to: \x1b[32m${nextVersion}\x1b[0m`);
  const confirm = await askQuestion(`Create release v${nextVersion}? (y/N): `);
  if (confirm.toLowerCase() !== 'y') {
    console.log('Release aborted.');
    process.exit(0);
  }

  // 4. Update package.json
  pkg.version = nextVersion;
  if (!dryRun) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('Updated package.json');
  } else {
    console.log(`[Dry Run] Would write to package.json: version = ${nextVersion}`);
  }

  // 5. Git commit & tag
  const tag = `v${nextVersion}`;
  runCmd(`git add package.json`, dryRun);
  runCmd(`git commit -m "chore(release): ${tag}"`, dryRun);
  runCmd(`git tag -a ${tag} -m "${tag}"`, dryRun);

  // 6. Push code & tags
  // Determine current branch name
  let currentBranch = 'develop';
  try {
    currentBranch = execSync('git branch --show-current').toString().trim();
  } catch (e) {
    // Fallback if git command fails or is detached
  }
  runCmd(`git push origin ${currentBranch}`, dryRun);
  runCmd(`git push origin ${tag}`, dryRun);

  // 7. Create GitHub Release
  runCmd(`gh release create ${tag} --generate-notes`, dryRun);

  console.log(`\n\x1b[32mSuccessfully released ${tag}!\x1b[0m`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
