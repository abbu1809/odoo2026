# ---- build: install deps, generate the Prisma client, compile TypeScript ----
FROM node:24-alpine AS build
WORKDIR /app

# Prisma's engines need these on Alpine/musl.
RUN apk add --no-cache openssl libc6-compat

# package-lock.json* (wildcard) so the build still works if no lockfile is
# committed yet — npm install generates one inside the image in that case.
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Needs a DATABASE_URL to *load*, not to connect — any placeholder works at build time.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate
RUN npm run build

# ---- runtime ----
FROM node:24-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# Keep devDependencies (prisma CLI) in node_modules — the entrypoint needs
# `prisma` at container start to run `migrate deploy`.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/server.js"]
