// public/js/calendar.js
// Update: Add Deep Link to Bible Events & Consistent Styling

// ข้อมูลปีฮีบรู (2025-2036)
const hebrewYearInfo = {
    "2025": { year: "5786", desc: "12 เดือน" }, 
    "2026": { year: "5787", desc: "13 เดือน / ปีอธิกสุรทิน" },
    "2027": { year: "5788", desc: "12 เดือน" }, 
    "2028": { year: "5789", desc: "13 เดือน / ปีอธิกสุรทิน" },
    "2029": { year: "5790", desc: "12 เดือน" }, 
    "2030": { year: "5791", desc: "12 เดือน" },
    "2031": { year: "5792", desc: "13 เดือน / ปีอธิกสุรทิน" }, 
    "2032": { year: "5793", desc: "12 เดือน" },
    "2033": { year: "5794", desc: "12 เดือน" }, 
    "2034": { year: "5795", desc: "13 เดือน / ปีอธิกสุรทิน" },
    "2035": { year: "5796", desc: "12 เดือน" }, 
    "2036": { year: "5797", desc: "13 เดือน / ปีอธิกสุรทิน" }
};

// Helper: หาวันที่ปัจจุบัน (Format: YYYY-MM-DD)
function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ฟังก์ชันระบุข้อมูลฤดูกาล
function getSeasonInfo(monthNumber) {
    if (monthNumber >= 1 && monthNumber <= 3) {
        return { name: "🌱 ฤดูใบไม้ผลิ", desc: "เก็บเกี่ยวข้าวบาร์เลย์", color: "#4caf50" }; 
    } else if (monthNumber >= 4 && monthNumber <= 6) {
        return { name: "☀️ ฤดูร้อน", desc: "อากาศแห้ง/เก็บผลไม้", color: "#ff9800" }; 
    } else if (monthNumber >= 7 && monthNumber <= 9) {
        return { name: "🍂 ฤดูใบไม้ร่วง", desc: "ไถหว่าน/ฝนต้นฤดู", color: "#795548" }; 
    } else {
        return { name: "🌧️ ฤดูหนาว", desc: "ฝนตกหนัก/อากาศเย็น", color: "#2196f3" }; 
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initYearSelect();
    
    const searchInput = document.getElementById('eventSearch');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const clearBtn = document.getElementById('searchClear');
            if (clearBtn) clearBtn.style.display = term ? 'block' : 'none';
            
            let visibleCount = 0;
            const rows = document.querySelectorAll('#calTable tbody tr');
            
            rows.forEach(row => {
                if(row.innerText.toLowerCase().includes(term)) { 
                    row.style.display = ''; 
                    visibleCount++; 
                } else { 
                    row.style.display = 'none'; 
                }
            });
            
            const noRes = document.getElementById('noResults');
            if(noRes) noRes.style.display = visibleCount === 0 ? 'block' : 'none';
        });
    }
});

// --- CORE FUNCTIONS ---

