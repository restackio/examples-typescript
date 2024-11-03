import { RestackCloud } from "@restackio/restack-sdk-cloud-ts";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_CLOUD_TOKEN);

  const restackEngineEnvs = [
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
  ];

  const expressServer = {
    name: "express",
    dockerFilePath: "examples/express/Dockerfile",
    dockerBuildContext: "examples/express",
    environmentVariables: [
      ...restackEngineEnvs
    ],
  };

  await restackCloudClient.stack({
    name: "development environment",
    previewEnabled: false,
    applications: [expressServer],
  });

  await restackCloudClient.up();
};

main();