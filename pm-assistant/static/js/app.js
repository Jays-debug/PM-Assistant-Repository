// Global state variables
let locationChartInstance = null;
let currentLocationsList = [];
let carsList = [];

// Calendar state variables
let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
let allPlansList = []; // Cache of plans for calendar usage
let selectedDateStr = new Date().toISOString().split('T')[0];
let serviceTypeFilters = { dashboard: "total", pm: "total", calendar: "total", locations: "total" };
let pmRawPlansCache = [];
let pmFilteredPlansCache = [];
let selectedPlanIds = new Set();
let bulkSelectionMode = false;

const thaiMonthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// Initialize application on load
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initFormListeners();
    initLocationDropdowns();
    loadMyToday();
    loadDashboardData();
    fetchLocations();
    fetchCars();
    loadSettings();
    
    // Set tomorrow date label in Next-Day Tracking tab
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("tomorrow-date-str").innerText = tomorrow.toLocaleDateString('th-TH', options);
});

// Toast notification helper
function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    
    toastMessage.innerText = message;
    toast.style.borderColor = isError ? "var(--danger)" : "var(--primary)";
    toastMessage.style.color = isError ? "#f87171" : "#f8fafc";
    
    toast.style.transform = "translateY(0)";
    
    setTimeout(() => {
        toast.style.transform = "translateY(150%)";
    }, 4000);
}

// 1. Navigation Controller
function initNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".page-section");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const target = item.getAttribute("data-target");

            // Update active menu link
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");

            // Update visible section
            sections.forEach(section => {
                section.classList.remove("active-page");
                if (section.id === target) {
                    section.classList.add("active-page");
                }
            });

            // Reload data for the specific section
            if (target === "my-today") {
                loadMyToday();
            } else if (target === "dashboard") {
                loadDashboardData();
            } else if (target === "pm-manager") {
                fetchPlans();
            } else if (target === "weekly-control") {
                initWeeklyMonth(); loadWeeklyControl();
            } else if (target === "calendar-view") {
                loadCalendarPlans();
            } else if (target === "next-day") {
                fetchNextDayPlans();
            } else if (target === "locations-page") {
                fetchLocations();
            } else if (target === "assistant-center") {
                openAssistantTab('quick');
                showHandbookChapter('daily');
                restoreTrainingProgress();
            } else if (target === "settings") {
                loadSettings();
            } else if (target === "line-debug") {
                refreshLineDebugCenter();
            }
        });
    });
}

// 2. Form control behaviors (e.g. showing actual date when completed)
function initFormListeners() {
    const statusSelect = document.getElementById("form-status");
    const actualDateContainer = document.getElementById("actual-date-container");
    
    statusSelect.addEventListener("change", () => {
        if (statusSelect.value === "Completed") {
            actualDateContainer.style.display = "block";
            // Auto fill with today if empty
            const actualDateInput = document.getElementById("form-actual-date");
            if (!actualDateInput.value) {
                actualDateInput.value = new Date().toISOString().split('T')[0];
            }
        } else {
            actualDateContainer.style.display = "none";
        }
    });

    // Auto set deadline date to plan date when plan date changes and deadline is empty
    const plannedDateInput = document.getElementById("form-planned-date");
    const deadlineInput = document.getElementById("form-deadline-date");
    plannedDateInput.addEventListener("change", () => {
        if (!deadlineInput.value) {
            deadlineInput.value = plannedDateInput.value;
        }
    });

    const vehicleInput = document.getElementById("form-vehicle-no");
    if (vehicleInput) {
        vehicleInput.addEventListener("input", updateSelectedCarInfo);
        vehicleInput.addEventListener("change", updateSelectedCarInfo);
    }
}

function getSelectedCarFromInput() {
    const raw = document.getElementById("form-vehicle-no").value || "";
    const carNo = raw.split(" | ")[0].trim();
    return carsList.find(c => c.car_no === carNo) || null;
}

function updateSelectedCarInfo() {
    const box = document.getElementById("selected-car-info");
    if (!box) return;
    const car = getSelectedCarFromInput();
    if (!car) {
        box.innerHTML = "พิมพ์หรือเลือกเบอร์รถ ระบบจะแสดง รุ่นรถ / ประเภทธุรกิจ / ประจำคลัง เพื่อช่วยตรวจสอบก่อนบันทึก";
        box.classList.remove("active");
        return;
    }
    box.classList.add("active");
    box.innerHTML = `
        <div><b>เบอร์รถ:</b> ${car.car_no} <b>รหัส:</b> ${car.code || "-"}</div>
        <div><b>รุ่นรถ:</b> ${car.model || "-"} | <b>ประเภทรถ:</b> ${car.vehicle_type || "-"}</div>
        <div><b>ประเภทธุรกิจ:</b> ${car.type || "-"} | <b>ประจำคลัง/Fleet:</b> ${car.fleet || "-"}</div>
    `;
}


function getLocationServiceType(locationName) {
    const loc = currentLocationsList.find(l => l.name === locationName);
    return loc ? (loc.service_type || "external") : "external";
}

function matchServiceTypeByLocation(locationName, filterKey) {
    if (!filterKey || filterKey === "total") return true;
    return getLocationServiceType(locationName) === filterKey;
}

function setServiceTypeFilter(scope, value) {
    serviceTypeFilters[scope] = value || "total";
    const wrapper = document.getElementById(`${scope}-service-filter`);
    if (wrapper) {
        wrapper.querySelectorAll(".filter-pill").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.filter === serviceTypeFilters[scope]);
        });
    }
    if (scope === "dashboard") loadDashboardData();
    if (scope === "pm") applyPlanFilters();
    if (scope === "calendar") { renderCalendar(); displaySelectedDatePlans(); renderCalendarInsights(); }
    if (scope === "locations") renderLocationsTable();
}

function filterPlansByServiceType(plans, scope) {
    const filterKey = serviceTypeFilters[scope] || "total";
    let result = plans;
    if (filterKey !== "total") result = result.filter(plan => matchServiceTypeByLocation(plan.location, filterKey));
    if (scope === "calendar") {
        const jobVal = normalizeFilterValue(document.getElementById("calendar-job-filter")?.value);
        if (jobVal) result = result.filter(plan => normalizeFilterValue(plan.job_title) === jobVal);
    }
    return result;
}

// 3. Dashboard functions
async function loadDashboardData() {
    try {
        if (!currentLocationsList || currentLocationsList.length === 0) {
            try {
                const locRes = await fetch("/api/locations");
                if (locRes.ok) currentLocationsList = await locRes.json();
            } catch (_) {}
        }
        const response = await fetch("/api/summary");
        if (!response.ok) throw new Error("Failed to fetch summary data");
        const data = await response.json();
        
        // Populate stats cards
        document.getElementById("stat-total-vehicles").innerText = data.total_vehicles;
        document.getElementById("stat-planned-plans").innerText = data.planned + data.in_progress;
        document.getElementById("stat-near-due").innerText = data.near_due;
        document.getElementById("stat-overdue").innerText = data.overdue;
        document.getElementById("stat-due-today").innerText = data.due_today ?? 0;
        document.getElementById("stat-this-month").innerText = data.this_month ?? 0;
        document.getElementById("stat-completion-rate").innerText = `${data.completion_rate ?? 0}%`;
        document.getElementById("stat-tomorrow").innerText = data.tomorrow_plans ?? 0;
        renderSummaryChips("service-type-summary", data.service_type_stats || {}, { internal: "ศูนย์ซ่อมภายใน", external: "ศูนย์ซ่อมภายนอก" });
        renderSummaryChips("transport-summary", data.transport_stats || {});
        populateDashboardJobFilter(data.job_stats || {});
        const dashboardJob = normalizeFilterValue(document.getElementById("dashboard-job-filter")?.value);
        const jobStats = data.job_stats || {};
        renderSummaryChips("job-title-summary", dashboardJob ? { [dashboardJob]: jobStats[dashboardJob] || 0 } : jobStats);

        // Render chart by service type filter
        const chartFilter = serviceTypeFilters.dashboard || "total";
        const filteredLocationStats = {};
        Object.entries(data.location_stats || {}).forEach(([locName, count]) => {
            if (chartFilter === "total" || matchServiceTypeByLocation(locName, chartFilter)) {
                filteredLocationStats[locName] = count;
            }
        });
        renderLocationChart(filteredLocationStats);

        // Populate urgent alert notification items
        populateUrgentList(data.upcoming_list, data.overdue);
        
    } catch (error) {
        console.error("Error loading dashboard stats:", error);
        showToast("ไม่สามารถโหลดข้อมูลภาพรวม Dashboard ได้", true);
    }
}

function populateDashboardJobFilter(jobStats) {
    const select = document.getElementById("dashboard-job-filter");
    if (!select) return;
    const current = select.value;
    const values = Object.keys(jobStats || {}).sort((a, b) => a.localeCompare(b, 'th'));
    select.innerHTML = `<option value="">-- ชื่องาน PM ทั้งหมด --</option>`;
    values.forEach(value => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = value.length > 46 ? value.slice(0, 43) + "..." : value;
        opt.title = value;
        select.appendChild(opt);
    });
    if (values.includes(current)) select.value = current;
}

function renderSummaryChips(containerId, stats, labelMap = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const entries = Object.entries(stats).filter(([_, v]) => Number(v) > 0);
    if (entries.length === 0) {
        el.innerHTML = `<div style="color: var(--text-muted); font-size:0.9rem;">ยังไม่มีข้อมูลสรุป</div>`;
        return;
    }
    el.innerHTML = entries.map(([k, v]) => `
        <div class="summary-chip">
            <span>${labelMap[k] || k}</span>
            <b>${v}</b>
        </div>
    `).join("");
}

function renderLocationChart(locationStats) {
    const ctx = document.getElementById("locationChart").getContext("2d");
    
    const labels = Object.keys(locationStats);
    const dataValues = Object.values(locationStats);
    
    if (locationChartInstance) {
        locationChartInstance.destroy();
    }

    if (labels.length === 0) {
        return;
    }
    
    locationChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนรถแผน PM (คัน)',
                data: dataValues,
                backgroundColor: [
                    'rgba(139, 92, 246, 0.65)',
                    'rgba(6, 182, 212, 0.65)',
                    'rgba(16, 185, 129, 0.65)',
                    'rgba(245, 158, 11, 0.65)',
                    'rgba(239, 68, 68, 0.65)'
                ],
                borderColor: [
                    '#8b5cf6',
                    '#06b6d4',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 1.5,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Sarabun'
                        }
                    }
                }
            }
        }
    });
}

