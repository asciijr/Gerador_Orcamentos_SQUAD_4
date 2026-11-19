# ---------- base ----------
FROM node:24-alpine AS base
WORKDIR /app
# OpenSSL é exigido pelo Prisma no Alpine
RUN apk add --no-cache openssl
# O schema do Prisma entra antes do npm ci porque o postinstall roda "prisma generate"
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma

# ---------- dev (hot reload) ----------
FROM base AS dev
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# ---------- build ----------
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---------- produção ----------
FROM node:24-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# --ignore-scripts: o Prisma Client já foi compilado para dist no estágio build
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
