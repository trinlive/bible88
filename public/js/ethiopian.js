/* public/js/ethiopian.js */
// Update: Support URL Parameters & Thai Book Search

// Data (Ethiopian Biblical Canon) - ข้อมูลเดิม
const ethiopianCanon = [
    { category: "หนังสือธรรมบัญญัติ (Orit)", books: [ { en: "Genesis", th: "ปฐมกาล", ch: 50 }, { en: "Exodus", th: "อพยพ", ch: 40 }, { en: "Leviticus", th: "เลวีนิติ", ch: 27 }, { en: "Numbers", th: "กันดารวิถี", ch: 36 }, { en: "Deuteronomy", th: "เฉลยธรรมบัญญัติ", ch: 34 } ] },
    { category: "ประวัติศาสตร์และพันธสัญญา", books: [ { en: "Joshua", th: "โยชูวา", ch: 24 }, { en: "Judges", th: "ผู้วินิจฉัย", ch: 21 }, { en: "Ruth", th: "นางรูธ", ch: 4 }, { en: "1 Samuel", th: "1 ซามูเอล", ch: 31 }, { en: "2 Samuel", th: "2 ซามูเอล", ch: 24 }, { en: "1 Kings", th: "1 พงศ์กษัตริย์", ch: 22 }, { en: "2 Kings", th: "2 พงศ์กษัตริย์", ch: 25 }, { en: "1 Chronicles", th: "1 พงศาวดาร", ch: 29 }, { en: "2 Chronicles", th: "2 พงศาวดาร", ch: 36 }, { en: "Ezra", th: "เอสรา", ch: 10 }, { en: "Nehemiah", th: "เนหะมีย์", ch: 13 }, { en: "Tobit", th: "โทบิต", ch: 14, tag: "Deuterocanon" }, { en: "Judith", th: "ยูดิธ", ch: 16, tag: "Deuterocanon" }, { en: "Esther", th: "เอสเธอร์", ch: 10 }, { en: "1 Maccabees", th: "1 มัคคาบี", ch: 16, tag: "Deuterocanon" }, { en: "2 Maccabees", th: "2 มัคคาบี", ch: 15, tag: "Deuterocanon" }, { en: "Jubilees", th: "หนังสือยูบิลี", ch: 50, tag: "Ethiopian Only" }, { en: "Enoch", th: "หนังสือเอโนค", ch: 108, tag: "Ethiopian Only" } ] },
    { category: "ปรีชาญาณและบทเพลง", books: [ { en: "Job", th: "โยบ", ch: 42 }, { en: "Psalms", th: "สดุดี", ch: 150 }, { en: "Proverbs", th: "สุภาษิต", ch: 31 }, { en: "Tegstsats", th: "คำตักเตือน", ch: 1, tag: "Ethiopian Only" }, { en: "Wisdom of Solomon", th: "ปรีชาญาณโซโลมอน", ch: 19, tag: "Deuterocanon" }, { en: "Ecclesiastes", th: "ปัญญาจารย์", ch: 12 }, { en: "Song of Solomon", th: "เพลงซาโลมอน", ch: 8 }, { en: "Sirach", th: "บุตรสิรา", ch: 51, tag: "Deuterocanon" } ] },
    { category: "ผู้เผยพระวจนะ", books: [ { en: "Isaiah", th: "อิสยาห์", ch: 66 }, { en: "Jeremiah", th: "เยเรมีย์", ch: 52 }, { en: "Lamentations", th: "เพลงคร่ำครวญ", ch: 5 }, { en: "Ezekiel", th: "เอเสเคียล", ch: 48 }, { en: "Daniel", th: "ดาเนียล", ch: 12 }, { en: "Hosea", th: "โฮเชยา", ch: 14 }, { en: "Joel", th: "โยเอล", ch: 3 }, { en: "Amos", th: "อาโมส", ch: 9 }, { en: "Obadiah", th: "โอบาดีห์", ch: 1 }, { en: "Jonah", th: "โยนาห์", ch: 4 }, { en: "Micah", th: "มีคาห์", ch: 7 }, { en: "Nahum", th: "นาฮูม", ch: 3 }, { en: "Habakkuk", th: "ฮาบากุก", ch: 3 }, { en: "Zephaniah", th: "เศฟันยาห์", ch: 3 }, { en: "Haggai", th: "ฮักกัย", ch: 2 }, { en: "Zechariah", th: "เศคาริยาห์", ch: 14 }, { en: "Malachi", th: "มาลาคี", ch: 4 }, { en: "Baruch", th: "บารุค", ch: 5, tag: "Deuterocanon" }, { en: "4 Baruch", th: "4 บารุค", ch: 9, tag: "Ethiopian Only" } ] },
    { category: "หนังสือพิเศษ", books: [ { en: "1 Meqabyan", th: "1 เมคาเบียน", ch: 36, tag: "Ethiopian Only" }, { en: "2 Meqabyan", th: "2 เมคาเบียน", ch: 23, tag: "Ethiopian Only" }, { en: "3 Meqabyan", th: "3 เมคาเบียน", ch: 10, tag: "Ethiopian Only" } ] },
    { category: "พันธสัญญาใหม่", books: [ { en: "Matthew", th: "มัทธิว", ch: 28 }, { en: "Mark", th: "มาระโก", ch: 16 }, { en: "Luke", th: "ลูกา", ch: 24 }, { en: "John", th: "ยอห์น", ch: 21 }, { en: "Acts", th: "กิจการ", ch: 28 }, { en: "Romans", th: "โรม", ch: 16 }, { en: "1 Corinthians", th: "1 โครินธ์", ch: 16 }, { en: "2 Corinthians", th: "2 โครินธ์", ch: 13 }, { en: "Galatians", th: "กาลาเทีย", ch: 6 }, { en: "Ephesians", th: "เอเฟซัส", ch: 6 }, { en: "Philippians", th: "ฟิลิปปี", ch: 4 }, { en: "Colossians", th: "โคโลสี", ch: 4 }, { en: "1 Thessalonians", th: "1 เธสะโลนิกา", ch: 5 }, { en: "2 Thessalonians", th: "2 เธสะโลนิกา", ch: 3 }, { en: "1 Timothy", th: "1 ทิโมธี", ch: 6 }, { en: "2 Timothy", th: "2 ทิโมธี", ch: 4 }, { en: "Titus", th: "ทิตัส", ch: 3 }, { en: "Philemon", th: "ฟีเลโมน", ch: 1 }, { en: "Hebrews", th: "ฮีบรู", ch: 13 }, { en: "James", th: "ยากอบ", ch: 5 }, { en: "1 Peter", th: "1 เปโตร", ch: 5 }, { en: "2 Peter", th: "2 เปโตร", ch: 3 }, { en: "1 John", th: "1 ยอห์น", ch: 5 }, { en: "2 John", th: "2 ยอห์น", ch: 1 }, { en: "3 John", th: "3 ยอห์น", ch: 1 }, { en: "Jude", th: "ยูดา", ch: 1 }, { en: "Revelation", th: "วิวรณ์", ch: 22 } ] },
    { category: "หนังสือระเบียบวินัย", books: [ { en: "Sirate Tsion", th: "ระเบียบแห่งศิโยน", ch: 1, tag: "Ethiopian Only" }, { en: "Tizaz", th: "พระบัญชา", ch: 1, tag: "Ethiopian Only" }, { en: "Gitsiw", th: "กิตซิว", ch: 1, tag: "Ethiopian Only" }, { en: "Abtilis", th: "อับติลิส", ch: 1, tag: "Ethiopian Only" }, { en: "1 Book of the Covenant", th: "หนังสือพันธสัญญา I", ch: 60, tag: "Ethiopian Only" }, { en: "2 Book of the Covenant", th: "หนังสือพันธสัญญา II", ch: 1, tag: "Ethiopian Only" }, { en: "Epistles of Clement", th: "จดหมายของเคลเมนต์", ch: 1, tag: "Ethiopian Only" }, { en: "Didascalia", th: "ดิดาสคาเลีย", ch: 43, tag: "Ethiopian Only" } ] }
];

