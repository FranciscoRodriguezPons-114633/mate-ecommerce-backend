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

---

Con eso el proyecto queda completamente operativo 🚀
