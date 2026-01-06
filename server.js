// server.js - Node.js Server for bible.iam7.co.th
// Features: Auto Key Rotation, Robust Error Handling, Uses Gemini 2.5 Flash Preview
// Update: Added 'extractJson' helper to fix "Unexpected non-whitespace" error
// Update: Maintains all translation rules (TNCV, Divine Names, Layouts)
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { jsonrepair } = require('jsonrepair');
const { getCalendarData, convertDate } = require('./data/calendarData');
const app = express();
const PORT = process.env.PORT || 3000;

// --- NEW: Load Calendar Data (สำหรับ App 3) ---
const calendarData = require('./data/calendarData');



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

// ใช้ Gemini 2.5 Flash Preview
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

// --- NEW Helper: Smart JSON Extractor (แก้ปัญหา Error 394/316) ---
function extractJson(text) {
    // 1. หาจุดเริ่มของ JSON ({ หรือ [)
    const startObj = text.indexOf('{');
    const startArr = text.indexOf('[');
    
    let startIndex = -1;
    if (startObj !== -1 && startArr !== -1) {
        startIndex = Math.min(startObj, startArr); // เอาอันที่เจอก่อน
    } else if (startObj !== -1) {
        startIndex = startObj;
    } else if (startArr !== -1) {
        startIndex = startArr;
    }

    if (startIndex === -1) return null;

    // 2. นับวงเล็บเพื่อหาจุดจบที่ถูกต้อง (Stack Counting)
    let openBraces = 0; // {
    let openBrackets = 0; // [
    let inString = false;
    let isEscaped = false;
    let endIndex = -1;

    for (let i = startIndex; i < text.length; i++) {
        const char = text[i];

        if (isEscaped) { isEscaped = false; continue; }
        if (char === '\\') { isEscaped = true; continue; }
        if (char === '"') { inString = !inString; continue; }

        if (!inString) {
            if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
            else if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;

            // ถ้าวงเล็บปิดครบทุกคู่แล้ว นั่นคือจุดจบของ JSON
            if (openBraces === 0 && openBrackets === 0) {
                endIndex = i;
                break;
            }
        }
    }

    if (endIndex !== -1) {
        return text.substring(startIndex, endIndex + 1);
    }
    
    return null; // หาจุดจบไม่เจอ
}

// --- 3. ฟังก์ชันกลางสำหรับเรียก Gemini ---
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

        // *** ใช้ Smart Extractor แทนการตัดคำแบบเก่า ***
       const cleanJson = extractJson(text);

        if (!cleanJson) {
            console.error("AI Output Format Error (Raw):", text);
            throw new Error("Could not parse JSON from AI response.");
        }

        getNextKey(); 

        // --- เริ่มส่วนแก้ไข: ใช้ jsonrepair ซ่อมก่อน Parse ---
        try {
            const repairedJson = jsonrepair(cleanJson);
            return JSON.parse(repairedJson);
        } catch (err) {
            console.error("JSON Repair Failed:", err);
            // ถ้าซ่อมไม่ได้จริงๆ ให้ลอง Parse แบบเดิมเผื่อฟลุ๊ค หรือโยน Error ไปเลย
            return JSON.parse(cleanJson); 
        }

    } catch (e) {
        throw e;
    }
}

// --- Routes ---

// === NEW API Route for Moon Calendar ===
app.get('/api/calendar', (req, res) => {
    // รับค่า year จาก query string (เช่น ?year=2026) ถ้าไม่มีให้ใช้ 2025
    const year = req.query.year || '2025';
    
    // เรียกฟังก์ชันพร้อมส่งปีที่ต้องการไป
    const data = getCalendarData(year);
    
    res.json(data);
});
// =======================================


