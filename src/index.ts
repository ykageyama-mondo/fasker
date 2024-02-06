import fs from 'fs';
import path from 'path';
import { TasksManifest } from 'projen';
import { TaskCache } from './lib/cache';
import { logger } from './lib/logger';
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

const cache = new TaskCache(parseTaskJson().tasks ?? {});

console.log(cache.render());
