@echo off
REM Start a simple Python static server and open the app in the default browser
set PORT=8000
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  start "" "http://localhost:%PORT%/index.html"
  py -3 -m http.server %PORT%
) else (
  start "" "http://localhost:%PORT%/index.html"
  python -m http.server %PORT%
)