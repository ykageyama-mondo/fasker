# Fasker

A ***Fa***st Ta***sk*** Runn***er*** for Projen tasks

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/benchmark-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/benchmark-light.svg">
    <img alt="Bar chart with benchmark results" src="/assets/benchmark-light.svg">
  </picture>
</p>

## Installation

These instructions are temporary until I release this to npm registry. (NOTE: This might not work. I haven't tested it :P)

1. Get the latest release and extract it to a folder
```sh
mkdir -p fasker && curl -s https://api.github.com/repos/ykageyama-mondo/fasker/releases/latest | jq '.tarball_url' | xargs -r -I{} curl -L {} | tar -xz -C fasker --strip-components=1
```
2. Build the project
```sh
pushd fasker && pnpm install && npx projen && pnpm build && popd
```
3. Install in your project
```typescript
const project = new NodeProject({
  ...,
  projenCommand: 'npx fasker',
  ...
})

new Fasker(project, {
  version: 'file:./fasker'
})
```

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
- [x] Caching
- [x] CLI
- [ ] CLI completions
- [x] Projen component to make everything fasker
- [x] Benchmarks
- [ ] Cache busting on fasker update
- [ ] Prettier pino pretty