const contentCache = { translation: {}, summary: {} };
let currentBook = null;
let currentChapter = 1;
let fontSize = 100;
let bookmarks = [];
let savedLessons = [];
let currentGeneratedLesson = null;
let navHistory = [];
// User ID Management
let userId = localStorage.getItem('ethiopian_user_id');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('ethiopian_user_id', userId);
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    renderSidebar();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    const ph = document.getElementById('searchPlaceholder');
    if(ph) ph.classList.remove('hidden');
    
    // ✅ ตรวจสอบ URL Parameters เพื่อเปิดหนังสืออัตโนมัติ
    const urlParams = new URLSearchParams(window.location.search);
    const paramBook = urlParams.get('book');
    const paramChapter = urlParams.get('chapter');

    if (paramBook) {
        // รอสักครู่เพื่อให้ Sidebar Render เสร็จ
        setTimeout(() => {
            openChapterFromSearch(paramBook, parseInt(paramChapter) || 1);
        }, 300);
    } else {
        // ถ้าไม่มี Param ค่อยโหลด Verse of Day
        loadVerseOfDay();
    }

    loadDataFromServer();
});

// *** Helper: Fetch with Timeout ***
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 60000 } = options; 
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') throw new Error("หมดเวลาเชื่อมต่อ (Timeout) - กรุณาลองใหม่");
        throw error;
    }
}

// --- Sync Functions (Code เดิม) ---
async function syncDataToServer(type, data) {
    try {
        await fetch('/api/sync-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, type, content: data })
        });
        console.log(`Synced ${type} to server`);
    } catch (e) {
        console.error('Sync failed', e);
    }
}

