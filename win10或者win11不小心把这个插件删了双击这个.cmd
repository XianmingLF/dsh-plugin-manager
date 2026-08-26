@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
node fix-self-delete.mjs --lang zh %*
echo.
echo 已清理完成，现在可以重新启动 dsh web。
echo 按任意键关闭窗口...
pause
endlocal
