# ---- 1. Builder Stage: Build the TypeScript source ----
FROM node:18-alpine AS builder
WORKDIR /app

# Install OS dependencies needed for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy dependency files and install ALL dependencies (incl. dev)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma Client - this is crucial for the build step
RUN npx prisma generate

# Build the application
RUN npm run build

# ---- 2. Production Stage: Create the final, lean image ----
FROM node:18-alpine AS production
WORKDIR /app

# Install OS dependencies needed for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the built application and necessary Prisma files from the 'builder' stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

# Run migrations and start the production server
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