async function loadDataFromServer() {
    try {
        const bmRes = await fetch(`/api/get-data?userId=${userId}&type=bookmarks`);
        const bmData = await bmRes.json();
        if (bmData) {
            bookmarks = bmData;
            localStorage.setItem('ethiopian_bookmarks', JSON.stringify(bookmarks));
            updateBookmarksList();
        } else {
             bookmarks = JSON.parse(localStorage.getItem('ethiopian_bookmarks')) || [];
             updateBookmarksList();
        }

        const lsRes = await fetch(`/api/get-data?userId=${userId}&type=lessons`);
        const lsData = await lsRes.json();
        if (lsData) {
            savedLessons = lsData;
            localStorage.setItem('ethiopian_lessons', JSON.stringify(savedLessons));
            updateSavedLessonsList();
        } else {
            savedLessons = JSON.parse(localStorage.getItem('ethiopian_lessons')) || [];
            updateSavedLessonsList();
        }
    } catch (e) {
        console.error('Load data failed', e);
        bookmarks = JSON.parse(localStorage.getItem('ethiopian_bookmarks')) || [];
        updateBookmarksList();
        savedLessons = JSON.parse(localStorage.getItem('ethiopian_lessons')) || [];
        updateSavedLessonsList();
    }
}

// --- Navigation & UI (Code เดิม) ---
function goHome() { 
    navHistory = []; 
    updateHistoryUI();
    hideAllViews(); 
    document.getElementById('welcomeScreen').classList.remove('hidden'); 
    window.history.pushState({}, document.title, window.location.pathname); // ล้าง URL Param
}
function goToLessonPlanner() {
    hideAllViews();
    document.getElementById('lessonPlannerView').classList.remove('hidden');
    updateSavedLessonsList();
}
function goToTopicSearch() { 
    hideAllViews(); 
    document.getElementById('topicSearchView').classList.remove('hidden'); 
    document.getElementById('topicInput').focus(); 
}
function hideAllViews() {
    ['welcomeScreen','chapterSelectionView','readingView','topicSearchView','lessonPlannerView'].forEach(id => document.getElementById(id).classList.add('hidden'));
}
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// --- Settings (Code เดิม) ---
function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('hidden'); }
function loadSettings() {
    const saved = JSON.parse(localStorage.getItem('ethiopian_settings'));
    if (saved) {
        if (saved.theme) setTheme(saved.theme, false);
        if (saved.fontSize) { fontSize = saved.fontSize; updateFontSizeUI(); }
    }
}
function saveSettings(updates) {
    const current = JSON.parse(localStorage.getItem('ethiopian_settings')) || {};
    localStorage.setItem('ethiopian_settings', JSON.stringify({ ...current, ...updates }));
}
function changeFontSize(delta) {
    fontSize = Math.max(80, Math.min(200, fontSize + (delta * 10)));
    updateFontSizeUI();
    saveSettings({ fontSize: fontSize });
}
function updateFontSizeUI() {
    document.getElementById('fontSizeLabel').innerText = fontSize + '%';
    const textContent = document.getElementById('textContent');
    const summaryContent = document.getElementById('summaryContent');
    if (textContent) { textContent.style.fontSize = (1.125 * fontSize / 100) + 'rem'; textContent.style.lineHeight = '1.8'; }
    if (summaryContent) { summaryContent.style.fontSize = (0.875 * fontSize / 100) + 'rem'; }
}
function setTheme(theme, save = true) {
    document.body.className = `h-screen flex flex-col overflow-hidden theme-${theme} font-sarabun`;
    if (save) saveSettings({ theme: theme });
}

// --- Book Listing & Selection (Code เดิม) ---
function renderSidebar() {
    const container = document.getElementById('bookListContainer');
    container.innerHTML = '';
    ethiopianCanon.forEach(cat => {
        const catHeader = document.createElement('div');
        catHeader.className = "px-3 py-2 mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-sarabun";
        catHeader.innerText = cat.category;
        container.appendChild(catHeader);
        cat.books.forEach(book => {
            const btn = document.createElement('button');
            btn.className = "book-card w-full text-left px-4 py-3 mb-1 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex justify-between items-center group font-sarabun";
            btn.onclick = () => selectBook(book);
            let badge = "";
            if(book.tag === "Ethiopian Only") badge = `<span class="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">Exclusive</span>`;
            else if(book.tag === "Deuterocanon") badge = `<span class="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">Deuterocanon</span>`;
            btn.innerHTML = `<span class="font-medium">${book.th}</span>${badge}`;
            container.appendChild(btn);
        });
    });
}

