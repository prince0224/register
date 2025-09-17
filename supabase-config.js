// Supabase 設定檔 - 安全版本
// 使用環境變數保護敏感資訊

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ljuixaaysvbzmrmhpnlb.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdWl4YWF5c3Ziem1ybWhwbmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5Njk0NDIsImV4cCI6MjA3MzU0NTQ0Mn0.kYXDdxLS6fSYulCJ9rOmSo2G9Sj2xluPVSVZNe11GjE';

// 初始化 Supabase 客戶端
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 匯出客戶端供其他檔案使用
window.supabaseClient = supabaseClient;

// 測試連接
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('events')
            .select('count')
            .limit(1);
        
        if (error) throw error;
        console.log('✅ Supabase 連接成功');
        return true;
    } catch (error) {
        console.error('❌ Supabase 連接失敗:', error);
        return false;
    }
}

// 頁面載入時測試連接
document.addEventListener('DOMContentLoaded', () => {
    testSupabaseConnection();
});

// 匯出測試函數
window.testSupabaseConnection = testSupabaseConnection;
