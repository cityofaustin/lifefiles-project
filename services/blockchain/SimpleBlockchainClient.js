const Web3 = require("web3");
const web3 = new Web3();
const verifyCredential = require("did-jwt-vc").verifyCredential;
const verifyPresentation = require("did-jwt-vc").verifyPresentation;
const Resolver = require("did-resolver").Resolver;
const getResolver = require("ethr-did-resolver").getResolver;

// Simple resolver does not need rpcUrl but we need a valid resolver for verifyVP
const providerConfig = {
  name: "mainnet",
  registry: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b",
  rpcUrl: "https://did.testnet.rsk.co:4444",
};

const resolver = new Resolver(getResolver(providerConfig));

class SimpleBlockchainClient {
  async createNewDID() {
    const account = web3.eth.accounts.create();
    const privKeyWithoutHeader = account.privateKey.substring(2);
    let did = { address: account.address, privateKey: privKeyWithoutHeader };
    return did;
  }

  async verifyVC(vcJwt) {
    const verifiedVC = await verifyCredential(vcJwt, resolver);
    return verifiedVC;
  }

  async verifyVP(vpJwt) {
    const verifiedVP = await verifyPresentation(vpJwt, resolver);
    return verifiedVP;
  }
}

module.exports = SimpleBlockchainClient;
