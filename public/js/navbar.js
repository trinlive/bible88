document.addEventListener("DOMContentLoaded", function() {
    // 1. โหลดไฟล์ HTML
    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;

            // 2. ตั้งค่า Active Menu ตามชื่อไฟล์ปัจจุบัน
            const path = window.location.pathname;
            const page = path.split("/").pop(); // เช่น calendar.html

            const setActive = (href) => {
                const link = document.querySelector(`.nav-item[href="${href}"]`);
                if (link) link.classList.add("active");
            };

            if (page === "calendar.html" || page === "") setActive("calendar.html");
            else if (page === "calendarTable.html") setActive("calendarTable.html");
            else if (page === "converter.html") setActive("converter.html");
            else if (page === "index.html") setActive("index.html");

            // 3. โหลด Widget ดวงจันทร์ (ถ้ามีฟังก์ชันนี้)
            if (typeof renderMoonWidget === 'function') {
                renderMoonWidget('moonPhaseWidget');
            }
        })
        .catch(error => console.error("Error loading navbar:", error));
});