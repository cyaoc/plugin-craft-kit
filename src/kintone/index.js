const { KintoneRestAPIClient } = require('@kintone/rest-api-client');
const logger = require('../utils/logger');

async function uploadPlugin({ clientOptions, pluginId, file }) {
  const client = new KintoneRestAPIClient(clientOptions);
  const { fileKey } = await client.file.uploadFile({ file });

  const { plugins } = await client.plugin.getPlugins();
  const isUpdate = plugins.some(({ id }) => id === pluginId);

  const result = isUpdate
    ? await client.plugin.updatePlugin({ id: pluginId, fileKey })
    : await client.plugin.installPlugin({ fileKey });

  logger.log(`Plugin ${isUpdate ? 'updated' : 'installed'} successfully:
- ID: ${result.id}
- Version: ${result.version}`);
}

module.exports = {
  uploadPlugin,
};
