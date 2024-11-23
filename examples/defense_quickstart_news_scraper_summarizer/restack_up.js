import { RestackCloud } from '@restackio/cloud';
import 'dotenv/config';

const main = async () => {
  const restackCloudClient = new RestackCloud(process.env.RESTACK_CLOUD_TOKEN);

  const restackEngineEnvs = [
    {
      name: 'RESTACK_ENGINE_ID',
      value: process.env.RESTACK_ENGINE_ID,
    },
    {
      name: 'RESTACK_ENGINE_ADDRESS',
      value: process.env.RESTACK_ENGINE_ADDRESS,
    },
    {
      name: 'RESTACK_ENGINE_API_KEY',
      value: process.env.RESTACK_ENGINE_API_KEY,
    },
  ];

  const engine = {
    name: 'restack_engine',
    image: 'ghcr.io/restackio/restack:main',
    portMapping: [
      {
        port: 5233,
        path: '/',
        name: 'engine-frontend',
      },
      {
        port: 6233,
        path: '/api',
        name: 'engine-api',
      },
    ],
    environmentVariables: [
      {
        name: 'RESTACK_ENGINE_ID',
        value: process.env.RESTACK_ENGINE_ID,
      },
      {
        name: 'RESTACK_ENGINE_ADDRESS',
        value: process.env.RESTACK_ENGINE_ADDRESS_WITHOUT_PORT,
      },
      {
        name: 'RESTACK_ENGINE_API_KEY',
        value: process.env.RESTACK_ENGINE_API_KEY,
      },
    ],
  };

  const frontend = {
    name: 'frontend',
    dockerFilePath:
      'examples/defense_quickstart_news_scraper_summarizer/frontend/Dockerfile',
    dockerBuildContext:
      'examples/defense_quickstart_news_scraper_summarizer/frontend',
    environmentVariables: [...restackEngineEnvs],
    portMapping: [
      {
        port: 3000,
        path: '/',
        name: 'frontend',
      },
    ],
  };

  const backend = {
    name: 'backend',
    dockerFilePath:
      'examples/defense_quickstart_news_scraper_summarizer/backend/Dockerfile',
    dockerBuildContext:
      'examples/defense_quickstart_news_scraper_summarizer/backend',
    environmentVariables: [
      ...restackEngineEnvs,
      {
        name: 'OPENBABYLON_API_URL',
        value: process.env.OPENBABYLON_API_URL,
      },
    ],
    portMapping: [
      {
        port: 3000,
        path: '/',
        name: 'backend',
      },
    ],
  };

  await restackCloudClient.stack({
    name: 'ts-defense_quickstart_news_scraper_summarizer',
    previewEnabled: false,
    applications: [frontend, backend, engine],
  });

  await restackCloudClient.up();
};

main();
