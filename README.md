# Mate E-Commerce Fullstack

E-commerce universitario de productos materos desarrollado como proyecto fullstack para Bases de Datos II - UTN FRC.

El sistema combina una aplicacion web con backend REST y varias bases de datos especializadas:

- **MongoDB** como fuente principal de verdad.
- **Redis** como cache para optimizar consultas frecuentes.
- **Cassandra** para pedidos desnormalizados, carrito persistido, counters y analytics.
- **Neo4j** para recomendaciones, relaciones entre productos, recorrido del usuario y mapas visuales.

---

## Descripcion General

La aplicacion permite navegar productos de mate, administrar catalogo, comprar, consultar pedidos y explorar recomendaciones personalizadas.

El objetivo tecnico del proyecto es mostrar como distintas bases NoSQL pueden convivir dentro de una misma arquitectura, usando cada una donde aporta mas valor:

| Tecnologia | Uso principal en el proyecto |
| --- | --- |
| MongoDB | usuarios, productos, pedidos, stock, autenticacion y datos principales |
| Redis | cache de productos y respuestas frecuentes |
| Cassandra | pedidos por usuario/estado, carrito con TTL, productos vistos y vendidos |
| Neo4j | recomendaciones, compras juntas, categorias exploradas, kit matero y mapas relacionales |
| Next.js | frontend del cliente y panel de administrador |
| Express | API REST del backend |

---

## Funcionalidades Principales

### Cliente

- catalogo de productos;
- detalle de producto;
- carrito;
- pedidos del usuario;
- productos mas vistos;
- productos mas vendidos;
- recomendaciones personalizadas;
- armador de kit matero;
- recorrido del matero;
- mapas visuales de favoritos, compras juntas, beneficios y categorias.

### Administrador

- gestion de productos;
- stock por producto;
- carga de descuentos;
- visualizacion de productos con precio original, precio final y porcentaje aplicado.

### Bases de Datos II

- Cassandra con tablas desnormalizadas;
- TTL para carrito;
- counters para analytics;
- batch para escritura de pedidos;
- Neo4j con nodos, relaciones y recorridos;
- consultas Cypher para recomendaciones y patrones de compra;
- visualizacion en frontend de datos derivados del grafo.

---

## Arquitectura

```text
Frontend Next.js
       |
       v
Backend Express
       |
       |-- MongoDB: fuente de verdad
       |-- Redis: cache
       |-- Cassandra: analytics, pedidos y carrito
       |-- Neo4j: recomendaciones y relaciones
```

El backend esta preparado para continuar funcionando aunque Cassandra o Neo4j no esten disponibles. En esos casos usa respuestas de respaldo basadas en MongoDB cuando corresponde.

---

## Estructura del Proyecto

```text
mate-ecommerce-backend/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB, Redis, Cassandra y Neo4j
│   │   ├── controllers/     # Controladores HTTP
│   │   ├── middlewares/     # Auth, validaciones y errores
│   │   ├── models/          # Modelos Mongoose
│   │   ├── routes/          # Rutas Express
│   │   ├── services/        # Logica de negocio e integraciones
│   │   └── utils/           # Validadores y helpers
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/                 # Rutas Next.js
│   ├── components/          # Componentes visuales
│   ├── context/             # Contextos React
│   ├── hooks/
│   ├── lib/                 # Cliente API y helpers
│   └── public/              # Imagenes de productos
├── IMPLEMENTACIONES_BDII.md # Detalle declarativo Cassandra + Neo4j
├── SETUP_INICIAL.md         # Guia paso a paso para levantar el proyecto
├── package.json             # Monorepo npm workspaces
└── README.md
```

---

## Tecnologias

### Backend

- Node.js
- Express 5
- CommonJS
- MongoDB
- Mongoose
- Redis
- Cassandra Driver
- Neo4j Driver
- Joi
- JWT
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
- Lucide React
- Recharts
- React Hook Form
- Zod

### Infraestructura Local

- Docker Desktop
- MongoDB
- Redis
- Cassandra 4.1
- Neo4j 5

---

## Requisitos Previos

Para levantar el proyecto desde cero se necesita:

- Node.js 20 o superior;
- npm;
- Docker Desktop;
- Git.

Verificar:

```bash
node -v
npm -v
docker --version
```

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/FranciscoRodriguezPons-114633/mate-ecommerce-backend.git
cd mate-ecommerce-backend
```

### 2. Instalar dependencias

El proyecto usa `npm workspaces`, por lo tanto se instala desde la raiz:

```bash
npm install
```

Esto instala dependencias de:

- `backend/`
- `frontend/`

### 3. Crear archivo de entorno

```bash
cp backend/.env.example backend/.env
```

Contenido esperado:

```env
# MongoDB Configuration
MONGO_URI=mongodb://127.0.0.1:27017/mate-ecommerce

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Cassandra Configuration
CASSANDRA_HOST=127.0.0.1
CASSANDRA_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=mate_ecommerce

# Neo4j Configuration
NEO4J_URI=bolt://127.0.0.1:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

Opcionalmente, para el frontend:

```bash
cat > frontend/.env.local <<'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
```

---

## Levantar Bases de Datos con Docker

### MongoDB

```bash
docker run -d --name mate-mongo -p 27017:27017 mongo:7
```

Si el contenedor ya existe:

```bash
docker start mate-mongo
```

### Redis

```bash
docker run -d --name mate-redis -p 6379:6379 redis:8
```

Si el contenedor ya existe:

