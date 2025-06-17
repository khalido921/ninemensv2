# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install root dependencies
RUN npm install

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Return to root directory
WORKDIR /app

# Copy source code
COPY . .

# Build the React app
WORKDIR /app/client
RUN npm run build

# Return to root directory
WORKDIR /app

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "server"] 