@echo off
echo ========================================
echo    WebSocket 聊天服务器启动脚本
echo ========================================
echo.

cd /d "%~dp0hou"

echo 检查依赖包...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖包...
    npm install
    echo.
)

echo 启动WebSocket服务器...
echo 服务器地址: ws://localhost:8080/chat
echo 按 Ctrl+C 停止服务器
echo.

npm run websocket

pause 