// 전역 변수
let vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
let dispatches = JSON.parse(localStorage.getItem('dispatches')) || [];
let currentFilter = 'all';

// DOM 요소들
const vehicleForm = document.getElementById('vehicleForm');
const dispatchForm = document.getElementById('dispatchForm');
const vehicleList = document.getElementById('vehicleList');
const dispatchList = document.getElementById('dispatchList');
const vehicleSearch = document.getElementById('vehicleSearch');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateDashboard();
    renderVehicles();
    renderDispatches();
    
    // 모바일 최적화
    setupMobileOptimizations();
});

// 앱 초기화
function initializeApp() {
    // 저장된 데이터가 없으면 빈 배열 유지
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 차량 등록 폼
    vehicleForm.addEventListener('submit', handleVehicleSubmit);
    
    // 배차 요청 폼
    dispatchForm.addEventListener('submit', handleDispatchSubmit);
    
    // 차량 검색
    vehicleSearch.addEventListener('input', handleVehicleSearch);
    
    // 필터 버튼들
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // 모달 닫기
    closeModal.addEventListener('click', closeModalHandler);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });
}

// 차량 등록 처리
function handleVehicleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(vehicleForm);
    const vehicle = {
        id: Date.now().toString(),
        number: formData.get('vehicleNumber'),
        type: formData.get('vehicleType'),
        capacity: parseInt(formData.get('capacity')),
        driver: formData.get('driver'),
        status: formData.get('status'),
        createdAt: new Date().toISOString()
    };
    
    vehicles.push(vehicle);
    saveVehicles();
    renderVehicles();
    updateDashboard();
    vehicleForm.reset();
    
    showNotification('차량이 성공적으로 등록되었습니다.', 'success');
}

// 배차 요청 처리
function handleDispatchSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(dispatchForm);
    const dispatch = {
        id: Date.now().toString(),
        requester: formData.get('requester'),
        department: formData.get('department'),
        purpose: formData.get('purpose'),
        destination: formData.get('destination'),
        startDate: formData.get('startDate'),
        startTime: formData.get('startTime'),
        endDate: formData.get('endDate'),
        endTime: formData.get('endTime'),
        passengers: parseInt(formData.get('passengers')),
        priority: formData.get('priority'),
        notes: formData.get('notes'),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    dispatches.push(dispatch);
    saveDispatches();
    renderDispatches();
    updateDashboard();
    dispatchForm.reset();
    
    showNotification('배차 요청이 성공적으로 제출되었습니다.', 'success');
}

// 차량 검색 처리
function handleVehicleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredVehicles = vehicles.filter(vehicle => 
        vehicle.number.toLowerCase().includes(searchTerm) ||
        vehicle.driver.toLowerCase().includes(searchTerm)
    );
    renderVehicles(filteredVehicles);
}

// 필터 클릭 처리
function handleFilterClick(e) {
    const filter = e.target.dataset.filter;
    
    // 활성 필터 버튼 변경
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentFilter = filter;
    renderDispatches();
}

// 차량 렌더링
function renderVehicles(vehicleArray = vehicles) {
    vehicleList.innerHTML = '';
    
    vehicleArray.forEach(vehicle => {
        const vehicleCard = createVehicleCard(vehicle);
        vehicleList.appendChild(vehicleCard);
    });
}

// 배차 렌더링
function renderDispatches() {
    dispatchList.innerHTML = '';
    
    let filteredDispatches = dispatches;
    
    if (currentFilter !== 'all') {
        filteredDispatches = dispatches.filter(dispatch => dispatch.status === currentFilter);
    }
    
    filteredDispatches.forEach(dispatch => {
        const dispatchCard = createDispatchCard(dispatch);
        dispatchList.appendChild(dispatchCard);
    });
}

// 차량 카드 생성
function createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    
    const statusClass = `status-${vehicle.status}`;
    const statusText = getStatusText(vehicle.status);
    
    card.innerHTML = `
        <h4>${vehicle.number}</h4>
        <div class="vehicle-info">
            <span><strong>종류:</strong> ${vehicle.type}</span>
            <span><strong>수용인원:</strong> ${vehicle.capacity}명</span>
            <span><strong>운전자:</strong> ${vehicle.driver}</span>
            <span><strong>상태:</strong> <span class="vehicle-status ${statusClass}">${statusText}</span></span>
        </div>
        <div class="vehicle-actions">
            <button class="btn btn-secondary" onclick="editVehicle('${vehicle.id}')">
                <i class="fas fa-edit"></i> 수정
            </button>
            <button class="btn btn-danger" onclick="deleteVehicle('${vehicle.id}')">
                <i class="fas fa-trash"></i> 삭제
            </button>
        </div>
    `;
    
    return card;
}

