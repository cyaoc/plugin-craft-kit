const { KintoneRestAPIClient } = require('@kintone/rest-api-client');
const logger = require('../utils/logger');

async function uploadPlugin({ clientOptions, pluginId, manifest, file }) {
  const client = new KintoneRestAPIClient(clientOptions);
  const { fileKey } = await client.file.uploadFile({ file });

  let id = pluginId;
  if (!id) {
    const { plugins } = await client.plugin.getPlugins();
    const names = Object.values(manifest.name);
    const plugin = plugins.find(({ name }) => names.includes(name));
    id = plugin?.id;
  }

  const result = id
    ? await client.plugin.updatePlugin({ id, fileKey })
    : await client.plugin.installPlugin({ fileKey });

  const action = id ? 'updated' : 'installed';
  const message =
    id && !pluginId
      ? `
Note: Plugin ID was guessed by name matching.
Please verify on kintone admin screen:
1. Check if the update was applied to the correct plugin`
      : !id
        ? `
Important: Please save this Plugin ID!`
        : '';

  logger.log(`Plugin ${action} successfully:
  - ID: ${result.id}
  - Version: ${result.version}
${message}
${
  !pluginId
    ? `Add this to your @cyaoc/craft-kit options:
  devTools: {
    upload: {
      pluginId: "${result.id}"
    }
  }`
    : ''
}`);
}

module.exports = {
  uploadPlugin,
};
