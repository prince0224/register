// 安全監控系統
class SecurityMonitor {
    constructor() {
        this.events = [];
        this.maxEvents = 1000;
        this.suspiciousPatterns = [
            /script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /eval\(/i,
            /expression\(/i
        ];
        
        this.init();
    }
    
    init() {
        // 監聽頁面載入
        this.logEvent('page_load', { url: window.location.href });
        
        // 監聽表單提交
        document.addEventListener('submit', (e) => {
            this.logEvent('form_submit', {
                formId: e.target.id,
                formAction: e.target.action
            });
        });
        
        // 監聽錯誤
        window.addEventListener('error', (e) => {
            this.logEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });
        
        // 監聽未處理的 Promise 拒絕
        window.addEventListener('unhandledrejection', (e) => {
            this.logEvent('unhandled_promise_rejection', {
                reason: e.reason?.toString()
            });
        });
        
        // 定期檢查可疑活動
        setInterval(() => {
            this.checkSuspiciousActivity();
        }, 30000); // 每30秒檢查一次
    }
    
    // 記錄安全事件
    logEvent(type, data = {}) {
        const event = {
            timestamp: new Date().toISOString(),
            type: type,
            data: data,
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer
        };
        
        this.events.push(event);
        
        // 限制事件數量
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
        
        // 檢查是否為可疑事件
        if (this.isSuspiciousEvent(event)) {
            this.handleSuspiciousEvent(event);
        }
        
        console.log('Security Event:', event);
    }
    
    // 檢查是否為可疑事件
    isSuspiciousEvent(event) {
        // 檢查可疑模式
        const eventString = JSON.stringify(event);
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(eventString)) {
                return true;
            }
        }
        
        // 檢查異常頻率
        const recentEvents = this.events.filter(e => 
            Date.now() - new Date(e.timestamp).getTime() < 60000 // 最近1分鐘
        );
        
        if (recentEvents.length > 100) { // 提高閾值，避免正常操作被誤判
            return true;
        }
        
        return false;
    }
    
    // 處理可疑事件
    handleSuspiciousEvent(event) {
        console.warn('Suspicious activity detected:', event);
        
        // 記錄到本地儲存（在實際應用中應該發送到安全日誌系統）
        try {
            const suspiciousEvents = JSON.parse(localStorage.getItem('suspiciousEvents') || '[]');
            suspiciousEvents.push(event);
            localStorage.setItem('suspiciousEvents', JSON.stringify(suspiciousEvents.slice(-100)));
        } catch (error) {
            console.error('Failed to log suspicious event:', error);
        }
        
        // 在實際應用中，這裡應該發送警報到安全監控系統
        this.sendSecurityAlert(event);
    }
    
    // 發送安全警報
    sendSecurityAlert(event) {
        // 在實際應用中，這裡應該發送到安全監控系統
        console.error('SECURITY ALERT:', event);
        
        // 可以選擇阻止進一步的操作
        // this.blockSuspiciousActivity();
    }
    
    // 檢查可疑活動
    checkSuspiciousActivity() {
        const now = Date.now();
        const recentEvents = this.events.filter(e => 
            now - new Date(e.timestamp).getTime() < 300000 // 最近5分鐘
        );
        
        // 檢查異常頻率
        const eventCounts = {};
        recentEvents.forEach(event => {
            eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        });
        
        // 如果某種事件類型過於頻繁
        for (const [type, count] of Object.entries(eventCounts)) {
            if (count > 50) { // 提高閾值，避免正常操作被誤判
                this.logEvent('suspicious_frequency', {
                    eventType: type,
                    count: count,
                    timeWindow: '5 minutes'
                });
            }
        }
    }
    
    // 獲取安全報告
    getSecurityReport() {
        const now = Date.now();
        const last24Hours = this.events.filter(e => 
            now - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000
        );
        
        const eventTypes = {};
        last24Hours.forEach(event => {
            eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
        });
        
        return {
            totalEvents: last24Hours.length,
            eventTypes: eventTypes,
            suspiciousEvents: last24Hours.filter(e => this.isSuspiciousEvent(e)).length,
            lastEvent: this.events[this.events.length - 1]
        };
    }
    
    // 清理舊事件
    cleanup() {
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7天前
        this.events = this.events.filter(e => 
            new Date(e.timestamp).getTime() > cutoff
        );
    }
}

// 表單安全監控
class FormSecurityMonitor {
    constructor() {
        this.submissionAttempts = new Map();
        this.maxAttempts = 5;
        this.windowMs = 10 * 60 * 1000; // 10分鐘
    }
    
    // 監控表單提交
    monitorFormSubmission(formData) {
        const identifier = this.generateIdentifier(formData);
        const now = Date.now();
        
        if (!this.submissionAttempts.has(identifier)) {
            this.submissionAttempts.set(identifier, []);
        }
        
        const attempts = this.submissionAttempts.get(identifier);
        
        // 清理過期嘗試
        const validAttempts = attempts.filter(timestamp => now - timestamp < this.windowMs);
        this.submissionAttempts.set(identifier, validAttempts);
        
        // 檢查是否超過限制
        if (validAttempts.length >= this.maxAttempts) {
            window.securityMonitor.logEvent('form_abuse_detected', {
                identifier: identifier,
                attempts: validAttempts.length,
                timeWindow: this.windowMs
            });
            
            return false;
        }
        
        // 記錄此次嘗試
        validAttempts.push(now);
        this.submissionAttempts.set(identifier, validAttempts);
        
        return true;
    }
    
    // 生成識別符
    generateIdentifier(formData) {
        return `${formData.name}_${formData.class}_${formData.seatNumber}`;
    }
}

// 初始化安全監控
window.securityMonitor = new SecurityMonitor();
window.formSecurityMonitor = new FormSecurityMonitor();

// 定期清理
setInterval(() => {
    window.securityMonitor.cleanup();
}, 60 * 60 * 1000); // 每小時清理一次
