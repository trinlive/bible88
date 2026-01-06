// data/calendarData.js
// Update: Date Format changed to Abbreviated Day + Short Year e.g., "(อ.) 06.01.26"

const biblicalEvents = require('./biblicalEvents');

const daysOfWeek = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
// เพิ่มชุดชื่อวันแบบย่อ (มีวงเล็บตามต้องการ)
const daysOfWeekAbbr = ["(อา.)", "(จ.)", "(อ.)", "(พ.)", "(พฤ.)", "(ศ.)", "(ส.)"];

const monthNames = [
    "เดือนที่ 1 อาบิบ (אביב)", "เดือนที่ 2 ศิฟ (זיו)", "เดือนที่ 3 สิวัน (סיוון)",
    "เดือนที่ 4 ชิโลห์ (שילה)", "เดือนที่ 5 อับ (אב)", "เดือนที่ 6 เอลุล (אלול)",
    "เดือนที่ 7 เอธานิม (איתנים)", "เดือนที่ 8 บูล (בול)", "เดือนที่ 9 คิสเลฟ (כסלו)",
    "เดือนที่ 10 เตเบท (טבת)", "เดือนที่ 11 เชบัท (שבט)", "เดือนที่ 12 อาดาร์ 1 (אדר א)",
    "เดือนที่ 13 อาดาร์ 2 (אדר ב)"
];

// ฐานข้อมูล True Lunar (2025-2036)
const newMoonsDB = {
    "2025": [ '2025-03-29', '2025-04-27', '2025-05-27', '2025-06-25', '2025-07-24', '2025-08-23', '2025-09-21', '2025-10-21', '2025-11-20', '2025-12-20', '2026-01-18', '2026-02-17' ],
    "2026": [ '2026-03-19', '2026-04-17', '2026-05-17', '2026-06-15', '2026-07-15', '2026-08-13', '2026-09-12', '2026-10-11', '2026-11-10', '2026-12-09', '2027-01-08', '2027-02-06', '2027-03-08' ],
    "2027": [ '2027-04-07', '2027-05-06', '2027-06-05', '2027-07-04', '2027-08-02', '2027-09-01', '2027-10-01', '2027-10-30', '2027-11-29', '2027-12-28', '2028-01-27', '2028-02-25' ],
    "2028": [ '2028-03-26', '2028-04-24', '2028-05-24', '2028-06-22', '2028-07-22', '2028-08-20', '2028-09-19', '2028-10-18', '2028-11-17', '2028-12-16', '2029-01-15', '2029-02-13', '2029-03-15' ],
    "2029": [ '2029-04-14', '2029-05-13', '2029-06-12', '2029-07-11', '2029-08-10', '2029-09-08', '2029-10-08', '2029-11-06', '2029-12-06', '2030-01-04', '2030-02-03', '2030-03-04' ],
    "2030": [ '2030-04-03', '2030-05-02', '2030-06-01', '2030-07-01', '2030-07-30', '2030-08-29', '2030-09-27', '2030-10-27', '2030-11-25', '2030-12-25', '2031-01-23', '2031-02-22' ],
    "2031": [ '2031-03-23', '2031-04-22', '2031-05-21', '2031-06-20', '2031-07-19', '2031-08-18', '2031-09-16', '2031-10-16', '2031-11-14', '2031-12-14', '2032-01-12', '2032-02-11', '2032-03-11' ],
    "2032": [ '2032-04-10', '2032-05-09', '2032-06-08', '2032-07-07', '2032-08-06', '2032-09-04', '2032-10-04', '2032-11-02', '2032-12-02', '2032-12-31', '2033-01-30', '2033-02-28' ],
    "2033": [ '2033-03-30', '2033-04-29', '2033-05-28', '2033-06-27', '2033-07-26', '2033-08-25', '2033-09-23', '2033-10-23', '2033-11-21', '2033-12-21', '2034-01-19', '2034-02-18' ],
    "2034": [ '2034-03-20', '2034-04-18', '2034-05-18', '2034-06-16', '2034-07-16', '2034-08-14', '2034-09-13', '2034-10-12', '2034-11-11', '2034-12-10', '2035-01-09', '2035-02-07', '2035-03-09' ],
    "2035": [ '2035-04-08', '2035-05-07', '2035-06-06', '2035-07-05', '2035-08-04', '2035-09-02', '2035-10-02', '2035-10-31', '2035-11-30', '2035-12-29', '2036-01-28', '2036-02-26' ],
    "2036": [ '2036-03-27', '2036-04-25', '2036-05-25', '2036-06-23', '2036-07-23', '2036-08-21', '2036-09-20', '2036-10-19', '2036-11-18', '2036-12-17', '2037-01-16', '2037-02-14', '2037-03-16' ]
};

