import { RestackCloud } from "@restackio/restack-sdk-cloud-ts";
import "dotenv/config";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_CLOUD_TOKEN);

  const restackEngineEnvs = [
    {
      name: "RESTACK_ENGINE_ID",
      value: process.env.RESTACK_ENGINE_ID,
    },
    {
      name: "RESTACK_ENGINE_ADDRESS",
      value: process.env.RESTACK_ENGINE_ADDRESS,
    },
    {
      name: "RESTACK_ENGINE_API_KEY",
      value: process.env.RESTACK_ENGINE_API_KEY,
    },
  ];

  const servicesApp = {
    name: "services",
    dockerFilePath: "examples/hello/Dockerfile",
    dockerBuildContext: "examples/hello",
    environmentVariables: [
      {
        name: "OPENAI_API_KEY",
        value: process.env.OPENAI_API_KEY,
      },
      ...restackEngineEnvs,
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