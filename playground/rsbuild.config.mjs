import { defineConfig } from '@rsbuild/core';
import { pluginCraftKit } from '../src';

export default defineConfig({
  plugins: [
    pluginCraftKit({
      plugin: { manifest: 'src/manifest.json' },
      devTools: {
        upload: {
          client: {
            baseUrl: process.env.KINTONE_BASE_URL,
            auth: {
              username: process.env.KINTONE_USERNAME,
              password: process.env.KINTONE_PASSWORD,
            },
          },
          pluginId: process.env.KINTONE_PLUGINID,
        },
      },
    }),
  ],
});
