const EthCrypto = require("eth-crypto");

class DBUtil {
  static async populateDefaultValues(mongoDbInstance, secureKeyStorage) {
    const accounts = await mongoDbInstance.getAllAccounts();
    const documentTypes = await mongoDbInstance.getAllDocumentTypes();
    const accountTypes = await mongoDbInstance.getAllAccountTypes();
    const adminAccount = accounts.find(({ username }) => username === "admin");

    if (accountTypes.length === 0) {
      console.log("\nAccountTypes are empty. Populating default values...");

      const viewFeatures = [
        "gridView",
        "listView",
        "preview",
        "zoomIn",
        "download",
        "phone",
        "email",
        "profileImage",
        "didAddress",
        "organization",
        "role",
        "firstName",
        "lastName",
        "username",
        "documentUpdateDate",
        "documentUploadBy",
        "documentOtherContactsSharedWith",
        "documentValidUntil",
      ];

      const accountTypes = [
        "admin",
        "cityAdministrator",
        "itSpecialist",
        "clinicalCaseManager",
        "advocate",
        "caseManager",
        "caseManagerNotary",
        "intern",
        "notary",
        "volunteerNotary",
        "owner",
        "limitedOwner",
      ];

      // Add all view features to db
      for (let feature of viewFeatures) {
        await mongoDbInstance.addViewFeature(feature);
      }

      // Add all account types to db
      for (let accountType of accountTypes) {
        if (accountType === "admin" || accountType === "cityAdministrator") {
          await mongoDbInstance.createAccountType(accountType, 0);
        } else if (accountType === "itSpecialist") {
          await mongoDbInstance.createAccountType(accountType, 1);
        } else {
          await mongoDbInstance.createAccountType(accountType, 2);
        }
      }

      // Add all features for owner and notary and caseworker
      for (let feature of viewFeatures) {
        await mongoDbInstance.addViewFeatureToAccountType("admin", feature);
        await mongoDbInstance.addViewFeatureToAccountType(
          "cityAdministrator",
          feature
        );
        await mongoDbInstance.addViewFeatureToAccountType(
          "itSpecialist",
          feature
        );
        await mongoDbInstance.addViewFeatureToAccountType(
          "clinicalCaseManager",
          feature
        );
        await mongoDbInstance.addViewFeatureToAccountType("owner", feature);
        await mongoDbInstance.addViewFeatureToAccountType("notary", feature);
      }

      // Case Manager
      await mongoDbInstance.addViewFeatureToAccountType(
        "caseManager",
        "gridView"
      );
      await mongoDbInstance.addViewFeatureToAccountType(
        "caseManager",
        "listView"
      );
      await mongoDbInstance.addViewFeatureToAccountType(
        "caseManager",
        "zoomIn"
      );
      await mongoDbInstance.addViewFeatureToAccountType(
        "caseManager",
        "download"
      );
      await mongoDbInstance.addViewFeatureToAccountType(
        "caseManager",
        "preview"
      );
      await mongoDbInstance.addViewFeatureToAccountType("caseManager", "phone");

      // Volunteer Notary
      await mongoDbInstance.addViewFeatureToAccountType(
        "volunteerNotary",
        "firstName"
      );
      await mongoDbInstance.addViewFeatureToAccountType(
        "volunteerNotary",
        "lastName"
      );
    }

    if (documentTypes.length === 0) {
      console.log("\nDocumentTypes are empty. Populating default values...");
      let records = [
        "Driver's License",
        "Birth Certificate",
        "MAP Card",
        "Medical Records",
        "Social Security Card",
        "Passport",
        "Marriage Certificate",
      ];
      for (let record of records) {
        let fields = [
          { fieldName: "name", required: true },
          { fieldName: "dateofbirth", required: false },
        ];

        if (record === "MAP Card" || record === "Marriage Certificate") {
          mongoDbInstance.createDocumentType({
            name: record,
            fields: fields,
            isTwoSided: false,
            hasExpirationDate: false,
            isProtectedDoc: false,
            isRecordableDoc: true,
          });
        } else if (record === "Medical Records") {
          mongoDbInstance.createDocumentType({
            name: record,
            fields: fields,
            isTwoSided: false,
            hasExpirationDate: false,
            isProtectedDoc: true,
            isRecordableDoc: false,
          });
        } else {
          mongoDbInstance.createDocumentType({
            name: record,
            fields: fields,
            isTwoSided: true,
            hasExpirationDate: true,
            isProtectedDoc: false,
            isRecordableDoc: true,
          });
        }
      }
    }

    if (
      process.env.ADMIN_PASSWORD !== undefined &&
      adminAccount === undefined
    ) {
      console.log("\nAdmin account is empty. Populating admin account...");

      // Admin
      let adminAccount = {
        account: {
          username: "admin",
          firstname: "admin",
          lastname: "admin",
          password: process.env.ADMIN_PASSWORD,
          role: "admin",
          email: "admin@admin.com",
          phonenumber: "555-555-5555",
          organization: "-",
        },
      };
      let adminDid = {
        did: {
          address: "0xD19834a92604Fe21A8E5631F755aEC7d63Cb4b1c",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "0daf9bae0e6f9069e012973daf82c404d373b5da8a6cbaa590133faf8be2d017"
          ),
          privateKey:
            "0daf9bae0e6f9069e012973daf82c404d373b5da8a6cbaa590133faf8be2d017",
          privateKeyGuid: "1d9ac500-ba5d-4c80-ae9a-45a3098e19ea",
        },
      };

      await secureKeyStorage.store(
        adminDid.did.privateKeyGuid,
        adminDid.did.privateKey
      );

      mongoDbInstance.createAccount(
        adminAccount.account,
        adminDid.did,
        "06fy-0000",
        "goku.png"
      );
    }
    if (accounts.length === 0) {
      console.log("\nAccounts are empty. Populating default values...");

      // Sally
      let ownerAccount = {
        account: {
          username: "SallyOwner",
          firstname: "Sally",
          lastname: "Owner",
          password: "owner",
          role: "owner",
          email: "owner@owner.com",
          phonenumber: "555-555-5555",
          organization: "-",
        },
      };
      let ownerDid = {
        did: {
          address: "0x6efedeaec20e79071251fffa655F1bdDCa65c027",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "d28678b5d893ea7accd58901274dc5df8eb00bc76671dbf57ab65ee44c848415"
          ),
          privateKey:
            "d28678b5d893ea7accd58901274dc5df8eb00bc76671dbf57ab65ee44c848415",
          privateKeyGuid: "5663aaf5-2b94-4854-a862-07a7fe75e400",
        },
      };

