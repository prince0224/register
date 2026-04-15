@echo off
echo ========================================
echo   Git 安裝協助腳本
echo ========================================
echo.

echo 正在檢查 Git 是否已安裝...
git --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Git 已安裝！
    git --version
    echo.
    echo 您可以繼續進行部署步驟。
    pause
    exit /b 0
)

echo ❌ Git 未安裝
echo.
echo 請按照以下步驟安裝 Git：
echo.
echo 1. 前往 https://git-scm.com/download/win
echo 2. 下載 Git for Windows
echo 3. 執行安裝程式
echo 4. 安裝完成後重新執行此腳本
echo.
echo 或者，您可以使用以下替代方案：
echo.
echo 方案 A：使用 GitHub Desktop
echo 1. 前往 https://desktop.github.com
echo 2. 下載並安裝 GitHub Desktop
echo 3. 使用 GitHub Desktop 上傳專案
echo.
echo 方案 B：手動上傳檔案
echo 1. 在 GitHub 上建立新儲存庫
echo 2. 使用網頁介面上傳所有檔案
echo.
echo 詳細說明請查看 DEPLOYMENT_GUIDE.md
echo.
pause




