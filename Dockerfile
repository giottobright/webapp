# Build the Mini App from the build context and serve it with nginx.
#   docker build --build-arg VITE_API_BASE=https://api.example.com -t hayalkiz-webapp .
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_API_BASE=""
ARG VITE_ASSETS_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE VITE_ASSETS_BASE=$VITE_ASSETS_BASE
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-timeweb.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
