// 管理後台應用程式
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
    
    init() {
        this.loadRegistrations();
        this.loadEvents();
        this.bindEvents();
        this.updateStats();
        this.renderRegistrations();
        this.renderEvents();
        this.initializeDefaultEvents();
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
    }
    
    loadRegistrations() {
        const stored = localStorage.getItem('registrations');
        if (stored) {
            this.registrations = JSON.parse(stored);
        }
        this.filteredRegistrations = [...this.registrations];
    }
    
    saveRegistrations() {
        localStorage.setItem('registrations', JSON.stringify(this.registrations));
    }
    
    loadEvents() {
        const stored = localStorage.getItem('events');
        if (stored) {
            this.events = JSON.parse(stored);
        }
    }
    
    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }
    
    initializeDefaultEvents() {
        // 如果沒有活動資料，建立預設活動
        if (this.events.length === 0) {
            const defaultEvents = [
                {
                    id: 'event_1',
                    name: '青少年情緒管理團體輔導',
                    type: 'group-counseling',
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    time: '14:00',
                    location: '台北市信義區',
                    description: '協助青少年學習情緒管理技巧，建立健康的心理狀態',
                    capacity: 15,
                    fee: 0,
                    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'event_2',
                    name: '志工服務技巧成長班',
                    type: 'volunteer-growth',
                    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    time: '09:00',
                    location: '台北市大安區',
                    description: '提升志工服務品質，學習溝通技巧與服務倫理',
                    capacity: 25,
                    fee: 0,
                    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'event_3',
                    name: '親子溝通技巧講座',
                    type: 'parent-education',
                    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    time: '19:00',
                    location: '台北市中山區',
                    description: '學習有效的親子溝通方法，建立和諧的家庭關係',
                    capacity: 40,
                    fee: 0,
                    deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.events = defaultEvents;
            this.saveEvents();
        }
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
                reg.email.toLowerCase().includes(searchTerm) ||
                reg.phone.includes(searchTerm)
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
                    <div>${reg.email}</div>
                    <div style="font-size: 0.9em; color: #666;">${reg.phone}</div>
                </td>
                <td>${this.getEventName(reg.event)}</td>
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
                        <span class="card-field-value">${this.getEventName(reg.event)}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">日期：</span>
                        <span class="card-field-value">${this.formatDate(reg.date)}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">聯絡：</span>
                        <span class="card-field-value">${reg.email}</span>
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
                    <span class="detail-label">電子郵件：</span>
                    <span class="detail-value">${reg.email}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">聯絡電話：</span>
                    <span class="detail-value">${reg.phone}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">出生日期：</span>
                    <span class="detail-value">${reg.birthdate || '未填寫'}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>報名資訊</h4>
                <div class="detail-field">
                    <span class="detail-label">報名活動：</span>
                    <span class="detail-value">${this.getEventName(reg.event)}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">活動日期：</span>
                    <span class="detail-value">${this.formatDate(reg.date)}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">飲食需求：</span>
                    <span class="detail-value">${reg.dietary || '無'}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-label">備註：</span>
                    <span class="detail-value">${reg.notes || '無'}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>簽名</h4>
                <div class="signature-display">
                    ${reg.signature ? `<img src="${reg.signature}" alt="簽名">` : '<p>無簽名資料</p>'}
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
    
    markAsProcessed() {
        if (!this.currentRegistration) return;
        
        this.currentRegistration.status = 'processed';
        this.saveRegistrations();
        this.updateStats();
        this.renderRegistrations();
        
        // 更新模態框中的狀態顯示
        const statusElement = document.querySelector('#modalBody .status-badge');
        if (statusElement) {
            statusElement.textContent = '已處理';
            statusElement.className = 'status-badge status-processed';
        }
        
        alert('已標記為處理完成');
    }
    
    showDeleteConfirm() {
        document.getElementById('confirmModal').style.display = 'block';
    }
    
    deleteRegistration() {
        if (!this.currentRegistration) return;
        
        const index = this.registrations.findIndex(r => r.id === this.currentRegistration.id);
        if (index > -1) {
            this.registrations.splice(index, 1);
            this.saveRegistrations();
            this.updateStats();
            this.filteredRegistrations = this.registrations.filter(r => 
                this.filteredRegistrations.some(fr => fr.id === r.id)
            );
            this.renderRegistrations();
            
            document.getElementById('detailModal').style.display = 'none';
            document.getElementById('confirmModal').style.display = 'none';
            
            alert('報名資料已刪除');
        }
    }
    
    exportData() {
        if (this.registrations.length === 0) {
            alert('沒有資料可以匯出');
            return;
        }
        
        // 準備CSV資料
        const headers = [
            '報名時間', '姓名', '電子郵件', '聯絡電話', '出生日期',
            '報名活動', '活動日期', '飲食需求', '備註', '狀態'
        ];
        
        const csvData = [
            headers.join(','),
            ...this.registrations.map(reg => [
                this.formatDateTime(reg.submittedAt),
                reg.name,
                reg.email,
                reg.phone,
                reg.birthdate || '',
                this.getEventName(reg.event),
                this.formatDate(reg.date),
                (reg.dietary || '').replace(/,/g, ';'),
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
    
    clearAllData() {
        if (confirm('確定要清除所有報名資料嗎？此操作無法復原！')) {
            localStorage.removeItem('registrations');
            this.registrations = [];
            this.filteredRegistrations = [];
            this.updateStats();
            this.renderRegistrations();
            alert('所有資料已清除');
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
        
        container.innerHTML = this.events.map(event => `
            <div class="event-card ${event.active ? '' : 'inactive'}">
                <div class="event-status ${event.active ? 'active' : 'inactive'}">
                    ${event.active ? '啟用中' : '已停用'}
                </div>
                
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
                    ${event.deadline ? `
                    <div class="event-field">
                        <span class="event-field-label">截止日期：</span>
                        <span class="event-field-value">${this.formatDate(event.deadline)}</span>
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
        `).join('');
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
        document.getElementById('eventDeadline').value = event.deadline || '';
        document.getElementById('eventActive').checked = event.active;
    }
    
    saveEvent() {
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
            deadline: formData.get('deadline') || null,
            active: formData.get('active') === 'on'
        };
        
        if (this.currentEvent) {
            // 編輯現有活動
            Object.assign(this.currentEvent, eventData);
        } else {
            // 新增活動
            eventData.id = 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            eventData.createdAt = new Date().toISOString();
            this.events.push(eventData);
        }
        
        this.saveEvents();
        this.renderEvents();
        this.updateEventFilter();
        document.getElementById('eventModal').style.display = 'none';
        
        alert(this.currentEvent ? '活動已更新' : '活動已新增');
    }
    
    editEvent(eventId) {
        this.showEventModal(eventId);
    }
    
    showEventDeleteConfirm(eventId) {
        this.currentEvent = this.events.find(e => e.id === eventId);
        document.getElementById('eventDeleteModal').style.display = 'block';
    }
    
    deleteEvent() {
        if (!this.currentEvent) return;
        
        const index = this.events.findIndex(e => e.id === this.currentEvent.id);
        if (index > -1) {
            this.events.splice(index, 1);
            this.saveEvents();
            this.renderEvents();
            this.updateEventFilter();
            
            document.getElementById('eventDeleteModal').style.display = 'none';
            alert('活動已刪除');
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
            'parent-education': '親職教育講座'
        };
        return types[type] || type;
    }
    
    getEventName(eventId) {
        const event = this.events.find(e => e.id === eventId);
        return event ? event.name : '已刪除的活動';
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
    
    getEventName(eventValue) {
        const events = {
            'workshop': '工作坊',
            'seminar': '研討會',
            'conference': '會議',
            'training': '培訓課程'
        };
        return events[eventValue] || eventValue;
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
let adminApp;
document.addEventListener('DOMContentLoaded', () => {
    adminApp = new AdminApp();
});
