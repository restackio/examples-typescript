import { RestackCloud } from "@restackio/cloud";
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
    dockerFilePath: "examples/gemini/Dockerfile",
    dockerBuildContext: "examples/gemini",
    environmentVariables: [
      {
        name: "GEMINI_API_KEY",
        value: process.env.GEMINI_API_KEY,
      },
      ...restackEngineEnvs,
    ],
  };

  await restackCloudClient.stack({
    name: "gemini development environment",
    previewEnabled: false,
    applications: [servicesApp],
  });

  await restackCloudClient.up();
};

main();
