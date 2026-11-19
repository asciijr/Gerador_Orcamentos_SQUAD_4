# ---------- base ----------
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev (hot reload) ----------
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ---------- build ----------
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# ---------- produção (arquivos estáticos) ----------
FROM nginx:1.29-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
