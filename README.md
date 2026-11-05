# SumarImpacto - Backend (CodeAr) - Versión ES Modules (ESM)

Proyecto desarrollado para la materia Desarrollo de Sistemas Web Backend (Tecnicatura Superior en Desarrollo de Software - IFTS 29).

En esta versión la autenticación se migró de sesiones a **JWT** y se incorporó **ImpactoBot**, un asistente virtual con IA integrado a la interfaz web.

## Sobre la Organización

**SumarImpacto** es una iniciativa tecnológica concebida para actuar como nexo estratégico entre organizaciones de la sociedad civil, donantes (particulares o corporativos) y proyectos comunitarios de alto impacto social. La plataforma nace para dar respuesta a una problemática recurrente en el tercer sector: la falta de transparencia, trazabilidad y automatización en la gestión de fondos destinados a causas benéficas.


## Integrantes y Responsabilidades (Empresa CodeAr)

- **Omar Virili:** Módulo de **Proyectos**.
- **Mariana Borda:** Módulo de **Organizaciones** y documentación.
- **Jairo N. Calla Girón:** Módulo de **Donantes**.
- **Analía Fernández:** Módulo de **Donaciones**.
- **Cynthia Sotelo:** Módulo de **Gastos**.
- **Cristian Suárez:** Autenticación y autorización con **JWT** e implementación del **chatbot (ImpactoBot)**. Diseño, maquetación e integración del motor de plantillas **Pug**.

Cada módulo incluye CRUD con persistencia en MongoDB (Mongoose), rutas de API, controlador, servicio y vistas Pug.


## Cambios principales respecto a la versión anterior

La versión anterior usaba sesiones de servidor (`express-session`) e identificadores numéricos propios para cada entidad. Esta versión introduce:

- **Autenticación con JWT en lugar de sesiones:** se reemplazó `express-session` por `jsonwebtoken`. El token viaja en la cookie `HttpOnly` `sumarimpacto.token` (antes `sumarimpacto.sid`) y el middleware global `checkAuth` lo verifica en cada request. Las variables `SESSION_SECRET` y `SESSION_TTL_MINUTES` pasaron a ser `JWT_SECRET` y `JWT_EXPIRES_IN`.
- **Identificación por `_id` de MongoDB (ObjectId):** se eliminaron los identificadores numéricos (`idOrganizacion`, `idProyecto`, `idDonante`, `idDonacion`, `idGasto`). Ahora cada documento se identifica por su `_id` y las relaciones entre entidades son referencias `ObjectId`. Las rutas pasaron de `:id` a `:_id` y el middleware `validarId` fue reemplazado por `validarObjectId`.
- **Validaciones unificadas:** `middlewares/validaciones.js` reemplaza a los archivos separados por módulo (`validarOrganizacion.js`, `validarDonacion.js`, `validarGasto.js` y `utils/validaciones*.js`). Define un esquema por entidad, devuelve todos los errores juntos y ahora también cubre Proyectos.
- **Registro de usuarios:** nueva pantalla `/registro` y nuevo rol `operador` (rol por defecto de las cuentas registradas). El login suma la opción de mostrar/ocultar la contraseña y un enlace al registro.
- **ImpactoBot:** asistente virtual con IA (Groq) disponible en todas las pantallas una vez iniciada la sesión, con endpoint propio `POST /api/chat`.
- **Reactivación desde la interfaz web:** Organizaciones y Proyectos se pueden reactivar desde las vistas (`/:_id/reactivar`). Antes solo existía el `PATCH` de la API para Organizaciones.
- **Validación de formularios en el navegador:** nuevo script `public/js/validacion-formulario.js`.


Se mantienen de la versión anterior: la migración a **ES Modules** (`"type": "module"`, `import`/`export`, extensión `.js` en las importaciones relativas y `__dirname`/`__filename` reconstruidos con `import.meta.url`), la baja lógica de Organizaciones y Proyectos, y el manejo centralizado de errores con `AppError` y `errorHandler`.


