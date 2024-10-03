# Run Restack in Docker
docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/local-operator:main

# Open the development UI
http://localhost:5233

# Clone starter repo
git clone https://github.com/restackio/sdk-ts-examples/

cd sdk-ts-examples/examples/get-started

# Install dependencies
npm i

# Publish your service
npm run service

# Trigger the workflow
npm run trigger

# Check the development UI to see your workflow executed
http://localhost:5233
