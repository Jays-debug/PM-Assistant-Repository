@echo off
title PM Tracking ngrok Tunnel
cd /d "%~dp0"
echo ====================================================
echo      PM TRACKING - NGROK WEBHOOK TUNNEL
echo ====================================================
echo.
echo [STEP 1] Make sure run.bat is already running PM Tracking on port 8050.
echo [STEP 2] This window will create a public HTTPS URL for LINE Webhook.
echo.
echo Webhook path will be: https://YOUR-NGROK-URL/line/webhook
echo.
ngrok http 8050
pause
