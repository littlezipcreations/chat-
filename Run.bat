@echo off
cd /d "%~dp0public"
start "" "http://localhost:3000"
py -m http.server 3000
pause