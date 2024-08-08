const forge = require("node-forge");
const net = require("node:net");

const { md, pki } = forge;

function createCertificate(
  serial,
  publicKey,
  subject,
  issuer,
  extensions,
  validity,
  signWith,
) {
  const cert = pki.createCertificate();
  cert.serialNumber = Buffer.from(serial).toString("hex");
  cert.publicKey = publicKey;
  cert.setSubject(subject);
  cert.setIssuer(issuer);
  cert.setExtensions(extensions);
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + validity);
  cert.sign(signWith, md.sha256.create());
  return cert;
}

function generateCert({ subject, issuer, extensions, validity, signWith }) {
  const serial = Math.floor(Math.random() * 95000 + 50000).toString();
  const keyPair = forge.pki.rsa.generateKeyPair(2048);
  const privateKey = signWith
    ? pki.privateKeyFromPem(signWith)
    : keyPair.privateKey;
  const cert = createCertificate(
    serial,
    keyPair.publicKey,
    subject,
    issuer,
    extensions,
    validity,
    privateKey,
  );

  return {
    key: pki.privateKeyToPem(keyPair.privateKey),
    cert: pki.certificateToPem(cert),
  };
}

function createCA({ organization, countryCode, state, locality, validity }) {
  const attributes = [
    { name: "commonName", value: organization },
    { name: "countryName", value: countryCode },
    { name: "stateOrProvinceName", value: state },
    { name: "localityName", value: locality },
    { name: "organizationName", value: organization },
  ];

  const extensions = [
    { name: "basicConstraints", cA: true, critical: true },
    { name: "keyUsage", keyCertSign: true, critical: true },
  ];

  return generateCert({
    subject: attributes,
    issuer: attributes,
    extensions,
    validity,
  });
}

function createCert({ domains, validity, organization, email, ca }) {
  const attributes = [{ name: "commonName", value: domains[0] }];

  if (organization) {
    attributes.push({ name: "organizationName", value: organization });
  }

  if (email) {
    attributes.push({ name: "emailAddress", value: email });
  }

  const extensions = [
    { name: "basicConstraints", cA: false, critical: true },
    {
      name: "keyUsage",
      digitalSignature: true,
      keyEncipherment: true,
      critical: true,
    },
    { name: "extKeyUsage", serverAuth: true, clientAuth: true },
    {
      name: "subjectAltName",
      altNames: domains.map((domain) => {
        const TYPE_DOMAIN = 2;
        const TYPE_IP = 7;
        return net.isIP(domain)
          ? { type: TYPE_IP, ip: domain }
          : { type: TYPE_DOMAIN, value: domain };
      }),
    },
  ];

  const caCert = pki.certificateFromPem(ca.cert);

  return generateCert({
    subject: attributes,
    issuer: caCert.subject.attributes,
    extensions,
    validity,
    signWith: ca.key,
  });
}

module.exports = {
  createCA,
  createCert,
};
