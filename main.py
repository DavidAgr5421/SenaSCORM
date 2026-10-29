import os
import shutil
import zipfile
import hashlib
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Any

from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.responses import HTMLResponse, JSONResponse, Response
from starlette.staticfiles import StaticFiles
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
COURSES_DIR = STATIC_DIR / "courses"
UPLOADS_DIR = BASE_DIR / "uploads"

COURSES_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def parse_manifest_info(manifest_path: Path) -> Dict[str, Any]:
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


def find_course_root_and_entry(target_dir: Path):
    """Encuentra la carpeta raiz real del curso y su archivo inicial."""
    manifests = list(target_dir.rglob("imsmanifest.xml"))
    if manifests:
        root_dir = manifests[0].parent
        manifest_info = parse_manifest_info(manifests[0])
        entry = manifest_info.get("entry_file", "index.html")
        if (root_dir / entry).exists():
            return root_dir, entry, manifest_info

    common_entries = [
        "index.html", "index_lms.html", "story.html",
        "launcher.html", "player.html", "default.html", "presentation.html"
    ]
    for root, _, files in os.walk(target_dir):
        root_path = Path(root)
        for cand in common_entries:
            if cand in files:
                m_info = parse_manifest_info(root_path / "imsmanifest.xml")
                m_info["entry_file"] = cand
                return root_path, cand, m_info

    html_files = list(target_dir.rglob("*.html"))
    if html_files:
        chosen = html_files[0]
        return chosen.parent, chosen.name, parse_manifest_info(chosen.parent / "imsmanifest.xml")

    return target_dir, "index.html", parse_manifest_info(target_dir / "imsmanifest.xml")


def patch_course_for_web(course_root: Path):
    """Aplica parches de compatibilidad web para que los scripts del curso ejecuten sin errores."""
    try:
        # 1. Doohan.js: No silenciar console.log / console.error
        doohan = course_root / "static" / "application" / "js" / "Doohan.js"
        if doohan.exists():
            c = doohan.read_text(encoding="utf-8", errors="ignore")
            if "disable_console_logs();" in c:
                c = c.replace("disable_console_logs();", "// disable_console_logs();")
                doohan.write_text(c, encoding="utf-8")

        # 2. SCORM APIWrapper: Evitar errores cross-origin al buscar API en win.parent
        for wrapper in course_root.rglob("*APIWrapper*.js"):
            c = wrapper.read_text(encoding="utf-8", errors="ignore")
            if "function findAPI(win)" in c and "/* patched */" not in c:
                c = c.replace("function findAPI(win)\n{", "function findAPI(win)\n{\n   /* patched */ try {")
                c = c.replace("return win.API_1484_11;\n}", "return win.API_1484_11;\n   } catch(e) { return null; }\n}")
                wrapper.write_text(c, encoding="utf-8")

        # 3. Mediaelement: Evitar SecurityError por window.parent.location
        for me in course_root.rglob("mediaelement*.js"):
            c = me.read_text(encoding="utf-8", errors="ignore")
            if "a.isInIframe=window.location!=window.parent.location;" in c:
                c = c.replace(
                    "a.isInIframe=window.location!=window.parent.location;",
                    "try{a.isInIframe=window.location!=window.parent.location}catch(e){a.isInIframe=true};"
                )
                me.write_text(c, encoding="utf-8")
    except Exception:
        pass


# Parchear curso de muestra integrado
sample_course_path = COURSES_DIR / "sena_eng_n5"
if sample_course_path.exists():
    patch_course_for_web(sample_course_path)


