# Run Restack in Docker

docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/local-operator:main

# Open the Restack Desktop UI

http://localhost:5233


# Clone starter repo

git clone https://github.com/restackio/starter-ts.git

cd starter-ts

# Install dependencies

npm i

# Publish your service
npm run service

# Trigger the workflow

npm run trigger