@echo off
echo ========================================
echo   活動報名系統 - GitHub 部署腳本
echo ========================================
echo.

echo 正在檢查 Git 狀態...
git status

echo.
echo 正在添加所有檔案...
git add .

echo.
echo 請輸入提交訊息 (或按 Enter 使用預設訊息):
set /p commit_message="提交訊息: "

if "%commit_message%"=="" (
    set commit_message="Update: Activity registration system with Supabase integration"
)

echo.
echo 正在提交變更...
git commit -m %commit_message%

echo.
echo 正在推送到 GitHub...
git push origin main

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 下一步：
echo 1. 前往 https://netlify.com
echo 2. 登入並選擇 "New site from Git"
echo 3. 選擇您的 GitHub 儲存庫
echo 4. 設定部署選項並部署
echo.
echo 詳細說明請查看 GITHUB_DEPLOYMENT.md
echo.
pause




