@echo off
title ChurrasBoom - Divulgador de Links WhatsApp
echo ========================================================
echo       CHURRASBOOM - GERADOR DE LINKS WHATSAPP
echo ========================================================
echo.
echo Iniciando servidor na porta 3334...
start "" "http://localhost:3334"
node server.js
pause
