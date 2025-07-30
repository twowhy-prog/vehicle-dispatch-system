// 전역 변수
let vehicles = [];
let dispatches = [];
let currentMonth = '';
let operations = [];
let inspections = [];
let isLoggedIn = false;
let adminPassword = localStorage.getItem('adminPassword') || 'admin123'; // 비밀번호를 localStorage에서 관리

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
    
    // 저장된 데이터가 없으면 빈 배열 유지
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

    const dispatchMonth = document.getElementById('dispatchMonth');
    if (dispatchMonth) {
        dispatchMonth.addEventListener('change', function(e) {
            currentMonth = e.target.value;
            renderDispatches();
        });
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
    
    // 비밀번호 변경 폼
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // 기사별 운행기록 검색
    const driverSearchInput = document.getElementById('driverSearchInput');
    if (driverSearchInput) {
        driverSearchInput.addEventListener('input', handleDriverSearch);
    }
    
    // 신청자 검색
    const applicantSearchInput = document.getElementById('applicantSearchInput');
    if (applicantSearchInput) {
        applicantSearchInput.addEventListener('input', handleApplicantSearch);
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
    
    if (password === adminPassword) {
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
            <button class="btn btn-secondary" onclick="showVehicleStatusModal(${vehicle.id})">
                <i class="fas fa-info-circle"></i> 상태 확인
            </button>
            <button class="btn btn-primary" onclick="editVehicle(${vehicle.id})">
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
    let filtered = dispatches;
    if (currentMonth) {
        filtered = dispatches.filter(d => (d.startDate || '').startsWith(currentMonth));
    }

    filtered.forEach(dispatch => {
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
            <span><i class="fas fa-calendar"></i> ${dispatch.startDate} ${dispatch.startTime}</span>
            <span><i class="fas fa-calendar"></i> ${dispatch.endDate} ${dispatch.endTime}</span>
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
            <button class="btn btn-danger" onclick="deleteDispatch(${dispatch.id})">
                <i class="fas fa-trash"></i> 삭제
            </button>
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

function deleteDispatch(dispatchId) {
    if (confirm('정말로 이 배차 기록을 삭제하시겠습니까?')) {
        dispatches = dispatches.filter(d => d.id != dispatchId);
        localStorage.setItem('dispatches', JSON.stringify(dispatches));
        renderDispatches();
        updateDashboard();
        showNotification('배차 기록이 삭제되었습니다.', 'success');
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

// 차량 삭제 기능 수정
function deleteVehicle(vehicleId) {
    if (confirm('정말로 이 차량을 삭제하시겠습니까?')) {
        vehicles = vehicles.filter(vehicle => vehicle.id != vehicleId);
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
            filteredDispatches = dispatches.filter(d => d.startDate === today);
            break;
        case 'weekly':
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.startDate);
                return dispatchDate >= weekStart && dispatchDate <= weekEnd;
            });
            break;
        case 'monthly':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.startDate);
                return dispatchDate >= monthStart && dispatchDate <= monthEnd;
            });
            break;
        case 'yearly':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const yearEnd = new Date(now.getFullYear(), 11, 31);
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.startDate);
                return dispatchDate >= yearStart && dispatchDate <= yearEnd;
            });
            break;
        default:
            filteredDispatches = dispatches;
    }
    
    // CSV 데이터 생성
    let csvContent = '요청자,부서,차량,출발일자,출발시간,도착일자,도착시간,목적지,사용목적,우선순위,상태\n';
    
    filteredDispatches.forEach(dispatch => {
        const vehicle = vehicles.find(v => v.id == dispatch.vehicleId);
        const vehicleInfo = vehicle ? `${vehicle.number} (${vehicle.type})` : '차량 정보 없음';
        
        csvContent += `"${dispatch.requester}","${dispatch.department}","${vehicleInfo}","${dispatch.startDate}","${dispatch.startTime}","${dispatch.endDate}","${dispatch.endTime}","${dispatch.destination}","${dispatch.purpose}","${dispatch.priority}","${dispatch.status}"\n`;
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

// 시간 검증 함수
function validateDateTime(date, time) {
    const selectedDateTime = new Date(date + 'T' + time);
    const now = new Date();
    
    // 과거 시간인지 확인
    if (selectedDateTime < now) {
        return false;
    }
    
    return true;
}

// 중복 배차 확인 함수
function checkDuplicateDispatch(vehicle, date, startTime, endTime) {
    const conflictingDispatches = dispatches.filter(dispatch => {
        if (dispatch.vehicle !== vehicle || dispatch.status === '거부됨' || dispatch.status === '취소됨') {
            return false;
        }
        
        const dispatchDate = dispatch.date;
        const dispatchStart = dispatch.startTime;
        const dispatchEnd = dispatch.endTime;
        
        // 같은 날짜이고 시간이 겹치는지 확인
        if (dispatchDate === date) {
            const newStart = new Date(date + 'T' + startTime);
            const newEnd = new Date(date + 'T' + endTime);
            const existingStart = new Date(dispatchDate + 'T' + dispatchStart);
            const existingEnd = new Date(dispatchDate + 'T' + dispatchEnd);
            
            return (newStart < existingEnd && newEnd > existingStart);
        }
        
        return false;
    });
    
    return conflictingDispatches.length > 0;
}

// 배차 승인 시 이메일 알림
function sendDispatchEmailNotification(dispatch, action) {
    const subject = encodeURIComponent(`차량 배차 ${action === 'approve' ? '승인' : '거부'} - CPBC`);
    const body = encodeURIComponent(`
${action === 'approve' ? '승인' : '거부'}된 차량 배차 신청 정보입니다.

신청자: ${dispatch.applicant}
차량: ${dispatch.vehicle}
사용일: ${dispatch.date}
사용시간: ${dispatch.startTime} ~ ${dispatch.endTime}
출발지: ${dispatch.startLocation}
도착지: ${dispatch.endLocation}
목적: ${dispatch.purpose}
승객수: ${dispatch.passengers}명
비고: ${dispatch.remarks || '없음'}
상태: ${action === 'approve' ? '승인됨' : '거부됨'}

${action === 'approve' ? '승인된 배차는 운행일지에서 확인할 수 있습니다.' : '거부된 배차는 재신청이 필요합니다.'}
    `);

}

// 배차 승인/거부 함수 수정
function approveDispatch(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
        dispatch.status = '승인됨';
        dispatch.approvedAt = new Date().toISOString();
        localStorage.setItem('dispatches', JSON.stringify(dispatches));
        renderDispatches();
        updateDashboard();
        
        // 이메일 알림 전송
        sendDispatchEmailNotification(dispatch, 'approve');
        
        showNotification('배차가 승인되었습니다.', 'success');
    }
}

function rejectDispatch(dispatchId) {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
        dispatch.status = '거부됨';
        dispatch.rejectedAt = new Date().toISOString();
        localStorage.setItem('dispatches', JSON.stringify(dispatches));
        renderDispatches();
        updateDashboard();
        
        // 이메일 알림 전송
        sendDispatchEmailNotification(dispatch, 'reject');
        
        showNotification('배차가 거부되었습니다.', 'warning');
    }
}

