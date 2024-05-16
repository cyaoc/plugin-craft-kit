const { spawnSync } = require("child_process");

function addToTrustStores(certPath) {
  console.log(
    "About to perform an operation that requires administrative privileges, please be prepared to enter your password.",
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
      "About to perform an operation that requires administrative privileges, please be prepared to enter your password.",
    );
    spawnSync("sudo", ["security", "remove-trusted-cert", "-d", certPath], {
      stdio: "ignore",
    });
  }
}

module.exports = { addToTrustStores, removeFromTrustStores };