// ==========================================
// 🛠️ Main Function: Get Calendar Data
// ==========================================
function getCalendarData(selectedYear) {
    const calendarData = [];
    const newMoons = newMoonsDB[selectedYear] || newMoonsDB["2025"];

    newMoons.forEach((startDateStr, index) => {
        const monthNumber = index + 1;
        let monthNameInfo = monthNames[index];
        if (newMoons.length === 12 && monthNumber === 12) {
             monthNameInfo = "เดือนที่ 12 อาบิบ (אביב)"; 
        }

        let endDateStr = newMoons[index + 1];
        let endDate;
        if (!endDateStr) {
            const lastDate = new Date(startDateStr);
            lastDate.setDate(lastDate.getDate() + 29);
            endDate = lastDate;
        } else {
            const nextStart = new Date(endDateStr);
            nextStart.setDate(nextStart.getDate() - 1);
            endDate = nextStart;
        }

        const current = new Date(startDateStr);
        const end = new Date(endDate);

        let lunarDay = 1;
        while (current <= end) {
            const d = String(current.getDate()).padStart(2, '0');
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const fullYear = current.getFullYear();
            const shortYear = String(fullYear).slice(-2); // ปีแบบ 2 หลัก (เช่น 26)
            
            const dayName = daysOfWeek[current.getDay()];
            const dayAbbr = daysOfWeekAbbr[current.getDay()]; // วันแบบย่อ (เช่น (อ.))

            let phaseItems = []; 
            let isShabbath = false;
            
            if (lunarDay === 7 || lunarDay === 14 || lunarDay === 21 || lunarDay === 28) isShabbath = true;
            if (lunarDay === 6 || lunarDay === 13 || lunarDay === 20 || lunarDay === 27) phaseItems.push("🕯️ เข้าสะบาโต 18:00 น.");
            if (lunarDay === 7 || lunarDay === 14 || lunarDay === 21 || lunarDay === 28) phaseItems.push("✨ ออกสะบาโต 18:00 น.");
            if (lunarDay === 1) phaseItems.push("🌑 New Moon");
            else if (lunarDay === 8) phaseItems.push("🌓 First Quarter");
            else if (lunarDay === 15) phaseItems.push("🌕 Full Moon");
            else if (lunarDay === 22) phaseItems.push("🌗 Last Quarter");

            if (monthNumber === 1 && lunarDay === 14) phaseItems.push("✨ ปัสกา");
            if (monthNumber === 2 && lunarDay === 14) phaseItems.push("✨ ปัสการอบสอง");
            if (monthNumber === 3 && lunarDay === 6) phaseItems.push("✨ สัปดาห์ (Shavuot)");
            if (monthNumber === 7) {
                if (lunarDay === 1) phaseItems.push("✨ เสียงแตร");
                if (lunarDay === 10) phaseItems.push("✨ วันลบมลทิน");
                if (lunarDay === 15) phaseItems.push("✨ อยู่เพิง");
            }
            if (monthNumber === 9 && lunarDay >= 25) phaseItems.push("🕎 ฮานุกะห์");
            const lastMonth = newMoons.length; 
            if (monthNumber === lastMonth && lunarDay === 14) phaseItems.push("✨ ปูริม");

            if (isShabbath) phaseItems.push("วันสะบาโต");
            const phaseText = phaseItems.length > 0 ? phaseItems.join(" / ") : "";
            const eventKey = `${monthNumber}-${lunarDay}`;
            const historicalEvents = biblicalEvents[eventKey] || [];

            calendarData.push({
                // --- UPDATE: ใช้รูปแบบย่อ (อ.) 06.01.26 ---
                date: `${dayAbbr} ${d}.${m}.${shortYear}`,
                gregorianDate: `${fullYear}-${m}-${d}`,
                dayName: dayName,
                lunar: {
                    month: monthNumber,
                    monthName: monthNameInfo,
                    day: lunarDay,
                    text: `วันที่ ${lunarDay}`,
                    phase: phaseText,
                    isShabbath: isShabbath,
                    history: historicalEvents 
                }
            });
            current.setDate(current.getDate() + 1);
            lunarDay++;
        }
    });
    return calendarData;
}

