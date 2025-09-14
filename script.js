// 簽名功能實作
class SignaturePad {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // 設定畫布樣式
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.init();
    }
    
    init() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // 觸控事件（支援手機和平板）
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // 防止觸控時頁面滾動
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                         e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    isEmpty() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        return imageData.data.every(pixel => pixel === 0);
    }
    
    getSignatureData() {
        return this.canvas.toDataURL('image/png');
    }
}

// 表單驗證
class FormValidator {
    constructor(form) {
        this.form = form;
        this.rules = {
            name: {
                required: true,
                minLength: 2,
                pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            phone: {
                required: true,
                pattern: /^[\d\-\+\(\)\s]+$/
            },
            event: {
                required: true
            },
            date: {
                required: true
            }
        };
    }
    
    validate() {
        let isValid = true;
        const errors = {};
        
        for (const [fieldName, rules] of Object.entries(this.rules)) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (!field) continue;
            
            const value = field.value.trim();
            const fieldErrors = [];
            
            // 必填驗證
            if (rules.required && !value) {
                fieldErrors.push(`${this.getFieldLabel(fieldName)}為必填項目`);
            }
            
            // 最小長度驗證
            if (value && rules.minLength && value.length < rules.minLength) {
                fieldErrors.push(`${this.getFieldLabel(fieldName)}至少需要${rules.minLength}個字元`);
            }
            
            // 格式驗證
            if (value && rules.pattern && !rules.pattern.test(value)) {
                fieldErrors.push(`${this.getFieldLabel(fieldName)}格式不正確`);
            }
            
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
                isValid = false;
                this.showFieldError(field, fieldErrors[0]);
            } else {
                this.clearFieldError(field);
            }
        }
        
        return { isValid, errors };
    }
    
    getFieldLabel(fieldName) {
        const labels = {
            name: '姓名',
            email: '電子郵件',
            phone: '聯絡電話',
            event: '報名活動',
            date: '活動日期'
        };
        return labels[fieldName] || fieldName;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        field.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.9em';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.style.borderColor = '';
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
}

// 主要應用程式
class RegistrationApp {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.signatureCanvas = document.getElementById('signatureCanvas');
        this.signatureDataInput = document.getElementById('signatureData');
        this.successMessage = document.getElementById('successMessage');
        
        this.signaturePad = null;
        this.validator = null;
        
