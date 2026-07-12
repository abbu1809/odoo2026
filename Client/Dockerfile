# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app

# package-lock.json* (wildcard) so the build still works if no lockfile is
# committed yet — npm install generates one inside the image in that case.
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Vite bakes VITE_* vars into the bundle at build time — override with
# `docker compose build --build-arg VITE_API_BASE_URL=...` if the backend
# isn't reachable at the default URL from the browser.
ARG VITE_API_BASE_URL=http://localhost:4000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- runtime: static files served by nginx ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