async function selectBook(book) {
    currentBook = book;
    hideAllViews();
    document.getElementById('chapterSelectionView').classList.remove('hidden');
    document.getElementById('gridBookTitle').innerText = book.th;
    document.getElementById('gridBookCategory').innerText = book.en;
    
    if(window.innerWidth < 768) { 
        const sidebar = document.getElementById('sidebar'); 
        if (!sidebar.classList.contains('-translate-x-full')) toggleSidebar(); 
    }

    const grid = document.getElementById('chapterGrid');
    grid.innerHTML = '<div class="col-span-full text-center text-slate-400 py-10"><i data-lucide="loader" class="w-8 h-8 animate-spin mx-auto mb-2"></i><p>กำลังตรวจสอบข้อมูล...</p></div>';
    lucide.createIcons();

    try {
        const response = await fetch(`/api/check-cache-status?bookEn=${encodeURIComponent(book.en)}`);
        const cachedChapters = await response.json(); 
        renderChapterGrid(book, cachedChapters);
    } catch (e) {
        console.error("Check cache failed", e);
        renderChapterGrid(book, []);
    }
}

function renderChapterGrid(book, cachedList = []) {
    const grid = document.getElementById('chapterGrid');
    grid.innerHTML = '';
    
    for(let i=1; i<=book.ch; i++) {
        const btn = document.createElement('button');
        const isCached = cachedList.includes(i);
        let btnClass = "chapter-btn border rounded-lg p-3 text-sm font-bold shadow-sm flex flex-col items-center justify-center h-14 w-full font-sarabun transition-all relative overflow-hidden";
        
        if (isCached) {
            btnClass += " bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:shadow-md";
            btn.innerHTML = `<span class="text-lg">${i}</span><span class="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>`;
        } else {
            btnClass += " bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-400";
            btn.innerText = i;
        }

        btn.className = btnClass;
        btn.onclick = () => loadChapter(i);
        grid.appendChild(btn);
    }
}

// --- Reading & Content (Code เดิม) ---
function loadChapter(chapNum) {
    currentChapter = chapNum;
    hideAllViews();
    document.getElementById('readingView').classList.remove('hidden');
    document.getElementById('bookTitleDisplay').innerText = currentBook.th;
    document.getElementById('bookCategoryLabel').innerText = currentBook.en;
    document.getElementById('currentChapterNum').innerText = currentChapter;
    fetchContent();
}
function backToChapters() { if(currentBook) selectBook(currentBook); }
function changeChapter(delta) {
    if (!currentBook) return;
    const newChap = currentChapter + delta;
    if (newChap < 1 || newChap > currentBook.ch) return;
    currentChapter = newChap;
    document.getElementById('currentChapterNum').innerText = currentChapter;
    fetchContent();
}

async function fetchContent() {
    document.getElementById('readerArea').scrollTo({ top: 0, behavior: 'smooth' });
    const contentDiv = document.getElementById('textContent');
    const summaryDiv = document.getElementById('summaryContent');
    document.getElementById('prevChapBtn').disabled = currentChapter <= 1;
    document.getElementById('nextChapBtn').disabled = currentChapter >= currentBook.ch;

    contentDiv.innerHTML = `<div class="space-y-6 p-4 animate-pulse"><div class="h-4 bg-slate-200 rounded w-full"></div><div class="h-4 bg-slate-200 rounded w-11/12"></div><div class="h-4 bg-slate-200 rounded w-full"></div></div><div class="text-center text-slate-400 text-sm mt-4 italic">กำลังประมวลผลเนื้อหา...</div>`;
    summaryDiv.innerHTML = `<div class="space-y-4 p-4 animate-pulse"><div class="h-3 bg-indigo-200 rounded w-3/4"></div><div class="h-3 bg-indigo-200 rounded w-full"></div></div>`;

    try {
        const response = await fetchWithTimeout('/api/get-chapter', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookEn: currentBook.en, chapter: currentChapter }),
                timeout: 180000 
        });
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        const data = await response.json();
        contentDiv.innerHTML = data.translation;
        summaryDiv.innerHTML = data.summary;
        updateFontSizeUI();
    } catch (e) {
        console.error("Error fetching chapter:", e);
        contentDiv.innerHTML = `<div class="text-red-500 p-6 text-center border border-red-200 rounded-lg bg-red-50"><h3 class="font-bold text-lg mb-2">เกิดข้อผิดพลาด</h3><p class="text-sm mb-4">${e.message}</p><button onclick="fetchContent()" class="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition">ลองใหม่อีกครั้ง</button></div>`;
        summaryDiv.innerHTML = '';
    }
}

