FROM node:20-alpine AS builder
WORKDIR /app
# We will copy package.json later when we generate the React app
COPY . .
# A placeholder for future build commands once Vite is initialized
# RUN npm install && npm run build

FROM nginx:alpine
# Copy custom Nginx configuration for single-page apps
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built static files (placeholder path until build is run)
# COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
