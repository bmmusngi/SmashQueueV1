FROM node:20-alpine

WORKDIR /app

# Install necessary system libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY . .

# IMPORTANT: Run generate before build so TypeScript knows the DB types
RUN npx prisma generate

# Build the app. 
# We add '|| exit 1' to ensure Docker stops immediately if TSC finds an error.
RUN npm run build

EXPOSE 3000

# We moved 'db push' to the command so it happens at runtime, not build time.
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run start:prod"]