// --- Bookmarks (Code เดิม) ---
function toggleBookmarks() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('-translate-x-full')) toggleSidebar();
    switchSidebarTab('bookmarks');
}
function switchSidebarTab(tabName) {
    const booksView = document.getElementById('sidebarBooksView');
    const bookmarksView = document.getElementById('sidebarBookmarksView');
    const tabBooks = document.getElementById('tabBooks');
    const tabBookmarks = document.getElementById('tabBookmarks');
    if (tabName === 'books') {
        booksView.classList.remove('hidden'); booksView.classList.add('flex');
        bookmarksView.classList.add('hidden'); bookmarksView.classList.remove('flex');
        tabBooks.className = "flex-1 py-3 text-center text-sm font-bold border-b-2 border-amber-500 text-amber-600 bg-slate-50";
        tabBookmarks.className = "flex-1 py-3 text-center text-sm font-bold text-slate-500 hover:text-slate-700";
    } else {
        booksView.classList.add('hidden'); booksView.classList.remove('flex');
        bookmarksView.classList.remove('hidden'); bookmarksView.classList.add('flex');
        tabBookmarks.className = "flex-1 py-3 text-center text-sm font-bold border-b-2 border-amber-500 text-amber-600 bg-slate-50";
        tabBooks.className = "flex-1 py-3 text-center text-sm font-bold text-slate-500 hover:text-slate-700";
        updateBookmarksList();
    }
}
function saveBookmark() {
    if (!currentBook) return;
    const newBookmark = { bookEn: currentBook.en, bookTh: currentBook.th, chapter: currentChapter, timestamp: new Date().getTime() };
    bookmarks = bookmarks.filter(b => !(b.bookEn === newBookmark.bookEn && b.chapter === newBookmark.chapter));
    bookmarks.unshift(newBookmark);
    localStorage.setItem('ethiopian_bookmarks', JSON.stringify(bookmarks));
    syncDataToServer('bookmarks', bookmarks);
    const btn = document.getElementById('saveBookmarkBtn');
    const originalIcon = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="check" class="w-6 h-6 text-green-500"></i>`;
    lucide.createIcons();
    setTimeout(() => { btn.innerHTML = originalIcon; lucide.createIcons(); }, 1500);
    updateBookmarksList();
}
function updateBookmarksList() {
    const container = document.getElementById('bookmarksContainer');
    container.innerHTML = ''; 
    if (bookmarks.length === 0) {
        container.innerHTML = '<div class="text-center p-8 text-slate-400 text-sm">ยังไม่มีที่คั่นหน้า</div>';
        return;
    }
    bookmarks.forEach(bm => {
        const item = document.createElement('div');
        item.className = "bg-white p-3 rounded-lg border border-slate-100 shadow-sm cursor-pointer hover:bg-amber-50 group flex justify-between items-center transition-all";
        const contentDiv = document.createElement('div');
        contentDiv.className = "flex-1";
        contentDiv.onclick = function() { openBookmark(bm.bookEn, bm.chapter); };
        contentDiv.innerHTML = `<div class="font-bold text-slate-700 text-sm">${bm.bookTh}</div><div class="text-xs text-slate-500">บทที่ ${bm.chapter}</div>`;
        const delBtn = document.createElement('button');
        delBtn.className = "text-slate-300 hover:text-red-400 p-1";
        delBtn.innerHTML = `<i data-lucide="trash-2" class="w-4 h-4"></i>`;
        delBtn.onclick = function(e) { e.stopPropagation(); removeBookmark(bm.timestamp); };
        item.appendChild(contentDiv); item.appendChild(delBtn); container.appendChild(item);
    });
    lucide.createIcons();
}
function openBookmark(bookEn, chapter) { openChapterFromSearch(bookEn, chapter); if(window.innerWidth < 768) toggleSidebar(); }
function removeBookmark(timestamp) { 
    bookmarks = bookmarks.filter(b => b.timestamp !== timestamp); 
    localStorage.setItem('ethiopian_bookmarks', JSON.stringify(bookmarks)); 
    syncDataToServer('bookmarks', bookmarks);
    updateBookmarksList(); 
}

// --- Topic Search (Update: Improve openChapterFromSearch) ---
async function performTopicSearch() {
    const input = document.getElementById('topicInput');
    const resultsDiv = document.getElementById('searchResults');
    const query = input.value.trim();
    if (!query) return;

    document.getElementById('searchPlaceholder').classList.add('hidden');
    resultsDiv.innerHTML = `<div class="space-y-4 animate-pulse"><div class="h-24 bg-slate-200 rounded-xl"></div></div><div class="text-center text-slate-500 mt-4">กำลังค้นหาข้อมูล...</div>`;

    try {
        const response = await fetchWithTimeout('/api/search-topic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: query }),
            timeout: 60000 
        });
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        renderSearchResults(data, query);
    } catch (e) {
        resultsDiv.innerHTML = `<div class="text-center text-red-500 p-8">Error: ${e.message}</div>`;
    }
}
function renderSearchResults(results, query) {
    const container = document.getElementById('searchResults');
    container.innerHTML = `<h3 class="text-lg font-bold text-slate-700 mb-4">ผลการค้นหาสำหรับ: <span class="text-amber-600">"${query}"</span></h3>`;
    if(!results || results.length === 0) { container.innerHTML += `<div class="text-slate-500 italic">ไม่พบข้อพระคัมภีร์ที่ตรงกัน</div>`; return; }
    results.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow";
        const safeBookEn = item.book_en ? item.book_en.replace(/'/g, "\\'") : '';
        const safeChapter = item.chapter_num || 1;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-indigo-700 text-lg">${item.book_th} ${item.chapter_num}:${item.verse_num}</span>
                <button onclick="openChapterFromSearch('${safeBookEn}', ${safeChapter})" class="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-full border border-indigo-200 transition-colors font-bold"> 📖 อ่านบทเต็ม</button>
            </div>
            <p class="text-slate-800 text-lg leading-relaxed mb-3">"${item.text}"</p>
            <div class="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100"><span class="font-semibold text-amber-600">บริบท:</span> ${item.context}</div>
        `;
        container.appendChild(card);
    });
    lucide.createIcons();
}

