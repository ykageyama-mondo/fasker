import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import { ensureDir } from './lib/helper';
import { logger } from './lib/logger';
import { TaskRenderer, convertToBashFunctionName } from './lib/renderer';
import { taskHandler } from './lib/tasks';

// TODO: Configurable cache path
const cachePath = path.resolve(process.cwd(), '.fasker-cache');

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

export async function cacheTasks(prettify: boolean) {
  const fileStats = taskHandler.getTaskJsonDetails();
  const ensureDirPromise = ensureDir(cachePath);
  const renderer = new TaskRenderer(taskHandler.parseTaskJson().tasks ?? {});
  const fileName = Math.floor(fileStats.mtimeMs).toString();
  await ensureDirPromise;

  const script = renderer.render();
  const cacheFilePath = path.join(cachePath, `${fileName}.sh`);

  logger.debug('Caching tasks to', cacheFilePath);
  fs.writeFileSync(cacheFilePath, prettify ? prettifyBash(script) : script);
  fs.chmodSync(cacheFilePath, '755');
}

// TODO optimise
async function execTask(taskName: string, opts: ExecTaskOptions) {
  const cache = opts.cache ?? true;
  const prettify = opts.prettify ?? false;

  const fileStats = taskHandler.getTaskJsonDetails();

  const fileName = Math.floor(fileStats.mtimeMs).toString();
  const scriptPath = path.join(cachePath, `${fileName}.sh`);
  if (!cache || !fs.existsSync(scriptPath)) {
    logger.debug('Cache not found. Caching tasks');
    await cacheTasks(prettify);
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

interface ExecTaskOptions {
  cache: boolean;
  prettify: boolean;
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
