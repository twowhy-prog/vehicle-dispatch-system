// 전역 변수
let vehicles = [];
let dispatches = [];
let operations = [];
let inspections = [];
let isLoggedIn = false;
const ADMIN_PASSWORD = 'admin123'; // 실제 운영 시에는 서버에서 관리해야 함

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    setupMobileOptimizations();
    checkLoginStatus();
});

// 데이터 로드
function loadData() {
    vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
    dispatches = JSON.parse(localStorage.getItem('dispatches')) || [];
    operations = JSON.parse(localStorage.getItem('operations')) || [];
    inspections = JSON.parse(localStorage.getItem('inspections')) || [];
    
    // 샘플 데이터가 없으면 기본 차량 추가
    if (vehicles.length === 0) {
        vehicles = [
            {
                id: 1,
                number: '12가3456',
                type: '승용차',
                model: '현대 아반떼',
                capacity: 5,
                status: '사용가능'
            },
            {
                id: 2,
                number: '34나5678',
                type: '승합차',
                model: '기아 카니발',
                capacity: 9,
                status: '사용가능'
            }
        ];
        localStorage.setItem('vehicles', JSON.stringify(vehicles));
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그인 폼
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 차량 폼
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleVehicleSubmit);
    }
    
    // 검색 기능
    const vehicleSearchInput = document.getElementById('vehicleSearchInput');
    if (vehicleSearchInput) {
        vehicleSearchInput.addEventListener('input', handleVehicleSearch);
    }
    
    const dispatchSearchInput = document.getElementById('dispatchSearchInput');
    if (dispatchSearchInput) {
        dispatchSearchInput.addEventListener('input', handleDispatchSearch);
    }
    
    // 상태 필터
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilter);
    });
    
    // 운행 일지 폼
    const operationForm = document.getElementById('operationForm');
    if (operationForm) {
        operationForm.addEventListener('submit', handleOperationSubmit);
    }
    
    // 점검 일지 폼
    const inspectionForm = document.getElementById('inspectionForm');
    if (inspectionForm) {
        inspectionForm.addEventListener('submit', handleInspectionSubmit);
    }
    
    // 운행 일지 검색
    const operationSearchInput = document.getElementById('operationSearchInput');
    if (operationSearchInput) {
        operationSearchInput.addEventListener('input', handleOperationSearch);
    }
    
    // 점검 일지 검색
    const inspectionSearchInput = document.getElementById('inspectionSearchInput');
    if (inspectionSearchInput) {
        inspectionSearchInput.addEventListener('input', handleInspectionSearch);
    }
}

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

// 로그인 상태 확인
function checkLoginStatus() {
    const loginScreen = document.getElementById('loginScreen');
    const adminMain = document.getElementById('adminMain');
    
    if (isLoggedIn) {
        loginScreen.style.display = 'none';
        adminMain.style.display = 'block';
        renderAllData();
    } else {
        loginScreen.style.display = 'flex';
        adminMain.style.display = 'none';
    }
}

// 로그인 처리
function handleLogin(event) {
    event.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        showNotification('관리자 로그인 성공!', 'success');
        checkLoginStatus();
    } else {
        showNotification('비밀번호가 올바르지 않습니다.', 'error');
    }
}

// 로그아웃
function logout() {
    isLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    showNotification('로그아웃되었습니다.', 'info');
    checkLoginStatus();
}

// 섹션 전환
function showSection(sectionId) {
    // 모든 섹션 숨기기
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 모든 네비게이션 버튼 비활성화
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 선택된 섹션과 버튼 활성화
    const targetSection = document.getElementById(sectionId);
    const targetButton = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
    }
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // 섹션별 데이터 렌더링
    switch(sectionId) {
        case 'vehicle-management':
            renderVehicles();
            break;
        case 'dispatch-management':
            renderDispatches();
            break;
        case 'operation-log':
            renderOperations();
            break;
        case 'inspection-log':
            renderInspections();
            break;
        case 'dashboard':
            updateDashboard();
            break;
    }
}

// 모든 데이터 렌더링
function renderAllData() {
    renderVehicles();
    renderDispatches();
    updateDashboard();
}

// 차량 목록 렌더링
function renderVehicles() {
    const vehicleList = document.getElementById('vehicleList');
    if (!vehicleList) return;
    
    vehicleList.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const vehicleCard = createVehicleCard(vehicle);
        vehicleList.appendChild(vehicleCard);
    });
}

