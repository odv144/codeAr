# SumarImpacto - Backend (CodeAr)

Proyecto desarrollado para la materia Desarrollo de Sistemas Web Backend (Tecnicatura Superior en Desarrollo de Software - IFTS 29).

## Sobre la Organización

 **SumarImpacto** es una iniciativa tecnológica concebida para actuar como nexo estratégico entre organizaciones de la sociedad civil, donantes (particulares o corporativos) y proyectos comunitarios de alto impacto social. La plataforma nace para dar respuesta a una problemática recurrente en el tercer sector: la falta de transparencia, trazabilidad y automatización en la gestión de fondos destinados a causas benéficas.


## Integrantes y Responsabilidades (Empresa CodeAr)

- **Omar Virili:** Creación/configuración de la base MongoDB Atlas, conexión mediante Mongoose y desarrollo del CRUD del módulo **Proyectos**. Integración conjunta del cálculo de **saldos**, el **historial de movimientos**, el **formato de moneda** y los **scripts de verificación** de negocio.
- **Jairo N. Calla Girón:** Módulo de **Donantes** (CRUD y persistencia en MongoDB Atlas).
- **Mariana Borda:** Módulo de **Organizaciones** (CRUD y persistencia en MongoDB Atlas) y documentación.
- **Analía Fernández:** Módulo de **Donaciones** (CRUD y persistencia en MongoDB Atlas).
- **Cynthia Sotelo:** Módulo de **Gastos** (CRUD y persistencia en MongoDB Atlas).
- **Cristian Suárez:** Diseño, maquetación e integración del motor de plantillas **Pug** (vistas web, rutas dinámicas y componentes de navegación) e implementación de la autenticación basada en sesiones. Integración conjunta con Omar Virili del cálculo de **saldos**, el **historial de movimientos**, el **formato de moneda** y los **scripts de verificación** de negocio.


## Características Principales

