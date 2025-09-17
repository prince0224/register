// Supabase 客戶端初始化
// 這個檔案會載入 Supabase 客戶端庫並初始化連接

class SupabaseClient {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
        
        // 監聽網路狀態
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 網路已連接，開始同步資料...');
            this.syncPendingData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 網路已斷線，將使用離線模式');
        });
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🔄 開始初始化 Supabase 客戶端...');
            
            // 檢查配置
            if (!validateConfig()) {
                console.error('❌ Supabase 配置不完整');
                this.isInitialized = false;
                return;
            }
            
            console.log('✅ 配置驗證通過');
            
            // 動態載入 Supabase 客戶端庫
            if (!window.supabase) {
                console.log('📦 載入 Supabase 客戶端庫...');
                await this.loadSupabaseLibrary();
            }
            
            console.log('✅ Supabase 客戶端庫已載入');
            
            // 初始化 Supabase 客戶端
            this.client = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            
            this.isInitialized = true;
            console.log('✅ Supabase 客戶端初始化成功');
            
            // 測試連接
            const connectionTest = await this.testConnection();
            if (!connectionTest) {
                console.warn('⚠️ 連接測試失敗，但客戶端已初始化');
            }
            
        } catch (error) {
            console.error('❌ Supabase 初始化失敗:', error);
            this.isInitialized = false;
            this.client = null;
        }
    }
    
    async loadSupabaseLibrary() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2';
            script.onload = () => {
                console.log('📦 Supabase 客戶端庫載入成功');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ 無法載入 Supabase 客戶端庫');
                reject(new Error('無法載入 Supabase 客戶端庫'));
            };
            document.head.appendChild(script);
        });
    }
    
    async testConnection() {
        try {
            const { data, error } = await this.client
                .from(SUPABASE_CONFIG.tables.events)
                .select('count')
                .limit(1);
            
            if (error) {
                console.warn('⚠️ Supabase 連接測試失敗:', error.message);
                return false;
            }
            
            console.log('✅ Supabase 連接測試成功');
            return true;
        } catch (error) {
            console.warn('⚠️ Supabase 連接測試失敗:', error);
            return false;
        }
    }
    
    // 檢查是否可以使用 Supabase
    isAvailable() {
        const available = this.isInitialized && this.client;
        console.log('🔍 Supabase 可用性檢查:', {
            isInitialized: this.isInitialized,
            hasClient: !!this.client,
            available: available
        });
        return available;
    }
    
    // 獲取客戶端實例
    getClient() {
        return this.client;
    }
    
    // 同步待處理的資料
    async syncPendingData() {
        if (!this.isAvailable()) {
            throw new Error('Supabase 不可用，無法同步資料');
        }
        
        try {
            console.log('🔄 開始同步待處理資料...');
            
            // 同步活動資料
            await this.syncEvents();
            
            // 同步報名資料
            await this.syncRegistrations();
            
            console.log('✅ 資料同步完成');
        } catch (error) {
            console.error('❌ 資料同步失敗:', error);
            throw error;
        }
    }
    
    // 同步活動資料
    async syncEvents() {
        // 直接從 Supabase 獲取最新資料
        const remoteEvents = await this.getRemoteEvents();
        
        // 更新本地儲存（僅作為快取）
        localStorage.setItem('events', JSON.stringify(remoteEvents));
        
        console.log('✅ 活動資料已從 Supabase 同步');
    }
    
    // 同步報名資料
    async syncRegistrations() {
        // 直接從 Supabase 獲取最新資料
        const remoteRegistrations = await this.getRemoteRegistrations();
        
        // 更新本地儲存（僅作為快取）
        localStorage.setItem('registrations', JSON.stringify(remoteRegistrations));
        
        console.log('✅ 報名資料已從 Supabase 同步');
    }
    
    // 獲取本地活動資料
    getLocalEvents() {
        try {
            const stored = localStorage.getItem('events');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('讀取本地活動資料失敗:', error);
            return [];
        }
    }
    
    // 獲取本地報名資料
    getLocalRegistrations() {
        try {
            const stored = localStorage.getItem('registrations');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('讀取本地報名資料失敗:', error);
            return [];
        }
    }
    
    // 獲取遠端活動資料
    async getRemoteEvents() {
        try {
            const { data, error } = await this.client
                .from(SUPABASE_CONFIG.tables.events)
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // 應用欄位映射
            return (data || []).map(event => this.mapEventFields(event));
        } catch (error) {
            console.error('獲取遠端活動資料失敗:', error);
            return [];
        }
    }
    
    // 獲取遠端報名資料
    async getRemoteRegistrations() {
        try {
            const { data, error } = await this.client
                .from(SUPABASE_CONFIG.tables.registrations)
                .select('*')
                .order('submitted_at', { ascending: false });
            
            if (error) throw error;
            
            // 應用欄位映射
            return (data || []).map(registration => this.mapRegistrationFields(registration));
        } catch (error) {
            console.error('獲取遠端報名資料失敗:', error);
            return [];
        }
    }
    
    // 合併活動資料
    mergeEvents(localEvents, remoteEvents) {
        const merged = [...remoteEvents];
        
        // 加入本地新增的活動
        localEvents.forEach(localEvent => {
            const exists = remoteEvents.find(remote => remote.id === localEvent.id);
            if (!exists) {
                merged.push(localEvent);
            }
        });
        
        // 統一欄位名稱映射
        return merged.map(event => this.mapEventFields(event));
    }
    
    // 映射活動欄位名稱
    mapEventFields(event) {
        const mapped = { ...event };
        
        // 將 event_time 映射為 time（前端使用）
        if (mapped.event_time !== undefined) {
            mapped.time = mapped.event_time;
            delete mapped.event_time;
        }
        
        // 將 created_at 映射為 createdAt（前端使用）
        if (mapped.created_at !== undefined) {
            mapped.createdAt = mapped.created_at;
            delete mapped.created_at;
        }
        
        // 將 updated_at 映射為 updatedAt（前端使用）
        if (mapped.updated_at !== undefined) {
            mapped.updatedAt = mapped.updated_at;
            delete mapped.updated_at;
        }
        
        return mapped;
    }
    
    // 映射活動欄位名稱（用於資料庫）
    mapEventFieldsForDB(event) {
        const mapped = { ...event };
        
        // 將 time 映射為 event_time（資料庫使用）
        if (mapped.time !== undefined) {
            mapped.event_time = mapped.time;
            delete mapped.time;
        }
        
        // 將 createdAt 映射為 created_at（資料庫使用）
        if (mapped.createdAt !== undefined) {
            mapped.created_at = mapped.createdAt;
            delete mapped.createdAt;
        }
        
        // 將 updatedAt 映射為 updated_at（資料庫使用）
        if (mapped.updatedAt !== undefined) {
            mapped.updated_at = mapped.updatedAt;
            delete mapped.updatedAt;
        }
        
        return mapped;
    }
    
    // 合併報名資料
    mergeRegistrations(localRegistrations, remoteRegistrations) {
        const merged = [...remoteRegistrations];
        
        // 加入本地新增的報名
        localRegistrations.forEach(localReg => {
            const exists = remoteRegistrations.find(remote => remote.id === localReg.id);
            if (!exists) {
                merged.push(localReg);
            }
        });
        
        // 統一欄位名稱映射
        return merged.map(registration => this.mapRegistrationFields(registration));
    }
    
    // 映射報名欄位名稱
    mapRegistrationFields(registration) {
        const mapped = { ...registration };
        
        // 將 submitted_at 映射為 submittedAt（前端使用）
        if (mapped.submitted_at !== undefined) {
            mapped.submittedAt = mapped.submitted_at;
            delete mapped.submitted_at;
        }
        
        // 將 updated_at 映射為 updatedAt（前端使用）
        if (mapped.updated_at !== undefined) {
            mapped.updatedAt = mapped.updated_at;
            delete mapped.updated_at;
        }
        
        return mapped;
    }
    
    // 映射報名欄位名稱（用於資料庫）
    mapRegistrationFieldsForDB(registration) {
        const mapped = { ...registration };
        
        // 將 submittedAt 映射為 submitted_at（資料庫使用）
        if (mapped.submittedAt !== undefined) {
            mapped.submitted_at = mapped.submittedAt;
            delete mapped.submittedAt;
        }
        
        // 將 updatedAt 映射為 updated_at（資料庫使用）
        if (mapped.updatedAt !== undefined) {
            mapped.updated_at = mapped.updatedAt;
            delete mapped.updatedAt;
        }
        
        return mapped;
    }
    
    // 上傳本地活動變更
    async uploadLocalEventChanges(localEvents, remoteEvents) {
        const newEvents = localEvents.filter(local => 
            !remoteEvents.find(remote => remote.id === local.id)
        );
        
        for (const event of newEvents) {
            try {
                await this.createEvent(event);
            } catch (error) {
                console.error('上傳活動失敗:', error);
            }
        }
    }
    
    // 上傳本地報名變更
    async uploadLocalRegistrationChanges(localRegistrations, remoteRegistrations) {
        const newRegistrations = localRegistrations.filter(local => 
            !remoteRegistrations.find(remote => remote.id === local.id)
        );
        
        for (const registration of newRegistrations) {
            try {
                await this.createRegistration(registration);
            } catch (error) {
                console.error('上傳報名失敗:', error);
            }
        }
    }
    
    // 建立活動
    async createEvent(eventData) {
        if (!this.isAvailable()) {
            throw new Error('Supabase 不可用');
        }
        
        // 映射欄位名稱（time -> event_time）
        const mappedData = this.mapEventFieldsForDB(eventData);
        
        const { data, error } = await this.client
            .from(SUPABASE_CONFIG.tables.events)
            .insert([mappedData])
            .select();
        
        if (error) throw error;
        return this.mapEventFields(data[0]);
    }
    
    // 更新活動
    async updateEvent(eventId, eventData) {
        if (!this.isAvailable()) {
            throw new Error('Supabase 不可用');
        }
        
        // 映射欄位名稱（time -> event_time）
        const mappedData = this.mapEventFieldsForDB(eventData);
        
        const { data, error } = await this.client
            .from(SUPABASE_CONFIG.tables.events)
            .update(mappedData)
            .eq('id', eventId)
            .select();
        
        if (error) throw error;
        return this.mapEventFields(data[0]);
    }
    
    // 刪除活動
    async deleteEvent(eventId) {
        if (!this.isAvailable()) {
            throw new Error('Supabase 不可用');
        }
        
        const { error } = await this.client
            .from(SUPABASE_CONFIG.tables.events)
            .delete()
            .eq('id', eventId);
        
        if (error) throw error;
    }
    
    // 建立報名
    async createRegistration(registrationData) {
        if (!this.isAvailable()) {
            throw new Error('Supabase 不可用');
        }
        
        // 映射欄位名稱
        const mappedData = this.mapRegistrationFieldsForDB(registrationData);
        
        const { data, error } = await this.client
            .from(SUPABASE_CONFIG.tables.registrations)
            .insert([mappedData])
            .select();
        
        if (error) throw error;
        return this.mapRegistrationFields(data[0]);
    }
    
    // 更新報名
    async updateRegistration(registrationId, registrationData) {
        if (!this.isAvailable()) {
            throw new Error('Supabase 不可用');
        }
        
        // 映射欄位名稱
        const mappedData = this.mapRegistrationFieldsForDB(registrationData);
        
        const { data, error } = await this.client
            .from(SUPABASE_CONFIG.tables.registrations)
            .update(mappedData)
            .eq('id', registrationId)
            .select();
        
        if (error) throw error;
        return this.mapRegistrationFields(data[0]);
    }
    
    // 刪除報名
    async deleteRegistration(registrationId) {
        if (!this.isAvailable()) {
            throw new Error('Supabase 不可用');
        }
        
        const { error } = await this.client
            .from(SUPABASE_CONFIG.tables.registrations)
            .delete()
            .eq('id', registrationId);
        
        if (error) throw error;
    }
}

// 建立全域實例
window.supabaseClient = new SupabaseClient();