const { spawnSync } = require("child_process");
const { pkgName } = require("../constants");

const targetCA = `/usr/local/share/ca-certificates/${pkgName}.crt`;

function addToTrustStores(certPath) {
  console.log(
    "About to perform an operation that requires administrative privileges, please be prepared to enter your password.",
  );
  spawnSync("sudo", ["cp", certPath, targetCA]);
  spawnSync("sudo", ["update-ca-certificates"]);
}

function removeFromTrustStores() {
  console.log(
    "About to perform an operation that requires administrative privileges, please be prepared to enter your password.",
  );
  spawnSync("sudo", ["rm", targetCA], { stdio: "inherit" });
  spawnSync("sudo", ["update-ca-certificates"]);
}

module.exports = { addToTrustStores, removeFromTrustStores };
