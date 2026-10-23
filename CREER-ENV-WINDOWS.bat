@echo off
setlocal
cd /d "%~dp0"
title BRILLE GROUP SARL - Creation du fichier .env
color 0F

if /i "%~1"=="__inner" goto main

call "%~f0" __inner %*
echo.
echo ------------------------------------------------------------
echo  Fin. Appuyez sur une touche pour fermer.
echo ------------------------------------------------------------
pause
exit /b

:main
echo.
echo ============================================================
echo    Creation du fichier .env - BRILLE GROUP SARL
echo ============================================================
echo.
echo  Ce script va creer le fichier de configuration .env a partir
echo  de votre chaine de connexion Neon. Rien d autre n est modifie.
echo.

if not exist "package.json" goto no_package

where node >nul 2>nul
if errorlevel 1 goto no_node

if not exist "node_modules" goto need_install

node scripts\creer-env.mjs %*
if errorlevel 1 goto failed
goto after_env

:after_env
echo.
set REP=
set /p "REP=Appliquer les migrations et creer le compte admin maintenant ? o pour oui, Entree pour plus tard : "
if /i not "%REP%"=="o" goto done
echo.
echo Application des migrations...
call npm run db:migrate
if errorlevel 1 goto migrate_failed
echo.
echo Creation du compte administrateur...
call npm run admin:create
if errorlevel 1 goto admin_failed
echo.
echo Termine. Lancez maintenant DEMARRER-WINDOWS.bat
echo ou tapez : npm run dev
echo.
goto done

:done
exit /b 0

:need_install
echo [ATTENTION] Le dossier node_modules est absent.
echo.
echo   Lancez d abord DEMARRER-WINDOWS.bat une premiere fois : il
echo   installe les dependances. Revenez ensuite sur ce script.
echo.
exit /b 1

:failed
echo.
echo [INFO] Le fichier .env n a pas ete cree.
echo.
echo   Relancez ce script et collez la chaine Neon complete,
echo   celle qui commence par postgresql:// et qui contient -pooler.
echo.
exit /b 1

:migrate_failed
echo.
echo [ERREUR] Les migrations ont echoue. Le fichier .env existe,
echo mais la base n a pas ete preparee. Verifiez le message ci-dessus.
echo.
exit /b 1

:admin_failed
echo.
echo [ERREUR] La creation du compte admin a echoue.
echo   Vous pouvez la refaire plus tard avec : npm run admin:create
echo.
exit /b 1

:no_package
echo [ERREUR] package.json introuvable dans ce dossier.
echo   Le script doit etre place dans le dossier du projet.
echo   Dossier actuel : %CD%
echo.
exit /b 1

:no_node
echo [ERREUR] Node.js n est pas installe ou n est pas reconnu.
echo   Installez la version LTS depuis https://nodejs.org/fr/download
echo   puis fermez et relancez ce script.
echo.
exit /b 1
