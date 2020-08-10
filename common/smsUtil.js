module.exports = {
  sendSms: async (message, number) => {
    var AWS = require("aws-sdk");

    AWS.config.update({
      region: "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    // Create publish parameters
    var params = {
      Message: message,
      PhoneNumber: number,
    };

    // Create promise and SNS service object
    var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
      .publish(params)
      .promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise
      .then(function (data) {
        console.log("MessageID is " + data.MessageId);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  },
};
