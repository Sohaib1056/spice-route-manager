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
# Railway routes traffic to the port exposed by the container.
# Our app listens on process.env.PORT (defaults to 5000), so expose 5000.
EXPOSE 5000
CMD ["npm", "start"]
