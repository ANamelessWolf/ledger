# Build the Angular app
FROM node:20 as build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -g @angular/cli
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 4202 for development server
EXPOSE 4202

# Command to run the Angular development server
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4202"]
