# 🚀 快速開始指南

## 5 分鐘快速部署

### 第一步：檢查 Git 安裝
```bash
# 雙擊執行
install-git.bat
```

### 第二步：建立 GitHub 儲存庫
1. 前往 [github.com](https://github.com)
2. 點擊 "New repository"
3. 輸入名稱：`activity-registration-system`
4. 點擊 "Create repository"

### 第三步：上傳到 GitHub

**選項 A：使用命令列**
```bash
# 雙擊執行
deploy.bat
```

**選項 B：使用 GitHub Desktop**
1. 下載 [GitHub Desktop](https://desktop.github.com)
2. 建立新儲存庫
3. 複製所有檔案到儲存庫目錄
4. 提交並推送

**選項 C：手動上傳**
1. 在 GitHub 儲存庫頁面點擊 "uploading an existing file"
2. 拖拽所有檔案到上傳區域
3. 提交變更

### 第四步：部署到 Netlify
1. 前往 [netlify.com](https://netlify.com)
2. 點擊 "New site from Git"
3. 選擇 "GitHub"
4. 選擇您的儲存庫
5. 點擊 "Deploy site"

### 第五步：設定 Supabase（可選）
1. 前往 [supabase.com](https://supabase.com)
2. 建立新專案
3. 執行 `database-schema-clean.sql`
4. 更新 `supabase-config.js`

## 🎯 完成！

您的網站現在已經部署完成！
- 🌐 網址：`https://your-site-name.netlify.app`
- 📱 響應式設計
- ⚡ 快速載入
- 🔒 HTTPS 安全

## 📚 詳細說明

- **完整部署指南**：查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **GitHub + Netlify 部署**：查看 [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md)
- **Supabase 設定**：查看 [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## 🆘 需要協助？

如果遇到問題：
1. 查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 的故障排除部分
2. 檢查瀏覽器 Console 錯誤
3. 確認所有檔案都已上傳

---

**提示**：第一次部署可能需要 10-15 分鐘，之後的更新會自動部署！
