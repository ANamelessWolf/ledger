FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Install dev dependencies and ts-node-dev globally
RUN npm install -g ts-node-dev

COPY . .

# Un comment to start the application in production
#RUN npm run build

EXPOSE 3002

# Start the application in production
# CMD ["node", "dist/index.js"]

# Start the development server
CMD ["ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]