// server.js - Node.js Server for bible.iam7.co.th (With Caching)
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs'); // สำคัญ: ใช้สำหรับบันทึกไฟล์ Cache
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

// สร้างโฟลเดอร์ cache ถ้ายังไม่มี
const CACHE_DIR = path.join(__dirname, 'bible_cache');
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
    console.log("Created cache directory at:", CACHE_DIR);
}

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set!");
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

// Route เดิมสำหรับเสี่ยงฉลาก (เก็บไว้)
app.post('/api/get-verses', async (req, res) => {
    if (!GEMINI_API_KEY) return res.status(503).json({ error: 'Service Unavailable' });
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: req.body.prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = cleanJson.indexOf('{');
        const end = cleanJson.lastIndexOf('}');
        if (start !== -1 && end !== -1) cleanJson = cleanJson.substring(start, end + 1);
        res.json(JSON.parse(cleanJson));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- NEW ROUTE: Caching System ---
app.post('/api/get-chapter', async (req, res) => {
    const { bookEn, chapter } = req.body;
    if (!bookEn || !chapter) return res.status(400).json({ error: 'Missing parameters' });

    // สร้างชื่อไฟล์ที่ปลอดภัย (เช่น Genesis_1.json)
    const safeBook = bookEn.replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeBook}_${chapter}.json`;
    const filepath = path.join(CACHE_DIR, filename);

    // 1. เช็คว่ามีไฟล์อยู่แล้วหรือไม่ (Cache Hit)
    if (fs.existsSync(filepath)) {
        console.log(`Cache HIT: ${filename}`);
        try {
            const cachedData = fs.readFileSync(filepath, 'utf8');
            return res.json(JSON.parse(cachedData));
        } catch (e) {
            console.error("Cache read error", e);
        }
    }

    // 2. ถ้าไม่มี ให้เรียก AI (Cache Miss)
    console.log(`Cache MISS: ${filename}, fetching AI...`);
    const prompt = `
        Act as Professor of Ethiopian Biblical Studies.
        Target: Book "${bookEn}" (Ethiopian Canon), Chapter ${chapter}.
        Output JSON: {
            "translation": "Formal Thai translation HTML <p>...",
            "summary": "Sidebar commentary HTML <div>..."
        }
    `;

    try {
        const apiRes = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await apiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No AI response");

        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const finalData = JSON.parse(cleanJson);

        // 3. บันทึกลงไฟล์
        fs.writeFileSync(filepath, JSON.stringify(finalData), 'utf8');
        console.log(`Saved Cache: ${filename}`);
        
        res.json(finalData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI Processing Failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});