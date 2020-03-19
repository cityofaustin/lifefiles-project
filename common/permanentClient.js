let permanent;

try {
  permanent = require("permanent-api-js");
} catch (e) {
  console.log(e);
  console.log("Continuing without permanent...");
}

module.exports = {
  addToPermanentArchive: async (file, key, permanentOrgArchiveNumber) => {
    if (permanent !== undefined) {
      let permanentFile = file;
      permanentFile.path = permanentFile.tempFilePath;

      let fileReq = {
        file: new permanent.File(permanentFile),
        archive_number: permanentOrgArchiveNumber,
        originalname: permanentFile.name,
        filehandle: key
      };

      let saveRes = await permanent.addFile(fileReq);

      if (!saveRes.success || saveRes.data === undefined) {
        console.log("Permanent Save Error");
        console.log(saveRes);
      }

      const permanentOrgFileArchiveNumber =
        saveRes.data.record.recordArchiveNumber;

      return permanentOrgFileArchiveNumber;
    }
  },

  createArchive: async email => {
    if (permanent !== undefined) {
      let permanentArchiveNumber = "";

      const permRes = await permanent.createArchive({
        name: email
      });

      if (permRes.success) {
        permanentArchiveNumber = permRes.data.archiveNbr;
      } else {
        console.log("Permanent Error");
        console.log(permRes);
      }

      return permanentArchiveNumber;
    }
  }
};
