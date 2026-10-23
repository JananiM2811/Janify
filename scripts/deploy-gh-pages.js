// Publishes the web build in dist/ to the gh-pages branch (GitHub Pages).
//
// Why not the `gh-pages` package: it runs `git add` inside a clone of this repo,
// so our .gitignore (`node_modules/`) silently drops Expo's icon fonts, which are
// exported under dist/assets/node_modules/... and the icons go missing online.
// Here dist/ is committed as-is from a fresh repo with no .gitignore.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const projectDir = path.resolve(__dirname, '..');
const distDir = path.join(projectDir, 'dist');
const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: 'inherit' });
const gitOut = (args, cwd) => execFileSync('git', args, { cwd }).toString().trim();

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('dist/index.html not found - run "npm run deploy" so the web export runs first.');
  process.exit(1);
}

const remoteUrl = gitOut(['remote', 'get-url', 'origin'], projectDir);
const sourceCommit = gitOut(['rev-parse', '--short', 'HEAD'], projectDir);
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'janify-pages-'));

try {
  fs.cpSync(distDir, tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, '.nojekyll'), ''); // files starting with "_" must be served

  git(['init', '-q', '-b', 'gh-pages'], tmpDir);
  git(['add', '-A'], tmpDir);
  git(['-c', 'user.name=' + gitOut(['config', 'user.name'], projectDir),
       '-c', 'user.email=' + gitOut(['config', 'user.email'], projectDir),
       'commit', '-q', '-m', `Deploy web build from ${sourceCommit}`], tmpDir);
  // gh-pages only ever holds the latest generated build, so it is replaced each time
  git(['push', '-q', '--force', remoteUrl, 'gh-pages'], tmpDir);
  console.log(`Published dist/ (${sourceCommit}) to gh-pages.`);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
