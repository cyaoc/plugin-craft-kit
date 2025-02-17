const forge = require('node-forge');
const fse = require('fs-extra');

function generate() {
  const keypair = forge.pki.rsa.generateKeyPair(1024);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  return privateKey;
}

function sign(contents, privateKey) {
  const key = forge.pki.privateKeyFromPem(privateKey);
  const md = forge.md.sha1.create();
  md.update(contents.toString('binary'));
  const signature = key.sign(md);
  return Buffer.from(signature, 'binary');
}

function getPublicKeyDer(privateKeyPem) {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e);
  const publicKeyAsn1 = forge.pki.publicKeyToAsn1(publicKey);
  const publicKeyDerBytes = forge.asn1.toDer(publicKeyAsn1).getBytes();
  const publicKeyDerBuffer = Buffer.from(publicKeyDerBytes, 'binary');
  return publicKeyDerBuffer;
}

function generatePPK(ppkPath) {
  const keypair = forge.pki.rsa.generateKeyPair(1024);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  fse.outputFileSync(ppkPath, privateKey);
  return privateKey;
}

// const crypto = require('node:crypto');
// function generatePluginId(publicKeyDer) {
//   // 2. 计算SHA-256哈希
//   const hash = crypto.createHash('sha256').update(publicKeyDer).digest();

//   // 3. 转为十六进制并截取前32字符
//   const hexDigest = hash.toString('hex').substring(0, 32);

//   // 4. 字符替换：0-9a-f -> a-p
//   const searchChars = '0123456789abcdef';
//   const replaceChars = 'abcdefghijklmnop';
//   let pluginId = '';
//   for (const c of hexDigest) {
//     const index = searchChars.indexOf(c);
//     pluginId += replaceChars.charAt(index);
//   }

//   return pluginId;
// }

module.exports = {
  sign,
  generate,
  getPublicKeyDer,
  generatePPK,
};
