// 速率限制器
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 15 * 60 * 1000; // 15分鐘
        this.maxRequests = 10; // 每15分鐘最多10次請求
        this.blockedIPs = new Map();
        this.blockDuration = 60 * 60 * 1000; // 1小時封鎖
    }
    
    // 獲取客戶端IP（簡化版本）
    getClientIP() {
        // 在實際應用中，這應該從伺服器端獲取真實IP
        // 這裡使用一個簡化的方法
        return 'client_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 檢查是否被封鎖
    isBlocked(identifier) {
        const blockInfo = this.blockedIPs.get(identifier);
        if (!blockInfo) return false;
        
        if (Date.now() > blockInfo.expiry) {
            this.blockedIPs.delete(identifier);
            return false;
        }
        
        return true;
    }
    
    // 封鎖IP
    blockIP(identifier, duration = this.blockDuration) {
        this.blockedIPs.set(identifier, {
            blockedAt: Date.now(),
            expiry: Date.now() + duration
        });
    }
    
    // 檢查速率限制
    checkRateLimit(identifier = null) {
        const clientId = identifier || this.getClientIP();
        
        // 檢查是否被封鎖
        if (this.isBlocked(clientId)) {
            return {
                allowed: false,
                reason: 'IP已被封鎖',
                retryAfter: this.blockedIPs.get(clientId).expiry - Date.now()
            };
        }
        
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        // 獲取或創建請求記錄
        if (!this.requests.has(clientId)) {
            this.requests.set(clientId, []);
        }
        
        const clientRequests = this.requests.get(clientId);
        
        // 清理過期的請求記錄
        const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
        this.requests.set(clientId, validRequests);
        
        // 檢查是否超過限制
        if (validRequests.length >= this.maxRequests) {
            // 超過限制，封鎖IP
            this.blockIP(clientId);
            
            return {
                allowed: false,
                reason: '請求過於頻繁，IP已被封鎖',
                retryAfter: this.blockDuration
            };
        }
        
        // 記錄此次請求
        validRequests.push(now);
        this.requests.set(clientId, validRequests);
        
        return {
            allowed: true,
            remaining: this.maxRequests - validRequests.length,
            resetTime: windowStart + this.windowMs
        };
    }
    
    // 清理過期資料
    cleanup() {
        const now = Date.now();
        
        // 清理過期的請求記錄
        for (const [clientId, requests] of this.requests.entries()) {
            const validRequests = requests.filter(timestamp => timestamp > now - this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(clientId);
            } else {
                this.requests.set(clientId, validRequests);
            }
        }
        
        // 清理過期的封鎖記錄
        for (const [clientId, blockInfo] of this.blockedIPs.entries()) {
            if (now > blockInfo.expiry) {
                this.blockedIPs.delete(clientId);
            }
        }
    }
    
    // 獲取統計資訊
    getStats() {
        return {
            activeClients: this.requests.size,
            blockedIPs: this.blockedIPs.size,
            totalRequests: Array.from(this.requests.values()).reduce((sum, requests) => sum + requests.length, 0)
        };
    }
}

// 表單提交速率限制器
class FormSubmissionLimiter extends RateLimiter {
    constructor() {
        super();
        this.windowMs = 5 * 60 * 1000; // 5分鐘
        this.maxRequests = 3; // 每5分鐘最多3次提交
    }
    
    // 檢查表單提交限制
    checkFormSubmission(formData) {
        const identifier = this.generateFormIdentifier(formData);
        return this.checkRateLimit(identifier);
    }
    
    // 生成表單識別符
    generateFormIdentifier(formData) {
        // 基於表單內容生成唯一識別符
        const key = `${formData.name}_${formData.class}_${formData.seatNumber}`;
        return 'form_' + this.hashString(key);
    }
    
    // 簡單的字串雜湊
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 轉換為32位整數
        }
        return Math.abs(hash).toString(36);
    }
}

// 全域速率限制器實例
window.rateLimiter = new RateLimiter();
window.formLimiter = new FormSubmissionLimiter();

// 定期清理
setInterval(() => {
    window.rateLimiter.cleanup();
    window.formLimiter.cleanup();
}, 5 * 60 * 1000); // 每5分鐘清理一次
