import { typescript, javascript } from 'projen';

const project = new typescript.TypeScriptProject({
  name: 'fasker',
  description: 'A Faster Task Runner for Projen tasks',
  defaultReleaseBranch: 'main',
  authorName: 'Yuichi Kageyama',
  deps: ['chalk', 'commander', 'pino', 'pino-pretty', 'projen'],
  entrypoint: 'lib/index.js',
  minNodeVersion: '16.0.0',
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
  prettier: true,
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
});

project.eslint?.addRules({
  'key-spacing': ['off'],
  'no-multiple-empty-lines': ['off'],
});

project.gitignore.exclude('.fasker-cache');

project.synth();
