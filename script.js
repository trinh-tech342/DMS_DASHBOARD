// Thay link Web App của bạn vào đây sau khi Deploy Apps Script
const WEB_APP_URL = "URL_APPS_SCRIPT_CUA_BAN";

document.getElementById('current-date').innerText = new Date().toLocaleDateString('vi-VN');

// 1. Hàm lấy dữ liệu từ Sheets để hiển thị Dashboard
async function fetchData() {
    try {
        const response = await fetch(WEB_APP_URL + "?action=getData");
        const res = await response.json();
        
        // Cập nhật số liệu Cards
        document.getElementById('stat-orders').innerText = res.totalOrders;
        document.getElementById('stat-batches').innerText = res.activeBatches;
        document.getElementById('stat-assets').innerText = res.activeAssets;

        // Cập nhật bảng Nhật ký
        const tbody = document.querySelector('#dataTable tbody');
        tbody.innerHTML = "";
        res.recentLogs.forEach(row => {
            tbody.innerHTML += `<tr>
                <td>${row.date}</td>
                <td><strong>${row.id}</strong></td>
                <td><span class="status-tag">${row.status}</span></td>
            </tr>`;
        });
    } catch (e) {
        console.log("Đang chờ kết nối dữ liệu...");
    }
}
// 2.Trong file script.js (nút bấm sidebar)
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// Hàm cập nhật ORDER luôn sẵn sàng
function addNewOrder(id, customer, time) {
    const tableBody = document.getElementById('stat-orders-list');
    const newRow = `
        <tr>
            <td>${id}</td>
            <td>${customer}</td>
            <td>${time}</td>
            <td><span class="status-badge new">Mới</span></td>
        </tr>
    `;
    // Chèn lên đầu bảng để người dùng thấy ngay đơn mới nhất
    tableBody.insertAdjacentHTML('afterbegin', newRow);
}

// Ví dụ: addNewOrder('#ORD-9999', 'Khách hàng mới', '11:00:00');
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        
        // 1. Xử lý Sidebar (Nút bấm)
        const buttons = document.querySelectorAll('.nav-btn');
        if (buttons.length > 0) {
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        }

        // 2. Vẽ Biểu đồ (Giải quyết lỗi ctx already declared)
        const canvasElement = document.getElementById('performanceChart');
        if (canvasElement) {
            // Đặt tên biến là chartContext thay vì ctx để tránh lỗi trùng lặp
            const chartContext = canvasElement.getContext('2d');
            
            new Chart(chartContext, {
                type: 'line',
                data: {
                    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
                    datasets: [{
                        label: 'Hiệu suất (%)',
                        data: [65, 85, 70, 95, 80, 90],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // 3. Sửa lỗi "Cannot set properties of null (setting 'innerText')"
        // Nếu bạn có thẻ hiển thị giờ, hãy dùng code này, nếu không script sẽ tự bỏ qua
        const clock = document.getElementById('currentTime');
        if (clock) {
            setInterval(() => {
                clock.innerText = new Date().toLocaleTimeString();
            }, 1000);
        }
    });
})();
// Chạy lấy dữ liệu khi load trang
fetchData();
