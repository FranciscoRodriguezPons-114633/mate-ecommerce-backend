🧉 Cómo levantar y cerrar el proyecto (backend + Mongo)

🚀 LEVANTAR TODO

1. Ir a la carpeta del proyecto:
   cd mate-ecommerce/backend

2. Levantar MongoDB:
   brew services start mongodb-community

3. Levantar el backend:
   npm run dev

👉 Resultado esperado:

* “MongoDB conectado”
* “Servidor corriendo en [http://localhost:3000”](http://localhost:3000”)

---

🧪 PROBAR

Podés usar Postman

Ejemplo:
POST http://localhost:3000/api/products

Body:
{
"name": "Mate imperial",
"price": 15000
}

---

🛑 CERRAR TODO

1. Apagar backend:
   Ctrl + C

2. Apagar Mongo:
   brew services stop mongodb-community

3. Salir de mongosh (si estás adentro):
   exit

---

🔁 RESUMEN RÁPIDO

Levantar:

* cd backend
* brew services start mongodb-community
* npm run dev

Cerrar:

* Ctrl + C
* brew services stop mongodb-community

--
🧉 Resumen del proyecto backend (e-commerce de mates)

📁 ESTRUCTURA

backend/
├── src/
│   ├── app.js              → servidor principal
│   ├── config/
│   │   └── db.js           → conexión a MongoDB
│   ├── models/
│   │   └── Product.js      → esquema de producto (Mongoose)
│   ├── routes/
│   │   └── product.routes.js
│   ├── controllers/
│   │   └── product.controller.js
│   ├── services/
│   │   └── product.service.js
│
├── package.json
├── .gitignore

---

🧠 ARQUITECTURA

* Routes → definen endpoints
* Controllers → manejan request/response
* Services → lógica de negocio + DB
* Models → estructura de datos (Mongo)

---

🗄 BASE DE DATOS

* MongoDB local (puerto 27017)
* Conexión con Mongoose
* DB: mate-ecommerce
* Collection: products

Ejemplo documento:

{
"_id": "...",
"name": "Mate imperial",
"price": 15000,
"__v": 0
}

---

🌐 ENDPOINTS (API REST)

GET /api/products
→ devuelve todos los productos

GET /api/products/:id
→ devuelve un producto por ID

POST /api/products
→ crea producto

Body:
{
"name": "Mate imperial",
"price": 15000
}

PUT /api/products/:id
→ actualiza producto

DELETE /api/products/:id
→ elimina producto

---

⚙️ TECNOLOGÍAS

* Node.js
* Express
* MongoDB
* Mongoose
* Nodemon

---

🔧 FUNCIONAMIENTO

Cliente → Backend (Express) → MongoDB
El backend recibe requests, usa services, guarda o lee en Mongo y responde en JSON.

---

🚀 ESTADO ACTUAL

* Backend funcionando
* CRUD completo
* Persistencia en Mongo
* Proyecto subido a GitHub

---

📌 PRÓXIMOS PASOS

* Agregar stock, categoría, imagen
* Validaciones
* Usuarios y auth
* Redis (cache)
* Frontend en JS

---

Proyecto listo como base de e-commerce real 💥


---

Con eso el proyecto queda completamente operativo 🚀
