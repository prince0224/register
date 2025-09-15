// Supabase 配置檔案
// 請將以下值替換為您的 Supabase 專案資訊

const SUPABASE_CONFIG = {
    // 您的 Supabase 專案 URL
    url: 'https://mfizfnyzinwuqlykllhy.supabase.co',
    
    // 您的 Supabase 公開 API Key
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1maXpmbnl6aW53dXFseWtsbGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ5NTEsImV4cCI6MjA3MzQ4MDk1MX0.f2S1FQBfU6aeWPqIcAdM72N6yqx6dZJAe5-Mm9H7M4E',
    
    // 資料庫表格名稱
    tables: {
        events: 'events',
        registrations: 'registrations'
    }
};

// 檢查配置是否完整
function validateConfig() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || 
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ 請先設定您的 Supabase 配置資訊');
        return false;
    }
    
    // 檢查 URL 格式
    if (!SUPABASE_CONFIG.url.startsWith('https://') || !SUPABASE_CONFIG.url.includes('.supabase.co')) {
        console.warn('⚠️ Supabase URL 格式不正確');
        return false;
    }
    
    // 檢查 API Key 格式
    if (!SUPABASE_CONFIG.anonKey.startsWith('eyJ')) {
        console.warn('⚠️ Supabase API Key 格式不正確');
        return false;
    }
    
    console.log('✅ Supabase 配置驗證通過');
    return true;
}

// 匯出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, validateConfig };
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.validateConfig = validateConfig;
}

