const Web3 = require("web3");
const web3 = new Web3();

class SimpleBlockchainClient {
  async createNewDID() {
    const account = web3.eth.accounts.create();
    const privKeyWithoutHeader = account.privateKey.substring(2);
    let did = { address: account.address, privateKey: privKeyWithoutHeader };
    return did;
  }
}

module.exports = SimpleBlockchainClient;