        this.init();
    }
    
    init() {
        // 初始化簽名板
        this.signaturePad = new SignaturePad(this.signatureCanvas);
        
        // 初始化表單驗證器
        this.validator = new FormValidator(this.form);
        
        // 綁定事件
        this.bindEvents();
        
        // 設定預設日期（明天）
        this.setDefaultDate();
        
        // 載入活動選項
        this.loadEventOptions();
    }
    
    bindEvents() {
        // 表單提交
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // 清除簽名
        document.getElementById('clearSignature').addEventListener('click', () => {
            this.signaturePad.clear();
        });
        
        // 儲存簽名
        document.getElementById('saveSignature').addEventListener('click', () => {
            this.saveSignature();
        });
        
        // 表單重置
        this.form.addEventListener('reset', () => {
            this.signaturePad.clear();
            this.signatureDataInput.value = '';
            this.hideSuccessMessage();
        });
        
        // 即時驗證
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validator.validate();
            });
        });
    }
    
    setDefaultDate() {
        const dateInput = document.getElementById('date');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    loadEventOptions() {
        const eventSelect = document.getElementById('event');
        
        // 清空現有選項（保留預設選項）
        eventSelect.innerHTML = '<option value="">請選擇活動</option>';
        
        try {
            // 從localStorage載入活動資料
            const storedEvents = localStorage.getItem('events');
            if (storedEvents) {
                const events = JSON.parse(storedEvents);
                
                // 只顯示啟用的活動
                const activeEvents = events.filter(event => event.active);
                
                if (activeEvents.length === 0) {
                    // 如果沒有啟用的活動，顯示預設選項
                    eventSelect.innerHTML = `
                        <option value="">請選擇活動</option>
                        <option value="group-counseling">團體輔導</option>
                        <option value="volunteer-growth">志工成長班</option>
                        <option value="parent-education">親職教育講座</option>
                    `;
                } else {
                    // 加入動態活動選項
                    activeEvents.forEach(event => {
                        const option = document.createElement('option');
                        option.value = event.id;
                        option.textContent = `${event.name} (${this.formatEventDate(event.date)})`;
                        eventSelect.appendChild(option);
                    });
                }
            } else {
                // 如果沒有活動資料，顯示預設選項
                eventSelect.innerHTML = `
                    <option value="">請選擇活動</option>
                    <option value="group-counseling">團體輔導</option>
                    <option value="volunteer-growth">志工成長班</option>
                    <option value="parent-education">親職教育講座</option>
                `;
            }
        } catch (error) {
            console.error('載入活動選項時發生錯誤:', error);
        }
    }
    
    formatEventDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW');
    }
    
    saveSignature() {
        if (this.signaturePad.isEmpty()) {
            alert('請先簽名再儲存');
            return;
        }
        
        const signatureData = this.signaturePad.getSignatureData();
        this.signatureDataInput.value = signatureData;
        
        // 顯示成功訊息
        const saveBtn = document.getElementById('saveSignature');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '已儲存';
        saveBtn.style.background = '#28a745';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // 驗證表單
        const validation = this.validator.validate();
        if (!validation.isValid) {
            this.showError('請修正表單中的錯誤');
            return;
        }
        
        // 檢查簽名
        if (this.signaturePad.isEmpty()) {
            alert('請完成電子簽名');
            return;
        }
        
        // 儲存簽名資料
        this.saveSignature();
        
        // 顯示載入狀態
        this.showLoading();
        
        try {
            // 模擬提交到伺服器
            await this.submitForm();
            
            // 顯示成功訊息
            this.showSuccessMessage();
            
        } catch (error) {
            this.showError('提交失敗，請稍後再試');
        } finally {
            this.hideLoading();
        }
    }
    
    async submitForm() {
        // 收集表單資料
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // 加入系統資訊
        data.id = this.generateId();
        data.submittedAt = new Date().toISOString();
        data.status = 'pending';
        
        // 儲存到localStorage
        this.saveToLocalStorage(data);
        
        // 模擬API呼叫
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('提交的資料:', data);
                resolve();
            }, 2000);
        });
    }
    
    generateId() {
        return 'reg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    saveToLocalStorage(data) {
        try {
            // 取得現有的報名資料
            const existingData = localStorage.getItem('registrations');
            const registrations = existingData ? JSON.parse(existingData) : [];
            
            // 加入新的報名資料
            registrations.push(data);
            
            // 儲存回localStorage
            localStorage.setItem('registrations', JSON.stringify(registrations));
            
            console.log('報名資料已儲存到本地儲存');
        } catch (error) {
            console.error('儲存報名資料時發生錯誤:', error);
        }
    }
    
    showLoading() {
        this.form.classList.add('loading');
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';
    }
    
    hideLoading() {
        this.form.classList.remove('loading');
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = '提交報名';
    }
    
    showSuccessMessage() {
        this.form.style.display = 'none';
        this.successMessage.style.display = 'block';
        
        // 滾動到頂部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    hideSuccessMessage() {
        this.form.style.display = 'block';
        this.successMessage.style.display = 'none';
    }
    
    showError(message) {
        alert(message);
    }
}

// 當頁面載入完成時初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationApp();
});

// 防止頁面意外關閉時遺失資料
window.addEventListener('beforeunload', (e) => {
    const form = document.getElementById('registrationForm');
    const hasData = Array.from(form.querySelectorAll('input, select, textarea'))
        .some(field => field.value.trim() !== '');
    
    if (hasData) {
        e.preventDefault();
        e.returnValue = '您有未儲存的資料，確定要離開嗎？';
    }
});
