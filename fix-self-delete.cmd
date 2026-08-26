@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
node fix-self-delete.mjs --lang en %*
echo.
echo Done. You can now start dsh web.
echo Press any key to close this window...
pause
endlocal