- **Gestión de Entidades:** CRUD completo para Organizaciones, Proyectos, Donantes, Donaciones y Gastos.
- **Validaciones Integradas:** Middlewares personalizados para validar IDs, cuerpos de peticiones (`body`) y relaciones entre entidades (ej. validar existencia de Organización).
- **Manejo Centralizado de Errores:** Middleware global `errorHandler` para captura y respuesta uniforme ante fallos.
- **Registro de Peticiones:** Middleware `requestLogger` para auditoría y log de peticiones HTTP.
- **Base de Datos Escalable:** Persistencia en MongoDB Atlas administrada a través de esquemas de Mongoose.
- **Autenticación con Sesiones:** Login/logout con cookie de sesión `sumarimpacto.sid` (HttpOnly, SameSite=Lax) y control de acceso por rol.
- **Saldos y Historial de Movimientos:** Saldo individual por proyecto (fórmula: monto base + donaciones − gastos), aislado estricto por ObjectId, con historial de movimientos (apertura, donaciones y gastos) y guardia que impide dar de baja un proyecto con saldo pendiente.
- **Formato Monetario Unificado:** Helpers de moneda (`utils/formato.js`) registrados en `app.locals` para todo el renderizado de importes en formato es-AR.
- **Asistente Virtual:** ImpactoBot, chatbot con IA (Groq API) disponible en todas las vistas — ver [ImpactoBot](#impactobot).


## Base de Datos (MongoDB Atlas)

- **Motor:** MongoDB Atlas (en producción y desarrollo remoto) o MongoDB local (`mongodb://localhost:27017`) para desarrollo sin nube.
- **ODM:** Mongoose. La conexión se realiza en `config/db.js` a partir de las variables `MONGO_URI` y `DBNAME`.
- **Modelos y colecciones** (archivos en `models/`):

| Modelo (archivo) | Colección | Descripción |
|------------------|-----------|-------------|
| `Organizaciones.js` | `organizaciones` | Entidades emisoras de proyectos (baja lógica + reactivación). |
| `Proyectos.js` | `proyectos` | Iniciativas sociales con saldo y movimientos (baja lógica + reactivación). |
| `Donantes.js` | `donantes` | Personas o empresas que donan (borrado físico). |
| `Donaciones.js` | `donaciones` | Ingresos imputados a un proyecto (borrado físico). |
| `Gastos.js` | `gastos` | Egresos imputados a un proyecto (borrado físico). |
| `User.js` | `users` | Usuarios de la plataforma con rol `admin` o `usuario`. |


## Configuración de variables de entorno

El proyecto utiliza variables de entorno para configurar el puerto, la conexión con MongoDB, la autenticación y el asistente virtual. **No commitees nunca el archivo `.env`** (está en `.gitignore`); usa siempre `.env.example` como modelo:

```bash
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (por defecto `3200` si no está definida). |
| `MONGO_URI` | URI de conexión a MongoDB. Local: `mongodb://localhost:27017/sumarImpacto` — Producción (Atlas): `mongodb+srv://USUARIO:CONTRASEÑA@CLUSTER.mongodb.net/`. |
| `DBNAME` | Nombre de la base de datos (ej. `sumarImpacto`). |
| `JWT_SECRET` | Secreto para firmar tokens. **Obligatorio en producción:** sin él el servidor no arranca (`index.js`). En desarrollo se genera un secreto efímero con advertencia en consola. |
| `JWT_EXPIRES_IN` | Vigencia del token (ej. `1h`). |
| `GROQ_API_KEY` | Clave de la API de Groq. Requerida para el asistente **ImpactoBot** (`POST /api/chat`). |
| `NODE_ENV` | `production` en el entorno de producción. |

Estructura mínima del `.env`:

```env
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:CONTRASEÑA@CLUSTER.mongodb.net/
DBNAME=sumarImpacto
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=1h
GROQ_API_KEY=tu_clave_de_groq_aqui
NODE_ENV=production
```


## Instalación y Ejecución (local)

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear el archivo `.env` a partir de `.env.example` (ver sección anterior).
3. Iniciar el servidor en modo desarrollo (con Nodemon):
   ```bash
   npm run dev
   ```
   O en modo producción:
   ```bash
   npm start
   ```

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Arranque en desarrollo con Nodemon (recarga automática). |
| `npm start` | Arranque en producción con Node (`node index.js`). |
| `npm run seed` | Siembra manual de los usuarios de prueba (`scripts/seedUsers.js`). El servidor además lo ejecuta automáticamente en cada arranque. |
| `npm run verificar-saldos` | Script de verificación de negocio (`scripts/verificarSaldos.js`): valida el cálculo de saldos individuales por proyecto (aislamiento por ObjectId, proyectos sin movimientos, proyectos de baja e IDs inválidos). Crea y limpia sus propios datos de prueba en cada corrida. |


## Deploy en Producción (Vercel)

- **Plataforma:** [Vercel](https://vercel.com).
- **URL activa:** **https://code-ar-tau.vercel.app**

### Variables de entorno en producción

Configurar en el panel de Vercel:

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | URI de **MongoDB Atlas** (con usuario y contraseña) |
| `DBNAME` | Nombre de la base de datos en Atlas |
| `JWT_SECRET` | Secreto fuerte y estable (**obligatorio**: sin él el servidor no inicia en producción) |
| `GROQ_API_KEY` | Clave de Groq para ImpactoBot (opcional: sin ella el chatbot responde con error controlado) |

### Cookies seguras tras el proxy

Express corre con `app.set("trust proxy", 1)` (`index.js`), necesario en Vercel para que la cookie de sesión `sumarimpacto.sid` se marque **Secure** detrás del proxy HTTPS y funcione correctamente el login con sesión en el dominio de producción.

### Local vs producción

| | Local | Producción (Vercel) |
|---|-------|---------------------|
| Comando | `npm run dev` / `npm start` | Despliegue automático desde el repositorio |
| MongoDB | Local (`mongodb://localhost`) o Atlas | Atlas |
| `NODE_ENV` | sin definir (desarrollo) | `production` |
| `JWT_SECRET` | opcional (se genera efímero) | **obligatorio** |


## Autenticación y usuarios

- El sistema cuenta con dos roles: **admin** y **usuario**.
- El login se realiza en `/login`; la sesión se guarda en una cookie firmada (`sumarimpacto.sid`).
- Las rutas de **escritura de la API** (POST/PUT/DELETE/PATCH) y las **acciones administrativas de las vistas** (alta, edición y baja) requieren rol **admin**.
- Los listados y las vistas de detalle están disponibles con simplemente tener sesión iniciada.

### Usuarios por defecto

Al iniciar la base de datos se siembran dos usuarios de prueba:

| Rol | Email | Password |
|-----|-------|----------|
| admin | admin@sumarimpacto.com | Admin1234! |
| usuario | usuario@sumarimpacto.com | Usuario1234! |

### Seed de usuarios

- El servidor ejecuta el seed automáticamente en cada arranque (`scripts/seedUsers.js`), creando los usuarios si no existen.
- También puede ejecutarse manualmente:
  ```bash
  npm run seed
  ```

## Interfaz Web (Pug)

Acceso: `/vistas` (requiere sesión iniciada).

- **Panel principal:** links de navegación a los cinco módulos.
- **Por módulo:** listado, detalle, alta, edición y baja con paso de confirmación (Proyectos y Organizaciones agregan reactivación).
- **Formularios:** presentados en tarjeta (`.formulario-card`) con validación de campos y mensajes de error.
- **Tablas:** listados con columnas alineadas y tablas de detalle clave-valor (`.tabla-detalle`).
- **Roles:** el rol **usuario** puede consultar; el rol **admin** puede crear, editar y dar de baja.


## Endpoints

### API REST (JSON)

Todas las rutas de la API requieren sesión iniciada: sin sesión responden **401 JSON**. Las operaciones de escritura requieren rol **admin**.

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/proyectos` | sesión | Listado de proyectos. |
| GET | `/proyectos/:_id` | sesión | Detalle de proyecto. |
| POST | `/proyectos` | admin | Alta de proyecto. |
| PUT | `/proyectos/:_id` | admin | Edición de proyecto. |
| DELETE | `/proyectos/:_id` | admin | Baja lógica (valida saldo pendiente). |
| GET | `/organizaciones` | sesión | Listado de organizaciones (incluye bajas). |
| GET | `/organizaciones/:_id` | sesión | Detalle de organización. |
| POST | `/organizaciones` | admin | Alta de organización. |
| PUT | `/organizaciones/:_id` | admin | Edición de organización. |
| DELETE | `/organizaciones/:_id` | admin | Baja lógica. |
| PATCH | `/organizaciones/:_id/reactivar` | admin | Reactivación de organización. |
| GET | `/gastos` | sesión | Listado de gastos. |
| GET | `/gastos/:_id` | sesión | Detalle de gasto. |
| POST | `/gastos` | admin | Alta de gasto (valida saldo disponible del proyecto). |
| PUT | `/gastos/:_id` | admin | Edición de gasto. |
| DELETE | `/gastos/:_id` | admin | Borrado físico. |
| GET | `/donaciones` | sesión | Listado de donaciones. |
| GET | `/donaciones/:_id` | sesión | Detalle de donación. |
| POST | `/donaciones` | admin | Alta de donación. |
| PUT | `/donaciones/:_id` | admin | Edición de donación. |
| DELETE | `/donaciones/:_id` | admin | Borrado físico. |
| GET | `/donantes` | sesión | Listado de donantes. |
| GET | `/donantes/:_id` | sesión | Detalle de donante. |
| POST | `/donantes` | admin | Alta de donante. |
| PUT | `/donantes/:_id` | admin | Edición de donante. |
| DELETE | `/donantes/:_id` | admin | Borrado físico. |

### Autenticación

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/login` | pública | Formulario de login. |
| POST | `/login` | pública | Inicio de sesión. |
| GET | `/logout` | pública | Cierre de sesión. |
| GET | `/registro` | pública | Formulario de registro (alias: `/vistas/registro`). |
| POST | `/registro` | pública | Registro de usuario (alias: `/vistas/registro`). |

### Asistente IA

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/api/chat` | sesión | Recibe `{ "mensaje": "..." }` y responde con ImpactoBot (Groq API). |

### Interfaz web bajo `/vistas`

Todas requieren sesión; las acciones de escritura requieren rol **admin**. Sin sesión redirigen a `/login`.

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/vistas` | sesión | Panel principal con links a los módulos. |
| GET | `/vistas/proyectos` | sesión | Listado de proyectos. |
| GET | `/vistas/proyectos/nuevo` · POST `/vistas/proyectos` | admin | Formulario y alta. |
| GET | `/vistas/proyectos/:_id` | sesión | Detalle (con saldo actual e historial de movimientos). |
| GET · POST | `/vistas/proyectos/:_id/editar` | admin | Edición. |
| GET · POST | `/vistas/proyectos/:_id/eliminar` | admin | Confirmación y baja lógica. |
| GET · POST | `/vistas/proyectos/:_id/reactivar` | admin | Reactivación. |
| GET | `/vistas/organizaciones` | sesión | Listado de organizaciones. |
| GET | `/vistas/organizaciones/nuevo` · POST `/vistas/organizaciones` | admin | Formulario y alta. |
| GET | `/vistas/organizaciones/:_id` | sesión | Detalle. |
| GET · POST | `/vistas/organizaciones/:_id/editar` | admin | Edición. |
| GET · POST | `/vistas/organizaciones/:_id/eliminar` | admin | Confirmación y baja lógica. |
| GET · POST | `/vistas/organizaciones/:_id/reactivar` | admin | Reactivación. |
| GET | `/vistas/gastos` | sesión | Listado de gastos. |
| GET | `/vistas/gastos/nuevo` · POST `/vistas/gastos` | admin | Formulario y alta. |
| GET | `/vistas/gastos/:_id` | sesión | Detalle. |
| GET · POST | `/vistas/gastos/:_id/editar` | admin | Edición. |
| GET · POST | `/vistas/gastos/:_id/eliminar` | admin | Confirmación y borrado físico. |
| GET | `/vistas/donaciones` | sesión | Listado de donaciones. |
| GET | `/vistas/donaciones/nuevo` · POST `/vistas/donaciones` | admin | Formulario y alta. |
| GET | `/vistas/donaciones/:_id` | sesión | Detalle. |
| GET · POST | `/vistas/donaciones/:_id/editar` | admin | Edición. |
| GET · POST | `/vistas/donaciones/:_id/eliminar` | admin | Confirmación y borrado físico. |
| GET | `/vistas/donantes` | sesión | Listado de donantes. |
| GET | `/vistas/donantes/nuevo` · POST `/vistas/donantes` | admin | Formulario y alta. |
| GET | `/vistas/donantes/:_id` | sesión | Detalle. |
| GET · POST | `/vistas/donantes/:_id/editar` | admin | Edición. |
| GET · POST | `/vistas/donantes/:_id/eliminar` | admin | Confirmación y borrado físico. |


## ImpactoBot

Asistente virtual integrado en la interfaz (widget presente en todas las vistas vía `views/components/chatbot.pug`).

- **Motor:** API de [Groq](https://console.groq.com) (`services/chatService.js`).
- **Ruta:** `POST /api/chat` con cuerpo `{ "mensaje": "..." }` (requiere sesión).
- **Configuración:** variable de entorno `GROQ_API_KEY`.
- **Alcance:** responde consultas sobre el funcionamiento del sistema (módulos, campos y saldos). Sin la clave configurada devuelve un error controlado.


## Estructura del proyecto

```
├── config/           Conexión a MongoDB (db.js)
├── controllers/      Controladores de la API y de las vistas
├── middlewares/      Autenticación, validaciones, logger y manejo de errores
├── models/           Esquemas de Mongoose (Organizaciones, Proyectos, Donantes, Donaciones, Gastos, User)
├── public/           CSS, imágenes, favicon y JavaScript
│   ├── css/          styles.css
│   ├── img/          logo y favicon
│   └── js/           filtrar-proyectos.js, validacion-formulario.js
├── routes/           Definición de rutas (API, vistas, auth y chat)
├── scripts/          Seed de usuarios (seedUsers.js) y verificación de saldos (verificarSaldos.js)
├── services/         Capa de acceso a datos y lógica de negocio (incluye saldoService.js)
├── utils/            AppError y helpers de formato monetario (formato.js)
├── views/            Plantillas Pug (layout, login, módulos y components/)
├── .env.example      Modelo de variables de entorno
└── index.js          Punto de entrada de la aplicación Express
```


## Requisitos

- Node.js 20.19.0 o superior
- npm
- MongoDB Atlas (o MongoDB local para desarrollo)
- Cuenta en Vercel (solo para el despliegue en producción)


## Uso de Inteligencia Artificial

Durante el desarrollo del proyecto se utilizó IA como herramienta de apoyo en tareas puntuales, tales como:

- Planificación y organización de tareas.
- Revisión de código y detección de posibles errores.
- Resolución de dudas puntuales de sintaxis y buenas prácticas.

El código final fue escrito, revisado y validado por el equipo. La IA se usó como asistente, no como generador automático del proyecto.
