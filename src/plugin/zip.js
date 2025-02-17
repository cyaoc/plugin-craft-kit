const path = require('node:path');
const fse = require('fs-extra');
const { zipSync } = require('fflate');

function createContentsZip(pluginDir, manifest, fileContents = {}) {
  const files = sourceList(manifest).reduce((acc, file) => {
    acc[file] = fileContents[file] || path.join(pluginDir, file);
    return acc;
  }, {});
  files['manifest.json'] = Buffer.from(JSON.stringify(manifest, null, 2));
  return zipFiles(files);
}

function zipFiles(files) {
  const zipObj = {};

  for (const [fileName, fileContent] of Object.entries(files)) {
    let content;
    if (Buffer.isBuffer(fileContent)) {
      content = new Uint8Array(fileContent);
    } else if (typeof fileContent === 'string') {
      content = fse.readFileSync(fileContent);
      content = new Uint8Array(content);
    } else {
      throw new Error(`Unsupported file content type for file: ${fileName}`);
    }
    zipObj[fileName] = content;
  }

  const zipped = zipSync(zipObj);
  return Buffer.from(zipped);
}

function sourceList(manifest) {
  const sourceTypes = [
    ['desktop', 'js'],
    ['desktop', 'css'],
    ['mobile', 'js'],
    ['mobile', 'css'],
    ['config', 'js'],
    ['config', 'css'],
  ];
  const list = sourceTypes
    .map(([type, ext]) => manifest[type]?.[ext])
    .filter(Boolean)
    .reduce((a, b) => a.concat(b), [])
    .filter((file) => !/^https?:\/\//.test(file));

  if (manifest.config?.html) list.push(manifest.config.html);
  list.push(manifest.icon);
  return Array.from(new Set(list));
}

module.exports = { createContentsZip, zipFiles };
