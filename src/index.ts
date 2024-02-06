import fs, { existsSync, mkdir } from 'fs';
import path from 'path';
import { TasksManifest } from 'projen';
import { TaskRenderer } from './lib/cache';
import { logger } from './lib/logger';

// TODO: Configurable cache path
const cachePath = path.resolve(process.cwd(), '.fasker-cache');

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

async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
}

async function cacheTasks() {
  const fileStats = getTaskJsonDetails();
  const ensureDirPromise = ensureDir(cachePath);
  const renderer = new TaskRenderer(parseTaskJson().tasks ?? {});
  const fileName = fileStats.mtime;
  await ensureDirPromise;
  fs.writeFileSync(path.join(cachePath, `${fileName}.sh`), renderer.render());
}
cacheTasks()
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
