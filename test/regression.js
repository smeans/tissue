const assert = require('assert');
const child_process = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const repos = require('../lib/repos');

function execTissue(args) {
  const node = process.execPath;
  const script = path.join(__dirname, '..', 'bin', 'tissue');
  const result = child_process.spawnSync(node, [script].concat(args), {
    encoding: 'utf8'
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function run() {
  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'tissue-test-'));
  const repoRoot = path.resolve(workdir);
  const issueTitle = 'Regression test issue';
  const issueDescription = 'This issue was created by a regression test.';

  console.log('Using temporary repository:', repoRoot);

  const init = execTissue(['init', repoRoot]);
  assert.strictEqual(init.status, 0, `tissue init failed: ${init.stderr}`);

  const repo = repos.open(repoRoot);
  assert(repo, 'Repo should open after init');

  const issue = repo.saveIssue({
    title: issueTitle,
    description: issueDescription
  });
  assert(issue && issue.issue_id, 'Issue should have an issue_id');

  const issueFilename = fs.readdirSync(path.join(repoRoot, 'issues')).find(name =>
    name.indexOf(issue.issue_id + '-') === 0 && name.endsWith('.md')
  );
  assert(issueFilename, 'Created issue file should exist in issues folder');

  const createdPath = path.join(repoRoot, 'issues', issueFilename);
  assert(fs.existsSync(createdPath), 'Created issue file should exist on disk');

  const saved = repo.issueJson(issue.issue_id);
  assert.strictEqual(saved.title, issueTitle);
  assert(saved.description.indexOf(issueDescription) !== -1, 'Issue description should match');

  const listBefore = execTissue(['list', '--root', repoRoot]);
  assert.strictEqual(listBefore.status, 0, `tissue list failed: ${listBefore.stderr}`);
  assert(listBefore.stdout.trim().startsWith(issue.issue_id), 'List output should start with the issue id');

  const archiveResult = execTissue(['archive', issue.issue_id, '--root', repoRoot]);
  assert.strictEqual(archiveResult.status, 0, `tissue archive failed: ${archiveResult.stderr}`);

  const archivedPath = path.join(repoRoot, 'issues', 'archive', issueFilename);
  assert(fs.existsSync(archivedPath), 'Archived issue file should exist in archive folder');
  assert(!fs.existsSync(createdPath), 'Original issue file should no longer exist in issues folder');

  const repoAfterArchive = repos.open(repoRoot);
  assert(repoAfterArchive, 'Repo should still open after archive');
  assert.strictEqual(repoAfterArchive.list().length, 0, 'No active issues should remain after archive');

  const listAfter = execTissue(['list', '--root', repoRoot]);
  assert.strictEqual(listAfter.status, 0, `tissue list failed after archive: ${listAfter.stderr}`);
  assert(listAfter.stdout.trim() === '', 'List output should be empty after archive');

  console.log('Regression test passed.');
}

try {
  run();
} catch (err) {
  console.error('Regression test failed:', err && err.message ? err.message : err);
  process.exit(1);
}
