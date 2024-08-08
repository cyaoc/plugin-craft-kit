const path = require("path");
const { spawnSync } = require("child_process");

function addToTrustStores(certPath) {
  console.log(
    "Adding certificate to trusted store. Admin rights required. You may need to enter your password if prompted.",
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
      "Removing certificate from trusted store. Admin rights required. You may need to enter your password if prompted.",
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
