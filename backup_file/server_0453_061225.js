// server.js - Node.js Server for bible.iam7.co.th
// Features: Auto Key Rotation, Robust Error Handling, Uses Gemini 2.5 Flash Preview
// Update: Added Cross-References rule to Summary section
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Note: Node.js v18+ มี fetch ในตัวแล้ว ไม่ต้อง import node-fetch

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. ระบบจัดการ API Keys แบบหมุนเวียน (Key Rotation) ---
const RAW_KEYS = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
const API_KEYS = RAW_KEYS ? RAW_KEYS.split(',').map(k => k.trim()).filter(k => k) : [];

if (API_KEYS.length === 0) {
    console.error("FATAL ERROR: No API Keys found! Check Plesk settings.");
} else {
    console.log(`System loaded ${API_KEYS.length} API Keys for rotation.`);
}

let currentKeyIndex = 0;
function getNextKey() {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return API_KEYS[currentKeyIndex];
}
function getCurrentKey() {
    return API_KEYS[currentKeyIndex];
}

// ใช้ Gemini 2.5 Flash Preview (รุ่นที่เสถียรสำหรับคุณ)
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

// --- 2. ตั้งค่า Cache ---
const CACHE_DIR = path.join(__dirname, 'bible_cache');
if (!fs.existsSync(CACHE_DIR)) {
    try { fs.mkdirSync(CACHE_DIR, { recursive: true }); } catch (e) {}
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile('ethiopianCanon.html', { root: path.join(__dirname, 'public') });
});

// --- 3. ฟังก์ชันกลางสำหรับเรียก Gemini (Engine หลัก) ---
async function fetchGemini(prompt, jsonType = 'object', retryCount = 0) {
    if (API_KEYS.length === 0) throw new Error("Server config error: No API Keys");

    const apiKey = getCurrentKey();
    const endpoint = `${BASE_URL}?key=${apiKey}`;

    console.log(`[AI] Requesting with Key #${currentKeyIndex + 1} (Attempt: ${retryCount + 1})`);

    try {
        const apiRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                // ปิด Safety Filter ทั้งหมด
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (apiRes.status === 429) {
            console.warn(`[AI] Key #${currentKeyIndex + 1} Hit Limit! Rotating...`);
            if (retryCount < API_KEYS.length) {
                getNextKey();
                return fetchGemini(prompt, jsonType, retryCount + 1);
            } else {
                throw new Error("All API keys are exhausted. Please try again later.");
            }
        }

        if (!apiRes.ok) {
            const errText = await apiRes.text();
            throw new Error(`Gemini Error (${apiRes.status}): ${errText}`);
        }

        const data = await apiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("AI returned empty response");

        // Clean JSON String
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let start = (jsonType === 'array') ? cleanJson.indexOf('[') : cleanJson.indexOf('{');
        let end = (jsonType === 'array') ? cleanJson.lastIndexOf(']') : cleanJson.lastIndexOf('}');

        if (start !== -1 && end !== -1) {
            cleanJson = cleanJson.substring(start, end + 1);
        }

        getNextKey(); // หมุนคีย์ทุกครั้งที่สำเร็จ
        return JSON.parse(cleanJson);

    } catch (e) {
        throw e;
    }
}

// --- Routes: ส่ง 200 OK เสมอ ---

