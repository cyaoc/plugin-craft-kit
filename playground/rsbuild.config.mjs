import { defineConfig } from '@rsbuild/core';
import { pluginCraftKit } from '../src';

export default defineConfig({
  plugins: [
    pluginCraftKit({
      // Plugin basic configuration
      plugin: {
        manifest: 'src/manifest.json', // Path to plugin manifest file
        // ppk: 'private.ppk',        // Path to private key file, default: private.ppk
        // output: 'plugin.zip'        // Output filename for packaged plugin, default: plugin.zip
      },
      // Development tools configuration
      devTools: {
        // Icon processing for development environment
        icon: {
          // Available options:
          // - 'badge': Add development indicator in bottom-right corner (red badge)
          // - false: No icon processing (keep original)
          type: 'badge',
        },
        // Auto-upload configuration
        upload: {
          // Kintone REST API client configuration
          client: {
            // Kintone environment URL
            baseUrl: process.env.KINTONE_BASE_URL,
            // Authentication
            auth: {
              username: process.env.KINTONE_USERNAME,
              password: process.env.KINTONE_PASSWORD,
            },
          },
        },
      },
    }),
  ],
});
