// 安全認證管理器
class SecureAuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.sessionExpiry = null;
        this.maxLoginAttempts = 3;
        this.lockoutTime = 15 * 60 * 1000; // 15分鐘
        this.loginAttempts = 0;
        this.lastAttemptTime = null;
        
        this.init();
    }
    
    init() {
        // 檢查是否有有效的會話
        this.checkExistingSession();
        
        // 設置會話過期檢查
        setInterval(() => {
            this.checkSessionExpiry();
        }, 60000); // 每分鐘檢查一次
    }
    
    // 生成安全的隨機字串
    generateSecureToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        for (let i = 0; i < length; i++) {
            result += chars[array[i] % chars.length];
        }
        return result;
    }
    
    // 安全的密碼雜湊（使用 Web Crypto API）
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // 驗證密碼
    async verifyPassword(password, hash) {
        const passwordHash = await this.hashPassword(password);
        return passwordHash === hash;
    }
    
    // 檢查登入嘗試限制
    checkLoginAttempts() {
        const now = Date.now();
        
        // 如果超過鎖定時間，重置嘗試次數
        if (this.lastAttemptTime && (now - this.lastAttemptTime) > this.lockoutTime) {
            this.loginAttempts = 0;
            this.lastAttemptTime = null;
        }
        
        // 檢查是否超過最大嘗試次數
        if (this.loginAttempts >= this.maxLoginAttempts) {
            const remainingTime = Math.ceil((this.lockoutTime - (now - this.lastAttemptTime)) / 1000 / 60);
            throw new Error(`登入嘗試次數過多，請 ${remainingTime} 分鐘後再試`);
        }
    }
    
    // 安全的登入驗證
    async authenticate(username, password) {
        try {
            // 檢查登入嘗試限制
            this.checkLoginAttempts();
            
            // 驗證輸入
            if (!this.validateInput(username) || !this.validateInput(password)) {
                throw new Error('輸入包含無效字元');
            }
            
            // 這裡應該與伺服器端驗證，暫時使用本地驗證
            const validCredentials = await this.validateCredentials(username, password);
            
            if (validCredentials) {
                // 登入成功，重置嘗試次數
                this.loginAttempts = 0;
                this.lastAttemptTime = null;
                
                // 創建會話
                await this.createSession(username);
                return true;
            } else {
                // 登入失敗，增加嘗試次數
                this.loginAttempts++;
                this.lastAttemptTime = Date.now();
                throw new Error('帳號或密碼錯誤');
            }
        } catch (error) {
            console.error('認證失敗:', error);
            throw error;
        }
    }
    
    // 驗證憑證（這裡應該與伺服器端通訊）
    async validateCredentials(username, password) {
        // 安全的預設憑證（應該從伺服器端獲取）
        const secureCredentials = {
            username: 'admin',
            passwordHash: await this.hashPassword('SecureAdmin123!')
        };
        
        if (username !== secureCredentials.username) {
            return false;
        }
        
        return await this.verifyPassword(password, secureCredentials.passwordHash);
    }
    
    // 創建安全會話
    async createSession(username) {
        this.sessionToken = this.generateSecureToken(64);
        this.sessionExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2小時過期
        this.isAuthenticated = true;
        
        // 儲存會話到安全的儲存空間
        const sessionData = {
            token: this.sessionToken,
            expiry: this.sessionExpiry,
            username: username,
            created: Date.now()
        };
        
        // 使用 sessionStorage 而不是 localStorage（更安全）
        sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
        
        console.log('安全會話已創建');
    }
    
    // 檢查現有會話
    checkExistingSession() {
        try {
            const sessionData = sessionStorage.getItem('adminSession');
            if (!sessionData) return false;
            
            const session = JSON.parse(sessionData);
            const now = Date.now();
            
            // 檢查會話是否過期
            if (now > session.expiry) {
                this.logout();
                return false;
            }
            
            // 恢復會話
            this.sessionToken = session.token;
            this.sessionExpiry = session.expiry;
            this.isAuthenticated = true;
            
            console.log('會話已恢復');
            return true;
        } catch (error) {
            console.error('會話檢查失敗:', error);
            this.logout();
            return false;
        }
    }
    
    // 檢查會話過期
    checkSessionExpiry() {
        if (this.isAuthenticated && Date.now() > this.sessionExpiry) {
            console.log('會話已過期');
            this.logout();
        }
    }
    
    // 安全登出
    logout() {
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.sessionExpiry = null;
        
        // 清除會話資料
        sessionStorage.removeItem('adminSession');
        
        console.log('已安全登出');
    }
    
    // 輸入驗證
    validateInput(input) {
        if (!input || typeof input !== 'string') return false;
        
        // 檢查長度
        if (input.length < 3 || input.length > 50) return false;
        
        // 檢查是否包含危險字元
        const dangerousChars = /[<>'"&]/;
        if (dangerousChars.test(input)) return false;
        
        // 檢查是否包含 SQL 注入模式
        const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i;
        if (sqlPatterns.test(input)) return false;
        
        return true;
    }
    
    // 獲取會話資訊
    getSessionInfo() {
        if (!this.isAuthenticated) return null;
        
        return {
            isAuthenticated: this.isAuthenticated,
            expiry: this.sessionExpiry,
            remainingTime: Math.max(0, this.sessionExpiry - Date.now())
        };
    }
}

// 匯出認證管理器
window.SecureAuthManager = SecureAuthManager;
