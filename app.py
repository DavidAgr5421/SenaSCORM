import streamlit as st
import streamlit.components.v1 as components
import os
import zipfile
import hashlib
import xml.etree.ElementTree as ET
from pathlib import Path

# Configuracion de pagina
st.set_page_config(
    page_title="Visualizador SCORM LMS SENA",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilos: Panel izquierdo en azul oscuro verdoso y centro en blanco y verde minimalista (sin emojis)
st.markdown("""
<style>
    :root {
        --sena-green: #39A900;
        --sena-dark-green: #007832;
        --panel-dark: #0A2421;        /* Tono azul oscuro verde */
        --panel-card: #12332F;        /* Tarjeta en panel oscuro */
        --panel-text: #E5F3EE;        /* Texto claro para panel */
        --panel-muted: #8DB8AD;       /* Texto secundario panel */
        --bg-main: #FFFFFF;
        --border-main: #E2ECE5;
        --text-dark: #1E293B;
        --text-muted: #64748B;
    }

    /* BARRA LATERAL: Tono azul oscuro verde */
    [data-testid="stSidebar"] {
        background-color: var(--panel-dark) !important;
        border-right: 1px solid #143D37;
    }
    [data-testid="stSidebar"] * {
        color: var(--panel-text);
    }
    [data-testid="stSidebar"] .stMarkdown h1,
    [data-testid="stSidebar"] .stMarkdown h2,
    [data-testid="stSidebar"] .stMarkdown h3,
    [data-testid="stSidebar"] .stMarkdown h4 {
        color: #FFFFFF !important;
        font-weight: 700;
    }
    [data-testid="stSidebar"] .sidebar-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: #FFFFFF;
        letter-spacing: -0.3px;
        margin-bottom: 4px;
        border-bottom: 2px solid var(--sena-green);
        padding-bottom: 8px;
    }
    [data-testid="stSidebar"] .sidebar-section-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: #55D418;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 20px;
        margin-bottom: 10px;
    }

    /* Subidor de archivos en la barra lateral */
    [data-testid="stSidebar"] [data-testid="stFileUploader"] {
        background-color: var(--panel-card);
        border: 1px dashed #20554E;
        border-radius: 8px;
        padding: 8px;
    }
    [data-testid="stSidebar"] [data-testid="stFileUploader"] * {
        color: var(--panel-text) !important;
    }

    /* Boton de pantalla completa en barra lateral */
    .btn-fullscreen-sidebar {
        display: block;
        width: 100%;
        background-color: var(--sena-green);
        color: #FFFFFF !important;
        padding: 9px 12px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 700;
        text-decoration: none !important;
        text-align: center;
        border: 1px solid var(--sena-dark-green);
        margin-top: 10px;
        margin-bottom: 6px;
        transition: background-color 0.2s;
    }
    .btn-fullscreen-sidebar:hover {
        background-color: var(--sena-dark-green);
        color: #FFFFFF !important;
    }

    /* Botones primarios */
    [data-testid="stSidebar"] .stButton button {
        background-color: transparent !important;
        color: #FFFFFF !important;
        border: 1px solid #20554E !important;
        font-weight: 600;
    }
    [data-testid="stSidebar"] .stButton button:hover {
        border-color: var(--sena-green) !important;
        background-color: var(--panel-card) !important;
    }

    /* AREA CENTRAL: Blanco y verde minimalista */
    .header-container {
        border-bottom: 2px solid var(--sena-green);
        padding-bottom: 12px;
        margin-bottom: 20px;
    }
    .header-title {
        font-size: 1.9rem;
        font-weight: 800;
        color: var(--sena-dark-green);
        margin: 0;
        letter-spacing: -0.5px;
    }
    .header-subtitle {
        font-size: 0.95rem;
        color: var(--text-muted);
        margin-top: 4px;
        margin-bottom: 0;
    }

    /* Visor */
    .viewer-frame-container {
        border: 1px solid var(--border-main);
        border-radius: 8px;
        background-color: #FFFFFF;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    }

    /* TARJETAS DE INFORMACION COMPACTAS (DERECHA) */
    .info-panel-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--sena-dark-green);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--border-main);
        padding-bottom: 6px;
        margin-bottom: 10px;
    }
    .compact-card {
        background-color: #FBFDFB;
        border: 1px solid var(--border-main);
        border-left: 3px solid var(--sena-green);
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 8px;
    }
    .compact-label {
        font-size: 0.68rem;
        font-weight: 700;
        color: var(--sena-dark-green);
        text-transform: uppercase;
        letter-spacing: 0.4px;
        margin-bottom: 2px;
    }
    .compact-value {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-dark);
        word-break: break-word;
    }
    .structure-item {
        font-size: 0.78rem;
        color: #334155;
        padding: 5px 0;
        border-bottom: 1px dashed var(--border-main);
        line-height: 1.3;
    }
    .structure-item:last-child {
        border-bottom: none;
    }
</style>
""", unsafe_allow_html=True)

# Rutas base seguras
BASE_DIR = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd().resolve()
STATIC_DIR = BASE_DIR / "static"
COURSES_DIR = STATIC_DIR / "courses"
UPLOADS_DIR = STATIC_DIR / "uploads"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
COURSES_DIR.mkdir(parents=True, exist_ok=True)


def parse_manifest_info(manifest_path: Path):
    """Extrae metadatos del archivo imsmanifest.xml sin emojis."""
    info = {
        "is_scorm": False,
        "title": "Contenido interactivo",
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
                    clean_href = href.strip().lstrip("/").lstrip("./")
                    if clean_href:
                        info["entry_file"] = clean_href
                    break
    except Exception:
        pass

    return info


def find_course_root_and_entry(extracted_dir: Path):
    """Detecta la carpeta raiz real del curso y el archivo inicial."""
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


# --- PANEL IZQUIERDO (AZUL OSCURO VERDE): SUBIR ARCHIVO Y VISUALIZACION ---
with st.sidebar:
    st.markdown('<div class="sidebar-title">Configuracion y Carga</div>', unsafe_allow_html=True)

    # Seccion 1: Subir tu archivo
    st.markdown('<div class="sidebar-section-title">Subir tu archivo</div>', unsafe_allow_html=True)
    uploaded_zip = st.file_uploader(
        "Archivo comprimido (.zip):",
        type=["zip"],
        help="Admite paquetes en formato SCORM 1.2, SCORM 2004 o HTML5 comprimidos."
    )

    use_sample = st.checkbox(
        "Usar curso de muestra integrado",
        value=(uploaded_zip is None),
        help="Permite explorar la plataforma con el objeto de aprendizaje del SENA."
    )

    # Seccion 2: Visualizacion
    st.markdown('<div class="sidebar-section-title">Visualizacion</div>', unsafe_allow_html=True)
    viewer_height = st.slider(
        "Altura del visor (px):",
        min_value=600,
        max_value=1200,
        value=820,
        step=20,
        help="Ajusta la dimension vertical del marco."
    )

    # Resolucion de curso activo
    current_course_dir = None
    entry_filename = "index.html"
    course_info = {}
    sample_path = COURSES_DIR / "sena_eng_n5"

    if uploaded_zip is not None:
        file_bytes = uploaded_zip.getvalue()
        file_hash = hashlib.md5(file_bytes).hexdigest()[:10]
        target_extract = UPLOADS_DIR / file_hash

        if not target_extract.exists():
            with st.spinner("Descomprimiendo paquete..."):
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
        st.caption(f"Cargado: {uploaded_zip.name}")

    elif use_sample and sample_path.exists():
        current_course_dir = sample_path
        course_info = parse_manifest_info(sample_path / "imsmanifest.xml")
        entry_filename = course_info.get("entry_file", "index.html")
        st.caption("Curso de muestra activo")

    else:
        current_course_dir = sample_path
        course_info = parse_manifest_info(sample_path / "imsmanifest.xml")
        entry_filename = course_info.get("entry_file", "index.html")

    # Asegurar que entry_filename no este vacio
    if not entry_filename:
        entry_filename = "index.html"

    # Ruta relativa al servidor estatico de Streamlit (/app/static/...)
    relative_to_static = current_course_dir.relative_to(STATIC_DIR).as_posix()
    public_url = f"/app/static/{relative_to_static}/{entry_filename}"

    # Botones de control en barra lateral
    st.markdown(
        f'<a href="{public_url}" target="_blank" class="btn-fullscreen-sidebar">Pantalla completa</a>',
        unsafe_allow_html=True
    )

    if st.button("Reiniciar visor", use_container_width=True):
        st.rerun()


# --- AREA CENTRAL (BLANCO Y VERDE): TITULO, VISOR Y TARJETAS A LA DERECHA ---

# Cabecera principal
st.markdown("""
<div class="header-container">
    <div class="header-title">Visualizador SCORM LMS SENA</div>
    <div class="header-subtitle">Plataforma web para reproducir, examinar y validar paquetes de contenido interactivo SCORM y recursos HTML5.</div>
</div>
""", unsafe_allow_html=True)

# Division en dos columnas: Visor a la izquierda (centro de pantalla) y Tarjetas de informacion pequeñas a la derecha
col_viewer, col_info = st.columns([3.3, 1.0], gap="medium")

with col_viewer:
    # Incrustacion directa con st.iframe nativo de Streamlit
    # El parametro ?view=embed evita que el servidor confunda la ruta con un archivo local en Linux
    st.iframe(
        f"{public_url}?view=embed",
        height=viewer_height,
        width="stretch"
    )

with col_info:
    st.markdown('<div class="info-panel-title">Informacion del paquete</div>', unsafe_allow_html=True)
    st.markdown(f"""
    <div class="compact-card">
        <div class="compact-label">Estandar</div>
        <div class="compact-value">{course_info.get('version', 'Web')}</div>
    </div>
    <div class="compact-card">
        <div class="compact-label">Organizacion</div>
        <div class="compact-value">{course_info.get('organization', 'SENA')}</div>
    </div>
    <div class="compact-card">
        <div class="compact-label">Titulo</div>
        <div class="compact-value">{course_info.get('title', 'Leccion')}</div>
    </div>
    <div class="compact-card">
        <div class="compact-label">Archivo inicial</div>
        <div class="compact-value">/{entry_filename}</div>
    </div>
    """, unsafe_allow_html=True)

    if course_info.get("hierarchy"):
        st.markdown('<div class="info-panel-title" style="margin-top: 14px;">Estructura</div>', unsafe_allow_html=True)
        st.markdown('<div style="background-color: #FBFDFB; border: 1px solid var(--border-main); border-radius: 6px; padding: 8px 10px;">', unsafe_allow_html=True)
        for step in course_info["hierarchy"]:
            st.markdown(f'<div class="structure-item">• {step}</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
