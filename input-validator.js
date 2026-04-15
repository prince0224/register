// 安全輸入驗證和清理系統
class SecureInputValidator {
    constructor() {
        this.patterns = {
            // 姓名模式（只允許中文、英文字母和空格）
            name: /^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/,
            
            // 班級模式（只允許中文）
            class: /^[忠孝仁愛]$/,
            
            // 座號模式（1-30）
            seatNumber: /^([1-9]|[12][0-9]|30)$/,
            
            // 年級模式
            grade: /^一年級$/,
            
            // 日期模式
            date: /^\d{4}-\d{2}-\d{2}$/,
            
            // 備註模式（允許中文、英文、數字、標點符號，限制長度）
            notes: /^[\u4e00-\u9fa5a-zA-Z0-9\s.,!?;:()（）【】""''""''，。！？；：]{0,500}$/
        };
        
        this.dangerousPatterns = [
            // SQL 注入模式
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|OR|AND)\b)/i,
            
            // XSS 模式
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            
            // 路徑遍歷模式
            /\.\.\//g,
            /\.\.\\/g,
            
            // 命令注入模式
            /[;&|`$()]/g
        ];
    }
    
    // 主要驗證方法
    validate(fieldName, value) {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: '輸入不能為空' };
        }
        
        // 檢查危險模式
        const dangerousCheck = this.checkDangerousPatterns(value);
        if (!dangerousCheck.isValid) {
            return dangerousCheck;
        }
        
        // 根據欄位類型進行特定驗證
        switch (fieldName) {
            case 'name':
                return this.validateName(value);
            case 'class':
                return this.validateClass(value);
            case 'seatNumber':
                return this.validateSeatNumber(value);
            case 'grade':
                return this.validateGrade(value);
            case 'date':
                return this.validateDate(value);
            case 'notes':
                return this.validateNotes(value);
            default:
                return this.validateGeneric(value);
        }
    }
    
    // 檢查危險模式
    checkDangerousPatterns(value) {
        for (const pattern of this.dangerousPatterns) {
            if (pattern.test(value)) {
                return {
                    isValid: false,
                    error: '輸入包含不安全的內容，請重新輸入'
                };
            }
        }
        return { isValid: true };
    }
    
    // 驗證姓名
    validateName(value) {
        const trimmed = value.trim();
        
        if (trimmed.length < 2) {
            return { isValid: false, error: '姓名至少需要2個字元' };
        }
        
        if (trimmed.length > 20) {
            return { isValid: false, error: '姓名不能超過20個字元' };
        }
        
        if (!this.patterns.name.test(trimmed)) {
            return { isValid: false, error: '姓名只能包含中文、英文字母和空格' };
        }
        
        return { isValid: true, cleaned: trimmed };
    }
    
    // 驗證班級
    validateClass(value) {
        if (!this.patterns.class.test(value)) {
            return { isValid: false, error: '請選擇有效的班級' };
        }
        
        return { isValid: true, cleaned: value };
    }
    
    // 驗證座號
    validateSeatNumber(value) {
        const numValue = parseInt(value);
        
        if (isNaN(numValue)) {
            return { isValid: false, error: '座號必須是數字' };
        }
        
        if (numValue < 1 || numValue > 30) {
            return { isValid: false, error: '座號必須在1-30之間' };
        }
        
        return { isValid: true, cleaned: numValue.toString() };
    }
    
    // 驗證年級
    validateGrade(value) {
        if (!this.patterns.grade.test(value)) {
            return { isValid: false, error: '年級格式不正確' };
        }
        
        return { isValid: true, cleaned: value };
    }
    
    // 驗證日期
    validateDate(value) {
        if (!this.patterns.date.test(value)) {
            return { isValid: false, error: '日期格式不正確' };
        }
        
        const date = new Date(value);
        const today = new Date();
        
        if (isNaN(date.getTime())) {
            return { isValid: false, error: '無效的日期' };
        }
        
        if (date < today) {
            return { isValid: false, error: '日期不能是過去的日期' };
        }
        
        return { isValid: true, cleaned: value };
    }
    
    // 驗證備註
    validateNotes(value) {
        const trimmed = value.trim();
        
        if (trimmed.length > 500) {
            return { isValid: false, error: '備註不能超過500個字元' };
        }
        
        if (trimmed.length > 0 && !this.patterns.notes.test(trimmed)) {
            return { isValid: false, error: '備註包含無效字元' };
        }
        
        return { isValid: true, cleaned: trimmed };
    }
    
    // 通用驗證
    validateGeneric(value) {
        const trimmed = value.trim();
        
        if (trimmed.length === 0) {
            return { isValid: false, error: '輸入不能為空' };
        }
        
        if (trimmed.length > 100) {
            return { isValid: false, error: '輸入不能超過100個字元' };
        }
        
        return { isValid: true, cleaned: trimmed };
    }
    
    // 清理 HTML 標籤
    sanitizeHtml(input) {
        if (!input || typeof input !== 'string') return '';
        
        // 移除所有 HTML 標籤
        return input.replace(/<[^>]*>/g, '');
    }
    
    // 清理 SQL 注入
    sanitizeSql(input) {
        if (!input || typeof input !== 'string') return '';
        
        // 移除危險的 SQL 字元
        return input.replace(/['"\\;]/g, '');
    }
    
    // 清理 XSS
    sanitizeXss(input) {
        if (!input || typeof input !== 'string') return '';
        
        // 轉義 HTML 特殊字元
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    // 完整清理
    sanitize(input) {
        if (!input || typeof input !== 'string') return '';
        
        let cleaned = input;
        cleaned = this.sanitizeHtml(cleaned);
        cleaned = this.sanitizeSql(cleaned);
        cleaned = this.sanitizeXss(cleaned);
        
        return cleaned.trim();
    }
    
    // 驗證表單
    validateForm(formData) {
        const errors = {};
        const cleanedData = {};
        
        for (const [fieldName, value] of Object.entries(formData)) {
            const validation = this.validate(fieldName, value);
            
            if (!validation.isValid) {
                errors[fieldName] = validation.error;
            } else {
                cleanedData[fieldName] = validation.cleaned || value;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors,
            cleanedData: cleanedData
        };
    }
}

// 匯出驗證器
window.SecureInputValidator = SecureInputValidator;
