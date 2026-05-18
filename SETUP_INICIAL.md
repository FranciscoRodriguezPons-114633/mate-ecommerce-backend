# Setup inicial del proyecto Mate E-Commerce

Guía para levantar el proyecto completo desde cero: backend, frontend, MongoDB, Redis, Cassandra y Neo4j.

## 1. Requisitos previos

Instalar:

- Node.js 20 o superior
- npm
- Docker Desktop
- Git

Verificar versiones:

```bash
node -v
npm -v
docker --version
```

## 2. Clonar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd mate-ecommerce-backend
```

Si ya tenés el proyecto local:

```bash
cd "/Users/franciscorodriguezpons/Documents/New project/mate-ecommerce-backend"
```

## 3. Instalar dependencias

El proyecto usa `npm workspaces`, por eso se instala desde la raíz:

```bash
npm install
```

Esto instala dependencias de:

- `backend/`
- `frontend/`

## 4. Configurar variables de entorno

Crear el archivo `.env` del backend:

```bash
cp backend/.env.example backend/.env
```

Contenido esperado de `backend/.env`:

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

El frontend usa por defecto:

```txt
http://localhost:3000/api
```

Si necesitás definirlo explícitamente, crear `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 5. Levantar servicios con Docker

### 5.1 MongoDB

Si no tenés MongoDB local instalado, levantarlo con Docker:

```bash
docker run -d --name mate-mongo -p 27017:27017 mongo:7
```

Si el contenedor ya existe:

```bash
docker start mate-mongo
```

Verificar:

```bash
docker ps
```

### 5.2 Redis

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

```txt
PONG
```

### 5.3 Cassandra

```bash
docker run -d --name cassandra -p 9042:9042 cassandra:4.1
```

Si el contenedor ya existe:

```bash
docker start cassandra
```

Cassandra tarda bastante en iniciar la primera vez. Ver logs:

```bash
docker logs cassandra --tail 30
```

Esperar hasta ver:

```txt
Startup complete
```

Verificar conexión:

```bash
docker exec -it cassandra cqlsh
```

Para salir de `cqlsh`:

```bash
exit
```

### 5.4 Neo4j

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

Ver logs:

```bash
docker logs neo4j --tail 30
```

Esperar hasta ver:

```txt
Started.
```

Panel web:

```txt
http://localhost:7474
```

Credenciales:

```txt
Usuario: neo4j
Password: password
```

## 6. Cargar datos iniciales

### 6.1 Seed base de MongoDB

Este seed carga productos base en MongoDB.

```bash
cd backend
node src/seed.js
```

Importante: este script borra productos anteriores y vuelve a cargar los productos base.

### 6.2 Seed de productos extra

Este seed agrega productos nuevos y stock.

```bash
npm run seed:extras
```

### 6.3 Seed de Cassandra

Antes de correrlo, Cassandra debe mostrar `Startup complete` en logs.

```bash
npm run seed:cassandra
```

Este seed crea keyspace/tablas e inserta datos de prueba para:

- pedidos por usuario
- pedidos por estado
- items de pedidos
- carritos con TTL
- vistas de productos
- ventas de productos

### 6.4 Seed básico de relaciones Neo4j

Neo4j debe estar levantado y accesible por `bolt://127.0.0.1:7687`.

Para cargar relaciones `COMPLEMENTA`:

```bash
docker exec -i neo4j cypher-shell -u neo4j -p password < backend/src/config/neo4j.seed.cypher
```

Nota: algunas funcionalidades de recomendaciones también tienen fallback a MongoDB si el grafo todavía no tiene datos suficientes.

## 7. Levantar backend y frontend

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto levanta:

- Backend en `http://localhost:3000`
- Frontend en `http://localhost:3001`

También podés levantarlos por separado.

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## 8. URLs principales

| Servicio | URL |
| --- | --- |
| Frontend | `http://localhost:3001` |
| Backend API | `http://localhost:3000/api` |
| Neo4j Browser | `http://localhost:7474` |
| MongoDB | `127.0.0.1:27017` |
| Redis | `127.0.0.1:6379` |
| Cassandra | `127.0.0.1:9042` |

## 9. Verificaciones rápidas

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
docker exec -it cassandra cqlsh
```

Neo4j:

```bash
docker exec -it neo4j cypher-shell -u neo4j -p password "RETURN 1;"
```

## 10. Comandos útiles

Desde la raíz:

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```

Backend:

```bash
cd backend
npm run dev
npm run seed:cassandra
npm run seed:extras
node src/seed.js
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

Docker:

```bash
docker ps
docker start mate-mongo
docker start mate-redis
docker start cassandra
docker start neo4j
docker logs cassandra --tail 30
docker logs neo4j --tail 30
```

## 11. Problemas frecuentes

### Puerto ocupado en frontend 3001

Ver proceso:

```bash
lsof -i :3001
```

Matar proceso:

```bash
kill -9 <PID>
```

Después:

```bash
cd frontend
npm run dev
```

### Puerto ocupado en backend 3000

```bash
lsof -i :3000
kill -9 <PID>
```

### Redis dice `Address already in use`

Significa que Redis ya está corriendo. Verificar:

```bash
redis-cli ping
```

o si usás Docker:

```bash
docker exec -it mate-redis redis-cli ping
```

### Cassandra tira `ECONNREFUSED 127.0.0.1:9042`

Cassandra no está levantado o todavía no abrió el puerto.

```bash
docker start cassandra
docker logs cassandra --tail 30
```

Esperar `Startup complete`.

### Cassandra tira `OperationTimedOutError`

El puerto abrió, pero Cassandra todavía está iniciando internamente. Esperar 60-120 segundos y volver a correr:

```bash
npm run seed:cassandra
```

### Neo4j tira `ECONNREFUSED 127.0.0.1:7687`

Neo4j no está levantado.

```bash
docker start neo4j
docker logs neo4j --tail 30
```

Esperar `Started.`

### Aparece `Modo respaldo`

Significa que Neo4j no respondió o no tiene datos suficientes, entonces el frontend usa datos calculados desde MongoDB para no romper la experiencia.

### `npm error code 130`

Normalmente significa que cortaste el proceso con `Ctrl+C`. No es un error grave.

## 12. Orden recomendado completo

Para una instalación limpia:

```bash
npm install
cp backend/.env.example backend/.env

docker run -d --name mate-mongo -p 27017:27017 mongo:7
docker run -d --name mate-redis -p 6379:6379 redis:8
docker run -d --name cassandra -p 9042:9042 cassandra:4.1
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:5
```

Esperar a que Cassandra y Neo4j terminen de iniciar:

```bash
docker logs cassandra --tail 30
docker logs neo4j --tail 30
```

Cargar datos:

```bash
cd backend
node src/seed.js
npm run seed:extras
npm run seed:cassandra
cd ..
docker exec -i neo4j cypher-shell -u neo4j -p password < backend/src/config/neo4j.seed.cypher
```

Levantar app:

```bash
npm run dev
```

Abrir:

```txt
http://localhost:3001
```
