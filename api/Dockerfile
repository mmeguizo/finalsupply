# Use the official Node.js 16.20.2 image
FROM node:16.20.2-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies INSIDE the container
RUN npm install

# Copy the rest of your code
COPY . .

# Install dependencies
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the port your GraphQL server uses (4000)
EXPOSE 4000

# Command to run your development server (adjust if needed)
CMD ["npm", "run", "dev"]