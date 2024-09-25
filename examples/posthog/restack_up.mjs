import { RestackCloud } from "@restackio/restack-sdk-cloud-ts";
import "dotenv/config";

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

  const servicesApp = {
    name: "services",
    dockerFilePath: "examples/posthog/Dockerfile",
    dockerBuildContext: "examples/posthog",
    environmentVariables: [
      ...restackEngineEnvs,
      ...Object.keys(process.env).map(key => ({
        name: key,
        value: process.env[key],
      })),
    ],
  };


  await restackCloudClient.stack({
    name: "posthog-example",
    previewEnabled: false,
    applications: [servicesApp],
  });

  await restackCloudClient.up();
};

main();