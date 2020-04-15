const FileSystem = require("fs");
const Crypto = require("crypto");

class FileSafe {
  constructor(filePath) {
    this.filePath = filePath;
  }

  encrypt(data) {
    try {
      var cipher = Crypto.createCipher(
        "aes-256-cbc",
        process.env.FILE_SAFE_KEY
      );
      var encrypted = Buffer.concat([
        cipher.update(Buffer.from(JSON.stringify(data), "utf8")),
        cipher.final(),
      ]);
      FileSystem.writeFileSync(this.filePath, encrypted);
      return { message: "Encrypted!" };
    } catch (exception) {
      throw new Error(exception.message);
    }
  }

  decrypt() {
    try {
      var data = FileSystem.readFileSync(this.filePath);
      var decipher = Crypto.createDecipher(
        "aes-256-cbc",
        process.env.FILE_SAFE_KEY
      );
      var decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
      return JSON.parse(decrypted.toString());
    } catch (exception) {
      throw new Error(exception.message);
    }
  }
}

exports.FileSafe = FileSafe;
