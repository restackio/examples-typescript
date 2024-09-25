import { RestackCloud } from "@restackio/restack-sdk-cloud-ts";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_CLOUD_TOKEN);

  const servicesApp = {
    name: "services",
    dockerFilePath: "examples/hello/Dockerfile",
    dockerBuildContext: "examples/hello",
    environmentVariables: [
      {
        name: "OPENAI_API_KEY",
        value: process.env.OPENAI_API_KEY,
      },
      {
        name: "RESTACK_ENGINE_ENV_ID",
        value: process.env.RESTACK_ENGINE_ENV_ID,
      },
      {
        name: "RESTACK_ENGINE_ENV_ADDRESS",
        value: process.env.RESTACK_ENGINE_ENV_ADDRESS,
      },
      {
        name: "RESTACK_ENGINE_ENV_API_KEY",
        value: process.env.RESTACK_ENGINE_ENV_API_KEY,
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