// 배차 카드 생성
function createDispatchCard(dispatch) {
    const card = document.createElement('div');
    card.className = 'dispatch-card';
    
    const priorityClass = `priority-${dispatch.priority}`;
    const statusClass = `status-${dispatch.status}`;
    const priorityText = getPriorityText(dispatch.priority);
    const statusText = getStatusText(dispatch.status);
    
    card.innerHTML = `
        <div class="dispatch-header">
            <div class="dispatch-title">${dispatch.purpose}</div>
            <span class="dispatch-priority ${priorityClass}">${priorityText}</span>
        </div>
        <div class="dispatch-info">
            <span><strong>요청자:</strong> ${dispatch.requester}</span>
            <span><strong>부서:</strong> ${dispatch.department}</span>
            <span><strong>목적지:</strong> ${dispatch.destination}</span>
            <span><strong>탑승인원:</strong> ${dispatch.passengers}명</span>
            <span><strong>출발:</strong> ${formatDateTime(dispatch.startDate, dispatch.startTime)}</span>
            <span><strong>반납:</strong> ${formatDateTime(dispatch.endDate, dispatch.endTime)}</span>
        </div>
        <div style="margin-bottom: 10px;">
            <span class="dispatch-status ${statusClass}">${statusText}</span>
        </div>
        ${dispatch.notes ? `<div style="margin-bottom: 10px; font-size: 0.9rem; color: #666;">${dispatch.notes}</div>` : ''}
        <div class="dispatch-actions">
            ${getDispatchActions(dispatch)}
        </div>
    `;
    
    return card;
}

// 배차 액션 버튼 생성
function getDispatchActions(dispatch) {
    let actions = '';
    
    if (dispatch.status === 'pending') {
        actions += `
            <button class="btn btn-success" onclick="approveDispatch('${dispatch.id}')">
                <i class="fas fa-check"></i> 승인
            </button>
            <button class="btn btn-danger" onclick="rejectDispatch('${dispatch.id}')">
                <i class="fas fa-times"></i> 거부
            </button>
        `;
    } else if (dispatch.status === 'approved') {
        actions += `
            <button class="btn btn-primary" onclick="startDispatch('${dispatch.id}')">
                <i class="fas fa-play"></i> 시작
            </button>
        `;
    } else if (dispatch.status === 'inprogress') {
        actions += `
            <button class="btn btn-success" onclick="completeDispatch('${dispatch.id}')">
                <i class="fas fa-flag-checkered"></i> 완료
            </button>
        `;
    }
    
    actions += `
        <button class="btn btn-secondary" onclick="viewDispatchDetails('${dispatch.id}')">
            <i class="fas fa-eye"></i> 상세
        </button>
    `;
    
    return actions;
}

// 대시보드 업데이트
function updateDashboard() {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const pendingRequests = dispatches.filter(d => d.status === 'pending').length;
    const todayDispatches = dispatches.filter(d => {
        const today = new Date().toISOString().split('T')[0];
        return d.startDate === today;
    }).length;
    
    document.getElementById('totalVehicles').textContent = totalVehicles;
    document.getElementById('availableVehicles').textContent = availableVehicles;
    document.getElementById('pendingRequests').textContent = pendingRequests;
    document.getElementById('todayDispatches').textContent = todayDispatches;
}

// 차량 수정
function editVehicle(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    showModal(`
        <h3>차량 정보 수정</h3>
        <form id="editVehicleForm">
            <div class="form-group">
                <label>차량 번호</label>
                <input type="text" name="number" value="${vehicle.number}" required>
            </div>
            <div class="form-group">
                <label>차량 종류</label>
                <select name="type" required>
                    <option value="승용차" ${vehicle.type === '승용차' ? 'selected' : ''}>승용차</option>
                    <option value="승합차" ${vehicle.type === '승합차' ? 'selected' : ''}>승합차</option>
                    <option value="트럭" ${vehicle.type === '트럭' ? 'selected' : ''}>트럭</option>
                    <option value="특수차량" ${vehicle.type === '특수차량' ? 'selected' : ''}>특수차량</option>
                </select>
            </div>
            <div class="form-group">
                <label>수용 인원</label>
                <input type="number" name="capacity" value="${vehicle.capacity}" required>
            </div>
            <div class="form-group">
                <label>담당 운전자</label>
                <input type="text" name="driver" value="${vehicle.driver}" required>
            </div>
            <div class="form-group">
                <label>상태</label>
                <select name="status" required>
                    <option value="available" ${vehicle.status === 'available' ? 'selected' : ''}>사용 가능</option>
                    <option value="maintenance" ${vehicle.status === 'maintenance' ? 'selected' : ''}>정비 중</option>
                    <option value="inuse" ${vehicle.status === 'inuse' ? 'selected' : ''}>사용 중</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button type="submit" class="btn btn-primary">수정</button>
                <button type="button" class="btn btn-secondary" onclick="closeModalHandler()">취소</button>
            </div>
        </form>
    `);
    
    document.getElementById('editVehicleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        vehicle.number = formData.get('number');
        vehicle.type = formData.get('type');
        vehicle.capacity = parseInt(formData.get('capacity'));
        vehicle.driver = formData.get('driver');
        vehicle.status = formData.get('status');
        
        saveVehicles();
        renderVehicles();
        updateDashboard();
        closeModalHandler();
        showNotification('차량 정보가 수정되었습니다.', 'success');
    });
}

