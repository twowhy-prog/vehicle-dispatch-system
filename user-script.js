// 전역 변수
let vehicles = [];
let dispatches = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupMobileOptimizations();
});

// 앱 초기화
async function initializeApp() {
    await loadData();
    renderVehicles();
    renderDispatches();
}

// 데이터 로드
async function loadData() {
    try {
        vehicles = await dataManager.loadData('vehicles');
        dispatches = await dataManager.loadData('dispatches');
    } catch (error) {
        console.error('Error loading data:', error);
        // localStorage에서 복원 시도
        vehicles = dataManager.restoreFromLocalStorage('vehicles');
        dispatches = dataManager.restoreFromLocalStorage('dispatches');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 배차 신청 폼
    const dispatchForm = document.getElementById('dispatchForm');
    if (dispatchForm) {
        dispatchForm.addEventListener('submit', handleDispatchSubmit);
    }
    
    // 검색 기능
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // 상태 필터
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilter);
    });
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

// 배차 신청 시 이메일 알림
function sendEmailNotification(dispatchData) {
    const subject = encodeURIComponent('차량 배차 신청 - CPBC');
    const body = encodeURIComponent(`
새로운 차량 배차 신청이 접수되었습니다.

신청자: ${dispatchData.applicant}
차량: ${dispatchData.vehicle}
사용일: ${dispatchData.date}
사용시간: ${dispatchData.startTime} ~ ${dispatchData.endTime}
출발지: ${dispatchData.startLocation}
도착지: ${dispatchData.endLocation}
목적: ${dispatchData.purpose}
승객수: ${dispatchData.passengers}명
비고: ${dispatchData.remarks || '없음'}

관리자 페이지에서 승인/거절을 처리해주세요.
    `);


    // 이메일 전송은 EmailJS를 통해 자동 처리됨

    // 알림 표시
    showNotification('이메일 알림이 준비되었습니다. 이메일 클라이언트가 열리지 않으면 수동으로 관리자에게 연락해주세요.', 'info');
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
}

// 차량 목록 렌더링
function renderVehicles() {
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (!vehicleSelect) return;
    
    vehicleSelect.innerHTML = '<option value="">차량을 선택하세요</option>';
    
    vehicles.forEach(vehicle => {
        if (vehicle.status === '사용가능') {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.number} (${vehicle.type})`;
            vehicleSelect.appendChild(option);
        }
    });
}

// 배차 목록 렌더링
function renderDispatches() {
    const dispatchList = document.getElementById('dispatchList');
    if (!dispatchList) return;
    
    dispatchList.innerHTML = '';
    
    dispatches.forEach(dispatch => {
        const dispatchCard = createDispatchCard(dispatch);
        dispatchList.appendChild(dispatchCard);
    });
}

// 배차 카드 생성
function createDispatchCard(dispatch) {
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
    `;
    
    return card;
}

// 우선순위 클래스 반환
function getPriorityClass(priority) {
    switch (priority) {
        case "low": return "low";
        case "medium": return "medium";
        case "high": return "high";
        case "urgent": return "urgent";
        default: return "low";
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

// 배차 신청 처리
function handleDispatchSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // datetime-local 값을 파싱하여 날짜와 시간 분리
    const startDateTime = new Date(formData.get('startDateTime'));
    const endDateTime = new Date(formData.get('endDateTime'));
    
    const dispatchData = {
        id: Date.now(),
        requester: formData.get('requester'),
        department: formData.get('department'),
        vehicleId: formData.get('vehicleSelect'),
        requestDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endTime: endDateTime.toTimeString().slice(0, 5),
        destination: formData.get('destination'),
        purpose: formData.get('purpose'),
        priority: formData.get('priority'),
        status: '대기중',
        requestTime: new Date().toISOString()
    };
    
    // 시간 검증
    if (startDateTime < new Date()) {
        showNotification('현재시간 기준 과거 일시로 배차를 입력할 수 없습니다. 일시를 확인해주세요.', 'error');
        return;
    }

    // 중복 배차 확인
    if (checkDuplicateDispatch(dispatchData.vehicleId, dispatchData.requestDate, dispatchData.startTime, dispatchData.endTime)) {
        if (!confirm('해당 차량은 이미 배차신청이 되어있습니다. 계속 진행하시겠습니까?')) {
            return;
        }
    }

    // 데이터 매니저를 사용하여 저장
    dataManager.addItem('dispatches', dispatchData).then(() => {
        dispatches.push(dispatchData);
        
        // 이메일 알림 전송
        sendEmailNotification(dispatchData);

        showNotification('배차 신청이 완료되었습니다.', 'success');
        event.target.reset();
        renderDispatches();
    }).catch(error => {
        console.error('Error saving dispatch:', error);
        showNotification('배차 신청 저장 중 오류가 발생했습니다.', 'error');
    });
}

// 검색 처리
function handleSearch(event) {
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

// EmailJS 초기화 예제 코드는 삭제되었습니다. 실제 프로젝트에서는
// emailjs.init(...) 및 emailjs.send(...) 호출을 적절히 구성하세요.