# Endpoints HTTP
async def index_page(request):
    """Genera la interfaz web minimalista en tonos verde SENA y blanco."""
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualizador SCORM LMS SENA</title>
    <style>
        :root {
            --sena-green: #39A900;
            --sena-dark-green: #007832;
            --panel-dark: #0A2421;
            --panel-card: #12332F;
            --panel-text: #E5F3EE;
            --panel-muted: #8DB8AD;
            --bg-main: #FFFFFF;
            --border-main: #E2ECE5;
            --text-dark: #1E293B;
            --text-muted: #64748B;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        body {
            display: flex;
            height: 100vh;
            width: 100vw;
            background-color: #F8FAF9;
            color: var(--text-dark);
            overflow: hidden;
        }

        /* PANEL LATERAL IZQUIERDO: Tono azul oscuro verde */
        .sidebar {
            width: 320px;
            min-width: 300px;
            height: 100vh;
            background-color: var(--panel-dark);
            border-right: 1px solid #143D37;
            padding: 24px 20px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            color: var(--panel-text);
        }

        .sidebar-title {
            font-size: 1.15rem;
            font-weight: 800;
            color: #FFFFFF;
            letter-spacing: -0.3px;
            margin-bottom: 24px;
            border-bottom: 2px solid var(--sena-green);
            padding-bottom: 12px;
        }

        .sidebar-section-title {
            font-size: 0.82rem;
            font-weight: 700;
            color: #55D418;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }

        /* Area de carga Drag & Drop */
        .dropzone {
            background-color: var(--panel-card);
            border: 2px dashed #20554E;
            border-radius: 8px;
            padding: 20px 14px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 18px;
        }

        .dropzone:hover, .dropzone.dragover {
            border-color: var(--sena-green);
            background-color: #16403B;
        }

        .dropzone-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 6px;
        }

        .dropzone-subtext {
            font-size: 0.75rem;
            color: var(--panel-muted);
            line-height: 1.3;
        }

        #file-input {
            display: none;
        }

        .btn-action {
            display: block;
            width: 100%;
            background-color: var(--sena-green);
            color: #FFFFFF !important;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 700;
            text-decoration: none !important;
            text-align: center;
            border: 1px solid var(--sena-dark-green);
            cursor: pointer;
            transition: background-color 0.2s;
            margin-bottom: 10px;
        }

        .btn-action:hover {
            background-color: var(--sena-dark-green);
        }

        .btn-secondary {
            background-color: transparent;
            color: #FFFFFF;
            border: 1px solid #20554E;
        }

        .btn-secondary:hover {
            border-color: var(--sena-green);
            background-color: var(--panel-card);
        }

        .status-badge {
            display: inline-block;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 4px;
            background-color: #16403B;
            color: #8CEAB1;
            margin-bottom: 16px;
            border: 1px solid #20554E;
        }

        /* AREA CENTRAL: Visor y Tarjetas a la derecha */
        .main-content {
            flex: 1;
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 20px 24px;
            overflow-y: auto;
        }

        .header-container {
            border-bottom: 2px solid var(--sena-green);
            padding-bottom: 12px;
            margin-bottom: 16px;
        }

        .header-title {
            font-size: 1.8rem;
            font-weight: 800;
            color: var(--sena-dark-green);
            letter-spacing: -0.5px;
        }

        .header-subtitle {
            font-size: 0.92rem;
            color: var(--text-muted);
            margin-top: 3px;
        }

        .viewer-layout {
            display: grid;
            grid-template-columns: 1fr 280px;
            gap: 20px;
            flex: 1;
            min-height: 0;
        }

        .viewer-box {
            display: flex;
            flex-direction: column;
            background-color: #FFFFFF;
            border: 1px solid var(--border-main);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            height: calc(100vh - 120px);
        }

        .iframe-container {
            flex: 1;
            width: 100%;
            height: 100%;
            background-color: #FFFFFF;
            position: relative;
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }

        .viewer-footer {
            padding: 10px 16px;
            background-color: #F8FAF9;
            border-top: 1px solid var(--border-main);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .viewer-footer a {
            color: var(--sena-dark-green);
            font-weight: 700;
            text-decoration: underline;
        }

        /* TARJETAS DE INFORMACION DERECHA */
        .info-sidebar {
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-y: auto;
        }

        .info-panel-title {
            font-size: 0.82rem;
            font-weight: 700;
            color: var(--sena-dark-green);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border-main);
            padding-bottom: 6px;
            margin-bottom: 6px;
        }

        .compact-card {
            background-color: #FFFFFF;
            border: 1px solid var(--border-main);
            border-left: 3px solid var(--sena-green);
            border-radius: 6px;
            padding: 8px 12px;
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

        .structure-box {
            background-color: #FFFFFF;
            border: 1px solid var(--border-main);
            border-radius: 6px;
            padding: 10px 12px;
            max-height: 250px;
            overflow-y: auto;
        }

        .structure-item {
            font-size: 0.78rem;
            color: #334155;
            padding: 6px 0;
            border-bottom: 1px dashed var(--border-main);
            line-height: 1.3;
        }

        .structure-item:last-child {
            border-bottom: none;
        }

        /* Loader animado */
        .loading-overlay {
            display: none;
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255,255,255,0.85);
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 10;
        }

        .spinner {
            width: 36px;
            height: 36px;
            border: 4px solid var(--border-main);
            border-top: 4px solid var(--sena-green);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>

    <!-- BARRA LATERAL IZQUIERDA -->
    <div class="sidebar">
        <div class="sidebar-title">Visualizador SCORM LMS SENA</div>

        <div class="sidebar-section-title">Subir tu archivo</div>
        
        <div class="dropzone" id="dropzone" onclick="document.getElementById('file-input').click()">
            <div class="dropzone-label">Arrastra tu archivo .zip aqui</div>
            <div class="dropzone-subtext">o haz clic para explorar tus carpetas (SCORM 1.2, 2004 o HTML5)</div>
            <input type="file" id="file-input" accept=".zip">
        </div>

        <div id="upload-status" class="status-badge">Curso de muestra activo</div>

        <div class="sidebar-section-title" style="margin-top: 10px;">Visualizacion</div>
        <a id="btn-fullscreen" href="/courses/sample/index.html" target="_blank" class="btn-action">Pantalla completa</a>
        <button id="btn-reload" class="btn-action btn-secondary" onclick="reloadViewer()">Reiniciar visor</button>
        <button id="btn-sample" class="btn-action btn-secondary" onclick="loadSampleCourse()">Cargar curso muestra</button>
    </div>

    <!-- AREA CENTRAL -->
    <div class="main-content">
        <div class="header-container">
            <h1 class="header-title">Visualizador SCORM LMS SENA</h1>
            <p class="header-subtitle">Plataforma web para reproducir, examinar y validar paquetes de contenido interactivo SCORM y recursos HTML5.</p>
        </div>

        <div class="viewer-layout">
            <!-- Columna Izquierda: Visor -->
            <div class="viewer-box">
                <div class="iframe-container">
                    <div id="loader" class="loading-overlay">
                        <div class="spinner"></div>
                        <div style="font-size: 0.85rem; font-weight: 600; color: #007832;">Procesando y cargando leccion...</div>
                    </div>
                    <iframe id="scorm-frame" src="/courses/sample/index.html"></iframe>
                </div>
                <div class="viewer-footer">
                    <span>Marco de reproduccion interactivo directo sin restricciones.</span>
                    <a id="footer-link" href="/courses/sample/index.html" target="_blank">Abrir en pestaña nueva</a>
                </div>
            </div>

            <!-- Columna Derecha: Tarjetas Compactas -->
            <div class="info-sidebar">
                <div class="info-panel-title">Informacion del paquete</div>
                
                <div class="compact-card">
                    <div class="compact-label">Estandar</div>
                    <div class="compact-value" id="card-version">SCORM 2004 4th Edition</div>
                </div>

                <div class="compact-card">
                    <div class="compact-label">Organizacion</div>
                    <div class="compact-value" id="card-organization">Sena</div>
                </div>

                <div class="compact-card">
                    <div class="compact-label">Titulo</div>
                    <div class="compact-value" id="card-title">Welcome Home Party</div>
                </div>

                <div class="compact-card">
                    <div class="compact-label">Archivo inicial</div>
                    <div class="compact-value" id="card-entry">/index.html</div>
                </div>

                <div class="info-panel-title" style="margin-top: 14px;">Estructura</div>
                <div class="structure-box" id="structure-list">
                    <div class="structure-item">• Sena</div>
                    <div class="structure-item">• Level A2.2</div>
                    <div class="structure-item">• John Comes Home for a Visit</div>
                    <div class="structure-item">• Welcome Home Party</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-input');
        const iframe = document.getElementById('scorm-frame');
        const loader = document.getElementById('loader');
        const statusBadge = document.getElementById('upload-status');
        const btnFullscreen = document.getElementById('btn-fullscreen');
        const footerLink = document.getElementById('footer-link');

        // Drag and drop events
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });

        function handleFileUpload(file) {
            if (!file.name.toLowerCase().endsWith('.zip')) {
                alert('Por favor selecciona un archivo con extension .zip');
                return;
            }

            loader.style.display = 'flex';
            statusBadge.textContent = 'Subiendo ' + file.name + '...';

            const formData = new FormData();
            formData.append('file', file);

            fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) throw new Error('Error al procesar el paquete');
                return res.json();
            })
            .then(data => {
                loader.style.display = 'none';
                statusBadge.textContent = 'Cargado: ' + file.name;
                updateCourseView(data);
            })
            .catch(err => {
                loader.style.display = 'none';
                statusBadge.textContent = 'Error en carga';
                alert('Error al descomprimir el archivo: ' + err.message);
            });
        }

        function updateCourseView(data) {
            iframe.src = data.url;
            btnFullscreen.href = data.url;
            footerLink.href = data.url;

            document.getElementById('card-version').textContent = data.version || 'Web';
            document.getElementById('card-organization').textContent = data.organization || 'SENA';
            document.getElementById('card-title').textContent = data.title || 'Leccion';
            document.getElementById('card-entry').textContent = '/' + (data.entry_file || 'index.html');

            const structureList = document.getElementById('structure-list');
            structureList.innerHTML = '';
            if (data.hierarchy && data.hierarchy.length > 0) {
                data.hierarchy.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'structure-item';
                    div.textContent = '• ' + item;
                    structureList.appendChild(div);
                });
            } else {
                structureList.innerHTML = '<div class="structure-item">• Contenido principal</div>';
            }
        }

        function reloadViewer() {
            const current = iframe.src;
            iframe.src = 'about:blank';
            setTimeout(() => {
                iframe.src = current;
            }, 100);
        }

        function loadSampleCourse() {
            loader.style.display = 'flex';
            fetch('/api/course-info/sample')
            .then(res => res.json())
            .then(data => {
                loader.style.display = 'none';
                statusBadge.textContent = 'Curso de muestra activo';
                updateCourseView(data);
            })
            .catch(() => {
                loader.style.display = 'none';
            });
        }
    </script>
