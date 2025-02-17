const path = require('node:path');
const fse = require('fs-extra');
const { createContentsZip, zipFiles } = require('./zip');
const { sign, getPublicKeyDer, generatePPK } = require('./rsa');
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
  return zipFiles({
    'contents.zip': contentsZip,
    PUBKEY: publicKeyDer,
    SIGNATURE: signature,
  });
}

async function buildDevPlugin({ dirname, manifest, ppk, baseUrl }) {
  const ppkContent = getPPKContent(ppk);
  const iconPath = path.join(dirname, manifest.icon);
  const devIcon = await addDevBadge(iconPath);

  const contentsZip = createContentsZip(
    dirname,
    transformScriptUrls(manifest, baseUrl),
    {
      [manifest.icon]: devIcon,
    },
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