## Características Principales

- **Gestión de Entidades:** CRUD completo para Organizaciones, Proyectos, Donantes, Donaciones y Gastos.
- **Autenticación JWT:** login/logout con cookie `sumarimpacto.token` (HttpOnly, SameSite=Lax, `secure` en producción) y control de acceso por rol.
- **Asistente virtual (ImpactoBot):** responde consultas sobre el uso de los cinco módulos del sistema.
- **Validaciones Integradas:** validación de IDs, del cuerpo de las peticiones y de las relaciones entre entidades (existencia de organización, proyecto y donante).
- **Manejo Centralizado de Errores:** middleware global `errorHandler`; responde JSON en la API y la vista `error.pug` en la interfaz web.
- **Registro de Peticiones:** middleware `requestLogger` (método, URL, estado y duración).
- **Base de Datos Escalable:** persistencia en MongoDB mediante esquemas de Mongoose.


## Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DBNAME=nombre_de_tu_base_de_datos
MONGO_URI=mongodb+srv://USUARIO:CONTRASEÑA@CLUSTER.mongodb.net/
GROQ_API_KEY=tu_clave_de_groq_aqui

# Configuración de JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=1h
```

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (por defecto `3200` si no se define). |
| `MONGO_URI` | Cadena de conexión a MongoDB (Atlas o local). |
| `DBNAME` | Nombre de la base de datos. |
| `GROQ_API_KEY` | Clave de la API de Groq para ImpactoBot. Sin ella el servidor arranca igual, pero el chat responde con error. |
| `JWT_SECRET` | Secreto con el que se firman los tokens. **Obligatorio en producción** (`NODE_ENV=production`): si falta, el servidor no arranca. En desarrollo, si falta, se genera uno efímero con una advertencia en consola (los tokens dejan de ser válidos al reiniciar). |
| `JWT_EXPIRES_IN` | Duración del token (por defecto `8h`). La cookie dura como máximo 8 horas. |

Variables opcionales para el seed de usuarios: `ADMIN_USER`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `OPERADOR_USER`, `OPERADOR_EMAIL`, `OPERADOR_PASSWORD`.


## Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar el archivo `.env` (ver sección anterior).
3. Iniciar el servidor en modo desarrollo (con Nodemon):
   ```bash
   npm run dev
   ```
   O en modo producción:
   ```bash
   npm start
   ```

## Autenticación y usuarios

- El sistema cuenta con tres roles: **admin**, **usuario** y **operador**.
- El login se realiza en `/login` (con email o nombre de usuario). Si las credenciales son correctas, el servidor firma un **JWT** y lo guarda en la cookie `sumarimpacto.token`.
- El middleware global `checkAuth` verifica el token en cada petición y deja los datos del usuario en `req.user`. Si el token es inválido o expiró, se limpia la cookie.
- Sin sesión válida, las **vistas** redirigen a `/login` y la **API** responde `401`.
- Las rutas de **escritura de la API** (POST/PUT/DELETE/PATCH) y las **acciones administrativas de las vistas** (alta, edición, baja y reactivación) requieren rol **admin**; si no, responden `403`.
- Los listados y las vistas de detalle están disponibles con solo tener sesión iniciada, sin importar el rol.
- `GET /logout` elimina la cookie y vuelve al login.


### Registro de usuarios

- Cualquier persona puede crear una cuenta en `/registro` (nombre de usuario, email, contraseña, nombre y apellido).
- Las cuentas nuevas se crean con rol **operador** (solo consulta). Las contraseñas se guardan hasheadas con `bcryptjs`.
- El nombre de usuario y el email son únicos.
  

### Usuarios por defecto

Al iniciar el servidor se siembran dos usuarios de prueba:

| Rol | Usuario | Email | Password |
|-----|---------|-------|----------|
| admin | admin | admin@sumarimpacto.com | Admin1234! |
| usuario | operador | usuario@sumarimpacto.com | Usuario1234! |

> Son credenciales de **desarrollo**: no deben usarse en producción. Se pueden cambiar con las variables de entorno opcionales indicadas más arriba.

### Seed de usuarios

- El servidor ejecuta el seed automáticamente en cada arranque (`scripts/seedUsers.js`): crea los usuarios si no existen y, si ya existen, sincroniza contraseña y rol con lo definido en el entorno.
- También puede ejecutarse manualmente:
  ```bash
  npm run seed
  ```

## Asistente virtual (ImpactoBot)

- Widget flotante de chat presente en todas las pantallas de la interfaz web (solo con sesión iniciada). Su vista está en `views/components/chatbot.pug`.
- Usa la API de **Groq** (`groq-sdk`) con el modelo `openai/gpt-oss-20b`.
- Está configurado para responder **únicamente** sobre los cinco módulos del sistema (Organizaciones, Proyectos, Donantes, Donaciones y Gastos), sin inventar funcionalidades que no existen.
- Endpoint: `POST /api/chat` (requiere sesión).
  - Body: `{ "mensaje": "¿Cómo doy de alta un proyecto?" }`
  - Respuesta: `{ "respuesta": "..." }`
  - Errores: `400` si falta el mensaje o no es texto; `500` si falla la conexión con Groq o falta `GROQ_API_KEY`.
- La lógica vive en `services/chatService.js` y el controlador en `controllers/chatController.js`.


## Interfaz Web (Pug)

Acceso: `/vistas` (requiere sesión iniciada). La ruta `/` muestra el panel principal.

- **Panel principal:** links de navegación a los cinco módulos.
- **Por módulo:** listado, detalle, alta, edición y baja con paso de confirmación.
- **Baja lógica y reactivación:** disponibles en Organizaciones y Proyectos. En Donantes, Donaciones y Gastos la baja es física.
- **Formularios:** presentados en tarjeta (`.formulario-card`) con validación en el navegador (`public/js/validacion-formulario.js`) y en el servidor, con mensajes de error por campo.
- **Tablas:** listados con columnas alineadas y tablas de detalle clave-valor (`.tabla-detalle`).
- **Roles:** los roles **usuario** y **operador** pueden consultar; el rol **admin** puede crear, editar y dar de baja.
- **Encabezado:** muestra el usuario y su rol, y el link para cerrar sesión.
- **Ingreso y registro:** `/login` (con opción de mostrar/ocultar la contraseña) y `/registro`.

## Estructura del proyecto

```
├── config/         Conexión a MongoDB (db.js)
├── controllers/    Controladores de la API, de las vistas, de autenticación y del chat
├── middlewares/    Autenticación JWT, validaciones, logger y manejo de errores
├── models/         Esquemas de Mongoose (incluye User)
├── public/         CSS, JS del navegador, imágenes y favicon
├── routes/         Definición de rutas (API, vistas, autenticación y chat)
├── scripts/        Seed de usuarios
├── services/       Capa de acceso a datos y lógica de negocio (incluye chatService)
├── utils/          AppError (errores con código HTTP)
└── views/          Plantillas Pug (layout, login, registro, módulos y components/chatbot)
```


## Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET / POST | `/login` | Pantalla de ingreso / inicio de sesión (devuelve la cookie con el JWT). |
| GET / POST | `/registro` | Pantalla de registro / alta de usuario (rol `operador`). |
| GET | `/logout` | Cierra la sesión y redirige al login. |

### API REST (JSON) — requiere sesión; escritura solo **admin**
| Módulo | Ruta base | Operaciones |
|--------|-----------|-------------|
| Proyectos | `/proyectos` | `GET /`, `GET /:_id`, `POST /`, `PUT /:_id`, `DELETE /:_id` (baja lógica) |
| Organizaciones | `/organizaciones` | `GET /` (`?incluirBajas=true` incluye las dadas de baja), `GET /:_id`, `POST /`, `PUT /:_id`, `DELETE /:_id` (baja lógica), `PATCH /:_id/reactivar` |
| Donantes | `/donantes` | `GET /`, `GET /:_id`, `POST /`, `PUT /:_id`, `DELETE /:_id` |
| Donaciones | `/donaciones` | `GET /`, `GET /:_id`, `POST /`, `PUT /:_id`, `DELETE /:_id` |
| Gastos | `/gastos` | `GET /`, `GET /:_id`, `POST /`, `PUT /:_id`, `DELETE /:_id` |
| Chat | `/api/chat` | `POST /` |

### Interfaz Web (Pug) — requiere sesión
- `/vistas`: panel principal.
- `/vistas/{proyectos|organizaciones|donantes|donaciones|gastos}`: listado, `/nuevo`, `/:_id`, `/:_id/editar` y `/:_id/eliminar` (acciones solo admin). En Proyectos y Organizaciones también `/:_id/reactivar`.

### Formato de errores (API)
```json
{ "mensaje": "Datos inválidos", "errores": ["El campo 'monto' es obligatorio"] }
```
Códigos usados: `400` datos inválidos, `401` no autenticado, `403` sin permisos, `404` no encontrado, `409` conflicto (duplicados o estado), `503` base de datos no disponible, `500` error interno.


## Uso de Inteligencia Artificial

Durante el desarrollo del proyecto se utilizó IA como herramienta de apoyo en tareas puntuales, tales como:

- Planificación y organización de tareas.
- Revisión de código y detección de posibles errores.
- Resolución de dudas puntuales de sintaxis y buenas prácticas.

El código final fue escrito, revisado y validado por el equipo. La IA se usó como asistente, no como generador automático del proyecto.

Además, el sistema incluye **ImpactoBot**, una funcionalidad de IA integrada al producto (ver sección *Asistente virtual*), que es independiente del uso de IA durante el desarrollo.

### Ejemplos de prompts

A modo de referencia, estos son ejemplos de prompts representativos del tipo de consultas que se pueden hacer a una IA como apoyo para desarrollar esta versión. Siempre se pidió explicación y se revisó el resultado antes de incorporarlo.

**Migración de sesiones a JWT**
```text
Tengo una app Express 5 con ES Modules que usa sesiones con cookie. Quiero migrarla a JWT
guardado en una cookie HttpOnly. Explicame qué middlewares tengo que cambiar y cómo
verificar el token en cada request sin romper las rutas de vistas Pug, que deberían
redirigir a /login, y las de la API, que deberían responder 401 en JSON.
```

**Migración de IDs numéricos a ObjectId**
```text
Mi proyecto Express con Mongoose usa IDs numéricos propios (idProyecto, idDonante, etc.)
que calculo sumando 1 al último. Quiero pasar a usar el _id de MongoDB y referencias
ObjectId entre colecciones. ¿Qué tengo que cambiar en los modelos, en los servicios y en
las rutas, y cómo valido que el parámetro :_id tenga formato válido?
```

**Integración del chatbot con Groq**
```text
Quiero agregar un chatbot a mi app Node con Express usando la API de Groq (groq-sdk).
Necesito un servicio que reciba el mensaje del usuario y devuelva la respuesta, un
controlador con validación del campo "mensaje" y una ruta POST /api/chat protegida por
autenticación. ¿Cómo organizo el código en services, controllers y routes?
```

**Validaciones**
```text
Quiero unificar las validaciones de entrada de cinco entidades en un solo archivo, con un
esquema por entidad, que devuelva todos los errores juntos y no solo el primero. ¿Cómo lo
estructuro para poder reutilizarlo desde la API y desde los formularios web?
```

**Revisión de código**
```text
Revisá este controlador y su servicio. Decime si hay errores, casos borde sin contemplar
(por ejemplo, el _id no existe o el proyecto está dado de baja) o malas prácticas. No me
reescribas todo: indicame qué cambiarías y por qué.
```


## Requisitos

- Node.js 20.19.0 o superior
- MongoDB (Atlas o instancia local)
- npm
- Clave de API de Groq (para ImpactoBot)