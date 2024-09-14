import { RestackCloud } from "@restackio/restack-sdk-cloud-ts";

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_SDK_TOKEN);

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