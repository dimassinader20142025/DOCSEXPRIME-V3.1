@echo off
setlocal
title DocSexprime Tunisie
cd /d "%~dp0"

echo ========================================================
echo    Demarrage de DocSexprime Tunisie
echo ========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo ERREUR : Node.js est introuvable. Installez Node.js puis relancez ce fichier.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERREUR : npm est introuvable. Verifiez votre installation de Node.js.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ERREUR : package.json est introuvable dans :
    echo %CD%
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
    if errorlevel 1 (
        echo ERREUR : l'installation des dependances a echoue.
        pause
        exit /b 1
    )
)

echo Lancement du serveur de developpement...
call npm run dev
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" (
    echo.
    echo Le serveur s'est arrete avec le code %EXIT_CODE%.
    pause
)
exit /b %EXIT_CODE%
