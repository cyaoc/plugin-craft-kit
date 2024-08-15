import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    injectStyles: true,
  },
  tools: {
    htmlPlugin: false,
  },
  server: {
    https: {
      key: fs.readFileSync('private.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
  },
  dev: {
    client: {
      protocol: 'wss',
      host: '127.0.0.1',
      port: 3000,
    },
  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
});
