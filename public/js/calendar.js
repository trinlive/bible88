// public/js/calendar.js

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

// ฟังก์ชันระบุข้อมูลฤดูกาล (สีและคำอธิบาย)
function getSeasonInfo(monthNumber) {
    // เดือน 1-3: ใบไม้ผลิ
    if (monthNumber >= 1 && monthNumber <= 3) {
        return { name: "🌱 ฤดูใบไม้ผลิ", desc: "เก็บเกี่ยวข้าวบาร์เลย์", color: "#4caf50" }; 
    } 
    // เดือน 4-6: ร้อน
    else if (monthNumber >= 4 && monthNumber <= 6) {
        return { name: "☀️ ฤดูร้อน", desc: "อากาศแห้ง/เก็บผลไม้", color: "#ff9800" }; 
    } 
    // เดือน 7-9: ใบไม้ร่วง
    else if (monthNumber >= 7 && monthNumber <= 9) {
        return { name: "🍂 ฤดูใบไม้ร่วง", desc: "ไถหว่าน/ฝนต้นฤดู", color: "#795548" }; 
    } 
    // เดือน 10-13: หนาว
    else {
        return { name: "🌧️ ฤดูหนาว", desc: "ฝนตกหนัก/อากาศเย็น", color: "#2196f3" }; 
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // เริ่มต้น Dropdown และโหลดข้อมูล
    initYearSelect();
    
    // ตั้งค่าระบบค้นหา (Search)
    const searchInput = document.getElementById('eventSearch');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const clearBtn = document.getElementById('searchClear');
            if (clearBtn) clearBtn.style.display = term ? 'block' : 'none';
            
            let visibleCount = 0;
            const rows = document.querySelectorAll('#calTable tbody tr');
            
            rows.forEach(row => {
                // ค้นหาจาก text ทั้งหมดในแถวนั้น
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
    // สร้าง Options จากข้อมูล hebrewYearInfo
    for (const [year, info] of Object.entries(hebrewYearInfo)) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}-${parseInt(year)+1} (ปี ${info.year} - ${info.desc})`;
        select.appendChild(option);
    }
    
    // --- SMART LOGIC: เลือกปีเริ่มต้นให้ถูกต้องตามฤดูกาล ---
    const d = new Date();
    let targetYear = d.getFullYear();

    // ถ้าวันนี้เป็นเดือน ม.ค.(0), ก.พ.(1), หรือ มี.ค.(2)
    // แสดงว่าปีฮีบรูใหม่ยังไม่เริ่ม ให้ถอยกลับไปใช้ปีฮีบรูของปีก่อนหน้า
    if (d.getMonth() < 3) { 
        targetYear -= 1;
    }
    
    // ตรวจสอบว่าปีนี้มีในฐานข้อมูลหรือไม่ ถ้าไม่มีให้ใช้ 2025
    select.value = hebrewYearInfo[targetYear] ? targetYear.toString() : "2025";
    
    // โหลดข้อมูลทันที
    loadCalendar(select.value);
}

function loadCalendar(year) {
    const loading = document.getElementById('loading');
    const table = document.getElementById('calTable');
    const tbody = document.querySelector('#calTable tbody');
    const subtitle = document.getElementById('calendarSubtitleText');
    const stats = document.getElementById('yearStats');
    const noResults = document.getElementById('noResults');

    // Reset Search UI เมื่อเปลี่ยนปี
    const sInput = document.getElementById('eventSearch');
    if(sInput) { 
        sInput.value = ''; 
        sInput.dispatchEvent(new Event('input')); 
    }

    // อัปเดต Subtitle
    const info = hebrewYearInfo[year] || {year:'--', desc:''};
    if (subtitle) {
        subtitle.innerHTML = `True Lunar | ปีฮีบรู ${info.year} (${info.desc}) | สารบบเอธิโอเปีย 88 เล่ม<br>แจ้งเตือนเวลา เข้า-ออก สะบาโต (18:00 น.)`;
    }
    
    // UI Loading State
    if(tbody) tbody.innerHTML = ''; 
    if(table) table.style.display = 'none'; 
    if(stats) stats.style.display = 'none'; 
    if(noResults) noResults.style.display = 'none';
    if(loading) loading.style.display = 'block';

    // Fetch API
    fetch(`/api/calendar?year=${year}`)
        .then(res => res.json())
        .then(data => {
            if(!data || data.length === 0) { 
                if(loading) loading.textContent = "❌ ไม่พบข้อมูล"; 
                return; 
            }
            
            // คำนวณสถิติ
            const totalDays = data.length;
            if(stats) {
                stats.innerHTML = `📊 สรุปปีนี้: <strong>${totalDays}</strong> วัน / <strong>${(totalDays/7).toFixed(1)}</strong> สัปดาห์`;
                stats.style.display = 'inline-block';
            }
            
            const todayStr = getTodayString();
            let todayRow = null;

            // วนลูปสร้างแถวตาราง
            data.forEach(item => {
                
                // 1. ตรวจสอบวันขึ้นเดือนใหม่ เพื่อแทรกแถบฤดูกาล (Season Header)
                if(item.lunar.day === 1) {
                    const season = getSeasonInfo(item.lunar.month);
                    const seasonRow = document.createElement('tr');
                    
                    // ปรับแต่งแถบสีตามฤดูกาล
                    seasonRow.innerHTML = `
                        <td colspan="5" style="
                            background-color: ${season.color}; 
                            color: white; 
                            padding: 12px 15px; 
                            text-align: left;
                            border-radius: 8px 8px 0 0;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <span style="font-size:1.1em; font-weight:bold; margin-right:10px;">
                                        ${season.name}
                                    </span>
                                    <span style="font-size:0.9em; opacity:0.9; background:rgba(0,0,0,0.1); padding:2px 8px; border-radius:10px;">
                                        ${season.desc}
                                    </span>
                                </div>
                                <div style="font-weight:bold; font-size:1em; text-shadow:0 1px 2px rgba(0,0,0,0.2);">
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

                // ใส่ Class ตามเงื่อนไข
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
                
                // สร้าง Badges (ดวงจันทร์/เทศกาล)
                let phaseHtml = '';
                if(fullText) {
                    phaseHtml = fullText.split(' / ').map(p => {
                        let cls = 'bg-default';
                        if(p.includes('New Moon')) cls = 'bg-new-moon';
                        else if(p.includes('Full Moon')) cls = 'bg-full-moon';
                        else if(p.includes('สะบาโต')) cls = 'bg-shabbath';
                        else if(p.includes('✨') || p.includes('ฮานุกะห์') || p.includes('ปัสกา')) cls = 'bg-feast';
                        
                        return `<span class="badge ${cls}">${p.trim()}</span>`;
                    }).join(' ');
                }

                // สร้าง List เหตุการณ์ (History)
                let historyHtml = '';
                if(item.lunar.history && item.lunar.history.length > 0) {
                    historyHtml = `<ul class="history-list">` +
                        item.lunar.history.map(h => `<li class="history-item">${h}</li>`).join('') + 
                        `</ul>`;
                }

                // HTML ในแต่ละเซลล์ (5 คอลัมน์)
                tr.innerHTML = `
                    <td>
                        ${item.date}
                        ${isToday ? '<br><span class="badge" style="background:#ef4444; color:white;">📍 วันนี้</span>' : ''}
                    </td>
                    <td>${item.dayName}</td>
                    <td>
                        <span class="lunar-day-highlight">วันที่ ${item.lunar.day}</span>
                        </td>
                    <td>${phaseHtml}</td>
                    <td>${historyHtml}</td>
                `;
                tbody.appendChild(tr);
            });

            // แสดงผล
            if(loading) loading.style.display = 'none'; 
            if(table) table.style.display = 'table';
            
            // Scroll ไปที่วันนี้ (ถ้ามี)
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
    if(sInput) { 
        sInput.value = ''; 
        sInput.dispatchEvent(new Event('input')); 
    }
}

// ============================================
// ✨ BUTTON LOGIC: อยู่ล่างสุดเพื่อให้ HTML เรียกใช้ได้
// ============================================
function changeYear(offset) {
    const select = document.getElementById('yearSelect');
    if (!select) return;

    // แปลงค่าปัจจุบันเป็นตัวเลข แล้วบวก/ลบ offset
    const currentVal = parseInt(select.value);
    const newVal = currentVal + offset;

    // ตรวจสอบว่าปีใหม่มีอยู่ในตัวเลือก (Dropdown) หรือไม่?
    const optionExists = Array.from(select.options).some(option => parseInt(option.value) === newVal);
    
    if (optionExists) {
        select.value = newVal; // เปลี่ยนค่าใน Dropdown
        loadCalendar(newVal);  // สั่งโหลดข้อมูลใหม่
    } else {
        console.log("สุดขอบข้อมูลปีแล้ว: " + newVal);
    }
}