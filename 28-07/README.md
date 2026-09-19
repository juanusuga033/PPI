# Dona y Viste — I.E. La Candelaria

Plataforma web para donar, comprar y vender uniformes escolares de la I.E. La Candelaria. React + Vite + Supabase (Auth, Postgres y Storage).

## Tecnologías

- React 19 + React Router
- Vite
- Supabase (`@supabase/supabase-js`): autenticación, base de datos Postgres y Storage de imágenes
- ESLint

## Instalación

```bash
cd 28-07
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y completa con las claves de tu proyecto Supabase (Settings → API). Nunca subas `.env` con valores reales al repositorio.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Solo se usa la clave pública (anon/publishable). La seguridad de los datos depende de las políticas RLS, no de ocultar esta clave.

## Ejecutar en desarrollo

```bash
npm run dev
```

## Build de producción

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Esquema de Supabase

El SQL necesario para crear las tablas, el bucket de Storage y las políticas RLS está en [`supabase/schema.sql`](supabase/schema.sql). Ejecútalo en el SQL Editor del proyecto Supabase antes de usar la app. Crea:

- `publicaciones`: uniformes publicados para donar o vender (dueño = `usuario_id`, ligado a `auth.users`).
- Bucket `uniformes`: fotos de las publicaciones (lectura pública, escritura solo autenticada).
- `comunidad_posts` / `comunidad_comentarios`: publicaciones y respuestas de la sección Comunidad.
- `mensajes_contacto`: mensajes del formulario de contacto (inserción pública, sin lectura vía API).

Todas las tablas tienen RLS activado: lectura pública, escritura/edición/borrado restringidos al dueño del registro.

## Estructura

```
src/
  components/   Header, Footer, ProtectedRoute
  lib/          cliente de Supabase, catálogo de imágenes de respaldo, mensajes de error de auth
  pages/        Home, Compra, Venta, Donaciones, Producto, Perfil, Comunidad, Contacto, Login, Register, NotFound
  styles/       CSS por página
public/catalog/ Fotografías reales de uniformes (usadas como respaldo si una publicación no tiene imagen propia)
```

## Despliegue en GitHub Pages

El workflow [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) construye y publica el sitio automáticamente en cada push a `main`, usando GitHub Pages (no Vercel).

Pasos únicos de configuración en el repositorio:

1. En GitHub → Settings → Pages, selecciona **Source: GitHub Actions**.
2. En GitHub → Settings → Secrets and variables → Actions, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (los mismos valores de tu `.env`).
3. Vite compila con `base: /PPI/` en producción (ver `vite.config.js`) y `react-router-dom` usa ese mismo `basename`, para que las rutas funcionen bajo `https://<usuario>.github.io/PPI/`.
4. El build genera `dist/404.html` (copia de `index.html`) para que GitHub Pages redirija cualquier ruta desconocida a la SPA y React Router la resuelva.

## React + Vite (plantilla base)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
