# Use an official Node.js image for building the React app
FROM node:alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use an NGINX image to serve the built React app
FROM nginx:alpine

# Copy built app to NGINX's default static directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
