(function() {
    // Sử dụng URL Web App mới nhất của bạn
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzErUGBOPd3Xczi9qKMosAuyOT-lETJvP6ctj7WnGxC2AdN_yaYirJWucYwSZfy5Zz3/exec";

    document.addEventListener('DOMContentLoaded', () => {
        
        // --- 1. CẬP NHẬT NGÀY & ĐỒNG HỒ ---
        const dateDisplay = document.getElementById('current-date');
        if (dateDisplay) dateDisplay.innerText = new Date().toLocaleDateString('vi-VN');

        const clock = document.getElementById('currentTime');
        if (clock) {
            setInterval(() => {
                clock.innerText = new Date().toLocaleTimeString('vi-VN');
            }, 1000);
        }

        // --- 2. XỬ LÝ SIDEBAR ---
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // --- 3. KHỞI TẠO LỊCH (FULLCALENDAR) ---
        const calendarEl = document.getElementById('calendar-container');
        if (calendarEl) {
            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                locale: 'vi',
                height: 'auto',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,listWeek'
                },
                events: function(fetchInfo, successCallback, failureCallback) {
                    fetch(WEB_APP_URL + "?action=getCalendar")
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                failureCallback(data.error);
                            } else {
                                successCallback(data); // Đẩy lên lịch
                                updateTodayList(data); // Cập nhật danh sách mẫu trong ngày
                            }
                        })
                        .catch(error => failureCallback(error));
                },
                eventDidMount: (info) => {
                    info.el.style.fontSize = '11px';
                    info.el.style.cursor = 'pointer';
                },
                eventClick: (info) => {
                    const modal = document.getElementById('sampleModal');
                    if (modal) {
                        document.getElementById('modalTitle').innerText = "Chi tiết mẫu kiểm";
                        document.getElementById('modalName').innerText = info.event.title;
                        document.getElementById('modalDate').innerText = info.event.start.toLocaleDateString('vi-VN');
                        modal.style.display = 'flex';
                    }
                }
            });
            calendar.render();
        }

        fetchData();
    });

    // --- 4. HÀM CẬP NHẬT DANH SÁCH MẪU TRONG NGÀY ---
    function updateTodayList(events) {
        const listContainer = document.getElementById('today-sample-list');
        if (!listContainer) return;

        // Lấy ngày hiện tại định dạng YYYY-MM-DD
        const now = new Date();
        const todayStr = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0');

        const todayEvents = events.filter(e => e.start === todayStr);

        if (todayEvents.length === 0) {
            listContainer.innerHTML = `<p style="padding: 15px; color: var(--text-sub);">🎉 Hôm nay chưa có lịch kiểm mẫu.</p>`;
            return;
        }

        listContainer.innerHTML = todayEvents.map((event, index) => {
            // Kiểm tra trạng thái đã hoàn thành từ dữ liệu ẩn (extendedProps)
            const isDone = event.extendedProps && event.extendedProps.status === "Hoàn thành";
            
            return `
                <div class="sample-item">
                    <div class="sample-info">
                        <span class="sample-name" title="${event.title}">${event.title}</span>
                        <span class="sample-status" id="status-${index}" style="color: ${isDone ? '#4ade80' : ''}">
                            ${isDone ? '✓ Đã hoàn thành' : '● Đang chờ xử lý'}
                        </span>
                    </div>
                    <button class="nav-btn" 
                            id="btn-${index}"
                            style="${isDone ? 'border:1px solid #4ade80; color:#4ade80; background:transparent;' : 'padding: 5px 10px; font-size: 11px;'}" 
                            ${isDone ? 'disabled' : ''}
                            onclick="completeTask(${index}, '${event.title.replace(/'/g, "\\'")}')">
                        ${isDone ? 'Xong' : 'Bắt đầu'}
                    </button>
                </div>
            `;
        }).join('');
    }

    // --- 5. HÀM XỬ LÝ HOÀN THÀNH (LƯU VỀ SHEETS) ---
    window.completeTask = async function(index, title) {
        const statusEl = document.getElementById(`status-${index}`);
        const btnEl = document.getElementById(`btn-${index}`);

        // Hiệu ứng chờ (Loading)
        btnEl.innerText = "Đang lưu...";
        btnEl.disabled = true;

        try {
            const response = await fetch(`${WEB_APP_URL}?action=updateStatus&name=${encodeURIComponent(title)}`);
            const result = await response.json();

            if (result.success) {
                // Đổi giao diện khi lưu thành công
                statusEl.innerHTML = "✓ Đã hoàn thành";
                statusEl.style.color = "#4ade80";
                btnEl.innerText = "Xong";
                btnEl.style.border = "1px solid #4ade80";
                btnEl.style.color = "#4ade80";
                btnEl.style.background = "transparent";
                btnEl.disabled = true;
            } else {
                alert("Lỗi khi lưu: " + result.error);
                btnEl.innerText = "Thử lại";
                btnEl.disabled = false;
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            btnEl.innerText = "Lỗi kết nối";
            btnEl.disabled = false;
        }
    };

    // --- 6. CÁC HÀM TIỆN ÍCH ---
    window.closeModal = () => {
        const modal = document.getElementById('sampleModal');
        if (modal) modal.style.display = 'none';
    };

    window.onclick = (event) => {
        const modal = document.getElementById('sampleModal');
        if (event.target == modal) modal.style.display = 'none';
    };

    async function fetchData() {
        try {
            const response = await fetch(WEB_APP_URL + "?action=getData");
            const res = await response.json();
            
            const updateText = (id, text) => {
                const el = document.getElementById(id);
                if (el) el.innerText = text;
            };

            updateText('stat-orders', res.totalOrders);
            updateText('stat-batches', res.activeBatches);
            updateText('stat-assets', res.activeAssets);

            const tbody = document.querySelector('#dataTable tbody');
            if (tbody && res.recentLogs) {
                tbody.innerHTML = res.recentLogs.map(row => `
                    <tr>
                        <td>${row.date}</td>
                        <td><strong>${row.id}</strong></td>
                        <td><span class="status-tag">${row.status}</span></td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.log("Hệ thống đang kết nối dữ liệu...");
        }
    }
})();
