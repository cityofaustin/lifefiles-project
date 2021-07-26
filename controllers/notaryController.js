const axios = require("axios");
const qs = require("qs");

const notaryController = {
  query: async (req, res, next) => {
    try {
      const query = req.body;
      var data = qs.stringify({
        ":Ssearch_parm1": "" + query.id,
        ":Ssearch_parm2": "",
        ":Ssearch_parm3": "",
        ":Ssearch_parm4": "",
        ":Ssearch_parm5": "",
        ":Ssearch_parm6": "",
        ":Ssearch_parm7": "",
        submit2: "Search+Active+Notaries+Only",
        ssubmit: "Active",
      });
      var config = {
        method: "post",
        url: "https://direct.sos.state.tx.us/notaries/NotarySearch.asp",
        data: data,
      };
      const response = await axios(config);
      const responseHtml = response.data;
      let returnInfo = {};
      let attributes = ["Name:", "Address:", "Expires:", "County:"];

      if (responseHtml.indexOf("No records found.") !== -1) {
        return {};
      }

      for (let attribute of attributes) {
        let attributeIndex = responseHtml.lastIndexOf(attribute);

        if (attributeIndex !== -1) {
          let cutString = responseHtml.slice(
            attributeIndex,
            attributeIndex + 200
          );
          let endingIndex = cutString.indexOf("</strong>");

          let attributeBlob = responseHtml.slice(
            attributeIndex,
            attributeIndex + endingIndex
          );

          attributeBlob = attributeBlob.replace("<strong>", "");
          attributeBlob = attributeBlob.replace("</strong>", "");
          attributeBlob = attributeBlob.replace("<td>", "");
          attributeBlob = attributeBlob.replace("</td>", "");
          attributeBlob = attributeBlob.replace("<br>", " ");
          attributeBlob = attributeBlob.replace("&nbsp;", " ");
          attributeBlob = attributeBlob.replace(attribute, "");
          attributeBlob = attributeBlob.replace("  ", " ");

          let key = attribute.replace(":", "").toLowerCase();
          returnInfo[key] = attributeBlob.trim();
        }
      }
      res.status(200).json(returnInfo);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = notaryController;
