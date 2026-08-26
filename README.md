# FeriaHub

Plataforma de postulación a ferias y eventos de Chile. Perfil único reutilizable para expositores, y panel para organizadores.

**Stack:** Express 5 (backend) + node:sqlite + React/Vite (frontend). Monorepo.

## 🎯 Qué resuelve

- **Expositor:** crea su perfil UNA vez y postula a todas las ferias con un clic. Sin repetir formularios, WhatsApp, Word o PDFs.
- **Organizador:** publica convocatorias y recibe postulaciones ordenadas en un panel, decide con un clic.
- **Trayectoria:** cada participación confirmada construye historial verificable (Fase 2: certificados QR).

## 🧭 Estado

**MVP funcional en local** con landing scrollable de video-frames (scroll-scrubbing). Pendiente: deploy a producción y fase 2.

## 🚀 Stack y estructura

```
feriahub/
├── server.ts          # Express API + sirve frontend build
├── api/               # rutas backend (auth, perfiles, ferias, postulaciones, participaciones, tracking)
├── app/               # frontend React/Vite
│   └── public/        # frames de la landing (video-scrubbing) + og-cover
├── db/schema.sql      # modelo SQLite
├── Dockerfile         # multi-stage (build frontend + backend)
├── docker-compose.yml # puerto 3013, volumen feriahub_data
└── .github/workflows/deploy.yml
```

## 🔐 Usuarios demo (seed)

| Rol | Email | Password |
|---|---|---|
| Organizador | `org@feriahub.cl` | `demo1234` |
| Expositor (demo) | `expo@feriahub.cl` | `demo1234` |

## 🏃 Local

```bash
# backend (raíz)
npm install && npm run init-db && npm run dev   # :3000
# frontend (app/)
cd app && npm install && npm run dev            # :5190, proxy /api → :3000
```

## 🌍 Deploy

Push a `main` → GitHub Actions → build en runner → SCP al VPS → Docker → NPM.

## 📡 Tracking

La landing envía eventos a `POST /api/tracking` (anónimo): `landing_final`, `landing_rol`, `landing_ver_demo`, `landing_encuesta`, `landing_saltar`.

## 🎨 Landing scrollable

Video de ferias chilenas → frames WebP → el scroll avanza los frames (scroll-scrubbing). Detecta orientación (vertical usa `frames-movil/`). Narrativa por capítulos con reveal palabra por palabra, glassmorphism y momentos full-screen.