      await secureKeyStorage.store(
        ownerDid.did.privateKeyGuid,
        ownerDid.did.privateKey
      );

      mongoDbInstance.createAccount(
        ownerAccount.account,
        ownerDid.did,
        "06fz-0000",
        "sally.png"
      );

      // Billy
      let caseWorkerAccount = {
        account: {
          username: "BillyCaseWorker",
          firstname: "Billy",
          lastname: "Caseworker",
          password: "caseworker",
          role: "notary",
          email: "caseworker@caseworker.com",
          phonenumber: "555-555-5555",
          organization: "Banana Org",
        },
      };
      let caseWorkerDid = {
        did: {
          address: "0x2a6F1D5083fb19b9f2C653B598abCb5705eD0439",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "8ef83de6f0ccf32798f8afcd436936870af619511f2385e8aace87729e771a8b"
          ),
          privateKey:
            "8ef83de6f0ccf32798f8afcd436936870af619511f2385e8aace87729e771a8b",
          privateKeyGuid: "53d9269b-a90b-423e-be17-e2a6517790b1",
        },
      };

      await secureKeyStorage.store(
        caseWorkerDid.did.privateKeyGuid,
        caseWorkerDid.did.privateKey
      );

      mongoDbInstance.createAccount(
        caseWorkerAccount.account,
        caseWorkerDid.did,
        "06fy-0000",
        "billy.png"
      );

      // Karen
      let caseWorkerAccountTwo = {
        account: {
          username: "KarenCaseWorker",
          firstname: "Karen",
          lastname: "Caseworker",
          password: "caseworker",
          role: "notary",
          email: "karencaseworker@caseworker.com",
          phonenumber: "555-555-5555",
          organization: "Apple Org",
        },
      };
      let caseWorkerDidTwo = {
        did: {
          address: "0x0F4FBead5219388CD71FAa2bbd63C26Aad0ae2c5",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "403c9b0e55db5ff1434d07711baa34d76eecc2723cdb599a42f5f2cbf6fd3262"
          ),
          privateKey:
            "403c9b0e55db5ff1434d07711baa34d76eecc2723cdb599a42f5f2cbf6fd3262",
          privateKeyGuid: "6ee64b8e-0623-4cad-8162-26e49e74b2dc",
        },
      };

      await secureKeyStorage.store(
        caseWorkerDidTwo.did.privateKeyGuid,
        caseWorkerDidTwo.did.privateKey
      );

      mongoDbInstance.createAccount(
        caseWorkerAccountTwo.account,
        caseWorkerDidTwo.did,
        "06fy-0000",
        "karen.png"
      );

      // Josh
      let caseWorkerAccountThree = {
        account: {
          username: "JoshCaseWorker",
          firstname: "Josh",
          lastname: "Caseworker",
          password: "caseworker",
          role: "notary",
          email: "joshcaseworker@caseworker.com",
          phonenumber: "555-555-5555",
          organization: "Pear Org",
        },
      };
      let caseWorkerDidThree = {
        did: {
          address: "0x56bf6887202d8aa6Df4Bc312e866E955FE0FC9aD",
          publicEncryptionKey: EthCrypto.publicKeyByPrivateKey(
            "0x" +
              "a2bf1a07ccb785b7baf041dc0135ae9bfbf049bd36068777e4796185fe1ff5c0"
          ),
          privateKey:
            "a2bf1a07ccb785b7baf041dc0135ae9bfbf049bd36068777e4796185fe1ff5c0",
          privateKeyGuid: "22161991-55f9-45fc-b6c5-de8e339701f1",
        },
      };

      await secureKeyStorage.store(
        caseWorkerDidThree.did.privateKeyGuid,
        caseWorkerDidThree.did.privateKey
      );

      mongoDbInstance.createAccount(
        caseWorkerAccountThree.account,
        caseWorkerDidThree.did,
        "06fy-0000",
        "josh.png"
      );
    }

    console.log("\n~Mypass Is Ready!~\n");
  }
}

module.exports = DBUtil;
