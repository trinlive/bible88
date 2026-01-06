// public/js/converter.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. ตั้งค่า Flatpickr (ปฏิทินเลือกวันที่)
    // ตรวจสอบว่ามี input นี้อยู่จริงหรือไม่ก่อนทำงาน
    const dateInput = document.getElementById('convertDateInput');
    
    if (dateInput) {
        flatpickr("#convertDateInput", {
            locale: "th",          // ใช้ภาษาไทย (ต้องโหลด script l10n/th.js ใน html ด้วย)
            dateFormat: "Y-m-d",   // รูปแบบค่าที่ส่งให้ Backend (ปี-เดือน-วัน)
            altInput: true,        // ให้แสดงผลใน Input แบบอ่านง่าย
            altFormat: "j F Y",    // รูปแบบที่ตามนุษย์เห็น (เช่น 1 มกราคม 2024)
            defaultDate: "today",  // เริ่มต้นที่วันนี้
            yearSelectorType: 'dropdown', // สำคัญ! ทำให้เลือกปีย้อนหลังได้ง่ายแบบ Dropdown
        });
    }
});

// ฟังก์ชันทำงานเมื่อกดปุ่ม "แปลงค่า"
function doConvert() {
    const dateStr = document.getElementById('convertDateInput').value;
    const resBox = document.getElementById('convertResult');
    const loader = document.getElementById('convertLoading');
    const errBox = document.getElementById('convertError');

    // ตรวจสอบว่าเลือกวันที่หรือยัง
    if (!dateStr) {
        alert("กรุณาเลือกวันที่ก่อนครับ");
        return;
    }

    // Reset UI (ซ่อนผลลัพธ์เก่า / แสดง Loading)
    resBox.style.display = 'none'; 
    errBox.style.display = 'none'; 
    loader.style.display = 'block';

    // เรียก API
    fetch(`/api/convert?date=${dateStr}`)
        .then(res => { 
            if (!res.ok) throw new Error("API Error"); 
            return res.json(); 
        })
        .then(data => {
            loader.style.display = 'none'; 
            resBox.style.display = 'block';

            // จัดการแสดงผล Phase (ข้างขึ้น/แรม/เทศกาล)
            let badges = data.lunar.phase || '-';

            // จัดการแสดงผลเหตุการณ์ (History)
            let events = '<span style="color:#999;">ไม่มีเหตุการณ์สำคัญ</span>';
            if (data.lunar.history && data.lunar.history.length > 0) {
                events = `<ul style="padding-left:20px; color:#d35400; margin-top:5px;">` + 
                         data.lunar.history.map(h => `<li>${h}</li>`).join('') + 
                         `</ul>`;
            }

            // แสดงผลลัพธ์ในกล่อง Result Card
            resBox.innerHTML = `
                <div style="font-size:0.95em; color:#777; margin-bottom:5px;">
                    วันที่สากล: <strong>${data.date}</strong> (${data.dayName})
                </div>
                
                <div class="result-date">
                    ${data.lunar.day} ${data.lunar.monthName}
                </div>
                
                <div style="margin-bottom:15px;">
                    <strong>สถานะ:</strong> ${badges}
                </div>
                
                <div style="border-top:1px solid #eee; padding-top:15px;">
                    <strong>📖 เหตุการณ์ในพระคัมภีร์:</strong><br>
                    ${events}
                </div>
            `;
        })
        .catch(err => {
            console.error(err);
            loader.style.display = 'none'; 
            errBox.textContent = "❌ ไม่พบข้อมูล หรือเกิดข้อผิดพลาดในการเชื่อมต่อ"; 
            errBox.style.display = 'block';
        });
}