// 운행일지 배차 연동 함수
function loadApprovedDispatches() {
    const approvedDispatches = dispatches.filter(d => d.status === '승인됨');
    const dispatchSelect = document.getElementById('dispatchSelect');
    
    if (dispatchSelect) {
        dispatchSelect.innerHTML = '<option value="">배차 신청 선택</option>';
        
        approvedDispatches.forEach(dispatch => {
            const option = document.createElement('option');
            option.value = dispatch.id;
            option.textContent = `${dispatch.applicant} - ${dispatch.vehicle} (${dispatch.date} ${dispatch.startTime})`;
            dispatchSelect.appendChild(option);
        });
    }
}

// 배차 선택 시 자동 입력
function onDispatchSelect() {
    const dispatchSelect = document.getElementById('dispatchSelect');
    const selectedDispatchId = parseInt(dispatchSelect.value);
    
    if (selectedDispatchId) {
        const dispatch = dispatches.find(d => d.id === selectedDispatchId);
        if (dispatch) {
            document.getElementById('operationVehicle').value = dispatch.vehicle;
            document.getElementById('operationDate').value = dispatch.date;
            document.getElementById('operationStartTime').value = dispatch.startTime;
            document.getElementById('operationEndTime').value = dispatch.endTime;
            document.getElementById('operationStartLocation').value = dispatch.startLocation;
            document.getElementById('operationEndLocation').value = dispatch.endLocation;
            document.getElementById('operationPurpose').value = dispatch.purpose;
        }
    }
}

