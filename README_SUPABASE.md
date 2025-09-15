# 活動報名系統 - Supabase 整合版

這是一個功能完整的活動報名系統，已整合 Supabase 來提供雲端資料同步和管理功能。

## 🌟 主要特色

### 📱 雙模式運作
- **線上模式**: 自動同步到 Supabase 雲端資料庫
- **離線模式**: 使用本地儲存，網路恢復後自動同步

### 🔄 智能同步
- 每 5 分鐘自動同步資料
- 網路狀態變化時即時同步
- 頁面可見時觸發同步
- 自動重試機制（最多 3 次）

### 🛡️ 資料安全
- 完整的錯誤處理機制
- 資料驗證和格式檢查
- 自動備份和恢復
- 離線資料保護

### 📊 即時狀態監控
- 右上角狀態指示器
- 連接狀態即時顯示
- 同步進度可視化
- 詳細的日誌記錄

## 🚀 快速開始

### 1. 設定 Supabase
請參考 `SUPABASE_SETUP.md` 檔案進行詳細設定。

### 2. 配置 API 金鑰
編輯 `supabase-config.js` 檔案：

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here',
    tables: {
        events: 'events',
        registrations: 'registrations'
    }
};
```

### 3. 建立資料庫
在 Supabase SQL Editor 中執行 `database-schema.sql` 檔案。

### 4. 啟動應用程式
直接開啟 `index.html` 檔案即可開始使用。

## 📁 檔案結構

```
register-main/
├── index.html                    # 報名頁面
├── admin.html                    # 管理後台
├── script.js                     # 報名頁面邏輯
├── admin-script.js               # 管理後台邏輯
├── styles.css                    # 報名頁面樣式
├── admin-styles.css              # 管理後台樣式
├── supabase-config.js            # Supabase 配置
├── supabase-client.js            # Supabase 客戶端
├── data-sync-manager.js          # 資料同步管理器
├── sync-status-indicator.js      # 狀態指示器
├── database-schema.sql           # 資料庫結構
├── SUPABASE_SETUP.md             # Supabase 設定指南
└── README_SUPABASE.md            # 本檔案
```

## 🔧 核心功能

### 活動管理
- ✅ 建立、編輯、刪除活動
- ✅ 活動海報上傳和預覽
- ✅ 報名人數限制
- ✅ 報名截止日期
- ✅ 活動狀態管理

### 報名系統
- ✅ 完整的報名表單
- ✅ 電子簽名功能
- ✅ 表單驗證
- ✅ 即時資料同步
- ✅ 離線支援

### 管理後台
- ✅ 報名資料管理
- ✅ 統計資訊顯示
- ✅ 搜尋和篩選
- ✅ 資料匯出
- ✅ 批量操作

### 資料同步
- ✅ 自動同步
- ✅ 衝突解決
- ✅ 錯誤恢復
- ✅ 狀態監控

## 🎯 使用場景

### 活動主辦方
1. 在管理後台建立活動
2. 設定活動詳情和限制
3. 監控報名狀況
4. 管理報名資料
5. 匯出報名清單

### 報名者
1. 瀏覽可報名活動
2. 填寫報名表單
3. 完成電子簽名
4. 提交報名申請
5. 查看報名狀態

## 🔍 技術架構

### 前端技術
- **HTML5**: 語義化標記
- **CSS3**: 響應式設計
- **JavaScript ES6+**: 現代化語法
- **Canvas API**: 電子簽名
- **LocalStorage**: 本地儲存

### 後端服務
- **Supabase**: 雲端資料庫
- **PostgreSQL**: 關聯式資料庫
- **Row Level Security**: 資料安全
- **Real-time**: 即時更新

### 同步機制
- **離線優先**: 本地儲存優先
- **自動同步**: 定期同步
- **衝突解決**: 時間戳記優先
- **錯誤處理**: 優雅降級

## 📊 資料庫結構

### Events 表格
```sql
- id: 活動 ID
- name: 活動名稱
- type: 活動類型
- date: 活動日期
- time: 活動時間
- location: 活動地點
- description: 活動描述
- capacity: 人數限制
- fee: 報名費用
- deadline: 報名截止
- active: 是否啟用
- poster: 活動海報
- created_at: 建立時間
- updated_at: 更新時間
```

### Registrations 表格
```sql
- id: 報名 ID
- name: 姓名
- email: 電子郵件
- phone: 聯絡電話
- birthdate: 出生日期
- event_id: 活動 ID
- event_date: 活動日期
- dietary: 飲食需求
- notes: 備註
- signature: 電子簽名
- status: 處理狀態
- submitted_at: 提交時間
- updated_at: 更新時間
```

## 🛠️ 自訂設定

### 修改同步間隔
在 `data-sync-manager.js` 中：

```javascript
this.syncInterval = 5 * 60 * 1000; // 改為您想要的間隔
```

### 修改重試次數
在 `data-sync-manager.js` 中：

```javascript
this.retryAttempts = 3; // 改為您想要的次數
```

### 自訂狀態指示器
在 `sync-status-indicator.js` 中修改樣式和行為。

## 🐛 故障排除

### 常見問題

**Q: 狀態指示器顯示「Supabase 未配置」**
A: 請檢查 `supabase-config.js` 中的 URL 和 API Key 是否正確設定。

**Q: 資料沒有同步**
A: 請檢查：
- 網路連接
- Supabase 專案狀態
- 資料庫表格是否建立
- 瀏覽器 Console 錯誤訊息

**Q: 電子簽名無法儲存**
A: 請確認：
- 瀏覽器支援 Canvas API
- 簽名資料大小不超過限制
- 本地儲存空間充足

### 除錯工具

在瀏覽器 Console 中執行：

```javascript
// 檢查 Supabase 狀態
console.log('Supabase 可用:', window.supabaseClient.isAvailable());

// 檢查同步狀態
window.dataSyncManager.showSyncStatus();

// 強制同步
window.dataSyncManager.forceSync();

// 顯示狀態訊息
window.syncStatusIndicator.showMessage('測試訊息', 'success');
```

## 📈 效能優化

### 已實作的優化
- 懶載入 Supabase 客戶端庫
- 本地快取機制
- 批量資料同步
- 智能重試策略
- 記憶體使用優化

### 建議的優化
- 使用 CDN 加速
- 啟用 Gzip 壓縮
- 實作 Service Worker
- 加入資料壓縮

## 🔒 安全考量

### 已實作的安全措施
- Row Level Security (RLS)
- 資料驗證和清理
- SQL 注入防護
- XSS 攻擊防護
- CSRF 保護

### 建議的安全措施
- 定期更新依賴
- 使用 HTTPS
- 實作 API 限制
- 加入日誌監控

## 📝 更新日誌

### v1.0.0 (2024-01-XX)
- ✅ 初始 Supabase 整合
- ✅ 自動同步機制
- ✅ 離線支援
- ✅ 狀態監控
- ✅ 錯誤處理
- ✅ 完整文件

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request 來改善這個專案。

## 📄 授權

本專案採用 MIT 授權條款。

## 📞 支援

如果您需要協助，請：
1. 查看 `SUPABASE_SETUP.md` 設定指南
2. 檢查瀏覽器 Console 錯誤訊息
3. 確認 Supabase 專案設定
4. 提交 Issue 描述問題

---

**享受使用您的活動報名系統！** 🎉


