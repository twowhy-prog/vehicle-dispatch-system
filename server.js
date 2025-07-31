const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 데이터 디렉토리 경로
const DATA_DIR = path.join(__dirname, 'data');

// 데이터 디렉토리 생성
async function ensureDataDirectory() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// 데이터 파일 읽기
app.get('/data/:filename', async (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, req.params.filename);
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            // 파일이 없으면 빈 배열 반환
            res.json([]);
        } else {
            res.status(500).json({ error: 'Failed to read data file' });
        }
    }
});

// 데이터 파일 저장
app.post('/data/:filename', async (req, res) => {
    try {
        await ensureDataDirectory();
        const filePath = path.join(DATA_DIR, req.params.filename);
        await fs.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data file' });
    }
});

// 데이터 백업
app.post('/backup', async (req, res) => {
    try {
        await ensureDataDirectory();
        const backupDir = path.join(DATA_DIR, 'backup', new Date().toISOString().split('T')[0]);
        await fs.mkdir(backupDir, { recursive: true });

        const files = await fs.readdir(DATA_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        for (const file of jsonFiles) {
            const sourcePath = path.join(DATA_DIR, file);
            const backupPath = path.join(backupDir, file);
            await fs.copyFile(sourcePath, backupPath);
        }

        res.json({ success: true, backupPath: backupDir });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// 데이터 복원
app.post('/restore/:date', async (req, res) => {
    try {
        const backupDir = path.join(DATA_DIR, 'backup', req.params.date);
        const files = await fs.readdir(backupDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        for (const file of jsonFiles) {
            const backupPath = path.join(backupDir, file);
            const restorePath = path.join(DATA_DIR, file);
            await fs.copyFile(backupPath, restorePath);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({ error: 'Failed to restore backup' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
}); 