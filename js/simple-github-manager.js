// GitHub Pages를 사용한 간단한 데이터 관리
class SimpleGitHubManager {
    constructor() {
        this.baseUrl = 'https://twowhy-prog.github.io/vehicle-dispatch-system';
        this.dataPath = 'data';
    }

    // 데이터 읽기 (GitHub Pages에서)
    async loadData(dataType) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.dataPath}/${dataType}.json`);
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`Failed to load ${dataType} data`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${dataType} data:`, error);
            // 로컬 백업에서 복원 시도
            return this.restoreFromLocalStorage(dataType);
        }
    }

    // 데이터 저장 (localStorage에만 저장, GitHub는 수동 업로드)
    async saveData(dataType, data) {
        try {
            // localStorage에 저장
            localStorage.setItem(`${dataType}_data`, JSON.stringify(data));
            
            // 사용자에게 GitHub에 수동 업로드 안내
            this.showUploadNotification(dataType, data);
            
            return true;
        } catch (error) {
            console.error(`Error saving ${dataType} data:`, error);
            return false;
        }
    }

    // GitHub 수동 업로드 안내
    showUploadNotification(dataType, data) {
        const message = `
데이터가 로컬에 저장되었습니다.
GitHub에 업로드하려면:
1. data/${dataType}.json 파일을 다운로드
2. GitHub 저장소에 수동으로 업로드
        `;
        
        // 다운로드 링크 생성
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}.json`;
        a.textContent = `${dataType}.json 다운로드`;
        a.style.display = 'block';
        a.style.margin = '10px 0';
        a.style.padding = '10px';
        a.style.backgroundColor = '#007bff';
        a.style.color = 'white';
        a.style.textDecoration = 'none';
        a.style.borderRadius = '5px';
        
        // 알림 표시
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <h4>데이터 저장됨</h4>
            <p>${dataType} 데이터가 로컬에 저장되었습니다.</p>
            <p>GitHub에 업로드하려면 아래 링크를 클릭하세요:</p>
        `;
        notification.appendChild(a);
        
        // 닫기 버튼
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '닫기';
        closeBtn.style.cssText = `
            margin-top: 10px;
            padding: 5px 10px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => document.body.removeChild(notification);
        notification.appendChild(closeBtn);
        
        document.body.appendChild(notification);
        
        // 10초 후 자동 제거
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 10000);
    }

    // localStorage에서 복원
    restoreFromLocalStorage(dataType) {
        try {
            const data = localStorage.getItem(`${dataType}_data`);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error(`Error restoring ${dataType} from localStorage:`, error);
        }
        return [];
    }

    // 데이터 추가
    async addItem(dataType, item) {
        const data = await this.loadData(dataType);
        item.id = Date.now();
        data.push(item);
        await this.saveData(dataType, data);
        return item;
    }

    // 데이터 업데이트
    async updateItem(dataType, id, updates) {
        const data = await this.loadData(dataType);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            await this.saveData(dataType, data);
            return data[index];
        }
        return null;
    }

    // 데이터 삭제
    async deleteItem(dataType, id) {
        const data = await this.loadData(dataType);
        const filteredData = data.filter(item => item.id !== id);
        await this.saveData(dataType, filteredData);
    }

    // 데이터 검색
    async searchItems(dataType, searchTerm, field = null) {
        const data = await this.loadData(dataType);
        if (!searchTerm) return data;
        
        return data.filter(item => {
            if (field) {
                return item[field] && item[field].toLowerCase().includes(searchTerm.toLowerCase());
            }
            return Object.values(item).some(value => 
                value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }
}

// 전역 간단한 GitHub 매니저 인스턴스
const simpleGitHubManager = new SimpleGitHubManager(); 