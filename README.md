# 🧉 Mate E-Commerce Fullstack

Proyecto universitario de una plataforma de comercio electrónico para la venta de mates, con frontend y backend integrados en un monorepo.

El proyecto está compuesto por:
- **Frontend**: aplicación React + Next.js
- **Backend**: API REST con Node.js, Express, MongoDB y Redis
- **Cache**: Redis para cache-aside de productos

---

## 🚀 Descripción general

Este repositorio contiene una aplicación completa de e-commerce que permite:
- gestionar productos
- gestionar usuarios y autenticación JWT
- crear y consultar pedidos
- consumir una API desde un frontend moderno
- usar caching con Redis para optimizar consultas de productos

La arquitectura está separada en dos paquetes:
- `frontend/` para la interfaz de usuario
- `backend/` para la API y la lógica del servidor

---

## 🧱 Tecnologías principales

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- Joi
- jsonwebtoken (JWT)
- bcryptjs
- Jest
- Supertest
- Nodemon

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- React Hook Form
- Zod
- Recharts
- Lucide React

### Monorepo
- npm workspaces
- concurrently

---

## 📦 Requisitos

Antes de ejecutar el proyecto, necesitas:
- Node.js 18+ instalado
- npm instalado
- MongoDB disponible local o en Atlas
- Redis instalado localmente
- Git

> No es necesario Docker para este proyecto. El desarrollo se hace con servicios locales.

---

## 📁 Estructura del proyecto

```
mate-ecommerce-backend/
├── backend/            # API REST Node.js / Express
│   ├── src/
│   │   ├── config/       # Configuración de DB y Redis
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── middlewares/  # Validaciones y manejo de errores
│   │   ├── models/       # Esquemas de datos MongoDB
│   │   ├── routes/       # Definición de endpoints
│   │   ├── services/     # Lógica de negocio
│   │   └── utils/        # Funciones auxiliares
│   ├── package.json      # Dependencias backend
│   └── .env.example      # Variables de entorno backend
├── frontend/           # Aplicación Next.js
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── styles/
├── package.json         # Configuración monorepo
├── .gitignore           # Archivos ignorados
└── README.md            # Documentación principal
```

---

## ⚙️ Instalación inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/FranciscoRodriguezPons-114633/mate-ecommerce-backend.git
cd mate-ecommerce-backend
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará las dependencias del monorepo y de los workspaces `backend` y `frontend`.

### 3. Configurar archivos de entorno

Copia el ejemplo de entorno del backend:

```bash
cp backend/.env.example backend/.env
```

Luego abre `backend/.env` y verifica los valores:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mate-ecommerce
PORT=3000
JWT_SECRET=tu_clave_secreta_aqui
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

> Si usas MongoDB Atlas, reemplaza `MONGO_URI` por tu conexión de Atlas.

---

## 🚀 Ejecutar el proyecto

### Pasos de arranque

1. Iniciar Redis en una terminal:

```bash
redis-server
```

2. Iniciar MongoDB local (si usas instalación local):

```bash
brew services start mongodb-community
```

3. Iniciar frontend y backend juntos:

```bash
npm run dev
```

### Alternativa: iniciar servicios por separado

- Backend:

```bash
npm run dev --workspace=backend
```

- Frontend:

```bash
npm run dev --workspace=frontend
```

---

## 🌐 Puertos y URLs

| Servicio    | URL                            | Puerto |
| ----------- | ------------------------------ | ------ |
| Frontend    | http://localhost:3001          | 3001   |
| Backend API | http://localhost:3000/api       | 3000   |
| Redis       | localhost                      | 6379   |
| MongoDB     | localhost                      | 27017  |

---

## 🔧 Comandos útiles

| Comando | Descripción |
| --- | --- |
| `npm install` | Instala dependencias del monorepo |
| `npm run dev` | Inicia frontend y backend en modo desarrollo |
| `npm run build` | Construye el frontend para producción |
| `npm start` | Inicia la app en modo producción |
| `npm test` | Ejecuta tests del backend |
| `npm run lint` | Ejecuta lint en el frontend |
| `npm run dev --workspace=backend` | Inicia solo el backend |
| `npm run dev --workspace=frontend` | Inicia solo el frontend |

---

## ✅ Verificación rápida

```bash
# Backend funcionando
curl http://localhost:3000/
# Debe responder: API funcionando

# Listar productos
curl http://localhost:3000/api/products

# Verificar Redis
redis-cli ping
# Debe responder: PONG
```

---

## 🛠️ Notas importantes

- Redis debe iniciarse antes de ejecutar el backend si quieres usar la cache.
- No necesitas Docker para este proyecto.
- Si `npm run dev` falla por `concurrently`, ejecuta `npm install` en la raíz otra vez.
- Si usas MongoDB Atlas, actualiza `backend/.env` con la URI correcta.

---

## 🧪 Pruebas y desarrollo

### Ejecutar tests del backend

```bash
npm test
```

### Lint del frontend

```bash
npm run lint
```

---

## 📌 Buenas prácticas

- Mantén `backend/.env` fuera del repositorio.
- Usa `backend/.env.example` como referencia.
- Inicia Redis y MongoDB antes del backend.
- Ejecuta `npm install` una sola vez después de clonar.

---

## 📂 Archivos README eliminados

Los README secundarios (`README-REDIS.md`, `QUICK-START.md`, `SETUP-INITIAL.md`, `REDIS-STATUS.md`) han sido eliminados para centralizar toda la documentación en este archivo.