```bash
docker start mate-redis
```

Verificar:

```bash
docker exec -it mate-redis redis-cli ping
```

Debe responder:

```text
PONG
```

### Cassandra

```bash
docker run -d --name cassandra -p 9042:9042 cassandra:4.1
```

Si el contenedor ya existe:

```bash
docker start cassandra
```

Cassandra puede tardar entre 30 y 90 segundos en iniciar. Verificar logs:

```bash
docker logs cassandra --tail 30
```

Esperar hasta ver:

```text
Startup complete
```

### Neo4j

```bash
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5
```

Si el contenedor ya existe:

```bash
docker start neo4j
```

Verificar logs:

```bash
docker logs neo4j --tail 30
```

Esperar hasta ver:

```text
Started.
```

Neo4j Browser queda disponible en:

```text
http://localhost:7474
```

Credenciales locales:

```text
usuario: neo4j
password: password
```

---

## Seeds y Datos Iniciales

### Cassandra

Crea el keyspace, las tablas y datos de prueba para analytics:

```bash
npm run seed:cassandra --workspace=backend
```

Incluye:

- pedidos por usuario;
- pedidos por estado;
- items de pedidos;
- counters de productos vistos;
- counters de productos vendidos.

### Productos Extra

Inserta productos adicionales con imagen, descripcion, stock y estilo consistente:

```bash
npm run seed:extras --workspace=backend
```

### Neo4j

El proyecto incluye `backend/src/config/neo4j.seed.cypher` como referencia de seed para relaciones del grafo, especialmente `COMPLEMENTA`.

Neo4j tambien se alimenta desde los flujos del backend para recomendaciones y mapas visuales.

---

## Ejecutar el Proyecto

### Frontend y backend juntos

```bash
npm run dev
```

### Backend solo

```bash
npm run dev --workspace=backend
```

Backend:

```text
http://localhost:3000
```

### Frontend solo

```bash
npm run dev --workspace=frontend
```

Frontend:

```text
http://localhost:3001
```

Si el puerto `3001` esta ocupado, buscar el proceso:

```bash
lsof -i :3001
```

Y finalizarlo usando el PID real:

```bash
kill -9 <PID>
```

---

## URLs Principales

| Vista | URL |
| --- | --- |
| Inicio | `http://localhost:3001/` |
| Productos | `http://localhost:3001/productos` |
| Recomendaciones | `http://localhost:3001/recomendaciones` |
| Mis pedidos | `http://localhost:3001/mis-pedidos` |
| Recorrido del matero | `http://localhost:3001/mi-recorrido` |
| Admin | `http://localhost:3001/admin` |
| API backend | `http://localhost:3000/api` |
| Neo4j Browser | `http://localhost:7474` |

---

## Endpoints Destacados

### Productos y Analytics

```text
GET  /api/products
GET  /api/products/:id
POST /api/products/:id/view
GET  /api/products/analytics/top
GET  /api/products/analytics/top-sold
```

### Pedidos y Carrito

```text
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders/cart
POST   /api/orders/cart
DELETE /api/orders/cart
```

### Recomendaciones y Neo4j

```text
GET /api/recommendations
GET /api/customer-journey
GET /api/kit-builder
```

---

## Comandos Utiles

| Comando | Descripcion |
| --- | --- |
| `npm install` | Instala dependencias del monorepo |
| `npm run dev` | Inicia frontend y backend juntos |
| `npm run dev --workspace=backend` | Inicia solo el backend |
| `npm run dev --workspace=frontend` | Inicia solo el frontend |
| `npm run build` | Construye el frontend |
| `npm start` | Inicia en modo produccion |
| `npm test` | Ejecuta tests del backend |
| `npm run lint` | Ejecuta lint del frontend |
| `npm run seed:cassandra --workspace=backend` | Inicializa Cassandra |
| `npm run seed:extras --workspace=backend` | Inserta productos extra |

---

## Verificacion Rapida

Backend:

```bash
curl http://localhost:3000/
```

Productos:

```bash
curl http://localhost:3000/api/products
```

Redis:

```bash
docker exec -it mate-redis redis-cli ping
```

Cassandra:

```bash
docker logs cassandra --tail 30
```

Neo4j:

```bash
docker logs neo4j --tail 30
```

Estado Git:

```bash
git status
```

---

## Documentacion del Proyecto

Para una explicacion completa de la implementacion de Cassandra y Neo4j:

- [`IMPLEMENTACIONES_BDII.md`](./IMPLEMENTACIONES_BDII.md)

Para una guia paso a paso de instalacion desde cero:

- [`SETUP_INICIAL.md`](./SETUP_INICIAL.md)

---

## Notas de Desarrollo

- MongoDB sigue siendo la base principal del sistema.
- Cassandra y Neo4j son complementarias y tienen fallback para no romper la aplicacion si no estan disponibles.
- El backend usa CommonJS.
- El frontend corre en el puerto `3001`.
- El backend corre en el puerto `3000`.
- Cassandra usa el puerto `9042`.
- Neo4j usa `7474` para navegador y `7687` para Bolt.

---

## Estado Final

El proyecto queda preparado para demostrar:

- una arquitectura fullstack funcional;
- integracion de multiples bases NoSQL;
- uso real de Cassandra para consultas orientadas a rendimiento;
- uso real de Neo4j para recorridos y recomendaciones;
- frontend con visualizaciones de datos;
- panel administrador con descuentos y stock;
- documentacion tecnica para explicar la implementacion en una presentacion o defensa.
