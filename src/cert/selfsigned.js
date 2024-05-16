const forge = require("node-forge");
const { pkgName } = require("./constants");

const VALID_IP =
  /(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}/;
const VALID_DOMAIN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.?)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
const DEFAULT_KEY_SIZE = 2048;
const DEFAULT_VALIDITY_DAYS = 365;
const locals = ["localhost", "localhost.localdomain", "127.0.0.1"];

function generateKeyPair(keySize = DEFAULT_KEY_SIZE) {
  return forge.pki.rsa.generateKeyPair(keySize);
}

function getAlgorithm(key) {
  switch (key) {
    case "sha256":
      return forge.md.sha256.create();
    default:
      return forge.md.sha1.create();
  }
}

function toPositiveHex(hexString) {
  let mostSignificantHexAsInt = parseInt(hexString[0], 16);
  if (mostSignificantHexAsInt < 8) {
    return hexString;
  }

  mostSignificantHexAsInt -= 8;
  return mostSignificantHexAsInt.toString() + hexString.substring(1);
}

function filter(domain) {
  return (
    domain &&
    domain.trim() !== "" &&
    !locals.includes(domain) &&
    (VALID_IP.test(domain) || VALID_DOMAIN.test(domain))
  );
}

function createCertificate(attrs, options, isCA = false) {
  const keyPair = options.keyPair || generateKeyPair(options.keySize);
  const cert = forge.pki.createCertificate();
  cert.serialNumber = toPositiveHex(
    forge.util.bytesToHex(forge.random.getBytesSync(9)),
  );
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(cert.validity.notBefore);
  cert.validity.notAfter.setDate(
    cert.validity.notBefore.getDate() + (options.days || DEFAULT_VALIDITY_DAYS),
  );
  cert.setSubject(attrs);
  cert.publicKey = keyPair.publicKey;

  if (isCA) {
    cert.setIssuer(attrs);
  } else if (options.ca) {
    const caCert = forge.pki.certificateFromPem(options.ca.cert);
    cert.setIssuer(caCert.subject.attributes);
    cert.sign(
      forge.pki.privateKeyFromPem(options.ca.private),
      getAlgorithm(options.algorithm),
    );
  } else {
    throw new Error("CA information is required for non-CA certificates.");
  }

  if (isCA) {
    cert.sign(keyPair.privateKey, getAlgorithm(options.algorithm));
  }

  return {
    cert,
    keyPair,
  };
}

function generateCA() {
  const attrs = [{ name: "commonName", value: pkgName }];
  const options = {
    days: 7300,
    keySize: DEFAULT_KEY_SIZE,
    algorithm: "sha256",
    extensions: [
      {
        name: "basicConstraints",
        cA: true,
      },
    ],
  };

  return createCertificate(attrs, options, true);
}

function generateBy(rootCA, domains) {
  const attrs = [{ name: "commonName", value: locals[0] }];
  const altNames = domains
    .filter(this.filter)
    .concat(locals)
    .map((domain) => {
      return VALID_IP.test(domain)
        ? { type: 7, ip: domain }
        : { type: 2, value: domain };
    });

  const options = {
    keySize: DEFAULT_KEY_SIZE,
    ca: rootCA,
    algorithm: "sha256",
    extensions: [
      {
        name: "basicConstraints",
        cA: false,
      },
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
      {
        name: "subjectAltName",
        altNames,
      },
    ],
  };

  return createCertificate(attrs, options);
}

function convertToPem(cert, keyPair) {
  return {
    private: forge.pki.privateKeyToPem(keyPair.privateKey),
    public: forge.pki.publicKeyToPem(keyPair.publicKey),
    cert: forge.pki.certificateToPem(cert),
  };
}

function generate(attrs, options) {
  const { cert, keyPair } = createCertificate(attrs, options, options.isCA);

  const pem = convertToPem(cert, keyPair);

  if (options.clientCertificate) {
    const clientOptions = {
      keySize: options.keySize || DEFAULT_KEY_SIZE,
      algorithm: options.algorithm,
      days: options.days || DEFAULT_VALIDITY_DAYS,
      ca: {
        cert: pem.cert,
        private: pem.private,
      },
    };

    const clientAttrs = attrs.map((attr) => {
      if (attr.name === "commonName" && options.clientCertificateCN) {
        return { name: "commonName", value: options.clientCertificateCN };
      }
      return attr;
    });

    const { cert: clientCert, keyPair: clientKeyPair } = createCertificate(
      clientAttrs,
      clientOptions,
    );

    Object.assign(pem, {
      clientprivate: forge.pki.privateKeyToPem(clientKeyPair.privateKey),
      clientpublic: forge.pki.publicKeyToPem(clientKeyPair.publicKey),
      clientcert: forge.pki.certificateToPem(clientCert),
    });
  }

  if (options.verifyChain && options.ca) {
    const caCert = forge.pki.certificateFromPem(options.ca.cert);
    const caStore = forge.pki.createCaStore([caCert]);
    try {
      const chainValid = forge.pki.verifyCertificateChain(caStore, [cert]);
      if (!chainValid) {
        throw new Error("Certificate chain verification failed.");
      }
    } catch (error) {
      throw new Error(`Certificate chain verification error: ${error.message}`);
    }
  }

  return pem;
}

module.exports = { filter, generateCA, generateBy, generate };
