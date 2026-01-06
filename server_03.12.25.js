// server.js - สำหรับรันบน Plesk (Node.js App)
require('dotenv').config(); // บรรทัดนี้เก็บไว้ได้ ไม่ error แม้ไม่มีไฟล์ .env บน server

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// ถ้า Plesk Node.js v18+ ไม่ต้องใช้ node-fetch ก็ได้ แต่ใส่ไว้กันเหนียวครับ
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// อ่าน Key จาก Plesk Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ใช้ Model ตัวล่าสุด
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

if (!GEMINI_API_KEY) {
    console.error("⚠️ คำเตือน: ไม่พบ GEMINI_API_KEY ใน Environment Variables ของ Plesk");
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// หน้าแรก
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

// API Proxy (หัวใจสำคัญ)
app.post('/api/get-verses', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(503).json({ error: 'Server Error: API Key is missing in Plesk config.' });
    }
    
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: 'No prompt provided.' });

    try {
        const apiResponse = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const apiData = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Gemini API Error:", apiData);
            return res.status(apiResponse.status).json({ error: apiData.error?.message || 'Gemini Error' });
        }

        // ดึงข้อความ JSON จาก Gemini
        const textResponse = apiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // ล้างรูปแบบ Markdown (```json ... ```) ออก
        let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // กรณีมีข้อความอื่นปนมา ให้ตัดเอาเฉพาะส่วนที่เป็น JSON {...} หรือ [...]
        const firstBrace = cleanJson.search(/[\{\[]/);
        const lastBrace = cleanJson.search(/[\}\]][^}\]]*$/);
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        const finalData = JSON.parse(cleanJson);
        res.json(finalData);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});