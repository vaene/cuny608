@echo off
setlocal
set "ROOT=%~dp0"
cd /d "%ROOT%\chartjs-nextjs\out" || exit /b 1
start http://localhost:8000
python -m http.server 8000
endlocal
