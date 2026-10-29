@echo off
echo ========================================================
echo   Iniciando Visor SCORM LMS SENA (Python Uvicorn)...
echo ========================================================
python -m uvicorn main:app --host 0.0.0.0 --port 7860
pause
