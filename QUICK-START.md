# 🚀 GUÍA RÁPIDA DE STARTUP

## Secuencia de 3 Pasos (3 Terminales)

### 1️⃣ Terminal 1: Redis

```bash
redis-server
```

✅ Responde: `Ready to accept connections on port 6379`

---

### 2️⃣ Terminal 2: Backend

```bash
cd backend
npm run dev
```

✅ Responde:

```
Servidor corriendo en http://localhost:3000
Redis Client Connected ✅
MongoDB conectado ✅
```

---

### 3️⃣ Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

✅ Responde:

```
- Local: http://localhost:3001
```

---

## URLs Finales

| Componente   | URL                   | Puerto |
| ------------ | --------------------- | ------ |
| **Backend**  | http://localhost:3000 | 3000   |
| **Frontend** | http://localhost:3001 | 3001   |
| **Redis**    | localhost             | 6379   |
| **MongoDB**  | localhost             | 27017  |

---

## Verificar que Todo Funciona

```bash
# En Terminal 4 (terminal de pruebas), ejecuta:

# Test 1: Backend funciona
curl http://localhost:3000/
# Responde: "API funcionando"

# Test 2: Productos disponibles
curl http://localhost:3000/api/products
# Responde: JSON con productos

# Test 3: Redis funciona
redis-cli ping
# Responde: PONG
```

---

## Troubleshooting Rápido

| Problema                   | Solución                                                 |
| -------------------------- | -------------------------------------------------------- |
| `Port 6379 already in use` | `kill -9 $(lsof -ti:6379)`                               |
| `Redis connection refused` | Verifica que `redis-server` está corriendo en Terminal 1 |
| `Port 3000 in use`         | `kill -9 $(lsof -ti:3000)`                               |
| `Port 3001 in use`         | `kill -9 $(lsof -ti:3001)`                               |
| Backend no ve Redis        | Espera 2-3 segundos después de iniciar `redis-server`    |

---

## Instalación Inicial (Una sola vez)

```bash
# En la carpeta del proyecto:

# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# Redis (si no está instalado)
brew install redis

# ¡Listo! Ya puedes usar la secuencia de 3 pasos arriba
```

---

## Automatización (Opcional)

Si quieres abrir las 3 terminales automáticamente:

```bash
bash startup.sh
```

---

**Recomendación:**

- Guarda esta guía como favorito
- Los 3 comandos son siempre los mismos
- Siempre inicia Redis primero
- Espera 2-3 segundos entre cada inicio
