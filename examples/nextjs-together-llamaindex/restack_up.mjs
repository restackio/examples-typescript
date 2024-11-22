import { RestackCloud } from "@restackio/cloud";
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

  const frontendNextJs = {
    name: "nextjs",
    dockerFilePath: "examples/nextjs-together-llamaindex/frontend/Dockerfile",
    dockerBuildContext: "examples/nextjs-together-llamaindex/frontend",
    environmentVariables: [...restackEngineEnvs],
  };

  const backendNodeJs = {
    name: "backend",
    dockerFilePath: "examples/nextjs-together-llamaindex/backend/Dockerfile",
    dockerBuildContext: "examples/nextjs-together-llamaindex/backend",
    environmentVariables: [
      ...restackEngineEnvs,
      {
        name: "TOGETHER_API_KEY",
        value: process.env.TOGETHER_API_KEY,
      },
    ],
  };

  await restackCloudClient.stack({
    name: "development environment",
    previewEnabled: false,
    applications: [frontendNextJs, backendNodeJs],
  });

  await restackCloudClient.up();
};

main();
