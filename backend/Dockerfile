FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies including devDependencies for build
RUN npm ci --include=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Railway provides PORT, but we'll expose 8080 as a default
EXPOSE 8080
CMD ["npm", "start"]