// ✅ อัปเดตฟังก์ชันนี้ให้รองรับการค้นหาด้วยชื่อไทยหรือชื่ออังกฤษก็ได้
function openChapterFromSearch(bookName, chapterNum) {
    let foundBook = null;
    const searchTerm = bookName.toLowerCase().trim();

    // 1. ค้นหาแบบตรงตัว (Exact Match) ทั้ง EN และ TH
    for (const cat of ethiopianCanon) {
        const book = cat.books.find(b => b.en.toLowerCase() === searchTerm || b.th === bookName); // ชื่อไทยไม่ต้อง lowerCase เพราะมักตรงตัว
        if (book) { foundBook = book; break; }
    }

    // 2. ถ้าไม่เจอ ให้ค้นหาแบบบางส่วน (Partial Match)
    if (!foundBook) {
        for (const cat of ethiopianCanon) {
            const book = cat.books.find(b => b.en.toLowerCase().includes(searchTerm) || bookName.includes(b.th));
            if (book) { foundBook = book; break; }
        }
    }

    // 3. Mapping พิเศษ (ถ้าชื่อไม่ตรงกันเลย)
    if (!foundBook) {
        // เพิ่ม Mapping manual กรณีชื่อใน biblicalEvents ไม่ตรงกับ ethiopianCanon
        if (bookName === "โยเบล") foundBook = findBookByEn("Jubilees");
        else if (bookName === "หนังสือยูบิลี") foundBook = findBookByEn("Jubilees");
        else if (bookName === "เอโนค") foundBook = findBookByEn("Enoch");
        else if (bookName === "หนังสือเอโนค") foundBook = findBookByEn("Enoch");
    }

    if (foundBook) {
        if (currentBook) { navHistory.push({ book: currentBook, chapter: currentChapter }); updateHistoryUI(); }
        selectBook(foundBook);
        loadChapter(chapterNum);
        if(window.innerWidth < 768) { 
            const sidebar = document.getElementById('sidebar');
            if (!sidebar.classList.contains('-translate-x-full')) toggleSidebar();
        }
    } else { 
        alert(`ไม่พบหนังสือ: ${bookName}`); 
    }
}

// Helper หาหนังสือจากชื่ออังกฤษ
function findBookByEn(enName) {
    for (const cat of ethiopianCanon) {
        const book = cat.books.find(b => b.en === enName);
        if (book) return book;
    }
    return null;
}

// --- History (Code เดิม) ---
function goBackHistory() {
    if (navHistory.length === 0) return;
    const prevState = navHistory.pop();
    updateHistoryUI();
    if (prevState) { selectBook(prevState.book); loadChapter(prevState.chapter); }
}
function updateHistoryUI() {
    const btn = document.getElementById('historyBackBtn');
    if (navHistory.length > 0) {
        btn.classList.remove('hidden');
        const last = navHistory[navHistory.length - 1];
        btn.title = `กลับไปที่ ${last.book.th} บทที่ ${last.chapter}`;
    } else {
        btn.classList.add('hidden');
    }
}

// --- Verse of Day (Code เดิม) ---
async function loadVerseOfDay() {
    const today = new Date().toDateString();
    const savedVOD = JSON.parse(localStorage.getItem('ethiopian_vod'));
    if (savedVOD && savedVOD.date === today) {
        displayVOD(savedVOD);
    } else {
        try {
            const promptText = `Select one inspiring verse from Ethiopian Canon. Translate to Thai. Output JSON Only: { "content": "Thai text", "reference": "Book Chapter:Verse" }`;
            const response = await fetchWithTimeout('/api/get-verses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: promptText }),
                    timeout: 30000
            });
            const data = await response.json();
            const textContent = data.content || data.text || data.verse || ""; 
            const vodData = { text: textContent.replace(/<[^>]*>?/gm, '').trim(), ref: data.reference || data.ref || "-", date: today };
            if(vodData.text) {
                localStorage.setItem('ethiopian_vod', JSON.stringify(vodData));
                displayVOD(vodData);
            }
        } catch (e) { 
            displayVOD({ text: "ขอพระเจ้าทรงอวยพรท่าน", ref: "Ethiopian Canon" });
        }
    }
}
function displayVOD(vod) {
    document.getElementById('vodText').innerText = `"${vod.text}"`;
    document.getElementById('vodRef').innerText = vod.ref;
}
function goToVerseOfDay() {
    const ref = document.getElementById('vodRef').innerText;
    if(ref !== "-") {
        document.getElementById('topicInput').value = ref;
        goToTopicSearch();
        performTopicSearch();
    }
}



