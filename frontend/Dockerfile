# Stage 1: Build the React app
FROM node:20-alpine AS build-stage

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
# We use 'npm install' to ensure lucide-react and dnd-kit are fetched
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app
# If there is a syntax error in Ribbon.jsx, it will fail HERE.
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine AS production-stage

# Copy the static build from the build-stage
# VITE builds into 'dist', not 'build'
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy a custom nginx config if you have one, 
# otherwise the default works for basic routing
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