// ==========================================
// 🧠 Algorithm: Gregorian to Jewish
// ==========================================

function gregorianToJD(year, month, day) {
    if (month <= 2) { year -= 1; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function getRoshHashanahJD(hebrewYear) {
    const monthsElapsed = Math.floor((235 * hebrewYear - 234) / 19);
    const partsElapsed = 12084 + 13753 * monthsElapsed;
    const day = 29 * monthsElapsed + Math.floor(partsElapsed / 25920);
    const parts = partsElapsed % 25920;
    let jd = 347997 + day; 

    let dayOfWeek = (jd + 1) % 7; 
    if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 5) {
        jd++;
        dayOfWeek = (dayOfWeek + 1) % 7;
    }
    if (parts >= 19440) {
        jd++;
        dayOfWeek = (dayOfWeek + 1) % 7;
        if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 5) { jd++; }
    } 
    else if (dayOfWeek === 2 && parts >= 9924 && !isLeapYear(hebrewYear)) { jd += 2; }
    else if (dayOfWeek === 1 && parts >= 16789 && isLeapYear(hebrewYear - 1)) { jd++; }

    return jd;
}

function isLeapYear(year) {
    return ((year * 7 + 1) % 19) < 7;
}

function g2j(date) {
    const gYear = date.getFullYear();
    const gMonth = date.getMonth() + 1;
    const gDay = date.getDate();

    let hYear = gYear + 3760;
    const gJD = gregorianToJD(gYear, gMonth, gDay);

    let roshHashanahJD = getRoshHashanahJD(hYear + 1);
    if (gJD >= roshHashanahJD) {
        hYear++;
        roshHashanahJD = getRoshHashanahJD(hYear + 1);
    } else {
        const currentYearRH = getRoshHashanahJD(hYear);
        if (gJD < currentYearRH) { hYear--; }
    }

    const jdStartOfYear = getRoshHashanahJD(hYear);
    const dayInYear = gJD - jdStartOfYear; 

    const jdNextYear = getRoshHashanahJD(hYear + 1);
    const yearLength = jdNextYear - jdStartOfYear;

    let monthLengths;
    if (yearLength === 353 || yearLength === 383) { 
        monthLengths = [30, 29, 29, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29];
    } else if (yearLength === 354 || yearLength === 384) { 
        monthLengths = [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29];
    } else { 
        monthLengths = [30, 30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29];
    }

    let mIndex = 0;
    let daysRemaining = dayInYear;
    while (daysRemaining >= monthLengths[mIndex]) {
        daysRemaining -= monthLengths[mIndex];
        mIndex++;
    }

    const hDay = Math.floor(daysRemaining + 1); 
    const isLeap = isLeapYear(hYear);

    let finalMonth = 0;
    if (isLeap) {
        const leapMap = [7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6];
        finalMonth = leapMap[mIndex];
    } else {
        const regularMap = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
        finalMonth = regularMap[mIndex];
    }

    return { y: hYear, m: finalMonth, d: hDay, isLeap: isLeap };
}

