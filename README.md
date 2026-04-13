# 🧉 Mate E-Commerce Backend

Plataforma completa de comercio electrónico para la venta de mates. Backend y frontend integrados con arquitectura de monorepo usando Next.js (frontend) y Node.js/Express (backend).

---

## 📌 Descripción

**Mate E-Commerce Backend** es una aplicación completa que incluye:

- **Frontend**: Interfaz de usuario desarrollada en Next.js con TypeScript
- **Backend**: API REST en Node.js para gestión de productos, usuarios, autenticación y pedidos

Arquitectura modular y escalable, separando responsabilidades en capas.

---

## 🚀 Tecnologías Utilizadas

### Backend

- **Node.js** – Entorno de ejecución
- **Express.js** – Framework para servidor HTTP
- **MongoDB** – Base de datos NoSQL
- **Mongoose** – ODM para MongoDB
- **Joi** – Validación de datos
- **JWT (jsonwebtoken)** – Autenticación y autorización
- **bcryptjs** – Encriptación de contraseñas
- **Jest** – Testing
- **Supertest** – Testing de endpoints
- **Nodemon** – Desarrollo
- **Concurrently** – Ejecutar múltiples procesos simultáneamente

### Frontend

- **Next.js** – Framework React
- **TypeScript** – Tipado estático
- **Tailwind CSS** – Estilos
- **Radix UI** – Componentes UI
- **React Hook Form** – Manejo de formularios
- **Zod** – Validación de esquemas

---

## 📂 Estructura del Proyecto

```
mate-ecommerce-backend/
├── backend/            # 🟢 API REST Node.js/Express
│   ├── src/           # Código fuente del backend
│   │   ├── config/    # Configuración (DB, variables)
│   │   ├── controllers/ # Manejo de requests/responses
│   │   ├── models/    # Esquemas de datos (Mongoose)
│   │   ├── routes/    # Definición de endpoints
│   │   ├── services/  # Lógica de negocio
│   │   ├── middlewares/ # Validaciones y manejo de errores
│   │   └── utils/     # Funciones auxiliares
│   ├── tests/         # Tests del backend
│   └── package.json   # Dependencias del backend
├── frontend/           # 🟡 Aplicación Next.js
│   ├── app/           # Páginas y layouts
│   ├── components/    # Componentes reutilizables
│   ├── context/       # Contextos React
│   ├── hooks/         # Hooks personalizados
│   ├── lib/           # Utilidades
│   ├── public/        # Archivos estáticos
│   └── styles/        # Estilos CSS
├── .env               # Variables de entorno (compartidas)
├── .gitignore         # Archivos ignorados por Git
├── package.json       # Configuración del monorepo
└── README.md          # Esta documentación
```

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/FranciscoRodriguezPons-114633/mate-ecommerce-backend.git
cd mate-ecommerce-backend
```

### 2. Instalar todas las dependencias

```bash
npm install
```

Esto instalará dependencias para el monorepo completo (backend + frontend).

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env  # Si tienes un .env.example
```

Contenido mínimo del `.env`:

```
MONGO_URI=mongodb://localhost:27017/mate-ecommerce
PORT=3000
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
```

### 4. Iniciar MongoDB

```bash
brew services start mongodb-community  # macOS con Homebrew
# o
mongod  # instalación manual
```

---

## ▶️ Ejecución del Proyecto

### Modo desarrollo (recomendado)

Ejecuta backend y frontend simultáneamente:

```bash
npm run dev
```

### Ejecutar servicios individualmente

#### Backend únicamente

```bash
npm run dev --workspace=backend
```

#### Frontend únicamente

```bash
npm run dev --workspace=frontend
```

### Modo producción

```bash
npm run build  # Construye el frontend
npm start      # Inicia backend y frontend built
```

### Ejecutar tests

```bash
npm test  # Tests del backend
```

---

## 🌐 Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api/

---

## 🔧 Scripts Disponibles

| Comando                            | Descripción                               |
| ---------------------------------- | ----------------------------------------- |
| `npm run dev`                      | Desarrollo fullstack (backend + frontend) |
| `npm run build`                    | Construir frontend para producción        |
| `npm start`                        | Producción (backend + frontend built)     |
| `npm test`                         | Ejecutar tests del backend                |
| `npm run install:all`              | Instalar todas las dependencias           |
| `npm run dev --workspace=backend`  | Solo backend en desarrollo                |
| `npm run dev --workspace=frontend` | Solo frontend en desarrollo               |
| `npm run lint`                     | Lint del frontend                         |

---

## 📋 Próximos Pasos

- [x] Configurar conexión frontend-backend
- [x] Implementar autenticación con JWT
- [ ] Agregar gestión completa de pedidos
- [ ] Implementar pasarela de pagos
- [ ] Desplegar a producción
- [ ] Agregar logging (Winston)
- [ ] Implementar caché con Redis

---

## 🔄 Flujo de la Aplicación

```
Request HTTP
   ↓
Middleware
   ↓
Routes
   ↓
Controller
   ↓
Service
   ↓
Database (MongoDB)
   ↓
Response
```

---

## 🔗 API Endpoints

### 📦 Productos

| Método | Endpoint          | Descripción                 |
| ------ | ----------------- | --------------------------- |
| GET    | /api/products     | Obtener todos los productos |
| GET    | /api/products/:id | Obtener producto por ID     |
| POST   | /api/products     | Crear producto              |
| PUT    | /api/products/:id | Actualizar producto         |
| DELETE | /api/products/:id | Eliminar producto           |

### 📥 Ejemplo de Request (POST)

```json
{
  "name": "Mate",
  "price": 10,
  "quantity": 5
}
```

### 📤 Ejemplo de Response

```json
{
  "_id": "123abc",
  "name": "Mate",
  "price": 10,
  "quantity": 5
}
```

---

## 🗄️ Modelo de Datos

### Product

- `name`: String
- `price`: Number
- `quantity`: Number
- `description`: String
- `category`: String
- `image`: String
- `createdAt` / `updatedAt`: Automáticos

---

## 🧪 Testing

Ejecutar tests:

```bash
npm test
```

---

## 🐳 Uso con Docker (Opcional)

```yaml
version: "3"
services:
  mongo:
    image: mongo
    ports:
      - "27017:27017"
```

Ejecutar:

```bash
docker-compose up
```

---

## 🧠 Buenas Prácticas Implementadas

- Separación de responsabilidades (arquitectura en capas)
- Validación de datos con Joi
- Manejo de errores centralizado
- Uso de variables de entorno
- Código modular y escalable
- Autenticación con JWT
- Encriptación de contraseñas con bcryptjs

---

## ⚠️ Mejoras Futuras

- 📊 Agregar logging avanzado (Winston)
- ⚡ Implementar caché con Redis
- 🚫 Rate limiting
- 📈 Indexación optimizada en MongoDB
- ✅ Mejorar cobertura de tests
- 🔄 Implementar refresh tokens
- 📧 Sistema de notificaciones por email

---

## 👨‍💻 Autor

**Francisco Rodriguez Pons**

---

## 📖 Conclusión

Este proyecto representa una base sólida para el desarrollo de aplicaciones e-commerce, aplicando buenas prácticas de backend, organización de código, autenticación segura y uso de tecnologías modernas.

Nivel del proyecto: **Intermedio a Avanzado**

---

## 📌 Setup rápido (TL;DR)

```bash
git clone https://github.com/FranciscoRodriguezPons-114633/mate-ecommerce-backend.git
npm install
cp .env.example .env
npm run dev
```

---