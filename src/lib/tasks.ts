import fs from 'fs';
import path from 'path';
import { TasksManifest } from 'projen';
import { logger } from './logger';

export class TaskHandler {
  private taskPath: string = '';

  constructor() {}

  getTaskJsonDetails() {
    const taskJsonPath = taskHandler.getTaskJsonPath();
    const stats = fs.statSync(taskJsonPath);

    return stats;
  }

  parseTaskJson(): TasksManifest {
    const taskJsonPath = taskHandler.getTaskJsonPath();
    const taskJson = fs.readFileSync(taskJsonPath, 'utf-8');
    return JSON.parse(taskJson); //Assumption that tasks.json is valid
  }

  /**
   * Gets the tasks.json file path by checking .projen/tasks.json relative to package.json
   */
  getTaskJsonPath() {
    if (this.taskPath) return this.taskPath;

    const taskPath = path.resolve(process.cwd(), '.projen/tasks.json');

    if (fs.existsSync(taskPath)) {
      logger.debug(`tasks.json found at ${taskPath}`);
      this.taskPath = taskPath;
      return taskPath;
    }
    throw new Error('tasks.json not found');
  }
}

export const taskHandler = new TaskHandler();
