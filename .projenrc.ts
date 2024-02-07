import { typescript, javascript, TextFile } from 'projen';
import { Fasker } from './src/component';
const nodeVersion = '20';
const project = new typescript.TypeScriptProject({
  name: 'fasker',
  description: 'A Faster Task Runner for Projen tasks',
  defaultReleaseBranch: 'main',
  authorName: 'Yuichi Kageyama',
  deps: ['chalk', 'commander', 'pino', 'pino-pretty', 'projen'],
  devDeps: ['vega'],
  entrypoint: 'lib/index.js',
  minNodeVersion: '16.0.0',
  workflowNodeVersion: nodeVersion,
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
  prettier: true,
  pnpmVersion: '8',
  prettierOptions: {
    settings: {
      bracketSpacing: true,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: javascript.TrailingComma.ALL,
    },
  },
  eslintOptions: {
    prettier: false,
    dirs: ['src'],
    devdirs: ['test'],
  },
  tsconfig: {
    compilerOptions: {
      target: 'es2021',
      lib: ['es2021'],
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      skipLibCheck: true,
      isolatedModules: true,
      module: 'commonjs',
      resolveJsonModule: undefined,
    },
  },
  releaseWorkflowSetupSteps: [
    {
      name: 'Run projen',
      run: 'npx projen',
    },
  ],
  projenCommand: './scripts/faskerx.js',
});

project.eslint?.addRules({
  'key-spacing': ['off'],
  'no-multiple-empty-lines': ['off'],
});
project.tsconfigDev.addInclude('scripts');

project.addTask('stubTask1', {
  description: 'Stub task for testing',
  env: {
    foo: 'bar',
  },
  steps: [
    {
      env: {
        woo: 'hoo',
      },
      say: 'Stub task 1',
      exec: 'echo "Stub task 1 $foo"',
    },
    {
      say: 'Stub task 2',
      exec: 'echo "Stub task 2 $woo"',
    },
  ],
});
project.addTask('benchmark', {
  steps: [
    {
      say: 'Benchmarking',
    },
    {
      spawn: 'stubTask1',
    },
  ],
});

// This is fine. Complains about projenCommand not being fasker but we're special :)
// Joys of Dog fooding
try {
  new Fasker(project, {
    version: 'file:.',
  });
} catch (error) {}

new TextFile(project, '.nvmrc', {
  lines: [nodeVersion],
});

project.synth();
