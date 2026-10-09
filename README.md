# SumarImpacto - Backend (CodeAr) - Versión ES Modules (ESM)

Proyecto desarrollado para la materia Desarrollo de Sistemas Web Backend (Tecnicatura Superior en Desarrollo de Software - IFTS 29).

**Esta es una versión adaptada a ECMAScript Modules (ESM / "ES6 modules")** a partir del proyecto original en CommonJS.

## 🏢 Sobre la Organización

 **SumarImpacto** es una iniciativa tecnológica concebida para actuar como nexo estratégico entre organizaciones de la sociedad civil, donantes (particulares o corporativos) y proyectos comunitarios de alto impacto social. La plataforma nace para dar respuesta a una problemática recurrente en el tercer sector: la falta de transparencia, trazabilidad y automatización en la gestión de fondos destinados a causas benéficas.


## 👥 Integrantes y Responsabilidades (Empresa CodeAr)

- **Omar Virili:** Configuración del servidor Express, arquitectura y módulo de **Proyectos**.
- **Jairo N. Calla Girón:** Módulo de **Donantes** (CRUD y persistencia en MongoDB Atlas).
- **Mariana Borda:** Módulo de **Organizaciones** (CRUD y persistencia en MongoDB Atlas) y documentación.
- **Analía Fernández:** Módulo de **Donaciones** (CRUD y persistencia en MongoDB Atlas).
- **Cynthia Sotelo:** Módulo de **Gastos** (CRUD y persistencia en MongoDB Atlas).
- **Cristian Suárez:** Diseño, maquetación e integración del motor de plantillas **Pug** (vistas web, rutas dinámicas y componentes de navegación).


## Cambios principales respecto a la versión CommonJS

- Se agregó `"type": "module"` en `package.json`.
- Todos los `require()` se reemplazaron por `import ... from ...`.
- Todos los `module.exports` se reemplazaron por `export` / `export default`.
- Se agregó la extensión `.js` en las rutas de importación relativas (requerido por ESM en Node.js).
- Se implementó el polyfill de `__dirname` y `__filename` usando `import.meta.url` y `fileURLToPath` (ya que no existen de forma nativa en ESM).
- Scripts de `package.json` actualizados.
- 

## ✨ Características Principales

- **Gestión de Entidades:** CRUD completo para Organizaciones, Proyectos, Donantes, Donaciones y Gastos.
- **Validaciones Integradas:** Middlewares personalizados para validar IDs, cuerpos de peticiones (`body`) y relaciones entre entidades (ej. validar existencia de Organización).
- **Manejo Centralizado de Errores:** Middleware global `errorHandler` para captura y respuesta uniforme ante fallos.
- **Registro de Peticiones:** Middleware `requestLogger` para auditoría y log de peticiones HTTP.
- **Base de Datos Escalable:** Persistencia en MongoDB administrada a través de esquemas de Mongoose.


### 🔐 Configuración de variables de entorno

El proyecto utiliza variables de entorno para configurar el puerto del servidor y la conexión con MongoDB Atlas.

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:CONTRASEÑA@CLUSTER.mongodb.net/
DBNAME=nombre_de_tu_base_de_datos
```

## 🚀 Instalación y Ejecución

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

## 🌐 Endpoints de la API y Vistas Web
- **API REST (JSON):** `/proyectos`, `/organizaciones`, `/donantes`, `/donaciones`, `/gastos`
- **Interfaz Web (Pug):** `/vistas` (Panel principal, listados y vistas dinámicas)

## Requisitos
- Node.js 20.19.0 o superior
- MongoDB Atlas
- npm






  
