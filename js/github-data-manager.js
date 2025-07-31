// GitHub API를 사용한 데이터 관리
class GitHubDataManager {
    constructor() {
        this.owner = 'twowhy-prog';
        this.repo = 'vehicle-dispatch-system';
        this.branch = 'main';
        this.token = ''; // GitHub Personal Access Token 필요
        this.baseUrl = 'https://api.github.com';
    }

    // GitHub Personal Access Token 설정
    setToken(token) {
        this.token = token;
    }

    // GitHub API 요청 헤더
    getHeaders() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    // 파일 읽기
    async loadData(dataType) {
        try {
            const response = await fetch(
                `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/data/${dataType}.json?ref=${this.branch}`,
                {
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    // 파일이 없으면 빈 배열 반환
                    return [];
                }
                throw new Error(`Failed to load ${dataType} data`);
            }

            const fileData = await response.json();
            const content = atob(fileData.content);
            return JSON.parse(content);
        } catch (error) {
            console.error(`Error loading ${dataType} data:`, error);
            return [];
        }
    }

    // 파일 저장
    async saveData(dataType, data) {
        try {
            // 먼저 현재 파일 정보 가져오기
            let sha = null;
            try {
                const response = await fetch(
                    `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/data/${dataType}.json?ref=${this.branch}`,
                    {
                        headers: this.getHeaders()
                    }
                );
                if (response.ok) {
                    const fileData = await response.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                // 파일이 없는 경우 무시
            }

            // 파일 업데이트
            const content = btoa(JSON.stringify(data, null, 2));
            const body = {
                message: `Update ${dataType} data`,
                content: content,
                branch: this.branch
            };

            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(
                `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/data/${dataType}.json`,
                {
                    method: 'PUT',
                    headers: this.getHeaders(),
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to save ${dataType} data`);
            }

            return true;
        } catch (error) {
            console.error(`Error saving ${dataType} data:`, error);
            // 실패시 localStorage에 백업
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
                return JSON.parse(backup);
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

// 전역 GitHub 데이터 매니저 인스턴스
const githubDataManager = new GitHubDataManager(); 