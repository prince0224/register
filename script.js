// 簽名功能已移除

// 安全表單驗證
class FormValidator {
    constructor(form) {
        this.form = form;
        this.secureValidator = new SecureInputValidator();
    }
    
    validate() {
        // 收集表單資料
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // 使用安全驗證器驗證
        const validation = this.secureValidator.validateForm(data);
        
        // 顯示錯誤訊息
        for (const [fieldName, error] of Object.entries(validation.errors)) {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.showFieldError(field, error);
            }
        }
        
        // 清除沒有錯誤的欄位
        for (const fieldName of Object.keys(data)) {
            if (!validation.errors[fieldName]) {
                const field = this.form.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    this.clearFieldError(field);
                }
            }
        }
        
        return validation;
    }
    
    getFieldLabel(fieldName) {
        const labels = {
            name: '姓名',
            class: '班級',
            seatNumber: '座號',
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
        
        this.validator = null;
        this.selectedEvent = null;
        this.events = [];
        this.connectionManager = new ConnectionManager();
        
        this.init();
    }
    
    init() {
        // 確保模態框在初始化時是隱藏的
        const posterModal = document.getElementById('posterModal');
        if (posterModal) {
            posterModal.style.display = 'none';
        }
        
        // 初始化表單驗證器
        this.validator = new FormValidator(this.form);
        
        // 綁定事件
        this.bindEvents();
        
        // 更新連接狀態
        this.updateConnectionStatus();
        
        // 載入活動資料
        this.loadEvents();
        
        // 檢查URL參數
        this.checkUrlParams();
        
        // 顯示活動選擇頁面
        this.showEventSelection();
        
        // 家長提示功能已移除
    }
    
    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            if (this.connectionManager.isOnline) {
                statusElement.textContent = '已連線';
                statusElement.className = 'connection-status online';
            } else {
                statusElement.textContent = '離線';
                statusElement.className = 'connection-status offline';
            }
        }
    }
    
    // 測試 Supabase 連接狀態
    async testSupabaseConnection() {
        try {
            if (!window.supabaseClient) {
                return false;
            }
            
            const { data, error } = await window.supabaseClient
                .from('events')
                .select('count')
                .limit(1);
            
            return !error;
        } catch (error) {
            console.error('Supabase 連接測試失敗:', error);
            return false;
        }
    }
    
    bindEvents() {
        // 表單提交
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // 表單重置
        this.form.addEventListener('reset', () => {
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
        const posterModal = document.getElementById('posterModal');
        if (posterModal) {
            posterModal.addEventListener('click', (e) => {
                if (e.target.id === 'posterModal' || e.target.classList.contains('close')) {
                    posterModal.style.display = 'none';
                }
            });
        }
        
        // 返回活動選擇
        document.getElementById('backToEvents').addEventListener('click', () => {
            this.showEventSelection();
        });
        
        // 家長提示功能已移除
        
        // 刷新活動資料
        document.getElementById('refreshEvents').addEventListener('click', () => {
            this.refreshEvents();
        });
        
        // 檢查連線狀態
        this.checkConnectionStatus();
        
        // 添加頁面可見性變化監聽器，當頁面重新可見時刷新活動資料
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.connectionManager.isOnline) {
                // 強制從伺服器載入最新資料，忽略快取
                this.loadEventsFromServer();
            }
        });
        
        // 監聽頁面焦點變化，當頁面重新獲得焦點時自動刷新
        window.addEventListener('focus', () => {
            if (this.connectionManager.isOnline) {
                console.log('頁面重新獲得焦點，正在刷新活動資料...');
                this.loadEventsFromServer();
            }
        });
    }
    
    loadEvents() {
        try {
            // 直接從伺服器載入活動資料，不使用本地儲存
            if (this.connectionManager.isOnline) {
                this.loadEventsFromServer();
            } else {
                this.events = [];
                console.log('網路連線中斷，無法載入活動資料');
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
                this.renderEvents(); // 重新渲染活動列表
                console.log('活動資料已從伺服器載入');
            } else {
                this.events = [];
                this.renderEvents();
                console.log('沒有找到活動資料');
            }
        } catch (error) {
            console.error('無法從伺服器載入活動資料:', error);
            this.events = [];
            this.renderEvents();
            
            // 提供更詳細的錯誤訊息
            let errorMessage = '無法載入最新活動資料';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = '網路連線失敗，請檢查網路連線後重試';
            } else if (error.message.includes('JWT')) {
                errorMessage = '認證失敗，請重新整理頁面';
            } else if (error.message.includes('permission')) {
                errorMessage = '權限不足，請聯繫管理員';
            } else {
                errorMessage = `載入失敗：${error.message}`;
            }
            
            this.showError(errorMessage);
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
                if (this.isEventRegistrationClosed(event)) {
                    alert('此活動報名已截止');
                    return;
                }
                this.selectEvent(eventId);
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
        
        this.eventsGrid.innerHTML = activeEvents.map(event => {
            const regClosed = this.isEventRegistrationClosed(event);
            const regDl = event.registration_deadline || event.deadline;
            return `
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
                        ${regDl ? `
                        <div class="event-detail">
                            <span class="event-detail-label">報名截止：</span>
                            <span>${this.formatEventDate(regDl)}${regClosed ? '（已截止）' : ''}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${event.description ? `
                    <div class="event-description">${event.description}</div>
                    ` : ''}
                    
                    <button class="register-button" onclick="event.stopPropagation(); registrationApp.selectEvent('${event.id}')" ${regClosed ? 'disabled' : ''}>
                        ${regClosed ? '報名已截止' : '立即報名'}
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }
    
    selectEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            if (this.isEventRegistrationClosed(event)) {
                alert('此活動報名已截止');
                return;
            }
            this.selectedEvent = event;
            this.showRegistration(event);
        }
    }
    
    displaySelectedEventInfo(event) {
        const regDl = event.registration_deadline || event.deadline;
        const dlLine = regDl ? ` • 報名截止：${this.formatEventDate(regDl)}` : '';
        this.selectedEventInfo.innerHTML = `
            <h3>${event.name}</h3>
            <p>${this.getEventTypeName(event.type)} • ${this.formatEventDate(event.date)}${event.time ? ` • ${event.time}` : ''}${dlLine}</p>
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
            'parent-education': '親職教育講座',
            'leadership': '領導力培訓',
            'art-workshop': '藝術工作坊',
            'other': '其他'
        };
        return types[type] || type;
    }
    
    
    formatEventDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW');
    }

    getLocalDateString() {
        const t = new Date();
        const y = t.getFullYear();
        const m = String(t.getMonth() + 1).padStart(2, '0');
        const d = String(t.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    /** 是否已超過報名截止日（僅比較本地日期字串 YYYY-MM-DD；截止日當日仍可報名） */
    isEventRegistrationClosed(event) {
        if (!event) return true;
        const dl = event.registration_deadline || event.deadline;
        if (!dl) return false;
        const dlStr = String(dl).slice(0, 10);
        return this.getLocalDateString() > dlStr;
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
    
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // 收集表單資料用於速率限制檢查
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // 檢查速率限制
        const rateLimitCheck = window.formLimiter.checkFormSubmission(data);
        if (!rateLimitCheck.allowed) {
            this.showError(`提交過於頻繁：${rateLimitCheck.reason}`);
            return;
        }
        
        // 驗證表單
        const validation = this.validator.validate();
        if (!validation.isValid) {
            this.showError('請修正表單中的錯誤');
            return;
        }
        
        // 顯示載入狀態
        this.showLoading();
        
        try {
            // 提交到伺服器
            await this.submitForm();
            
            // 顯示成功訊息
            this.showSuccessMessage();
            
        } catch (error) {
            const msg = error && error.message ? error.message : '提交失敗，請稍後再試';
            this.showError(msg);
        } finally {
            this.hideLoading();
        }
    }
    
    async submitForm() {
        // 檢查連線狀態
        if (!this.connectionManager.isOnline) {
            throw new Error('網路連線中斷，無法提交資料。請檢查網路連線後重試。');
        }
        if (this.selectedEvent && this.isEventRegistrationClosed(this.selectedEvent)) {
            throw new Error('此活動報名已截止');
        }

        // 收集表單資料
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // 轉換資料格式以符合 Supabase 資料庫結構
        const registrationData = {
            event_id: data.event,
            name: data.name,
            grade: data.grade,
            class: data.class,
            seat_number: data.seatNumber,
            registration_date: data.date,
            notes: data.notes || null,
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
    
    // 家長提示功能已移除
    
    async refreshEvents() {
        if (!this.connectionManager.isOnline) {
            alert('網路連線中斷，無法刷新活動資料');
            return;
        }
        
        const refreshBtn = document.getElementById('refreshEvents');
        const originalText = refreshBtn.textContent;
        refreshBtn.textContent = '刷新中...';
        refreshBtn.disabled = true;
        
        try {
            // 直接從伺服器載入最新資料
            await this.loadEventsFromServer();
            alert('活動資料已更新');
        } catch (error) {
            console.error('刷新活動資料失敗:', error);
            alert('刷新活動資料失敗，請稍後再試');
        } finally {
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
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