// 차량 카드 생성
function createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    
    card.innerHTML = `
        <h4>${vehicle.number}</h4>
        <div class="vehicle-info">
            <span><i class="fas fa-car"></i> ${vehicle.type}</span>
            <span><i class="fas fa-info-circle"></i> ${vehicle.model || '모델 정보 없음'}</span>
            <span><i class="fas fa-users"></i> ${vehicle.capacity || 0}명</span>
        </div>
        <div class="vehicle-status status-${getVehicleStatusClass(vehicle.status)}">
            ${vehicle.status}
        </div>
        <div class="vehicle-actions">
            <button class="btn btn-secondary" onclick="editVehicle(${vehicle.id})">
                <i class="fas fa-edit"></i> 수정
            </button>
            <button class="btn btn-danger" onclick="deleteVehicle(${vehicle.id})">
                <i class="fas fa-trash"></i> 삭제
            </button>
        </div>
    `;
    
    return card;
}

// 차량 상태 클래스 반환
function getVehicleStatusClass(status) {
    switch(status) {
        case '사용가능': return 'available';
        case '점검중': return 'maintenance';
        case '사용불가': return 'inuse';
        default: return 'available';
    }
}

// 배차 목록 렌더링
function renderDispatches() {
    const dispatchList = document.getElementById('adminDispatchList');
    if (!dispatchList) return;
    
    dispatchList.innerHTML = '';
    
    dispatches.forEach(dispatch => {
        const dispatchCard = createAdminDispatchCard(dispatch);
        dispatchList.appendChild(dispatchCard);
    });
}

// 관리자용 배차 카드 생성
function createAdminDispatchCard(dispatch) {
    const card = document.createElement('div');
    card.className = 'dispatch-card';
    
    const vehicle = vehicles.find(v => v.id == dispatch.vehicleId);
    const vehicleInfo = vehicle ? `${vehicle.number} (${vehicle.type})` : '차량 정보 없음';
    
    card.innerHTML = `
        <div class="dispatch-header">
            <div class="dispatch-title">
                <h4>${dispatch.requester} - ${dispatch.department}</h4>
                <span class="dispatch-priority priority-${getPriorityClass(dispatch.priority)}">
                    ${dispatch.priority}
                </span>
            </div>
        </div>
        <div class="dispatch-info">
            <span><i class="fas fa-car"></i> ${vehicleInfo}</span>
            <span><i class="fas fa-calendar"></i> ${dispatch.requestDate}</span>
            <span><i class="fas fa-clock"></i> ${dispatch.startTime} - ${dispatch.endTime}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${dispatch.destination}</span>
            <span><i class="fas fa-comment"></i> ${dispatch.purpose}</span>
        </div>
        <div class="dispatch-status status-${getStatusClass(dispatch.status)}">
            ${dispatch.status}
        </div>
        <div class="dispatch-actions">
            ${dispatch.status === '대기중' ? `
                <button class="btn btn-success" onclick="approveDispatch(${dispatch.id})">
                    <i class="fas fa-check"></i> 승인
                </button>
                <button class="btn btn-danger" onclick="rejectDispatch(${dispatch.id})">
                    <i class="fas fa-times"></i> 거부
                </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

// 우선순위 클래스 반환
function getPriorityClass(priority) {
    switch(priority) {
        case '보통': return 'low';
        case '긴급': return 'medium';
        case '매우긴급': return 'high';
        default: return 'low';
    }
}

// 상태 클래스 반환
function getStatusClass(status) {
    switch(status) {
        case '대기중': return 'pending';
        case '승인': return 'approved';
        case '거부': return 'cancelled';
        default: return 'pending';
    }
}

// 차량 승인
function approveDispatch(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
        dispatch.status = '승인';
        localStorage.setItem('dispatches', JSON.stringify(dispatches));
        renderDispatches();
        updateDashboard();
        showNotification('배차가 승인되었습니다.', 'success');
    }
}

// 차량 거부
function rejectDispatch(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
        dispatch.status = '거부';
        localStorage.setItem('dispatches', JSON.stringify(dispatches));
        renderDispatches();
        updateDashboard();
        showNotification('배차가 거부되었습니다.', 'error');
    }
}

