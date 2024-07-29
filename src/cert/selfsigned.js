const forge = require("node-forge");
const { name: pkgName } = require("../../package.json");

const VALID_IP =
  /(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}/;
const VALID_DOMAIN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.?)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
const DEFAULT_KEY_SIZE = 2048;
const DEFAULT_VALIDITY_DAYS = 365;
const locals = [
  "localhost",
  "localhost.localdomain",
  "127.0.0.1",
  // "0.0.0.0",
  // "::1",
];

function toPositiveHex(hexString) {
  const mostSignificantHexAsInt = parseInt(hexString[0], 16);
  return mostSignificantHexAsInt < 8
    ? hexString
    : `${(mostSignificantHexAsInt - 8).toString()}${hexString.slice(1)}`;
}

function generateRootCertificate() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.serialNumber = toPositiveHex(
    forge.util.bytesToHex(forge.random.getBytesSync(9)),
  );
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // 有效期一年
  cert.publicKey = keys.publicKey;
  const attrs = [
    {
      name: "commonName",
      value: "Cyao",
    },
    {
      name: "countryName",
      value: "CN",
    },
    {
      shortName: "ST",
      value: "Shanghai",
    },
    {
      name: "localityName",
      value: "Shanghai",
    },
    {
      name: "organizationName",
      value: "Cyao",
    },
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const certPem = forge.pki.certificateToPem(cert);
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  return { certPem, privateKeyPem };
}

function generateCertificateForDomains(
  rootCertPem,
  rootPrivateKeyPem,
  domains,
  ips = ["localhost", "0.0.0.0", "127.0.0.1"],
) {
  const rootCert = forge.pki.certificateFromPem(rootCertPem);
  const rootPrivateKey = forge.pki.privateKeyFromPem(rootPrivateKeyPem);
  const keys = forge.pki.rsa.generateKeyPair(2048);

  const cert = forge.pki.createCertificate();

  cert.serialNumber = "02";

  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // 有效期一年

  cert.publicKey = keys.publicKey;

  cert.setSubject([
    {
      name: "commonName",
      value: domains[0],
    },
  ]);

  cert.setIssuer(rootCert.subject.attributes);

  // 添加域名和IP地址
  const altNames = domains
    .map((domain) => ({
      type: 2, // DNS
      value: domain,
    }))
    .concat(
      ips.map((ip) => ({
        type: 7, // IP
        ip: ip,
      })),
    );

  cert.setExtensions([
    {
      name: "subjectAltName",
      altNames: altNames,
    },
  ]);

  cert.sign(rootPrivateKey, forge.md.sha256.create());
  const certPem = forge.pki.certificateToPem(cert);
  const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
  return { certPem, privateKeyPem };
}

function getAlgorithm(key) {
  switch (key) {
    case "sha256":
      return forge.md.sha256.create();
    default:
      return forge.md.sha1.create();
  }
}

const filter = (domain) =>
  domain &&
  domain.trim() !== "" &&
  !locals.includes(domain) &&
  (VALID_IP.test(domain) || VALID_DOMAIN.test(domain));

const generateKeyPair = (keySize) => forge.pki.rsa.generateKeyPair(keySize);

const createCertificate = () => forge.pki.createCertificate();

const setCertificateValidity = (cert, days) => {
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(
    cert.validity.notBefore.getDate() + (days || DEFAULT_VALIDITY_DAYS),
  );
};

const signCertificate = (cert, privateKey, algorithm) => {
  cert.sign(privateKey, getAlgorithm(algorithm));
};

function generateCA() {
  return generate([{ name: "commonName", value: pkgName }], {
    days: 7300,
    keySize: DEFAULT_KEY_SIZE,
    algorithm: "sha256",
    extensions: [{ name: "basicConstraints", cA: true }],
  });
}

function generateBy(rootCA, domains) {
  const attrs = [{ name: "commonName", value: locals[0] }];
  const altNames = domains
    .filter(filter)
    .concat(locals)
    .map((domain) =>
      VALID_IP.test(domain)
        ? { type: 7, ip: domain }
        : { type: 2, value: domain },
    );

  const options = {
    keySize: DEFAULT_KEY_SIZE,
    ca: rootCA,
    algorithm: "sha256",
    extensions: [
      { name: "basicConstraints", cA: false },
      {
        name: "keyUsage",
        keyCertSign: false,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: "extKeyUsage",
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true,
      },
      { name: "subjectAltName", altNames },
    ],
  };

  return generate(attrs, options);
}