function initYearSelect() {
    const select = document.getElementById('yearSelect');
    if(!select) return;
    
    select.innerHTML = '';
    for (const [year, info] of Object.entries(hebrewYearInfo)) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}-${parseInt(year)+1} (ปี ${info.year} - ${info.desc})`;
        select.appendChild(option);
    }
    
    const d = new Date();
    let targetYear = d.getFullYear();
    if (d.getMonth() < 3) { targetYear -= 1; }
    
    select.value = hebrewYearInfo[targetYear] ? targetYear.toString() : "2025";
    loadCalendar(select.value);
}

function loadCalendar(year) {
    const loading = document.getElementById('loading');
    const table = document.getElementById('calTable');
    const tbody = document.querySelector('#calTable tbody');
    const subtitle = document.getElementById('calendarSubtitleText');
    const stats = document.getElementById('yearStats');
    const noResults = document.getElementById('noResults');

    const sInput = document.getElementById('eventSearch');
    if(sInput) { sInput.value = ''; sInput.dispatchEvent(new Event('input')); }

    const info = hebrewYearInfo[year] || {year:'--', desc:''};
    if (subtitle) {
        subtitle.innerHTML = `True Lunar | ปีฮีบรู ${info.year} (${info.desc}) | สารบบเอธิโอเปีย 88 เล่ม<br>แจ้งเตือนเวลา เข้า-ออก สะบาโต (18:00 น.)`;
    }
    
    if(tbody) tbody.innerHTML = ''; 
    if(table) table.style.display = 'none'; 
    if(stats) stats.style.display = 'none'; 
    if(noResults) noResults.style.display = 'none';
    if(loading) loading.style.display = 'block';

    fetch(`/api/calendar?year=${year}`)
        .then(res => res.json())
        .then(data => {
            if(!data || data.length === 0) { 
                if(loading) loading.textContent = "❌ ไม่พบข้อมูล"; 
                return; 
            }
            
            const totalDays = data.length;
            if(stats) {
                stats.innerHTML = `📊 สรุปปีนี้: <strong>${totalDays}</strong> วัน / <strong>${(totalDays/7).toFixed(1)}</strong> สัปดาห์`;
                stats.style.display = 'inline-block';
            }
            
            const todayStr = getTodayString();
            let todayRow = null;

            data.forEach(item => {
                // 1. ตรวจสอบวันขึ้นเดือนใหม่ เพื่อแทรกแถบฤดูกาล (Season Header)
                if(item.lunar.day === 1) {
                    const season = getSeasonInfo(item.lunar.month);
                    const seasonRow = document.createElement('tr');
                    
                    seasonRow.innerHTML = `
                        <td colspan="4" class="season-cell" style="background-color: ${season.color}; color: #ffffff;">
                            <div class="season-flex-container">
                                <div class="season-left-group">
                                    <span class="season-name">
                                        ${season.name}
                                    </span>
                                    <span class="season-desc" style="color: rgba(255,255,255,0.9);">
                                        ${season.desc}
                                    </span>
                                </div>
                                <div class="season-month-label">
                                    ${item.lunar.monthName}
                                </div>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(seasonRow);
                }

                // 2. สร้างแถวข้อมูลปกติ
                const tr = document.createElement('tr');
                const isToday = (item.gregorianDate === todayStr);
                const fullText = item.lunar.phase || '';

                if(isToday) { 
                    tr.classList.add('is-today-row'); 
                    tr.id = 'row-today';
                    todayRow = tr; 
                } 
                else if (fullText.includes('✨') || fullText.includes('ฮานุกะห์') || fullText.includes('เทศกาล')) { 
                    tr.classList.add('is-feast-row'); 
                } 
                else if (item.lunar.isShabbath) { 
                    tr.classList.add('is-shabbath'); 
                }
                
                // --- สร้างป้ายกำกับ (Phase Badges) ---
                let phaseHtml = '';
                if(fullText) {
                    phaseHtml = fullText.split(' / ').map(p => {
                        let cls = 'bg-default';
                        let text = p.trim();
                        
                        if(text.includes('New Moon')) cls = 'bg-new-moon';
                        else if(text.includes('Full Moon')) cls = 'bg-full-moon';
                        else if(text.includes('สะบาโต')) cls = 'bg-shabbath'; // ใช้สีฟ้าสะบาโต
                        else if(text.includes('✨') || text.includes('ฮานุกะห์') || text.includes('ปัสกา')) {
                            cls = 'bg-feast';
                            text = text.replace('✨', '').trim();
                        }
                        return `<span class="badge ${cls}">${text}</span>`;
                    }).join(' ');
                }

                // --- สร้างลิงก์เหตุการณ์พระคัมภีร์ (History Links) ---
                let historyHtml = '';
                if(item.lunar.history && item.lunar.history.length > 0) {
                    historyHtml = `<ul class="history-list">` +
                        item.lunar.history.map(h => {
                            // ใช้ Regex แยกชื่อหนังสือและบท (เช่น "Genesis 1:5")
                            const match = h.match(/^(\d?\s?[a-zA-Z\s]+?)\s+(\d+)/);
                            let linkUrl = "ethiopianCanon.html";
                            
                            if (match) {
                                const book = match[1].trim();
                                const chapter = match[2];
                                linkUrl = `ethiopianCanon.html?book=${encodeURIComponent(book)}&chapter=${chapter}`;
                            }
                            
                            // สร้างเป็นลิงก์ <a>
                            return `<li class="history-item">
                                <a href="${linkUrl}" style="text-decoration:none; color:inherit; border-bottom:1px dotted #aaa;">
                                    📖 ${h}
                                </a>
                            </li>`;
                        }).join('') + 
                        `</ul>`;
                }

                // --- FORMATTING DATE ---
                const hDay = String(item.lunar.day).padStart(2, '0');
                const hMonth = String(item.lunar.month).padStart(2, '0');
                const hYear = info.year; 

                // โครงสร้าง HTML ของแถว (รองรับ Mobile Flexbox)
                tr.innerHTML = `
                    <td>
                        <div class="date-text">${item.date}</div>
                        ${isToday ? '<div class="today-badge badge" style="background:#ef4444; color:white; margin-top:4px;">📍 วันนี้</div>' : ''}
                    </td>
                    <td>
                        <div style="font-weight:bold; color:#2c3e50; font-size:0.95em; margin-bottom:2px;">
                            ${item.lunar.monthName}
                        </div>
                        <div style="font-weight:bold; color:#8b0000; font-size:0.95em;">
                            วันที่ ${hDay}.${hMonth}.${hYear}
                        </div>
                    </td>
                    <td>${phaseHtml}</td>
                    <td>${historyHtml}</td>
                `;
                tbody.appendChild(tr);
            });

            if(loading) loading.style.display = 'none'; 
            
            // ใช้ค่าว่าง '' เพื่อให้ Browser ใช้ค่า display จาก CSS (block บนมือถือ, table บนคอม)
            if(table) table.style.display = ''; 
            
            if(todayRow) {
                setTimeout(() => {
                    todayRow.scrollIntoView({behavior:'smooth', block:'center'});
                }, 500);
            }
        })
        .catch(err => { 
            console.error(err); 
            if(loading) loading.textContent = "⚠️ Error loading data"; 
        });
}

function clearSearch() {
    const sInput = document.getElementById('eventSearch');
    if(sInput) { sInput.value = ''; sInput.dispatchEvent(new Event('input')); }
}

function changeYear(offset) {
    const select = document.getElementById('yearSelect');
    if (!select) return;
    const currentVal = parseInt(select.value);
    const newVal = currentVal + offset;
    const optionExists = Array.from(select.options).some(option => parseInt(option.value) === newVal);
    
    if (optionExists) {
        select.value = newVal;
        loadCalendar(newVal);
    } else {
        console.log("สุดขอบข้อมูลปีแล้ว: " + newVal);
    }
}