// 차량 모달 표시
function showVehicleModal(vehicleId = null) {
    const modal = document.getElementById('vehicleModal');
    const modalTitle = document.getElementById('vehicleModalTitle');
    const form = document.getElementById('vehicleForm');
    
    if (vehicleId) {
        // 수정 모드
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            modalTitle.textContent = '차량 수정';
            form.elements['vehicleNumber'].value = vehicle.number;
            form.elements['vehicleType'].value = vehicle.type;
            form.elements['vehicleModel'].value = vehicle.model || '';
            form.elements['vehicleCapacity'].value = vehicle.capacity || '';
            form.elements['vehicleStatus'].value = vehicle.status;
            form.dataset.editId = vehicleId;
        }
    } else {
        // 새 차량 등록 모드
        modalTitle.textContent = '새 차량 등록';
        form.reset();
        delete form.dataset.editId;
    }
    
    modal.style.display = 'block';
}

// 차량 모달 닫기
function closeVehicleModal() {
    const modal = document.getElementById('vehicleModal');
    modal.style.display = 'none';
}

// 차량 폼 제출 처리
function handleVehicleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const editId = event.target.dataset.editId;
    
    const vehicleData = {
        number: formData.get('vehicleNumber'),
        type: formData.get('vehicleType'),
        model: formData.get('vehicleModel'),
        capacity: parseInt(formData.get('vehicleCapacity')) || 0,
        status: formData.get('vehicleStatus')
    };
    
    if (editId) {
        // 수정
        const index = vehicles.findIndex(v => v.id == editId);
        if (index !== -1) {
            vehicles[index] = { ...vehicles[index], ...vehicleData };
        }
    } else {
        // 새 차량 등록
        vehicleData.id = Date.now();
        vehicles.push(vehicleData);
    }
    
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    renderVehicles();
    updateDashboard();
    closeVehicleModal();
    showNotification(editId ? '차량이 수정되었습니다.' : '새 차량이 등록되었습니다.', 'success');
}

// 차량 삭제
function deleteVehicle(vehicleId) {
    if (confirm('정말로 이 차량을 삭제하시겠습니까?')) {
        vehicles = vehicles.filter(v => v.id !== vehicleId);
        localStorage.setItem('vehicles', JSON.stringify(vehicles));
        renderVehicles();
        updateDashboard();
        showNotification('차량이 삭제되었습니다.', 'success');
    }
}

// 차량 수정
function editVehicle(vehicleId) {
    showVehicleModal(vehicleId);
}

// 대시보드 업데이트
function updateDashboard() {
    document.getElementById('totalVehicles').textContent = vehicles.length;
    document.getElementById('pendingRequests').textContent = dispatches.filter(d => d.status === '대기중').length;
    document.getElementById('approvedRequests').textContent = dispatches.filter(d => d.status === '승인').length;
    document.getElementById('rejectedRequests').textContent = dispatches.filter(d => d.status === '거부').length;
}

// 검색 처리
function handleVehicleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    
    vehicleCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function handleDispatchSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const dispatchCards = document.querySelectorAll('.dispatch-card');
    
    dispatchCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 필터 처리
function handleFilter(event) {
    const status = event.target.dataset.status;
    
    // 모든 필터 버튼 비활성화
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 클릭된 버튼 활성화
    event.target.classList.add('active');
    
    // 배차 카드 필터링
    const dispatchCards = document.querySelectorAll('.dispatch-card');
    dispatchCards.forEach(card => {
        const statusElement = card.querySelector('.dispatch-status');
        const cardStatus = statusElement ? statusElement.textContent.trim() : '';
        
        if (status === 'all' || cardStatus === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 엑셀 내보내기
function exportToExcel(timeframe) {
    const now = new Date();
    let filteredDispatches = [];
    
    switch(timeframe) {
        case 'daily':
            const today = now.toISOString().split('T')[0];
            filteredDispatches = dispatches.filter(d => d.requestDate === today);
            break;
        case 'weekly':
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.requestDate);
                return dispatchDate >= weekStart && dispatchDate <= weekEnd;
            });
            break;
        case 'monthly':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.requestDate);
                return dispatchDate >= monthStart && dispatchDate <= monthEnd;
            });
            break;
        case 'yearly':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const yearEnd = new Date(now.getFullYear(), 11, 31);
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.requestDate);
                return dispatchDate >= yearStart && dispatchDate <= yearEnd;
            });
            break;
        default:
            filteredDispatches = dispatches;
    }
    
    // CSV 데이터 생성
    let csvContent = '요청자,부서,차량,사용날짜,출발시간,도착시간,목적지,사용목적,우선순위,상태\n';
    
    filteredDispatches.forEach(dispatch => {
        const vehicle = vehicles.find(v => v.id == dispatch.vehicleId);
        const vehicleInfo = vehicle ? `${vehicle.number} (${vehicle.type})` : '차량 정보 없음';
        
        csvContent += `"${dispatch.requester}","${dispatch.department}","${vehicleInfo}","${dispatch.requestDate}","${dispatch.startTime}","${dispatch.endTime}","${dispatch.destination}","${dispatch.purpose}","${dispatch.priority}","${dispatch.status}"\n`;
    });
    
    // 파일 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `배차현황_${timeframe}_${now.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${timeframe} 보고서가 다운로드되었습니다.`, 'success');
}

