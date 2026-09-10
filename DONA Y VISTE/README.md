# Dona y Viste

Dona y Viste es una aplicación web relacionada con los uniformes escolares de la
Institución Educativa La Candelaria. Permite consultar uniformes publicados por
la comunidad y crear publicaciones para venderlos o donarlos, con el propósito
de facilitar la reutilización de prendas y apoyar a las familias.

## 📌 Descripción del proyecto

En la comunidad educativa, algunos uniformes dejan de usarse aunque todavía se
encuentran en buenas condiciones. Al mismo tiempo, otras familias necesitan
conseguir estas prendas sin tener que comprarlas nuevas. Dona y Viste propone un
espacio para encontrar uniformes de segunda mano y poner en contacto a las
personas interesadas.

El proyecto está dirigido a estudiantes, familias y demás integrantes de la
comunidad educativa de la Institución Educativa La Candelaria. Desde la
aplicación se pueden consultar publicaciones de venta y donación, revisar los
detalles de una prenda y contactar a quien la publicó. Las personas con una
cuenta también pueden publicar, administrar sus anuncios y actualizar sus datos.

De esta manera se promueve la reutilización de uniformes que todavía pueden
servir y se busca apoyar económicamente a las familias mediante el intercambio,
la venta o la donación de estas prendas.

## 🎯 Objetivo

Crear una aplicación web sencilla que facilite la publicación, búsqueda y
contacto alrededor de uniformes escolares usados, conectando a las familias de
la comunidad educativa y promoviendo una alternativa de reutilización.

## ✨ Funcionalidades

### Implementadas

- [x] Página de inicio con acceso a las secciones principales.
- [x] Consulta de publicaciones de venta en la sección **Comprar**.
- [x] Consulta de publicaciones de donación en la sección **Donaciones**.
- [x] Filtros de publicaciones por búsqueda, categoría, talla y condición en la
	sección de compra.
- [x] Visualización del detalle de una publicación, incluyendo título, precio o
	indicación de donación, talla, condición, descripción e imagen.
- [x] Registro de cuentas con nombre, apellido, correo y contraseña.
- [x] Inicio y cierre de sesión mediante Supabase Auth.
- [x] Confirmación del correo electrónico después del registro.
- [x] Recuperación y actualización de contraseña.
- [x] Creación de publicaciones de venta o donación para usuarios autenticados.
- [x] Registro de título, precio, talla, categoría, condición, descripción,
	contacto e imagen de la publicación.
- [x] Validación de formato y tamaño de las imágenes que se cargan desde el
	formulario de publicación.
- [x] Perfil de usuario con edición de nombre, apellido y URL de avatar.
- [x] Consulta de las publicaciones propias desde el perfil.
- [x] Edición, activación, pausa y eliminación de publicaciones propias.
- [x] Contacto con el vendedor mediante correo electrónico o teléfono, según el
	dato guardado en la publicación.
- [x] Diseño adaptable con menú de navegación para pantallas pequeñas.

### Pendientes o no confirmadas en la interfaz actual

- [ ] Compra o pago en línea. La aplicación muestra el precio y permite
	contactar al vendedor, pero no incluye un proceso de pago.
- [ ] Chat interno entre usuarios.
- [ ] Gestión de pedidos, reservas o entregas.
- [ ] Carga de varias imágenes desde el formulario. La migración prepara campos
	para cantidad e imágenes, pero la interfaz actual trabaja con una imagen por
	publicación.
- [ ] Nombres definitivos de los integrantes del equipo.

## 🛠️ Tecnologías utilizadas

- **JavaScript:** lenguaje utilizado para la lógica de la aplicación.
- **React:** construcción de la interfaz mediante componentes y páginas.
- **Vite:** servidor de desarrollo y herramienta de compilación del proyecto.
- **React Router DOM:** navegación entre las rutas de la aplicación.
- **Supabase:** autenticación, consulta y almacenamiento de datos e imágenes.
- **Bootstrap:** dependencia incluida en el proyecto para estilos y utilidades;
	las páginas también cuentan con hojas de estilo CSS propias.
- **CSS:** estilos generales, de componentes y de las páginas.
- **ESLint:** revisión de reglas y posibles errores en el código JavaScript y
	JSX.

## 📁 Estructura del proyecto

La aplicación principal se encuentra en la carpeta `DONA Y VISTE/`:

