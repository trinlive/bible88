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

// *** ส่วนสำคัญ: การจัดการ Path ของ Cache ใน Plesk ***
const CACHE_DIR = path.join(__dirname, 'bible_cache');

// ตรวจสอบและสร้างโฟลเดอร์ Cache ถ้ายังไม่มี
if (!fs.existsSync(CACHE_DIR)) {
    try {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        console.log("Created cache directory at:", CACHE_DIR);
    } catch (err) {
        console.error("Error creating cache dir. Check Plesk permissions:", err);
    }
}

app.use(cors());
app.use(bodyParser.json());

// ให้ Server มองหาไฟล์ HTML ในโฟลเดอร์ 'public' (Document Root)
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});



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
    // เพิ่ม Timeout สำหรับ Request นี้โดยเฉพาะ (3 นาที)
    req.setTimeout(180000); 

    const { bookEn, chapter } = req.body;
    console.log(`Processing: ${bookEn} Ch.${chapter}`); 

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

   // 2. Cache MISS - Call AI
    console.log(`Cache MISS: ${filename}, fetching AI...`);
    
    // Prompt ที่ปรับปรุงแล้วจากรอบก่อน
    const prompt = `
        Role: Expert Bible Translator & Professor of Ethiopian Studies.
        Task: Provide content for Book: "${bookEn}" (Ethiopian Canon), Chapter: ${chapter}.
        
        Role: Expert Bible Translator & Professor of Ethiopian Studies.
        Task: Provide content for Book: "${bookEn}" (Ethiopian Canon), Chapter: ${chapter}.
        
         Requirements:
        1. Translation: Translate to formal Thai. Use HTML <p> tags. 
           - **VERSE FORMAT**: Start every verse with <span class="verse-num">X</span> (where X is verse number).
           
            - **DIVINE NAMES RULES (MANDATORY)**:
             1. For "Yahweh", "The LORD" (YHWH) -> Must translate EXACTLY as:
                <span class="font-bold text-amber-700 mx-1">𐤉𐤄𐤅𐤄 พระบิดายาห์ฮฺวาห์</span>
             2. For "Jesus" (Yeshua) -> Must translate EXACTLY as:
                <span class="font-bold text-amber-700 mx-1">𐤉𐤄𐤅𐤔𐤏 พระบุตรยาห์ชัวห์</span>
             3. For "Christ" -> Must translate EXACTLY as:
                "พระเมสสิยาห์"
                (Use normal text, no bold, no special styling).
           
        2. Summary: Provide sidebar commentary in Thai using HTML.
           - First, analyze key theological points (use emojis 🔑, 📜).
           - **CRITICAL**: Add a distinct section titled "🔍 เจาะลึกรากศัพท์" (Word Study).
           - Select 2-4 key terms from this chapter in their original language (Hebrew, Aramaic, Greek, or Ge'ez).
           - Format each word as: <b>Thai Word</b> (<i>Original Word</i>) - Definition/Nuance.
           - **STYLING**: Wrap this vocabulary section in a <div class="bg-white p-3 rounded-lg border border-slate-200 mt-4 shadow-sm text-sm">.

        Output JSON format ONLY:
        {
            "translation": "HTML string...",
            "summary": "HTML string..."
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
        const start = cleanJson.indexOf('{');
        const end = cleanJson.lastIndexOf('}');
        if (start !== -1 && end !== -1) cleanJson = cleanJson.substring(start, end + 1);

        const finalData = JSON.parse(cleanJson);

        // 3. บันทึก Cache ลงไฟล์ (จุดที่มักมีปัญหาใน Plesk)
               try {
                   fs.writeFileSync(filepath, JSON.stringify(finalData), 'utf8');
                   console.log(`Saved Cache: ${filename}`);
               } catch (writeErr) {
                   console.error("Write Cache Error (Permission issue?):", writeErr);
                   // ถึงบันทึกไม่ได้ ก็ยังส่งข้อมูลกลับไปให้ User ได้
               }
               
               res.json(finalData);
       
           } catch (error) {
               console.error("Server Error:", error);
               res.status(500).json({ error: "AI Processing Failed or Server Error" });
           }
       });


// Start Server with increased timeouts
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ป้องกัน Apache/Nginx ตัดการเชื่อมต่อก่อน Node.js ทำงานเสร็จ
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