// 차량 삭제
function deleteVehicle(vehicleId) {
    if (confirm('정말로 이 차량을 삭제하시겠습니까?')) {
        vehicles = vehicles.filter(v => v.id !== vehicleId);
        saveVehicles();
        renderVehicles();
        updateDashboard();
        showNotification('차량이 삭제되었습니다.', 'success');
    }
}

// 배차 승인
function approveDispatch(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
        dispatch.status = 'approved';
        saveDispatches();
        renderDispatches();
        updateDashboard();
        showNotification('배차가 승인되었습니다.', 'success');
    }
}

// 배차 거부
function rejectDispatch(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
        dispatch.status = 'cancelled';
        saveDispatches();
        renderDispatches();
        updateDashboard();
        showNotification('배차가 거부되었습니다.', 'success');
    }
}

// 배차 시작
function startDispatch(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
        dispatch.status = 'inprogress';
        saveDispatches();
        renderDispatches();
        updateDashboard();
        showNotification('배차가 시작되었습니다.', 'success');
    }
}

// 배차 완료
function completeDispatch(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
        dispatch.status = 'completed';
        saveDispatches();
        renderDispatches();
        updateDashboard();
        showNotification('배차가 완료되었습니다.', 'success');
    }
}

// 배차 상세 보기
function viewDispatchDetails(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (!dispatch) return;
    
    showModal(`
        <h3>배차 상세 정보</h3>
        <div style="line-height: 1.8;">
            <p><strong>요청자:</strong> ${dispatch.requester}</p>
            <p><strong>부서:</strong> ${dispatch.department}</p>
            <p><strong>용도:</strong> ${dispatch.purpose}</p>
            <p><strong>목적지:</strong> ${dispatch.destination}</p>
            <p><strong>출발:</strong> ${formatDateTime(dispatch.startDate, dispatch.startTime)}</p>
            <p><strong>반납:</strong> ${formatDateTime(dispatch.endDate, dispatch.endTime)}</p>
            <p><strong>탑승인원:</strong> ${dispatch.passengers}명</p>
            <p><strong>우선순위:</strong> ${getPriorityText(dispatch.priority)}</p>
            <p><strong>상태:</strong> ${getStatusText(dispatch.status)}</p>
            <p><strong>요청일:</strong> ${formatDate(dispatch.createdAt)}</p>
            ${dispatch.notes ? `<p><strong>특이사항:</strong> ${dispatch.notes}</p>` : ''}
        </div>
        <div style="margin-top: 20px;">
            <button class="btn btn-secondary" onclick="closeModalHandler()">닫기</button>
        </div>
    `);
}

// 모달 표시
function showModal(content) {
    modalBody.innerHTML = content;
    modal.style.display = 'block';
}

// 모달 닫기
function closeModalHandler() {
    modal.style.display = 'none';
}

// 알림 표시
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #38a169;' : 
          type === 'error' ? 'background: #e53e3e;' : 'background: #667eea;'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 유틸리티 함수들
function getStatusText(status) {
    const statusMap = {
        'available': '사용 가능',
        'maintenance': '정비 중',
        'inuse': '사용 중',
        'pending': '대기 중',
        'approved': '승인됨',
        'inprogress': '진행 중',
        'completed': '완료',
        'cancelled': '취소됨'
    };
    return statusMap[status] || status;
}

function getPriorityText(priority) {
    const priorityMap = {
        'low': '낮음',
        'medium': '보통',
        'high': '높음',
        'urgent': '긴급'
    };
    return priorityMap[priority] || priority;
}

function formatDateTime(date, time) {
    return `${date} ${time}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ko-KR');
}

function saveVehicles() {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
}

function saveDispatches() {
    localStorage.setItem('dispatches', JSON.stringify(dispatches));
}

// 샘플 데이터 추가

// 모바일 최적화 설정
function setupMobileOptimizations() {
    // 터치 이벤트 최적화
    document.addEventListener('touchstart', function() {}, {passive: true});
    document.addEventListener('touchmove', function() {}, {passive: true});
    
    // 모바일에서 스크롤 성능 개선
    document.addEventListener('scroll', function() {}, {passive: true});
    
    // 모바일에서 더블탭 줌 방지
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // 모바일에서 입력 필드 포커스 시 자동 확대 방지
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.scrollIntoView({behavior: 'smooth', block: 'center'});
                }, 300);
            }
        });
    });
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 