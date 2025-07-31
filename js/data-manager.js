// 데이터 관리 유틸리티
class DataManager {
    constructor() {
        this.dataPath = 'data/';
        this.cache = {
            vehicles: null,
            dispatches: null,
            operations: null,
            inspections: null,
            config: null
        };
    }

    // 데이터 파일 읽기
    async loadData(dataType) {
        try {
            if (this.cache[dataType]) {
                return this.cache[dataType];
            }

            const response = await fetch(`${this.dataPath}${dataType}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${dataType} data`);
            }
            
            const data = await response.json();
            this.cache[dataType] = data;
            return data;
        } catch (error) {
            console.error(`Error loading ${dataType} data:`, error);
            return [];
        }
    }

    // 데이터 파일 저장
    async saveData(dataType, data) {
        try {
            this.cache[dataType] = data;
            
            const response = await fetch(`${this.dataPath}${dataType}.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data, null, 2)
            });

            if (!response.ok) {
                throw new Error(`Failed to save ${dataType} data`);
            }

            return true;
        } catch (error) {
            console.error(`Error saving ${dataType} data:`, error);
            // 파일 저장이 실패하면 localStorage에 백업
            this.backupToLocalStorage(dataType, data);
            return false;
        }
    }

    // localStorage 백업
    backupToLocalStorage(dataType, data) {
        try {
            localStorage.setItem(`${dataType}_backup`, JSON.stringify(data));
            console.log(`${dataType} data backed up to localStorage`);
        } catch (error) {
            console.error(`Error backing up ${dataType} to localStorage:`, error);
        }
    }

    // localStorage에서 복원
    restoreFromLocalStorage(dataType) {
        try {
            const backup = localStorage.getItem(`${dataType}_backup`);
            if (backup) {
                const data = JSON.parse(backup);
                this.cache[dataType] = data;
                return data;
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

    // 캐시 초기화
    clearCache() {
        this.cache = {
            vehicles: null,
            dispatches: null,
            operations: null,
            inspections: null,
            config: null
        };
    }

    // 데이터 내보내기
    async exportData(dataType) {
        const data = await this.loadData(dataType);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 데이터 가져오기
    async importData(dataType, file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await this.saveData(dataType, data);
            this.clearCache();
            return true;
        } catch (error) {
            console.error(`Error importing ${dataType} data:`, error);
            return false;
        }
    }
}

// 전역 데이터 매니저 인스턴스
const dataManager = new DataManager(); 