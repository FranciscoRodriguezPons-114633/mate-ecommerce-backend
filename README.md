# 🧉 Mate E-Commerce Backend

API REST para la gestión de productos en una plataforma de comercio electrónico.

---

## 📌 Descripción

**Mate E-Commerce Backend** es una API REST desarrollada en Node.js que permite gestionar productos mediante operaciones CRUD (Crear, Leer, Actualizar y Eliminar).

Está diseñada con una arquitectura modular y escalable, separando responsabilidades en capas (controllers, services, models, etc.), facilitando su mantenimiento y crecimiento.

---

## 🚀 Tecnologías Utilizadas

* **Node.js** – Entorno de ejecución
* **Express.js** – Framework para servidor HTTP
* **MongoDB** – Base de datos NoSQL
* **Mongoose** – ODM para MongoDB
* **Joi** – Validación de datos
* **Jest** – Testing
* **Supertest** – Testing de endpoints
* **Nodemon** – Desarrollo
* **Docker (opcional)** – Contenerización

---

## 📂 Estructura del Proyecto

```
src/
├── config/        # Configuración (DB, variables)
├── controllers/   # Manejo de requests/responses
├── models/        # Esquemas de datos (Mongoose)
├── routes/        # Definición de endpoints
├── services/      # Lógica de negocio
├── middlewares/   # Validaciones y manejo de errores
└── utils/         # Funciones auxiliares
```

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mate-ecommerce-backend.git
cd mate-ecommerce-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env`:

```
MONGO_URI=mongodb://localhost:27017/mate-ecommerce
PORT=3000
```

---

## ▶️ Ejecución del Proyecto

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

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

* `name`: String
* `price`: Number
* `quantity`: Number
* `description`: String
* `category`: String
* `image`: String
* `createdAt` / `updatedAt`: Automáticos

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

* Separación de responsabilidades (arquitectura en capas)
* Validación de datos con Joi
* Manejo de errores centralizado
* Uso de variables de entorno
* Código modular y escalable

---

## ⚠️ Mejoras Futuras

* 🔐 Implementar autenticación con JWT
* 📊 Agregar logging (Winston)
* ⚡ Implementar caché con Redis
* 🚫 Rate limiting
* 📈 Indexación en MongoDB
* ✅ Mejorar cobertura de tests

---

## 👨‍💻 Autor

**Francisco Rodriguez Pons**

---

## 📖 Conclusión

Este proyecto representa una base sólida para el desarrollo de aplicaciones e-commerce, aplicando buenas prácticas de backend, organización de código y uso de tecnologías modernas.

Nivel del proyecto: **Intermedio**

---

## 📌 Setup rápido (TL;DR)

```bash
git clone ...
npm install
cp .env.example .env
npm run dev
```

---
