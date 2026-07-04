# Despliegue: Render (backend) + Vercel (frontend)

## Arquitectura

```
Vercel (React)  →  Render (Spring Boot)  →  PostgreSQL (Render)
```

---

## 1. Subir el codigo a GitHub

El repositorio debe estar en GitHub (o GitLab) para conectar Render y Vercel.

---

## 2. Backend en Render

### Opcion A: Blueprint automatico (`render.yaml`)

1. En [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Conecta el repositorio
3. Render creara:
   - Base de datos PostgreSQL `citas-db`
   - Web Service `sistema-citas-api` (via **Docker**, porque Render no tiene runtime Java nativo)
4. Edita la variable **`APP_CORS_ALLOWED_ORIGINS`** (obligatoria):
   - Valor inicial: `http://localhost:5173`
   - Despues del paso 3 (Vercel), actualizala con la URL real, por ejemplo:
     ```
     https://tu-app.vercel.app
     ```

### Opcion B: Manual

**Base de datos**
1. **New** → **PostgreSQL** (plan Free)
2. Nombre: `citas-db`

**Web Service**
1. **New** → **Web Service**
2. Conecta el repo
3. Configuracion:

| Campo | Valor |
|-------|-------|
| Language | **Docker** |
| Dockerfile Path | `backend/Dockerfile` |
| Docker Context | `backend` |
| Health Check Path | `/api/especialidades` |

> No uses `runtime: java` en `render.yaml` — Render no lo soporta. El proyecto usa Docker.

4. Variables de entorno:

| Variable | Valor |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `APP_JWT_SECRET` | Genera un secreto largo (min. 32 caracteres) |
| `APP_CORS_ALLOWED_ORIGINS` | URL de Vercel (ver paso 3) |
| `APP_SEED_ENABLED` | `true` (carga datos demo la primera vez) |
| `DATABASE_URL` | Vincula desde la BD → *Add from database* → `connectionString` |

5. Deploy. La URL del API sera algo como:
   ```
   https://sistema-citas-api.onrender.com
   ```

### Verificar backend

```bash
curl https://TU-API.onrender.com/api/especialidades
```

Deberias ver las especialidades del seed (Cardiologia, Pediatria, etc.).

---

## 3. Frontend en Vercel

1. En [Vercel Dashboard](https://vercel.com) → **Add New Project**
2. Importa el repositorio
3. Configuracion:

| Campo | Valor |
|-------|-------|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Variable de entorno:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://TU-API.onrender.com/api` |

5. Deploy. Vercel te dara una URL como `https://tu-app.vercel.app`

---

## 4. Conectar CORS (importante)

Vuelve a **Render** → tu Web Service → **Environment** y actualiza:

```
APP_CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app
```

Si tienes preview deployments en Vercel, puedes listar varias URLs separadas por coma:

```
https://tu-app.vercel.app,https://tu-app-git-main.vercel.app
```

Guarda y espera el redeploy del backend.

---

## 5. Credenciales de prueba

Tras el primer deploy con `APP_SEED_ENABLED=true`:

| Rol | Email | Password |
|-----|-------|----------|
| Paciente | `paciente@clinica.com` | `demo123` |
| Medico | `medico1@clinica.com` | `demo123` |
| Recepcionista | `recepcion@clinica.com` | `demo123` |
| Admin | `admin@clinica.com` | `demo123` |

Para desactivar el seed en produccion: `APP_SEED_ENABLED=false`

---

## 6. Desarrollo local (sin cambios)

```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend (otra terminal)
cd frontend && npm run dev
```

El frontend local sigue usando el proxy `/api` → `localhost:8080` sin necesidad de `VITE_API_URL`.

---

## Notas

- **Plan free de Render**: el servicio se suspende tras inactividad; el primer request puede tardar ~30–60 s.
- **PostgreSQL free**: expira a los 90 dias en Render; renueva o migra antes.
- **JWT**: nunca uses el secreto de `application.properties` en produccion; usa `APP_JWT_SECRET`.
- **HTTPS**: ambas plataformas lo proveen automaticamente.
