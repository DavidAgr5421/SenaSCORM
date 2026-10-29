import streamlit as st
import os
import zipfile
import hashlib
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

# Configuracion de pagina
st.set_page_config(
    page_title="Visualizador SCORM LMS SENA",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilos minimalistas en verde y blanco (sin emojis)
st.markdown("""
<style>
    :root {
        --sena-green: #39A900;
        --sena-dark: #007832;
        --sena-light: #F4F9F4;
        --border-color: #E2ECE4;
        --text-dark: #1E293B;
        --text-muted: #64748B;
    }

    /* Cabecera principal */
    .header-container {
        border-bottom: 2px solid var(--sena-green);
        padding-bottom: 12px;
        margin-bottom: 24px;
    }
    .header-title {
        font-size: 2rem;
        font-weight: 800;
        color: var(--sena-dark);
        margin: 0;
        letter-spacing: -0.5px;
    }
    .header-subtitle {
        font-size: 1rem;
        color: var(--text-muted);
        margin-top: 4px;
        margin-bottom: 0;
    }

    /* Titulos de secciones */
    .section-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-dark);
        border-left: 4px solid var(--sena-green);
        padding-left: 10px;
        margin-top: 20px;
        margin-bottom: 14px;
    }

    /* Tarjetas de estado y metricas */
    .info-card {
        background-color: var(--sena-light);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 12px;
    }
    .info-card-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--sena-dark);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .info-card-value {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-dark);
        margin-top: 3px;
    }

    /* Boton de pantalla completa */
    .btn-fullscreen {
        display: inline-block;
        background-color: var(--sena-green);
        color: #FFFFFF !important;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 600;
        text-decoration: none !important;
        text-align: center;
        border: 1px solid var(--sena-dark);
    }
    .btn-fullscreen:hover {
        background-color: var(--sena-dark);
        color: #FFFFFF !important;
    }

    /* Visor */
    .viewer-frame-container {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: #FFFFFF;
        overflow: hidden;
        margin-top: 10px;
    }

    /* Barra lateral */
    [data-testid="stSidebar"] {
        background-color: #FAFCFA;
        border-right: 1px solid var(--border-color);
    }
</style>
""", unsafe_allow_html=True)

# Rutas base
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
COURSES_DIR = STATIC_DIR / "courses"
UPLOADS_DIR = STATIC_DIR / "uploads"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
COURSES_DIR.mkdir(parents=True, exist_ok=True)


def parse_manifest_info(manifest_path: Path):
    """Extrae metadatos del archivo imsmanifest.xml sin usar emojis."""
    info = {
        "is_scorm": False,
        "title": "Contenido educativo interactivo",
        "version": "Contenido Web",
        "organization": "SENA",
        "hierarchy": [],
        "entry_file": "index.html"
    }

    if not manifest_path.exists():
        return info

    try:
        tree = ET.parse(manifest_path)
        root = tree.getroot()
        info["is_scorm"] = True

        for elem in root.iter():
            if elem.tag.endswith("schemaversion") and elem.text:
                info["version"] = f"SCORM {elem.text.strip()}"
                break

        for org in root.iter():
            if org.tag.endswith("organization"):
                title_elem = org.find("./{*}title")
                if title_elem is not None and title_elem.text:
                    info["organization"] = title_elem.text.strip()
                break

        titles = []
        for elem in root.iter():
            if elem.tag.endswith("title") and elem.text:
                t = elem.text.strip()
                if t and t not in titles:
                    titles.append(t)
        if titles:
            info["hierarchy"] = titles
            info["title"] = titles[-1]

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
    """Detecta la carpeta raiz real del curso y el archivo inicial ejecutable."""
    manifests = list(extracted_dir.rglob("imsmanifest.xml"))
    if manifests:
        course_root = manifests[0].parent
        manifest_info = parse_manifest_info(manifests[0])
        entry_file = manifest_info["entry_file"]
        if (course_root / entry_file).exists():
            return course_root, entry_file, manifest_info

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

    html_files = list(extracted_dir.rglob("*.html"))
    if html_files:
        chosen = html_files[0]
        return chosen.parent, chosen.name, parse_manifest_info(chosen.parent / "imsmanifest.xml")

    return extracted_dir, "index.html", parse_manifest_info(extracted_dir / "imsmanifest.xml")


# --- CABECERA PRINCIPAL ---
st.markdown("""
<div class="header-container">
    <div class="header-title">Visualizador SCORM LMS SENA</div>
    <div class="header-subtitle">Plataforma web para reproducir, examinar y validar paquetes de contenido interactivo SCORM y recursos HTML5.</div>
</div>
""", unsafe_allow_html=True)


# --- SECCION 1: SUBIR TU ARCHIVO ---
st.markdown('<div class="section-title">Subir tu archivo</div>', unsafe_allow_html=True)

col_upload, col_source = st.columns([3, 2])

with col_upload:
    uploaded_zip = st.file_uploader(
        "Selecciona o arrastra tu archivo comprimido (.zip):",
        type=["zip"],
        help="Admite paquetes en formato SCORM 1.2, SCORM 2004 o paquetes HTML5 comprimidos."
    )

with col_source:
    use_sample = st.checkbox(
        "Usar curso de muestra integrado (SENA Ingles Nivel 5)",
        value=(uploaded_zip is None),
        help="Activalo si no dispones de un archivo propio para probar de inmediato la plataforma."
    )

# Resolucion del contenido activo
current_course_dir = None
entry_filename = "index.html"
course_info = {}

sample_path = COURSES_DIR / "sena_eng_n5"

if uploaded_zip is not None:
    file_bytes = uploaded_zip.getvalue()
    file_hash = hashlib.md5(file_bytes).hexdigest()[:10]
    target_extract = UPLOADS_DIR / file_hash

    if not target_extract.exists():
        with st.spinner("Descomprimiendo y validando estructura del paquete..."):
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
    st.success(f"Archivo cargado correctamente: {uploaded_zip.name}")

elif use_sample and sample_path.exists():
    current_course_dir = sample_path
    course_info = parse_manifest_info(sample_path / "imsmanifest.xml")
    entry_filename = course_info["entry_file"]
    st.info("Visualizando el curso de muestra integrado.")

else:
    st.warning("Por favor sube un archivo .zip o selecciona la casilla de curso de muestra.")
    current_course_dir = sample_path
    course_info = parse_manifest_info(sample_path / "imsmanifest.xml")
    entry_filename = course_info["entry_file"]


# Ruta relativa al servidor estatico
relative_to_static = current_course_dir.relative_to(STATIC_DIR).as_posix()
public_url = f"/app/static/{relative_to_static}/{entry_filename}"


# --- SECCION 2: VISUALIZACION ---
st.markdown('<div class="section-title">Visualizacion</div>', unsafe_allow_html=True)

# Controles de como se vera la aplicacion
ctrl_col1, ctrl_col2, ctrl_col3 = st.columns([2, 1, 1])

with ctrl_col1:
    viewer_height = st.slider(
        "Altura del visor (pixeles):",
        min_value=600,
        max_value=1200,
        value=820,
        step=20,
        help="Ajusta la altura del marco segun las dimensiones de tu pantalla."
    )

with ctrl_col2:
    st.markdown('<div style="height: 28px;"></div>', unsafe_allow_html=True)
    st.markdown(
        f'<a href="{public_url}" target="_blank" class="btn-fullscreen">Pantalla completa</a>',
        unsafe_allow_html=True
    )

with ctrl_col3:
    st.markdown('<div style="height: 28px;"></div>', unsafe_allow_html=True)
    if st.button("Reiniciar visor", use_container_width=True):
        st.rerun()

# Incrustacion nativa del iframe (funciona en local y en Streamlit Community Cloud)
st.markdown('<div class="viewer-frame-container">', unsafe_allow_html=True)
if hasattr(st, "iframe"):
    st.iframe(public_url, height=viewer_height)
else:
    import streamlit.components.v1 as components
    components.iframe(public_url, height=viewer_height)
st.markdown('</div>', unsafe_allow_html=True)


# --- BARRA LATERAL (SIDEBAR): SIMPLIFICADA Y SIN EMOJIS ---
with st.sidebar:
    st.markdown("### Informacion del paquete")
    st.caption("Detalles tecnicos detectados en el contenido.")

    st.markdown(f"""
    <div class="info-card">
        <div class="info-card-label">Estandar</div>
        <div class="info-card-value">{course_info.get('version', 'Web')}</div>
    </div>
    <div class="info-card">
        <div class="info-card-label">Organizacion</div>
        <div class="info-card-value">{course_info.get('organization', 'SENA')}</div>
    </div>
    <div class="info-card">
        <div class="info-card-label">Titulo</div>
        <div class="info-card-value">{course_info.get('title', 'Leccion')}</div>
    </div>
    <div class="info-card">
        <div class="info-card-label">Archivo inicial</div>
        <div class="info-card-value">/{entry_filename}</div>
    </div>
    """, unsafe_allow_html=True)

    if course_info.get("hierarchy"):
        with st.expander("Estructura de la leccion", expanded=False):
            for step in course_info["hierarchy"]:
                st.markdown(f"- {step}")

    st.markdown("---")
    st.markdown("### Ayuda de despliegue")
    with st.expander("Publicar en la nube", expanded=False):
        st.markdown("""
        1. Confirma los cambios en el repositorio de GitHub.
        2. Ingresa a share.streamlit.io.
        3. Conecta el repositorio DavidAgr5421/SenaSCORM.
        4. Selecciona app.py y presiona Deploy.
        """)
