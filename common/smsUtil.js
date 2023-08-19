module.exports = {
  sendSms: async (message, number) => {
    const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
    const snsClient = new SNSClient({
      region: "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    // Create publish parameters
    const params = {
      Message: message,
      PhoneNumber: number,
    };

    // Handle promise's fulfilled/rejected states
    try {
      const publishTextPromise = await snsClient.send(new PublishCommand(params));
      console.log("MessageID is " + publishTextPromise.MessageId);
    } catch (err) {
      console.error(err, err.stack);
    }
  },
};
