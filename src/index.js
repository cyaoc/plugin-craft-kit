const path = require('node:path');
const fse = require('fs-extra');
const { generateWebpackEntries } = require('./plugin/manifest');
const { buildPlugin, buildDevPlugin } = require('./plugin');
const { certificateFor } = require('./cert');
const { uploadPlugin } = require('./kintone');
const { normalizeHost } = require('./utils/network');

const defaultOptions = {
  plugin: {
    manifest: 'manifest.json',
    ppk: 'private.ppk',
    output: 'plugin.zip',
  },
  devTools: {
    upload: false,
  },
};

exports.pluginCraftKit = (options = {}) => {
  const mergedOptions = {
    ...defaultOptions,
    plugin: {
      ...defaultOptions.plugin,
      ...options.plugin,
    },
    devTools: {
      ...defaultOptions.devTools,
      upload: options.devTools?.upload
        ? {
            client: options.devTools.upload.client,
            pluginId: options.devTools.upload.pluginId,
          }
        : defaultOptions.devTools.upload,
    },
  };
  const { plugin, devTools } = mergedOptions;

  return {
    name: 'plugin-craft-kit',

    setup(api) {
      api.modifyRsbuildConfig((config) => {
        const manifestPath = path.resolve(process.cwd(), plugin.manifest);
        const manifestContent = fse.readJSONSync(manifestPath);
        const isDev = process.env.NODE_ENV === 'development';
        const mergedConfig = {
          ...config,
          source: {
            ...config.source,
            entry: generateWebpackEntries(manifestContent, plugin.manifest),
          },
          output: {
            ...config.output,
            filename: '[name].[ext]',
            cleanDistPath: true,
            filenameHash: false,
            injectStyles: true,
            distPath: {
              js: 'js',
            },
          },
          dev: {
            ...config.dev,
            client: {
              protocol: 'wss',
              host: normalizeHost(config.server?.host),
              port: config.server?.port || 3000,
            },
          },
          tools: {
            ...config.tools,
            htmlPlugin: false,
          },
          performance: {
            ...config.performance,
            chunkSplit: {
              strategy: 'all-in-one',
            },
          },
        };
        if (
          isDev &&
          !config.server?.https?.key &&
          !config.server?.https?.cert
        ) {
          mergedConfig.server.https = certificateFor(config.server?.host);
        }
        return mergedConfig;
      });

      api.onDevCompileDone(async ({ isFirstCompile, environments }) => {
        if (
          isFirstCompile &&
          (devTools.upload?.client ||
            environments.web?.config?.dev?.writeToDisk)
        ) {
          const manifestPath = path.resolve(process.cwd(), plugin.manifest);
          const manifestContent = fse.readJSONSync(manifestPath);
          const host = normalizeHost(api.context?.devServer?.hostname);
          const port = api.context?.devServer?.port || 3000;
          const protocol = api.context?.devServer?.https ? 'https' : 'http';
          const jsPath =
            environments.web?.config?.output?.distPath?.js || 'static/js';

          const baseUrl = `${protocol}://${host}:${port}/${jsPath}`;
          const pluginContent = await buildDevPlugin({
            dirname: path.dirname(manifestPath),
            manifest: manifestContent,
            ppk: plugin.ppk,
            baseUrl,
          });
          if (devTools.upload?.client) {
            await uploadPlugin({
              clientOptions: devTools.upload.client,
              pluginId: devTools.upload.pluginId,
              manifest: manifestContent,
              file: {
                name: plugin.output,
                data: pluginContent,
              },
            });
          }
          if (environments.web?.config?.dev?.writeToDisk) {
            const pluginPath = path.resolve(
              api.context.distPath,
              plugin.output,
            );
            fse.outputFileSync(pluginPath, pluginContent);
          }
        }
      });

      api.onAfterBuild(({ stats }) => {
        const manifestPath = path.resolve(process.cwd(), plugin.manifest);
        const manifestContent = fse.readJSONSync(manifestPath);
        const { assetsByChunkName } = stats?.toJson() || {};

        const pluginContent = buildPlugin({
          dirname: path.dirname(manifestPath),
          manifest: manifestContent,
          ppk: plugin.ppk,
          assetsByChunkName,
          distPath: api.context.distPath,
        });

        const pluginPath = path.resolve(api.context.distPath, plugin.output);
        fse.outputFileSync(pluginPath, pluginContent);
      });
    },
  };
};
