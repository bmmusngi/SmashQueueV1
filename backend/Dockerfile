FROM node:20-alpine AS builder
WORKDIR /app
# We will copy package.json later when we generate the NestJS app
COPY . .
# A placeholder for future build commands once NestJS is initialized
# RUN npm install && npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
# Placeholder start command
CMD ["echo", "Backend container ready for NestJS initialization..."]
