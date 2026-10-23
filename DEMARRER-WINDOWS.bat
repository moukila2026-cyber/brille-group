@echo off
setlocal
cd /d "%~dp0"
title BRILLE GROUP SARL - Demarrage du site
color 0F

rem ---------------------------------------------------------------------------
rem Garde-fou : la fenetre ne doit JAMAIS se fermer toute seule.
rem Le script se relance lui-meme en mode interne ; quoi qu il arrive, la
rem fenetre d origine attend une touche avant de se fermer.
rem ---------------------------------------------------------------------------
if /i "%~1"=="__inner" goto main

call "%~f0" __inner
echo.
echo ------------------------------------------------------------
echo  Fin du script. Appuyez sur une touche pour fermer.
echo ------------------------------------------------------------
pause
exit /b

:main
echo.
echo ============================================================
echo    BRILLE GROUP SARL - Demarrage du site
echo ============================================================
echo.

if not exist "package.json" goto no_package

where node >nul 2>nul
if errorlevel 1 goto no_node

for /f "delims=" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js %NODE_VERSION%

where npm >nul 2>nul
if errorlevel 1 goto no_node
echo [OK] npm disponible
echo.

if not exist "node_modules" goto install_deps
echo [OK] Dependances deja installees.
echo.
goto check_env

:install_deps
echo [1 sur 3] Installation des dependances - comptez 1 a 3 minutes.
echo            Ne fermez pas cette fenetre.
echo.
if exist "package-lock.json" goto use_ci
call npm install --no-audit --no-fund
if errorlevel 1 goto install_failed
goto install_done

:use_ci
call npm ci --no-audit --no-fund
if errorlevel 1 goto install_failed

:install_done
echo.
echo [OK] Dependances installees.
echo.
goto check_env

:check_env
if not exist ".env" goto run_setup
echo [OK] Fichier .env present.
echo.
goto start_server

:run_setup
echo [2 sur 3] Configuration initiale
echo.
echo   Munissez-vous de la chaine de connexion Neon :
echo     1. https://console.neon.tech puis "New Project"
echo     2. Nom du projet : brille-group / region la plus proche
echo     3. Bouton "Connect" en haut du tableau de bord
echo     4. Interrupteur "Connection pooling" ACTIVE
echo     5. Onglet "Connection string" puis copier
echo   Collez ensuite la chaine quand le script vous la demande.
echo.
call npm run setup
if errorlevel 1 goto setup_failed
echo.
goto start_server

:start_server
echo [3 sur 3] Demarrage du serveur...
echo.
echo    Site public     : http://localhost:3000
echo    Administration  : http://localhost:3000/admin/login
echo.
echo    Pour ARRETER le site : Ctrl + C
echo    Gardez cette fenetre OUVERTE pendant l utilisation.
echo.
echo ============================================================
echo.
start "" http://localhost:3000
call npm run dev
echo.
echo Le serveur est arrete.
echo.
exit /b 0

:no_package
echo [ERREUR] package.json est introuvable dans ce dossier.
echo.
echo   Ce fichier DEMARRER-WINDOWS.bat doit rester DANS le dossier
echo   du projet, a cote de package.json.
echo.
echo   Dossier actuel : %CD%
echo.
echo   Verifiez que l archive ZIP a bien ete EXTRAITE, et non
echo   seulement ouverte dans la fenetre de previsualisation.
echo.
exit /b 1

:no_node
echo [ERREUR] Node.js n est pas installe, ou n est pas reconnu.
echo.
echo   1. La page de telechargement va s ouvrir
echo   2. Prenez la version LTS, installez avec les options par defaut
echo   3. FERMEZ cette fenetre, rouvrez-la, relancez ce fichier
echo.
start "" https://nodejs.org/fr/download
pause
exit /b 1

:install_failed
echo.
echo [ERREUR] L installation des dependances a echoue.
echo.
echo   Pistes :
echo   - verifiez votre connexion internet
echo   - si le dossier est sur OneDrive, deplacez-le dans Documents
echo   - relancez ce fichier
echo.
exit /b 1

:setup_failed
echo.
echo [ERREUR] La configuration a echoue.
echo.
echo   Le message ci-dessus indique quoi corriger, par exemple :
echo   - mot de passe de la base refuse : recopiez la chaine Neon en entier
echo   - base introuvable : verifiez le nom de la base, souvent neondb
echo   - delai depasse : verifiez votre connexion internet
echo.
exit /b 1
