---
title: Visualizador SCORM LMS SENA
emoji: 📦
colorFrom: green
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Visualizador SCORM LMS SENA

Aplicacion web de alto rendimiento basada en Python y Docker para reproducir, examinar y validar paquetes educativos **SCORM (1.2 y 2004 4th Edition)** y recursos HTML5 interactivos directamente en el navegador.

---

## Caracteristicas

- **Servidor nativo sin bloqueos de sandbox:** Reproduce actividades interactivas, grabaciones de voz, reproduccion de audio HTML5 y ejercicios de arrastrar y soltar (*drag & drop*) sin restricciones de iframe ni dependencias de proxies.
- **Carga dinamica de paquetes .ZIP:** Zona interactiva de arrastre y soltado para cargar cualquier archivo comprimido exportado desde LMS, SENA, Articulate Storyline, Adobe Captivate, iSpring o Moodle.
- **Lector automatico de manifiesto (`imsmanifest.xml`):** Extrae organizacion, version/estandar SCORM, titulo, jerarquia de temas y archivo de entrada automaticamente.
- **Curso integrado de muestra:** Incluye el objeto de aprendizaje del SENA (*English Dot Works Nivel 5 - Welcome Home Party*).
- **Parches web automaticos:** Neutraliza automaticamente llamadas a consolas silenciadas o verificaciones cross-origin en navegadores modernos.
- **Estilo minimalista SENA:** Paleta institucional verde (#39A900, #007832) y blanco, panel lateral oscuro (#0A2421) y sin emojis.

---

## Despliegue en Hugging Face Spaces (Docker)

1. Entra en [Hugging Face Spaces](https://huggingface.co/spaces) y haz clic en **"Create new Space"**.
2. Asigna un nombre al Space (ejemplo: `sena-scorm-viewer`).
3. En **Space SDK**, selecciona **Docker** (Blank).
4. Elige visibilidad **Public**.
5. Conecta tu repositorio de GitHub `DavidAgr5421/SenaSCORM` o haz `git push` a la URL del Space.
6. ¡Listo! Hugging Face compilara el contenedor Docker y abrira la aplicacion en el puerto `7860` con certificado HTTPS publico.

---

## Ejecucion en local

### Con Python:
```bash
pip install -r requirements.txt
python -m uvicorn main:app --port 7860 --reload
```
Abre en tu navegador: `http://localhost:7860`

### Con Docker:
```bash
docker build -t sena-scorm .
docker run -p 7860:7860 sena-scorm
```
Abre en tu navegador: `http://localhost:7860`
