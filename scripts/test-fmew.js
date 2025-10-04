#!/usr/bin/env node

/**
 * FMEW Framework Test Script
 *
 * Quick validation that all FMEW components are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧪 Testing FMEW Framework Configuration...\n');

const tests = [
  {
    name: 'Husky Installation',
    test: () => fs.existsSync(path.join(projectRoot, '.husky')),
    fix: 'Run: npx husky init'
  },
  {
    name: 'Pre-commit Hook',
    test: () => fs.existsSync(path.join(projectRoot, '.husky', 'pre-commit')),
    fix: 'Create .husky/pre-commit file'
  },
  {
    name: 'Commit Message Hook',
    test: () => fs.existsSync(path.join(projectRoot, '.husky', 'commit-msg')),
    fix: 'Create .husky/commit-msg file'
  },
  {
    name: 'Lint-staged Configuration',
    test: () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
      return !!packageJson['lint-staged'];
    },
    fix: 'Add lint-staged configuration to package.json'
  },
  {
    name: 'Prettier Configuration',
    test: () => fs.existsSync(path.join(projectRoot, '.prettierrc.json')),
    fix: 'Create .prettierrc.json file'
  },
  {
    name: 'ESLint Enhanced Configuration',
    test: () => {
      const eslintConfig = fs.readFileSync(path.join(projectRoot, 'eslint.config.js'), 'utf8');
      return eslintConfig.includes('import/order') && eslintConfig.includes('unused-imports');
    },
    fix: 'Update eslint.config.js with FMEW rules'
  },
  {
    name: 'Renovate Configuration',
    test: () => fs.existsSync(path.join(projectRoot, 'renovate.json')),
    fix: 'Create renovate.json file'
  },
  {
    name: 'FMEW Validation Scripts',
    test: () => {
      const scripts = [
        'validate-dependencies.js',
        'validate-imports.js',
        'validate-css-classes.js',
        'validate-build.js'
      ];
      return scripts.every(script => fs.existsSync(path.join(projectRoot, 'scripts', script)));
    },
    fix: 'Create all FMEW validation scripts'
  },
  {
    name: 'FMEW Framework Documentation',
    test: () => fs.existsSync(path.join(projectRoot, 'FMEW_FRAMEWORK.md')),
    fix: 'Create FMEW_FRAMEWORK.md documentation'
  },
  {
    name: 'Required Dependencies',
    test: () => {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const required = ['husky', 'lint-staged', 'prettier', 'eslint-plugin-import', 'eslint-plugin-unused-imports'];
      return required.every(dep => deps[dep]);
    },
    fix: 'Install missing FMEW dependencies'
  }
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    if (test.test()) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   Fix: ${test.fix}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${test.name} (Error: ${error.message})`);
    console.log(`   Fix: ${test.fix}`);
    failed++;
  }
}

console.log(`\n📊 FMEW Framework Test Results:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 FMEW Framework is fully configured and ready!');
  console.log('💡 You can now commit with confidence knowing all quality gates are active.');
} else {
  console.log('\n⚠️  FMEW Framework needs attention.');
  console.log('Please address the failed tests above to ensure full protection.');
}

console.log('\n🔍 Quick Framework Test:');
console.log('   Try committing a change to see FMEW validation in action!');
console.log('   git add . && git commit -m "test: verify FMEW framework"');

process.exit(failed === 0 ? 0 : 1);