const path = require('node:path');
const fse = require('fs-extra');
const { createContentsZip, zipFiles } = require('./zip');
const {
  sign,
  getPublicKeyDer,
  generatePPK,
  generatePluginId,
} = require('./rsa');
const {
  getBundledScripts,
  transformScriptUrls,
  addDevBadge,
} = require('./manifest');

function getPPKContent(ppk) {
  const ppkPath = path.resolve(process.cwd(), ppk);
  return !fse.existsSync(ppkPath)
    ? generatePPK(ppkPath)
    : fse.readFileSync(ppkPath, 'utf-8');
}

function createPluginZip(ppkContent, contentsZip) {
  const signature = sign(contentsZip, ppkContent);
  const publicKeyDer = getPublicKeyDer(ppkContent);
  const pluginId = generatePluginId(publicKeyDer);
  return {
    zip: zipFiles({
      'contents.zip': contentsZip,
      PUBKEY: publicKeyDer,
      SIGNATURE: signature,
    }),
    id: pluginId,
  };
}

async function buildDevPlugin({ dirname, manifest, ppk, baseUrl, devTools }) {
  const ppkContent = getPPKContent(ppk);
  const iconPath = path.join(dirname, manifest.icon);

  // 根据配置决定是否处理图标
  const iconType = devTools?.icon?.type || false;
  const devIcon = iconType ? await addDevBadge(iconPath) : undefined;

  const contentsZip = createContentsZip(
    dirname,
    transformScriptUrls(manifest, baseUrl),
    devIcon
      ? {
          [manifest.icon]: devIcon,
        }
      : undefined,
  );

  return createPluginZip(ppkContent, contentsZip);
}

function buildPlugin({ dirname, manifest, ppk, assetsByChunkName, distPath }) {
  const ppkContent = getPPKContent(ppk);
  const contentsZip = createContentsZip(
    dirname,
    manifest,
    getBundledScripts(manifest, assetsByChunkName, distPath),
  );
  return createPluginZip(ppkContent, contentsZip);
}

module.exports = { buildPlugin, buildDevPlugin };
