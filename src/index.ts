import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import { ensureDir } from './lib/helper';
import { logger } from './lib/logger';
import { taskHandler } from './lib/tasks';
import {
  RenderOptions,
  TaskTranspiler,
  convertToFunctionName,
} from './lib/transpiler';

// TODO: Configurable cache path
const cachePath = path.resolve(process.cwd(), '.fasker-cache');

export async function cacheTasks(renderOptions: RenderOptions) {
  const fileStats = taskHandler.getTaskJsonDetails();
  const ensureDirPromise = ensureDir(cachePath);
  const transpiler = new TaskTranspiler(
    taskHandler.parseTaskJson().tasks ?? {},
  );
  const fileName = Math.floor(fileStats.mtimeMs).toString();
  await ensureDirPromise;

  const script = transpiler.render(renderOptions);
  const cacheFilePath = path.join(cachePath, `${fileName}.sh`);

  logger.debug('Caching tasks to', cacheFilePath);
  fs.writeFileSync(cacheFilePath, script);
  fs.chmodSync(cacheFilePath, '755');
}

// TODO optimise
async function execTask(taskName: string, opts: ExecTaskOptions) {
  const cache = opts.cache ?? true;
  const prettify = opts.prettify ?? false;
  const quiet = opts.quiet ?? false;

  const fileStats = taskHandler.getTaskJsonDetails();

  const fileName = Math.floor(fileStats.mtimeMs).toString();
  const scriptPath = path.join(cachePath, `${fileName}.sh`);
  if (!cache || !fs.existsSync(scriptPath)) {
    logger.debug('Cache not found. Caching tasks');
    await cacheTasks({ quiet, prettify });
  }

  const PATH = `${process.env.PATH}:${path.resolve('node_modules/.bin')}`;

  logger.info('Running task:', taskName);
  return spawnSync(scriptPath, [convertToFunctionName(taskName)], {
    shell: true,
    cwd: process.cwd(),
    env: {
      ...process.env,
      PATH,
    },
    stdio: 'inherit',
  });
}

interface ExecTaskOptions {
  cache: boolean;
  prettify: boolean;
  quiet: boolean;
}

function execProjen() {
  logger.info('Running npx projen');
  spawnSync('npx', ['projen'], {
    cwd: process.cwd(),
  });
}

function cli() {
  program
    .argument(
      '[task]',
      'Task to run. If not provided, will default to running `npx projen`',
    )
    .option('--no-cache', 'Run without cache')
    .option('--prettify', 'Prettify the bash script')
    .option('-q --quiet', 'Quiet mode')
    .action(async (task, options) => {
      if (!task) {
        execProjen();
      } else {
        await execTask(task, options);
      }
    });
  program.parse();
}

cli();