// 엑셀 내보내기 함수 수정 (한글 지원)
function exportToExcel(timeframe) {
    const now = new Date();
    let filteredDispatches = [];
    
    switch(timeframe) {
        case 'daily':
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.date);
                return dispatchDate.toDateString() === now.toDateString();
            });
            break;
        case 'weekly':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.date);
                return dispatchDate >= weekAgo;
            });
            break;
        case 'monthly':
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.date);
                return dispatchDate.getMonth() === now.getMonth() && 
                       dispatchDate.getFullYear() === now.getFullYear();
            });
            break;
        case 'yearly':
            filteredDispatches = dispatches.filter(d => {
                const dispatchDate = new Date(d.date);
                return dispatchDate.getFullYear() === now.getFullYear();
            });
            break;
        default:
            filteredDispatches = dispatches;
    }
    
    if (filteredDispatches.length === 0) {
        showNotification('내보낼 데이터가 없습니다.', 'warning');
        return;
    }
    
    // CSV 헤더 (한글 지원)
    let csvContent = '\uFEFF'; // BOM 추가로 한글 지원
    csvContent += '신청자,차량,사용일,시작시간,종료시간,출발지,도착지,목적,승객수,상태,비고\n';
    
    filteredDispatches.forEach(dispatch => {
        const row = [
            dispatch.applicant,
            dispatch.vehicle,
            dispatch.date,
            dispatch.startTime,
            dispatch.endTime,
            dispatch.startLocation,
            dispatch.endLocation,
            dispatch.purpose,
            dispatch.passengers,
            dispatch.status,
            dispatch.remarks || ''
        ].map(field => `"${field}"`).join(',');
        
        csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `배차현황_${timeframe}_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 차량 상태 팝업 함수
function showVehicleStatusModal(vehicleId = null) {
    if (vehicleId) {
        // 특정 차량의 상태 표시
        displayVehicleStatus(vehicleId);
    } else {
        // 차량 선택 모달 표시
        let modalContent = `
            <div class="modal-header">
                <h3>차량 상태 확인</h3>
                <button class="close-btn" onclick="closeVehicleStatusModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="vehicle-selection">
                    <h4>확인할 차량을 선택하세요</h4>
                    <div class="vehicle-list">
        `;
        
        vehicles.forEach(vehicle => {
            modalContent += `
                <div class="vehicle-item" onclick="displayVehicleStatus(${vehicle.id})">
                    <div class="vehicle-info">
                        <h5>${vehicle.number}</h5>
                        <p>${vehicle.model} - ${vehicle.type}</p>
                        <span class="status-badge ${getVehicleStatusClass(vehicle.status)}">${vehicle.status}</span>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
        });
        
        modalContent += `
                    </div>
                </div>
            </div>
        `;
        
        showModal('vehicleStatusModal', modalContent);
    }
}

function displayVehicleStatus(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const vehicleOperations = operations.filter(op => op.vehicle === vehicle.number);
    const vehicleInspections = inspections.filter(ins => ins.vehicle === vehicle.number);
    
    let modalContent = `
        <div class="modal-header">
            <h3>${vehicle.number} - ${vehicle.model} 상태 정보</h3>
            <button class="close-btn" onclick="closeVehicleStatusModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="vehicle-info">
                <h4>차량 기본 정보</h4>
                <p><strong>차량번호:</strong> ${vehicle.number}</p>
                <p><strong>차종:</strong> ${vehicle.type}</p>
                <p><strong>모델:</strong> ${vehicle.model}</p>
                <p><strong>수용인원:</strong> ${vehicle.capacity}명</p>
                <p><strong>현재상태:</strong> <span class="status-badge ${getVehicleStatusClass(vehicle.status)}">${vehicle.status}</span></p>
            </div>
            
            <div class="operation-history">
                <h4>최근 운행 기록 (최근 5건)</h4>
                ${vehicleOperations.slice(0, 5).map(op => `
                    <div class="history-item">
                        <p><strong>운행일:</strong> ${op.date}</p>
                        <p><strong>기사:</strong> ${op.driver || '미입력'}</p>
                        <p><strong>실제주행거리:</strong> ${op.actualKm}km</p>
                        <p><strong>비고:</strong> ${op.remarks || '없음'}</p>
                    </div>
                `).join('') || '<p>운행 기록이 없습니다.</p>'}
            </div>
            
            <div class="inspection-history">
                <h4>최근 점검 기록 (최근 3건)</h4>
                ${vehicleInspections.slice(0, 3).map(ins => `
                    <div class="history-item">
                        <p><strong>점검일:</strong> ${ins.date}</p>
                        <p><strong>점검내용:</strong> ${ins.inspectionType}</p>
                        <p><strong>비용:</strong> ${ins.cost}원</p>
                        <p><strong>다음점검:</strong> ${ins.nextInspection || '미정'}</p>
                    </div>
                `).join('') || '<p>점검 기록이 없습니다.</p>'}
            </div>
        </div>
    `;
    
    showModal('vehicleStatusModal', modalContent);
}

