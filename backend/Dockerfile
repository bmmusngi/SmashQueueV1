FROM node:18-alpine

WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma client and build NestJS
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# When the container starts, run database migrations then start the server
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
