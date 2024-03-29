import path from 'path';
import { TaskSpec } from 'projen';

export interface RenderOptions {
  prettify: boolean;
  quiet: boolean;
}

interface CachedTask {
  // ! inject process.env and
  env?: Record<string, string>;
  steps: string[][];
}

export const convertToFunctionName = (name: string) =>
  `fasker_${name.replaceAll(bashFunctionNameRegex, '_')}`;

// TODO refine this. Temporary because I can't be bothered figuring out the regex
const bashFunctionNameRegex = new RegExp(/[^0-9a-zA-Z_]/, 'g');

export class TaskTranspiler {
  private cachedTasks: Record<string, CachedTask> = {};
  private tasks: Record<string, TaskSpec>;
  private taskNameMapping: Record<string, string> = {};
  constructor(tasks: Record<string, TaskSpec>) {
    this.cachedTasks = {};
    this.tasks = tasks;

    this.generateTaskNameMapping(Object.keys(tasks));

    let task;
    // TODO move this so its not on the constructor
    for (task of Object.values(tasks)) {
      this.transpileTask(task);
    }
  }

  private generateTaskNameMapping(names: string[]) {
    for (const name of names) {
      if (this.taskNameMapping[name]) {
        throw new Error(`task name already exists: ${name}`);
      }
      // Prevents function naming conflicts
      this.taskNameMapping[name] = convertToFunctionName(name);
    }
  }

  // TODO improve rendering. Minimal rendering of commands. might be slow for large task manifests
  render({ prettify, quiet }: RenderOptions) {
    const lines: string[] = [];
    for (const task of Object.keys(this.cachedTasks)) {
      lines.push(
        `${this.taskNameMapping[task]} () {`,
        quiet ? '' : `echo "Running task: ${task}"`,
        this.renderTaskScript(task),
        '}',
      );
    }
    // TODO: find a better way to run a specific task
    lines.push('$1;');

    const output = lines.join('\n');

    return prettify ? this.prettifyBash(output) : output;
  }

  private renderTaskScript(name: string) {
    const task = this.cachedTasks[name];

    if (!task) {
      throw new Error(`task not found: ${name}`);
    }

    if (!task.steps.length) {
      return 'return 0;';
    }

    const lines: string[] = [];

    if (task.env) {
      lines.push(this.declareEnv(task.env));
    }
    let commands: string[];
    for (let i = 0; i < task.steps.length; i++) {
      commands = task.steps[i];
      lines.push(`step${i}() {\n${commands.join('\n')}\n}`);
      lines.push(`(step${i} $@)`);
    }

    return lines.join('\n');
  }

  private transpileTask(task: TaskSpec) {
    const name = task.name;
    if (this.cachedTasks[name]) return;

    // TODO better name
    const steps: string[][] = [];

    if (!task.steps) {
      this.cachedTasks[name] = { steps };
      return;
    }

    for (const step of task.steps) {
      const execs: string[] = [];
      // TODO add support for receiveArgs $@
      const stepArgs = step.args ?? [];
      step.receiveArgs && stepArgs.push('$@');

      const args = stepArgs.join(' ');
      if (step.env) {
        execs.push(this.declareEnv(step.env));
      }

      if (step.condition) {
        execs.push(this.conditionCommand(step.condition));
      }

      if (step.exec) {
        const command = `${step.exec} ${args}`;
        execs.push(command);
      }

      if (step.builtin) {
        // TODO: This is dumb. Update to use a better way to do this
        const builtinPath = path.resolve(
          process.cwd(),
          'node_modules/projen/lib',
          `${step.builtin}.task.js`,
        );
        execs.push(`'${process.execPath}' '${builtinPath}' ${args}`);
      }

      if (step.say) {
        execs.push(`echo "${step.say}"`);
      }

      if (step.spawn) {
        const taskSpec = this.tasks[step.spawn];
        if (!taskSpec) {
          throw new Error(`task not found: ${step.spawn}`);
        }

        // Idea is to create a function that will be called
        // Run it in a subshell with (...)
        execs.push(`(${this.taskNameMapping[step.spawn]})`);
      }
      steps.push(execs.length ? execs : ['return 0;']);
    }
    this.cachedTasks[name] = { steps, env: task.env };
  }

  private conditionCommand(condition: string) {
    return `if [${condition}]; then return 0; fi`;
  }

  private declareEnv(env: Record<string, string>) {
    return Object.entries(env)
      .map(([k, v]) => `export ${k}="${v}"`)
      .join('\n');
  }

  // TODO: find a package or something to do this. Good enough for now
  private prettifyBash(script: string) {
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
}
