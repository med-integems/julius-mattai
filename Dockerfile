# syntax=docker/dockerfile:1

# ---- Dependencies ----
FROM node:24-alpine AS deps
WORKDIR /app
# libc6-compat helps native modules (e.g. sharp) run on Alpine
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Build (produces .next/standalone) ----
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ---- Runtime ----
FROM node:24-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

ENV PORT=4004
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/data ./data

USER nextjs
EXPOSE 4004
CMD ["node", "server.js"]
