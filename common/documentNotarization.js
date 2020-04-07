const fs = require("fs");
var pdf = require("html-pdf");
const md5 = require("md5");

let html = fs.readFileSync(
  require.resolve("../notorization-templates/notarized-document.html"),
  "utf8"
);

module.exports = {
  createNotarizedDocument: async (
    scannedImage,
    notarialCertificateText,
    notaryDigitalSeal,
    documentDID
  ) => {
    let prefix = "";
    if (process.platform === "win32") {
      prefix = "C:\\";
    }

    html = html.replace(
      "{{document}}",
      "file:///" + prefix + scannedImage.tempFilePath
    );

    html = html.replace(
      "{{certificate}}",
      "file:///" + prefix + notarialCertificateText.tempFilePath
    );

    html = html.replace(
      "{{seal}}",
      "file:///" + prefix + notaryDigitalSeal.tempFilePath
    );

    html = html.replace("{{documentDID}}", documentDID);

    let pdfRes = await pdf.create(html, {});
    let fileInfo = await getFileInfoPromise(pdfRes);
    return fileInfo;
  }
};

getFileInfoPromise = async pdfRes => {
  return new Promise((resolve, reject) => {
    pdfRes.toFile((err, fileInfo) => {
      if (err) {
        console.log("PDF Creation Error");
        console.log(err);
      }
      fs.readFile(fileInfo.filename, function(err, buf) {
        fileInfo.md5 = md5(buf);
        resolve(fileInfo);
      });
    });
  });
};