function generateClientCertificate(attrs, keyPair, options, pem) {
  const clientKeys = generateKeyPair(1024);
  const clientCert = createCertificate();
  clientCert.serialNumber = toPositiveHex(
    forge.util.bytesToHex(forge.random.getBytesSync(9)),
  );
  setCertificateValidity(clientCert, 365);

  const clientAttrs = attrs.map((attr) =>
    attr.name === "commonName"
      ? { name: "commonName", value: options.clientCertificateCN || pkgName }
      : attr,
  );

  clientCert.setSubject(clientAttrs);
  clientCert.setIssuer(attrs);
  clientCert.publicKey = clientKeys.publicKey;
  signCertificate(clientCert, keyPair.privateKey, "sha256");

  pem.clientPrivate = forge.pki.privateKeyToPem(clientKeys.privateKey);
  pem.clientPublic = forge.pki.publicKeyToPem(clientKeys.publicKey);
  pem.clientCert = forge.pki.certificateToPem(clientCert);

  if (options.pkcs7) {
    const clientP7 = forge.pkcs7.createSignedData();
    clientP7.addCertificate(clientCert);
    pem.clientPkcs7 = forge.pkcs7.messageToPem(clientP7);
  }
}

function generate(
  attrs = [
    { name: "commonName", value: "example.org" },
    { name: "countryName", value: "US" },
    { shortName: "ST", value: "Virginia" },
    { name: "localityName", value: "Blacksburg" },
    { name: "organizationName", value: "Test" },
    { shortName: "OU", value: "Test" },
  ],
  options = {},
) {
  const keySize = options.keySize || 1024;
  const keyPair = options.keyPair
    ? {
        privateKey: forge.pki.privateKeyFromPem(options.keyPair.privateKey),
        publicKey: forge.pki.publicKeyFromPem(options.keyPair.publicKey),
      }
    : generateKeyPair(keySize);

  const cert = createCertificate();
  cert.serialNumber = toPositiveHex(
    forge.util.bytesToHex(forge.random.getBytesSync(9)),
  );

  setCertificateValidity(cert, options.days);

  const caPrivateKey = options.ca?.private
    ? forge.pki.privateKeyFromPem(options.ca.private)
    : keyPair.privateKey;
  const caCert = options.ca?.cert
    ? forge.pki.certificateFromPem(options.ca.cert)
    : cert;
  const issuerAttrs = options.ca ? caCert.subject.attributes : attrs;

  cert.setSubject(attrs);
  cert.setIssuer(issuerAttrs);
  cert.publicKey = keyPair.publicKey;

  cert.setExtensions(
    options.extensions || [
      { name: "basicConstraints", cA: true },
      {
        name: "keyUsage",
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: "subjectAltName",
        altNames: [{ type: 6, value: "http://example.org/webid#me" }],
      },
    ],
  );

  signCertificate(cert, caPrivateKey, options.algorithm);

  const fingerprint = forge.md.sha1
    .create()
    .update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes())
    .digest()
    .toHex()
    .match(/.{2}/g)
    .join(":");

  const pem = {
    private: forge.pki.privateKeyToPem(keyPair.privateKey),
    public: forge.pki.publicKeyToPem(keyPair.publicKey),
    cert: forge.pki.certificateToPem(cert),
    fingerprint,
  };

  if (options.pkcs7) {
    const p7 = forge.pkcs7.createSignedData();
    p7.addCertificate(cert);
    pem.pkcs7 = forge.pkcs7.messageToPem(p7);
  }

  if (options.clientCertificate) {
    generateClientCertificate(attrs, keyPair, options, pem);
  }

  const caStore = forge.pki.createCaStore();
  caStore.addCertificate(caCert);

  // try {
  //   forge.pki.verifyCertificateChain(caStore, [cert], (vfd) => {
  //     if (vfd !== true) throw new Error("Certificate could not be verified.");
  //     return true;
  //   });
  // } catch (ex) {
  //   throw new Error(ex.message);
  // }

  return pem;
}

module.exports = {
  filter,
  generateCA,
  generateBy,
  generate,
};
