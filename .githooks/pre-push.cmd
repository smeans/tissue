@echo off
rem pre-push hook for Windows Git
rem Run npm test before allowing a push.
cd /d "%~dp0\.."
npm test
if errorlevel 1 (
  echo.
  echo npm test failed. Push aborted.
  exit /b 1
)
exit /b 0
