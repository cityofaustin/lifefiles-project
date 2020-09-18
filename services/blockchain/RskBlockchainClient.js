const rskapi = require("rskapi");
// const client = rskapi.client("https://public-node.testnet.rsk.co:443"); // rsk testnet public node
const client = rskapi.client("https://public-node.rsk.co:443"); // rsk mainnet public node
const Web3 = require("web3");

const NAME_KEY =
  "0x6469642f7376632f76706a777400000000000000000000000000000000000000"; // did/svc/vpjwt
const REFUND_GAS_PRICE = 1000000000;
const CONTRACT_DEFAULT_GAS = 300000;
const FUND_ACCOUNT_GAS = 21000;

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URI));

const fundingAccount = web3.eth.accounts.privateKeyToAccount(
  process.env.ETH_FUNDING_PRIVATE_KEY
);

class RskBlockchainClient {
  constructor() {}

  async storeDataOnRskBlockchain(
    didAddress,
    didPrivateKey,
    validityTime,
    dataToStore
  ) {
    // const didAccount = web3.eth.accounts.privateKeyToAccount(
    //   "0x" + didPrivateKey
    // );
    const identity = didAddress;
    const value = web3.utils.asciiToHex(dataToStore);

    let payAmount = CONTRACT_DEFAULT_GAS;
    let didRegContractReceipt;

    console.log(
      "Starting Rsk Blockchain Transactions with account: " + identity
    );

    let rskGasPrice = await client.host().getGasPrice();

    try {
      console.log(
        "Send Transaction Start and funding identity from funding account:" +
          fundingAccount.address +
          " -> " +
          identity
      );

      const txhash = await client.transfer(
        {
          address: fundingAccount.address,
          privateKey: process.env.ETH_FUNDING_PRIVATE_KEY,
        },
        identity,
        payAmount * rskGasPrice,
        { gas: 21000 }
      );

      let receiptHash = await client.receipt(txhash);
      console.log({ receiptHash });
    } catch (err) {
      console.log("Send transaction error:");
      console.log(err);
    }

    try {
      let setAttributeArgs = [identity, NAME_KEY, value, validityTime];

      didRegContractReceipt = await client.invoke(
        {
          address: identity,
          privateKey: "0x" + didPrivateKey,
        },
        "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b",
        "setAttribute(address,bytes32,bytes,uint256)",
        setAttributeArgs,
        { gas: CONTRACT_DEFAULT_GAS, gasPrice: rskGasPrice }
      );

      let receiptHash = await client.receipt(didRegContractReceipt);
      console.log({ receiptHash });

      console.log(identity + " VC Has Been Registed On The Blockchain!");
    } catch (err) {
      console.log({ err });
    }

    let balanceRes = await client.balance(identity);
    let balance = parseInt(web3.utils.hexToNumberString(balanceRes), 10);
    console.log({ balance });

    let leftOver = balance - REFUND_GAS_PRICE * FUND_ACCOUNT_GAS;

    if (leftOver >= REFUND_GAS_PRICE * FUND_ACCOUNT_GAS) {
      console.log(
        "Sending back leftover coin: " +
          identity +
          " -> " +
          fundingAccount.address
      );
      await client.transfer(
        {
          address: identity,
          privateKey: "0x" + didPrivateKey,
        },
        fundingAccount.address,
        leftOver,
        { gas: 21000, gasPrice: rskGasPrice }
      );
    } else {
      console.log(identity + " Does Not Have Enough For Refund.");
    }
  }
}

module.exports = RskBlockchainClient;
