// 登入管理
class LoginManager {
    constructor() {
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };
        this.isLoggedIn = false;
        this.init();
    }
    
    init() {
        // 檢查是否已經登入
        const savedLogin = localStorage.getItem('adminLogin');
        if (savedLogin) {
            const loginData = JSON.parse(savedLogin);
            if (loginData.isLoggedIn && loginData.timestamp) {
                // 檢查登入是否在24小時內
                const now = new Date().getTime();
                const loginTime = new Date(loginData.timestamp).getTime();
                const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    this.isLoggedIn = true;
                    this.showAdminPage();
                    return;
                } else {
                    // 登入已過期，清除
                    localStorage.removeItem('adminLogin');
                }
            }
        }
        
        // 顯示登入頁面
        this.showLoginPage();
    }
    
    showLoginPage() {
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('adminPage').style.display = 'none';
        this.bindLoginEvents();
    }
    
    showAdminPage() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminPage').style.display = 'block';
        this.bindLogoutEvents();
        
        // 初始化管理後台
        if (!window.adminApp) {
            window.adminApp = new AdminApp();
        }
    }
    
    bindLoginEvents() {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }
    
    bindLogoutEvents() {
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });
    }
    
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            // 登入成功
            this.isLoggedIn = true;
            
            // 儲存登入狀態
            localStorage.setItem('adminLogin', JSON.stringify({
                isLoggedIn: true,
                timestamp: new Date().toISOString()
            }));
            
            // 隱藏錯誤訊息
            errorDiv.style.display = 'none';
            
            // 顯示管理後台
            this.showAdminPage();
        } else {
            // 登入失敗
            errorDiv.style.display = 'block';
            document.getElementById('password').value = '';
        }
    }
    
    handleLogout() {
        if (confirm('確定要登出嗎？')) {
            this.isLoggedIn = false;
            localStorage.removeItem('adminLogin');
            this.showLoginPage();
            
            // 清除表單
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('loginError').style.display = 'none';
        }
    }
}

// 支援 Supabase 的管理後台應用程式
class AdminApp {
    constructor() {
        this.registrations = [];
        this.filteredRegistrations = [];
        this.events = [];
        this.currentView = 'list';
        this.currentRegistration = null;
        this.currentEvent = null;
        this.currentTab = 'registrations';
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.bindEvents();
        this.updateStats();
        this.renderRegistrations();
        this.renderEvents();
    }
    
    async loadData() {
        try {
            // 載入活動資料
            await this.loadEvents();
            // 載入報名資料
            await this.loadRegistrations();
        } catch (error) {
            console.error('載入資料失敗:', error);
            alert('載入資料失敗，請檢查網路連線');
        }
    }
    
    async loadEvents() {
        try {
            const { data, error } = await window.supabaseClient
                .from('events')
                .select('*')
                .order('date', { ascending: true });
            
            if (error) throw error;
            
            this.events = data || [];
            console.log('活動資料載入成功:', this.events.length, '個活動');
        } catch (error) {
            console.error('載入活動資料失敗:', error);
            this.events = [];
        }
    }
    
    async loadRegistrations() {
        try {
            const { data, error } = await window.supabaseClient
                .from('registrations')
                .select(`
                    *,
                    events (
                        name,
                        type,
                        date
                    )
                `)
                .order('submitted_at', { ascending: false });
            
            if (error) throw error;
            
            // 轉換資料格式以符合前端需求
            this.registrations = (data || []).map(reg => ({
                id: reg.id,
                name: reg.name,
                grade: reg.grade,
                class: reg.class,
                seatNumber: reg.seat_number,
                event: reg.event_id,
                eventName: reg.events?.name || '已刪除的活動',
                date: reg.registration_date,
                notes: reg.notes,
                status: reg.status,
                submittedAt: reg.submitted_at
            }));
            
            this.filteredRegistrations = [...this.registrations];
            console.log('報名資料載入成功:', this.registrations.length, '筆報名');
        } catch (error) {
            console.error('載入報名資料失敗:', error);
            this.registrations = [];
            this.filteredRegistrations = [];
        }
    }
    