// 알림 표시
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 운행 일지 관련 함수들
function renderOperations() {
    const operationList = document.getElementById('operationList');
    if (!operationList) return;
    
    operationList.innerHTML = '';
    
    operations.forEach(operation => {
        const operationCard = createOperationCard(operation);
        operationList.appendChild(operationCard);
    });
}

function createOperationCard(operation) {
    const card = document.createElement('div');
    card.className = 'operation-card';
    
    const vehicle = vehicles.find(v => v.id == operation.vehicleId);
    const vehicleInfo = vehicle ? `${vehicle.number} (${vehicle.type})` : '차량 정보 없음';
    
    card.innerHTML = `
        <div class="operation-header">
            <div class="operation-title">${vehicleInfo}</div>
            <div class="operation-status status-${operation.status === '완료' ? 'completed' : 'inprogress'}">
                ${operation.status}
            </div>
        </div>
        <div class="operation-info">
            <span><strong>운전자:</strong> ${operation.driver}</span>
            <span><strong>운행일:</strong> ${operation.date}</span>
            <span><strong>출발시간:</strong> ${operation.startTime}</span>
            <span><strong>도착시간:</strong> ${operation.endTime}</span>
        </div>
        <div class="operation-route">
            <h4><i class="fas fa-route"></i> 운행 경로</h4>
            <p><strong>출발지:</strong> ${operation.startLocation}</p>
            <p><strong>도착지:</strong> ${operation.endLocation}</p>
            <p><strong>실제 주행거리:</strong> ${operation.actualKm}km</p>
            ${operation.googleKm ? `<p><strong>구글맵 거리:</strong> ${operation.googleKm}km</p>` : ''}
        </div>
        ${operation.remarks ? `
        <div class="operation-remarks">
            <h4><i class="fas fa-sticky-note"></i> 비고</h4>
            <p>${operation.remarks}</p>
        </div>
        ` : ''}
        <div class="operation-actions">
            <button class="btn btn-secondary" onclick="editOperation(${operation.id})">
                <i class="fas fa-edit"></i> 수정
            </button>
            <button class="btn btn-danger" onclick="deleteOperation(${operation.id})">
                <i class="fas fa-trash"></i> 삭제
            </button>
        </div>
    `;
    
    return card;
}

function showOperationModal(operationId = null) {
    const modal = document.getElementById('operationModal');
    const form = document.getElementById('operationForm');
    const title = document.getElementById('operationModalTitle');
    
    // 차량 목록 업데이트
    const vehicleSelect = document.getElementById('operationVehicle');
    vehicleSelect.innerHTML = '<option value="">차량을 선택하세요</option>';
    vehicles.forEach(vehicle => {
        vehicleSelect.innerHTML += `<option value="${vehicle.id}">${vehicle.number} (${vehicle.type})</option>`;
    });
    
    if (operationId) {
        // 수정 모드
        const operation = operations.find(op => op.id == operationId);
        if (operation) {
            title.textContent = '운행 기록 수정';
            form.elements.operationVehicle.value = operation.vehicleId;
            form.elements.operationDate.value = operation.date;
            form.elements.operationDriver.value = operation.driver;
            form.elements.operationStartLocation.value = operation.startLocation;
            form.elements.operationEndLocation.value = operation.endLocation;
            form.elements.operationStartTime.value = operation.startTime;
            form.elements.operationEndTime.value = operation.endTime;
            form.elements.operationActualKm.value = operation.actualKm;
            form.elements.operationGoogleKm.value = operation.googleKm || '';
            form.elements.operationPurpose.value = operation.purpose || '';
            form.elements.operationRemarks.value = operation.remarks || '';
            form.elements.operationStatus.value = operation.status;
            form.dataset.editId = operationId;
        }
    } else {
        // 새로 추가 모드
        title.textContent = '운행 기록 추가';
        form.reset();
        delete form.dataset.editId;
    }
    
    modal.style.display = 'block';
}

