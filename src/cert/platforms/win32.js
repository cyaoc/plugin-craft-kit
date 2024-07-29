const path = require("path");
const { spawnSync } = require("child_process");
const { name: pkgName } = require("../../../package.json");

function addToTrustStores(certPath) {
  spawnSync("certutil", ["-addstore", "-user", "root", certPath], {
    stdio: "inherit",
  });
}

function removeFromTrustStores() {
  spawnSync("certutil", ["-delstore", "-user", "root", pkgName], {
    stdio: "inherit",
  });
}

function getApplicationConfigPath(name) {
  return process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, name)
    : path.join(
        process.env.USERPROFILE,
        "Local Settings",
        "Application Data",
        name,
      );
}

module.exports = {
  addToTrustStores,
  removeFromTrustStores,
  getApplicationConfigPath,
};
