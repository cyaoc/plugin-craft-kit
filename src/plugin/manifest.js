const path = require('node:path');
const fse = require('fs-extra');
const sharp = require('sharp');

function processManifestScripts(manifest, callback) {
  const types = ['desktop', 'mobile', 'config'];

  return types.reduce((entries, type) => {
    const jsFiles = manifest[type]?.js || [];
    return Object.assign(
      entries,
      jsFiles.reduce((acc, file) => {
        if (!/^https?:\/\//.test(file)) {
          const name = path.basename(file, path.extname(file));
          callback(acc, file, name);
        }
        return acc;
      }, {}),
    );
  }, {});
}

function generateWebpackEntries(manifest, manifestPath) {
  const srcDir = path.dirname(manifestPath).split('/').pop();
  return processManifestScripts(manifest, (acc, file, name) => {
    acc[name] = `./${srcDir}/${file}`;
  });
}

function getBundledScripts(manifest, assetsByChunkName, distPath) {
  return processManifestScripts(manifest, (acc, file, name) => {
    const assets = assetsByChunkName[name];
    if (!assets?.length) {
      acc[file] = file;
    }
    acc[file] = Buffer.from(
      fse.readFileSync(path.join(distPath, assets[0]), 'utf-8'),
    );
  });
}

function transformScriptUrls(manifest, baseUrl) {
  const types = ['desktop', 'mobile', 'config'];
  for (const type of types) {
    const jsFiles = manifest[type]?.js || [];
    if (jsFiles.length > 0) {
      manifest[type].js = jsFiles.map((file) => {
        if (!/^https?:\/\//.test(file)) {
          const name = path.basename(file, path.extname(file));
          return `${baseUrl}/${name}.js`;
        }
        return file;
      });
    }
  }
  return manifest;
}

async function addDevBadge(iconPath) {
  const image = sharp(iconPath);
  const metadata = await image.metadata();
  const size = metadata.width;

  const badgeSize = Math.max(size * 0.25, 24);
  const padding = badgeSize * 0.15;
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B" />
      <stop offset="100%" stop-color="#DC3545" />
    </linearGradient>
  </defs>
  <g transform="translate(${size - badgeSize - padding}, ${size - badgeSize - padding}) scale(${badgeSize / 250})">
    <g>
      <circle fill="#FFFFFF" cx="124.8" cy="125" r="115.9"/>
      <path fill-rule="evenodd" clip-rule="evenodd" fill="url(#badge)" d="M124.8,250C55.8,250,0,194.2,0,125.2C0,55.8,55.8,0,124.8,0
        c69,0,124.8,55.8,124.8,125.2C249.6,194.2,193.8,250,124.8,250 M124.8,18.6c-58.6,0-106.2,47.6-106.2,106.6
        c0,58.5,47.7,106.2,106.2,106.2c58.5,0,106.2-47.7,106.2-106.2C231,66.2,183.3,18.6,124.8,18.6z"/>
      <path fill-rule="evenodd" clip-rule="evenodd" fill="url(#badge)" d="M179.4,124.7c0-54.9-48.4-55.7-70.8-55.7h-34v116.7h32.9
        C143.2,185.7,179.4,175.7,179.4,124.7 M152.8,126.3c0,30.6-17.2,39.2-39.7,39.2h-12.6V89.3h11.8C128.1,89.3,152.8,93.6,152.8,126.3
        z"/>
    </g>
  </g>
</svg>`;

  // 先将 SVG 转换为 PNG buffer
  // 确保徽章尺寸不超过原圖尺寸
  const badgeBuffer = await sharp(Buffer.from(svg))
    .resize(size, size, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  // 合成圖片時強制匹配尺寸
  return image
    .resize(size, size)
    .composite([
      {
        input: badgeBuffer,
        blend: 'over',
      },
    ])
    .toBuffer();
}

module.exports = {
  generateWebpackEntries,
  getBundledScripts,
  transformScriptUrls,
  addDevBadge,
};
