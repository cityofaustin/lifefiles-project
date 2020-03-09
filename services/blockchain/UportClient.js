const EthrDID = require("ethr-did");
const Web3 = require("web3");
const createVerifiableCredential = require("did-jwt-vc")
  .createVerifiableCredential;
const createPresentation = require("did-jwt-vc").createPresentation;
const Resolver = require("did-resolver").Resolver;
const getResolver = require("ethr-did-resolver").getResolver;
const verifyCredential = require("did-jwt-vc").verifyCredential;
const verifyPresentation = require("did-jwt-vc").verifyPresentation;
const md5 = require("md5");

const web3 = new Web3();

class UportClient {
  constructor() {
    // more providers - https://github.com/decentralized-identity/ethr-did-resolver/blob/develop/README.md
    const providerConfig = {
      name: "rsk:testnet",
      registry: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b",
      rpcUrl: "https://did.testnet.rsk.co:4444"
    };

    this.resolver = new Resolver(getResolver(providerConfig));
  }

  async createNewDID() {
    const account = web3.eth.accounts.create();
    const privKeyWithoutHeader = account.privateKey.substring(2);
    let did = { address: account.address, privateKey: privKeyWithoutHeader };
    return did;
  }

  async createVC(
    issuerAddress,
    issuerPrivateKey,
    ownerAddress,
    documentDID,
    documentType,
    documentHash,
    documentUrl,
    sealHash,
    notarizationType,
    notaryInfo,
    ownerSignature,
    pem,
    issueTime
  ) {
    const issuerEthrDid = new EthrDID({
      address: issuerAddress,
      privateKey: issuerPrivateKey
    });

    const subjectDid = "did:ethr:" + ownerAddress;

    const vcPayload = {
      sub: subjectDid,
      nbf: issueTime,
      vc: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential"],
        credentialSubject: {
          document: {
            type: documentType,
            hash: documentHash,
            urlHash: md5(documentUrl)
          },
          notarization: {
            sealHash: sealHash,
            notarizationType: notarizationType,
            notaryInfo: notaryInfo,
            ownerSignature: ownerSignature,
            pem: pem
          }
        }
      }
    };

    const vcJwt = await createVerifiableCredential(vcPayload, issuerEthrDid);
    return vcJwt;
  }

  async createVP(issuerAddress, issuerPrivateKey, vcJwt) {
    const issuerEthrDid = new EthrDID({
      address: issuerAddress,
      privateKey: issuerPrivateKey
    });

    const vpPayload = {
      vp: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiablePresentation"],
        verifiableCredential: [vcJwt]
      }
    };

    const vpJwt = await createPresentation(vpPayload, issuerEthrDid);
    return vpJwt;
  }

  async verifyVC(vcJwt) {
    const verifiedVC = await verifyCredential(vcJwt, this.resolver);
    return verifiedVC;
  }

  async verifyVP(vpJwt) {
    const verifiedVP = await verifyPresentation(vpJwt, this.resolver);
    return verifiedVP;
  }
}

module.exports = UportClient;
