---
title: Visualizador SCORM LMS SENA
emoji: 📦
colorFrom: green
colorTo: green
sdk: static
pinned: false
---

# Visualizador SCORM LMS SENA (Estatico 100% Gratuito)

Plataforma web estatica de alto rendimiento para reproducir, examinar y validar paquetes educativos **SCORM (1.2 y 2004 4th Edition)** y recursos HTML5 interactivos directamente en el navegador, **sin costo, sin backend y sin consumir almacenamiento en servidores**.

---

## Caracteristicas

- **100% Estatico y Gratuito:** Compatible con Hugging Face Spaces (`sdk: static`), GitHub Pages, Vercel o Netlify.
- **Descompresion en memoria con Service Worker:** El usuario arrastra un archivo `.zip` y la libreria `JSZip` junto con un Service Worker sirven todos los recursos (audios, scripts, JSON, XML) directamente desde la memoria RAM del navegador.
- **Cero consumo de almacenamiento:** No se guarda ningun archivo en el servidor.
- **Curso integrado de muestra:** Incluye el objeto de aprendizaje del SENA (*English Dot Works Nivel 5 - Welcome Home Party*).
- **Lector automatico de manifiesto (`imsmanifest.xml`):** Extrae organizacion, version SCORM, titulo y jerarquia de lecciones en tiempo real mediante el DOMParser del navegador.
- **Diseño institucional SENA:** Paleta minimalista verde (#39A900, #007832) y blanco, panel lateral oscuro (#0A2421), sin emojis.

---

## Como publicar en Hugging Face Spaces (Gratis)

1. Entra a [huggingface.co/spaces](https://huggingface.co/spaces) y haz clic en **"Create new Space"**.
2. Asigna un nombre al Space (ejemplo: `sena-scorm-viewer`).
3. En **Space SDK**, selecciona **Static** (es 100% gratuito).
4. Elige visibilidad **Public**.
5. Conecta tu repositorio de GitHub `DavidAgr5421/SenaSCORM` (o haz `git push` a la URL del Space).
6. ¡Listo! Al ser estatico, Hugging Face lo desplegara en 5 segundos sin necesidad de compilar Docker ni pagar nada.

---

## Ejecucion en local

Simplemente puedes usar cualquier servidor HTTP local simple:

```bash
python -m http.server 8000
```
Y abre en tu navegador: `http://localhost:8000`
