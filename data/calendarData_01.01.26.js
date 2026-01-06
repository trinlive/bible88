// กำหนดวันเริ่มต้น (Day 1 ของเดือนที่ 1)
// สมมติให้เริ่ม 30 มีนาคม 2025 (ตรงกับ New Moon ในข้อมูลเดิม)
const startDate = new Date('2025-03-30'); 

const calendarData = [];
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// วนลูป 13 เดือน
for (let month = 1; month <= 13; month++) {
    // วนลูป 28 วัน
    for (let day = 1; day <= 28; day++) {
        
        // คำนวณวันที่สากล (Gregorian)
        // สูตร: (month-1)*28 + (day-1) คือจำนวนวันที่ผ่านไปจากวันเริ่ม
        const daysPassed = ((month - 1) * 28) + (day - 1);
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + daysPassed);
        
        // จัดรูปแบบวันที่ (DD.MM.YY) และ (YYYY-MM-DD)
        const d = String(currentDate.getDate()).padStart(2, '0');
        const m = String(currentDate.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มที่ 0
        const y = String(currentDate.getFullYear()).slice(-2);
        const fullYear = currentDate.getFullYear();
        
        // หาชื่อวัน (Sun, Mon...)
        const dayName = daysOfWeek[currentDate.getDay()];

        // กำหนดข้างขึ้นข้างแรม (สมมติแบบคร่าวๆ ตามรอบ 28 วัน)
        let phase = "";
        let textPhase = `วันที่ ${day} ค่ำ`; // หรือจะใช้ "ขึ้น X ค่ำ" ก็ได้ถ้ามี Logic
        
        if (day === 1) phase = "New Moon (จันทร์ดับ)";
        else if (day === 8) phase = "First Quarter (ขึ้น 8 ค่ำ)";
        else if (day === 15) phase = "Full Moon (จันทร์เพ็ญ)";
        else if (day === 22) phase = "Last Quarter (แรม 8 ค่ำ)";

        calendarData.push({
            date: `${d}.${m}.${y}`,           // format สำหรับแสดงผลเดิม
            gregorianDate: `${fullYear}-${m}-${d}`, // format สำหรับเรียงลำดับ
            dayName: dayName,
            lunar: {
                month: month,             // เดือนที่ 1-13
                day: day,                 // วันที่ 1-28
                text: `วันที่ ${day} เดือนที่ ${month}`,
                phase: phase,
                isShabbath: (day % 7 === 0) // ตัวอย่าง: ทุกวันที่ 7,14,21,28 เป็นวันหยุด? (ถ้าไม่ใช่ลบออกได้)
            }
        });
    }
}

module.exports = calendarData;