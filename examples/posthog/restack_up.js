import { RestackCloud } from "@restackio/restack-sdk-cloud-ts";
import "dotenv/config";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_SDK_TOKEN);


  const restackEngineEnvs = [
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