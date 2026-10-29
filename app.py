import streamlit as st
import os
import zipfile
import hashlib
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

# Configuración de la página
st.set_page_config(
    page_title="Visualizador SCORM LMS",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilos CSS modernos
st.markdown("""
<style>
    .scorm-header {
        background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
        padding: 24px 30px;
        border-radius: 12px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
    }
    .scorm-header h1 {
        color: white !important;
        font-size: 2.2rem;
        font-weight: 800;
        margin: 0 0 8px 0;
    }
    .scorm-header p {
        color: #E0E7FF !important;
        font-size: 1.05rem;
        margin: 0;
    }
    .scorm-badge {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
        background-color: #EEF2FF;
        color: #1E40AF;
        margin-right: 8px;
    }
    .metric-box {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 14px 18px;
        margin-bottom: 15px;
    }
    .metric-label {
        font-size: 0.8rem;
        color: #64748B;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
    .metric-val {
        font-size: 1.15rem;
        font-weight: 700;
        color: #0F172A;
        margin-top: 4px;
    }
    .fullscreen-btn {
        display: inline-block;
        width: 100%;
        text-align: center;
        background-color: #2563EB;
        color: white !important;
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none !important;
        transition: background-color 0.2s;
        margin-top: 10px;
    }
    .fullscreen-btn:hover {
        background-color: #1D4ED8;
    }
    .iframe-container {
        width: 100%;
        background-color: #FFFFFF;
        border: 1px solid #CBD5E1;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
</style>
""", unsafe_allow_html=True)

# Rutas base
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
COURSES_DIR = STATIC_DIR / "courses"
UPLOADS_DIR = STATIC_DIR / "uploads"

# Asegurar directorios
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
COURSES_DIR.mkdir(parents=True, exist_ok=True)


def parse_manifest_info(manifest_path: Path):
    """Extrae metadatos jerárquicos y archivo de entrada de un imsmanifest.xml."""
    info = {
        "is_scorm": False,
        "title": "Curso Interactivo HTML5",
        "version": "Contenido Web",
        "organization": "Estándar",
        "hierarchy": [],
        "entry_file": "index.html"
    }

    if not manifest_path.exists():
        return info

    try:
        tree = ET.parse(manifest_path)
        root = tree.getroot()
        info["is_scorm"] = True

        # Versión del esquema SCORM
        for elem in root.iter():
            if elem.tag.endswith("schemaversion") and elem.text:
                info["version"] = f"SCORM {elem.text.strip()}"
                break

        # Título de la organización
        for org in root.iter():
            if org.tag.endswith("organization"):
                title_elem = org.find("./{*}title")
                if title_elem is not None and title_elem.text:
                    info["organization"] = title_elem.text.strip()
                break

        # Títulos de ítems/lecciones
        titles = []
        for elem in root.iter():
            if elem.tag.endswith("title") and elem.text:
                t = elem.text.strip()
                if t and t not in titles:
                    titles.append(t)
        if titles:
            info["hierarchy"] = titles
            info["title"] = titles[-1]

        # Archivo de inicio del recurso principal
        for resource in root.iter():
            if resource.tag.endswith("resource"):
                href = resource.attrib.get("href")
                if href:
                    info["entry_file"] = href
                    break
    except Exception:
        pass

    return info


def find_course_root_and_entry(extracted_dir: Path):
    """Detecta la carpeta raíz real del curso (manejando carpetas anidadas en el zip) y el archivo de entrada."""
    # Buscar imsmanifest.xml primero
    manifests = list(extracted_dir.rglob("imsmanifest.xml"))
    if manifests:
        course_root = manifests[0].parent
        manifest_info = parse_manifest_info(manifests[0])
        entry_file = manifest_info["entry_file"]
        if (course_root / entry_file).exists():
            return course_root, entry_file, manifest_info

    # Si no hay manifest o el href no existe, buscar archivos html comunes
    common_entries = [
        "index.html", "index_lms.html", "story.html", 
        "launcher.html", "player.html", "default.html", "presentation.html"
    ]
    for root, _, files in os.walk(extracted_dir):
        root_path = Path(root)
        for cand in common_entries:
            if cand in files:
                m_info = parse_manifest_info(root_path / "imsmanifest.xml")
                m_info["entry_file"] = cand
                return root_path, cand, m_info

    # Fallback al primer archivo html encontrado
    html_files = list(extracted_dir.rglob("*.html"))
    if html_files:
        chosen = html_files[0]
        return chosen.parent, chosen.name, parse_manifest_info(chosen.parent / "imsmanifest.xml")

    return extracted_dir, "index.html", parse_manifest_info(extracted_dir / "imsmanifest.xml")


# --- BARRA LATERAL (SIDEBAR) ---
with st.sidebar:
    st.markdown("### 🎓 **Visualizador SCORM LMS**")
    st.caption("Herramienta en la nube para probar y explorar contenidos e-learning.")

    mode = st.radio(
        "Seleccionar contenido:",
        ["📚 Curso de muestra (SENA Inglés Nivel 5)", "📦 Subir archivo SCORM (.ZIP)"],
        index=0
    )

    current_course_dir = None
    entry_filename = "index.html"
    course_info = {}

    if mode == "📚 Curso de muestra (SENA Inglés Nivel 5)":
        sample_path = COURSES_DIR / "sena_eng_n5"
        current_course_dir = sample_path
        course_info = parse_manifest_info(sample_path / "imsmanifest.xml")
        entry_filename = course_info["entry_file"]

    else:
        uploaded_zip = st.file_uploader(
            "Carga un paquete SCORM comprimido (.zip):", 
            type=["zip"],
            help="Sube cualquier paquete exportado en formato SCORM 1.2 o 2004 (Moodle, Storyline, Captivate, etc.)"
        )
        if uploaded_zip is not None:
            # Hash del archivo para crear una carpeta única
            file_bytes = uploaded_zip.getvalue()
            file_hash = hashlib.md5(file_bytes).hexdigest()[:10]
            target_extract = UPLOADS_DIR / file_hash

            if not target_extract.exists():
                with st.spinner("Descomprimiendo y procesando paquete..."):
                    target_extract.mkdir(parents=True, exist_ok=True)
                    zip_path = target_extract / "upload.zip"
                    with open(zip_path, "wb") as f:
                        f.write(file_bytes)
                    with zipfile.ZipFile(zip_path, "r") as z:
                        z.extractall(target_extract)
                    if zip_path.exists():
                        zip_path.unlink()

            course_root, entry_filename, course_info = find_course_root_and_entry(target_extract)
            current_course_dir = course_root
            st.success("✅ Paquete cargado con éxito")
        else:
            st.info("Sube un archivo .zip para previsualizarlo aquí.")
            # Fallback al curso de muestra para no dejar la vista vacía
            sample_path = COURSES_DIR / "sena_eng_n5"
            current_course_dir = sample_path
            course_info = parse_manifest_info(sample_path / "imsmanifest.xml")
            entry_filename = course_info["entry_file"]

    st.markdown("---")
    st.markdown("### 📋 **Ficha Técnica**")
    st.markdown(f"<span class='scorm-badge'>{course_info.get('version', 'HTML5')}</span>", unsafe_allow_html=True)
    st.markdown(f"**Organización:** {course_info.get('organization', 'General')}")
    st.markdown(f"**Archivo de inicio:** `/{entry_filename}`")

    if course_info.get("hierarchy"):
        with st.expander("Estructura de la lección", expanded=False):
            for i, step in enumerate(course_info["hierarchy"]):
                st.markdown(f"• **{step}**")

    st.markdown("---")
    st.markdown("### 🖥️ **Ajustes de visualización**")
    viewer_height = st.slider("Altura del visor (px):", min_value=600, max_value=1200, value=820, step=20)

    # Calcular ruta relativa para el endpoint estático de Streamlit (/app/static/...)
    relative_to_static = current_course_dir.relative_to(STATIC_DIR).as_posix()
    public_url = f"/app/static/{relative_to_static}/{entry_filename}"

    st.markdown(
        f'<a href="{public_url}" target="_blank" class="fullscreen-btn">↗️ Abrir a pantalla completa</a>', 
        unsafe_allow_html=True
    )

    if st.button("🔄 Recargar curso", use_container_width=True):
        st.rerun()

    with st.expander("☁️ ¿Cómo subir a Streamlit Community Cloud?"):
        st.markdown("""
        1. Sube este repositorio a tu cuenta de **GitHub**.
        2. Ve a [share.streamlit.io](https://share.streamlit.io) e inicia sesión con GitHub.
        3. Selecciona tu repositorio y la rama principal (`main`).
        4. Haz clic en **Deploy**. ¡Tu visualizador estará disponible en la web para todo el mundo!
        """)


# --- ENCABEZADO PRINCIPAL ---
st.markdown(f"""
<div class="scorm-header">
    <h1>Visualizador SCORM LMS</h1>
    <p>Plataforma en la nube para visualizar, explorar y validar paquetes interactivos SCORM y contenidos web HTML5.</p>
</div>
""", unsafe_allow_html=True)

# --- TARJETAS INFORMATIVAS ---
c1, c2, c3, c4 = st.columns(4)
with c1:
    st.markdown(f"""
    <div class="metric-box">
        <div class="metric-label">Título del Curso</div>
        <div class="metric-val">{course_info.get('title', 'Lección Activa')}</div>
    </div>
    """, unsafe_allow_html=True)

with c2:
    st.markdown(f"""
    <div class="metric-box">
        <div class="metric-label">Estándar Detectado</div>
        <div class="metric-val">{course_info.get('version', 'Web')}</div>
    </div>
    """, unsafe_allow_html=True)

with c3:
    st.markdown(f"""
    <div class="metric-box">
        <div class="metric-label">Archivo Principal</div>
        <div class="metric-val"><code>{entry_filename}</code></div>
    </div>
    """, unsafe_allow_html=True)

with c4:
    st.markdown(f"""
    <div class="metric-box">
        <div class="metric-label">Estado de Ejecución</div>
        <div class="metric-val" style="color: #16A34A;">● En línea / Activo</div>
    </div>
    """, unsafe_allow_html=True)


# --- VISOR INTERACTIVO ---
iframe_markup = f"""
<div class="iframe-container">
    <iframe 
        src="{public_url}" 
        width="100%" 
        height="{viewer_height}px" 
        style="border: none; display: block;" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone" 
        allowfullscreen>
    </iframe>
</div>
"""

st.html(iframe_markup)

st.caption("🔒 Todas las peticiones AJAX, sonidos, imágenes y estilos se sirven directamente a través de Streamlit de forma segura, garantizando compatibilidad total tanto en local como en la nube.")
