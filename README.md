# Benjamín González · Portfolio

Diseño y desarrollo web para negocios locales. Una selección de proyectos con sus resultados, decisiones de interfaz y detalles de construcción.

[Visitar el portfolio](https://benjagc.github.io/Portafolio/)

## Diseño

Una dirección editorial clara: fondo neutral, tipografía Manrope, acento rojo y capturas reales de los proyectos. La foto de presentación corresponde al avatar público de [BenjaGC](https://github.com/BenjaGC).

Proyectos incluidos: Veredicto IA (proyecto propio), Iguana Journal (editorial interactivo) y TecnoCommerce (demo de e-commerce).

## Desarrollo local

Sitio estático en HTML, CSS y JavaScript. No necesita instalación de dependencias ni compilación.

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8765/`. GitHub Pages puede servir los archivos directamente desde la raíz de la rama publicada.

## Estructura

- `index.html`: contenido, servicios, proyectos y contacto.
- `css/style.css`: paleta clara/oscura, composición y adaptación móvil.
- `js/main.js`: navegación, pestañas accesibles, tema y preparación de correo.
- `img/`: capturas, retrato, favicon e imagen social.
- `fonts/`: Manrope autoalojada y licencia SIL Open Font License.

## Interacciones y accesibilidad

- Menú móvil con estado cerrado fuera del recorrido de foco, cierre con Escape y regreso al botón.
- Casos con pestañas navegables con flechas, Home y End. Sin JavaScript, las explicaciones siguen disponibles dentro de los desplegables.
- Tema claro por defecto, oscuro opcional y preferencia guardada localmente.
- Movimiento reducido respetado, foco visible y enlace para saltar al contenido.
- Capturas con dimensiones reservadas y WebP; carga prioritaria del proyecto de portada.
- Se conservan los destinos `#trabajo`, `#servicios`, `#proceso`, `#stack` y `#contacto`.

## Contacto

El correo directo está disponible sin JavaScript. El formulario opcional **prepara un borrador**, no envía mensajes al servidor. Permite abrir una aplicación de correo o copiar el mensaje. No almacena el contenido del formulario. El único dato persistido por el sitio es la preferencia de tema.

## Actualización de contenido

Editar textos y enlaces en `index.html`. Mantener la distinción entre proyectos propios, demos y trabajos para clientes. Revisar alcance y condiciones antes de cambiar la oferta comercial. Al sustituir imágenes, actualizar sus dimensiones y textos alternativos.
