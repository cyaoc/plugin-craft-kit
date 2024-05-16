const fse = require("fs-extra");
const path = require("path");
const { createContentsZip, zipFiles } = require("./zip");
const { sign, getPublicKeyDer } = require("./rsa");

// module.exports.gen = (ppk) => {
//   if (!fs.existsSync(ppk)) {
//     const keypair = forge.pki.rsa.generateKeyPair(1024);
//     const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
//     fs.outputFileSync(ppk, privateKey);
//     return privateKey;
//   }
//   return fs.readFileSync(ppk);
// };

function main() {
  const manifest = fse.readFileSync(
    path.join(__dirname, "../sample/src/manifest.json"),
  );
  const ppk = fse.readFileSync(path.join(__dirname, "../sample/private.ppk"));
  const pluginDir = path.join(__dirname, "../sample/src");
  const dist = path.join(__dirname, "../dist");
  const contentsZip = createContentsZip(
    pluginDir,
    JSON.parse(manifest.toString()),
  );
  const signature = sign(contentsZip, ppk);
  const publicKeyDer = getPublicKeyDer(ppk.toString());
  const plugin = zipFiles({
    "contents.zip": contentsZip,
    PUBKEY: publicKeyDer,
    SIGNATURE: signature,
  });
  fse.outputFileSync(path.join(dist, "plugin.zip"), plugin);
}

main();
