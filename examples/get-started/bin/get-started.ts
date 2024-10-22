#!/usr/bin/env node
import * as clack from '@clack/prompts';
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import waitOn from 'wait-on';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.join(__dirname, '..');

async function main() {
  clack.intro('Welcome Restack Get started'!);

  const currentDir = process.cwd();
  let targetDir: string;

  // Copy files
  const projectName = (await clack.text({
    message: 'Enter the project folder name:',
    defaultValue: 'restack-get-started',
    initialValue: 'restack-get-started',
    validate(value) {
      if (value.length === 0) return `⚠️ Project folder name is required`;
    }
  })) as string;

  if (projectName) {
    targetDir = path.join(currentDir, projectName);
    const filesToCopy = ['src', 'scheduleWorkflow.ts', 'tsconfig.json', 'package.json'];
    filesToCopy.forEach(file => {
      fs.cpSync(path.join(packageRoot, file), path.join(targetDir, file), { recursive: true });
    });
  }

  const installDependencies = (await clack.confirm({
    message: 'Install dependencies?',
		initialValue: true,
  })) as boolean;

  if (installDependencies) {
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: targetDir });
  }

	const startRestack = (await clack.confirm({
		message: 'Start Restack Engine?',
		initialValue: true,
	})) as boolean;

  if (startRestack) {
    console.log('Starting Restack Engine...');
    execSync('docker rm -f studio', { stdio: 'inherit', cwd: targetDir });
    execSync('docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/engine:main', { stdio: 'inherit', cwd: currentDir });
    console.log(`Restack Engine Studio started on http://localhost:5233`);
  }

  const openRestack = (await clack.confirm({
		message: 'Open Restack Engine Studio?',
		initialValue: true,
	})) as boolean;

  if (openRestack) {
    const s = clack.spinner();
    s.start('Waiting for Restack Engine Studio to be ready...');
    await waitOn({ resources: ['http://localhost:5233'] });
    s.stop();
    execSync('open http://localhost:5233', { stdio: 'inherit', cwd: targetDir });
  }

  const blue = '\x1b[34m';
  const noColor = '\x1b[0m';
  
  clack.outro(`
Project created successfully!

We suggest that you begin with following commands:

To navigate to the project, run: ${blue}cd ${projectName}${noColor}

To start the service, run: ${blue}npm run service${noColor}

To schedule a workflow, run: ${blue}npm run schedule${noColor}
`);
}

main();
