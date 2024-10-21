#!/usr/bin/env node
import * as clack from '@clack/prompts';
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import packageJson from '../package.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.join(__dirname, '..');

async function main() {
  clack.intro('Welcome Restack Get started'!);

  const currentDir = process.cwd();

  // Copy files
  const projectName = (await clack.text({
    message: 'Enter the project folder name:',
    placeholder: './restack-get-started',
    defaultValue: 'restack-get-started',
    initialValue: 'restack-get-started',
    validate(value) {
      if (value.length === 0) return `⚠️ Project folder name is required`;
    }
  })) as string;

  if (projectName) {
    const targetDir = path.join(currentDir, projectName);
    console.log('🚀 ~ main ~ targetDir:', targetDir);
    const filesToCopy = ['src', 'scheduleWorkflow.ts', 'tsconfig.json'];
    filesToCopy.forEach(file => {
      fs.cpSync(path.join(packageRoot, file), path.join(targetDir, file), { recursive: true });
    });
    
    // Copy package.json separately and modify it
    delete packageJson.bin;
    delete packageJson.files;
    fs.writeFileSync(path.join(currentDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  }

  const installDependencies = (await clack.confirm({
    message: 'Install dependencies?',
		initialValue: true,
  })) as boolean;

  if (installDependencies) {
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: currentDir });
  }

	 const startRestack = (await clack.confirm({
		message: 'Start Restack Engine?',
		initialValue: true,
	 })) as boolean;

  if (startRestack) {
    console.log('Starting Restack Engine...');
    execSync('docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/engine:main', { stdio: 'inherit', cwd: currentDir });
  }

  clack.outro('👋 Goodbye');
}

main();