// ==========================================
// 🔄 Convert Date Function
// ==========================================
function convertDate(dateStr) {
    const targetDate = new Date(dateStr);
    const targetYear = targetDate.getFullYear();
    const d = String(targetDate.getDate()).padStart(2, '0');
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const y = targetDate.getFullYear();
    const shortYear = String(y).slice(-2);
    const formattedDate = `${y}-${m}-${d}`;

    const yearsToCheck = [String(targetYear - 1), String(targetYear)];
    for (let yearKey of yearsToCheck) {
        if (newMoonsDB[yearKey]) {
            const yearData = getCalendarData(yearKey);
            const match = yearData.find(d => d.gregorianDate === dateStr);
            if (match) return match;
        }
    }

    const calc = g2j(targetDate); 
    
    let monthIndex = -1;
    let monthNameDisplay = "";
    
    if (calc.m === 12 && !calc.isLeap) {
        monthIndex = 11; 
        monthNameDisplay = "เดือนที่ 12 อาดาร์ (אדר)";
    } else if (calc.m === 12 && calc.isLeap) {
        monthIndex = 11; 
        monthNameDisplay = monthNames[11];
    } else if (calc.m === 13) {
        monthIndex = 12; 
        monthNameDisplay = monthNames[12];
    } else {
        monthIndex = calc.m - 1;
        monthNameDisplay = monthNames[monthIndex] || `เดือนที่ ${calc.m}`;
    }

    const lunarDay = calc.d;
    const monthNum = calc.m;
    const eventKey = `${monthNum}-${lunarDay}`;
    const historicalEvents = biblicalEvents[eventKey] || [];
    
    let phaseItems = [];
    let isShabbath = (targetDate.getDay() === 5 && targetDate.getHours() >= 18) || (targetDate.getDay() === 6); 
    if (isShabbath) phaseItems.push("วันสะบาโต (โดยประมาณ)");
    
    if (monthNum === 1 && lunarDay === 14) phaseItems.push("✨ ปัสกา");
    if (monthNum === 3 && lunarDay === 6) phaseItems.push("✨ สัปดาห์ (Shavuot)");
    if (monthNum === 7 && lunarDay === 1) phaseItems.push("✨ เสียงแตร");
    if (monthNum === 7 && lunarDay === 10) phaseItems.push("✨ วันลบมลทิน");
    if (monthNum === 7 && lunarDay === 15) phaseItems.push("✨ อยู่เพิง");
    if (monthNum === 9 && lunarDay === 25) phaseItems.push("🕎 ฮานุกะห์");
    if (monthNum === 12 && lunarDay === 14) phaseItems.push("✨ ปูริม");

    return {
        // --- UPDATE: ใช้รูปแบบย่อ (อ.) 06.01.26 ในส่วน Convert ด้วย ---
        date: `${daysOfWeekAbbr[targetDate.getDay()]} ${d}.${m}.${shortYear}`,
        gregorianDate: formattedDate,
        dayName: daysOfWeek[targetDate.getDay()],
        lunar: {
            month: monthNum,
            monthName: monthNameDisplay,
            day: lunarDay,
            text: `วันที่ ${lunarDay}`,
            phase: phaseItems.join(" / ") || "-",
            isShabbath: isShabbath,
            history: historicalEvents
        }
    };
}

// ฟังก์ชันเปลี่ยนปี (offset = -1 คือย้อนหลัง, 1 คือไปข้างหน้า)
function changeYear(offset) {
    const select = document.getElementById('yearSelect');
    const currentVal = parseInt(select.value);
    const newVal = currentVal + offset;

    const optionExists = [...select.options].some(o => o.value == newVal);
    
    if (optionExists) {
        select.value = newVal; 
        loadCalendar(newVal);  
    } else {
        alert("ไม่มีข้อมูลของปีที่คุณเลือกครับ");
    }
}

module.exports = { getCalendarData, convertDate };