# EVO Solutions+ · Landing page

Landing page simple en HTML, CSS y JavaScript puro (sin frameworks ni build).
Inglés por defecto, con botón para pasar a español. Todo el contacto va a WhatsApp.

## Cómo verla en tu computadora

El JavaScript usa módulos (`import`/`export`), y los navegadores **no los cargan si abrís
`index.html` con doble clic**. Usá un servidor local:

- **VS Code:** instalá la extensión *Live Server*, clic derecho en `index.html` → *Open with Live Server*.
- **Terminal:** `python3 -m http.server 8000` y abrí http://localhost:8000

En GitHub Pages funciona directo.

## Estructura

```
evo-landing/
├── index.html
├── css/
│   ├── variables.css    colores, fuentes y espacios (se cambian acá)
│   ├── reset.css        normaliza estilos entre navegadores
│   ├── base.css         estilos de body, títulos, links, accesibilidad
│   ├── layout.css       contenedores, secciones y grillas
│   ├── components.css   botones, navbar, cards de servicio, formulario, footer
│   ├── chat.css         widget de chat
│   └── responsive.css   ajustes para pantallas grandes (mobile first)
├── js/
│   ├── main.js          punto de entrada
│   ├── config.js        número de WhatsApp e idioma inicial
│   ├── translations.js  TODOS los textos en EN y ES (incluye los del bot)
│   ├── i18n.js          cambio de idioma
│   ├── navbar.js        menú móvil
│   ├── chat.js          lógica del widget de chat
│   ├── chat-flow.js     preguntas y opciones del bot
│   ├── form.js          validación del formulario → WhatsApp
│   └── whatsapp.js      arma los links de WhatsApp
└── assets/
    ├── icons/favicon.svg
    └── images/
        ├── hero.jpg     imagen del hero (ilustración propia, exportada de hero.svg)
        └── hero.svg     fuente vectorial de la escena
```

## Qué editar

| Quiero cambiar…                     | Archivo                     |
|-------------------------------------|-----------------------------|
| El número de WhatsApp               | `js/config.js`              |
| Cualquier texto (web o bot)         | `js/translations.js`        |
| Las preguntas del bot               | `js/chat-flow.js` + textos en `translations.js` |
| Colores, tipografías, espacios      | `css/variables.css`         |
| La foto del hero                    | `assets/images/hero.jpg`    |
| Posición o tamaño del rombo         | `css/components.css` → `.hero__media` (`--orb-x`, `--orb-y`, `--orb-size`) |
| Email, Instagram o ciudad           | `index.html` (sección Contacto) |

## Cómo funciona

- Cada texto del HTML lleva `data-i18n="clave"`. `i18n.js` lo reemplaza con el idioma elegido, que se recuerda en el navegador.
- Los botones "Ask about this" de cada servicio abren el chat con ese servicio ya elegido.
- El bot y el formulario no necesitan servidor: al final abren `wa.me/NUMERO?text=...` con el mensaje ya escrito.
- Para sumar un idioma: agregá un bloque en `translations.js` y un botón con `data-lang-option="xx"` en el header.

## Imagen del hero y rombo interactivo

- `assets/images/hero.svg` es una **ilustración propia** (pasillo de servidores con un técnico a contraluz, en los colores de la marca).
  `hero.jpg` es la misma escena exportada para la web. Si más adelante tienen una foto real del equipo, alcanza con reemplazar `hero.jpg`
  (ideal ~1600 px de ancho, JPG o WebP, menos de 300 KB, y con el mismo formato ~1,13:1 para no tocar nada más).
- El rombo es un botón real (`<button>`): al pasar el cursor o enfocarlo con el teclado muestra el saludo, y al hacer clic abre el chat.
  En pantallas táctiles el saludo queda visible siempre, porque no existe el hover.
- Si la imagen cambia de encuadre, se mueve el rombo con `--orb-x`, `--orb-y` y `--orb-size` en `css/components.css` (`.hero__media`).
- El movimiento de subir y bajar se desactiva si la persona tiene activado "reducir movimiento" en su dispositivo.