// เพิ่ม Route ใหม่: /api/convert
app.get('/api/convert', (req, res) => {
    try {
        const dateStr = req.query.date; // รับค่า ?date=2025-05-15
        if (!dateStr) {
            return res.status(400).json({ error: "Date parameter is required" });
        }

        const result = convertDate(dateStr);
        
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: "Date not found in supported range (2025-2036)" });
        }
    } catch (error) {
        console.error("Error converting date:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/get-chapter', async (req, res) => {
    req.setTimeout(180000); 
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

  const prompt = `
            Role: Expert Bible Translator (KJV / Thai 1971 Style) & Professor of Ancient Near Eastern/Biblical Studies.
            Task: Provide content for Book: "${bookEn}" (Ethiopian Canon), Chapter: ${chapter}.
            
            Requirements:
            1. Translation: Translate the given chapter content to Thai.
               - **TRANSLATION STYLE**: Use the literary style, tone, and vocabulary of the **Thai New Contemporary Bible (KJV / Thai 1971)** by Biblica.
               
               - **STRUCTURE & HEADERS (STRICTLY ENFORCED)**:
                 - The translation MUST be divided into logical, context-driven sections.
                 - **Every section MUST begin with a Header Title**.
                 - **The very first verse of the chapter MUST be preceded by a Header.**
                 - **HEADER HTML STYLE (MANDATORY & EXACT)**: Use exactly this HTML: 
                   <h3 class="text-xl font-bold text-indigo-900 mt-8 mb-4 pt-2 border-t border-slate-100">...Title in Thai...</h3>
                 - **HEADER CONTENT**: Must be plain text in Thai only. **CRITICAL**: Do NOT apply special colors, spans, or bolding (including Divine Names) within the header text. Keep the header text clean and consistent in color/style.

               - **VERSE FORMAT (EXACT)**: 
                 - Every verse block MUST be wrapped in HTML: <p class="mb-3 leading-loose text-gray-800">.
                 - Every verse MUST start with the verse number span (EXACT): <span class="verse-num font-bold text-amber-600 mr-2">X</span> (where X is the verse number).
               
               - **NO ENGLISH RULE**: Do NOT include original English or Greek/Hebrew words in parentheses or as part of the main text. Translate completely to Thai.
               
               - **NAMES TRANSLITERATION**: Transliterate names (people, places) into Thai based on common Thai Bible standards, prioritizing original Hebrew/Greek pronunciation where applicable.
               
               - **DIVINE NAMES RULES (MANDATORY & EXACT)**:
                 1. For "Yahweh", "The LORD" (YHWH) -> Must translate EXACTLY as:
                    <span class="font-bold text-amber-700 mx-1">พระเยโฮวาห์</span>
                 2. For "Jesus" (Yeshua) -> Must translate EXACTLY as:
                    <span class="font-bold text-amber-700 mx-1">พระเยซู</span>
                 3. For "Holy Spirit" or "The Spirit" -> Must translate EXACTLY as:
                    <span class="font-bold text-amber-700 mx-1">พระวิญญาณบริสุทธิ์</span>
                 4. For "Christ" or "Messiah" -> Must translate EXACTLY as:
                    "พระเมสสิยาห์" (Use normal text, NO special span/styling).
                 5. For "God" (Elohim/Theos) -> Use the standard Thai translation "พระเจ้า" (Use normal text, NO special span/styling).
               

            2. Summary: Provide comprehensive, scholarly sidebar commentary in Thai HTML. 
               - **NO HEADER**: Do NOT generate a main title or primary header for the commentary block itself. 
               - **NO ENGLISH RULE**: Do NOT include original English words/phrases in parentheses in the main scholarly text.
               - **VERSE REFERENCE FORMATTING (STRICTLY THAI)**: When referring to verses within the commentary (e.g., "V. 16-20" or "Verse 16-20"), **MUST translate to Thai using the EXACT format: "(ข้อ 16-20)". NEVER use "V." or "Verse" in the output.** (Example: "การตีความ (ข้อ 16-20)").

               - **CROSS-REFERENCES (INTERACTIVE LINKS) INTEGRATION**: 
                 - **INCLUSION**: Include relevant scripture references (Cross-references) from other books of the Bible that connect contextually. **These MUST be naturally embedded within the scholarly overview and historical insights text.**
                 - **FORMATTING (EXACT)**: The reference itself must be formatted as (📖 ThaiBookName Chapter:Verse).
                 - **INTERACTIVE LINK RULE (MANDATORY)**: When citing other scriptures, **MUST generate a clickable HTML link** that calls the JavaScript function 'openChapterFromSearch'.
                 - **LINK HTML (EXACT)**: 
                   <a href="#" onclick="openChapterFromSearch('EnglishBookName', ChapterNumber); return false;" class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium cursor-pointer" title="คลิกเพื่ออ่าน">(📖 ThaiBookName Chapter:Verse)</a>
            
               - **SECTION A: SCHOLARLY OVERVIEW (MANDATORY FIRST)**:
                 - **Start the Summary immediately with 1-2 paragraphs of academic analysis/overview** of the chapter's main themes, theological significance, and narrative purpose. **The entire overview and analysis MUST be written in Thai.**
               
               - **SECTION B: Detailed Analysis Components (Following the Overview)**:

                 - **B.1: Word Study (CRITICAL)**: 
                   - Title (EXACT): "<h4>🔍 เจาะลึกรากศัพท์</h4>"
                   - Select 1-4 most theologically or historically significant terms from this chapter (Hebrew, Aramaic, or Greek).
                   - **LAYOUT**: Ensure each word/term is displayed on a separate line. Use HTML <br> and <b> tags or an unordered list <ul><li> to separate them clearly.
                   - **FORMAT (MANDATORY ENHANCEMENT)**: **Thai Word** (<i>Original Script/Transliteration</i>) - Definition/Nuance in Thai.
                     - **The Original Script (Hebrew, Aramaic, or Greek) AND the English Transliteration MUST be included for every term.**
                     - Example: <b>ความเชื่อ</b> (Ελληνική: πίστις / Pístis) - ความไว้วางใจในพระเจ้า...
                   - **STYLING (EXACT)**: Wrap this entire section in a:
                     <div class="bg-white p-3 rounded-lg border border-slate-200 mt-4 shadow-sm text-sm">...</div>
                 
                 - **B.2: Historical Insights**:
                   - Title (EXACT): "<h4>🏛️ ข้อมูลเชิงลึกทางประวัติศาสตร์</h4>"
                   - Provide relevant historical, geographical, or cultural context to aid understanding. **The entire historical insight section MUST be written in Thai.**
                   - **STYLING (EXACT)**: Wrap this entire section in a:
                     <div class="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4 shadow-sm text-sm">...</div>

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

        const fullPrompt = `
            Act as an expert Bible Scholar. Topic: "${prompt}". 
            **NOTE: The Topic above may be in Thai or English. Search for verses using the Thai context.**
            Find 5-7 highly relevant verses from the Ethiopian Biblical Canon that address the topic.
            
            Requirements:
            - **Language**: ALL content and explanations in the final output MUST be rendered in **THAI**.
            - **Verse Content**: The verse text must be translated into **Thai (TNCV or standard contemporary style)**.
            - **Context**: Explain briefly but clearly in **THAI** why this specific verse fits the topic.
            - **Divine Names**: Use the mandatory Thai transliterations: **"พระยาห์เวห์"** and **"พระเยซู"** where appropriate in the verse text and context explanation.

            Output JSON Array ONLY: 
            [
                {
                    "book_en": "Book Name (English)", 
                    "book_th": "ชื่อหนังสือ (ไทย)", 
                    "chapter_num": 1, 
                    "verse_num": 1, 
                    "text": "เนื้อหาพระคัมภีร์ที่แปลเป็นภาษาไทยอย่างสมบูรณ์", 
                    "context": "คำอธิบายบริบท (ภาษาไทยเท่านั้น)"
                }
            ]
        `;
        
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

// ... (โค้ด Route อื่นๆ)

// 4. Generate Lesson Plan (*** ตรวจสอบว่ามีส่วนนี้ไหม ***)
app.post('/api/generate-lesson', async (req, res) => {
    req.setTimeout(120000); 
    try {
        const { topic, platform, duration } = req.body;
        if (!topic) throw new Error("Missing topic");

        const prompt = `
            Act as a Creative Bible Teacher and Scholar.
            Task: Create a Lesson Plan based on the **Ethiopian Biblical Canon**.
            Topic: "${topic}"
            Format: ${platform} (${duration})

            Requirements:
            1. Language: **THAI** (Use "พระเยโฮวาห์", "พระเยซู").
            2. Content:
               - Title (Catchy)
               - Hook (Opening)
               - Key Scripture (Thai translation from Ethiopian Canon)
               - Word Study (1-2 terms, Hebrew/Greek roots, Thai explanation)
               - Main Teaching (Theology + 1-2 Analogies/Stories)
               - Application (Practical steps)
               - Prayer
            3. YouTube: Suggest 2 specific **English** search queries for relevant videos.

            Output JSON ONLY:
            {
                "title": "String",
                "contentHtml": "HTML string using Tailwind classes (e.g. bg-amber-50, text-indigo-900). Use emojis.",
                "youtubeQueries": ["Query 1 (Eng)", "Query 2 (Eng)"]
            }
        `;

        const data = await fetchGemini(prompt, 'object');
        res.json(data);

    } catch (error) {
        console.error("Lesson Error:", error.message);
        res.status(500).json({ error: true, message: error.message || "Failed to generate lesson." });
        
    }
});


// --- 5. API ใหม่: ตรวจสอบว่ามี Cache บทไหนบ้าง ---
app.get('/api/check-cache-status', (req, res) => {
    try {
        const { bookEn } = req.query;
        if (!bookEn) return res.json([]);

        // แปลงชื่อหนังสือให้ตรงกับรูปแบบชื่อไฟล์ (เหมือนตอน Save)
        const safeBook = bookEn.trim().replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        
        // อ่านไฟล์ทั้งหมดในโฟลเดอร์ Cache
        fs.readdir(CACHE_DIR, (err, files) => {
            if (err) {
                console.error(err);
                return res.json([]);
            }

            // กรองหาไฟล์ที่ขึ้นต้นด้วยชื่อหนังสือ (เช่น "Genesis_")
            // รูปแบบไฟล์คือ Name_Chapter.json
            const cachedChapters = files
                .filter(file => file.startsWith(`${safeBook}_`) && file.endsWith('.json'))
                .map(file => {
                    // แกะเอาตัวเลขบทออกมา
                    const parts = file.replace('.json', '').split('_');
                    return parseInt(parts[parts.length - 1]);
                });

            res.json(cachedChapters);
        });
    } catch (e) {
        console.error(e);
        res.json([]);
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;