# Requirements

- Docker Desktop

- Node 20 or higher

brew install nvm
nvm use 20

- pnpm

brew install pnpm

# Run Restack backend (will be integrated in Restack Desktop )

docker compose up -d --build --pull always

(will force repulling and rebuilding)

# Run Restack Desktop

Open restack-desktop.dmg and launch app

# Install dependencies

in both folders:
/examples/hello/backend
/examples/hello/trigger

pnpm i

# Launch backend

in /examples/hello/backend
pnpm dev

# Trigger workflow

in /examples/hello/trigger
pnpm trigger
