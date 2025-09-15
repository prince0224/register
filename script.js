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

// 連線狀態管理
class ConnectionManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.bindEvents();
    }
    
    bindEvents() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onNetworkChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onNetworkChange(false);
        });
    }
    
    onNetworkChange(isOnline) {
        const statusElement = document.getElementById('networkStatus');
        if (statusElement) {
            statusElement.textContent = isOnline ? '已連線' : '連線中斷';
            statusElement.className = isOnline ? 'status-online' : 'status-offline';
        }
        
        // 顯示連線狀態提示
        this.showConnectionStatus(isOnline);
    }
    
    showConnectionStatus(isOnline) {
        if (!isOnline) {
            this.showOfflineWarning();
        } else {
            this.hideOfflineWarning();
        }
    }
    
    showOfflineWarning() {
        let warning = document.getElementById('offlineWarning');
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'offlineWarning';
            warning.className = 'offline-warning';
            warning.innerHTML = `
                <div class="warning-content">
                    <span class="warning-icon">⚠️</span>
                    <span class="warning-text">網路連線中斷，請檢查網路設定後重新整理頁面</span>
                </div>
            `;
            document.body.appendChild(warning);
        }
        warning.style.display = 'block';
    }
    
    hideOfflineWarning() {
        const warning = document.getElementById('offlineWarning');
        if (warning) {
            warning.style.display = 'none';
        }
    }
    
    async submitToServer(data) {
        if (!this.isOnline) {
            throw new Error('網路連線中斷，無法提交資料');
        }
        
        // 使用 Supabase 提交資料
        try {
            const { data: result, error } = await window.supabaseClient
                .from('registrations')
                .insert([data])
                .select();
            
            if (error) throw error;
            
            console.log('資料提交成功:', result);
            return result;
        } catch (error) {
            console.error('Supabase 提交失敗:', error);
            throw new Error('伺服器連線失敗，請稍後再試');
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
        
        // 頁面元素
        this.eventSelectionPage = document.getElementById('eventSelectionPage');
        this.registrationPage = document.getElementById('registrationPage');
        this.eventsGrid = document.getElementById('eventsGrid');
        this.selectedEventInfo = document.getElementById('selectedEventInfo');
        this.selectedEventIdInput = document.getElementById('selectedEventId');
        this.headerDescription = document.getElementById('headerDescription');
        this.eventPosterDisplay = document.getElementById('eventPosterDisplay');
        this.eventPosterImg = document.getElementById('eventPosterImg');
        
        this.signaturePad = null;
        this.validator = null;
        this.selectedEvent = null;
        this.events = [];
        this.connectionManager = new ConnectionManager();
        
        this.init();
    }
    
    init() {
        // 初始化簽名板
        this.signaturePad = new SignaturePad(this.signatureCanvas);
        
        // 初始化表單驗證器
        this.validator = new FormValidator(this.form);
        
        // 綁定事件
        this.bindEvents();
        
        // 載入活動資料
        this.loadEvents();
        
        // 檢查URL參數
        this.checkUrlParams();
        
        // 顯示活動選擇頁面
        this.showEventSelection();
        
        // 檢查是否為首次使用，顯示家長提示
        this.checkFirstTimeUser();
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
        
        // 海報大圖顯示
        document.getElementById('posterModal').addEventListener('click', (e) => {
            if (e.target.id === 'posterModal' || e.target.classList.contains('close')) {
                document.getElementById('posterModal').style.display = 'none';
            }
        });
        
        // 返回活動選擇
        document.getElementById('backToEvents').addEventListener('click', () => {
            this.showEventSelection();
        });
        
        // 家長提示關閉
        document.getElementById('closeTips').addEventListener('click', () => {
            this.hideParentTips();
        });
        
        // 檢查連線狀態
        this.checkConnectionStatus();
    }
    
    loadEvents() {
        try {
            const storedEvents = localStorage.getItem('events');
            if (storedEvents) {
                this.events = JSON.parse(storedEvents);
            }
            
            // 如果連線正常，從伺服器載入最新活動資料
            if (this.connectionManager.isOnline) {
                this.loadEventsFromServer();
            }
        } catch (error) {
            console.error('載入活動資料時發生錯誤:', error);
            this.events = [];
        }
    }
    
    async loadEventsFromServer() {
        try {
            // 從伺服器獲取最新活動資料
            const serverEvents = await this.fetchEventsFromServer();
            if (serverEvents && serverEvents.length > 0) {
                this.events = serverEvents;
                localStorage.setItem('events', JSON.stringify(serverEvents));
                this.renderEvents(); // 重新渲染活動列表
                console.log('活動資料已從伺服器載入');
            }
        } catch (error) {
            console.log('無法從伺服器載入活動資料，使用本地快取資料');
            this.showError('無法載入最新活動資料，請檢查網路連線');
        }
    }
    
    async fetchEventsFromServer() {
        // 使用 Supabase 載入活動資料
        try {
            const { data, error } = await window.supabaseClient
                .from('events')
                .select('*')
                .eq('active', true)
                .order('date', { ascending: true });
            
            if (error) throw error;
            
            // 轉換資料格式以符合前端需求
            const formattedEvents = data.map(event => ({
                id: event.id,
                name: event.name,
                type: event.type,
                date: event.date,
                time: event.time,
                location: event.location,
                capacity: event.capacity,
                fee: event.fee,
                description: event.description,
                active: event.active,
                poster: event.poster_url
            }));
            
            return formattedEvents;
        } catch (error) {
            console.error('載入活動資料失敗:', error);
            throw error;
        }
    }
    
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event');
        if (eventId) {
            const event = this.events.find(e => e.id === eventId && e.active);
            if (event) {
                this.selectEvent(event);
            }
        }
    }
    
    showEventSelection() {
        this.eventSelectionPage.style.display = 'block';
        this.registrationPage.style.display = 'none';
        this.headerDescription.textContent = '請選擇您要報名的活動';
        this.renderEvents();
        
        // 更新URL
        window.history.pushState({}, '', window.location.pathname);
    }
    
    showRegistration(event) {
        this.eventSelectionPage.style.display = 'none';
        this.registrationPage.style.display = 'block';
        this.headerDescription.textContent = `報名：${event.name}`;
        this.displaySelectedEventInfo(event);
        this.setEventDate(event.date);
        
        // 更新URL
        window.history.pushState({}, '', `${window.location.pathname}?event=${event.id}`);
    }
    
    renderEvents() {
        const activeEvents = this.events.filter(event => event.active);
        
        if (activeEvents.length === 0) {
            this.eventsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>目前沒有可報名的活動</h3>
                    <p>請稍後再來查看</p>
                </div>
            `;
            return;
        }
        
        this.eventsGrid.innerHTML = activeEvents.map(event => `
            <div class="event-card" onclick="registrationApp.selectEvent('${event.id}')">
                <div class="event-poster-main">
                    ${event.poster ? 
                        `<img src="${event.poster}" alt="${event.name}海報" style="width: 100%; height: 100%; object-fit: cover;">` :
                        `<div style="text-align: center;">
                            <div style="font-size: 2em; margin-bottom: 10px;">📅</div>
                            <div>${event.name}</div>
                        </div>`
                    }
                </div>
                <div class="event-card-content">
                    <div class="event-title">${event.name}</div>
                    <div class="event-type">${this.getEventTypeName(event.type)}</div>
                    
                    <div class="event-details">
                        <div class="event-detail">
                            <span class="event-detail-label">日期：</span>
                            <span>${this.formatEventDate(event.date)}</span>
                        </div>
                        ${event.time ? `
                        <div class="event-detail">
                            <span class="event-detail-label">時間：</span>
                            <span>${event.time}</span>
                        </div>
                        ` : ''}
                        ${event.location ? `
                        <div class="event-detail">
                            <span class="event-detail-label">地點：</span>
                            <span>${event.location}</span>
                        </div>
                        ` : ''}
                        ${event.capacity ? `
                        <div class="event-detail">
                            <span class="event-detail-label">人數：</span>
                            <span>限${event.capacity}人</span>
                        </div>
                        ` : ''}
                        ${event.fee ? `
                        <div class="event-detail">
                            <span class="event-detail-label">費用：</span>
                            <span>NT$ ${event.fee}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${event.description ? `
                    <div class="event-description">${event.description}</div>
                    ` : ''}
                    
                    <button class="register-button" onclick="event.stopPropagation(); registrationApp.selectEvent('${event.id}')">
                        立即報名
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    selectEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            this.selectedEvent = event;
            this.showRegistration(event);
        }
    }
    
    displaySelectedEventInfo(event) {
        this.selectedEventInfo.innerHTML = `
            <h3>${event.name}</h3>
            <p>${this.getEventTypeName(event.type)} • ${this.formatEventDate(event.date)}${event.time ? ` • ${event.time}` : ''}</p>
        `;
        
        this.selectedEventIdInput.value = event.id;
        
        // 顯示活動海報
        if (event.poster) {
            this.eventPosterImg.src = event.poster;
            this.eventPosterImg.alt = `${event.name}海報`;
            this.eventPosterImg.onclick = () => this.openPosterInNewWindow(event.poster, event.name);
            this.eventPosterDisplay.style.display = 'block';
        } else {
            this.eventPosterDisplay.style.display = 'none';
        }
    }
    
    setEventDate(eventDate) {
        const dateInput = document.getElementById('date');
        dateInput.value = eventDate;
    }
    
    getEventTypeName(type) {
        const types = {
            'group-counseling': '團體輔導',
            'volunteer-growth': '志工成長班',
            'parent-education': '親職教育講座'
        };
        return types[type] || type;
    }
    
    
    formatEventDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW');
    }
    
    
    showPosterModal(posterSrc) {
        const modal = document.getElementById('posterModal');
        const modalImg = document.getElementById('posterModalImg');
        
        modalImg.src = posterSrc;
        modal.style.display = 'block';
    }
    
    openPosterInNewWindow(posterSrc, eventName) {
        // 建立新視窗的HTML內容
        const newWindowHTML = `
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${eventName} - 活動海報</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        background: #000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        font-family: 'Microsoft JhengHei', 'PingFang TC', 'Helvetica Neue', Arial, sans-serif;
                    }
                    
                    .poster-container {
                        position: relative;
                        max-width: 100vw;
                        max-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .poster-image {
                        max-width: 100%;
                        max-height: 100vh;
                        width: auto;
                        height: auto;
                        display: block;
                    }
                    
                    .close-button {
                        position: fixed;
                        top: 20px;
                        right: 30px;
                        background: rgba(255, 255, 255, 0.9);
                        color: #333;
                        border: none;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        font-size: 24px;
                        font-weight: bold;
                        cursor: pointer;
                        z-index: 1000;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .close-button:hover {
                        background: rgba(255, 255, 255, 1);
                        transform: scale(1.1);
                    }
                    
                    .event-title {
                        position: fixed;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 10px 20px;
                        border-radius: 25px;
                        font-size: 16px;
                        z-index: 1000;
                    }
                    
                    @media (max-width: 768px) {
                        .close-button {
                            top: 10px;
                            right: 15px;
                            width: 40px;
                            height: 40px;
                            font-size: 20px;
                        }
                        
                        .event-title {
                            bottom: 10px;
                            font-size: 14px;
                            padding: 8px 16px;
                        }
                    }
                </style>
            </head>
            <body>
                <button class="close-button" onclick="window.close()">×</button>
                <div class="poster-container">
                    <img src="${posterSrc}" alt="${eventName}海報" class="poster-image">
                </div>
                <div class="event-title">${eventName}</div>
                
                <script>
                    // 按ESC鍵關閉視窗
                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'Escape') {
                            window.close();
                        }
                    });
                    
                    // 點擊背景關閉視窗
                    document.addEventListener('click', function(e) {
                        if (e.target === document.body || e.target.classList.contains('poster-container')) {
                            window.close();
                        }
                    });
                </script>
            </body>
            </html>
        `;
        
        // 開啟新視窗
        const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (newWindow) {
            newWindow.document.write(newWindowHTML);
            newWindow.document.close();
            
            // 調整視窗大小以適應圖片
            newWindow.onload = function() {
                const img = newWindow.document.querySelector('.poster-image');
                img.onload = function() {
                    const imgWidth = img.naturalWidth;
                    const imgHeight = img.naturalHeight;
                    
                    // 計算適合的視窗大小（考慮瀏覽器邊框）
                    const maxWidth = window.screen.width * 0.9;
                    const maxHeight = window.screen.height * 0.9;
                    
                    let windowWidth = Math.min(imgWidth + 100, maxWidth);
                    let windowHeight = Math.min(imgHeight + 150, maxHeight);
                    
                    // 確保最小尺寸
                    windowWidth = Math.max(windowWidth, 400);
                    windowHeight = Math.max(windowHeight, 300);
                    
                    newWindow.resizeTo(windowWidth, windowHeight);
                    newWindow.moveTo(
                        (window.screen.width - windowWidth) / 2,
                        (window.screen.height - windowHeight) / 2
                    );
                };
            };
        } else {
            // 如果無法開啟新視窗（被彈出視窗阻擋），則使用模態框
            alert('無法開啟新視窗，請允許彈出視窗或使用模態框檢視');
            this.showPosterModal(posterSrc);
        }
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
        // 檢查連線狀態
        if (!this.connectionManager.isOnline) {
            throw new Error('網路連線中斷，無法提交資料。請檢查網路連線後重試。');
        }
        
        // 收集表單資料
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // 轉換資料格式以符合 Supabase 資料庫結構
        const registrationData = {
            event_id: data.event,
            name: data.name,
            email: data.email,
            phone: data.phone,
            birthdate: data.birthdate || null,
            registration_date: data.date,
            dietary_requirements: data.dietary || null,
            notes: data.notes || null,
            signature_data: data.signature,
            status: 'pending'
        };
        
        // 直接提交到 Supabase
        const result = await this.connectionManager.submitToServer(registrationData);
        
        // 提交成功後儲存到本地（作為備份）
        this.saveToLocalStorage({
            ...data,
            id: result[0].id,
            submittedAt: result[0].submitted_at
        });
        
        console.log('資料已成功提交到 Supabase');
        return result;
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
    
    updateLocalStorage(data) {
        try {
            const existingData = localStorage.getItem('registrations');
            const registrations = existingData ? JSON.parse(existingData) : [];
            
            // 更新對應的資料
            const index = registrations.findIndex(reg => reg.id === data.id);
            if (index !== -1) {
                registrations[index] = data;
                localStorage.setItem('registrations', JSON.stringify(registrations));
            }
        } catch (error) {
            console.error('更新本地儲存時發生錯誤:', error);
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
    
    // 連線狀態檢查
    checkConnectionStatus() {
        if (!this.connectionManager.isOnline) {
            this.showError('網路連線中斷，請檢查網路設定後重新整理頁面');
        }
    }
    
    // 家長友善功能
    checkFirstTimeUser() {
        const hasSeenTips = localStorage.getItem('hasSeenParentTips');
        if (!hasSeenTips) {
            setTimeout(() => {
                this.showParentTips();
            }, 2000); // 2秒後顯示提示
        }
    }
    
    showParentTips() {
        const tipsElement = document.getElementById('parentTips');
        if (tipsElement) {
            tipsElement.style.display = 'block';
        }
    }
    
    hideParentTips() {
        const tipsElement = document.getElementById('parentTips');
        if (tipsElement) {
            tipsElement.style.display = 'none';
            localStorage.setItem('hasSeenParentTips', 'true');
        }
    }
}

// 當頁面載入完成時初始化應用程式
let registrationApp;
document.addEventListener('DOMContentLoaded', () => {
    registrationApp = new RegistrationApp();
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
