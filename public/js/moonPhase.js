// public/js/moonPhase.js
// Update: Fix inverted moon phase drawing (Corrected Sweep Flags)

// 1. คำนวณเฟสดวงจันทร์ (0 ถึง 29.53)
function getMoonPhase(date) {
    const synodicMonth = 29.53058867;
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const diff = date.getTime() - knownNewMoon.getTime();
    const diffDays = diff / (1000 * 60 * 60 * 24);
    let phase = diffDays % synodicMonth;
    if (phase < 0) phase += synodicMonth;
    return phase;
}

// 2. แปลงอายุเป็นชื่อเฟสภาษาไทย (มี Emoji นำหน้า)
function getPhaseName(age) {
    if (age < 1 || age > 28.5) return "🌑 เดือนดับ (New Moon)";
    if (age < 7) return "🌒 ข้างขึ้น (Waxing Crescent)";
    if (age < 8) return "🌓 ครึ่งดวงแรก (First Quarter)";
    if (age < 14) return "🌔 ค่อนดวง (Waxing Gibbous)";
    if (age < 16) return "🌕 จันทร์เพ็ญ (Full Moon)";
    if (age < 22) return "🌖 จันทร์แรม (Waning Gibbous)";
    if (age < 23) return "🌗 ครึ่งดวงหลัง (Last Quarter)";
    return "🌘 จันทร์เสี้ยว (Waning Crescent)";
}

// 3. วาด SVG ดวงจันทร์ (แก้ไขจุดบกพร่องเรื่องภาพกลับด้าน)
function drawMoonSVG(age) {
    const synodic = 29.53;
    let phaseRatio = age / synodic;
    let angle = phaseRatio * 2 * Math.PI;
    let x = 50 * Math.cos(angle);
    let path = "";
    
    // วาดส่วนโค้งแสงเงา
    if (age <= synodic/2) { 
        // ข้างขึ้น (Waxing) - สว่างทางขวา
        // x > 0 คือ Crescent (เสี้ยว) -> ใช้ flag 0 (เว้า)
        // x < 0 คือ Gibbous (นูน) -> ใช้ flag 1 (ป่อง)
        path = `M 50,0 A 50,50 0 1,1 50,100 A ${Math.abs(x)},50 0 1,${x > 0 ? 0 : 1} 50,0`;
    } else { 
        // ข้างแรม (Waning) - สว่างทางซ้าย
        // x > 0 คือ Crescent (เสี้ยว) -> ใช้ flag 1 (เว้า)
        // x < 0 คือ Gibbous (นูน) -> ใช้ flag 0 (ป่อง)
        path = `M 50,0 A 50,50 0 1,0 50,100 A ${Math.abs(x)},50 0 1,${x > 0 ? 1 : 0} 50,0`;
    }

    // สีดวงจันทร์
    const darkColor = "#34495e"; 
    const lightColor = "#f1c40f"; 

    // กรณี Full Moon (วาดวงกลมเต็ม)
    if(age > 14 && age < 15.5) return `<circle cx="50" cy="50" r="48" fill="${lightColor}" />`; 
    // กรณี New Moon (วาดวงกลมมืด)
    if(age > 29 || age < 1) return `<circle cx="50" cy="50" r="48" fill="${darkColor}" stroke="#ccc" stroke-width="2"/>`; 

    // กรณีปกติ (มีเสี้ยว)
    return `
        <circle cx="50" cy="50" r="48" fill="${darkColor}" stroke="#ccc" stroke-width="2"/>
        <path d="${path}" fill="${lightColor}" />
    `;
}

// 4. ฟังก์ชันหลักเพื่อ Render Widget
function renderMoonWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const now = new Date();

    // สร้างวันที่ Format "DD.MM.YY"
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const dateStr = `${dd}.${mm}.${yy}`;

    // ข้อมูลดวงจันทร์
    const age = getMoonPhase(now);
    const fullPhaseName = getPhaseName(age); 
    
    // ตัด Emoji และวงเล็บภาษาอังกฤษออก เหลือแค่ชื่อไทย (เช่น "จันทร์เพ็ญ")
    const cleanName = fullPhaseName.split(" (")[0].split(" ").slice(1).join(" ");
    
    const illumination = (1 - Math.cos((age / 29.53) * 2 * Math.PI)) / 2 * 100;
    const svgContent = drawMoonSVG(age);

    container.innerHTML = `
        <div class="nav-moon-container" title="วันนี้ ${dateStr} : ${cleanName} (${illumination.toFixed(0)}%)">
            <div class="nav-moon-icon">
                <svg viewBox="0 0 100 100">
                    ${svgContent}
                </svg>
            </div>
            <div class="nav-moon-text">
                <span class="moon-date-nav">${dateStr}</span>
                <span class="moon-name-nav">${cleanName} <span style="font-weight:normal; opacity:0.8; font-size:0.9em;">${illumination.toFixed(0)}%</span></span>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    renderMoonWidget('moonPhaseWidget');
});