function populateUrgentList(upcomingPlans, overdueCount) {
    const listContainer = document.getElementById("urgent-list");
    listContainer.innerHTML = "";

    if (upcomingPlans.length === 0) {
        listContainer.innerHTML = `
            <div class="notify-item info" style="justify-content: center;">
                <p style="color: var(--text-muted);">ไม่มีรายการเร่งด่วนในขณะนี้</p>
            </div>
        `;
        return;
    }

    upcomingPlans.forEach(plan => {
        let itemClass = "warning";
        let icon = "⏰";
        
        if (plan.status === "Overdue") {
            itemClass = "urgent";
            icon = "⚠️";
        }

        const planDateFormatted = new Date(plan.planned_date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const deadlineDateFormatted = new Date(plan.deadline_date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const item = document.createElement("div");
        item.className = `notify-item ${itemClass}`;
        item.innerHTML = `
            <div class="notify-icon-container">${icon}</div>
            <div class="notify-details">
                <h4>ทะเบียน/เบอร์: ${plan.vehicle_no.split(" | ")[0]} - ${plan.job_title}</h4>
                <p>สถานที่: ${plan.location} | นัดเข้า: ${planDateFormatted}</p>
                <p style="font-size: 0.75rem; color: ${plan.status === 'Overdue' ? '#f87171' : 'var(--text-muted)'}; margin-top: 0.15rem;">
                    Deadline: ${deadlineDateFormatted} (${plan.status})
                </p>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// 4. PM Manager - CRUD Plans
async function fetchPlans() {
    const searchVal = document.getElementById("search-input").value;
    const statusVal = document.getElementById("status-filter").value;
    selectedPlanIds.clear();
    updateBulkDeleteButton();
    syncBulkSelectionUI();
    const selectAll = document.getElementById("select-all-plans");
    if (selectAll) selectAll.checked = false;
    
    let url = "/api/plans?";
    if (searchVal) url += `search=${encodeURIComponent(searchVal)}&`;
    if (statusVal) url += `status=${encodeURIComponent(statusVal)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch plans");
        pmRawPlansCache = await response.json();
        populatePlanDynamicFilters(pmRawPlansCache);
        applyPlanFilters();

    } catch (error) {
        console.error("Error fetching plans:", error);
        showToast("ไม่สามารถเรียกดูข้อมูลแผน PM ได้", true);
    }
}

function normalizeFilterValue(value) {
    return (value || "").toString().trim();
}

function getVehicleDetailKey(plan) {
    return [plan.vehicle_model, plan.transport_type, plan.fleet, plan.vehicle_type]
        .map(normalizeFilterValue)
        .filter(Boolean)
        .join(" | ") || "ไม่ระบุรายละเอียดรถ";
}

function getJobDetailKey(plan) {
    return [plan.job_title, plan.description]
        .map(normalizeFilterValue)
        .filter(Boolean)
        .join(" | ") || "ไม่ระบุชื่องาน";
}

function populateSelectOptions(selectId, values, allLabel) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const current = select.value;
    const uniqueValues = Array.from(new Set(values.map(normalizeFilterValue).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'th'));
    select.innerHTML = `<option value="">${allLabel}</option>`;
    uniqueValues.forEach(value => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = value.length > 60 ? value.slice(0, 57) + "..." : value;
        opt.title = value;
        select.appendChild(opt);
    });
    if (uniqueValues.includes(current)) select.value = current;
}

function populatePlanDynamicFilters(plans) {
    populateSelectOptions("vehicle-detail-filter", plans.map(getVehicleDetailKey), "-- รายละเอียดรถทั้งหมด --");
    populateSelectOptions("location-filter", plans.map(p => p.location), "-- สถานที่นัดเข้าทั้งหมด --");
    populateSelectOptions("job-filter", plans.map(p => p.job_title), "-- ชื่องาน PM ทั้งหมด --");
    populateSelectOptions("calendar-job-filter", plans.map(p => p.job_title), "-- ชื่องาน PM ทั้งหมด --");
}

function applyPlanFilters() {
    const vehicleDetailVal = normalizeFilterValue(document.getElementById("vehicle-detail-filter")?.value);
    const locationVal = normalizeFilterValue(document.getElementById("location-filter")?.value);
    const jobVal = normalizeFilterValue(document.getElementById("job-filter")?.value);
    const dayVal = parseInt(document.getElementById("plan-day-filter")?.value || "",10);
    const monthVal = parseInt(document.getElementById("plan-month-filter")?.value || "",10);
    let yearVal = parseInt(document.getElementById("plan-year-filter")?.value || "",10);
    if (yearVal > 2400) yearVal -= 543;

    let plans = filterPlansByServiceType(pmRawPlansCache, "pm");
    if (dayVal || monthVal || yearVal) plans = plans.filter(plan => {
        if (!plan.planned_date) return false;
        const d = new Date(plan.planned_date + 'T00:00:00');
        return (!dayVal || d.getDate()===dayVal) && (!monthVal || d.getMonth()+1===monthVal) && (!yearVal || d.getFullYear()===yearVal);
    });
    if (vehicleDetailVal) plans = plans.filter(plan => getVehicleDetailKey(plan) === vehicleDetailVal);
    if (locationVal) plans = plans.filter(plan => normalizeFilterValue(plan.location) === locationVal);
    if (jobVal) plans = plans.filter(plan => normalizeFilterValue(plan.job_title) === jobVal);

    pmFilteredPlansCache = plans;
    selectedPlanIds.clear();
    renderPlansTable(plans);
    updateBulkDeleteButton();
}

function renderPlansTable(plans) {
    const tbody = document.getElementById("plans-table-body");
    tbody.innerHTML = "";

    if (plans.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    ไม่พบข้อมูลแผนซ่อมบำรุงที่ค้นหา
                </td>
            </tr>
        `;
        const selectAll = document.getElementById("select-all-plans");
        if (selectAll) selectAll.checked = false;
        return;
    }

    plans.forEach(plan => {
        const planDate = new Date(plan.planned_date).toLocaleDateString('th-TH');
        const actualDate = plan.actual_date ? new Date(plan.actual_date).toLocaleDateString('th-TH') : "-";
        const deadlineDate = new Date(plan.deadline_date).toLocaleDateString('th-TH');
        const statusClass = plan.status.toLowerCase().replace(" ", "_");
        const displayVehicleNo = plan.vehicle_no.split(" | ")[0];

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="select-col"><input type="checkbox" class="pm-row-checkbox" data-id="${plan.id}" onchange="togglePlanSelection(${plan.id}, this.checked)"></td>
            <td style="font-weight: 600; color: #fff;">
                <span title="${plan.vehicle_no}">${displayVehicleNo}</span>
            </td>
            <td>
                <div style="font-size:0.78rem; color:var(--text-primary);">${plan.vehicle_model || "-"}</div>
                <div style="font-size:0.72rem; color:var(--text-secondary);">${plan.transport_type || "ไม่ระบุธุรกิจ"}</div>
                <div style="font-size:0.72rem; color:var(--text-muted);">${plan.fleet || "-"}</div>
            </td>
            <td>
                <div style="font-weight: 500;">${plan.job_title}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${plan.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                </div>
            </td>
            <td><span style="font-size: 0.85rem; background: rgba(255,255,255,0.03); padding: 0.25rem 0.5rem; border-radius: var(--border-radius-sm); border: 1px solid var(--panel-border);">${plan.location}</span></td>
            <td>${planDate}</td>
            <td>${actualDate}</td>
            <td>${deadlineDate}</td>
            <td><span class="badge badge-${statusClass}">${plan.status}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="openEditPlanModal(${JSON.stringify(plan).replace(/"/g, '&quot;')})">แก้ไข</button>
                    <button class="btn btn-danger" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="deletePlan(${plan.id})">ลบ</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const selectAll = document.getElementById("select-all-plans");
    if (selectAll) selectAll.checked = false;
    syncBulkSelectionUI();
}

function toggleBulkSelectionMode() {
    bulkSelectionMode = !bulkSelectionMode;
    selectedPlanIds.clear();
    document.querySelectorAll(".pm-row-checkbox").forEach(cb => cb.checked = false);
    const selectAll = document.getElementById("select-all-plans");
    if (selectAll) selectAll.checked = false;
    syncBulkSelectionUI();
    updateBulkDeleteButton();
}

function syncBulkSelectionUI() {
    const table = document.getElementById("plans-table");
    if (table) table.classList.toggle("bulk-mode", bulkSelectionMode);
    const btn = document.getElementById("toggle-bulk-mode-btn");
    if (btn) {
        btn.classList.toggle("active", bulkSelectionMode);
        btn.title = bulkSelectionMode ? "ปิดโหมดเลือกหลายรายการ" : "เปิดโหมดเลือกหลายรายการ";
    }
}

function togglePlanSelection(id, checked) {
    if (checked) selectedPlanIds.add(id);
    else selectedPlanIds.delete(id);
    updateBulkDeleteButton();
}

function toggleSelectAllPlans(master) {
    selectedPlanIds.clear();
    document.querySelectorAll(".pm-row-checkbox").forEach(cb => {
        cb.checked = master.checked;
        if (master.checked) selectedPlanIds.add(Number(cb.dataset.id));
    });
    updateBulkDeleteButton();
}

function updateBulkDeleteButton() {
    const btn = document.getElementById("bulk-delete-btn");
    if (!btn) return;
    const count = selectedPlanIds.size;
    btn.disabled = count === 0 || !bulkSelectionMode;
    btn.textContent = bulkSelectionMode ? `ลบที่เลือก (${count})` : `ลบหลายรายการ`;
}

async function deleteSelectedPlans() {
    const ids = Array.from(selectedPlanIds);
    if (ids.length === 0) return;
    if (!confirm(`ต้องการลบแผนงาน PM ที่เลือกทั้งหมด ${ids.length} รายการใช่หรือไม่?`)) return;

    try {
        const response = await fetch("/api/plans/bulk-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids })
        });
        if (!response.ok) throw new Error("Failed to bulk delete plans");
        const result = await response.json();
        showToast(`ลบแผนงาน PM เรียบร้อย ${result.deleted_count || ids.length} รายการ`);
        selectedPlanIds.clear();
        fetchPlans();
        loadDashboardData();
        loadCalendarPlans();
    } catch (error) {
        console.error("Error bulk deleting plans:", error);
        showToast("ไม่สามารถลบแผนงานที่เลือกได้", true);
    }
}

// Modal open/close actions
function openAddPlanModal() {
    document.getElementById("modal-title").innerText = "สร้างแผนงาน PM ใหม่";
    document.getElementById("plan-form").reset();
    document.getElementById("plan-id").value = "";
    document.getElementById("actual-date-container").style.display = "none";
    
    populateLocationsDropdown();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("form-planned-date").value = today;
    document.getElementById("form-deadline-date").value = today;
    document.getElementById("form-status").value = "Planned";

    updateSelectedCarInfo();
    updateSelectedCarInfo();
    document.getElementById("plan-modal").classList.add("active");
}

function openEditPlanModal(plan) {
    document.getElementById("modal-title").innerText = `แก้ไขแผนงาน PM: ${plan.vehicle_no.split(" | ")[0]}`;
    document.getElementById("plan-id").value = plan.id;
    document.getElementById("form-vehicle-no").value = plan.vehicle_no;
    document.getElementById("form-job-title").value = plan.job_title;
    document.getElementById("form-description").value = plan.description || "";
    document.getElementById("form-planned-date").value = plan.planned_date;
    document.getElementById("form-deadline-date").value = plan.deadline_date;
    document.getElementById("form-status").value = plan.status;

    populateLocationsDropdown(plan.location);

    if (plan.status === "Completed") {
        document.getElementById("actual-date-container").style.display = "block";
        document.getElementById("form-actual-date").value = plan.actual_date || "";
    } else {
        document.getElementById("actual-date-container").style.display = "none";
        document.getElementById("form-actual-date").value = "";
    }

    document.getElementById("plan-modal").classList.add("active");
}

function closePlanModal() {
    document.getElementById("plan-modal").classList.remove("active");
}

function triggerFormSubmit() {
    document.getElementById("hidden-submit-btn").click();
}

async function savePlan(event) {
    event.preventDefault();

    const planId = document.getElementById("plan-id").value;
    const vehicle_no = document.getElementById("form-vehicle-no").value;
    const job_title = document.getElementById("form-job-title").value;
    const description = document.getElementById("form-description").value;
    const planned_date = document.getElementById("form-planned-date").value;
    const deadline_date = document.getElementById("form-deadline-date").value;
    const location = document.getElementById("form-location").value;
    const status = document.getElementById("form-status").value;
    const actual_date = status === "Completed" ? (document.getElementById("form-actual-date").value || null) : null;
    const selectedCar = getSelectedCarFromInput();

    const payload = {
        vehicle_no,
        job_title,
        description,
        planned_date,
        deadline_date,
        location,
        vehicle_code: selectedCar ? selectedCar.code : null,
        vehicle_model: selectedCar ? selectedCar.model : null,
        transport_type: selectedCar ? selectedCar.type : null,
        fleet: selectedCar ? selectedCar.fleet : null,
        vehicle_type: selectedCar ? selectedCar.vehicle_type : null,
        status,
        actual_date
    };

    const isEdit = !!planId;
    const url = isEdit ? `/api/plans/${planId}` : "/api/plans";
    const method = isEdit ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Failed to save plan");
        
        showToast(isEdit ? "แก้ไขข้อมูลแผนงานสำเร็จแล้ว" : "สร้างแผนงานซ่อมบำรุงใหม่เรียบร้อยแล้ว");
        closePlanModal();
        
        const activeSection = document.querySelector(".page-section.active-page").id;
        if (activeSection === "dashboard") loadDashboardData();
        else if (activeSection === "pm-manager") fetchPlans();
        else if (activeSection === "calendar-view") loadCalendarPlans();
        
    } catch (error) {
        console.error("Error saving plan:", error);
        showToast("ไม่สามารถบันทึกข้อมูลแผนงานได้ กรุณาตรวจสอบข้อมูล", true);
    }
}

async function deletePlan(id) {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบแผนงาน PM นี้ออกจากระบบ?")) return;

    try {
        const response = await fetch(`/api/plans/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete plan");
        
        showToast("ลบข้อมูลแผนงาน PM เรียบร้อยแล้ว");
        
        const activeSection = document.querySelector(".page-section.active-page").id;
        if (activeSection === "pm-manager") fetchPlans();
        else if (activeSection === "calendar-view") loadCalendarPlans();
    } catch (error) {
        console.error("Error deleting plan:", error);
        showToast("ไม่สามารถลบแผนงานได้", true);
    }
}

// 5. Next Day Tracking functions
async function fetchNextDayPlans() {
    try {
        const response = await fetch("/api/plans?next_day_only=true");
        if (!response.ok) throw new Error("Failed to fetch next day plans");
        const plans = await response.json();
        
        const tbody = document.getElementById("nextday-table-body");
        tbody.innerHTML = "";

        if (plans.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        🎉 ไม่มีรถลงแผนเข้าซ่อมบำรุงในวันพรุ่งนี้
                    </td>
                </tr>
            `;
            return;
        }

        plans.forEach(plan => {
            const planDate = new Date(plan.planned_date).toLocaleDateString('th-TH');
            const deadlineDate = new Date(plan.deadline_date).toLocaleDateString('th-TH');
            const statusClass = plan.status.toLowerCase().replace(" ", "_");

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 600; color: #fff;">${plan.vehicle_no.split(" | ")[0]}</td>
                <td>
                    <div style="font-weight: 500;">${plan.job_title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                        ${plan.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </div>
                </td>
                <td><span style="font-size: 0.85rem; background: rgba(255,255,255,0.03); padding: 0.25rem 0.5rem; border-radius: var(--border-radius-sm); border: 1px solid var(--panel-border);">${plan.location}</span></td>
                <td>${planDate}</td>
                <td>${deadlineDate}</td>
                <td><span class="badge badge-${statusClass}">${plan.status}</span></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error fetching next day plans:", error);
        showToast("ไม่สามารถดึงข้อมูลติดตามรถวันถัดไปได้", true);
    }
}

async function sendNextDayLine() {
    const btn = document.getElementById("send-nextday-line-btn");
    btn.disabled = true;
    btn.innerText = "กำลังส่งข้อมูลรายงานเข้าไลน์...";
    
    try {
        const response = await fetch("/api/settings/trigger-daily", { method: "POST" });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Failed to trigger report");
        }
        showToast("ส่งรายงานสรุปยอดแผนงาน PM และสถานะรถเข้า Line เรียบร้อยแล้ว 🔔");
    } catch (error) {
        console.error("Error sending daily report:", error);
        showToast(`ส่งไลน์ไม่สำเร็จ: ${error.message}`, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> ส่งแจ้งเตือนสรุปรายวันเข้าไลน์ทันที`;
    }
}

// 6. Settings Page Functions
async function loadSettings() {
    try {
        const response = await fetch("/api/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const settings = await response.json();
        
        document.getElementById("line-token").value = settings.line_channel_access_token;
        document.getElementById("line-target").value = settings.line_target_id;
        const secretEl = document.getElementById("line-secret");
        if (secretEl) secretEl.value = settings.line_channel_secret || "";
        const webhookEnabledEl = document.getElementById("line-webhook-enabled");
        if (webhookEnabledEl) webhookEnabledEl.checked = settings.line_webhook_enabled !== false;
        const webhookUrlEl = document.getElementById("line-webhook-url");
        if (webhookUrlEl) webhookUrlEl.value = `${window.location.origin}/line/webhook`;
        loadLineTargets();
        document.getElementById("scheduler-time").value = settings.scheduler_time;
        document.getElementById("alert-days").value = settings.alert_days_before;
        document.getElementById("scheduler-enabled").checked = settings.scheduler_enabled;
        const nt = document.getElementById("notification-template");
        if (nt) nt.value = settings.notification_template || "";
        const dbg = document.getElementById("debug-mode");
        if (dbg) dbg.checked = settings.debug_mode === true;
        const setVal=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??'';};
        const setChk=(id,v)=>{const e=document.getElementById(id);if(e)e.checked=!!v;};
        setVal('report-morning-time',settings.report_morning_time||'07:30'); setChk('report-morning-enabled',settings.report_morning_enabled!==false);
        setVal('report-noon-time',settings.report_noon_time||'12:00'); setChk('report-noon-enabled',settings.report_noon_enabled!==false);
        setVal('report-evening-time',settings.report_evening_time||'17:00'); setChk('report-evening-enabled',settings.report_evening_enabled!==false);
        
    } catch (error) {
        console.error("Error loading settings:", error);
        showToast("ไม่สามารถโหลดข้อมูลการตั้งค่าได้", true);
    }
}

async function saveSettings() {
    const token = document.getElementById("line-token").value;
    const target = document.getElementById("line-target").value;
    const time = document.getElementById("scheduler-time").value;
    const secretEl = document.getElementById("line-secret");
    const webhookEnabledEl = document.getElementById("line-webhook-enabled");
    const days = parseInt(document.getElementById("alert-days").value) || 3;
    const enabled = document.getElementById("scheduler-enabled").checked;
    const notificationTemplate = document.getElementById("notification-template") ? document.getElementById("notification-template").value : "";

    const payload = {
        line_channel_access_token: token,
        line_target_id: target,
        line_channel_secret: secretEl ? secretEl.value : "",
        line_webhook_enabled: webhookEnabledEl ? webhookEnabledEl.checked : true,
        scheduler_time: time,
        alert_days_before: days,
        scheduler_enabled: enabled,
        notification_template: notificationTemplate,
        debug_mode: document.getElementById("debug-mode") ? document.getElementById("debug-mode").checked : false,
        report_morning_time: document.getElementById('report-morning-time')?.value || '07:30',
        report_noon_time: document.getElementById('report-noon-time')?.value || '12:00',
        report_evening_time: document.getElementById('report-evening-time')?.value || '17:00',
        report_morning_enabled: document.getElementById('report-morning-enabled')?.checked ?? true,
        report_noon_enabled: document.getElementById('report-noon-enabled')?.checked ?? true,
        report_evening_enabled: document.getElementById('report-evening-enabled')?.checked ?? true
    };

    try {
        const response = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error("Failed to save settings");
        if (data.validation && data.validation.ok === false) {
            showToast("บันทึกแล้ว แต่ Config Validator พบจุดต้องตรวจสอบ", true);
        } else {
            showToast("บันทึกการตั้งค่าระบบเรียบร้อยแล้ว");
        }
        refreshLineDebugCenter();
        
    } catch (error) {
        console.error("Error saving settings:", error);
        showToast("ล้มเหลวในการบันทึกการตั้งค่า", true);
    }
}

async function sendTestLineMessage() {
    const token = document.getElementById("line-token").value;
    const target = document.getElementById("line-target").value;
    
    if (!token || !target) {
        showToast("กรุณากรอก Token และ Target ID ก่อนกดทดสอบ", true);
        return;
    }

    const payload = {
        token: token,
        target_id: target,
        message: "👋 สวัสดีครับ! นี่คือข้อความทดสอบเชื่อมต่อระบบแจ้งเตือน PM Vehicle Tracking \nการเชื่อมต่อ API ของท่านใช้งานได้ปกติเรียบร้อยดีครับ"
    };

    try {
        const response = await fetch("/api/settings/test-line", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        renderLineDebugResult(data);
        if (!data.success) {
            throw new Error((data.analysis && data.analysis.reason ? data.analysis.reason + " - " + data.analysis.suggestion : data.response_text) || "Failed test sending");
        }
        showToast("ส่งข้อความทดสอบเข้า Line เรียบร้อยแล้ว! กรุณาตรวจสอบห้องแชทของคุณ");
    } catch (error) {
        console.error("Error sending test message:", error);
        showToast(`ล้มเหลวในการส่งข้อความทดสอบ: ${error.message}`, true);
    }
}


async function loadLineTargets() {
    const box = document.getElementById("line-targets-container");
    if (!box) return;
    try {
        const response = await fetch("/api/line/targets");
        if (!response.ok) throw new Error("โหลดรายการ LINE Target ไม่สำเร็จ");
        const targets = await response.json();
        if (!targets.length) {
            box.innerHTML = `<span style="color:var(--text-muted);font-size:0.85rem;">ยังไม่พบ Target ให้พิมพ์ <b>test</b> ในกลุ่ม LINE ที่มีบอทอยู่ แล้วกดรีเฟรช</span>`;
            return;
        }
        box.innerHTML = targets.map(t => {
            const label = t.display_name || `${t.source_type} ${t.source_id.slice(-6)}`;
            const typeText = t.source_type === "group" ? "กลุ่ม" : (t.source_type === "user" ? "ผู้ใช้" : t.source_type);
            return `<span class="location-tag" style="display:inline-flex;align-items:center;gap:0.5rem;">
                <b>${label}</b>
                <small>${typeText}</small>
                <small style="opacity:.7;">${t.source_id}</small>
                <button class="tag-close" title="ใช้ Target นี้" onclick="useLineTarget('${t.source_id}')">ใช้</button>
            </span>`;
        }).join("");
    } catch (error) {
        console.error("Error loading line targets:", error);
        box.innerHTML = `<span style="color:var(--danger);font-size:0.85rem;">โหลด LINE Targets ไม่สำเร็จ</span>`;
    }
}

async function useLineTarget(targetId) {
    try {
        const response = await fetch("/api/line/targets/use", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target_id: targetId })
        });
        if (!response.ok) throw new Error("เลือก Target ไม่สำเร็จ");
        document.getElementById("line-target").value = targetId;
        showToast("เลือก LINE Target สำหรับส่งแจ้งเตือนแล้ว");
    } catch (error) {
        showToast(error.message, true);
    }
}

function copyWebhookUrl() {
    const el = document.getElementById("line-webhook-url");
    if (!el) return;
    el.select();
    el.setSelectionRange(0, 99999);
    navigator.clipboard?.writeText(el.value).then(() => showToast("Copy Webhook URL แล้ว"));
}

// Location management helpers
async function fetchLocations() {
    try {
        const response = await fetch("/api/locations");
        if (!response.ok) throw new Error("Failed to fetch locations");
        currentLocationsList = await response.json();
        renderLocationTags();
        renderLocationsTable();
        if (document.querySelector(".page-section.active-page")?.id === "dashboard") loadDashboardData();
        if (document.querySelector(".page-section.active-page")?.id === "calendar-view") { renderCalendar(); displaySelectedDatePlans(); renderCalendarInsights(); }
    } catch (error) {
        console.error("Error fetching locations:", error);
    }
}

function renderLocationTags() {
    const container = document.getElementById("location-tags-container");
    container.innerHTML = "";

    if (currentLocationsList.length === 0) {
        container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">ยังไม่มีรายชื่อศูนย์บริการ</span>`;
        return;
    }

    currentLocationsList.forEach(loc => {
        const tag = document.createElement("span");
        tag.className = "loc-tag";
        tag.innerHTML = `
            ${loc.name} <small>${loc.service_type === "internal" ? "ซ่อมใน" : "ซ่อมนอก"}</small>
            <button class="loc-tag-remove" onclick="deleteLocation(${loc.id})">&times;</button>
        `;
        container.appendChild(tag);
    });
}

function populateLocationsDropdown(selectedValue = "") {
    const select = document.getElementById("form-location");
    select.innerHTML = "";

    if (currentLocationsList.length === 0) {
        select.innerHTML = `<option value="">-- กรุณาเพิ่มศูนย์บริการในการตั้งค่าก่อน --</option>`;
        return;
    }

    currentLocationsList.forEach(loc => {
        const option = document.createElement("option");
        option.value = loc.name;
        option.innerText = `${loc.name} (${loc.service_type === "internal" ? "ศูนย์ซ่อมภายใน" : "ศูนย์ซ่อมภายนอก"}${loc.province ? " / " + loc.province : ""})`;
        if (loc.name === selectedValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

async function addLocation() {
    const input = document.getElementById("new-location-input");
    const name = input.value.trim();

    if (!name) {
        showToast("กรุณากรอกชื่อศูนย์บริการ", true);
        return;
    }

    try {
        const response = await fetch("/api/locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Failed to add location");
        }

        input.value = "";
        showToast("เพิ่มศูนย์บริการเรียบร้อยแล้ว");
        fetchLocations();
        
    } catch (error) {
        console.error("Error adding location:", error);
        showToast(error.message, true);
    }
}


// Thai province / district dropdown data for Locations Master (v1.2.1)
const TH_PROVINCES = [
    "กรุงเทพมหานคร","กระบี่","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร","ขอนแก่น","จันทบุรี","ฉะเชิงเทรา","ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง","ตราด","ตาก","นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส","น่าน","บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา","พะเยา","พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์","แพร่","ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี","ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี","สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู","อ่างทอง","อำนาจเจริญ","อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี"
];

const TH_DISTRICTS = {
    "ชลบุรี": ["เมืองชลบุรี","บ้านบึง","หนองใหญ่","บางละมุง","พานทอง","พนัสนิคม","ศรีราชา","เกาะสีชัง","สัตหีบ","บ่อทอง","เกาะจันทร์"],
    "ระยอง": ["เมืองระยอง","บ้านฉาง","แกลง","วังจันทร์","บ้านค่าย","ปลวกแดง","เขาชะเมา","นิคมพัฒนา"],
    "ฉะเชิงเทรา": ["เมืองฉะเชิงเทรา","บางคล้า","บางน้ำเปรี้ยว","บางปะกง","บ้านโพธิ์","พนมสารคาม","ราชสาส์น","สนามชัยเขต","แปลงยาว","ท่าตะเกียบ","คลองเขื่อน"],
    "กรุงเทพมหานคร": ["คลองเตย","คลองสาน","คลองสามวา","คันนายาว","จตุจักร","จอมทอง","ดอนเมือง","ดินแดง","ดุสิต","ตลิ่งชัน","ทวีวัฒนา","ทุ่งครุ","บางกะปิ","บางขุนเทียน","บางเขน","บางคอแหลม","บางแค","บางซื่อ","บางนา","บางบอน","บางพลัด","บางรัก","บึงกุ่ม","ปทุมวัน","ประเวศ","ป้อมปราบศัตรูพ่าย","พญาไท","พระโขนง","พระนคร","ภาษีเจริญ","มีนบุรี","ยานนาวา","ราชเทวี","ราษฎร์บูรณะ","ลาดกระบัง","ลาดพร้าว","วังทองหลาง","วัฒนา","สวนหลวง","สะพานสูง","สัมพันธวงศ์","สาทร","สายไหม","หนองแขม","หนองจอก","หลักสี่","ห้วยขวาง"],
    "สมุทรปราการ": ["เมืองสมุทรปราการ","บางบ่อ","บางพลี","พระประแดง","พระสมุทรเจดีย์","บางเสาธง"],
    "สมุทรสาคร": ["เมืองสมุทรสาคร","กระทุ่มแบน","บ้านแพ้ว"],
    "สมุทรสงคราม": ["เมืองสมุทรสงคราม","บางคนที","อัมพวา"],
    "สระบุรี": ["เมืองสระบุรี","แก่งคอย","หนองแค","วิหารแดง","หนองแซง","บ้านหมอ","ดอนพุด","หนองโดน","พระพุทธบาท","เสาไห้","มวกเหล็ก","วังม่วง","เฉลิมพระเกียรติ"],
    "นครราชสีมา": ["เมืองนครราชสีมา","ครบุรี","เสิงสาง","คง","บ้านเหลื่อม","จักราช","โชคชัย","ด่านขุนทด","โนนไทย","โนนสูง","ขามสะแกแสง","บัวใหญ่","ประทาย","ปักธงชัย","พิมาย","ห้วยแถลง","ชุมพวง","สูงเนิน","ขามทะเลสอ","สีคิ้ว","ปากช่อง","หนองบุญมาก","แก้งสนามนาง","โนนแดง","วังน้ำเขียว","เทพารักษ์","เมืองยาง","พระทองคำ","ลำทะเมนชัย","บัวลาย","สีดา","เฉลิมพระเกียรติ"],
    "ขอนแก่น": ["เมืองขอนแก่น","บ้านฝาง","พระยืน","หนองเรือ","ชุมแพ","สีชมพู","น้ำพอง","อุบลรัตน์","กระนวน","บ้านไผ่","เปือยน้อย","พล","แวงใหญ่","แวงน้อย","หนองสองห้อง","ภูเวียง","มัญจาคีรี","ชนบท","เขาสวนกวาง","ภูผาม่าน","ซำสูง","โคกโพธิ์ไชย","หนองนาคำ","บ้านแฮด","โนนศิลา","เวียงเก่า"],
    "สุราษฎร์ธานี": ["เมืองสุราษฎร์ธานี","กาญจนดิษฐ์","ดอนสัก","เกาะสมุย","เกาะพะงัน","ไชยา","ท่าชนะ","คีรีรัฐนิคม","บ้านตาขุน","พนม","ท่าฉาง","บ้านนาสาร","บ้านนาเดิม","เคียนซา","เวียงสระ","พระแสง","พุนพิน","ชัยบุรี","วิภาวดี"],
    "ลำปาง": ["เมืองลำปาง","แม่เมาะ","เกาะคา","เสริมงาม","งาว","แจ้ห่ม","วังเหนือ","เถิน","แม่พริก","แม่ทะ","สบปราบ","ห้างฉัตร","เมืองปาน"],
    "พิษณุโลก": ["เมืองพิษณุโลก","นครไทย","ชาติตระการ","บางระกำ","บางกระทุ่ม","พรหมพิราม","วัดโบสถ์","วังทอง","เนินมะปราง"],
    "นครสวรรค์": ["เมืองนครสวรรค์","โกรกพระ","ชุมแสง","หนองบัว","บรรพตพิสัย","เก้าเลี้ยว","ตาคลี","ท่าตะโก","ไพศาลี","พยุหะคีรี","ลาดยาว","ตากฟ้า","แม่วงก์","แม่เปิน","ชุมตาบง"],
    "สุรินทร์": ["เมืองสุรินทร์","ชุมพลบุรี","ท่าตูม","จอมพระ","ปราสาท","กาบเชิง","รัตนบุรี","สนม","ศีขรภูมิ","สังขะ","ลำดวน","สำโรงทาบ","บัวเชด","พนมดงรัก","ศรีณรงค์","เขวาสินรินทร์","โนนนารายณ์"]
};

function initLocationDropdowns() {
    const provinceSelect = document.getElementById("loc-province");
    if (!provinceSelect) return;
    provinceSelect.innerHTML = `<option value="">เลือกจังหวัด...</option>` + TH_PROVINCES.map(p => `<option value="${p}">${p}</option>`).join("");
    provinceSelect.addEventListener("change", () => updateDistrictDropdown());
    updateDistrictDropdown();
}

function updateDistrictDropdown(selectedDistrict = "") {
    const provinceSelect = document.getElementById("loc-province");
    const districtSelect = document.getElementById("loc-district");
    if (!provinceSelect || !districtSelect) return;
    const province = provinceSelect.value;
    const districts = TH_DISTRICTS[province] || [];

    if (!province) {
        districtSelect.innerHTML = `<option value="">เลือกจังหวัดก่อน...</option>`;
        districtSelect.disabled = true;
        return;
    }

    if (districts.length === 0) {
        districtSelect.innerHTML = `<option value="">ยังไม่มีรายการอำเภอของจังหวัดนี้</option>`;
        districtSelect.disabled = true;
        return;
    }

    districtSelect.disabled = false;
    districtSelect.innerHTML = `<option value="">เลือกอำเภอ...</option>` + districts.map(d => `<option value="${d}">${d}</option>`).join("");
    if (selectedDistrict && districts.includes(selectedDistrict)) {
        districtSelect.value = selectedDistrict;
    }
}

function resetLocationForm() {
    document.getElementById("location-id").value = "";
    document.getElementById("loc-name").value = "";
    document.getElementById("loc-service-type").value = "external";
    document.getElementById("loc-province").value = "";
    updateDistrictDropdown();
    document.getElementById("loc-note").value = "";
}

function editLocationMaster(locId) {
    const loc = currentLocationsList.find(l => l.id === locId);
    if (!loc) return;
    document.getElementById("location-id").value = loc.id;
    document.getElementById("loc-name").value = loc.name || "";
    document.getElementById("loc-service-type").value = loc.service_type || "external";
    document.getElementById("loc-province").value = loc.province || "";
    updateDistrictDropdown(loc.district || "");
    document.getElementById("loc-note").value = loc.note || loc.address || "";
    showToast("โหลดข้อมูลศูนย์บริการขึ้นฟอร์มแล้ว");
}

function renderLocationsTable() {
    const tbody = document.getElementById("locations-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    const filterKey = serviceTypeFilters.locations || "total";
    const displayLocations = filterKey === "total" ? currentLocationsList : currentLocationsList.filter(loc => (loc.service_type || "external") === filterKey);
    if (displayLocations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">ยังไม่มีข้อมูลศูนย์บริการตามตัวกรองที่เลือก</td></tr>`;
        return;
    }
    displayLocations.forEach(loc => {
        const typeText = (loc.service_type === "internal") ? "ศูนย์ซ่อมภายใน" : "ศูนย์ซ่อมภายนอก";
        const badgeClass = (loc.service_type === "internal") ? "badge-completed" : "badge-planned";
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight:600; color:#fff;">${loc.name}</td>
            <td><span class="badge ${badgeClass}">${typeText}</span></td>
            <td>${loc.province || "-"}</td>
            <td>${loc.district || "-"}</td>
            <td style="color:var(--text-secondary); font-size:0.8rem;">${loc.note || loc.address || "-"}</td>
            <td><div style="display:flex; gap:.5rem;"><button class="btn btn-secondary" style="padding:.35rem .65rem;font-size:.75rem;" onclick="editLocationMaster(${loc.id})">แก้ไข</button><button class="btn btn-danger" style="padding:.35rem .65rem;font-size:.75rem;" onclick="deleteLocation(${loc.id})">ลบ</button></div></td>
        `;
        tbody.appendChild(tr);
    });
}

async function saveLocationMaster() {
    const locId = document.getElementById("location-id").value;
    const name = document.getElementById("loc-name").value.trim();
    if (!name) { showToast("กรุณากรอกชื่อศูนย์บริการ", true); return; }
    const payload = {
        name,
        service_type: document.getElementById("loc-service-type").value,
        province: document.getElementById("loc-province").value.trim(),
        district: document.getElementById("loc-district").value.trim(),
        note: document.getElementById("loc-note").value.trim(),
        address: ""
    };
    const url = locId ? `/api/locations/${locId}` : "/api/locations";
    const method = locId ? "PUT" : "POST";
    try {
        const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!response.ok) { const err = await response.json(); throw new Error(err.detail || "บันทึกศูนย์บริการไม่สำเร็จ"); }
        showToast(locId ? "แก้ไขศูนย์บริการเรียบร้อยแล้ว" : "เพิ่มศูนย์บริการเรียบร้อยแล้ว");
        resetLocationForm();
        fetchLocations();
    } catch (error) {
        console.error("Error saving location:", error);
        showToast(error.message, true);
    }
}

async function deleteLocation(id) {
    if (!confirm("คุณต้องการลบศูนย์บริการนี้ใช่หรือไม่? แผนงานเดิมที่ใช้ศูนย์บริการนี้จะไม่ถูกลบ")) return;

    try {
        const response = await fetch(`/api/locations/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete location");
        showToast("ลบศูนย์บริการเรียบร้อยแล้ว");
        fetchLocations();
    } catch (error) {
        console.error("Error deleting location:", error);
        showToast("ไม่สามารถลบศูนย์บริการได้", true);
    }
}


async function exportLocationsExcel() {
    try {
        window.location.href = "/api/locations/export-xlsx";
        showToast("กำลังส่งออกไฟล์ศูนย์บริการ Excel...");
    } catch (error) {
        console.error("Error exporting locations:", error);
        showToast("ไม่สามารถส่งออกศูนย์บริการได้", true);
    }
}

async function handleLocationImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
        const response = await fetch("/api/locations/import", { method: "POST", body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "นำเข้าศูนย์บริการไม่สำเร็จ");
        let msg = `นำเข้าศูนย์บริการสำเร็จ ${result.imported_count || 0} รายการ`;
        if (result.updated_count) msg += ` / อัปเดต ${result.updated_count} รายการ`;
        if (result.errors && result.errors.length) msg += ` / พบข้อผิดพลาด ${result.errors.length} แถว`;
        showToast(msg);
        await fetchLocations();
        await fetchDashboardData();
    } catch (error) {
        console.error("Error importing locations:", error);
        showToast(error.message || "นำเข้าศูนย์บริการไม่สำเร็จ", true);
    } finally {
        event.target.value = "";
    }
}

// 7. Load Data Car.csv for Dropdown List Suggest
async function fetchCars() {
    try {
        const response = await fetch("/api/cars");
        if (!response.ok) throw new Error("Failed to fetch car data");
        carsList = await response.json();
        
        // Populate Datalist
        const datalist = document.getElementById("car-list");
        datalist.innerHTML = "";
        
        carsList.forEach(car => {
            // Option value = the full text suggestion, allowing quick search by type
            const option = document.createElement("option");
            option.value = car.label;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching car csv list:", error);
    }
}

// 8. Import / Export PM Plans handlers
function triggerImportUpload() {
    document.getElementById("import-file-input").click();
}

async function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    showToast("กำลังนำเข้าข้อมูลแผนงาน PM...");
    
    try {
        const response = await fetch("/api/plans/import", {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) throw new Error("Failed to import data");
        
        const resData = await response.json();
        if (resData.success) {
            let msg = `นำเข้าแผนงานสำเร็จ ${resData.imported_count} รายการ`;
            if (resData.errors && resData.errors.length > 0) {
                msg += ` (พบข้อผิดพลาด ${resData.errors.length} บรรทัด)`;
                console.warn("Import Errors:", resData.errors);
            }
            showToast(msg);
            
            // Reload data
            const activeSection = document.querySelector(".page-section.active-page").id;
            if (activeSection === "dashboard") loadDashboardData();
            else if (activeSection === "pm-manager") fetchPlans();
            else if (activeSection === "calendar-view") loadCalendarPlans();
        } else {
            showToast("นำเข้าข้อมูลไม่สำเร็จ", true);
        }
    } catch (error) {
        console.error("Error importing file:", error);
        showToast("เกิดข้อผิดพลาดในการอัปโหลดไฟล์นำเข้า", true);
    } finally {
        // Clear input to allow re-uploading same file name
        document.getElementById("import-file-input").value = "";
    }
}

function exportPlans() {
    showToast("กำลังสร้างไฟล์รายงาน PM...");
    window.location.href = "/api/plans/export-xlsx";
}

// 9. Calendar Logic functions
async function loadCalendarPlans() {
    try {
        const response = await fetch("/api/plans");
        if (!response.ok) throw new Error("Failed to load plans for calendar");
        allPlansList = await response.json();
        populateSelectOptions("calendar-job-filter", allPlansList.map(p => p.job_title), "-- ชื่องาน PM ทั้งหมด --");
        
        renderCalendar();
        renderCalendarInsights();
        displaySelectedDatePlans();
    } catch (error) {
        console.error("Error loading calendar plans:", error);
        showToast("ไม่สามารถโหลดแผนงานมาแสดงบนปฏิทินได้", true);
    }
}

function adjustCalendarMonth(delta) {
    currentCalMonth += delta;
    if (currentCalMonth < 0) {
        currentCalMonth = 11;
        currentCalYear--;
    } else if (currentCalMonth > 11) {
        currentCalMonth = 0;
        currentCalYear++;
    }
    
    renderCalendar();
    renderCalendarInsights();
    displaySelectedDatePlans();
}

function renderCalendar() {
    const monthYearLabel = document.getElementById("calendar-month-year");
    monthYearLabel.innerText = `${thaiMonthNames[currentCalMonth]} ${currentCalYear + 543}`; // Display in Buddhist Era (BE) for Thai
    
    const daysGrid = document.getElementById("calendar-days-grid");
    daysGrid.innerHTML = "";
    
    // First day of the selected month
    const firstDayIndex = new Date(currentCalYear, currentCalMonth, 1).getDay();
    
    // Total days in the selected month
    const totalDays = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
    
    // Total days in the previous month (to fill prefix blank cells)
    const prevMonthTotalDays = new Date(currentCalYear, currentCalMonth, 0).getDate();
    
    // 1. Render previous month's trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day prev-month";
        dayDiv.innerHTML = `<span class="calendar-day-num">${prevMonthTotalDays - i}</span>`;
        daysGrid.appendChild(dayDiv);
    }
    
    // 2. Render current month's days
    for (let day = 1; day <= totalDays; day++) {
        // Construct date string formatted as YYYY-MM-DD
        const monthStr = String(currentCalMonth + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${currentCalYear}-${monthStr}-${dayStr}`;
        
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        
        // Highlight selected day
        if (dateStr === selectedDateStr) {
            dayDiv.classList.add("selected");
        }
        
        // Highlight today
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr === todayStr) {
            dayDiv.classList.add("today");
        }
        
        // Count plans for this date
        const dayPlans = filterPlansByServiceType(allPlansList, "calendar").filter(p => p.planned_date === dateStr && p.status !== "Cancelled");
        const activeCount = dayPlans.length;
        
        let eventsHtml = "";
        if (activeCount > 0) {
            const completedCount = dayPlans.filter(p => p.status === "Completed").length;
            const overdueCount = dayPlans.filter(p => p.status === "Overdue").length;
            
            let badgeClass = "";
            if (overdueCount > 0) badgeClass = "overdue";
            else if (completedCount === activeCount) badgeClass = "completed";
            
            eventsHtml = `
                <div class="calendar-day-events">
                    <div class="calendar-event-badge ${badgeClass}" title="นัด PM ${activeCount} คัน">
                        🚚 ${activeCount} คัน
                    </div>
                </div>
            `;
        }
        
        dayDiv.innerHTML = `
            <span class="calendar-day-num">${day}</span>
            ${eventsHtml}
        `;
        
        // Cell Click Handler
        dayDiv.addEventListener("click", () => {
            // Remove previous selection
            document.querySelectorAll(".calendar-day.selected").forEach(el => el.classList.remove("selected"));
            
            // Add new selection
            dayDiv.classList.add("selected");
            selectedDateStr = dateStr;
            
            displaySelectedDatePlans();
        });
        
        daysGrid.appendChild(dayDiv);
    }
    
    // 3. Render next month's starting days to fill grid (total elements should match grid rows)
    const totalCellsFilled = firstDayIndex + totalDays;
    const remainingCells = 42 - totalCellsFilled; // 6 rows * 7 columns = 42 cells
    
    // If we only need 5 rows (35 cells) we can cap it, but 42 is safe standard.
    const cellsToRender = remainingCells >= 7 ? remainingCells - 7 : remainingCells;
    const targetTotal = totalCellsFilled + cellsToRender;
    const finalRemaining = (targetTotal <= 35) ? 35 - totalCellsFilled : 42 - totalCellsFilled;

    for (let i = 1; i <= finalRemaining; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day next-month";
        dayDiv.innerHTML = `<span class="calendar-day-num">${i}</span>`;
        daysGrid.appendChild(dayDiv);
    }
}


function renderCalendarInsights() {
    const monthStr = String(currentCalMonth + 1).padStart(2, '0');
    const prefix = `${currentCalYear}-${monthStr}-`;
    const monthPlans = filterPlansByServiceType(allPlansList, "calendar").filter(p => p.planned_date && p.planned_date.startsWith(prefix) && p.status !== "Cancelled");
    const allMonthPlans = allPlansList.filter(p => p.planned_date && p.planned_date.startsWith(prefix) && p.status !== "Cancelled");
    const internalCount = allMonthPlans.filter(p => matchServiceTypeByLocation(p.location, "internal")).length;
    const externalCount = allMonthPlans.filter(p => matchServiceTypeByLocation(p.location, "external")).length;
    const byDay = {};
    monthPlans.forEach(p => { byDay[p.planned_date] = (byDay[p.planned_date] || 0) + 1; });
    let peakText = "-";
    const peak = Object.entries(byDay).sort((a,b) => b[1] - a[1])[0];
    if (peak) {
        const d = new Date(peak[0]);
        peakText = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()+543} (${peak[1]} คัน)`;
    }
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value; };
    setText("cal-total-month", monthPlans.length);
    setText("cal-internal-month", internalCount);
    setText("cal-external-month", externalCount);
    setText("cal-peak-day", peakText);
    const byJob={}; monthPlans.forEach(p=>{const k=normalizeFilterValue(p.job_title)||"ไม่ระบุชื่องาน";byJob[k]=(byJob[k]||0)+1;});
    const jobList=document.getElementById("calendar-job-summary-list");
    if(jobList){const entries=Object.entries(byJob).sort((a,b)=>b[1]-a[1]);jobList.innerHTML=entries.length?entries.map(([name,count])=>`<span class="calendar-job-chip"><b>${escapeHtml(name)}</b><em>${count} คัน</em></span>`).join(''):'<span class="muted">ไม่มีงาน PM ในเดือนนี้</span>';}
}

function displaySelectedDatePlans() {
    const listContainer = document.getElementById("calendar-day-plans-list");
    const dateLabel = document.getElementById("calendar-selected-date-str");
    
    const parsedDate = new Date(selectedDateStr);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateLabel.innerText = `นัดหมายของ: ${parsedDate.toLocaleDateString('th-TH', dateOptions)}`;
    
    listContainer.innerHTML = "";
    
    // Filter plans for this selected date
    const plansForDate = filterPlansByServiceType(allPlansList, "calendar").filter(p => p.planned_date === selectedDateStr);
    
    if (plansForDate.length === 0) {
        listContainer.innerHTML = `
            <div class="notify-item info" style="justify-content: center; padding: 2rem;">
                <p style="color: var(--text-muted); font-size: 0.85rem;">🎉 ไม่มีนัดหมาย PM ในวันนี้</p>
            </div>
        `;
        return;
    }
    
    plansForDate.forEach(plan => {
        let itemClass = "info";
        let icon = "📋";
        
        if (plan.status === "Overdue") {
            itemClass = "urgent";
            icon = "⚠️";
        } else if (plan.status === "Completed") {
            itemClass = "info";
            icon = "✅";
        } else if (plan.status === "Cancelled") {
            icon = "🚫";
        }

        const displayNo = plan.vehicle_no.split(" | ")[0];

        const item = document.createElement("div");
        item.className = `notify-item ${itemClass}`;
        item.innerHTML = `
            <div class="notify-icon-container">${icon}</div>
            <div class="notify-details" style="flex-grow: 1;">
                <h4 style="color: #fff; font-size: 0.9rem;">
                    ทะเบียน: ${displayNo} 
                    <span class="badge badge-${plan.status.toLowerCase().replace(' ', '_')}" style="padding: 0.15rem 0.4rem; font-size: 0.65rem; margin-left: 0.5rem;">${plan.status}</span>
                </h4>
                <p style="font-weight: 500; font-size: 0.8rem; color: var(--text-primary); margin-top: 0.15rem;">${plan.job_title}</p>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem;">สถานที่: ${plan.location}</p>
                <p style="font-size: 0.75rem; color: var(--text-muted);">${plan.description || "ไม่มีรายละเอียดเพิ่ม"}</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem; justify-content: center;">
                <button class="btn btn-secondary" style="padding: 0.3rem 0.5rem; font-size: 0.7rem;" onclick="openEditPlanModal(${JSON.stringify(plan).replace(/"/g, '&quot;')})">แก้ไข</button>
            </div>
        `;
        listContainer.appendChild(item);
    });
}


// 6.1 Mini Tools + LINE Debug Center
function toggleMiniDebugMenu(event) {
    if (event) event.stopPropagation();
    const panel = document.getElementById("mini-debug-panel");
    if (panel) panel.classList.toggle("open");
}

function openMiniPage(target) {
    document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
    document.querySelectorAll(".page-section").forEach(section => section.classList.remove("active-page"));
    const sec = document.getElementById(target);
    if (sec) sec.classList.add("active-page");
    if (target === "line-debug") refreshLineDebugCenter();
    if (target === "settings") loadSettings();
}

function formatJson(obj) {
    try { return JSON.stringify(obj, null, 2); } catch (_) { return String(obj || ""); }
}

function renderChecks(containerId, checks) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!checks || !checks.length) { el.innerHTML = `<div class="muted-text">ไม่มีข้อมูล</div>`; return; }
    el.innerHTML = checks.map(c => `<div class="debug-check ${c.ok ? 'ok' : 'bad'}"><b>${c.ok ? '✅' : '❌'} ${c.name}</b><span>${c.message || c.detail || ''}</span></div>`).join("");
}

function renderLineDebugResult(data) {
    const resp = document.getElementById("debug-api-response");
    const req = document.getElementById("debug-request-payload");
    const analyzer = document.getElementById("debug-error-analyzer");
    const timeline = document.getElementById("notification-timeline");
    if (resp) resp.textContent = formatJson({
        success: data.success,
        status_code: data.status_code,
        elapsed_ms: data.elapsed_ms,
        response_headers: data.response_headers,
        response_text: data.response_text,
        response_json: data.response_json,
        analysis: data.analysis
    });
    if (req) req.textContent = formatJson({
        method: data.method || 'POST',
        url: data.url,
        headers: data.request_headers,
        body: data.request_payload || data.request_body || {}
    });
    if (analyzer) {
        const a = data.analysis || {};
        analyzer.innerHTML = `<div class="debug-check ${data.success ? 'ok' : 'bad'}"><b>${data.success ? '✅ ส่งสำเร็จ' : '❌ ส่งไม่สำเร็จ'}</b><span>${a.root_cause || a.reason || '-'}</span></div>
            <div class="debug-check"><b>HTTP Status</b><span>${data.status_code || '-'}</span></div>
            <div class="debug-check"><b>คำแนะนำ</b><span>${a.suggestion || '-'}</span></div>
            <div class="debug-check"><b>LINE Message</b><span>${a.line_message || data.response_text || '-'}</span></div>
            <div class="debug-check"><b>Payload Check</b><span>${formatJson(a.checks || {})}</span></div>`;
    }
    if (timeline) {
        const rows = data.timeline || [];
        timeline.innerHTML = rows.map(t => `<div class="timeline-row ${t.ok ? 'ok' : 'bad'}"><b>${t.time || ''}</b><span>${t.ok ? '✅' : '❌'} ${t.step}</span><code>${t.detail || ''}</code></div>`).join('') || 'ยังไม่มี Timeline';
    }
}

async function refreshLineDebugCenter() {
    try {
        const res = await fetch('/api/line/debug/status');
        const data = await res.json();
        const statusBox = document.getElementById('debug-connection-status');
        if (statusBox) {
            statusBox.innerHTML = `
                <div class="debug-check ${data.connection?.checks?.[0]?.ok ? 'ok' : 'bad'}"><b>Token</b><span>${data.token_masked || 'ไม่พบ Token'}</span></div>
                <div class="debug-check ${data.target_id ? 'ok' : 'bad'}"><b>Target</b><span>${data.target_id || 'ยังไม่เลือก Target'}</span></div>
                <div class="debug-check ok"><b>Webhook URL</b><span>${data.webhook_url}</span></div>
                <div class="debug-check"><b>Targets/Webhooks/Logs</b><span>${data.targets_count} / ${data.webhook_events_count} / ${data.notification_logs_count}</span></div>`;
        }
        renderChecks('debug-config-validator', data.connection?.checks || []);
        if (data.last_debug) renderLineDebugResult(data.last_debug);
    } catch (e) { console.error(e); }
    loadWebhookMonitor();
    loadNotificationLogUpgrade();
    loadDebugLog('scheduler', 'scheduler-log');
    loadDebugLog('line', 'line-log');
    loadLineInspector();
    loadRequestHistory();
}


async function sendDebugTestPush() {
    const token = document.getElementById("line-token")?.value || "";
    const target = document.getElementById("line-target")?.value || "";
    const message = document.getElementById("debug-test-message")?.value || "ทดสอบ LINE Debug Center";
    if (!token || !target) { showToast('กรุณากรอก Token และ Target ID ในหน้า Settings ก่อน', true); return; }
    const res = await fetch('/api/settings/test-line', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({token, target_id: target, message}) });
    const data = await res.json();
    renderLineDebugResult(data);
    loadNotificationLogUpgrade();
    showToast(data.success ? 'Test Push สำเร็จ' : 'Test Push ไม่สำเร็จ ดู Error Analyzer', !data.success);
}

async function simulateLineMessage() {
    try {
        const res = await fetch('/api/line/simulator', { method:'POST' });
        const data = await res.json();
        const target = document.getElementById('sim-target');
        const msg = document.getElementById('sim-message');
        const req = document.getElementById('debug-request-payload');
        if (target) target.textContent = data.target_id || '-';
        if (msg) msg.textContent = data.message || '-';
        if (req) req.textContent = formatJson(data.payload || {});
        showToast('จำลองข้อความแจ้งเตือนแล้ว');
    } catch (e) { showToast('จำลองข้อความไม่สำเร็จ', true); }
}

async function loadWebhookMonitor() {
    const el = document.getElementById('webhook-monitor');
    if (!el) return;
    try {
        const res = await fetch('/api/line/webhook-events');
        const rows = await res.json();
        el.innerHTML = rows.slice(0,20).map(r => `<div class="log-row"><b>${r.received_at}</b><span>${r.event_type} / ${r.source_type}</span><code>${r.source_id || '-'}</code></div>`).join('') || 'ยังไม่มีข้อมูล';
    } catch(e) { el.textContent = 'โหลด Webhook Monitor ไม่สำเร็จ'; }
}

async function loadNotificationLogUpgrade() {
    const el = document.getElementById('notification-log-upgrade');
    if (!el) return;
    try {
        const res = await fetch('/api/notification-logs');
        const rows = await res.json();
        el.innerHTML = rows.slice(0,20).map(r => {
            let reason = '-'; let code = '-';
            try { const d = JSON.parse(r.response || '{}'); reason = d.analysis?.root_cause || d.analysis?.reason || '-'; code = d.status_code || '-'; } catch(_) {}
            return `<div class="log-row"><b>${r.sent_at}</b><span>${r.status} / Code ${code}</span><code>${reason}</code></div>`;
        }).join('') || 'ยังไม่มีข้อมูล';
    } catch(e) { el.textContent = 'โหลด Notification Log ไม่สำเร็จ'; }
}

async function loadDebugLog(name, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    try {
        const res = await fetch(`/api/system/logs/${name}`);
        const data = await res.json();
        el.textContent = (data.lines || []).join('\n') || 'ยังไม่มีข้อมูล Log';
    } catch(e) { el.textContent = 'โหลด Log ไม่สำเร็จ'; }
}

async function runHealthCheck() {
    try {
        openMiniPage('line-debug');
        const res = await fetch('/api/system/health');
        const data = await res.json();
        renderChecks('debug-config-validator', data.checks || []);
        showToast(data.ok ? 'Health Check ผ่านทั้งหมด' : 'Health Check พบจุดต้องตรวจสอบ', !data.ok);
    } catch(e) { showToast('Health Check ไม่สำเร็จ', true); }
}


async function loadLineInspector() {
    const el = document.getElementById('line-inspector');
    if (!el) return;
    try {
        const res = await fetch('/api/line/inspector');
        const data = await res.json();
        el.innerHTML = (data.items || []).map(i => `<div class="inspector-item ${i.ok ? 'ok' : 'bad'}"><b>${i.ok ? '✅' : '❌'} ${i.name}</b><span>${i.detail || ''}</span></div>`).join('') || 'ไม่มีข้อมูล Inspector';
        if (data.last_debug) renderLineDebugResult(data.last_debug);
    } catch(e) { el.textContent = 'โหลด LINE Inspector ไม่สำเร็จ'; }
}

async function loadRequestHistory() {
    const el = document.getElementById('request-history');
    if (!el) return;
    try {
        const res = await fetch('/api/line/request-history?limit=30');
        const rows = await res.json();
        el.innerHTML = rows.map(r => `<div class="log-row"><b>${r.sent_at}</b><span>${r.status} / HTTP ${r.status_code || '-'}</span><code>${r.root_cause || r.line_message || '-'}</code></div>`).join('') || 'ยังไม่มี Request History';
    } catch(e) { el.textContent = 'โหลด Request History ไม่สำเร็จ'; }
}

async function loadAllLogs() {
    await loadDebugLog('line', 'line-log-center');
}

async function runApiTesterDemo() {
    const out = document.getElementById('api-tester-output');
    const path = document.getElementById('api-tester-path')?.value || '/api/line/inspector';
    const method = document.getElementById('api-tester-method')?.value || 'GET';
    try {
        const res = await fetch('/api/dev/api-test', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({method, path, body:{}})});
        const data = await res.json();
        if (out) out.textContent = formatJson(data);
        showToast('API Tester เตรียมข้อมูลแล้ว');
    } catch(e) { if (out) out.textContent = 'API Tester ไม่สำเร็จ'; showToast('API Tester ไม่สำเร็จ', true); }
}

function downloadSystemSnapshot() {
    window.open('/api/system/snapshot', '_blank');
    showToast('กำลังสร้าง System Snapshot');
}


// ==================== PM Assistant v1.5 ====================
async function loadMyToday() {
    try {
        const res = await fetch('/api/assistant/today');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        document.getElementById('today-active').textContent = data.active;
        document.getElementById('today-overdue').textContent = data.overdue;
        document.getElementById('today-completed').textContent = data.completed;
        document.getElementById('today-paused').textContent = data.paused;
        document.getElementById('today-date-label').textContent = new Date(data.date+'T00:00:00').toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        const mission=document.getElementById('today-mission');
        mission.className='mission-banner '+(data.active===0?'mission-done':'');
        mission.innerHTML=data.active===0?'🎉 <b>Today’s Mission Complete</b><span>ไม่มีงานค้างที่ต้องติดตามวันนี้</span>':`📋 <b>เหลืองาน ${data.active} รายการ</b><span>จัดการทีละคัน แล้วกด Complete เมื่อเสร็จ</span>`;
        renderTodayTasks(data.items);
        const total = Number(data.active || 0) + Number(data.completed || 0);
        const pct = total ? Math.round((Number(data.completed || 0) / total) * 100) : 100;
        const progressBar = document.getElementById('mission-progress-bar');
        const progressText = document.getElementById('mission-progress-text');
        if (progressBar) progressBar.style.width = pct + '%';
        if (progressText) progressText.textContent = `${data.completed} / ${total} งาน (${pct}%)`;
        loadWeeklyMini();
    } catch(e) { document.getElementById('today-task-list').innerHTML='<div class="empty-state">โหลด My Today ไม่สำเร็จ: '+escapeHtml(String(e))+'</div>'; }
}
function renderTodayTasks(items){
    const el=document.getElementById('today-task-list');
    if(!items.length){el.innerHTML='<div class="empty-state">วันนี้ยังไม่มีแผน PM ที่ต้องติดตาม</div>';return;}
    const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
    el.innerHTML=items.sort((a,b)=>b.priority-a.priority).map(x=>`<article class="today-task ${x.paused?'is-paused':''} ${x.status==='Completed'?'is-complete':''}">
      <div class="task-priority p${x.priority}">${stars(x.priority)}</div>
      <div class="task-main"><div class="task-title"><b>🚛 ${escapeHtml(x.vehicle_no)}</b><span class="task-status">${escapeHtml(x.status)}</span></div>
      <div class="task-details"><span>🔧 ${escapeHtml(x.job_title||'-')}</span><span>📍 ${escapeHtml(x.location||'-')}</span><span>📅 ${formatDateDisplay(x.planned_date)}</span></div>
      ${(x.followup_status||x.quick_note||x.pause_reason)?`<div class="task-note">${escapeHtml(x.followup_status||x.pause_reason||'')} ${escapeHtml(x.quick_note||'')}</div>`:''}</div>
      <div class="task-actions">
        ${x.status!=='Completed'?`<button class="quick-btn complete" onclick="completeTodayTask(${x.id})">✓ Complete</button>
        <button class="quick-btn" onclick="setFollowup(${x.id})">☎ โทรแล้ว</button>
        ${x.paused?`<button class="quick-btn" onclick="resumeTodayTask(${x.id})">▶ Resume</button>`:`<button class="quick-btn pause" onclick="pauseTodayTask(${x.id})">⏸ Pause</button>`}`:'<span class="complete-label">✅ เสร็จแล้ว</span>'}
      </div></article>`).join('');
}
async function completeTodayTask(id){
    if(!confirm('ยืนยันปิดงานรายการนี้? ระบบจะบันทึก History และหยุด Reminder ทันที'))return;
    const res=await fetch(`/api/assistant/plans/${id}/complete`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    if(res.ok){showToast('ปิดงานเรียบร้อย');loadMyToday();}else showToast('ปิดงานไม่สำเร็จ',true);
}
async function pauseTodayTask(id){const reason=prompt('เหตุผลที่พักการติดตาม','รออะไหล่');if(reason===null)return;await fetch(`/api/assistant/plans/${id}/pause`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reason})});showToast('พักการติดตามแล้ว');loadMyToday();}
async function resumeTodayTask(id){await fetch(`/api/assistant/plans/${id}/resume`,{method:'POST'});showToast('กลับมาติดตามงานแล้ว');loadMyToday();}
async function setFollowup(id){const note=prompt('บันทึกสั้น ๆ หลังโทรติดตาม','โทรแล้ว รอยืนยันเวลาเข้า');if(note===null)return;await fetch(`/api/assistant/plans/${id}/followup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'โทรแล้ว',note})});showToast('บันทึก Follow-up แล้ว');loadMyToday();}
async function loadWeeklyMini(){try{const d=await (await fetch('/api/assistant/weekly-summary')).json();document.getElementById('weekly-summary-mini').innerHTML=`<span><b>${d.total}</b> ทั้งหมด</span><span><b>${d.completed}</b> เสร็จ</span><span><b>${d.overdue}</b> Overdue</span><span><b>${d.completion_rate}%</b> ปิดงาน</span>`;}catch(e){}}
async function toggleAssistantNotifications(enabled){const r=await fetch('/api/assistant/scheduler/enable?enabled='+enabled,{method:'POST'});showToast(r.ok?(enabled?'เปิดแจ้งเตือนผู้ช่วยแล้ว':'ปิดแจ้งเตือนผู้ช่วยแล้ว'):'ตั้งค่าไม่สำเร็จ',!r.ok);}

// Shared safe display helpers for v1.5
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function formatDateDisplay(value) {
    if (!value) return '-';
    const d = new Date(value + (String(value).length === 10 ? 'T00:00:00' : ''));
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('th-TH', {day:'2-digit', month:'short', year:'numeric'});
}


// ==================== PM Assistant Center / Sprint 2 ====================
function navigateToPage(target) {
    const item = document.querySelector(`.nav-item[data-target="${target}"]`);
    if (item) item.click();
}
function startSmartQueue() {
    const first = document.querySelector('#today-task-list .today-task:not(.is-complete):not(.is-paused)');
    if (!first) { showToast('ไม่มีงานค้างใน Smart Queue'); return; }
    first.scrollIntoView({behavior:'smooth', block:'center'});
    first.classList.add('queue-focus');
    setTimeout(()=>first.classList.remove('queue-focus'), 2200);
}
function openAssistantTab(name) {
    document.querySelectorAll('.assistant-tab').forEach(x=>x.classList.toggle('active', x.dataset.assistantTab===name));
    document.querySelectorAll('.assistant-tab-panel').forEach(x=>x.classList.remove('active'));
    document.getElementById('assistant-tab-'+name)?.classList.add('active');
    if(name==='handbook') showHandbookChapter('daily');
    if(name==='training') restoreTrainingProgress();
}
const handbookChapters = {
 daily:{title:'งานประจำวัน',body:'<ol><li>เปิดระบบและดูหน้า <b>My Today</b></li><li>เริ่มจากงานดาว 5 ดวงหรือ Overdue</li><li>ใช้ Smart Queue เพื่อทำทีละรายการ</li><li>ตรวจสรุปตอนเย็นจาก LINE</li></ol><div class="guide-tip">💡 เปิด Dashboard เฉพาะเวลาวิเคราะห์หรือประชุม</div>'},
 follow:{title:'การติดตามงาน',body:'<ol><li>โทรหาศูนย์หรือผู้ประสานงาน</li><li>กด <b>☎ โทรแล้ว</b> และจดข้อความสั้น ๆ</li><li>ถ้ารออะไหล่หรือลูกค้าเลื่อน ให้กด <b>Pause</b></li><li>เมื่อต้องติดตามต่อ กด <b>Resume</b></li></ol>'},
 complete:{title:'One Click Complete',body:'<p>กด Complete เฉพาะเมื่อจบงานจริง ระบบจะอัปเดตฐานข้อมูล บันทึก PM History หยุด Reminder อัปเดต Dashboard และรวม Weekly Summary อัตโนมัติ</p><div class="guide-warning">⚠️ อย่ากด Complete หากรถยังไม่เข้าหรือยังซ่อมไม่เสร็จ</div>'},
 line:{title:'LINE แจ้งเตือน',body:'<p>ระบบส่ง Morning Brief, Follow-up เฉพาะงานค้าง, Evening Summary และ Weekly Summary ตามเวลาที่ตั้งไว้ ต้องเปิดโปรแกรมไว้ หากใช้งานจากเครื่องส่วนตัว</p>'},
 backup:{title:'สำรองข้อมูล',body:'<p>ไฟล์ข้อมูลหลักคือ <code>pm_tracking.db</code> ให้ Copy เก็บอย่างน้อยสัปดาห์ละครั้ง และทุกครั้งก่อนอัปเดตเวอร์ชัน</p>'}
};
function showHandbookChapter(key){
    const c=handbookChapters[key]||handbookChapters.daily;
    const el=document.getElementById('handbook-content');
    if(el) el.innerHTML=`<span class="eyebrow">PM HANDBOOK</span><h3>${c.title}</h3>${c.body}`;
}
const tourSteps=[
 {title:'นี่คือ My Today',text:'หน้าแรกแสดงเฉพาะงานวันนี้ งาน Overdue และรายการที่ต้องติดตาม'},
 {title:'Smart Queue',text:'กด “เริ่ม Smart Queue” ระบบจะพาไปยังงานเร่งด่วนที่สุดก่อน'},
 {title:'Quick Action',text:'ใช้ โทรแล้ว, Pause หรือ Resume โดยไม่ต้องเปิดหน้า Edit'},
 {title:'One Click Complete',text:'เมื่อจบจริง กด Complete ครั้งเดียว ระบบจัดการ History, Reminder และ Summary ให้ทั้งหมด'}
];
let tourIndex=0;
function startInteractiveHelp(){tourIndex=0;document.getElementById('interactive-help').classList.add('open');document.getElementById('interactive-help').setAttribute('aria-hidden','false');renderTourStep();}
function renderTourStep(){const s=tourSteps[tourIndex];document.getElementById('tour-step-label').textContent=`STEP ${tourIndex+1} / ${tourSteps.length}`;document.getElementById('tour-title').textContent=s.title;document.getElementById('tour-text').textContent=s.text;}
function nextInteractiveHelp(){tourIndex++;if(tourIndex>=tourSteps.length){closeInteractiveHelp();navigateToPage('my-today');showToast('พร้อมใช้งาน PM Assistant แล้ว');return;}renderTourStep();}
function closeInteractiveHelp(){document.getElementById('interactive-help').classList.remove('open');document.getElementById('interactive-help').setAttribute('aria-hidden','true');}
function saveTrainingProgress(){
 const checks=[...document.querySelectorAll('#assistant-tab-training input[type="checkbox"]')];
 localStorage.setItem('pmAssistantTraining',JSON.stringify(checks.map(x=>x.checked)));
 updateTrainingProgress();
}
function restoreTrainingProgress(){
 const checks=[...document.querySelectorAll('#assistant-tab-training input[type="checkbox"]')];
 const saved=JSON.parse(localStorage.getItem('pmAssistantTraining')||'[]');
 checks.forEach((x,i)=>x.checked=!!saved[i]);updateTrainingProgress();
}
function updateTrainingProgress(){
 const checks=[...document.querySelectorAll('#assistant-tab-training input[type="checkbox"]')];
 const done=checks.filter(x=>x.checked).length;const pct=checks.length?Math.round(done*100/checks.length):0;
 const label=document.getElementById('training-progress-label');const bar=document.getElementById('training-progress-bar');
 if(label)label.textContent=pct+'%';if(bar)bar.style.width=pct+'%';
}


// ==================== PM Assistant v1.6 Weekly PM Control ====================
let weeklySelectedWeek = 1;
let weeklyDataCache = null;
function initWeeklyMonth(){const el=document.getElementById('weekly-month');if(el&&!el.value){const d=new Date();el.value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}}
function weeklyParams(){initWeeklyMonth();const [year,month]=document.getElementById('weekly-month').value.split('-').map(Number);return {year,month,status:document.getElementById('weekly-status').value};}
async function loadWeeklyControl(){
 const p=weeklyParams();
 try{const r=await fetch(`/api/weekly-control?year=${p.year}&month=${p.month}&week=${weeklySelectedWeek}&item_status=${encodeURIComponent(p.status)}`);if(!r.ok)throw new Error(await r.text());const d=await r.json();weeklyDataCache=d;
 document.getElementById('weekly-total').textContent=d.summary.total;document.getElementById('weekly-completed').textContent=d.summary.completed;document.getElementById('weekly-pending').textContent=d.summary.pending;document.getElementById('weekly-deferred').textContent=d.summary.deferred;
 document.getElementById('weekly-tabs').innerHTML=[1,2,3,4,5].map(w=>{const x=d.weeks[String(w)]||{};return `<button class="weekly-tab ${w===weeklySelectedWeek?'active':''}" onclick="selectWeeklyWeek(${w})"><b>สัปดาห์ ${w}</b><span>${x.completed||0}/${x.total||0} คัน</span><i><em style="width:${x.rate||0}%"></em></i></button>`}).join('');
 document.getElementById('weekly-list-title').textContent=`รายการสัปดาห์ที่ ${weeklySelectedWeek}`;renderWeeklyRows(d.items||[]);
 }catch(e){document.getElementById('weekly-table-body').innerHTML=`<tr><td colspan="8">โหลดข้อมูลไม่สำเร็จ: ${escapeHtml(e)}</td></tr>`;}
}
function selectWeeklyWeek(w){weeklySelectedWeek=w;loadWeeklyControl();}
function weeklyStatusLabel(s){return s==='completed'?'✅ เข้าแล้ว':s==='deferred'?'⏸ เลื่อน':'⏳ ยังไม่เข้า';}
function renderWeeklyRows(rows){const el=document.getElementById('weekly-table-body');if(!rows.length){el.innerHTML='<tr><td colspan="8" class="empty-state">ยังไม่มีรายการในสัปดาห์นี้ — Import Excel เพื่อเริ่มใช้งาน</td></tr>';return;}el.innerHTML=rows.map(x=>`<tr><td><b>${escapeHtml(x.vehicle_no)}</b></td><td>${escapeHtml(x.registration||'-')}</td><td>${escapeHtml(x.pm_group||'-')}</td><td>${x.week_no}</td><td>${escapeHtml(x.lot_name||'-')}</td><td><span class="weekly-badge ${x.status}">${weeklyStatusLabel(x.status)}</span></td><td>${escapeHtml(x.note||'-')}</td><td><div class="weekly-actions">${x.status!=='completed'?`<button onclick="setWeeklyStatus(${x.id},'completed')">✓ เข้าแล้ว</button>`:''}${x.status!=='deferred'?`<button onclick="setWeeklyStatus(${x.id},'deferred')">เลื่อน</button>`:''}${x.status!=='pending'?`<button onclick="setWeeklyStatus(${x.id},'pending')">กลับมาตาม</button>`:''}<button class="danger-link" onclick="deleteWeeklyItem(${x.id})">ลบ</button></div></td></tr>`).join('');}
async function setWeeklyStatus(id,status){let note=null;if(status==='deferred')note=prompt('เหตุผลที่เลื่อน','ติดเงื่อนไขงานเข้า / รอคิว');const r=await fetch(`/api/weekly-control/items/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,note})});showToast(r.ok?'อัปเดต Weekly Control แล้ว':'อัปเดตไม่สำเร็จ',!r.ok);if(r.ok)loadWeeklyControl();}
async function deleteWeeklyItem(id){if(!confirm('ลบรายการนี้ออกจาก Weekly Control?'))return;const r=await fetch(`/api/weekly-control/items/${id}`,{method:'DELETE'});showToast(r.ok?'ลบรายการแล้ว':'ลบไม่สำเร็จ',!r.ok);if(r.ok)loadWeeklyControl();}
function downloadWeeklyTemplate(){window.open('/api/weekly-control/template','_blank');}
async function importWeeklyFile(file){if(!file)return;const p=weeklyParams();const name=prompt('ชื่อ Lot / แผนชุดนี้',`Weekly PM ${String(p.month).padStart(2,'0')}/${p.year}`);if(name===null)return;const fd=new FormData();fd.append('file',file);showToast('กำลัง Import Weekly PM...');const r=await fetch(`/api/weekly-control/import?year=${p.year}&month=${p.month}&campaign_name=${encodeURIComponent(name)}`,{method:'POST',body:fd});const d=await r.json();if(r.ok){showToast(`Import สำเร็จ ${d.imported} คัน${d.skipped?` ข้าม ${d.skipped} แถว`:''}`);loadWeeklyControl();}else showToast(d.detail||'Import ไม่สำเร็จ',true);document.getElementById('weekly-import-file').value='';}
function weeklyPendingText(){if(!weeklyDataCache)return '';const p=weeklyParams();const rows=(weeklyDataCache.items||[]).filter(x=>x.status==='pending');return `📣 ติดตามแผน PM เดือน ${p.month}/${p.year} | สัปดาห์ที่ ${weeklySelectedWeek}\nเหลือค้าง ${rows.length} คัน\n====================\n`+(rows.map((x,i)=>`${i+1}. รถ ${x.vehicle_no}${x.pm_group?' | กลุ่ม '+x.pm_group:''}`).join('\n')||'- ไม่มีรถค้างติดตาม');}
async function copyWeeklyPending(){const text=weeklyPendingText();if(!text){showToast('ยังไม่มีข้อมูล');return;}await navigator.clipboard.writeText(text);showToast('Copy รายการค้างแล้ว');}
async function sendWeeklyLine(){const p=weeklyParams();if(!confirm(`ส่งรายการค้างสัปดาห์ที่ ${weeklySelectedWeek} เข้า LINE?`))return;const r=await fetch(`/api/weekly-control/send-line?year=${p.year}&month=${p.month}&week=${weeklySelectedWeek}`,{method:'POST'});const d=await r.json();showToast(r.ok&&d.success?`ส่ง LINE แล้ว (${d.pending} คัน)`:'ส่ง LINE ไม่สำเร็จ กรุณาตรวจสอบ LINE Settings',!(r.ok&&d.success));}


// ==================== PM Assistant v1.6.1 ====================
async function previewReportMessage(period='now'){try{const r=await fetch('/api/reports/preview?period='+encodeURIComponent(period));if(!r.ok)throw new Error(await r.text());const d=await r.json();const box=document.getElementById('report-simulator-text');if(box)box.value=d.message;showToast('จำลองข้อความแล้ว');}catch(e){showToast('จำลองข้อความไม่สำเร็จ',true);}}
async function sendReportNow(period='now'){if(!confirm('ยืนยันส่งสรุปรายงานเข้า LINE ตอนนี้?'))return;try{const r=await fetch('/api/reports/send?period='+encodeURIComponent(period),{method:'POST'});if(!r.ok)throw new Error(await r.text());showToast('ส่งสรุปรายงานเข้า LINE แล้ว');}catch(e){showToast('ส่งสรุปรายงานไม่สำเร็จ',true);}}
async function sendTodayLineSummary(){await sendReportNow('now');}
