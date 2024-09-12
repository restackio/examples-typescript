import { RestackCloud } from "@restackio/restack-sdk-cloud-ts";
import "dotenv/config";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_SDK_TOKEN);

  const serverName = "server"

  const commonEnvs = [
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
  ]

  const serverApp = {
    name: serverName,
    dockerFilePath: "examples/voice/Dockerfile.server",
    dockerBuildContext: "examples/voice",
    environmentVariables: [
      {
        name: "PORT",
        value: "80",
      },
      {
        name: "SERVER_HOST",
        linkTo:serverName,
      },
      ...commonEnvs
    ],
  };

  const servicesApp = {
    name: "services",
    dockerFilePath: "examples/posthog/Dockerfile",
    dockerBuildContext: "examples/posthog",
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
        value: process.env.OPENAI_API_KEY,
      },
      {
        name: "APP_NUMBER",
        value: process.env.DEEPGRAM_API_KEY,
      },
      {
        name: "YOUR_NUMBER",
        value: process.env.TWILIO_ACCOUNT_SID,
      },
      {
        name: "TWILIO_AUTH_TOKEN",
        value: process.env.TWILIO_AUTH_TOKEN,
      },
      ...commonEnvs
    ],
  };


  await restackCloudClient.stack({
    name: "development environment",
    previewEnabled: false,
    applications: [serverApp, servicesApp],
  });

  await restackCloudClient.up();
};

main();