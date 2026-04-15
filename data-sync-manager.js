// 資料同步管理器
// 負責處理本地和遠端資料的同步

class DataSyncManager {
    constructor() {
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.syncInterval = 5 * 60 * 1000; // 5分鐘同步一次
        this.retryAttempts = 3;
        this.retryDelay = 2000; // 2秒
        
        this.init();
    }
    
    init() {
        // 定期同步
        setInterval(() => {
            if (window.supabaseClient && window.supabaseClient.isAvailable()) {
                this.syncData();
            }
        }, this.syncInterval);
        
        // 頁面載入時同步
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.syncData();
            });
        } else {
            this.syncData();
        }
        
        // 頁面可見時同步
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.supabaseClient && window.supabaseClient.isAvailable()) {
                this.syncData();
            }
        });
    }
    
    async syncData() {
        if (this.syncInProgress) {
            console.log('🔄 同步已進行中，跳過此次同步');
            return;
        }
        
        if (!window.supabaseClient || !window.supabaseClient.isAvailable()) {
            console.error('❌ Supabase 不可用，無法同步資料');
            throw new Error('Supabase 不可用');
        }
        
        this.syncInProgress = true;
        console.log('🔄 開始資料同步...');
        
        try {
            await this.syncWithRetry();
            this.lastSyncTime = new Date();
            console.log('✅ 資料同步完成');
        } catch (error) {
            console.error('❌ 資料同步失敗:', error);
            throw error;
        } finally {
            this.syncInProgress = false;
        }
    }
    
    async syncWithRetry() {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                await window.supabaseClient.syncPendingData();
                return; // 成功則退出
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ 同步嘗試 ${attempt}/${this.retryAttempts} 失敗:`, error.message);
                
                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        throw lastError;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 強制同步
    async forceSync() {
        console.log('🔄 強制同步資料...');
        await this.syncData();
    }
    
    // 獲取同步狀態
    getSyncStatus() {
        return {
            inProgress: this.syncInProgress,
            lastSyncTime: this.lastSyncTime,
            supabaseAvailable: window.supabaseClient ? window.supabaseClient.isAvailable() : false
        };
    }
    
    // 顯示同步狀態
    showSyncStatus() {
        const status = this.getSyncStatus();
        const statusText = status.inProgress ? '同步中...' : 
                          status.lastSyncTime ? `上次同步: ${status.lastSyncTime.toLocaleTimeString()}` : 
                          '尚未同步';
        
        console.log('📊 同步狀態:', {
            ...status,
            statusText
        });
        
        return status;
    }
}

// 建立全域實例
window.dataSyncManager = new DataSyncManager();


