# Run Restack in Docker
docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/restack:main

# Open the Desktop UI
http://localhost:5233

# Clone starter repo
git clone https://github.com/restackio/sdk-ts-examples/

cd sdk-ts-examples/examples/get-started

# Install dependencies
npm i

# Run your service in the background
npm run service

# Schedule the workflow
npm run schedule

# Check the Desktop UI to see your workflow executed
http://localhost:5233
