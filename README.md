# Visualizador SCORM LMS 🎓

Una aplicación web interactiva desarrollada con **Streamlit** para previsualizar, explorar y ejecutar paquetes educativos **SCORM (1.2 y 2004 4th Edition)** y contenidos web HTML5 interactivos directamente en el navegador, sin necesidad de instalar un LMS complejo (como Moodle o Blackboard).

---

## 🚀 Características

- **Visualizador SCORM LMS integrado:** Ejecuta actividades interactivas, ejercicios de arrastrar y soltar (*drag & drop*), grabaciones y reproducción de audios sin bloqueos de seguridad locales.
- **Curso de demostración precargado:** Incluye el objeto de aprendizaje interactivo del SENA (*English Dot Works Nivel 5 - Welcome Home Party*).
- **Carga de paquetes `.ZIP`:** Cualquier usuario puede arrastrar y soltar su propio archivo `.zip` exportado desde Moodle, Articulate Storyline, Adobe Captivate, iSpring, SENA, etc.
- **Lector automático de manifiesto (`imsmanifest.xml`):** Identifica el título, nivel, lección, estándar SCORM y archivo de inicio automáticamente.
- **Modo pantalla completa:** Botón directo para abrir el contenido en una pestaña independiente.
- **100% compatible con Streamlit Community Cloud:** Utiliza el servidor nativo de archivos estáticos de Streamlit con soporte CORS, garantizando que funcione en la nube sin problemas de puertos ni URLs mixtas (HTTPS).

---

## ☁️ Despliegue en Streamlit Community Cloud

Para publicarlo gratis en internet para que cualquiera pueda usarlo:

1. **Repositorio en GitHub:**
   - Este proyecto está alojado en: [https://github.com/DavidAgr5421/SenaSCORM](https://github.com/DavidAgr5421/SenaSCORM)
2. **Conectar con Streamlit:**
   - Entra en [share.streamlit.io](https://share.streamlit.io) e inicia sesión con tu cuenta de GitHub.
   - Haz clic en **"New app"**.
   - Selecciona el repositorio `DavidAgr5421/SenaSCORM`, la rama `main` y en *Main file path* pon: `app.py`.
   - Haz clic en **"Deploy"**.
3. **¡Listo!**
   - Streamlit generará una URL pública para que cualquier persona pueda visualizar estos cursos.

---

## 💻 Ejecución en local

### Opción A (Recomendada en Windows):
Haz doble clic sobre el archivo `iniciar_streamlit.bat`.

### Opción B (Terminal / Consola):
1. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
2. Ejecuta la aplicación:
   ```bash
   streamlit run app.py
   ```
3. Tu navegador abrirá automáticamente `http://localhost:8501`.

---

## 📁 Estructura del Proyecto

```text
├── .streamlit/
│   └── config.toml          # Habilita enableStaticServing para servir SCORM
├── static/
│   ├── courses/             # Cursos precargados (ej. muestra SENA Nivel 5)
│   └── uploads/             # Directorio para paquetes .zip subidos por usuarios
├── app.py                   # Aplicación principal de Streamlit
├── requirements.txt         # Dependencias para Streamlit Cloud
├── iniciar_streamlit.bat    # Lanzador con un clic para Windows
└── README.md
```
