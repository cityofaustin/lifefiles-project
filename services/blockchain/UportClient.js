const Web3 = require("web3");
const Resolver = require("did-resolver").Resolver;
const getResolver = require("ethr-did-resolver").getResolver;
const verifyCredential = require("did-jwt-vc").verifyCredential;
const verifyPresentation = require("did-jwt-vc").verifyPresentation;
const axios = require("axios");
const DidRegistryContract = require("ethr-did-registry");

const ETHER_GAS_STATION_API = "https://ethgasstation.info/api/ethgasAPI.json";
const ENS_REGISTRY_PUBLIC_RESOLVER_ABI_JSON = require("./contracts/publicResolverAbi.json");
const ENS_REGISTRY_PUBLIC_RESOLVER_ADDRESS =
  "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";
const ENS_NODE =
  "0x3442daf145b62820466398f343a5666abd6b41e9144476431b4360e0007a214e";
const NAME_KEY =
  "0x6469642f7376632f76706a777400000000000000000000000000000000000000"; // did/svc/vpjwt

const REFUND_GAS_PRICE = 1000000000;
const CONTRACT_DEFAULT_GAS = 300000;
const FUND_ACCOUNT_GAS = 21000;

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URI));
const ensContract = new web3.eth.Contract(
  JSON.parse(ENS_REGISTRY_PUBLIC_RESOLVER_ABI_JSON.result),
  ENS_REGISTRY_PUBLIC_RESOLVER_ADDRESS
);

const fundingAccount = web3.eth.accounts.privateKeyToAccount(
  process.env.ETH_FUNDING_PRIVATE_KEY
);
const ethDomainAccount = web3.eth.accounts.privateKeyToAccount(
  process.env.ETH_MYPASS_DOMAIN_PRIVATE_KEY
);

web3.eth.accounts.wallet.add(fundingAccount);
web3.eth.accounts.wallet.add(ethDomainAccount);

const didRegContract = new web3.eth.Contract(DidRegistryContract.abi);
didRegContract.options.address = "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b"; // mainnet

class UportClient {
  constructor() {
    // more providers - https://github.com/decentralized-identity/ethr-did-resolver/blob/develop/README.md
    const providerConfig = {
      name: "mainnet",
      registry: "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b",
      rpcUrl: process.env.INFURA_URI,
    };

    this.resolver = new Resolver(getResolver(providerConfig));
    this.nonceOverhead = 0;
  }

  async createNewDID() {
    const account = web3.eth.accounts.create();
    const privKeyWithoutHeader = account.privateKey.substring(2);
    let did = { address: account.address, privateKey: privKeyWithoutHeader };
    return did;
  }

  async verifyVC(vcJwt) {
    const verifiedVC = await verifyCredential(vcJwt, this.resolver);
    return verifiedVC;
  }

  async verifyVP(vpJwt) {
    const verifiedVP = await verifyPresentation(vpJwt, this.resolver);
    return verifiedVP;
  }

  async getTxtRecord(didKey) {
    let res = await ensContract.methods.text(ENS_NODE, didKey).call();
    return res;
  }

  async setTxtRecord(didKey, nameValue) {
    let gasEstimate = await ensContract.methods
      .setText(ENS_NODE, didKey, nameValue)
      .estimateGas({ from: ethDomainAccount.address });

    let gasStationPrice = await axios.get(ETHER_GAS_STATION_API);

    console.log(
      "Starting Set Txt Record With Eth Domain Address: " +
        ethDomainAccount.address
    );
    try {
      await ensContract.methods.setText(ENS_NODE, didKey, nameValue).send({
        from: ethDomainAccount.address,
        gasPrice: 100000000 * gasStationPrice.data.safeLow,
        gas: gasEstimate,
      });
    } catch (err) {
      console.log("Ens Contract Error:");
      console.log(err);
    }
  }

  async storeDataOnEthereumBlockchain(
    didAddress,
    didPrivateKey,
    validityTime,
    dataToStore
  ) {
    const didAccount = web3.eth.accounts.privateKeyToAccount(
      "0x" + didPrivateKey
    );
    const identity = didAddress;
    const value = web3.utils.asciiToHex(dataToStore);

    let gasStationPrice = await axios.get(ETHER_GAS_STATION_API);

    // Gas estimation is totally wrong...
    // let gasEstimate;
    // try {
    //   gasEstimate = await didRegContract.methods
    //     .setAttribute(identity, NAME_KEY, value, validityTime)
    //     .estimateGas({ from: identity, gasPrice: CONTRACT_GAS_PRICE });
    // } catch (err) {
    //   console.log(err);
    //   return;
    // }

    let payAmount = CONTRACT_DEFAULT_GAS;

    web3.eth.accounts.wallet.add(didAccount);
    web3.eth.transactionPollingTimeout = 3600;

    let nonce =
      (await web3.eth.getTransactionCount(fundingAccount.address)) +
      this.nonceOverhead;

    this.nonceOverhead++;

    console.log("Starting Eth Transactions with account: " + identity);

    const safeLowGasPrice = 100000000 * gasStationPrice.data.safeLow;

    try {
      console.log("Send Transaction Start");
      await web3.eth.sendTransaction({
        from: fundingAccount.address,
        to: identity,
        value: payAmount * safeLowGasPrice,
        gasPrice: safeLowGasPrice,
        gas: FUND_ACCOUNT_GAS,
        nonce: nonce,
      });
      console.log(
        identity +
          " Has Been Funded With " +
          payAmount +
          " * " +
          safeLowGasPrice
      );
    } catch (err) {
      console.log("Send transaction error:");
      console.log(err);
    }

    this.nonceOverhead--;

    try {
      console.log("Did Reg Contract Transaction Start");
      await didRegContract.methods
        .setAttribute(identity, NAME_KEY, value, validityTime)
        .send({
          from: identity,
          gasPrice: safeLowGasPrice,
          gas: payAmount,
        });

      console.log(identity + " VC Has Been Registed On The Blockchain!");
    } catch (err) {
      console.log("Did Reg Contract error:");
      console.log(err);
    }

    web3.eth.getBalance(identity, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Send Back Optional Transaction Start");
        let leftOver = result - REFUND_GAS_PRICE * FUND_ACCOUNT_GAS;

        if (leftOver >= REFUND_GAS_PRICE * FUND_ACCOUNT_GAS) {
          web3.eth
            .sendTransaction({
              from: identity,
              to: fundingAccount.address,
              value: leftOver,
              gasPrice: REFUND_GAS_PRICE,
              gas: FUND_ACCOUNT_GAS,
            })
            .on("error", function (error, receipt) {
              console.log(error);
              console.log(receipt);
            });
        } else {
          console.log(identity + " Does Not Have Enough For Refund.");
        }
      }
    });
  }
}

module.exports = UportClient;
