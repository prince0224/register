// 同步狀態指示器
// 在頁面上顯示 Supabase 連接和同步狀態

class SyncStatusIndicator {
    constructor() {
        this.indicator = null;
        this.statusText = null;
        this.lastUpdate = null;
        this.init();
    }
    
    init() {
        this.createIndicator();
        this.startStatusUpdates();
    }
    
    createIndicator() {
        // 建立狀態指示器元素
        this.indicator = document.createElement('div');
        this.indicator.id = 'sync-status-indicator';
        this.indicator.innerHTML = `
            <div class="sync-status-content">
                <div class="sync-status-icon">🔄</div>
                <div class="sync-status-text">檢查連接中...</div>
                <div class="sync-status-time"></div>
            </div>
        `;
        
        // 加入樣式
        this.indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            font-family: 'Microsoft JhengHei', 'PingFang TC', 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
            min-width: 200px;
            transition: all 0.3s ease;
        `;
        
        // 加入 CSS 樣式
        const style = document.createElement('style');
        style.textContent = `
            .sync-status-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .sync-status-icon {
                font-size: 16px;
                animation: spin 2s linear infinite;
            }
            
            .sync-status-text {
                flex: 1;
                color: #333;
            }
            
            .sync-status-time {
                font-size: 12px;
                color: #666;
            }
            
            .sync-status-indicator.online {
                border-color: #28a745;
                background: rgba(40, 167, 69, 0.1);
            }
            
            .sync-status-indicator.offline {
                border-color: #dc3545;
                background: rgba(220, 53, 69, 0.1);
            }
            
            .sync-status-indicator.syncing {
                border-color: #007bff;
                background: rgba(0, 123, 255, 0.1);
            }
            
            .sync-status-indicator.error {
                border-color: #ffc107;
                background: rgba(255, 193, 7, 0.1);
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .sync-status-indicator.pulse .sync-status-icon {
                animation: pulse 1s ease-in-out infinite;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.indicator);
        
        this.statusText = this.indicator.querySelector('.sync-status-text');
        this.lastUpdate = this.indicator.querySelector('.sync-status-time');
    }
    
    startStatusUpdates() {
        // 每 2 秒更新一次狀態
        setInterval(() => {
            this.updateStatus();
        }, 2000);
        
        // 初始更新
        this.updateStatus();
    }
    
    updateStatus() {
        if (!this.indicator) return;
        
        const status = this.getStatus();
        this.updateIndicator(status);
    }
    
    getStatus() {
        const supabaseAvailable = window.supabaseClient ? window.supabaseClient.isAvailable() : false;
        const syncInProgress = window.dataSyncManager ? window.dataSyncManager.syncInProgress : false;
        const lastSyncTime = window.dataSyncManager ? window.dataSyncManager.lastSyncTime : null;
        
        if (!supabaseAvailable) {
            return {
                status: 'error',
                text: 'Supabase 未配置',
                icon: '⚠️',
                time: '請檢查設定'
            };
        }
        
        if (syncInProgress) {
            return {
                status: 'syncing',
                text: '同步中...',
                icon: '🔄',
                time: '請稍候'
            };
        }
        
        if (lastSyncTime) {
            const timeAgo = this.getTimeAgo(lastSyncTime);
            return {
                status: 'online',
                text: '已連接',
                icon: '✅',
                time: `上次同步: ${timeAgo}`
            };
        }
        
        return {
            status: 'online',
            text: '已連接',
            icon: '✅',
            time: '等待同步'
        };
    }
    
    updateIndicator(status) {
        // 更新 CSS 類別
        this.indicator.className = `sync-status-indicator ${status.status}`;
        
        // 更新內容
        const icon = this.indicator.querySelector('.sync-status-icon');
        const text = this.indicator.querySelector('.sync-status-text');
        const time = this.indicator.querySelector('.sync-status-time');
        
        icon.textContent = status.icon;
        text.textContent = status.text;
        time.textContent = status.time;
        
        // 根據狀態調整動畫
        if (status.status === 'syncing') {
            this.indicator.classList.add('pulse');
        } else {
            this.indicator.classList.remove('pulse');
        }
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (seconds < 60) {
            return `${seconds}秒前`;
        } else if (minutes < 60) {
            return `${minutes}分鐘前`;
        } else if (hours < 24) {
            return `${hours}小時前`;
        } else {
            return date.toLocaleDateString('zh-TW');
        }
    }
    
    // 顯示臨時訊息
    showMessage(message, type = 'info', duration = 3000) {
        if (!this.indicator) return;
        
        const originalText = this.statusText.textContent;
        const originalIcon = this.indicator.querySelector('.sync-status-icon').textContent;
        
        // 更新訊息
        this.statusText.textContent = message;
        this.indicator.querySelector('.sync-status-icon').textContent = 
            type === 'success' ? '✅' : 
            type === 'error' ? '❌' : 
            type === 'warning' ? '⚠️' : 'ℹ️';
        
        // 設定樣式
        this.indicator.className = `sync-status-indicator ${type}`;
        
        // 恢復原始狀態
        setTimeout(() => {
            this.statusText.textContent = originalText;
            this.indicator.querySelector('.sync-status-icon').textContent = originalIcon;
            this.updateStatus();
        }, duration);
    }
    
    // 隱藏指示器
    hide() {
        if (this.indicator) {
            this.indicator.style.display = 'none';
        }
    }
    
    // 顯示指示器
    show() {
        if (this.indicator) {
            this.indicator.style.display = 'block';
        }
    }
}

// 建立全域實例
window.syncStatusIndicator = new SyncStatusIndicator();


