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
            Role: Expert Bible Translator (TNCV Style) & Professor of Ancient Near Eastern/Biblical Studies.
            Task: Provide content for Book: "${bookEn}" (Ethiopian Canon), Chapter: ${chapter}.
            
            Requirements:
            1. Translation: Translate the given chapter content to Thai.
               - **TRANSLATION STYLE**: Use the literary style, tone, and vocabulary of the **Thai New Contemporary Bible (TNCV)** by Biblica.
               
               - **STRUCTURE & HEADERS (STRICT)**:
                 - The translation MUST be divided into logical, context-driven sections.
                 - **Every section MUST begin with a Header Title**.
                 - **The very first verse of the chapter MUST be preceded by a Header.**
                 - **HEADER HTML STYLE (EXACT)**: Use exactly this HTML: 
                   <h3 class="text-xl font-bold text-indigo-900 mt-8 mb-4 pt-2 border-t border-slate-100">...Title in Thai...</h3>
                 - **HEADER CONTENT**: Must be plain text in Thai only. Do NOT apply special colors, spans, or bolding to Divine Names/Titles within the header text.

               - **VERSE FORMAT (EXACT)**: 
                 - Every verse block MUST be wrapped in HTML: <p class="mb-3 leading-loose text-gray-800">.
                 - Every verse MUST start with the verse number span (EXACT): <span class="verse-num font-bold text-amber-600 mr-2">X</span> (where X is the verse number).
               
               - **NO ENGLISH RULE**: Do NOT include original English or Greek/Hebrew words in parentheses or as part of the main text. Translate completely to Thai.
               
               - **NAMES TRANSLITERATION**: Transliterate names (people, places) into Thai based on common Thai Bible standards, prioritizing original Hebrew/Greek pronunciation where applicable.
               
               - **DIVINE NAMES RULES (MANDATORY & EXACT)**:
                 1. For "Yahweh", "The LORD" (YHWH) -> Must translate EXACTLY as:
                    <span class="font-bold text-amber-700 mx-1">พระยาห์โฮวาห์</span>
                 2. For "Jesus" (Yeshua) -> Must translate EXACTLY as:
                    <span class="font-bold text-amber-700 mx-1">พระเยซู</span>
                 3. For "Christ" or "Messiah" -> Must translate EXACTLY as:
                    "พระเมสสิยาห์" (Use normal text, NO special span/styling).
                 4. For "God" (Elohim/Theos) -> Use the standard Thai translation "พระเจ้า" (Use normal text, NO special span/styling).

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
                   - Title (EXACT): "🔍 เจาะลึกรากศัพท์"
                   - Select 1-3 most theologically or historically significant terms from this chapter (Hebrew, Aramaic, or Greek).
                   - **LAYOUT**: Ensure each word/term is displayed on a separate line. Use HTML <br> tags or an unordered list <ul><li> to separate them clearly.
                   - **FORMAT (MANDATORY ENHANCEMENT)**: **Thai Word** (<i>Original Script/Transliteration</i>) - Definition/Nuance in Thai.
                     - **The Original Script (Hebrew, Aramaic, or Greek) AND the English Transliteration MUST be included for every term.**
                     - Example: <b>ความเชื่อ</b> (Ελληνική: πίστις / Pístis) - ความไว้วางใจในพระเจ้า...
                   - **STYLING (EXACT)**: Wrap this entire section in a:
                     <div class="bg-white p-3 rounded-lg border border-slate-200 mt-4 shadow-sm text-sm">...</div>
                 
                 - **B.2: Historical Insights**:
                   - Title (EXACT): "🏛️ ข้อมูลเชิงลึกทางประวัติศาสตร์"
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
