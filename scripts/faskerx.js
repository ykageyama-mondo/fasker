#!/usr/bin/env node

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Workaround for npx fasker breaking in workflows due to missing lib/index.js
if (!fs.existsSync(path.resolve(process.cwd(), 'lib', 'index.js')))
  spawnSync('npx projen compile', {
    stdio: 'inherit',
    shell: true,
  });
require('../bin/fasker')