app.post('/api/get-chapter', async (req, res) => {
    req.setTimeout(180000); // 3 นาที
    try {
        const { bookEn, chapter } = req.body;
        if (!bookEn || !chapter) throw new Error("Missing parameters");

        const safeBook = bookEn.replace(/[^a-z0-9]/gi, '_');
        const filename = `${safeBook}_${chapter}.json`;
        const filepath = path.join(CACHE_DIR, filename);

        if (fs.existsSync(filepath)) {
            const cachedData = fs.readFileSync(filepath, 'utf8');
            return res.json(JSON.parse(cachedData));
        }

        // *** Updated Prompt: เพิ่มกฎ Cross-References ในส่วน Summary ***
        const prompt = `
            Role: Expert Bible Translator & Professor of Ethiopian Studies.
            Task: Provide content for Book: "${bookEn}" (Ethiopian Canon), Chapter: ${chapter}.
            
            Requirements:
            1. Translation: Translate to Thai using the literary style of the **Thai New Contemporary Bible (TNCV)** by Biblica.
               
               - **STRUCTURE & HEADERS (STRICT)**:
                 - The translation MUST be divided into logical sections.
                 - **Every section MUST start with a Header Title**.
                 - **Even the very first verse MUST be preceded by a Header.**
                 - **HEADER STYLE**: Use exactly this HTML: 
                   <h3 class="text-xl font-bold text-indigo-900 mt-8 mb-4 pt-2 border-t border-slate-100">...Title...</h3>
                 - **HEADER CONTENT**: Plain text only. Do NOT apply special colors/bolding to Divine Names in headers.

               - **VERSE FORMAT**: Use HTML <p class="mb-3 leading-loose text-gray-800"> tags. Start every verse with <span class="verse-num font-bold text-amber-600 mr-2">X</span>.
               
               - **NO English in Text**: Do NOT include original English words in parentheses. Translate completely to Thai.
               
               - **Names Transliteration**: Transliterate names based on original Hebrew/Greek pronunciation.
               
               - **DIVINE NAMES RULES** (Apply inside verses ONLY):
                 1. "Yahweh"/"The LORD" -> <span class="font-bold text-amber-700 mx-1">พระยาห์วาห์</span>
                 2. "Jesus" -> <span class="font-bold text-amber-700 mx-1">พระเยซู</span>
                 3. "Christ" -> "พระเมสสิยาห์" (Normal text)

            2. Summary: Provide sidebar commentary in Thai HTML. 
               - **NO HEADER**: Do NOT generate a main title or header for the commentary. Start directly with the analysis paragraphs.
               - **CROSS-REFERENCES**: Include relevant scripture references (Cross-references) from other books of the Bible that connect contextually. Format as (ดู: [Book] [Chapter]:[Verse]).
               - **CRITICAL**: Add a distinct section titled "🔍 เจาะลึกรากศัพท์" (Word Study).
               - Select 2-7 key terms from this chapter in their original language (Hebrew, Aramaic, Greek, or Ge'ez).
               - **LAYOUT**: Ensure each word/term is displayed on its own separate line. Use HTML <br> tags or an unordered list <ul><li> to separate them clearly.
               - Format each word as: <b>Thai Word</b> (<i>Original Word</i>) - Definition/Nuance.
               - **STYLING**: Wrap this vocabulary section in a <div class="bg-white p-3 rounded-lg border border-slate-200 mt-4 shadow-sm text-sm">.
               - **FORMATTING RULE**: When referencing verses (e.g., "V. 16-20"), **ALWAYS translate "V." or "Verse" to "ข้อ."** (e.g., "พระบัญชาครั้งใหญ่ (ข้อ. 16-20)").
                 - **SECTION 2: Historical Insights**:
                 - Title: "🏛️ ข้อมูลเชิงลึกทางประวัติศาสตร์"
                 - Provide historical context.
                 - **STYLING**: Wrap this section in a <div class="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4 shadow-sm text-sm">.

            Output JSON format ONLY: { "translation": "HTML...", "summary": "HTML..." }
        `;

        const data = await fetchGemini(prompt, 'object');
        
        try { fs.writeFileSync(filepath, JSON.stringify(data), 'utf8'); } catch (e) {}
        res.json(data);

    } catch (error) {
        console.error("Chapter Error:", error.message);
        res.json({ error: error.message });
    }
});

app.post('/api/search-topic', async (req, res) => {
    req.setTimeout(60000);
    try {
        const { prompt } = req.body;
        if (!prompt) throw new Error("Missing prompt");

        const fullPrompt = `Act as expert. Topic: "${prompt}". Find 5-7 verses from Ethiopian Canon. Output JSON Array ONLY: [{"book_en": "...", "book_th": "...", "chapter_num": 1, "verse_num": 1, "text": "...", "context": "..."}]`;
        
        const data = await fetchGemini(fullPrompt, 'array');
        res.json(data);
    } catch (error) {
        console.error("Search Error:", error.message);
        res.json({ error: error.message });
    }
});

app.post('/api/get-verses', async (req, res) => {
    try {
        const data = await fetchGemini(req.body.prompt, 'object');
        res.json(data);
    } catch (error) {
        console.error("Verse Error:", error.message);
        res.json({ error: error.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;