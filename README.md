# Fasker

A ***Fa***st Ta***sk*** Runn***er*** for Projen tasks

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/benchmark-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/benchmark-light.svg">
    <img alt="Bar chart with benchmark results" src="/assets/benchmark-light.svg">
  </picture>
</p>


## Local Development

### Requirements

- Node.js 16+
- pnpm

### Steps

1. Install dependencies
```sh
   pnpm install
```
2. Run build
```sh
   pnpm build
```

## Running Benchmarks

```sh
npx tsx ./scripts/benchmark.ts
```

## Tasks

- [x] Compile tasks into a script
- [x] Spawn
- [ ] builtins
- [ ] Task Manifest env
- [x] Task env
- [x] Step env
- [x] Step args
- [ ] Receive args from parents
- [ ] Caching
- [x] CLI
- [ ] CLI completions
- [ ] Projen component to make everything fasker
- [x] Benchmarks