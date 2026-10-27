# SumarImpacto - Backend (CodeAr) - Versión ES Modules (ESM)

Proyecto desarrollado para la materia Desarrollo de Sistemas Web Backend (Tecnicatura Superior en Desarrollo de Software - IFTS 29).

**Esta es una versión adaptada a ECMAScript Modules (ESM / "ES6 modules")** a partir del proyecto original en CommonJS.

## Sobre la Organización

 **SumarImpacto** es una iniciativa tecnológica concebida para actuar como nexo estratégico entre organizaciones de la sociedad civil, donantes (particulares o corporativos) y proyectos comunitarios de alto impacto social. La plataforma nace para dar respuesta a una problemática recurrente en el tercer sector: la falta de transparencia, trazabilidad y automatización en la gestión de fondos destinados a causas benéficas.


## Integrantes y Responsabilidades (Empresa CodeAr)

- **Omar Virili:** Creación/configuración de la base MongoDB Atlas, conexión mediante Mongoose y desarrollo del CRUD del módulo **Proyectos**.
- **Jairo N. Calla Girón:** Módulo de **Donantes** (CRUD y persistencia en MongoDB Atlas).
- **Mariana Borda:** Módulo de **Organizaciones** (CRUD y persistencia en MongoDB Atlas) y documentación.
- **Analía Fernández:** Módulo de **Donaciones** (CRUD y persistencia en MongoDB Atlas).
- **Cynthia Sotelo:** Módulo de **Gastos** (CRUD y persistencia en MongoDB Atlas).
- **Cristian Suárez:** Diseño, maquetación e integración del motor de plantillas **Pug** (vistas web, rutas dinámicas y componentes de navegación). Implementación de la autenticación basada en sesiones.


## Cambios principales respecto a la versión CommonJS

- Se agregó `"type": "module"` en `package.json`.
- Todos los `require()` se reemplazaron por `import ... from ...`.
- Todos los `module.exports` se reemplazaron por `export` / `export default`.
- Se agregó la extensión `.js` en las rutas de importación relativas (requerido por ESM en Node.js).
- Se implementó el polyfill de `__dirname` y `__filename` usando `import.meta.url` y `fileURLToPath` (ya que no existen de forma nativa en ESM).
- Scripts de `package.json` actualizados.


## Características Principales

- **Gestión de Entidades:** CRUD completo para Organizaciones, Proyectos, Donantes, Donaciones y Gastos.
- **Validaciones Integradas:** Middlewares personalizados para validar IDs, cuerpos de peticiones (`body`) y relaciones entre entidades (ej. validar existencia de Organización).
- **Manejo Centralizado de Errores:** Middleware global `errorHandler` para captura y respuesta uniforme ante fallos.
- **Registro de Peticiones:** Middleware `requestLogger` para auditoría y log de peticiones HTTP.
- **Base de Datos Escalable:** Persistencia en MongoDB administrada a través de esquemas de Mongoose.
- **Autenticación con Sesiones:** Login/logout con cookie de sesión `sumarimpacto.sid` (HttpOnly, SameSite=Lax) y control de acceso por rol.


### Configuración de variables de entorno

El proyecto utiliza variables de entorno para configurar el puerto del servidor y la conexión con MongoDB Atlas.

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:CONTRASEÑA@CLUSTER.mongodb.net/
DBNAME=nombre_de_tu_base_de_datos
```

## Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor en modo desarrollo (con Nodemon):
   ```bash
   npm run dev
   ```
   O en modo producción:
   ```bash
   npm start
   ```

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
- **Por módulo:** listado, detalle, alta, edición y baja con paso de confirmación.
- **Formularios:** presentados en tarjeta (`.formulario-card`) con validación de campos y mensajes de error.
- **Tablas:** listados con columnas alineadas y tablas de detalle clave-valor (`.tabla-detalle`).
- **Roles:** el rol **usuario** puede consultar; el rol **admin** puede crear, editar y dar de baja.

## Estructura del proyecto

```
├── config/         Conexión a MongoDB (db.js)
├── controllers/    Controladores de la API y de las vistas
├── middlewares/    Autenticación, validaciones, logger y manejo de errores
├── models/         Esquemas de Mongoose
├── public/         CSS, imágenes y favicon
├── routes/         Definición de rutas (API y vistas)
├── scripts/        Seed de usuarios
├── services/       Capa de acceso a datos y lógica de negocio
├── utils/          Funciones de validación y AppError
└── views/          Plantillas Pug (layout, login, módulos)
```

## Endpoints de la API y Vistas Web
- **API REST (JSON):** `/proyectos`, `/organizaciones`, `/donantes`, `/donaciones`, `/gastos`
- **Interfaz Web (Pug):** `/vistas` (Panel principal, listados y vistas dinámicas)

## Uso de Inteligencia Artificial

Durante el desarrollo del proyecto se utilizó IA como herramienta de apoyo en tareas puntuales, tales como:

- Planificación y organización de tareas.
- Revisión de código y detección de posibles errores.
- Resolución de dudas puntuales de sintaxis y buenas prácticas.

El código final fue escrito, revisado y validado por el equipo. La IA se usó como asistente, no como generador automático del proyecto.

## Requisitos
- Node.js 20.19.0 o superior
- MongoDB Atlas
- npm