    bindEvents() {
        // 搜尋功能
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchRegistrations();
        });
        
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchRegistrations();
            }
        });
        
        // 篩選功能
        document.getElementById('eventFilter').addEventListener('change', () => {
            this.filterRegistrations();
        });
        
        document.getElementById('dateFilter').addEventListener('change', () => {
            this.filterRegistrations();
        });
        
        document.getElementById('clearFilter').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // 檢視切換
        document.getElementById('listViewBtn').addEventListener('click', () => {
            this.switchView('list');
        });
        
        document.getElementById('cardViewBtn').addEventListener('click', () => {
            this.switchView('card');
        });
        
        // 匯出功能
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        // 清除所有資料
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllData();
        });
        
        // 模態框事件
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });
        
        // 點擊模態框外部關閉
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // 標記為已處理
        document.getElementById('markProcessed').addEventListener('click', () => {
            this.markAsProcessed();
        });
        
        // 刪除報名
        document.getElementById('deleteRegistration').addEventListener('click', () => {
            this.showDeleteConfirm();
        });
        
        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.deleteRegistration();
        });
        
        // 頁籤切換
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 活動管理事件
        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.showEventModal();
        });
        
        document.getElementById('saveEvent').addEventListener('click', () => {
            this.saveEvent();
        });
        
        document.getElementById('confirmEventDelete').addEventListener('click', () => {
            this.deleteEvent();
        });
        
        // 海報上傳功能
        document.getElementById('eventPoster').addEventListener('change', (e) => {
            this.handlePosterUpload(e);
        });
        
        document.getElementById('removePoster').addEventListener('click', () => {
            this.removePoster();
        });
        
        // 海報大圖顯示
        document.getElementById('posterModal').addEventListener('click', (e) => {
            if (e.target.id === 'posterModal' || e.target.classList.contains('close')) {
                document.getElementById('posterModal').style.display = 'none';
            }
        });
    }
    
    updateStats() {
        const total = this.registrations.length;
        const today = this.getTodayCount();
        const week = this.getWeekCount();
        const pending = this.registrations.filter(r => r.status === 'pending').length;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('todayCount').textContent = today;
        document.getElementById('weekCount').textContent = week;
        document.getElementById('pendingCount').textContent = pending;
    }
    
    getTodayCount() {
        const today = new Date().toDateString();
        return this.registrations.filter(r => 
            new Date(r.submittedAt).toDateString() === today
        ).length;
    }
    
    getWeekCount() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return this.registrations.filter(r => 
            new Date(r.submittedAt) >= weekAgo
        ).length;
    }
    
    searchRegistrations() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        if (!searchTerm) {
            this.filteredRegistrations = [...this.registrations];
        } else {
            this.filteredRegistrations = this.registrations.filter(reg => 
                reg.name.toLowerCase().includes(searchTerm) ||
                reg.class.includes(searchTerm) ||
                reg.seatNumber.toString().includes(searchTerm)
            );
        }
        
        this.renderRegistrations();
    }
    
    filterRegistrations() {
        const eventFilter = document.getElementById('eventFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        let filtered = [...this.registrations];
        
        // 活動篩選
        if (eventFilter) {
            filtered = filtered.filter(reg => reg.event === eventFilter);
        }
        
        // 日期篩選
        if (dateFilter) {
            const now = new Date();
            filtered = filtered.filter(reg => {
                const regDate = new Date(reg.submittedAt);
                switch (dateFilter) {
                    case 'today':
                        return regDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return regDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return regDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        this.filteredRegistrations = filtered;
        this.renderRegistrations();
    }
    
    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('eventFilter').value = '';
        document.getElementById('dateFilter').value = '';
        this.filteredRegistrations = [...this.registrations];
        this.renderRegistrations();
    }
    
    switchView(view) {
        this.currentView = view;
        
        // 更新按鈕狀態
        document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
        document.getElementById('cardViewBtn').classList.toggle('active', view === 'card');
        
        // 切換檢視
        document.getElementById('listView').classList.toggle('active', view === 'list');
        document.getElementById('cardView').classList.toggle('active', view === 'card');
        
        this.renderRegistrations();
    }
    
    renderRegistrations() {
        if (this.currentView === 'list') {
            this.renderListView();
        } else {
            this.renderCardView();
        }
    }
    
    renderListView() {
        const tbody = document.getElementById('registrationsTableBody');
        
        if (this.filteredRegistrations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <h3>沒有找到報名資料</h3>
                        <p>請調整搜尋條件或篩選器</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.filteredRegistrations.map(reg => `
            <tr>
                <td>${this.formatDate(reg.submittedAt)}</td>
                <td>${reg.name}</td>
                <td>
                    <div>${reg.grade} ${reg.class}班 ${reg.seatNumber}號</div>
                </td>
                <td>${reg.eventName}</td>
                <td>${this.formatDate(reg.date)}</td>
                <td>
                    <span class="status-badge status-${reg.status}">
                        ${reg.status === 'pending' ? '待處理' : '已處理'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminApp.viewDetails('${reg.id}')">
                        查看
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderCardView() {
        const container = document.getElementById('registrationsCards');
        
        if (this.filteredRegistrations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>沒有找到報名資料</h3>
                    <p>請調整搜尋條件或篩選器</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.filteredRegistrations.map(reg => `
            <div class="registration-card">
                <div class="card-header">
                    <div class="card-title">${reg.name}</div>
                    <span class="status-badge status-${reg.status}">
                        ${reg.status === 'pending' ? '待處理' : '已處理'}
                    </span>
                </div>
                <div class="card-meta">${this.formatDate(reg.submittedAt)}</div>
                <div class="card-body">
                    <div class="card-field">
                        <span class="card-field-label">活動：</span>
                        <span class="card-field-value">${reg.eventName}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">日期：</span>
                        <span class="card-field-value">${this.formatDate(reg.date)}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">班級：</span>
                        <span class="card-field-value">${reg.grade} ${reg.class}班 ${reg.seatNumber}號</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminApp.viewDetails('${reg.id}')">
                        查看詳情
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    viewDetails(registrationId) {
        this.currentRegistration = this.registrations.find(r => r.id === registrationId);
        if (!this.currentRegistration) return;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = this.generateDetailHTML(this.currentRegistration);
        
        document.getElementById('detailModal').style.display = 'block';
    }
    
    generateDetailHTML(reg) {
        return `
            <div class="detail-section">
                <h4>基本資訊</h4>
                <div class="detail-field">
                    <span class="detail-label">姓名：</span>
                    <span class="detail-value">${reg.name}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">年級：</span>
                    <span class="detail-value">${reg.grade}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">班級：</span>
                    <span class="detail-value">${reg.class}班</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">座號：</span>
                    <span class="detail-value">${reg.seatNumber}號</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>報名資訊</h4>
                <div class="detail-field">
                    <span class="detail-label">報名活動：</span>
                    <span class="detail-value">${reg.eventName}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">活動日期：</span>
                    <span class="detail-value">${this.formatDate(reg.date)}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">備註：</span>
                    <span class="detail-value">${reg.notes || '無'}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>系統資訊</h4>
                <div class="detail-field">
                    <span class="detail-label">報名時間：</span>
                    <span class="detail-value">${this.formatDateTime(reg.submittedAt)}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">狀態：</span>
                    <span class="detail-value">
                        <span class="status-badge status-${reg.status}">
                            ${reg.status === 'pending' ? '待處理' : '已處理'}
                        </span>
                    </span>
                </div>
            </div>
        `;
    }
    
    async markAsProcessed() {
        if (!this.currentRegistration) return;
        
        try {
            const { error } = await window.supabaseClient
                .from('registrations')
                .update({ status: 'processed' })
                .eq('id', this.currentRegistration.id);
            
            if (error) throw error;
            
            // 更新本地資料
            this.currentRegistration.status = 'processed';
            const index = this.registrations.findIndex(r => r.id === this.currentRegistration.id);
            if (index > -1) {
                this.registrations[index].status = 'processed';
            }
            
            this.updateStats();
            this.renderRegistrations();
            
            // 更新模態框中的狀態顯示
            const statusElement = document.querySelector('#modalBody .status-badge');
            if (statusElement) {
                statusElement.textContent = '已處理';
                statusElement.className = 'status-badge status-processed';
            }
            
            alert('已標記為處理完成');
        } catch (error) {
            console.error('更新狀態失敗:', error);
            alert('更新狀態失敗，請稍後再試');
        }
    }
    
    showDeleteConfirm() {
        document.getElementById('confirmModal').style.display = 'block';
    }
    
    async deleteRegistration() {
        if (!this.currentRegistration) return;
        
        try {
            const { error } = await window.supabaseClient
                .from('registrations')
                .delete()
                .eq('id', this.currentRegistration.id);
            
            if (error) throw error;
            
            // 更新本地資料
            const index = this.registrations.findIndex(r => r.id === this.currentRegistration.id);
            if (index > -1) {
                this.registrations.splice(index, 1);
            }
            
            this.filteredRegistrations = this.registrations.filter(r => 
                this.filteredRegistrations.some(fr => fr.id === r.id)
            );
            
            this.updateStats();
            this.renderRegistrations();
            
            document.getElementById('detailModal').style.display = 'none';
            document.getElementById('confirmModal').style.display = 'none';
            
            alert('報名資料已刪除');
        } catch (error) {
            console.error('刪除報名失敗:', error);
            alert('刪除報名失敗，請稍後再試');
        }
    }
    
    exportData() {
        if (this.registrations.length === 0) {
            alert('沒有資料可以匯出');
            return;
        }
        
        // 準備CSV資料
        const headers = [
            '報名時間', '姓名', '年級', '班級', '座號',
            '報名活動', '活動日期', '備註', '狀態'
        ];
        
        const csvData = [
            headers.join(','),
            ...this.registrations.map(reg => [
                this.formatDateTime(reg.submittedAt),
                reg.name,
                reg.grade,
                reg.class,
                reg.seatNumber,
                reg.eventName,
                this.formatDate(reg.date),
                (reg.notes || '').replace(/,/g, ';'),
                reg.status === 'pending' ? '待處理' : '已處理'
            ].join(','))
        ].join('\n');
        
        // 下載檔案
        const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `報名資料_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    async clearAllData() {
        if (confirm('確定要清除所有報名資料嗎？此操作無法復原！')) {
            try {
                const { error } = await window.supabaseClient
                    .from('registrations')
                    .delete()
                    .neq('id', '00000000-0000-0000-0000-000000000000'); // 刪除所有記錄
                
                if (error) throw error;
                
                this.registrations = [];
                this.filteredRegistrations = [];
                this.updateStats();
                this.renderRegistrations();
                alert('所有資料已清除');
            } catch (error) {
                console.error('清除資料失敗:', error);
                alert('清除資料失敗，請稍後再試');
            }
        }
    }
    
    // 頁籤切換
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 更新按鈕狀態
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // 切換內容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });
        
        // 更新活動篩選器
        if (tabName === 'registrations') {
            this.updateEventFilter();
        }
    }
    
    // 活動管理功能
    renderEvents() {
        const container = document.getElementById('eventsGrid');
        
        if (this.events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>還沒有任何活動</h3>
                    <p>點擊「新增活動」按鈕來建立第一個活動</p>
                </div>
            `;
            return;
        }
        
        // 按啟用狀態分組顯示活動
        const activeEvents = this.events.filter(e => e.active);
        const inactiveEvents = this.events.filter(e => !e.active);
        
        let html = '';
        
        // 顯示啟用的活動
        if (activeEvents.length > 0) {
            html += `
                <div class="events-section">
                    <h3 class="section-title">啟用的活動</h3>
                    <div class="events-grid-section">
                        ${activeEvents.map(event => this.generateEventCard(event)).join('')}
                    </div>
                </div>
            `;
        }
        
        // 顯示停用的活動
        if (inactiveEvents.length > 0) {
            html += `
                <div class="events-section">
                    <h3 class="section-title">已停用的活動</h3>
                    <div class="events-grid-section">
                        ${inactiveEvents.map(event => this.generateEventCard(event)).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    generateEventCard(event) {
        return `
            <div class="event-card ${event.active ? '' : 'inactive'}">
                <div class="event-status ${event.active ? 'active' : 'inactive'}">
                    ${event.active ? '啟用中' : '已停用'}
                </div>
                
                ${event.poster_url ? `
                <img src="${event.poster_url}" alt="${event.name}海報" class="event-poster" onclick="adminApp.showPosterModal('${event.poster_url}')">
                ` : ''}
                
                <div class="event-header">
                    <div class="event-title">${event.name}</div>
                    <div class="event-type">${this.getEventTypeName(event.type)}</div>
                </div>
                
                <div class="event-body">
                    <div class="event-field">
                        <span class="event-field-label">日期：</span>
                        <span class="event-field-value">${this.formatDate(event.date)}</span>
                    </div>
                    ${event.time ? `
                    <div class="event-field">
                        <span class="event-field-label">時間：</span>
                        <span class="event-field-value">${event.time}</span>
                    </div>
                    ` : ''}
                    ${event.location ? `
                    <div class="event-field">
                        <span class="event-field-label">地點：</span>
                        <span class="event-field-value">${event.location}</span>
                    </div>
                    ` : ''}
                    ${event.capacity ? `
                    <div class="event-field">
                        <span class="event-field-label">人數限制：</span>
                        <span class="event-field-value">${event.capacity}人</span>
                    </div>
                    ` : ''}
                    ${event.fee ? `
                    <div class="event-field">
                        <span class="event-field-label">費用：</span>
                        <span class="event-field-value">NT$ ${event.fee}</span>
                    </div>
                    ` : ''}
                    ${event.description ? `
                    <div class="event-description">${event.description}</div>
                    ` : ''}
                </div>
                
                <div class="event-actions">
                    <button class="btn btn-sm btn-primary" onclick="adminApp.editEvent('${event.id}')">
                        編輯
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminApp.showEventDeleteConfirm('${event.id}')">
                        刪除
                    </button>
                </div>
            </div>
        `;
    }
    
    showEventModal(eventId = null) {
        this.currentEvent = eventId ? this.events.find(e => e.id === eventId) : null;
        
        const modal = document.getElementById('eventModal');
        const title = document.getElementById('eventModalTitle');
        const form = document.getElementById('eventForm');
        
        if (this.currentEvent) {
            title.textContent = '編輯活動';
            this.populateEventForm(this.currentEvent);
        } else {
            title.textContent = '新增活動';
            form.reset();
            document.getElementById('eventActive').checked = true;
        }
        
        modal.style.display = 'block';
    }
    
    populateEventForm(event) {
        document.getElementById('eventName').value = event.name;
        document.getElementById('eventType').value = event.type;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time || '';
        document.getElementById('eventLocation').value = event.location || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventCapacity').value = event.capacity || '';
        document.getElementById('eventFee').value = event.fee || '';
        document.getElementById('eventActive').checked = event.active;
        
        // 顯示現有海報
        if (event.poster_url) {
            this.showPosterPreview(event.poster_url);
        } else {
            this.hidePosterPreview();
        }
    }
    
    async saveEvent() {
        const form = document.getElementById('eventForm');
        const formData = new FormData(form);
        
        // 驗證必填欄位
        if (!formData.get('name') || !formData.get('type') || !formData.get('date')) {
            alert('請填寫所有必填欄位');
            return;
        }
        
        const eventData = {
            name: formData.get('name'),
            type: formData.get('type'),
            date: formData.get('date'),
            time: formData.get('time') || null,
            location: formData.get('location') || null,
            description: formData.get('description') || null,
            capacity: formData.get('capacity') ? parseInt(formData.get('capacity')) : null,
            fee: formData.get('fee') ? parseFloat(formData.get('fee')) : null,
            active: formData.get('active') === 'on',
            poster_url: this.currentPosterData || (this.currentEvent ? this.currentEvent.poster_url : null)
        };
        
        try {
            if (this.currentEvent) {
                // 編輯現有活動
                const { error } = await window.supabaseClient
                    .from('events')
                    .update(eventData)
                    .eq('id', this.currentEvent.id);
                
                if (error) throw error;
                
                // 更新本地資料
                Object.assign(this.currentEvent, eventData);
                alert('活動已更新');
            } else {
                // 新增活動
                const { data, error } = await window.supabaseClient
                    .from('events')
                    .insert([eventData])
                    .select();
                
                if (error) throw error;
                
                // 更新本地資料
                this.events.push(data[0]);
                alert('活動已新增');
            }
            
            this.renderEvents();
            this.updateEventFilter();
            document.getElementById('eventModal').style.display = 'none';
            
            // 清除報名頁面的活動快取，強制重新載入
            this.clearRegistrationPageCache();
            
        } catch (error) {
            console.error('儲存活動失敗:', error);
            alert('儲存活動失敗，請稍後再試');
        }
    }
    
    editEvent(eventId) {
        this.showEventModal(eventId);
    }
    
    showEventDeleteConfirm(eventId) {
        this.currentEvent = this.events.find(e => e.id === eventId);
        document.getElementById('eventDeleteModal').style.display = 'block';
    }
    
    async deleteEvent() {
        if (!this.currentEvent) return;
        
        try {
            const { error } = await window.supabaseClient
                .from('events')
                .delete()
                .eq('id', this.currentEvent.id);
            
            if (error) throw error;
            
            // 更新本地資料
            const index = this.events.findIndex(e => e.id === this.currentEvent.id);
            if (index > -1) {
                this.events.splice(index, 1);
            }
            
            this.renderEvents();
            this.updateEventFilter();
            
            document.getElementById('eventDeleteModal').style.display = 'none';
            alert('活動已刪除');
            
            // 清除報名頁面的活動快取，強制重新載入
            this.clearRegistrationPageCache();
        } catch (error) {
            console.error('刪除活動失敗:', error);
            alert('刪除活動失敗，請稍後再試');
        }
    }
    
    updateEventFilter() {
        const eventFilter = document.getElementById('eventFilter');
        const currentValue = eventFilter.value;
        
        // 清空現有選項（保留「所有活動」）
        eventFilter.innerHTML = '<option value="">所有活動</option>';
        
        // 加入啟用的活動
        this.events.filter(e => e.active).forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.name;
            eventFilter.appendChild(option);
        });
        
        // 恢復之前選擇的值
        eventFilter.value = currentValue;
    }
    
    getEventTypeName(type) {
        const types = {
            'group-counseling': '團體輔導',
            'volunteer-growth': '志工成長班',
            'parent-education': '親職教育講座',
            'leadership': '學生領導力培訓',
            'art-workshop': '藝術創作工作坊'
        };
        return types[type] || type;
    }
    
    // 海報相關功能
    handlePosterUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 檢查檔案類型
        if (!file.type.startsWith('image/')) {
            alert('請選擇圖片檔案');
            return;
        }
        
        // 檢查檔案大小 (限制為5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('圖片檔案大小不能超過5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentPosterData = e.target.result;
            this.showPosterPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    showPosterPreview(posterData) {
        const preview = document.getElementById('posterPreview');
        const previewImg = document.getElementById('posterPreviewImg');
        
        previewImg.src = posterData;
        preview.style.display = 'block';
    }
    
    hidePosterPreview() {
        const preview = document.getElementById('posterPreview');
        preview.style.display = 'none';
    }
    
    removePoster() {
        this.currentPosterData = null;
        document.getElementById('eventPoster').value = '';
        this.hidePosterPreview();
    }
    
    showPosterModal(posterSrc) {
        const modal = document.getElementById('posterModal');
        const modalImg = document.getElementById('posterModalImg');
        
        modalImg.src = posterSrc;
        modal.style.display = 'block';
    }
    
    // 輔助函數
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW');
    }
    
    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('zh-TW');
    }
    
    clearRegistrationPageCache() {
        // 清除報名頁面的活動快取
        try {
            localStorage.removeItem('events');
            localStorage.removeItem('eventsLastUpdated');
            
            // 發送事件通知其他頁面需要刷新活動資料
            localStorage.setItem('eventsNeedRefresh', new Date().toISOString());
            localStorage.removeItem('eventsNeedRefresh');
            
            console.log('已清除報名頁面的活動快取並發送刷新通知');
        } catch (error) {
            console.error('清除快取失敗:', error);
        }
    }
}

// 全域函數
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

function closeEventDeleteModal() {
    document.getElementById('eventDeleteModal').style.display = 'none';
}

// 初始化應用程式
let loginManager;
document.addEventListener('DOMContentLoaded', () => {
    loginManager = new LoginManager();
});