function closeOperationModal() {
    const modal = document.getElementById('operationModal');
    modal.style.display = 'none';
}

function handleOperationSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const operationData = {
        vehicleId: formData.get('operationVehicle'),
        date: formData.get('operationDate'),
        driver: formData.get('operationDriver'),
        startLocation: formData.get('operationStartLocation'),
        endLocation: formData.get('operationEndLocation'),
        startTime: formData.get('operationStartTime'),
        endTime: formData.get('operationEndTime'),
        actualKm: parseFloat(formData.get('operationActualKm')),
        googleKm: formData.get('operationGoogleKm') ? parseFloat(formData.get('operationGoogleKm')) : null,
        purpose: formData.get('operationPurpose'),
        remarks: formData.get('operationRemarks'),
        status: formData.get('operationStatus')
    };
    
    const editId = event.target.dataset.editId;
    
    if (editId) {
        // 수정
        const index = operations.findIndex(op => op.id == editId);
        if (index !== -1) {
            operations[index] = { ...operations[index], ...operationData };
        }
    } else {
        // 새로 추가
        operationData.id = Date.now();
        operations.push(operationData);
    }
    
    localStorage.setItem('operations', JSON.stringify(operations));
    closeOperationModal();
    renderOperations();
    showNotification('운행 기록이 저장되었습니다.', 'success');
}

function deleteOperation(operationId) {
    if (confirm('정말로 이 운행 기록을 삭제하시겠습니까?')) {
        operations = operations.filter(op => op.id != operationId);
        localStorage.setItem('operations', JSON.stringify(operations));
        renderOperations();
        showNotification('운행 기록이 삭제되었습니다.', 'success');
    }
}

function editOperation(operationId) {
    showOperationModal(operationId);
}

// 점검 일지 관련 함수들
function renderInspections() {
    const inspectionList = document.getElementById('inspectionList');
    if (!inspectionList) return;
    
    inspectionList.innerHTML = '';
    
    inspections.forEach(inspection => {
        const inspectionCard = createInspectionCard(inspection);
        inspectionList.appendChild(inspectionCard);
    });
}

function createInspectionCard(inspection) {
    const card = document.createElement('div');
    card.className = 'inspection-card';
    
    const vehicle = vehicles.find(v => v.id == inspection.vehicleId);
    const vehicleInfo = vehicle ? `${vehicle.number} (${vehicle.type})` : '차량 정보 없음';
    
    card.innerHTML = `
        <div class="inspection-header">
            <div class="inspection-title">${vehicleInfo}</div>
            <div class="inspection-type type-${inspection.type === '정기점검' ? 'regular' : inspection.type === '수리' ? 'repair' : 'emergency'}">
                ${inspection.type}
            </div>
        </div>
        <div class="inspection-info">
            <span><strong>점검자:</strong> ${inspection.inspector}</span>
            <span><strong>점검일:</strong> ${inspection.date}</span>
            <span><strong>상태:</strong> ${inspection.status}</span>
            ${inspection.cost ? `<span><strong>비용:</strong> ${inspection.cost.toLocaleString()}원</span>` : ''}
        </div>
        <div class="inspection-description">
            <h4><i class="fas fa-clipboard-list"></i> 점검 내용</h4>
            <p>${inspection.description}</p>
        </div>
        ${inspection.cost ? `
        <div class="inspection-cost">
            <h4><i class="fas fa-coins"></i> 점검 비용</h4>
            <p>${inspection.cost.toLocaleString()}원</p>
        </div>
        ` : ''}
        ${inspection.nextDate || inspection.nextItems ? `
        <div class="inspection-next">
            <h4><i class="fas fa-calendar-alt"></i> 다음 점검 사항</h4>
            ${inspection.nextDate ? `<p><strong>다음 점검일:</strong> ${inspection.nextDate}</p>` : ''}
            ${inspection.nextItems ? `<p><strong>점검 사항:</strong> ${inspection.nextItems}</p>` : ''}
        </div>
        ` : ''}
        <div class="inspection-actions">
            <button class="btn btn-secondary" onclick="editInspection(${inspection.id})">
                <i class="fas fa-edit"></i> 수정
            </button>
            <button class="btn btn-danger" onclick="deleteInspection(${inspection.id})">
                <i class="fas fa-trash"></i> 삭제
            </button>
        </div>
    `;
    
    return card;
}

