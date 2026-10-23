@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title BRILLE GROUP SARL - Ou est mon projet
color 0F

if /i "%~1"=="__inner" goto main

call "%~f0" __inner
echo.
echo ------------------------------------------------------------
echo  Fin. Appuyez sur une touche pour fermer.
echo ------------------------------------------------------------
pause
exit /b

:main
echo.
echo ============================================================
echo    Ou est mon projet ? - recherche automatique
echo ============================================================
echo.
echo  Recherche de DEMARRER-WINDOWS.bat dans votre profil...
echo  Cela peut prendre de 10 secondes a 1 minute.
echo.

set TROUVE=
for /f "delims=" %%f in ('dir /s /b "%USERPROFILE%\DEMARRER-WINDOWS.bat" 2^>nul') do set TROUVE=%%~dpf

if not defined TROUVE goto pas_trouve

echo  [TROUVE] Dossier du projet :
echo.
echo    %TROUVE%
echo.
echo  Verifions qu il contient bien package.json :
if not exist "%TROUVE%package.json" goto dossier_incomplet

echo    [OK] package.json present
if exist "%TROUVE%src" echo    [OK] dossier src present
if exist "%TROUVE%node_modules" echo    [OK] dependencies installees
echo.
echo  Copiez cette ligne dans votre invite de commandes :
echo.
echo    cd /d "%TROUVE%"
echo.
echo  Puis lancez :
echo.
echo    npm run setup
echo.
echo  Vous pouvez aussi simplement double-cliquer sur
echo  DEMARRER-WINDOWS.bat dans ce dossier.
echo.
exit /b 0

:dossier_incomplet
echo    [ATTENTION] package.json est absent de ce dossier.
echo.
echo  Le fichier DEMARRER-WINDOWS.bat a peut etre ete copie seul
echo  sur le Bureau. Il faut extraire ARCHIVE ENTIERE :
echo  clic droit sur le fichier .zip puis "Extraire tout".
echo.
goto zip_check

:pas_trouve
echo  [AUCUN RESULTAT] Aucun DEMARRER-WINDOWS.bat trouve.
echo.
echo  Le projet n est donc probablement pas encore extrait sur
echo  cet ordinateur.
echo.
goto zip_check

:zip_check
echo  Recherche de l archive brille-group-site.zip...
echo.
set ZTROUVE=
for /f "delims=" %%f in ('dir /s /b "%USERPROFILE%\brille-group-site.zip" 2^>nul') do set ZTROUVE=%%~dpf

if not defined ZTROUVE goto pas_de_zip

echo  [TROUVE] Archive ici :
echo.
echo    %ZTROUVE%brille-group-site.zip
echo.
echo  A FAIRE :
echo    1. Ouvrez ce dossier dans l explorateur
echo    2. Clic droit sur brille-group-site.zip
echo    3. "Extraire tout..."
echo    4. Effacez le chemin propose et tapez :
echo         C:\Users\%USERNAME%\Documents\brille-group-site
echo    5. Cliquez Extraire, ouvrez le dossier extrait, puis
echo       double-cliquez sur DEMARRER-WINDOWS.bat
echo.
exit /b 1

:pas_de_zip
echo  [AUCUNE ARCHIVE] brille-group-site.zip est introuvable.
echo.
echo  A FAIRE :
echo    1. Demandez le fichier brille-group-site.zip
echo    2. Telechargez-le dans votre dossier Telechargements
echo    3. Clic droit, "Extraire tout...", destination :
echo         C:\Users\%USERNAME%\Documents\brille-group-site
echo    4. Ouvrez ce dossier et double-cliquez sur
echo       DEMARRER-WINDOWS.bat
echo.
exit /b 1
