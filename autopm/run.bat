@echo off
title AutoPM Server
echo ===================================================
echo   AutoPM - Starting Local Web Server...
echo   URL: http://localhost:8010
echo ===================================================
echo.
echo Launching web browser...
start "" "http://localhost:8010"
echo.
echo Running server (Press Ctrl+C to stop)...
python -m http.server 8010