```text
DONA Y VISTE/
├── public/
│   └── catalog/          # Imágenes de catálogo usadas como apoyo visual
├── src/
│   ├── assets/            # Recursos incluidos por la aplicación, como hero.png
│   ├── components/        # Header, Footer y ProductCard
│   ├── lib/               # Cliente de Supabase, autenticación y servicios
│   ├── pages/             # Inicio, compra, donaciones, perfil, acceso y demás vistas
│   ├── styles/            # Hojas CSS específicas de las páginas y el encabezado
│   ├── App.jsx            # Rutas principales y protección de rutas privadas
│   ├── App.css            # Estilos generales de la aplicación
│   ├── index.css          # Estilos base
│   └── main.jsx           # Punto de entrada de React
├── supabase/
│   └── schema.sql         # Archivo SQL incluido dentro del proyecto
├── index.html
├── package.json
└── vite.config.js
```

Las migraciones que definen la configuración actual de Supabase se encuentran
en `../supabase/migrations/`:

- `20260907180000_donayviste_security.sql` configura perfiles, políticas de
	seguridad y el bucket de imágenes.
- `20260908120000_donayviste_publications.sql` agrega los campos de cantidad e
	imágenes y ajusta las políticas del bucket.

## 🚀 Instalación y ejecución

Se necesita tener instalado Node.js y npm. Desde una terminal, ejecuta:

```bash
git clone https://github.com/juanusuga033/PPI.git
cd PPI
cd "DONA Y VISTE"
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación,
normalmente `http://localhost:5173/`.

Para crear una versión compilada se puede ejecutar:

```bash
npm run build
```

Antes de iniciar la aplicación se deben configurar las variables de entorno de
Supabase indicadas en la siguiente sección.

## 🔑 Variables de entorno

Crea un archivo `.env` dentro de `DONA Y VISTE/`. El código utiliza exactamente
estas variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_publica
```

Los valores deben ser los del proyecto de Supabase que se vaya a utilizar. No
se deben publicar claves privadas, contraseñas ni archivos `.env` en el
repositorio.

## 🗄️ Base de datos / Supabase

Supabase se utiliza para mantener la sesión de los usuarios, guardar sus datos
de perfil y almacenar las publicaciones de uniformes. La aplicación consulta y
modifica estos datos desde el cliente usando las variables de entorno
anteriores.

Según las migraciones y el código actual:

- La tabla `profiles` guarda el `id` relacionado con la cuenta, nombre,
	apellido, correo, avatar y fechas de creación o actualización.
- La tabla `publicaciones` guarda los datos de cada publicación, como título,
	descripción, precio, talla, categoría, condición, contacto, imagen, tipo,
	usuario propietario y estado. El código usa los tipos `venta` y `donacion`,
	y los estados `activo` y `pausado`.
- El bucket de Storage `uniformes` guarda las imágenes cargadas por los
	usuarios. La aplicación obtiene una URL pública para mostrar esas imágenes.
- Las políticas de seguridad RLS permiten consultar publicaciones activas y
	limitan la creación, edición y eliminación de publicaciones al usuario que
	las creó. Los perfiles se consultan y actualizan de forma privada por su
	propio usuario.
- Un trigger crea o actualiza el perfil básico cuando se registra un usuario.

Para preparar la base de datos, aplica las migraciones de
`../supabase/migrations/` en el proyecto de Supabase y crea el bucket público
`uniformes` según la configuración indicada en el SQL. La forma exacta de
aplicar las migraciones depende de si se usa la CLI de Supabase o el editor SQL.

## 🖼️ Capturas de pantalla

El repositorio contiene imágenes de prototipos en
`../public/images/prototipo/`, que pueden servir como referencia visual:

- `IMG_6604.png`
- `IMG_6605.png`
- `IMG_6606.png`
- `IMG_6607.png`
- `IMG_6608.png`
- `IMG_6609.jpeg`

También existen imágenes de uniformes en `../public/images/uniformes/` y un
catálogo usado por la aplicación en `public/catalog/`. Estas imágenes no son
capturas de pantalla de la aplicación terminada.

<!-- Agregar aquí capturas de las vistas actuales: inicio, comprar, donaciones,
		 formulario de publicación, detalle y perfil. -->

## 👥 Autores

- María Fernanda Henao
- Juan Usuga
- Laura Ramirez
- Miguel Duque

## 📚 Documentación relacionada

- [Manual de usuario](../MANUAL_USUARIO.md)
- [Prototipos de la interfaz](../public/images/prototipo/)
- [Formularios y prototipos HTML](../formularioproyecto/)
- [Migraciones de Supabase](../supabase/migrations/)

## ✅ Estado del proyecto

La aplicación cuenta actualmente con navegación, autenticación, consulta de
publicaciones, creación de ventas o donaciones, carga de imágenes y gestión de
las publicaciones propias. Estas funciones dependen de que las variables de
Supabase estén configuradas y de que la base de datos, sus políticas y el
bucket `uniformes` hayan sido preparados.

No se observa en el código actual un sistema de pago, chat, pedidos,
reservas o entregas. Esas funciones quedan pendientes si hacen parte del
alcance futuro del proyecto.

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos.
