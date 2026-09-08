# Manual de usuario de DonayViste

DonayViste es una plataforma para comprar, vender y donar uniformes escolares en buen estado. La aplicación permite publicar prendas, consultar el catálogo y administrar las publicaciones desde el perfil.

## 1. Acceso a la aplicación

Hay dos copias funcionales del proyecto:

- `28-07`
- `DONA Y VISTE`

Ambas utilizan React, Vite y Supabase. Para iniciar una copia:

```bash
cd "28-07"
npm install
npm run dev
```

También se puede sustituir `28-07` por `DONA Y VISTE`.

La aplicación necesita un archivo `.env` dentro de la carpeta elegida con estas variables:

```env
VITE_SUPABASE_URL=URL_DE_TU_PROYECTO_SUPABASE
VITE_SUPABASE_ANON_KEY=CLAVE_ANONIMA_DE_TU_PROYECTO
```

La base de datos debe tener aplicadas las migraciones de la carpeta `supabase/migrations` y debe existir el bucket de Storage `uniformes`.

## 2. Crear una cuenta

1. Selecciona **Crear cuenta**.
2. Escribe nombre, apellido, correo y contraseña.
3. Confirma que las contraseñas coincidan.
4. Envía el formulario.
5. Abre el enlace recibido por correo para confirmar la cuenta.
6. Regresa a **Iniciar sesión**.

La contraseña debe tener al menos seis caracteres.

## 3. Iniciar sesión y recuperar contraseña

Para iniciar sesión, escribe el correo confirmado y la contraseña. Desde el mismo formulario puedes seleccionar **¿Olvidaste tu contraseña?**.

Para recuperar el acceso:

1. Escribe el correo de la cuenta.
2. Selecciona **Enviar enlace**.
3. Abre el enlace seguro recibido.
4. Escribe y confirma la nueva contraseña.

## 4. Comprar un uniforme

1. Entra en **Comprar**.
2. Usa el buscador para localizar una prenda por título o descripción.
3. Filtra por talla, categoría o condición.
4. Ordena los resultados por fecha o precio.
5. Selecciona una tarjeta para ver el detalle.
6. Revisa precio, talla, estado, descripción y contacto.
7. Usa el botón de contacto para escribir al correo o llamar al teléfono publicado.

La plataforma no procesa pagos dentro de la aplicación. La coordinación de la compra se realiza con el contacto indicado por quien publicó la prenda.

## 5. Consultar o solicitar una donación

1. Entra en **Donaciones**.
2. Busca por texto o filtra por talla y condición.
3. Abre la publicación que te interese.
4. Revisa la información de entrega.
5. Contacta a la persona donante mediante el dato publicado.

Las publicaciones de donación aparecen con precio **Gratis**.

## 6. Publicar una venta

1. Inicia sesión.
2. Selecciona **Vender**.
3. Completa título, precio, talla, categoría, condición y descripción.
4. Añade un medio de contacto.
5. Selecciona hasta cinco imágenes JPG, PNG o WebP.
6. Comprueba la vista previa.
7. Selecciona **Publicar**.

Cada imagen puede pesar como máximo 5 MB. La cantidad disponible debe ser un número entero mayor que cero.

## 7. Publicar una donación

1. Inicia sesión.
2. Selecciona **Donar** o cambia el formulario de venta a donación.
3. Completa título, talla, categoría, condición y descripción.
4. Añade al menos una fotografía.
5. Añade un medio de contacto para coordinar la entrega.
6. Selecciona **Publicar**.

Las donaciones no requieren precio, pero sí una forma de contacto.

## 8. Administrar el perfil

En **Mi cuenta** puedes:

- Actualizar nombre y apellido.
- Añadir o eliminar una fotografía de perfil.
- Consultar el total de publicaciones, activas y donaciones.
- Editar una publicación propia.
- Pausar o activar una publicación.
- Eliminar una publicación.
- Crear una nueva donación.

La fotografía de perfil debe ser JPG, PNG o WebP y no superar 3 MB.

## 9. Cerrar sesión

Selecciona **Salir** en el menú superior. La sesión se cerrará y la aplicación volverá al inicio.

## 10. Problemas frecuentes

**No puedo iniciar sesión.** Verifica que el correo esté confirmado y que la contraseña sea correcta.

**No aparecen publicaciones.** Revisa los filtros, limpia el buscador o espera a que termine la carga. Solo se muestran publicaciones activas.

**No puedo subir una imagen.** Comprueba el formato y el tamaño máximo. Para publicaciones son 5 MB por imagen; para el perfil son 3 MB.

**No puedo publicar.** Debes iniciar sesión y completar los campos obligatorios. En donaciones también se exige una fotografía y un contacto.

**No recibí el correo de confirmación o recuperación.** Revisa la carpeta de spam y confirma que escribiste correctamente el correo.

## 11. Buenas prácticas

- Publica fotografías claras y actuales.
- Describe honestamente el estado y la talla.
- No compartas contraseñas ni datos sensibles.
- Acuerda precio y entrega por un canal seguro.
- Retira o pausa las publicaciones que ya no estén disponibles.
