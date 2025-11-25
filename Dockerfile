FROM node:20-alpine AS builder

WORKDIR /opt/build

# Установка git и увеличение таймаутов
RUN apk add --no-cache git curl && \
    git config --global http.postBuffer 524288000 && \
    git config --global http.lowSpeedLimit 0 && \
    git config --global http.lowSpeedTime 0 && \
    git config --global http.timeout 300

# Клонирование с retry логикой
RUN for i in 1 2 3; do \
        git clone --depth 1 --branch master https://github.com/giottobright/webapp.git /opt/build && \
        break || sleep 5; \
    done || \
    (echo "Failed to clone after 3 attempts" && exit 1)

# Удаление origin для безопасности
RUN git remote rm origin || true

# Установка зависимостей
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Сборка приложения
RUN npm run build

# Production stage
FROM nginx:alpine

# Копирование собранных файлов
COPY --from=builder /opt/build/dist /usr/share/nginx/html

# Копирование конфигурации nginx
COPY nginx-timeweb.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]