function closeVehicleStatusModal() {
    const modal = document.getElementById('vehicleStatusModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 기사별 운행기록 검색
function handleDriverSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const driverOperations = operations.filter(op => 
        op.driver && op.driver.toLowerCase().includes(searchTerm)
    );
    
    renderDriverOperations(driverOperations);
}

function renderDriverOperations(operations) {
    const container = document.getElementById('driverOperationsContainer');
    if (!container) return;
    
    if (operations.length === 0) {
        container.innerHTML = '<p class="no-data">검색된 운행 기록이 없습니다.</p>';
        return;
    }
    
    let html = '<div class="operations-grid">';
    operations.forEach(operation => {
        html += `
            <div class="operation-card">
                <div class="operation-header">
                    <h4>${operation.vehicle}</h4>
                    <span class="date">${operation.date}</span>
                </div>
                <div class="operation-details">
                    <p><strong>기사:</strong> ${operation.driver}</p>
                    <p><strong>실제주행거리:</strong> ${operation.actualKm}km</p>
                    <p><strong>비고:</strong> ${operation.remarks || '없음'}</p>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// 기사별 운행기록 엑셀 내보내기
function exportDriverOperations() {
    const driverSearchInput = document.getElementById('driverSearchInput');
    const searchTerm = driverSearchInput ? driverSearchInput.value.toLowerCase() : '';
    
    let filteredOperations = operations;
    if (searchTerm) {
        filteredOperations = operations.filter(op => 
            op.driver && op.driver.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredOperations.length === 0) {
        showNotification('내보낼 데이터가 없습니다.', 'warning');
        return;
    }
    
    let csvContent = '\uFEFF'; // BOM 추가로 한글 지원
    csvContent += '기사명,차량번호,운행일,실제주행거리,비고\n';
    
    filteredOperations.forEach(operation => {
        const row = [
            operation.driver || '',
            operation.vehicle,
            operation.date,
            operation.actualKm,
            operation.remarks || ''
        ].map(field => `"${field}"`).join(',');
        
        csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `기사별운행기록_${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}${new Date().getDate().toString().padStart(2,'0')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 비밀번호 변경 함수
function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (currentPassword !== adminPassword) {
        showNotification('현재 비밀번호가 올바르지 않습니다.', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('새 비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('새 비밀번호는 6자 이상이어야 합니다.', 'error');
        return;
    }
    
    adminPassword = newPassword;
    localStorage.setItem('adminPassword', newPassword);
    
    document.getElementById('passwordForm').reset();
    showNotification('비밀번호가 성공적으로 변경되었습니다.', 'success');
}

// 신청자 검색 함수
function handleApplicantSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const applicantDispatches = dispatches.filter(d => 
        d.applicant && d.applicant.toLowerCase().includes(searchTerm)
    );
    
    const applicantOperations = operations.filter(op => {
        const relatedDispatch = dispatches.find(d => 
            d.vehicle === op.vehicle && 
            d.date === op.date && 
            d.status === '승인됨'
        );
        return relatedDispatch && relatedDispatch.applicant && 
               relatedDispatch.applicant.toLowerCase().includes(searchTerm);
    });
    
    renderApplicantSearchResults(applicantDispatches, applicantOperations);
}

function renderApplicantSearchResults(dispatches, operations) {
    const container = document.getElementById('applicantSearchResults');
    if (!container) return;
    
    let html = '<div class="search-results">';
    
    if (dispatches.length === 0 && operations.length === 0) {
        html += '<p class="no-data">검색된 결과가 없습니다.</p>';
    } else {
        if (dispatches.length > 0) {
            html += '<h4>배차 신청 내역</h4>';
            dispatches.forEach(dispatch => {
                html += `
                    <div class="search-result-item">
                        <p><strong>신청자:</strong> ${dispatch.applicant}</p>
                        <p><strong>차량:</strong> ${dispatch.vehicle}</p>
                        <p><strong>사용일:</strong> ${dispatch.date}</p>
                        <p><strong>상태:</strong> <span class="status-badge ${getStatusClass(dispatch.status)}">${dispatch.status}</span></p>
                    </div>
                `;
            });
        }
        
        if (operations.length > 0) {
            html += '<h4>운행 내역</h4>';
            operations.forEach(operation => {
                html += `
                    <div class="search-result-item">
                        <p><strong>차량:</strong> ${operation.vehicle}</p>
                        <p><strong>운행일:</strong> ${operation.date}</p>
                        <p><strong>기사:</strong> ${operation.driver || '미입력'}</p>
                        <p><strong>실제주행거리:</strong> ${operation.actualKm}km</p>
                    </div>
                `;
            });
        }
    }
    
    html += '</div>';
    container.innerHTML = html;
} 

// 모달 표시 함수
function showModal(modalId, content) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = content;
        }
        modal.style.display = 'block';
    }
}

// 운행일지 모달 표시 시 배차 연동 초기화
function showOperationModal(operationId = null) {
    const modal = document.getElementById('operationModal');
    if (modal) {
        // 배차 신청 목록 로드
        loadApprovedDispatches();
        
        // 차량 목록 로드
        const vehicleSelect = document.getElementById('operationVehicle');
        if (vehicleSelect) {
            vehicleSelect.innerHTML = '<option value="">차량을 선택하세요</option>';
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.number;
                option.textContent = `${vehicle.number} - ${vehicle.model}`;
                vehicleSelect.appendChild(option);
            });
        }
        
        if (operationId) {
            // 수정 모드
            const operation = operations.find(op => op.id === operationId);
            if (operation) {
                document.getElementById('operationModalTitle').textContent = '운행 기록 수정';
                document.getElementById('operationVehicle').value = operation.vehicle;
                document.getElementById('operationDate').value = operation.date;
                document.getElementById('operationStartTime').value = operation.startTime;
                document.getElementById('operationEndTime').value = operation.endTime;
                document.getElementById('operationStartLocation').value = operation.startLocation;
                document.getElementById('operationEndLocation').value = operation.endLocation;
                document.getElementById('operationPurpose').value = operation.purpose;
                document.getElementById('operationDriver').value = operation.driver || '';
                document.getElementById('operationActualKm').value = operation.actualKm;
                document.getElementById('operationRemarks').value = operation.remarks || '';
                document.getElementById('operationStatus').value = operation.status;
                
                // 숨겨진 필드에 ID 저장
                let hiddenId = document.getElementById('operationId');
                if (!hiddenId) {
                    hiddenId = document.createElement('input');
                    hiddenId.type = 'hidden';
                    hiddenId.id = 'operationId';
                    document.getElementById('operationForm').appendChild(hiddenId);
                }
                hiddenId.value = operationId;
            }
        } else {
            // 새 등록 모드
            document.getElementById('operationModalTitle').textContent = '운행 기록 추가';
            document.getElementById('operationForm').reset();
            
            // 숨겨진 필드 제거
            const hiddenId = document.getElementById('operationId');
            if (hiddenId) {
                hiddenId.remove();
            }
        }
        
        modal.style.display = 'block';
    }
} 

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function (e) {
            const keyword = e.target.value.toLowerCase();
            const filtered = dispatches.filter(d => d.requester && d.requester.toLowerCase().includes(keyword));
            renderDispatches(filtered);
        });
    }
});


// EmailJS 초기화
(function(){
    emailjs.init("YOUR_USER_ID"); // 사용자 ID로 교체
})();


// 배차 승인 시 신청자에게 이메일 전송
emailjs.send("gmail_service", "approval_template", {
    requester_name: dispatch.requester,
    requester_email: dispatch.email,
    message: "신청하신 배차가 승인되었습니다."
});


// EmailJS 초기화
(function() {
    emailjs.init("tv9jg-W2_pe0bM_0S");
})();


// 배차 승인 시 신청자에게 이메일 전송
const vehicle = vehicles.find(v => v.id == dispatch.vehicleId);
const vehicleNumber = vehicle ? vehicle.number : "차량 정보 없음";

emailjs.send("twowhy", "template_cyzz7wr", {
    requester_name: dispatch.requester,
    requester_email: dispatch.email,
    vehicle_number: vehicleNumber,
    dispatch_date: dispatch.date,
    dispatch_time: dispatch.startTime + " ~ " + dispatch.endTime
});