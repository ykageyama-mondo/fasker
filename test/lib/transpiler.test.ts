import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { TaskSpec } from 'projen';
import {
  TaskTranspiler,
  convertToFunctionName,
} from '../../src/lib/transpiler';

let remove: string[] = [];

describe('TaskTranspiler', () => {
  beforeAll(() => {
    remove = [];
  });

  afterAll(() => {
    for (const file of remove) {
      fs.rmSync(file);
    }
  });

  test('Step types', () => {
    const tasks: Record<string, TaskSpec> = {
      task1: {
        name: 'task1',
        steps: [
          {
            exec: 'echo "hello"',
          },
          {
            say: 'hello',
          },
          // TODO: Figure out how to test this. Produces absolute path to builtin
          // {
          //   builtin: 'eslint',
          // },
          {
            condition: '[[ -d src ]]',
          },
          {
            args: ['foo', 'bar'],
            exec: 'echo',
            receiveArgs: true,
          },
          { spawn: 'task2' },
        ],
      },
      task2: {
        name: 'task2',
      },
    };

    const transpiler = new TaskTranspiler(tasks);
    const script = transpiler.render({ prettify: true, quiet: true });
    expect(script).toMatchSnapshot();
  });

  test('environment pollution', () => {
    const tasks: Record<string, TaskSpec> = {
      task1: {
        name: 'task1',
        env: {
          foo: 'original',
        },
        steps: [
          {
            exec: 'node -e "console.log(process.env.foo)"',
          },
          {
            env: {
              foo: 'override',
            },
            exec: 'node -e "console.log(process.env.foo)"',
          },
          {
            spawn: 'task2',
          },
          {
            exec: 'node -e "console.log(process.env.foo)"',
          },
          {
            exec: 'node -e "console.log(process.env.bar)"',
          },
        ],
      },
      task2: {
        name: 'task2',
        env: {
          bar: 'task2',
        },
        steps: [
          {
            exec: 'node -e "console.log(process.env.foo)"',
          },
          {
            env: {
              foo: 'override2',
            },
            exec: 'node -e "console.log(process.env.foo)"',
          },
        ],
      },
    };

    const taskTranspiler = new TaskTranspiler(tasks);
    const script = taskTranspiler.render({
      prettify: true,
      quiet: true,
    });
    const p = path.join(os.tmpdir(), 'faskerx-test.sh');
    remove.push(p);
    fs.writeFileSync(p, script, 'utf-8');
    fs.chmodSync(p, '755');
    const result = spawnSync(p, [convertToFunctionName('task1')], {
      encoding: 'utf-8',
      shell: true,
    });

    console.log(result.stdout);

    expect(script).toMatchSnapshot();
    expect(result.status).toBe(0);
    expect(result.stdout.split('\n').filter((x) => x)).toEqual([
      'original',
      'override',
      'original',
      'override2',
      'original',
      'undefined',
    ]);
  });
});
