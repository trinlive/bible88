// public/js/calendarTable.js
// Update: Enable Year Stats + Full Features

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

let currentData = [];
let currentMonthIndex = 1; 
const dayMap = { "อาทิตย์": 0, "จันทร์": 1, "อังคาร": 2, "พุธ": 3, "พฤหัสบดี": 4, "ศุกร์": 5, "เสาร์": 6 };

document.addEventListener('DOMContentLoaded', () => {
    initYearSelect();
});

function initYearSelect() {
    const select = document.getElementById('yearSelect');
    if(!select) return;
    
    select.innerHTML = '';
    for (const [year, info] of Object.entries(hebrewYearInfo)) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year} (ปี ${info.year})`;
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
    const grid = document.getElementById('calendarGrid');
    const subtitle = document.getElementById('calendarSubtitleText');
    
    // 1. อ้างอิง Element
    const stats = document.getElementById('yearStats');
    
    if(loading) loading.style.display = 'block';
    if(grid) grid.style.display = 'none';
    if(stats) stats.style.display = 'none'; // ซ่อนก่อนโหลดใหม่

    const info = hebrewYearInfo[year] || {year:'--', desc:''};
    if (subtitle) subtitle.innerHTML = `True Lunar | ปีฮีบรู ${info.year} | ${info.desc}`;

    fetch(`/api/calendar?year=${year}`)
        .then(res => res.json())
        .then(data => {
            currentData = data;
            
            // 2. คำนวณและแสดงผล Year Stats
            const totalDays = data.length;
            if(stats) {
                stats.innerHTML = `📊 สรุปปีนี้: <strong>${totalDays}</strong> วัน / <strong>${(totalDays/7).toFixed(1)}</strong> สัปดาห์`;
                stats.style.display = 'inline-block'; // สั่งให้แสดงผล
            }

            const todayStr = getTodayString();
            const todayItem = data.find(d => d.gregorianDate === todayStr);
            
            if (todayItem) {
                currentMonthIndex = todayItem.lunar.month;
            } else {
                currentMonthIndex = 1;
            }

            renderMonth();
            if(loading) loading.style.display = 'none';
            if(grid) grid.style.display = 'grid';
        })
        .catch(err => {
            console.error(err);
            if(loading) loading.textContent = "Error loading data";
        });
}

function renderMonth() {
    const gridDays = document.getElementById('gridDays');
    const monthDisplay = document.getElementById('currentMonthDisplay');
    const seasonBadge = document.getElementById('seasonBadge');
    
    gridDays.innerHTML = '';

    const monthData = currentData.filter(item => item.lunar.month === currentMonthIndex);
    
    if (monthData.length === 0) {
        gridDays.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px;">ไม่พบข้อมูล</div>';
        return;
    }

    const firstItem = monthData[0];
    monthDisplay.textContent = firstItem.lunar.monthName;

    const season = getSeasonInfo(currentMonthIndex);
    if(seasonBadge) {
        seasonBadge.style.display = 'inline-block';
        seasonBadge.style.backgroundColor = season.color;
        seasonBadge.style.color = '#fff';
        seasonBadge.innerHTML = `${season.name} (${season.desc})`;
    }

    const firstDayOfWeek = dayMap[firstItem.dayName];

    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell empty';
        gridDays.appendChild(emptyCell);
    }

    const todayStr = getTodayString();

    monthData.forEach(item => {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        
        if (item.gregorianDate === todayStr) cell.classList.add('is-today');
        if (item.lunar.isShabbath) cell.classList.add('is-shabbath-cell');

        let eventHtml = '';

        // History -> Icon
        if (item.lunar.history && item.lunar.history.length > 0) {
            eventHtml += `<div class="event-icon" title="มีเหตุการณ์พระคัมภีร์">📖</div>`;
        }

        // Phase / Feast
        if (item.lunar.phase) {
            const phases = item.lunar.phase.split(' / ');
            phases.forEach(p => {
                const text = p.trim();
                
                if (text.includes('New Moon')) {
                    eventHtml += `<div class="event-icon" title="${text}">🌑</div>`;
                } 
                else if (text.includes('Full Moon')) {
                    eventHtml += `<div class="event-icon" title="${text}">🌕</div>`;
                }
                else if (text.includes('เข้าสะบาโต')) {
                    // Responsive Tag
                    eventHtml += `
                    <div class="event-responsive-tag shabbath-tag" title="${text}">
                        <span class="show-mobile">🕯️</span>
                        <span class="show-desktop">${text}</span>
                    </div>`;
                }
                else if (text.includes('✨') || text.includes('ฮานุกะห์') || text.includes('ปัสกา') || text.includes('เทศกาล')) {
                    cell.classList.add('is-feast-cell');
                    const cleanText = text.replace('✨', '').trim();
                    // Responsive Tag
                    eventHtml += `
                    <div class="event-responsive-tag" title="${text}">
                        <span class="show-mobile">✨</span>
                        <span class="show-desktop">${cleanText}</span>
                    </div>`;
                }
            });
        }

        cell.innerHTML = `
            <div class="cell-header">
                <span class="gregorian-num">${item.date.split(' ')[1].split('.')[0]}</span>
                <span class="day-abbr">${item.date.split(' ')[0]}</span>
            </div>
            <div class="hebrew-num">${item.lunar.day}</div>
            <div class="cell-footer">
                ${eventHtml}
            </div>
        `;
        
        cell.onclick = () => {
            let msg = `📅 ${item.date}\n`;
            msg += `✡️ ${item.lunar.monthName} วันที่ ${item.lunar.day}\n\n`;
            if(item.lunar.phase) msg += `📌 ${item.lunar.phase}\n\n`;
            if(item.lunar.history && item.lunar.history.length > 0) {
                msg += `📖 เหตุการณ์ในพระคัมภีร์:\n`;
                item.lunar.history.forEach(h => msg += `- ${h}\n`);
            } else {
                msg += `- ไม่มีบันทึกเหตุการณ์ -`;
            }
            alert(msg);
        };

        gridDays.appendChild(cell);
    });
}

function changeMonth(offset) {
    const maxMonth = currentData.length > 0 ? currentData[currentData.length - 1].lunar.month : 12;
    let newMonth = currentMonthIndex + offset;
    if (newMonth < 1) newMonth = 1;
    else if (newMonth > maxMonth) newMonth = maxMonth;
    if (newMonth !== currentMonthIndex) {
        currentMonthIndex = newMonth;
        renderMonth();
    }
}

function changeYear(offset) {
    const select = document.getElementById('yearSelect');
    const currentVal = parseInt(select.value);
    const newVal = currentVal + offset;
    const optionExists = [...select.options].some(o => o.value == newVal);
    if (optionExists) {
        select.value = newVal;
        loadCalendar(newVal);
    }
}

function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getSeasonInfo(monthNumber) {
    if (monthNumber >= 1 && monthNumber <= 3) return { name: "🌱 ฤดูใบไม้ผลิ", desc: "ข้าวบาร์เลย์", color: "#4caf50" };
    if (monthNumber >= 4 && monthNumber <= 6) return { name: "☀️ ฤดูร้อน", desc: "เก็บผลไม้", color: "#ff9800" };
    if (monthNumber >= 7 && monthNumber <= 9) return { name: "🍂 ฤดูใบไม้ร่วง", desc: "ไถหว่าน", color: "#795548" };
    return { name: "🌧️ ฤดูหนาว", desc: "ฝนตก", color: "#2196f3" };
}