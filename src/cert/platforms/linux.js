const path = require("path");
const { spawnSync } = require("child_process");
const { name: pkgName } = require("../../../package.json");

const targetCA = `/usr/local/share/ca-certificates/${pkgName}.crt`;

function addToTrustStores(certPath) {
  console.log(
    "Adding certificate to trusted store. Admin rights required. You may need to enter your password if prompted.",
  );
  spawnSync("sudo", ["cp", certPath, targetCA]);
  spawnSync("sudo", ["update-ca-certificates"]);
}

function removeFromTrustStores() {
  console.log(
    "Removing certificate from trusted store. Admin rights required. You may need to enter your password if prompted.",
  );
  spawnSync("sudo", ["rm", targetCA], { stdio: "inherit" });
  spawnSync("sudo", ["update-ca-certificates"]);
}

function getApplicationConfigPath(name) {
  return process.env.XDG_CONFIG_HOME
    ? path.join(process.env.XDG_CONFIG_HOME, name)
    : path.join(process.env.HOME, ".config", name);
}

module.exports = {
  addToTrustStores,
  removeFromTrustStores,
  getApplicationConfigPath,
};
