import { spawnSync } from 'child_process';
import fs, { existsSync } from 'fs';
import path from 'path';
import { program } from 'commander';
import { TasksManifest } from 'projen';
import { logger } from './lib/logger';
import { TaskRenderer, convertToBashFunctionName } from './lib/renderer';

// TODO: Configurable cache path
const cachePath = path.resolve(process.cwd(), '.fasker-cache');

// TODO: Commander option
const prettify: boolean = true;

/**
 * Gets the tasks.json file path by checking
 * 1. Current directory
 * 2. .projen/tasks.json relative to package.json
 */
function getTaskJsonPath() {
  const pathsToCheck = [
    path.resolve('tasks.json'),
    path.resolve(process.cwd(), '.projen/tasks.json'),
  ];

  for (const p of pathsToCheck) {
    if (fs.existsSync(p)) {
      logger.debug(`tasks.json found at ${p}`);
      return p;
    }
  }

  throw new Error('tasks.json not found');
}

function getTaskJsonDetails() {
  const taskJsonPath = getTaskJsonPath();
  const stats = fs.statSync(taskJsonPath);

  console.log(stats.mtimeMs);

  return stats;
}

function parseTaskJson(): TasksManifest {
  const taskJsonPath = getTaskJsonPath();
  const taskJson = fs.readFileSync(taskJsonPath, 'utf-8');
  return JSON.parse(taskJson); //Assumption that tasks.json is valid
}

async function ensureDir(dir: string) {
  if (!existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
}

// TODO: find a package or something to do this. Good enough for now
function prettifyBash(script: string) {
  let depth = 0;
  const lines = script.split('\n');
  const output: string[] = [];
  for (const line of lines) {
    if (line.includes('}')) {
      depth--;
    }
    output.push(' '.repeat(depth * 2) + line);
    if (line.includes('{')) {
      depth++;
    }
  }
  return output.join('\n');
}

export async function cacheTasks() {
  const fileStats = getTaskJsonDetails();
  const ensureDirPromise = ensureDir(cachePath);
  const renderer = new TaskRenderer(parseTaskJson().tasks ?? {});
  const fileName = Math.floor(fileStats.mtimeMs).toString();
  await ensureDirPromise;

  const script = renderer.render();
  const cacheFilePath = path.join(cachePath, `${fileName}.sh`);

  logger.debug('Caching tasks to', cacheFilePath);
  fs.writeFileSync(cacheFilePath, prettify ? prettifyBash(script) : script);
  fs.chmodSync(cacheFilePath, '755');
}

// TODO optimise
async function execTask(taskName: string) {
  const fileStats = getTaskJsonDetails();

  const fileName = Math.floor(fileStats.mtimeMs).toString();
  const scriptPath = path.join(cachePath, `${fileName}.sh`);
  if (!fs.existsSync(scriptPath)) {
    logger.debug('Cache not found. Caching tasks');
    await cacheTasks();
  }

  const PATH = `${process.env.PATH}:${path.resolve('node_modules/.bin')}`;

  logger.info('Running task:', taskName);
  return spawnSync(scriptPath, [convertToBashFunctionName(taskName)], {
    shell: true,
    cwd: process.cwd(),
    env: {
      ...process.env,
      PATH,
    },
    stdio: 'inherit',
  });
}

// cacheTasks()
//   .then(() => {
//     console.log('Done');
//   })
//   .catch((e) => {
//     console.error(e);
//   });

function cli() {
  program.argument('<task>', 'Task to run').action(async (task) => {
    await execTask(task);
  });
  program.parse();
}

cli();