</body>
</html>
"""
    return HTMLResponse(content=html_content)


async def get_sample_info(request):
    if not sample_course_path.exists():
        return JSONResponse({"error": "Curso de muestra no encontrado"}, status_code=404)
    manifest = sample_course_path / "imsmanifest.xml"
    info = parse_manifest_info(manifest)
    info["url"] = "/courses/sample/index.html"
    return JSONResponse(info)


async def upload_scorm_zip(request):
    """Recibe un archivo .zip, lo descomprime y devuelve la informacion y url del visor."""
    form = await request.form()
    file = form.get("file")
    if not file or not hasattr(file, "filename"):
        return JSONResponse({"error": "No se envio ningun archivo"}, status_code=400)

    filename = file.filename
    if not filename.lower().endswith(".zip"):
        return JSONResponse({"error": "El archivo debe tener extension .zip"}, status_code=400)

    contents = await file.read()
    file_hash = hashlib.md5(contents).hexdigest()[:10]
    target_extract = UPLOADS_DIR / file_hash

    if not target_extract.exists():
        target_extract.mkdir(parents=True, exist_ok=True)
        zip_path = target_extract / "upload.zip"
        with open(zip_path, "wb") as f:
            f.write(contents)
        try:
            with zipfile.ZipFile(zip_path, "r") as z:
                z.extractall(target_extract)
        finally:
            if zip_path.exists():
                zip_path.unlink()

    patch_course_for_web(target_extract)
    course_root, entry_file, info = find_course_root_and_entry(target_extract)
    patch_course_for_web(course_root)

    relative_subpath = course_root.relative_to(UPLOADS_DIR).as_posix()
    public_url = f"/courses/uploads/{relative_subpath}/{entry_file}"

    info["url"] = public_url
    info["course_id"] = file_hash
    info["filename"] = filename
    return JSONResponse(info)


# Configurar rutas y montajes
routes = [
    Route("/", endpoint=index_page, methods=["GET"]),
    Route("/api/course-info/sample", endpoint=get_sample_info, methods=["GET"]),
    Route("/api/upload", endpoint=upload_scorm_zip, methods=["POST"]),
]

if sample_course_path.exists():
    routes.append(
        Mount("/courses/sample", app=StaticFiles(directory=str(sample_course_path), html=True), name="sample")
    )

routes.append(
    Mount("/courses/uploads", app=StaticFiles(directory=str(UPLOADS_DIR), html=True), name="uploads")
)

middleware = [
    Middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
]

app = Starlette(debug=False, routes=routes, middleware=middleware)
