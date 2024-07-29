const path = require("path");
const { name: pkgName } = require("../../package.json");
const { getApplicationConfigPath } = require("./platforms").platform;

const ca = "root.crt";
const caKey = "root.key";

const isSupported =
  process.platform === "darwin" ||
  process.platform === "linux" ||
  process.platform === "win32";

const pkgDir = getApplicationConfigPath(pkgName);
const rootCAPath = path.resolve(pkgDir, ca);
const rootCAKeyPath = path.resolve(pkgDir, caKey);

module.exports = {
  rootCAPath,
  rootCAKeyPath,
  pkgDir,
  isSupported,
};

module.exports.VALID_IP =
  /(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}/;
module.exports.VALID_DOMAIN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.?)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
