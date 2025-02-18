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

function generatePluginId(publicKeyDer) {
  const md = forge.md.sha256.create();
  md.update(publicKeyDer.toString('binary'));
  const hash = Buffer.from(md.digest().bytes(), 'binary');
  const hexDigest = hash.subarray(0, 16).toString('hex');
  return hexDigest.replace(
    /[0-9a-f]/g,
    (c) => 'abcdefghijklmnop'['0123456789abcdef'.indexOf(c)],
  );
}

module.exports = {
  sign,
  generate,
  getPublicKeyDer,
  generatePPK,
  generatePluginId,
};