// --- Lesson Planner (Code เดิม) ---
async function generateLesson() {
    const topic = document.getElementById('lessonTopic').value.trim();
    const platform = document.getElementById('lessonPlatform').value;
    const duration = document.getElementById('lessonDuration').value; 
    const btn = document.getElementById('genLessonBtn');
    const contentArea = document.getElementById('lessonContentArea');
    const saveBtn = document.getElementById('saveLessonBtn');

    if (!topic) { alert('กรุณาระบุหัวข้อบทเรียน'); return; }

    const originalBtnText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> กำลังสร้างบทเรียน...`;
    lucide.createIcons();
    saveBtn.disabled = true;
    
    contentArea.innerHTML = `<div class="space-y-4 animate-pulse"><div class="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-6"></div><div class="h-4 bg-slate-200 rounded w-full"></div><div class="h-4 bg-slate-200 rounded w-full"></div><div class="h-24 bg-amber-50 rounded w-full border border-amber-100 p-4"></div><div class="grid grid-cols-2 gap-4 mt-4"><div class="h-20 bg-red-50 rounded w-full border border-red-100"></div><div class="h-20 bg-red-50 rounded w-full border border-red-100"></div></div></div><div class="text-center text-slate-500 mt-4 text-sm">AI กำลังวิเคราะห์ข้อมูลและค้นหาสื่อการสอน...</div>`;

    try {
       const response = await fetchWithTimeout('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, duration }),
        timeout: 120000 
    });
        if (!response.ok) { throw new Error((await response.json()).error || 'Server error'); }
        const result = await response.json();
        
        let videoHtml = '';
        if (result.youtubeQueries && result.youtubeQueries.length > 0) {
            videoHtml = `<div class="mt-8 pt-6 border-t border-slate-200"><h3 class="font-bold text-red-600 mb-3 flex items-center gap-2">YouTube</h3><div class="grid sm:grid-cols-2 gap-3">${result.youtubeQueries.map(q => `<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}" target="_blank" class="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors group"><div class="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M10 15l5-3-5-3z"/></svg></div><div><div class="text-xs text-red-500 font-bold uppercase">ค้นหา:</div><div class="text-sm text-slate-700 font-medium line-clamp-1">"${q}"</div></div></a>`).join('')}</div></div>`;
        }
        const fullContent = result.contentHtml + videoHtml;
        contentArea.innerHTML = fullContent;
        currentGeneratedLesson = { id: Date.now(), topic, platform, title: result.title, content: fullContent, date: new Date().toLocaleDateString('th-TH') };
        saveBtn.disabled = false;
    } catch (error) {
        contentArea.innerHTML = `<div class="text-red-500 text-center p-4">เกิดข้อผิดพลาด: ${error.message}</div>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
        lucide.createIcons();
    }
}
function saveCurrentLesson() {
    if (!currentGeneratedLesson) return;
    savedLessons.unshift(currentGeneratedLesson);
    localStorage.setItem('ethiopian_lessons', JSON.stringify(savedLessons));
    syncDataToServer('lessons', savedLessons);
    updateSavedLessonsList();
    const btn = document.getElementById('saveLessonBtn');
    const originalIcon = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-green-600"></i>`;
    lucide.createIcons();
    setTimeout(() => { btn.innerHTML = originalIcon; lucide.createIcons(); }, 1500);
}
function updateSavedLessonsList() {
    const container = document.getElementById('savedLessonsList');
    if (savedLessons.length === 0) { container.innerHTML = '<div class="text-center text-slate-400 text-xs mt-10">ยังไม่มีบทเรียนที่บันทึก</div>'; return; }
    container.innerHTML = '';
    savedLessons.forEach(lesson => {
        const item = document.createElement('div');
        item.className = "p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group relative";
        item.onclick = () => loadSavedLesson(lesson.id);
        item.innerHTML = `<div class="pr-6"><h4 class="font-bold text-slate-700 text-sm truncate">${lesson.title}</h4><div class="flex items-center gap-2 mt-1"><span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">${lesson.platform}</span><span class="text-[10px] text-slate-400">${lesson.date}</span></div></div><button onclick="deleteLesson(event, ${lesson.id})" class="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="trash" class="w-3 h-3"></i></button>`;
        container.appendChild(item);
    });
    lucide.createIcons();
}
function loadSavedLesson(id) {
    const lesson = savedLessons.find(l => l.id === id);
    if (lesson) {
        document.getElementById('lessonContentArea').innerHTML = lesson.content;
        currentGeneratedLesson = lesson;
        document.getElementById('saveLessonBtn').disabled = true;
    }
}
function deleteLesson(e, id) {
    e.stopPropagation();
    if(confirm('ต้องการลบบทเรียนนี้ใช่หรือไม่?')) {
        savedLessons = savedLessons.filter(l => l.id !== id);
        localStorage.setItem('ethiopian_lessons', JSON.stringify(savedLessons));
        syncDataToServer('lessons', savedLessons);
        updateSavedLessonsList();
        if(currentGeneratedLesson && currentGeneratedLesson.id === id) { clearLessonView(); }
    }
}
function clearLessonView() {
    document.getElementById('lessonContentArea').innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-300"><i data-lucide="layout-template" class="w-16 h-16 mb-4 opacity-50"></i><p>เลือกหัวข้อแล้วกดสร้างเพื่อเริ่มใช้งาน</p></div>`;
    currentGeneratedLesson = null;
    document.getElementById('saveLessonBtn').disabled = true;
    lucide.createIcons();
}
function copyLesson() {
    const content = document.getElementById('lessonContentArea').innerText;
    navigator.clipboard.writeText(content).then(() => { showToast('คัดลอกเนื้อหาเรียบร้อยแล้ว'); });
}

