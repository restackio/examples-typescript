#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageRoot = path.join(__dirname, '..');
const currentDir = process.cwd();

function copyFiles() {
  const filesToCopy = ['src', 'scheduleWorkflow.ts', 'tsconfig.json'];
  filesToCopy.forEach(file => {
    fs.cpSync(path.join(packageRoot, file), path.join(currentDir, file), { recursive: true });
  });
  
  // Copy package.json separately and modify it
  const packageJson = require(path.join(packageRoot, 'package.json'));
  delete packageJson.bin;
  delete packageJson.files;
  fs.writeFileSync(path.join(currentDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}

function installDependencies() {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: currentDir });
}

function main() {
  console.log('Creating Restack get-started project...');
  copyFiles();
  installDependencies();
  console.log('Project created successfully!');
  console.log('To start the service, run: npm run service');
  console.log('To schedule a workflow, run: npm run schedule');
}

main();