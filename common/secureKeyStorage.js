const { FileSafe } = require("./FileSafe");
const common = require("../common/common");
const Crypto = require("crypto");
let safe;

if (process.env.ENVIRONMENT === "DEVELOPMENT") {
  safe = new FileSafe("safe.dat", process.env.FILE_SAFE_KEY);
  try {
    safe.decrypt();
  } catch (err) {
    console.log("Creating new encryption file");
    let emptyJson = {};
    safe.encrypt(emptyJson);
  }
}

module.exports = {
  store: async (guid, key) => {
    if (process.env.ENVIRONMENT === "DEVELOPMENT") {
      let data = safe.decrypt();
      data[guid] = key;
      safe.encrypt(data);
    } else {
      module.exports.storeToDb(guid, key);
    }
  },
  retrieve: async (guid) => {
    if (process.env.ENVIRONMENT === "DEVELOPMENT") {
      let data = safe.decrypt();
      return data[guid];
    } else {
      module.exports.retrieveFromDb(guid);
    }
  },

  storeToDb: async (guid, key) => {
    let cipher = Crypto.createCipher("aes-256-cbc", process.env.FILE_SAFE_KEY);
    let encryptedKey = cipher.update(key, "utf8", "hex");
    encryptedKey += cipher.final("hex");

    await common.dbClient.store(guid, encryptedKey);
  },

  retrieveFromDb: async (guid) => {
    const keyObj = await common.dbClient.retrieve(guid);

    let decipher = Crypto.createDecipher(
      "aes-256-cbc",
      process.env.FILE_SAFE_KEY
    );

    let decryptedKey = decipher.update(keyObj.encryptedKey, "hex", "utf8");
    decryptedKey += decipher.final("utf8");

    return decryptedKey;
  },
};
