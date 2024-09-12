import { RestackCloud } from "@restackio/restack-sdk-cloud-ts";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_SDK_TOKEN);

  const servicesApp = {
    name: "services",
    dockerFilePath: "examples/voice/Dockerfile",
    dockerBuildContext: "examples/voice",
    environmentVariables: [
      {
        name: "OPENAI_API_KEY",
        value: process.env.OPENAI_API_KEY,
      },
      {
        name: "DEEPGRAM_API_KEY",
        value: process.env.DEEPGRAM_API_KEY,
      },
      {
        name: "TWILIO_ACCOUNT_SID",
        value: process.env.TWILIO_ACCOUNT_SID,
      },
      {
        name: "TWILIO_AUTH_TOKEN",
        value: process.env.TWILIO_AUTH_TOKEN,
      },
      {
        name: "FROM_NUMBER",
        value: process.env.FROM_NUMBER,
      },
      {
        name: "APP_NUMBER",
        value: process.env.APP_NUMBER,
      }, 
      {
        name: "YOUR_NUMBER",
        value: process.env.YOUR_NUMBER,
      },
      {
        name: "RESTACK_API_KEY",
        value: process.env.RESTACK_API_KEY,
      },
      {
        name: "RESTACK_API_ADDRESS",
        value: process.env.RESTACK_API_ADDRESS,
      },
      {
        name: "RESTACK_TEMPORAL_NAMESPACE",
        value: process.env.RESTACK_TEMPORAL_NAMESPACE,
      },
    ],
  };


  await restackCloudClient.stack({
    name: "development environment",
    previewEnabled: false,
    applications: [servicesApp],
  });

  await restackCloudClient.up();
};

main();