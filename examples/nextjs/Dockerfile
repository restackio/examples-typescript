# Use the official Node.js LTS image as the base image
FROM node:lts-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

ARG NEXT_PUBLIC_API_HOSTNAME
ENV NEXT_PUBLIC_API_HOSTNAME=${NEXT_PUBLIC_API_HOSTNAME}

RUN npm run build

# Expose the port the app runs on
EXPOSE 80

# Start the application
CMD ["npm", "start"]