// --- Utils (Code เดิม) ---
document.getElementById('bookSearch').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.book-card').forEach(btn => {
        btn.style.display = btn.innerText.toLowerCase().includes(term) ? 'flex' : 'none';
    });
});
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');
    if (!toast) return;
    toastMsg.innerText = msg;
    toastIcon.innerHTML = type === 'success' ? '✅' : '⚠️';
    const bgClass = type === 'success' ? 'bg-slate-800' : 'bg-red-600';
    toast.className = `fixed bottom-5 left-1/2 transform -translate-x-1/2 ${bgClass} text-white px-6 py-3 rounded-full shadow-lg transition-opacity duration-300 z-50 flex items-center gap-2`;
    toast.classList.remove('opacity-0');
    setTimeout(() => { toast.classList.add('opacity-0'); }, 3000);
}
// --- ส่วนที่เพิ่มใหม่: จัดการ Deep Link จากปฏิทิน ---

// ฟังก์ชันอ่านค่าจาก URL (เช่น ?book=Genesis&chapter=1) และเปิดหน้านั้น
function handleDeepLink() {
    // 1. อ่าน Query Parameters
    const params = new URLSearchParams(window.location.search);
    const bookParam = params.get('book');
    const chapterParam = params.get('chapter');

    // 2. ถ้ามีข้อมูลชื่อหนังสือส่งมา
    if (bookParam) {
        console.log(`Deep link requesting: ${bookParam} Chapter ${chapterParam}`);

        const bookSelect = document.getElementById('bookSelect');
        const chapterSelect = document.getElementById('chapterSelect');

        // 3. รอจังหวะให้ Dropdown โหลดข้อมูลเสร็จสักครู่ (500ms)
        // จำเป็นเพราะบางทีหน้าเว็บต้องไปดึงรายการหนังสือมาเติมใส่ Dropdown ก่อน
        setTimeout(() => {
            if (bookSelect) {
                let found = false;
                
                // วนลูปหาชื่อหนังสือใน Dropdown ที่ตรงกับ bookParam
                for (let i = 0; i < bookSelect.options.length; i++) {
                    // เปรียบเทียบทั้ง value และ text (เผื่อกรณีชื่อไม่ตรงเป๊ะ)
                    if (bookSelect.options[i].value === bookParam || bookSelect.options[i].text.includes(bookParam)) {
                        bookSelect.selectedIndex = i;
                        // สั่งให้ Dropdown ทำงานเหมือนเรากดเลือกเอง (เพื่อไปโหลดจำนวนบท)
                        bookSelect.dispatchEvent(new Event('change')); 
                        found = true;
                        break;
                    }
                }

                // 4. ถ้าเจอหนังสือ และมีเลขบทส่งมาด้วย
                if (found && chapterParam && chapterSelect) {
                    // รออีกนิดนึงให้ "จำนวนบท" โหลดเสร็จก่อน ค่อยเลือกบท
                    setTimeout(() => {
                        chapterSelect.value = chapterParam;
                        chapterSelect.dispatchEvent(new Event('change')); // โหลดเนื้อหาบทนั้น
                    }, 500); 
                }
            }
        }, 500); // รอ 0.5 วินาทีหลังจากโหลดหน้าเสร็จ
    }
}

// สั่งให้ทำงานเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', handleDeepLink);