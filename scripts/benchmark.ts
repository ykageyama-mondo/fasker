/* eslint-disable import/no-extraneous-dependencies */
import { spawnSync } from 'child_process';
import { exportAverageToGraph } from './graph';
const methods = [
  {
    name: 'Fasker',
    command: './bin/fasker benchmark',
  },
  {
    name: 'Projen',
    command: 'pnpm run benchmark',
  },
];

// Allow for v8 optimisations to settle
const warmup = () => {
  for (let i = 0; i < 5; i++) {
    for (const method of methods) {
      spawnSync(method.command, {
        shell: true,
        stdio: 'ignore',
        cwd: process.cwd(),
      });
    }
  }
};

const benchmark = async () => {
  warmup();
  const iterations = 100;

  const results: Record<string, number[]> = {};
  const average: Record<string, number> = {};

  for (const method of methods) {
    console.log(`Benchmarking ${method.name}`);
    results[method.name] = [];
    for (let i = 0; i < iterations; i++) {
      const start = new Date().getTime();
      spawnSync(method.command, {
        shell: true,
        stdio: 'ignore',
        cwd: process.cwd(),
      });
      const end = new Date().getTime();
      results[method.name].push(end - start);
    }
    average[method.name] =
      results[method.name].reduce((a, b) => a + b, 0) /
      results[method.name].length /
      1000;
  }

  console.log('Results');
  console.log(results);
  console.log('Average');
  console.log(average);
  await exportAverageToGraph(average);
};
benchmark()
  .then((v) => {
    console.log('Done');
  })
  .catch((e) => {
    throw e;
  });
