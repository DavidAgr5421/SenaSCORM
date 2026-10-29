FROM python:3.12-slim

# Evitar prompts interactivos durante la instalacion
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PORT=7860

# Instalar dependencias del sistema requeridas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces corre como usuario con UID 1000
RUN useradd -m -u 1000 appuser

WORKDIR /home/appuser/app

# Copiar requirements e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar todo el codigo con permisos del usuario appuser
COPY --chown=appuser:appuser . /home/appuser/app

# Crear directorios de subidas y asegurar permisos
RUN mkdir -p /home/appuser/app/uploads && \
    chown -R appuser:appuser /home/appuser/app

USER appuser

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
