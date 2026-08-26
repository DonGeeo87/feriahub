# ---- Stage 1: build frontend (app/) ----
FROM node:20-alpine AS frontend-builder
WORKDIR /build
# dependencias del frontend
COPY app/package*.json ./
RUN npm ci
# copiar código fuente del frontend + build
COPY app/ ./
RUN npm run build

# ---- Stage 2: backend + runtime ----
FROM node:24-alpine AS runner
WORKDIR /app

# dependencias del backend
COPY package*.json ./
RUN npm ci --omit=dev

# código del backend + schema
COPY server.ts ./
COPY tsconfig.api.json ./
COPY api/ ./api/
COPY db/ ./db/

# frontend ya construido
COPY --from=frontend-builder /app/dist ./app/dist

EXPOSE 3000
# init-db al arrancar (idempotente: crea schema + seeds si faltan)
CMD ["sh", "-c", "npx tsx api/_lib/init-db.ts && npx tsx server.ts"]
