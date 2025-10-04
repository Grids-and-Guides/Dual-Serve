# Stage 1: Builder
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install && npm audit fix --force || true

COPY . .

# Build the production bundle
RUN npm run express-build

# Stage 2: Production
FROM node:20-slim AS production

WORKDIR /usr/src/app
RUN apt-get update && apt-get upgrade -y && apt-get clean
# Copy only the necessary files from builder
COPY package*.json ./
RUN npm install --omit=dev && npm audit fix --force || true
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json

EXPOSE 8000

CMD ["npm", "run", "start", "--", "--stage", "production"]