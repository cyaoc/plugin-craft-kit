const { spawnSync } = require("child_process");
const { pkgName } = require("../constants");

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

module.exports = { addToTrustStores, removeFromTrustStores };
