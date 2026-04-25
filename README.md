# Library Frontend

Interfaz web para la Library API. HTML + CSS + JS puro con Bootstrap 5.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Estructura | HTML5 |
| Estilos | CSS3 + Bootstrap 5 (CDN) |
| Lógica | JavaScript ES Modules (sin framework) |
| Iconos | Bootstrap Icons (CDN) |
| Despliegue | Vercel (sitio estático) |

---

## Páginas

| Archivo | Descripción |
|---|---|
| `index.html` | Dashboard + grid de libros con portadas |
| `users.html` | CRUD de usuarios (tabla) |
| `borrows.html` | Préstamos: crear, devolver, filtrar por estado |

---

## Correr en local

### Requisitos previos

- Python 3 instalado (solo para el servidor local)
- El **backend** corriendo en `http://localhost:8000` ([instrucciones aquí](../Administracion_bases_de_datos/README.md))

### Pasos

**1. Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd Administracion_bases_de_datos_front
```

**2. Verificar la URL del backend**

Abre `js/config.js` y confirma que apunta a tu backend local:

```js
export const API_BASE = 'http://localhost:8000/api';
```

**3. Levantar el servidor**

```bash
python serve.py
```

**4. Abrir en el navegador**

```
http://localhost:3000
```

> **Importante:** No abras los archivos `.html` directamente desde el explorador de archivos (`file://`). Los módulos ES de JavaScript requieren un servidor HTTP para funcionar.

---

## Desplegar en Vercel

### Requisitos previos

- Cuenta en [vercel.com](https://vercel.com)
- CLI de Vercel instalada: `npm i -g vercel`
- El backend desplegado en un servidor público (Railway, Render, etc.)

### Pasos

**1. Cambiar la URL del backend**

Edita `js/config.js` con la URL de tu backend en producción:

```js
export const API_BASE = 'https://tu-backend.railway.app/api';
```

**2. Asegurarte de que el backend tiene CORS abierto**

En `settings.py` del backend debe estar:

```python
CORS_ALLOW_ALL_ORIGINS = True
```

O, para mayor seguridad, restringir solo al dominio de Vercel:

```python
CORS_ALLOWED_ORIGINS = [
    'https://tu-proyecto.vercel.app',
]
```

**3. Desplegar**

```bash
vercel
```

Sigue las instrucciones en pantalla:
- ¿Vincular a proyecto existente? → No (primera vez)
- Directorio raíz → `.` (el actual)
- Framework → Other

Al terminar obtienes una URL como `https://tu-proyecto.vercel.app`.

**4. Despliegues futuros**

Cada `git push` al repositorio conectado actualiza el despliegue automáticamente si enlazas el repo desde el dashboard de Vercel.

---

## Estructura del proyecto

```
library_frontend/
├── index.html          → Dashboard + libros
├── users.html          → Usuarios
├── borrows.html        → Préstamos
├── vercel.json         → Configuración de Vercel
├── serve.py            → Servidor local (Python)
├── css/
│   └── style.css       → Estilos globales y sidebar
└── js/
    ├── config.js       → URL base de la API (cambiar para producción)
    ├── api.js          → Todas las llamadas fetch al backend
    ├── books.js        → Lógica de la página de libros
    ├── users.js        → Lógica de la página de usuarios
    └── borrows.js      → Lógica de la página de préstamos
```

---

## Variables de configuración

| Archivo | Variable | Descripción |
|---|---|---|
| `js/config.js` | `API_BASE` | URL base del backend (`/api` incluido) |
