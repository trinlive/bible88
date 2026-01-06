app.post('/api/search-topic', async (req, res) => {
    req.setTimeout(60000);
    try {
        const { prompt } = req.body;
        if (!prompt) throw new Error("Missing prompt");

       // *** Updated Search Prompt: บังคับภาษาไทยในบริบท ***
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