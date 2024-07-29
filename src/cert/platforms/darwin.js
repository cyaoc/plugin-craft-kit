const path = require("path");
const { spawnSync } = require("child_process");

function addToTrustStores(certPath) {
  console.log(
    "About to add the certificate to the trusted store, which requires administrative privileges. Please be prepared to enter your password.",
  );
  spawnSync(
    "sudo",
    [
      "security",
      "add-trusted-cert",
      "-d",
      "-r",
      "trustRoot",
      "-k",
      "/Library/Keychains/System.keychain",
      "-p",
      "ssl",
      "-p",
      "basic",
      certPath,
    ],
    { stdio: "inherit" },
  );
}

function removeFromTrustStores(certPath) {
  if (certPath) {
    console.log(
      "About to remove the certificate from the trusted store, which requires administrative privileges. Please be prepared to enter your password.",
    );
    spawnSync("sudo", ["security", "remove-trusted-cert", "-d", certPath], {
      stdio: "ignore",
    });
  }
}

function getApplicationConfigPath(name) {
  return path.join(process.env.HOME, "Library", "Application Support", name);
}

module.exports = {
  addToTrustStores,
  removeFromTrustStores,
  getApplicationConfigPath,
};