function showInspectionModal(inspectionId = null) {
    const modal = document.getElementById('inspectionModal');
    const form = document.getElementById('inspectionForm');
    const title = document.getElementById('inspectionModalTitle');
    
    // 차량 목록 업데이트
    const vehicleSelect = document.getElementById('inspectionVehicle');
    vehicleSelect.innerHTML = '<option value="">차량을 선택하세요</option>';
    vehicles.forEach(vehicle => {
        vehicleSelect.innerHTML += `<option value="${vehicle.id}">${vehicle.number} (${vehicle.type})</option>`;
    });
    
    if (inspectionId) {
        // 수정 모드
        const inspection = inspections.find(ins => ins.id == inspectionId);
        if (inspection) {
            title.textContent = '점검 기록 수정';
            form.elements.inspectionVehicle.value = inspection.vehicleId;
            form.elements.inspectionDate.value = inspection.date;
            form.elements.inspectionType.value = inspection.type;
            form.elements.inspectionInspector.value = inspection.inspector;
            form.elements.inspectionDescription.value = inspection.description;
            form.elements.inspectionCost.value = inspection.cost || '';
            form.elements.inspectionNextDate.value = inspection.nextDate || '';
            form.elements.inspectionNextItems.value = inspection.nextItems || '';
            form.elements.inspectionStatus.value = inspection.status;
            form.dataset.editId = inspectionId;
        }
    } else {
        // 새로 추가 모드
        title.textContent = '점검 기록 추가';
        form.reset();
        delete form.dataset.editId;
    }
    
    modal.style.display = 'block';
}

function closeInspectionModal() {
    const modal = document.getElementById('inspectionModal');
    modal.style.display = 'none';
}

function handleInspectionSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const inspectionData = {
        vehicleId: formData.get('inspectionVehicle'),
        date: formData.get('inspectionDate'),
        type: formData.get('inspectionType'),
        inspector: formData.get('inspectionInspector'),
        description: formData.get('inspectionDescription'),
        cost: formData.get('inspectionCost') ? parseFloat(formData.get('inspectionCost')) : null,
        nextDate: formData.get('inspectionNextDate') || null,
        nextItems: formData.get('inspectionNextItems') || null,
        status: formData.get('inspectionStatus')
    };
    
    const editId = event.target.dataset.editId;
    
    if (editId) {
        // 수정
        const index = inspections.findIndex(ins => ins.id == editId);
        if (index !== -1) {
            inspections[index] = { ...inspections[index], ...inspectionData };
        }
    } else {
        // 새로 추가
        inspectionData.id = Date.now();
        inspections.push(inspectionData);
    }
    
    localStorage.setItem('inspections', JSON.stringify(inspections));
    closeInspectionModal();
    renderInspections();
    showNotification('점검 기록이 저장되었습니다.', 'success');
}

function deleteInspection(inspectionId) {
    if (confirm('정말로 이 점검 기록을 삭제하시겠습니까?')) {
        inspections = inspections.filter(ins => ins.id != inspectionId);
        localStorage.setItem('inspections', JSON.stringify(inspections));
        renderInspections();
        showNotification('점검 기록이 삭제되었습니다.', 'success');
    }
}

function editInspection(inspectionId) {
    showInspectionModal(inspectionId);
}

// 검색 기능
function handleOperationSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const operationCards = document.querySelectorAll('.operation-card');
    
    operationCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function handleInspectionSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const inspectionCards = document.querySelectorAll('.inspection-card');
    
    inspectionCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
} 