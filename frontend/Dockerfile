# Build the Angular app
FROM node:20 as build

WORKDIR /usr/src/app

# Only package.json: package-lock.json was generated on Windows and doesn't
# carry the Linux build of rollup's native binary (npm optional-deps bug,
# https://github.com/npm/cli/issues/4828). Installing fresh here resolves
# the right platform binaries for this container.
COPY package.json ./

# Install dependencies
RUN npm install -g @angular/cli
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 4202 for development server
EXPOSE 4202

# Command to run the Angular development server
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4202"]
