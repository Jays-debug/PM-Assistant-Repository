/**
 * AutoPM - vehicle maintenance and PM scheduling logic
 * Date context: dynamic local system date
 */

// Helper Date Utilities
const DateUtils = {
    thaiMonths: {
        'ม.ค.': 1, 'มค': 1, 'มกราคม': 1,
        'ก.พ.': 2, 'กพ': 2, 'กุมภาพันธ์': 2,
        'มี.ค.': 3, 'มีค': 3, 'มีนาคม': 3,
        'เม.ย.': 4, 'เมย': 4, 'เมษายน': 4,
        'พ.ค.': 5, 'พค': 5, 'พฤษภาคม': 5,
        'มิ.ย.': 6, 'มิย': 6, 'มิถุนายน': 6,
        'ก.ค.': 7, 'กค': 7, 'กรกฎาคม': 7,
        'ส.ค.': 8, 'สค': 8, 'สิงหาคม': 8,
        'ก.ย.': 9, 'กย': 9, 'กันยายน': 9,
        'ต.ค.': 10, 'ตค': 10, 'ตุลาคม': 10,
        'พ.ย.': 11, 'พย': 11, 'พฤศจิกายน': 11,
        'ธ.ค.': 12, 'ธค': 12, 'ธันวาคม': 12
    },

    todayStr() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    },

    normalizeYear(year) {
        let y = parseInt(year, 10);
        if (!Number.isFinite(y)) return NaN;
        if (y > 2400) y -= 543;           // พ.ศ. 2569 -> ค.ศ. 2026
        else if (y < 100) y += 2500;      // 69 -> 2569
        if (y > 2400) y -= 543;
        return y;
    },

    makeDate(year, month, day) {
        const y = this.normalizeYear(year);
        const m = parseInt(month, 10);
        const d = parseInt(day, 10);
        if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
        if (m < 1 || m > 12 || d < 1 || d > 31) return null;
        const dt = new Date(y, m - 1, d);
        if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
        return dt;
    },

    // อ่านวันที่จาก Google Sheet ให้ได้หลายรูปแบบ: 22/06/2569, 2026-06-22, 22 มิ.ย. 2569, Date object
    toDate(value) {
        if (!value && value !== 0) return null;
        if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

        let s = String(value).trim();
        if (!s || s === '-' || s.toLowerCase() === 'null') return null;
        s = s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');

        // yyyy-mm-dd หรือ yyyy/mm/dd
        let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
        if (m) return this.makeDate(m[1], m[2], m[3]);

        // dd/mm/yyyy หรือ d/m/yy
        m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
        if (m) return this.makeDate(m[3], m[2], m[1]);

        // dd ThaiMonth yyyy เช่น 5 ส.ค. 2569
        m = s.match(/^(\d{1,2})\s*([ก-๙.]+)\s*(\d{2,4})$/);
        if (m) {
            const monthText = m[2].replace(/\s/g, '');
            const month = this.thaiMonths[monthText] || this.thaiMonths[monthText.replace(/\./g, '')];
            if (month) return this.makeDate(m[3], month, m[1]);
        }

        // Google Sheets serial date (เฉพาะตัวเลขประมาณวันที่)
        if (/^\d+(\.\d+)?$/.test(s)) {
            const serial = Number(s);
            if (serial > 20000 && serial < 80000) {
                const epoch = new Date(Date.UTC(1899, 11, 30));
                const dt = new Date(epoch.getTime() + serial * 86400000);
                return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
            }
        }

        const fallback = new Date(s);
        if (!Number.isNaN(fallback.getTime())) return fallback;
        return null;
    },
    
    // คืนค่าเป็น YYYY-MM-DD เพื่อใช้ sort/filter/calendar
    parseThaiCSVDate(dateStr) {
        const dt = this.toDate(dateStr);
        if (!dt) return null;
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    },

    formatThaiDate(dateStr) {
        if (!dateStr) return "-";
        const dt = this.toDate(dateStr);
        if (!dt) return String(dateStr);
        const months = [
            "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ];
        return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear() + 543}`;
    },

    formatThaiMonthYear(monthIndex, year) {
        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];
        const yearTh = parseInt(year) + 543;
        return `${months[monthIndex]} ${yearTh}`;
    },
    
    getDaysDiff(startDateStr, endDateStr) {
        const start = this.toDate(startDateStr);
        const end = this.toDate(endDateStr);
        if (!start || !end) return 0;
        const diffTime = end - start;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

// Robust CSV Parser in Vanilla JS
function parseCSV(text) {
    let lines = [];
    let row = [""];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        let next = text[i+1];
        if (c === '"') {
            if (inQuotes && next === '"') {
                row[row.length - 1] += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            row.push("");
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') {
                i++;
            }
            lines.push(row);
            row = [""];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row[0] !== "") {
        lines.push(row);
    }

    return lines;
}

// Header-based CSV mapping helpers
function normalizeHeaderName(value) {
    return (value || '')
        .toString()
        .replace(/^\uFEFF/, '')
        .replace(/\s+/g, '')
        .replace(/[()（）._-]/g, '')
        .toLowerCase();
}

function buildHeaderIndex(headers) {
    const map = {};
    headers.forEach((header, index) => {
        const key = normalizeHeaderName(header);
        if (!key) return;
        if (!map[key]) map[key] = [];
        map[key].push(index);
    });
    return map;
}

function getCellByHeader(row, headerIndex, aliases, fallbackIndex = null, occurrence = 0) {
    for (const alias of aliases) {
        const key = normalizeHeaderName(alias);
        const matches = headerIndex[key];
        if (matches && matches.length) {
            const pickedIndex = matches[Math.min(occurrence, matches.length - 1)];
            return (row[pickedIndex] || '').trim();
        }
    }
    if (fallbackIndex !== null && fallbackIndex !== undefined) {
        return (row[fallbackIndex] || '').trim();
    }
    return '';
}

function parseNumber(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    const cleaned = value.toString().replace(/,/g, '').trim();
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : defaultValue;
}

function getCurrentYear() {
    return new Date().getFullYear();
}

// Vehicle Database Manager
class VehicleManager {
    constructor() {
        this.rawVehicles = [];
        this.vehicles = [];
        this.googleSheetUrl = "https://docs.google.com/spreadsheets/d/1oemunoZgjantmm9dtwU5-6F6QeQ6pVafncEtuE3Imk8/export?format=csv&gid=0";
        this.lastSyncTime = null;
        this.dataMeta = { source: 'ไม่ทราบแหล่งข้อมูล', version: '3.5.3', updatedAt: null, rows: 0, validVehicles: 0, rawRows: 0, skippedRows: 0 };
        this.syncAudit = { ok: false, source: '-', urlType: '-', message: 'ยังไม่ได้เชื่อมต่อข้อมูล', lastError: '', rawRows: 0, validVehicles: 0, skippedRows: 0, cachedAt: localStorage.getItem('autopm_sync_timestamp') || '' };
    }

    async loadData(url = this.googleSheetUrl) {
        const dataUrl = (url || this.googleSheetUrl || '').trim();
        let liveError = null;
        try {
            console.log("Fetching live AutoPM data from:", dataUrl);
            const payloadText = await this.fetchTextWithJsonpFallback(dataUrl);
            this.processAutoPMData(payloadText);
            this.lastSyncTime = new Date();
            this.syncAudit = {
                ok: true,
                source: this.detectPayloadType(payloadText) === 'json' ? 'Apps Script API' : 'CSV Live',
                urlType: this.detectUrlType(dataUrl),
                message: 'ดึงข้อมูลสดสำเร็จ',
                lastError: '',
                rawRows: this.dataMeta.rawRows || this.dataMeta.rows || 0,
                validVehicles: this.vehicles.length,
                skippedRows: this.dataMeta.skippedRows || 0,
                cachedAt: this.lastSyncTime.toISOString()
            };

            // Store the latest successful payload, regardless of whether it is CSV or Apps Script JSON.
            localStorage.setItem('autopm_data_cache', payloadText);
            localStorage.setItem('autopm_csv_cache', payloadText); // backward compatibility with older versions
            localStorage.setItem('autopm_sync_timestamp', this.lastSyncTime.toISOString());
            localStorage.setItem('autopm_custom_url', dataUrl);
            return { success: true, source: this.detectPayloadType(payloadText) === 'json' ? 'apps-script' : 'live' };
        } catch (e) {
            liveError = e;
            console.warn("Failed to fetch live AutoPM data, attempting fallback:", e);
            try {
                const cachedPayload = localStorage.getItem('autopm_data_cache') || localStorage.getItem('autopm_csv_cache');
                const cachedTime = localStorage.getItem('autopm_sync_timestamp');
                if (cachedPayload && cachedTime) {
                    this.processAutoPMData(cachedPayload);
                    this.lastSyncTime = new Date(cachedTime);
                    this.syncAudit = {
                        ok: false,
                        source: 'Cache',
                        urlType: this.detectUrlType(dataUrl),
                        message: 'ใช้ข้อมูลแคชล่าสุดแทนข้อมูลสด',
                        lastError: liveError.message,
                        rawRows: this.dataMeta.rawRows || this.dataMeta.rows || 0,
                        validVehicles: this.vehicles.length,
                        skippedRows: this.dataMeta.skippedRows || 0,
                        cachedAt: cachedTime
                    };
                    return {
                        success: true,
                        source: 'cache',
                        timestamp: this.lastSyncTime,
                        warning: `ดึงข้อมูลสดไม่สำเร็จ (${liveError.message}) จึงใช้ข้อมูลแคชล่าสุดแทน`
                    };
                }

                const response = await fetch('data.csv', { cache: 'no-store' });
                if (!response.ok) throw new Error(`Local data.csv HTTP ${response.status}`);
                const csvText = await response.text();
                this.processCSVData(csvText);
                this.dataMeta = { ...this.dataMeta, source: 'data.csv', version: '3.5.3', updatedAt: new Date().toISOString(), rows: Math.max((this.rawVehicles || []).length, 0), validVehicles: Math.max((this.rawVehicles || []).length, 0) };
                this.lastSyncTime = new Date();
                this.syncAudit = { ok: false, source: 'data.csv', urlType: 'Local CSV', message: 'ใช้ไฟล์ data.csv ในโปรเจกต์', lastError: liveError.message, rawRows: this.dataMeta.rawRows || this.dataMeta.rows || 0, validVehicles: this.vehicles.length, skippedRows: this.dataMeta.skippedRows || 0, cachedAt: this.lastSyncTime.toISOString() };
                return {
                    success: true,
                    source: 'local',
                    warning: `ดึงข้อมูลสดไม่สำเร็จ (${liveError.message}) จึงใช้ไฟล์ data.csv แทน`
                };
            } catch (localError) {
                console.error("Critical: Failed to load all data sources:", localError);
                return {
                    success: false,
                    error: `ข้อมูลสด: ${liveError.message} | data.csv/cache: ${localError.message}`
                };
            }
        }
    }

    async fetchTextWithJsonpFallback(url) {
        try {
            const response = await fetch(url, { cache: 'no-store', redirect: 'follow' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (fetchError) {
            // Apps Script sometimes redirects in a way that some browsers block by CORS.
            // If the Apps Script endpoint supports ?callback=..., JSONP can still load it safely as read-only data.
            if (!/script\.google\.com|script\.googleusercontent\.com/.test(url)) {
                throw fetchError;
            }
            console.warn('Fetch failed, trying JSONP fallback for Apps Script:', fetchError);
            const json = await this.fetchJsonp(url);
            return JSON.stringify(json);
        }
    }

    fetchJsonp(url) {
        return new Promise((resolve, reject) => {
            const callbackName = `autopmJsonp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
            const separator = url.includes('?') ? '&' : '?';
            const script = document.createElement('script');
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error('Apps Script JSONP timeout'));
            }, 20000);

            const cleanup = () => {
                clearTimeout(timer);
                try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
                if (script.parentNode) script.parentNode.removeChild(script);
            };

            window[callbackName] = (data) => {
                cleanup();
                resolve(data);
            };

            script.onerror = () => {
                cleanup();
                reject(new Error('Apps Script JSONP load failed'));
            };
            script.src = `${url}${separator}callback=${callbackName}&_=${Date.now()}`;
            document.head.appendChild(script);
        });
    }

    detectPayloadType(text) {
        const first = (text || '').trim()[0];
        return (first === '{' || first === '[') ? 'json' : 'csv';
    }

    detectUrlType(url) {
        const value = String(url || '');
        if (/script\.google\.com|script\.googleusercontent\.com/.test(value)) return 'Apps Script Web App';
        if (/output=csv|format=csv/.test(value)) return 'Google Sheet CSV';
        if (/data\.csv/.test(value)) return 'Local CSV';
        return 'URL';
    }

    processAutoPMData(payloadText) {
        if (this.detectPayloadType(payloadText) === 'json') {
            const payload = JSON.parse(payloadText);
            this.processJSONData(payload);
        } else {
            this.processCSVData(payloadText);
        }
    }

    processJSONData(payload) {
        if (payload && payload.success === false) {
            throw new Error(payload.error || 'Apps Script API returned success=false');
        }
        let rows = null;

        // Recommended Apps Script response: { success:true, rows:[[header...],[data...]] }
        if (payload && Array.isArray(payload.rows)) {
            rows = payload.rows;
        } else if (payload && Array.isArray(payload.values)) {
            rows = payload.values;
        } else if (Array.isArray(payload)) {
            rows = payload;
        }

        // Also support object-array response: { data:[{header:value}] } or [{header:value}]
        const objectRows = payload && Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : null);
        if ((!rows || !rows.length) && objectRows && objectRows.length && !Array.isArray(objectRows[0])) {
            const headers = Object.keys(objectRows[0]);
            rows = [headers, ...objectRows.map(obj => headers.map(h => obj[h] ?? ''))];
        }

        if (!rows || rows.length < 2) throw new Error("Apps Script JSON has insufficient data rows");

        this.dataMeta = {
            source: payload.source || 'Apps Script API',
            version: payload.version || '3.5.3',
            updatedAt: payload.updatedAt || payload.timestamp || new Date().toISOString(),
            rows: payload.rowCount || Math.max(rows.length - 1, 0),
            spreadsheetName: payload.spreadsheetName || '',
            sheetName: payload.sheetName || ''
        };

        this.processRows(rows);
    }

    processCSVData(csvText) {
        const rows = parseCSV(csvText);
        this.dataMeta = { source: 'CSV', version: '3.5.3', updatedAt: new Date().toISOString(), rows: Math.max(rows.length - 1, 0) };
        this.processRows(rows);
    }

    processRows(rows) {
        if (rows.length < 2) throw new Error("Data has insufficient rows");

        const headers = rows[0];
        const headerIndex = buildHeaderIndex(headers);
        const parsedVehicles = [];
        const rawDataRows = Math.max(rows.length - 1, 0);
        let skippedRows = 0;

        // Header-first mapping. Fallback index is kept for backward compatibility with the current sheet.
        const columns = {
            index: { aliases: ['ลำดับ', 'index', 'no'], fallback: 0 },
            vehicleNo: { aliases: ['เบอร์รถ', 'รหัสรถ', 'vehicle no', 'vehicle'], fallback: 5 },
            license: { aliases: ['ทะเบียนรถ', 'ทะเบียน', 'license plate'], fallback: 6 },
            model: { aliases: ['รุ่นรถ', 'model'], fallback: 2 },
            fleetPrimary: { aliases: ['ประจำคลังโยกฟลีต', 'คลังโยกฟลีต', 'fleet'], fallback: 4 },
            fleetFallback: { aliases: ['ประจำคลัง', 'คลัง'], fallback: 3 },
            businessType: { aliases: ['แยกประเภทธุรกิจ', 'ประเภทขนส่ง', 'ประเภทธุรกิจ', 'business type'], fallback: 36 },
            businessFallback: { aliases: ['ประเภทขนส่ง'], fallback: 1 },
            responsible: { aliases: ['ผู้รับผิดชอบ', 'responsible', 'owner'], fallback: 38 },
            pmInterval: { aliases: ['ระยะกำหนด PM', 'ระยะกำหนดpm', 'pm interval'], fallback: 20 },
            avgKmPerMonth: { aliases: ['วิ่งเฉลี่ยต่อเดือน', 'avg km', 'average km'], fallback: 21 },
            lastKm: { aliases: ['KM ล่าสุด', 'เลขไมล์ล่าสุด', 'last km'], fallback: 22, occurrence: 0 },
            lastKmDate: { aliases: ['วันที่ KM ล่าสุด', 'วันที่บันทึก KM', 'KM ล่าสุด', 'last km date'], fallback: 23, occurrence: 1 },
            nextKm: { aliases: ['กิโลเมตรครั้งต่อไป', 'เลขไมล์ครั้งต่อไป', 'KM ครั้งต่อไป', 'next km'], fallback: 29 },
            remainingKm: { aliases: ['ระยะคงเหลือ', 'ระยะคงเหลือกม', 'remaining km'], fallback: 24 },
            planDate: { aliases: ['ประมาณการ PLan', 'ประมาณการ Plan', 'วันที่ plan', 'plan date'], fallback: 32 },
            lastChangeDate: { aliases: ['วันที่เข้าเปลี่ยนล่าสุด', 'วันที่เปลี่ยนล่าสุด', 'last change date'], fallback: 34 },
            modelYear: { aliases: ['M/Y', 'MY', 'm/y', 'ปีรถ', 'model year'], fallback: 33 },
            vehicleType: { aliases: ['ประเภทรถ', 'ประเภท รถ', 'vehicle type', 'truck type', 'car type'], fallback: 37 },
            statusSheet: { aliases: ['Status', 'สถานะ'], fallback: 35 },
            weeklyNote: { aliases: ['อื่น', 'อื่น ', 'หมายเหตุ'], fallback: 19 }
        };

        const get = (row, cfg, defaultOccurrence = 0) => getCellByHeader(
            row,
            headerIndex,
            cfg.aliases,
            cfg.fallback,
            cfg.occurrence ?? defaultOccurrence
        );
        
        for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            if (!r || r.every(cell => !String(cell || '').trim())) { skippedRows++; continue; }
            
            const index = get(r, columns.index);
            if (!index || isNaN(parseInt(index))) { skippedRows++; continue; }
            
            const vehicleNo = get(r, columns.vehicleNo);
            const license = get(r, columns.license);
            const vehicleModel = get(r, columns.model);
            const fleet = get(r, columns.fleetPrimary) || get(r, columns.fleetFallback) || "ไม่ระบุคลัง";
            // Phase 4.1.7: Business filter must use Google Sheet Column AK only.
            // Reason: the sheet may contain duplicate/old business headers earlier in the table,
            // so header matching could accidentally read the wrong column. AK is the current
            // single source of truth for "ประเภทธุรกิจ". A=0, AK=36.
            const businessTypeFromAK = String(r[36] || '').trim();
            const businessType = businessTypeFromAK || get(r, columns.businessType) || get(r, columns.businessFallback) || "ไม่ระบุธุรกิจ";
            const responsible = get(r, columns.responsible) || "ไม่ระบุผู้รับผิดชอบ";
            
            const pmInterval = parseNumber(get(r, columns.pmInterval), 30000);
            const avgKmPerMonth = parseNumber(get(r, columns.avgKmPerMonth), 10000);
            const lastKm = parseNumber(get(r, columns.lastKm), 0);
            const lastKmDateRaw = get(r, columns.lastKmDate);
            const remainingKmRaw = get(r, columns.remainingKm);
            const remainingKmFromSheet = remainingKmRaw !== '' ? parseNumber(remainingKmRaw, NaN) : NaN;
            let nextKm = parseNumber(get(r, columns.nextKm), NaN);
            // ใช้ Column Y: ระยะคงเหลือ เป็นตัวหลัก เพราะชีทคำนวณไว้แล้ว
            // ถ้าไม่มีค่า Column Y จึงค่อยคำนวณจาก KM ครั้งต่อไป - KM ล่าสุด
            const remainingKm = Number.isFinite(remainingKmFromSheet)
                ? remainingKmFromSheet
                : (Number.isFinite(nextKm) ? nextKm - lastKm : pmInterval);
            if (!Number.isFinite(nextKm)) nextKm = lastKm + remainingKm;
            const planDateRaw = get(r, columns.planDate);
            const lastChangeDateRaw = get(r, columns.lastChangeDate);
            const modelYear = get(r, columns.modelYear) || 'ไม่ระบุ M/Y';
            const vehicleType = get(r, columns.vehicleType) || 'ไม่ระบุประเภทรถ';
            
            const monthlySchedule = {};
            const monthNamesEng = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthNamesThai = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
            const monthHeaderAliases = [
                ['มค.', 'ม.ค.', 'Jan'], ['กพ.', 'ก.พ.', 'Feb'], ['มีค.', 'มี.ค.', 'Mar'], ['เมย.', 'เม.ย.', 'Apr'],
                ['พค.', 'พ.ค.', 'May'], ['มิย.', 'มิ.ย.', 'Jun'], ['กค.', 'ก.ค.', 'Jul'], ['สค.', 'ส.ค.', 'Aug'],
                ['กย.', 'ก.ย.', 'Sep'], ['ตค.', 'ต.ค.', 'Oct'], ['พย.', 'พ.ย.', 'Nov'], ['ธค.', 'ธ.ค.', 'Dec']
            ];
            for (let m = 0; m < 12; m++) {
                const val = getCellByHeader(r, headerIndex, monthHeaderAliases[m], 7 + m, 0);
                if (val) {
                    monthlySchedule[m] = {
                        monthEng: monthNamesEng[m],
                        monthThai: monthNamesThai[m],
                        packageCode: val
                    };
                }
            }
            
            const weeklyNote = get(r, columns.weeklyNote);

            let calculatedStatus = "OK";
            if (remainingKm < -2000) calculatedStatus = "เกินระยะPM";
            else if (remainingKm <= 2000) calculatedStatus = "ติดตามเรียกเข้า PM";
            else if (remainingKm <= 4000) calculatedStatus = "เตรียมPM";

            parsedVehicles.push({
                id: index,
                vehicleNo: vehicleNo,
                license: license,
                model: vehicleModel,
                fleet: fleet,
                businessType: businessType,
                responsible: responsible,
                pmInterval: pmInterval,
                avgKmPerMonth: avgKmPerMonth,
                lastKm: lastKm,
                lastKmDate: lastKmDateRaw,
                nextKm: nextKm,
                remainingKm: remainingKm,
                planDate: planDateRaw,
                lastChangeDate: lastChangeDateRaw,
                modelYear: modelYear,
                vehicleType: vehicleType,
                status: calculatedStatus,
                statusSheet: get(r, columns.statusSheet),
                monthlySchedule: monthlySchedule,
                weeklyNote: weeklyNote
            });
        }
        
        if (parsedVehicles.length === 0) {
            throw new Error("ไม่พบข้อมูลรถจาก CSV: โปรดตรวจหัวตารางหรือไฟล์ข้อมูล");
        }

        this.rawVehicles = parsedVehicles;
        this.vehicles = parsedVehicles;
        this.dataMeta = {
            ...this.dataMeta,
            rawRows: rawDataRows,
            validVehicles: parsedVehicles.length,
            skippedRows: skippedRows,
            rows: parsedVehicles.length
        };
        console.log(`Successfully parsed ${this.vehicles.length} vehicles using header-based mapping. Raw rows: ${rawDataRows}, skipped: ${skippedRows}`);
    }

    getVehicles() {
        return this.vehicles;
    }

    getUniqueBusinessTypes() {
        return [...new Set(this.rawVehicles.map(v => v.businessType))].filter(Boolean).sort();
    }

    getUniqueFleets() {
        return [...new Set(this.rawVehicles.map(v => v.fleet))].filter(Boolean).sort();
    }

    getUniqueModels() {
        return [...new Set(this.rawVehicles.map(v => v.model))].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), 'th'));
    }

    getUniqueVehicleTypes() {
        return [...new Set(this.rawVehicles.map(v => v.vehicleType))].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), 'th'));
    }

    getUniqueResponsibles() {
        return [...new Set(this.rawVehicles.map(v => v.responsible))].filter(Boolean).sort();
    }

    // Dashboard metrics helper
    getMetrics() {
        const total = this.rawVehicles.length;
        const overdue = this.rawVehicles.filter(v => v.status === "เกินระยะPM").length;
        const callIn = this.rawVehicles.filter(v => v.status === "ติดตามเรียกเข้า PM").length;
        const prepare = this.rawVehicles.filter(v => v.status === "เตรียมPM").length;
        const ok = this.rawVehicles.filter(v => v.status === "OK").length;

        return {
            total: total,
            overdue: overdue,
            upcoming: callIn + prepare,
            callIn: callIn,
            prepare: prepare,
            ok: ok
        };
    }

    // Dynamic grouping summary logic (Requirement 2)
    getSummaryGrouping(field) {
        const groups = {};
        
        this.rawVehicles.forEach(v => {
            const key = v[field] || "ไม่ระบุ";
            if (!groups[key]) {
                groups[key] = {
                    name: key,
                    total: 0,
                    overdue: 0,
                    callIn: 0,
                    prepare: 0,
                    ok: 0
                };
            }
            
            groups[key].total++;
            if (v.status === "เกินระยะPM") groups[key].overdue++;
            else if (v.status === "ติดตามเรียกเข้า PM") groups[key].callIn++;
            else if (v.status === "เตรียมPM") groups[key].prepare++;
            else if (v.status === "OK") groups[key].ok++;
        });

        // Convert object to array and calculate percent safe
        return Object.values(groups).map(g => {
            // Safety percentage represents vehicles that are OK, Prepare, or Call-In (i.e. not overdue)
            // Or let's say OK + Prepare is high safety, Call-in is warning, Overdue is danger.
            // Let's count safe as (OK + Prepare + Call-In) / total or OK / total. Let's make it OK + Prepare + Call-In (non-overdue).
            const safeCount = g.ok + g.prepare + g.callIn;
            g.pctSafe = g.total > 0 ? Math.round((safeCount / g.total) * 100) : 0;
            return g;
        }).sort((a, b) => b.total - a.total); // Sort by quantity descending
    }
}

// UI Controller
class UIController {
    constructor(manager) {
        this.manager = manager;
        
        // Navigation Elements
        this.navItems = document.querySelectorAll('.nav-item');
        this.contentViews = document.querySelectorAll('.content-view');
        this.pageTitle = document.getElementById('page-title');
        this.pageSubtitle = document.getElementById('page-subtitle');
        this.systemTimeText = document.getElementById('system-time');
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.sidebar = document.getElementById('sidebar');
        
        // Sync Buttons
        this.btnQuickSync = document.getElementById('btn-quick-sync');
        this.btnFetchLive = document.getElementById('btn-fetch-live');
        this.btnFetchLocal = document.getElementById('btn-fetch-local');
        this.googleSheetUrlInput = document.getElementById('google-sheet-url');
        this.syncStatusText = document.getElementById('sync-status');
        this.syncHealthPanel = document.getElementById('sync-health-panel');
        this.syncClearCache = document.getElementById('btn-clear-cache');
        
        // Fleet Page search/filters
        this.fleetSearchInput = document.getElementById('fleet-search-input');
        this.fleetFilterBusiness = document.getElementById('fleet-filter-business');
        this.fleetFilterFleet = document.getElementById('fleet-filter-fleet');
        this.fleetFilterModel = document.getElementById('fleet-filter-model');
        this.fleetFilterVehicleType = document.getElementById('fleet-filter-vehicle-type');
        this.fleetFilterModelYear = document.getElementById('fleet-filter-model-year');
        this.fleetFilterResponsible = document.getElementById('fleet-filter-responsible');
        this.fleetResetFilters = document.getElementById('fleet-reset-filters');
        this.fleetSortBy = document.getElementById('fleet-sort-by');
        this.fleetTableBody = document.getElementById('fleet-table-body');
        this.fleetEmptyState = document.getElementById('fleet-empty-state');
        
        // Quick tab filter buttons
        this.statusQuickTabs = document.querySelectorAll('.status-tab');
        this.currentQuickStatusFilter = 'all';

        // Pagination variables
        this.currentPage = 1;
        this.itemsPerPage = 25;
        this.filteredVehicles = [];
        this.btnPrevPage = document.getElementById('btn-prev-page');
        this.btnNextPage = document.getElementById('btn-next-page');
        this.paginationStart = document.getElementById('pagination-start');
        this.paginationEnd = document.getElementById('pagination-end');
        this.paginationTotal = document.getElementById('pagination-total');
        this.paginationPageNums = document.getElementById('pagination-page-nums');

        // Summary Page Elements
        this.summaryTabs = document.querySelectorAll('.summary-tabs .tab-btn');
        this.summaryTableTitle = document.getElementById('summary-table-title');
        this.summaryTableBody = document.getElementById('summary-table-body');
        this.currentSummaryGroupBy = 'business'; // Default
        this.currentSummaryDrilldown = null; // Phase 2.3: click summary numbers to view vehicle list
        
        // Calendar Page Elements
        this.btnPrevMonth = document.getElementById('btn-prev-month');
        this.btnNextMonth = document.getElementById('btn-next-month');
        this.calendarMonthYearText = document.getElementById('calendar-month-year');
        this.calendarDaysGrid = document.getElementById('calendar-days');
        this.calendarDetailDateText = document.getElementById('calendar-detail-date');
        this.calendarDetailList = document.getElementById('calendar-detail-list');
        this.calendarDayCountBadge = document.getElementById('calendar-day-count-badge');
        this.calendarDateStart = document.getElementById('calendar-date-start');
        this.calendarDateEnd = document.getElementById('calendar-date-end');
        this.calendarPeriodMode = document.getElementById('calendar-period-mode');
        this.calendarSummaryGroup = document.getElementById('calendar-summary-group');
        this.calendarDateSource = document.getElementById('calendar-date-source');
        this.calendarFilterBusiness = document.getElementById('calendar-filter-business');
        this.calendarFilterFleet = document.getElementById('calendar-filter-fleet');
        this.calendarResetFilters = document.getElementById('calendar-reset-filters');
        this.calendarRangeTotal = document.getElementById('calendar-range-total');
        this.calendarRangeSummary = document.getElementById('calendar-range-summary');
        
        // Odometer Date Context
        this.currentCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        this.selectedCalendarDateStr = null;

        // Modal Elements
        this.vehicleModal = document.getElementById('vehicle-modal');
        this.btnCloseModal = document.getElementById('btn-close-modal');
        this.btnCloseMdFooter = document.getElementById('btn-close-md-footer');
        
        // Settings backup
        this.btnExportCSV = document.getElementById('btn-export-csv');
        this.btnExportJSON = document.getElementById('btn-export-json');

        // Toast Container
        this.toastContainer = document.getElementById('toast-container');
    }

    init() {
        this.updateSystemDate();
        this.renderSyncHealth();
        this.setupNavigation();
        this.setupEventListeners();
        this.loadInitialData();
    }

    formatThaiDateTime(value, includeSeconds = false) {
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear() + 543;
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return includeSeconds ? `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}` : `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
    }

    updateSystemDate() {
        if (!this.systemTimeText) return;
        const todayText = this.formatThaiDateTime(new Date()).split(' ')[0];
        const meta = this.manager && this.manager.dataMeta ? this.manager.dataMeta : null;
        const updatedText = meta && meta.updatedAt ? this.formatThaiDateTime(meta.updatedAt) : '-';
        // Show the same vehicle count used by the dashboard, not raw API rows.
        // Apps Script may return raw sheet rows / combined rows, while the app filters valid vehicles.
        const vehicleCount = this.manager && Array.isArray(this.manager.vehicles)
            ? this.manager.vehicles.length
            : (meta && meta.rows ? Number(meta.rows) : 0);
        const rowText = vehicleCount ? `${Number(vehicleCount).toLocaleString()} คัน` : '';
        const sourceText = meta && meta.source ? meta.source : '';
        this.systemTimeText.innerHTML = `
            <span class="system-date-main">${todayText}</span>
            <span class="system-date-sub">อัปเดตข้อมูล: ${updatedText}${rowText ? ' | ' + rowText : ''}${sourceText ? ' | ' + sourceText : ''}</span>
        `;
    }



    renderDashboardDataState() {
        const box = document.getElementById('dashboard-data-state');
        if (!box) return;
        const audit = this.manager && this.manager.syncAudit ? this.manager.syncAudit : {};
        const meta = this.manager && this.manager.dataMeta ? this.manager.dataMeta : {};
        const groups = this.manager.getDashboardStats ? this.manager.getDashboardStats() : null;
        const overdue = groups ? Number(groups.overdue || 0) : 0;
        const updated = meta.updatedAt ? this.formatThaiDateTime(meta.updatedAt) : (audit.cachedAt ? this.formatThaiDateTime(audit.cachedAt) : '-');
        if (audit && audit.ok === false && (audit.source === 'Cache' || audit.source === 'data.csv')) {
            box.style.display = 'block';
            box.className = 'dashboard-data-state warning';
            box.innerHTML = `<div><strong>⚠ ใช้ข้อมูล Cache ล่าสุด</strong><span>อัปเดตล่าสุด: ${updated}</span></div><button class="btn btn-sm btn-primary" data-dashboard-action="refresh">Sync ใหม่</button>`;
            box.querySelector('[data-dashboard-action="refresh"]').addEventListener('click', () => this.syncFromGoogleSheets());
            return;
        }
        if (overdue === 0 && groups && Number(groups.total || 0) > 0) {
            box.style.display = 'block';
            box.className = 'dashboard-data-state success';
            box.innerHTML = `<div><strong>🎉 ไม่มีรถเกินระยะ PM</strong><span>Fleet อยู่ในสภาวะปกติ</span></div>`;
            return;
        }
        box.style.display = 'none';
    }

    renderSyncHealth() {
        if (!this.syncHealthPanel) return;
        const meta = this.manager && this.manager.dataMeta ? this.manager.dataMeta : {};
        const audit = this.manager && this.manager.syncAudit ? this.manager.syncAudit : {};
        const valid = Number(meta.validVehicles || (this.manager.vehicles || []).length || 0);
        const raw = Number(meta.rawRows || meta.rows || 0);
        const skipped = Number(meta.skippedRows || 0);
        const apiRows = Number(meta.rawRows || audit.rawRows || 0);
        const updated = meta.updatedAt ? this.formatThaiDateTime(meta.updatedAt, true) : '-';
        const source = audit.source || meta.source || '-';
        const version = meta.version || '3.5.3';
        const healthClass = audit.ok ? 'good' : (source === 'Cache' || source === 'data.csv' ? 'warn' : 'neutral');
        const healthText = audit.ok ? 'ข้อมูลสดจาก API พร้อมใช้งาน' : (audit.message || 'รอเชื่อมต่อข้อมูล');
        const diff = raw && valid ? raw - valid : skipped;
        this.syncHealthPanel.innerHTML = `
            <div class="sync-health-head">
                <div>
                    <h4>สถานะข้อมูลระบบ</h4>
                    <p>${healthText}</p>
                </div>
                <span class="sync-health-pill ${healthClass}">${source}</span>
            </div>
            <div class="sync-health-grid">
                <div class="sync-health-item"><span>รถที่ใช้งานใน Dashboard</span><strong>${valid.toLocaleString()} คัน</strong></div>
                <div class="sync-health-item"><span>แถวดิบจาก API/CSV</span><strong>${apiRows.toLocaleString()} แถว</strong></div>
                <div class="sync-health-item"><span>แถวที่ข้าม/ไม่เข้าเงื่อนไข</span><strong>${diff.toLocaleString()} แถว</strong></div>
                <div class="sync-health-item"><span>อัปเดตล่าสุด</span><strong>${updated}</strong></div>
                <div class="sync-health-item"><span>ประเภทลิงก์</span><strong>${audit.urlType || '-'}</strong></div>
                <div class="sync-health-item"><span>API Version</span><strong>${version}</strong></div>
            </div>
            ${audit.lastError ? `<div class="sync-health-error">ข้อควรระวัง: ${audit.lastError}</div>` : ''}
        `;
    }

    clearLocalCache() {
        ['autopm_data_cache', 'autopm_csv_cache', 'autopm_sync_timestamp'].forEach(k => localStorage.removeItem(k));
        if (this.manager && this.manager.syncAudit) {
            this.manager.syncAudit.cachedAt = '';
            this.manager.syncAudit.message = 'ล้างแคชแล้ว กดดึงข้อมูลล่าสุดอีกครั้ง';
        }
        this.renderSyncHealth();
        this.showToast('ล้าง Cache ข้อมูลสำรองแล้ว', 'success');
    }

    setupNavigation() {
        const dashboardGroup = document.getElementById('nav-dashboard-group');
        const dashboardParent = dashboardGroup ? dashboardGroup.querySelector('.nav-parent') : null;
        const dashboardTargets = new Set(['dashboard', 'summary', 'fleet', 'calendar']);

        if (dashboardParent && !dashboardParent.dataset.collapseReady) {
            dashboardParent.dataset.collapseReady = '1';
            dashboardParent.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = dashboardGroup.classList.contains('open');
                dashboardGroup.classList.toggle('open', !isOpen);
                dashboardParent.setAttribute('aria-expanded', String(!isOpen));
                const chevron = dashboardParent.querySelector('.nav-chevron');
                if (chevron) chevron.textContent = !isOpen ? '▼' : '▶';
                if (!isOpen) {
                    // เปิดเมนูอย่างเดียว ไม่บังคับเปลี่ยนหน้า เพื่อไม่ให้รบกวนคนใช้งาน
                    dashboardGroup.classList.add('group-active');
                    dashboardParent.classList.add('active');
                }
            });
        }

        this.navItems.forEach(item => {
            if (item.classList.contains('nav-parent')) return;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('data-target');
                
                if (dashboardGroup && dashboardTargets.has(target)) {
                    dashboardGroup.classList.add('open');
                    dashboardGroup.classList.add('group-active');
                    const chevron = dashboardGroup.querySelector('.nav-chevron');
                    if (chevron) chevron.textContent = '▼';
                } else if (dashboardGroup) {
                    dashboardGroup.classList.remove('group-active');
                }

                this.navItems.forEach(nav => nav.classList.remove('active'));
                const activeItems = document.querySelectorAll(`.nav-item[data-target="${target}"]`);
                activeItems.forEach(nav => nav.classList.add('active'));
                if (dashboardGroup && dashboardTargets.has(target) && dashboardParent) dashboardParent.classList.add('active');
                
                this.contentViews.forEach(view => view.classList.remove('active'));
                const activeView = document.getElementById(`view-${target}`);
                if (activeView) activeView.classList.add('active');
                
                this.updateHeaderTitles(target);
                
                if (target === 'dashboard') {
                    this.renderDashboard();
                } else if (target === 'summary') {
                    this.renderSummaryTab();
                } else if (target === 'fleet') {
                    this.applyFilters(true);
                } else if (target === 'calendar') {
                    this.renderCalendar();
                }
                
                this.sidebar.classList.remove('active');
            });
        });

        this.mobileToggle.addEventListener('click', () => {
            this.sidebar.classList.toggle('active');
        });
    }

    updateHeaderTitles(target) {
        const titles = {
            'dashboard': { title: 'ภาพรวม Dashboard', sub: 'Executive PM Command Center · Fleet Health / Overdue / Follow Up' },
            'summary': { title: 'สรุปรายงานกลุ่มรถ', sub: 'รายงานแบ่งกลุ่มตามประเภทธุรกิจ, คลังโยกฟลีต, รุ่นรถ และผู้รับผิดชอบ' },
            'fleet': { title: 'ระบบติดตาม PM รายรถ', sub: 'ค้นหา ตรวจเช็คค่าเลขไมล์คงเหลือ และจัดอันดับการเรียกเข้าทำ PM' },
            'calendar': { title: 'ปฏิทินงานซ่อมบำรุง PM', sub: `ตารางแผนการเข้าทำ PM ประจำปี ${new Date().getFullYear() + 543} จำแนกตามรายวันและรายเดือน` },
            'sync': { title: 'เชื่อมโยงข้อมูล & ตั้งค่า', sub: 'จัดการเชื่อมต่อ API Google Sheets ดึงข้อมูลล่าสุด และสำรองระบบ' }
        };

        const config = titles[target] || { title: 'AutoPM', sub: 'Fleet Maintenance System' };
        this.pageTitle.innerText = config.title;
        this.pageSubtitle.innerText = config.sub;
    }

    setupEventListeners() {
        // Sync Buttons
        this.btnQuickSync.addEventListener('click', () => this.syncFromGoogleSheets());
        this.btnFetchLive.addEventListener('click', () => this.syncFromGoogleSheets());
        this.btnFetchLocal.addEventListener('click', () => this.syncFromLocalCSV());
        if (this.syncClearCache) this.syncClearCache.addEventListener('click', () => this.clearLocalCache());
        
        // Fleet filters
        this.fleetSearchInput.addEventListener('input', () => this.applyFilters(true));
        this.fleetFilterBusiness.addEventListener('change', () => {
            this.updateFleetDependentDropdowns({ resetFleet: true, resetModel: true, resetVehicleType: true, resetModelYear: true, resetResponsible: true });
            this.applyFilters(true);
        });
        this.fleetFilterFleet.addEventListener('change', () => {
            this.updateFleetDependentDropdowns({ resetModel: true, resetModelYear: true, resetResponsible: true });
            this.applyFilters(true);
        });
        this.fleetFilterModel.addEventListener('change', () => {
            this.updateFleetDependentDropdowns({ resetVehicleType: true, resetModelYear: true, resetResponsible: true });
            this.applyFilters(true);
        });
        if (this.fleetFilterVehicleType) {
            this.fleetFilterVehicleType.addEventListener('change', () => {
                this.updateFleetDependentDropdowns({ resetModelYear: true, resetResponsible: true });
                this.applyFilters(true);
            });
        }
        if (this.fleetFilterModelYear) {
            this.fleetFilterModelYear.addEventListener('change', () => {
                this.updateFleetDependentDropdowns({ resetResponsible: true });
                this.applyFilters(true);
            });
        }
        this.fleetFilterResponsible.addEventListener('change', () => this.applyFilters(true));
        this.fleetSortBy.addEventListener('change', () => this.applyFilters(true));
        if (this.fleetResetFilters) {
            this.fleetResetFilters.addEventListener('click', () => this.resetFleetFilters());
        }
        
        // Quick tab filters
        this.statusQuickTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.statusQuickTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentQuickStatusFilter = tab.getAttribute('data-status');
                this.applyFilters(true);
            });
        });

        // Summary grouping tabs
        this.summaryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.summaryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentSummaryGroupBy = tab.getAttribute('data-group-by');
                this.currentSummaryDrilldown = null;
                this.renderSummaryTab();
            });
        });

        // Calendar controls
        this.btnPrevMonth.addEventListener('click', () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
            this.syncCalendarRangeWithMode();
            this.renderCalendar();
        });
        this.btnNextMonth.addEventListener('click', () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
            this.syncCalendarRangeWithMode();
            this.renderCalendar();
        });
        if (this.calendarPeriodMode) {
            this.calendarPeriodMode.addEventListener('change', () => {
                this.syncCalendarRangeWithMode();
                this.renderCalendar();
            });
        }
        [this.calendarDateStart, this.calendarDateEnd, this.calendarDateSource, this.calendarSummaryGroup, this.calendarFilterBusiness, this.calendarFilterFleet]
            .filter(Boolean)
            .forEach(el => el.addEventListener('change', () => {
                if (el === this.calendarDateStart || el === this.calendarDateEnd) {
                    this.calendarPeriodMode.value = 'custom';
                    this.updateCalendarFleetDropdown(true);
                }
                if (el === this.calendarDateSource || el === this.calendarFilterBusiness) {
                    // Filter คลังโยกฟลีตให้เหลือเฉพาะรายการที่มีจริงตามวันที่/ธุรกิจที่เลือก
                    this.updateCalendarFleetDropdown(false);
                }
                this.renderCalendar();
            }));
        if (this.calendarResetFilters) {
            this.calendarResetFilters.addEventListener('click', () => {
                this.resetCalendarFilters();
            });
        }

        // Pagination buttons
        this.btnPrevPage.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderFleetTable();
            }
        });
        this.btnNextPage.addEventListener('click', () => {
            const maxPage = Math.ceil(this.filteredVehicles.length / this.itemsPerPage);
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.renderFleetTable();
            }
        });

        // Modal close
        this.btnCloseModal.addEventListener('click', () => this.closeVehicleModal());
        this.btnCloseMdFooter.addEventListener('click', () => this.closeVehicleModal());
        this.vehicleModal.addEventListener('click', (e) => {
            if (e.target === this.vehicleModal) this.closeVehicleModal();
        });

        // Export Buttons
        this.btnExportCSV.addEventListener('click', () => this.exportCSV());
        this.btnExportJSON.addEventListener('click', () => this.exportJSONBackup());

        // Phase 4.1 Dashboard Quick Actions
        document.querySelectorAll('[data-dashboard-action]').forEach(btn => {
            btn.addEventListener('click', () => this.handleDashboardAction(btn.getAttribute('data-dashboard-action')));
        });
    }

    handleDashboardAction(action) {
        if (action === 'tracking') return this.gotoView('fleet');
        if (action === 'calendar') return this.gotoView('calendar');
        if (action === 'exportCSV') return this.exportCSV();
        if (action === 'refresh') return this.syncFromGoogleSheets();
        if (action === 'copyUrgent') return this.copyUrgentVehicles();
    }

    gotoView(target) {
        const item = document.querySelector(`.nav-item[data-target="${target}"]`);
        if (item) item.click();
    }

    copyUrgentVehicles() {
        const urgentVehicles = this.manager.getVehicles()
            .filter(v => v.status === "เกินระยะPM" || v.status === "ติดตามเรียกเข้า PM")
            .sort((a, b) => a.remainingKm - b.remainingKm)
            .slice(0, 30);
        if (!urgentVehicles.length) {
            this.showToast('ไม่มีรายการเร่งด่วนให้คัดลอก', 'info');
            return;
        }
        const lines = urgentVehicles.map((v, idx) => `${idx + 1}. ${v.vehicleNo} | ${v.license} | ${v.model} | ${v.fleet} | ${Number(v.remainingKm).toLocaleString()} กม. | ${v.responsible}`);
        const text = `AutoPM - รายการ PM เร่งด่วน (${urgentVehicles.length} คัน)\n` + lines.join('\n');
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => this.showToast('คัดลอกรายการเร่งด่วนแล้ว', 'success'));
        } else {
            const ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
            this.showToast('คัดลอกรายการเร่งด่วนแล้ว', 'success');
        }
    }

    async loadInitialData() {
        // Load custom URL if exists
        const savedUrl = localStorage.getItem('autopm_custom_url');
        if (savedUrl) {
            this.googleSheetUrlInput.value = savedUrl;
        }

        this.syncStatusText.innerText = "กำลังโหลดข้อมูล...";
        this.syncStatusText.className = "sync-status-indicator loading";
        
        const result = await this.manager.loadData(this.googleSheetUrlInput.value);
        if (result.success) {
            let srcMsg = "Google Sheets";
            if (result.source === 'apps-script') srcMsg = "Apps Script API";
            if (result.source === 'local') srcMsg = "data.csv (เครื่อง)";
            if (result.source === 'cache') srcMsg = "แคชถิ่นฐาน";
            
            this.syncStatusText.innerText = `ดึงข้อมูลจาก ${srcMsg} สำเร็จ`;
            this.syncStatusText.className = "sync-status-indicator";
            this.showToast(`โหลดฐานข้อมูล PM เรียบร้อยแล้ว (${result.source})`, "success");
            if (result.warning) this.showToast(result.warning, "warning");
            
            this.populateFilterDropdowns();
            this.updateSystemDate();
            this.renderSyncHealth();
            this.renderDashboard();
            this.renderFleetBadgeWarning();
        } else {
            this.syncStatusText.innerText = "เกิดข้อผิดพลาดในการโหลดข้อมูล";
            this.syncStatusText.className = "sync-status-indicator loading";
            this.showToast(`ไม่สามารถโหลดข้อมูล PM ได้: ${result.error || 'ไม่ทราบสาเหตุ'}`, "danger");
        }
    }

    async syncFromGoogleSheets() {
        const url = this.googleSheetUrlInput.value.trim();
        if (!url) {
            this.showToast("โปรดใส่ลิงก์ Google Sheets", "warning");
            return;
        }

        this.syncStatusText.innerText = "กำลังอัพเดทข้อมูล...";
        this.syncStatusText.className = "sync-status-indicator loading";
        this.showToast("กำลังเชื่อมต่อ Google Sheets / Apps Script API...", "info");
        
        const result = await this.manager.loadData(url);
        if (result.success) {
            this.syncStatusText.innerText = (result.source === 'live' || result.source === 'apps-script') ? "อัพเดทสดสำเร็จ" : "ใช้ข้อมูลสำรอง";
            this.syncStatusText.className = "sync-status-indicator";
            this.showToast((result.source === 'live' || result.source === 'apps-script') ? "ดึงข้อมูลล่าสุดเรียบร้อยแล้ว" : `โหลดข้อมูลสำรองสำเร็จ (${result.source})`, (result.source === 'live' || result.source === 'apps-script') ? "success" : "warning");
            if (result.warning) this.showToast(result.warning, "warning");
            
            this.populateFilterDropdowns();
            this.updateSystemDate();
            this.renderSyncHealth();
            
            // Refresh currently active view
            const activeNav = document.querySelector('.nav-item.active');
            const activeTarget = activeNav ? activeNav.getAttribute('data-target') : 'dashboard';
            
            if (activeTarget === 'dashboard') this.renderDashboard();
            else if (activeTarget === 'summary') this.renderSummaryTab();
            else if (activeTarget === 'fleet') this.applyFilters(true);
            else if (activeTarget === 'calendar') this.renderCalendar();
            
            this.renderFleetBadgeWarning();
        } else {
            this.syncStatusText.innerText = "การซิงค์ล้มเหลว";
            this.syncStatusText.className = "sync-status-indicator loading";
            this.showToast(`เชื่อมต่อข้อมูลล้มเหลว: ${result.error || 'โปรดตรวจสิทธิ์ Google Sheet หรือไฟล์ data.csv'}`, "danger");
        }
    }

    async syncFromLocalCSV() {
        this.syncStatusText.innerText = "กำลังอ่านไฟล์เครื่อง...";
        this.syncStatusText.className = "sync-status-indicator loading";
        
        const response = await fetch('data.csv');
        if (response.ok) {
            const csvText = await response.text();
            this.manager.processCSVData(csvText);
            this.manager.lastSyncTime = new Date();
            this.manager.syncAudit = { ok: false, source: 'data.csv', urlType: 'Local CSV', message: 'โหลดข้อมูลจากไฟล์สำรองในโปรเจกต์', lastError: '', rawRows: this.manager.dataMeta.rawRows || this.manager.dataMeta.rows || 0, validVehicles: this.manager.vehicles.length, skippedRows: this.manager.dataMeta.skippedRows || 0, cachedAt: this.manager.lastSyncTime.toISOString() };
            
            this.syncStatusText.innerText = "โหลดไฟล์เครื่องสำเร็จ";
            this.syncStatusText.className = "sync-status-indicator";
            this.showToast("โหลดฐานข้อมูล PM ท้องถิ่น (data.csv) เรียบร้อยแล้ว", "success");
            
            this.populateFilterDropdowns();
            this.updateSystemDate();
            this.renderSyncHealth();
            this.applyFilters(true);
            this.renderFleetBadgeWarning();
        } else {
            this.syncStatusText.innerText = "ไม่พบไฟล์ data.csv";
            this.syncStatusText.className = "sync-status-indicator loading";
            this.showToast("ไม่พบไฟล์ data.csv ในที่จัดเก็บข้อมูลหลัก", "danger");
        }
    }

    populateFilterDropdowns() {
        // Business types
        const businesses = this.manager.getUniqueBusinessTypes();
        this.fleetFilterBusiness.innerHTML = '<option value="all">ทุกธุรกิจขนส่ง</option>';
        businesses.forEach(b => {
            this.fleetFilterBusiness.innerHTML += `<option value="${b}">${b}</option>`;
        });

        // Tracking filters: dependent dropdowns (Business > Fleet > Model > Responsible)
        this.updateFleetDependentDropdowns({ resetFleet: true, resetModel: true, resetVehicleType: true, resetModelYear: true, resetResponsible: true });

        // Calendar filters: Business master, Fleet is dependent on selected business/date range
        if (this.calendarFilterBusiness) {
            this.calendarFilterBusiness.innerHTML = '<option value="all">ทุกธุรกิจขนส่ง</option>';
            businesses.forEach(b => {
                this.calendarFilterBusiness.innerHTML += `<option value="${b}">${b}</option>`;
            });
        }
        this.initializeCalendarRangeDefaults();
        this.updateCalendarFleetDropdown(false);

    }

    getFleetFilterBaseVehicles() {
        let vehicles = this.manager.getVehicles();
        const biz = this.fleetFilterBusiness?.value || 'all';
        const fleet = this.fleetFilterFleet?.value || 'all';
        const model = this.fleetFilterModel?.value || 'all';
        const modelYear = this.fleetFilterModelYear?.value || 'all';
        const vehicleType = this.fleetFilterVehicleType?.value || 'all';

        if (biz !== 'all') vehicles = vehicles.filter(v => v.businessType === biz);
        if (fleet !== 'all') vehicles = vehicles.filter(v => v.fleet === fleet);
        if (model !== 'all') vehicles = vehicles.filter(v => v.model === model);
        if (vehicleType !== 'all') vehicles = vehicles.filter(v => v.vehicleType === vehicleType);
        if (modelYear !== 'all') vehicles = vehicles.filter(v => v.modelYear === modelYear);
        return vehicles;
    }

    setSelectOptions(selectEl, defaultLabel, values, currentValue = 'all') {
        if (!selectEl) return;
        const uniqueValues = [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'th'));
        selectEl.innerHTML = `<option value="all">${defaultLabel}</option>`;
        uniqueValues.forEach(value => {
            selectEl.innerHTML += `<option value="${this.escapeHtml(value)}">${this.escapeHtml(value)}</option>`;
        });
        selectEl.value = uniqueValues.includes(currentValue) ? currentValue : 'all';
    }

    updateFleetDependentDropdowns(options = {}) {
        const { resetFleet = false, resetModel = false, resetVehicleType = false, resetModelYear = false, resetResponsible = false } = options;
        const allVehicles = this.manager.getVehicles();
        const biz = this.fleetFilterBusiness?.value || 'all';
        const selectedFleet = resetFleet ? 'all' : (this.fleetFilterFleet?.value || 'all');
        const selectedModel = resetModel ? 'all' : (this.fleetFilterModel?.value || 'all');
        const selectedVehicleType = resetVehicleType ? 'all' : (this.fleetFilterVehicleType?.value || 'all');
        const selectedModelYear = resetModelYear ? 'all' : (this.fleetFilterModelYear?.value || 'all');
        const selectedResponsible = resetResponsible ? 'all' : (this.fleetFilterResponsible?.value || 'all');

        const byBusiness = biz === 'all' ? allVehicles : allVehicles.filter(v => v.businessType === biz);
        this.setSelectOptions(this.fleetFilterFleet, 'ทุกคลังโยกฟลีต', byBusiness.map(v => v.fleet), selectedFleet);

        const activeFleet = this.fleetFilterFleet?.value || 'all';
        let byBusinessFleet = byBusiness;
        if (activeFleet !== 'all') byBusinessFleet = byBusinessFleet.filter(v => v.fleet === activeFleet);
        this.setSelectOptions(this.fleetFilterModel, 'ทุกรุ่นรถ', byBusinessFleet.map(v => v.model), selectedModel);

        const activeModel = this.fleetFilterModel?.value || 'all';
        let byBusinessFleetModel = byBusinessFleet;
        if (activeModel !== 'all') byBusinessFleetModel = byBusinessFleetModel.filter(v => v.model === activeModel);
        this.setSelectOptions(this.fleetFilterVehicleType, 'ทุกประเภทรถ', byBusinessFleetModel.map(v => v.vehicleType), selectedVehicleType);

        const activeVehicleType = this.fleetFilterVehicleType?.value || 'all';
        let byBusinessFleetModelType = byBusinessFleetModel;
        if (activeVehicleType !== 'all') byBusinessFleetModelType = byBusinessFleetModelType.filter(v => v.vehicleType === activeVehicleType);
        this.setSelectOptions(this.fleetFilterModelYear, 'ทุก M/Y', byBusinessFleetModelType.map(v => v.modelYear), selectedModelYear);

        const activeModelYear = this.fleetFilterModelYear?.value || 'all';
        let byBusinessFleetModelTypeYear = byBusinessFleetModelType;
        if (activeModelYear !== 'all') byBusinessFleetModelTypeYear = byBusinessFleetModelTypeYear.filter(v => v.modelYear === activeModelYear);
        this.setSelectOptions(this.fleetFilterResponsible, 'ผู้รับผิดชอบทั้งหมด', byBusinessFleetModelTypeYear.map(v => v.responsible), selectedResponsible);
    }

    resetFleetFilters() {
        this.fleetSearchInput.value = '';
        this.fleetFilterBusiness.value = 'all';
        this.currentQuickStatusFilter = 'all';
        this.statusQuickTabs.forEach(tab => tab.classList.toggle('active', tab.getAttribute('data-status') === 'all'));
        this.updateFleetDependentDropdowns({ resetFleet: true, resetModel: true, resetVehicleType: true, resetModelYear: true, resetResponsible: true });
        this.fleetSortBy.value = 'id-asc';
        this.applyFilters(true);
        this.showToast('รีเซ็ตฟิลเตอร์หน้าติดตาม PM รายรถแล้ว', 'success');
    }

    renderFleetBadgeWarning() {
        const metrics = this.manager.getMetrics();
        const warningCount = metrics.overdue + metrics.callIn;
        const badge = document.getElementById('fleet-badge-warning');
        
        if (warningCount > 0) {
            badge.innerText = warningCount;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // VIEW 1: DASHBOARD RENDER
    renderDashboard() {
        const metrics = this.manager.getMetrics();
        
        // Render Metric Value Numbers
        document.getElementById('stat-total-vehicles').innerText = metrics.total;
        document.getElementById('stat-overdue').innerText = metrics.overdue;
        document.getElementById('stat-upcoming-pm').innerText = metrics.upcoming;
        document.getElementById('stat-ok-status').innerText = metrics.ok;

        const total = metrics.total || 1;
        this.setTextIfExists('stat-overdue-pct', `${Math.round(metrics.overdue / total * 100)}% ของฟลีต`);
        this.setTextIfExists('stat-upcoming-pct', `${Math.round(metrics.upcoming / total * 100)}% ต้องติดตาม`);
        this.setTextIfExists('stat-ok-pct', `${Math.round(metrics.ok / total * 100)}% ปลอดภัย`);
        this.setTextIfExists('stat-total-note', `${metrics.total.toLocaleString()} คันในระบบ`);

        // Phase 4.1 Command Center UX
        this.renderCommandCenter(metrics);
        this.renderKpiTrend(metrics);
        this.renderSyncMonitor();
        this.renderResponsibleRanking();
        this.renderMonthlyTrend();
        
        // Render Donut Chart (Status distribution)
        this.renderStatusDonutChart(metrics);
        
        // Render Urgent Alerts (Overdue & Call In)
        this.renderUrgentAlerts();
        
        // Render Business Type Bar Chart
        this.renderBusinessTypeBars();
        this.renderVehicleTypeMix();
        this.renderTopCritical();
        this.initKpiHoverPopups();
        this.renderDashboardDataState();
    }

    getDashboardStatusVehicles(type) {
        const vehicles = this.manager.getVehicles();
        if (type === 'overdue') return vehicles.filter(v => v.status === 'เกินระยะPM').sort((a, b) => a.remainingKm - b.remainingKm);
        if (type === 'watch') return vehicles.filter(v => v.status === 'ติดตามเรียกเข้า PM' || v.status === 'เตรียมPM').sort((a, b) => a.remainingKm - b.remainingKm);
        if (type === 'ok') return vehicles.filter(v => v.status === 'OK').sort((a, b) => b.remainingKm - a.remainingKm);
        return vehicles.slice().sort((a, b) => a.vehicleNo.localeCompare(b.vehicleNo, 'th'));
    }

    getDashboardStatusMeta(type) {
        const map = {
            all: { title: 'รถในระบบทั้งหมด', dot: '#60a5fa', desc: 'แสดงรถทั้งหมดในฐานข้อมูล AutoPM', badge: 'ALL' },
            overdue: { title: 'เกินระยะ PM (Overdue)', dot: '#ef4444', desc: 'ระยะคงเหลือต่ำกว่า -2,000 กม. ควรเร่งจัดการก่อน', badge: 'CRITICAL' },
            watch: { title: 'ติดตามเรียกเข้า PM / เตรียม PM', dot: '#f59e0b', desc: 'รถที่ควรประสานเรียกเข้า หรือเตรียมแผน PM ล่วงหน้า', badge: 'WATCH' },
            ok: { title: 'สถานะ OK (ระยะปลอดภัย)', dot: '#10b981', desc: 'รถที่ยังมีระยะเหลือมากกว่า 4,000 กม.', badge: 'SAFE' },
        };
        return map[type] || map.all;
    }

    getStatusPillClass(status) {
        if (status === 'เกินระยะPM') return 'danger';
        if (status === 'ติดตามเรียกเข้า PM') return 'orange';
        if (status === 'เตรียมPM') return 'warning';
        return 'success';
    }

    renderKpiHoverPopup(type) {
        const pop = document.getElementById('kpi-hover-popover');
        if (!pop) return;
        const meta = this.getDashboardStatusMeta(type);
        const vehicles = this.getDashboardStatusVehicles(type);
        const total = this.manager.getVehicles().length || 1;
        const pct = Math.round((vehicles.length / total) * 100);
        const rows = vehicles.slice(0, 80).map((v, idx) => {
            const km = Number(v.remainingKm || 0).toLocaleString();
            const pillClass = this.getStatusPillClass(v.status);
            return `
                <div class="kpi-pop-row" data-vehicle-no="${this.escapeHtml(v.vehicleNo)}">
                    <div class="kpi-pop-rank">${idx + 1}</div>
                    <div class="kpi-pop-main">
                        <strong>${this.escapeHtml(v.vehicleNo || '-')}</strong>
                        <span>${this.escapeHtml(v.license || '-')} · ${this.escapeHtml(v.model || '-')} · ${this.escapeHtml(v.fleet || '-')}</span>
                    </div>
                    <div class="kpi-pop-side">
                        <b>${km} กม.</b>
                        <span class="kpi-pop-pill ${pillClass}">${this.escapeHtml(v.status || '-')}</span>
                    </div>
                </div>
            `;
        }).join('');

        pop.innerHTML = `
            <div class="kpi-pop-head" style="--accent:${meta.dot}">
                <div>
                    <span class="kpi-pop-eyebrow">${meta.badge}</span>
                    <h4><span class="kpi-pop-dot"></span>${meta.title}</h4>
                    <p>${meta.desc}</p>
                </div>
                <div class="kpi-pop-count">
                    <strong>${vehicles.length.toLocaleString()}</strong>
                    <span>${pct}%</span>
                </div>
            </div>
            <div class="kpi-pop-actions">
                <button type="button" data-kpi-action="tracking" data-kpi-type="${type}">เปิด Tracking</button>
                <button type="button" data-kpi-action="copy" data-kpi-type="${type}">Copy รายการ</button>
                <button type="button" data-kpi-action="export" data-kpi-type="${type}">Export CSV</button>
            </div>
            <div class="kpi-pop-list">
                ${rows || '<div class="kpi-pop-empty">ไม่พบรถในสถานะนี้</div>'}
            </div>
            ${vehicles.length > 80 ? `<div class="kpi-pop-foot">แสดง 80 จาก ${vehicles.length.toLocaleString()} คัน · ใช้ปุ่มเปิด Tracking เพื่อดูทั้งหมด</div>` : ''}
        `;

        pop.querySelectorAll('.kpi-pop-row').forEach(row => {
            row.addEventListener('click', () => {
                const no = row.getAttribute('data-vehicle-no');
                const v = this.manager.getVehicles().find(x => String(x.vehicleNo) === String(no));
                if (v) this.openVehicleModal(v);
            });
        });
        pop.querySelectorAll('[data-kpi-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-kpi-action');
                const ktype = btn.getAttribute('data-kpi-type');
                if (action === 'tracking') {
                    this.openTrackingFromKpi(ktype);
                } else if (action === 'copy') {
                    this.copyKpiVehicleList(ktype);
                } else if (action === 'export') {
                    this.exportKpiVehicleList(ktype);
                }
            });
        });
    }

    openTrackingFromKpi(type) {
        const map = { overdue: 'overdue', watch: 'upcoming', ok: 'ok', all: 'all' };
        this.currentQuickStatusFilter = map[type] || 'all';
        this.statusQuickTabs.forEach(tab => tab.classList.toggle('active', tab.getAttribute('data-status') === this.currentQuickStatusFilter));
        this.gotoView('fleet');
    }

    copyKpiVehicleList(type) {
        const meta = this.getDashboardStatusMeta(type);
        const vehicles = this.getDashboardStatusVehicles(type);
        const text = [`AutoPM - ${meta.title} (${vehicles.length.toLocaleString()} คัน)`]
            .concat(vehicles.map((v, i) => `${i + 1}. ${v.vehicleNo} | ${v.license} | ${v.model} | ${v.fleet} | ${Number(v.remainingKm || 0).toLocaleString()} กม. | ${v.responsible}`))
            .join('\n');
        navigator.clipboard.writeText(text).then(() => this.showToast('คัดลอกรายการรถแล้ว', 'success'));
    }


    exportKpiVehicleList(type) {
        const meta = this.getDashboardStatusMeta(type);
        const vehicles = this.getDashboardStatusVehicles(type);
        if (!vehicles.length) {
            this.showToast('ไม่พบข้อมูลสำหรับ Export', 'info');
            return;
        }
        const headers = ['ลำดับ','เบอร์รถ','ทะเบียน','รุ่นรถ','ประเภทรถ','ธุรกิจ','คลัง','ผู้รับผิดชอบ','ระยะคงเหลือ','สถานะ'];
        const rows = vehicles.map((v, i) => [i + 1, v.vehicleNo, v.license, v.model, v.vehicleType, v.businessType, v.fleet, v.responsible, v.remainingKm, v.status]);
        const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AutoPM_${meta.title.replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.showToast('Export CSV ตามสถานะแล้ว', 'success');
    }

    positionKpiPopup(event) {
        const pop = document.getElementById('kpi-hover-popover');
        if (!pop) return;
        const margin = 16;
        const rect = pop.getBoundingClientRect();
        let x = event.clientX + 18;
        let y = event.clientY + 18;
        if (x + rect.width + margin > window.innerWidth) x = event.clientX - rect.width - 18;
        if (y + rect.height + margin > window.innerHeight) y = window.innerHeight - rect.height - margin;
        if (x < margin) x = margin;
        if (y < margin) y = margin;
        pop.style.left = `${x}px`;
        pop.style.top = `${y}px`;
    }

    initKpiHoverPopups() {
        const pop = document.getElementById('kpi-hover-popover');
        const cards = document.querySelectorAll('.kpi-hover-card');
        if (!pop || !cards.length) return;
        let hideTimer = null;
        let showTimer = null;
        let lastMouseEvent = null;
        const delayMs = 2000; // Phase 4.1.4: ลดความรำคาญผู้บริหาร ชี้ค้าง 2 วินาทีก่อนแสดงรายการ

        const show = (e, type) => {
            clearTimeout(hideTimer);
            clearTimeout(showTimer);
            this.renderKpiHoverPopup(type);
            pop.classList.add('show');
            pop.setAttribute('aria-hidden', 'false');
            this.positionKpiPopup(e);
        };
        const scheduleShow = (e, type) => {
            clearTimeout(hideTimer);
            clearTimeout(showTimer);
            lastMouseEvent = e;
            showTimer = setTimeout(() => show(lastMouseEvent || e, type), delayMs);
        };
        const scheduleHide = () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                pop.classList.remove('show');
                pop.setAttribute('aria-hidden', 'true');
            }, 220);
        };
        cards.forEach(card => {
            if (card.dataset.kpiHoverReady === '1') return;
            card.dataset.kpiHoverReady = '1';
            card.addEventListener('mouseenter', e => scheduleShow(e, card.getAttribute('data-kpi-hover')));
            card.addEventListener('mousemove', e => {
                lastMouseEvent = e;
                if (pop.classList.contains('show')) this.positionKpiPopup(e);
            });
            card.addEventListener('mouseleave', scheduleHide);
            card.addEventListener('click', () => this.openTrackingFromKpi(card.getAttribute('data-kpi-hover')));
        });
        if (pop.dataset.kpiHoverReady !== '1') {
            pop.dataset.kpiHoverReady = '1';
            pop.addEventListener('mouseenter', () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            });
            pop.addEventListener('mouseleave', scheduleHide);
        }
    }

    setTextIfExists(id, value) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    }

    setClassIfExists(id, className) {
        const el = document.getElementById(id);
        if (el) el.className = className;
    }

    getMetricSnapshot() {
        try { return JSON.parse(localStorage.getItem('autopm_metric_snapshot') || 'null'); }
        catch (e) { return null; }
    }

    saveMetricSnapshot(metrics) {
        const snap = {
            ts: new Date().toISOString(),
            total: metrics.total || 0,
            overdue: metrics.overdue || 0,
            followup: (metrics.callIn || 0) + (metrics.prepare || 0),
            safe: metrics.ok || 0
        };
        localStorage.setItem('autopm_metric_snapshot', JSON.stringify(snap));
    }

    trendLabel(current, previous, positiveIsGood = false) {
        if (previous === undefined || previous === null || Number.isNaN(Number(previous))) return { text: 'Baseline', cls: 'neutral' };
        const diff = Number(current) - Number(previous);
        if (diff === 0) return { text: 'ไม่เปลี่ยนแปลง', cls: 'neutral' };
        const up = diff > 0;
        const good = positiveIsGood ? up : !up;
        const arrow = up ? '▲' : '▼';
        return { text: `${arrow} ${Math.abs(diff).toLocaleString()} จากรอบก่อน`, cls: good ? 'good' : 'bad' };
    }

    renderKpiTrend(metrics) {
        const prev = this.getMetricSnapshot();
        const followup = (metrics.callIn || 0) + (metrics.prepare || 0);
        const updates = [
            ['trend-total', this.trendLabel(metrics.total, prev && prev.total, true)],
            ['trend-critical', this.trendLabel(metrics.overdue, prev && prev.overdue, false)],
            ['trend-followup', this.trendLabel(followup, prev && prev.followup, false)],
            ['trend-safe', this.trendLabel(metrics.ok, prev && prev.safe, true)],
        ];
        updates.forEach(([id, trend]) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = trend.text;
            el.className = `kpi-trend ${trend.cls}`;
        });
        window.clearTimeout(this._metricSnapshotTimer);
        this._metricSnapshotTimer = window.setTimeout(() => this.saveMetricSnapshot(metrics), 900);
    }

    renderSyncMonitor() {
        const audit = this.manager && this.manager.syncAudit ? this.manager.syncAudit : {};
        const meta = this.manager && this.manager.dataMeta ? this.manager.dataMeta : {};
        const ok = !!audit.ok && !audit.lastError;
        const source = audit.source || meta.source || '-';
        const updatedRaw = audit.cachedAt || meta.updatedAt || (this.manager.lastSyncTime ? this.manager.lastSyncTime.toISOString() : '');
        let updated = '-';
        if (updatedRaw) {
            const d = new Date(updatedRaw);
            updated = Number.isNaN(d.getTime()) ? updatedRaw : d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
        }
        this.setTextIfExists('sync-monitor-status', ok ? 'Online / ข้อมูลสด' : 'Cache Mode / ตรวจสอบข้อมูล');
        this.setTextIfExists('sync-monitor-source', ok ? 'Apps Script API พร้อมใช้งาน' : (audit.message || 'ใช้ข้อมูลสำรองล่าสุด'));
        this.setTextIfExists('sync-monitor-last', updated);
        this.setTextIfExists('sync-monitor-records', (meta.validVehicles || audit.validVehicles || this.manager.getVehicles().length || 0).toLocaleString());
        this.setTextIfExists('sync-monitor-version', meta.version || '4.1.6');
        this.setTextIfExists('sync-monitor-mode', source);
        const card = document.getElementById('sync-monitor-card');
        if (card) card.classList.toggle('cache-mode', !ok);
        const dot = document.getElementById('sync-monitor-dot');
        if (dot) dot.className = `sync-live-dot ${ok ? 'online' : 'cache'}`;
    }

    renderTopCritical() {
        const container = document.getElementById('top-critical-list');
        if (!container) return;
        const critical = this.manager.getVehicles()
            .filter(v => v.status === 'เกินระยะPM')
            .sort((a, b) => a.remainingKm - b.remainingKm)
            .slice(0, 10);
        if (!critical.length) {
            container.innerHTML = `
                <div class="top-critical-empty">
                    <strong>🎉 ไม่มีรถเกินระยะ PM</strong>
                    <span>Fleet อยู่ในสภาวะปกติ</span>
                </div>
            `;
            return;
        }
        container.innerHTML = critical.map((v, idx) => `
            <div class="critical-row" data-vehicle-no="${this.escapeHtml(v.vehicleNo)}">
                <div class="critical-rank">${idx + 1}</div>
                <div class="critical-main">
                    <strong>${this.escapeHtml(v.vehicleNo || '-')} <small>${this.escapeHtml(v.license || '')}</small></strong>
                    <span>${this.escapeHtml(v.model || '-')} · ${this.escapeHtml(v.vehicleType || '-')} · ${this.escapeHtml(v.fleet || '-')}</span>
                </div>
                <div class="critical-km">${Number(v.remainingKm || 0).toLocaleString()} กม.</div>
            </div>
        `).join('');
        container.querySelectorAll('.critical-row').forEach(row => {
            row.addEventListener('click', () => {
                const no = row.getAttribute('data-vehicle-no');
                const v = this.manager.getVehicles().find(x => String(x.vehicleNo) === String(no));
                if (v) this.openVehicleModal(v);
            });
        });
    }

    getFleetHealth(metrics) {
        const total = metrics.total || 1;
        const score = ((metrics.ok * 100) + (metrics.prepare * 86) + (metrics.callIn * 68) + (metrics.overdue * 28)) / total;
        const rounded = Math.max(0, Math.min(100, Math.round(score * 10) / 10));
        let grade = 'D';
        if (rounded >= 98) grade = 'S';
        else if (rounded >= 95) grade = 'A+';
        else if (rounded >= 90) grade = 'A';
        else if (rounded >= 85) grade = 'B+';
        else if (rounded >= 75) grade = 'B';
        else if (rounded >= 65) grade = 'C';
        return { score: rounded, grade };
    }

    renderCommandCenter(metrics) {
        const health = this.getFleetHealth(metrics);
        this.setTextIfExists('fleet-health-score', `${health.score}/100`);
        this.setTextIfExists('fleet-health-grade', health.grade);
        const bar = document.getElementById('fleet-health-bar');
        if (bar) bar.style.width = `${health.score}%`;
        const critical = metrics.overdue;
        const followup = metrics.callIn + metrics.prepare;
        const safeRate = metrics.total ? Math.round((metrics.ok + metrics.prepare) / metrics.total * 100) : 0;
        const riskLoad = metrics.total ? Math.round((critical + metrics.callIn) / metrics.total * 100) : 0;
        this.setTextIfExists('brief-total', metrics.total.toLocaleString());
        this.setTextIfExists('brief-critical', critical.toLocaleString());
        this.setTextIfExists('brief-followup', followup.toLocaleString());
        this.setTextIfExists('brief-safe', metrics.ok.toLocaleString());
        this.setTextIfExists('hero-total-vehicles', metrics.total.toLocaleString());
        this.setTextIfExists('hero-safe-rate', `${safeRate}%`);
        this.setTextIfExists('hero-risk-load', `${riskLoad}%`);
        const hero = document.querySelector('.command-hero-card');
        if (hero) {
            hero.classList.toggle('health-risk', critical > 0);
            hero.classList.toggle('health-excellent', critical === 0 && health.score >= 95);
        }
        const note = critical > 0
            ? `มี ${critical.toLocaleString()} คันต้องเร่งจัดการ และ ${followup.toLocaleString()} คันควรติดตามแผน`
            : `ไม่มีรถเกินระยะ PM ฟลีตอยู่ในโหมดควบคุมได้`;
        this.setTextIfExists('fleet-health-note', note);
    }

    renderResponsibleRanking() {
        const container = document.getElementById('responsible-ranking-list');
        if (!container) return;
        const groups = this.manager.getSummaryGrouping('responsible').slice(0, 5);
        container.innerHTML = groups.map((g, idx) => {
            const health = g.total ? Math.round(((g.ok + g.prepare + g.callIn) / g.total) * 100) : 0;
            const cls = health >= 98 ? 'rank-s' : health >= 95 ? 'rank-a' : health >= 90 ? 'rank-b' : 'rank-c';
            return `
                <div class="ranking-row ${cls}">
                    <div class="ranking-pos">${idx + 1}</div>
                    <div class="ranking-main">
                        <strong>${this.escapeHtml(g.name)}</strong>
                        <span>${g.total.toLocaleString()} คัน | เกินระยะ ${g.overdue} | ติดตาม ${g.callIn} | เตรียม ${g.prepare}</span>
                    </div>
                    <div class="ranking-score">${health}%</div>
                </div>
            `;
        }).join('');
    }

    renderMonthlyTrend() {
        const container = document.getElementById('monthly-trend-bars');
        if (!container) return;
        const months = Array.from({ length: 12 }, (_, i) => ({ m: i, total: 0, overdue: 0, callIn: 0, prepare: 0, ok: 0 }));
        const currentYear = new Date().getFullYear();
        let parsedDateCount = 0;
        this.manager.getVehicles().forEach(v => {
            const planDateObj = DateUtils.toDate(v.planDate);
            if (!planDateObj) return;
            if (planDateObj.getFullYear() !== currentYear) return;
            parsedDateCount++;
            const g = months[planDateObj.getMonth()];
            g.total++;
            if (v.status === 'เกินระยะPM') g.overdue++;
            else if (v.status === 'ติดตามเรียกเข้า PM') g.callIn++;
            else if (v.status === 'เตรียมPM') g.prepare++;
            else g.ok++;
        });
        const names = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
        if (parsedDateCount === 0) {
            container.innerHTML = `<div class="trend-empty-state">ไม่พบข้อมูลวันที่ประมาณการ PLAN ที่อ่านได้<br><small>รองรับรูปแบบ 22/06/2569, 2026-06-22, 22 มิ.ย. 2569</small></div>`;
            return;
        }
        const max = Math.max(1, ...months.map(x => x.total));
        container.innerHTML = months.map(g => {
            const h = Math.max(8, Math.round((g.total / max) * 100));
            return `
                <div class="trend-month" title="${names[g.m]}: ${g.total} คัน | เกิน ${g.overdue} | ติดตาม ${g.callIn} | เตรียม ${g.prepare}">
                    <div class="trend-bars">
                        <span class="trend-bar-danger" style="height:${g.total ? Math.max(4, g.overdue / max * 100) : 0}%"></span>
                        <span class="trend-bar-orange" style="height:${g.total ? Math.max(4, g.callIn / max * 100) : 0}%"></span>
                        <span class="trend-bar-warning" style="height:${g.total ? Math.max(4, g.prepare / max * 100) : 0}%"></span>
                        <span class="trend-bar-main" style="height:${h}%"></span>
                    </div>
                    <strong>${g.total}</strong>
                    <small>${names[g.m]}</small>
                </div>
            `;
        }).join('');
    }

    renderStatusDonutChart(metrics) {
        const total = metrics.total || 1;
        const overduePct = Math.round((metrics.overdue / total) * 100);
        const callInPct = Math.round((metrics.callIn / total) * 100);
        const preparePct = Math.round((metrics.prepare / total) * 100);
        const okPct = 100 - (overduePct + callInPct + preparePct); // Prevent round errors
        
        const chartElement = document.getElementById('status-donut-chart');
        document.getElementById('donut-total').innerText = metrics.total;
        
        // Compute conic gradient degrees
        // Overdue (red): ef4444
        // Call-in (orange): f97316
        // Prepare (yellow): f59e0b
        // OK (green): 10b981
        const degOverdue = (metrics.overdue / total) * 360;
        const degCallIn = (metrics.callIn / total) * 360;
        const degPrepare = (metrics.prepare / total) * 360;
        
        const startCallIn = degOverdue;
        const startPrepare = startCallIn + degCallIn;
        const startOK = startPrepare + degPrepare;
        
        chartElement.style.background = `conic-gradient(
            #ef4444 0deg ${degOverdue}deg,
            #f97316 ${startCallIn}deg ${startPrepare}deg,
            #f59e0b ${startPrepare}deg ${startOK}deg,
            #10b981 ${startOK}deg 360deg
        )`;

        // Render Legend values
        const legendContainer = document.getElementById('status-chart-legend');
        legendContainer.innerHTML = `
            <div class="legend-item">
                <div class="legend-label-group">
                    <span class="legend-color-dot" style="background-color: #ef4444;"></span>
                    <span>เกินระยะ PM (Overdue)</span>
                </div>
                <div>
                    <span class="legend-val">${metrics.overdue}</span>
                    <span class="legend-pct">(${overduePct}%)</span>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-label-group">
                    <span class="legend-color-dot" style="background-color: #f97316;"></span>
                    <span>ติดตามเรียกเข้า PM</span>
                </div>
                <div>
                    <span class="legend-val">${metrics.callIn}</span>
                    <span class="legend-pct">(${callInPct}%)</span>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-label-group">
                    <span class="legend-color-dot" style="background-color: #f59e0b;"></span>
                    <span>เตรียม PM (Prepare)</span>
                </div>
                <div>
                    <span class="legend-val">${metrics.prepare}</span>
                    <span class="legend-pct">(${preparePct}%)</span>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-label-group">
                    <span class="legend-color-dot" style="background-color: #10b981;"></span>
                    <span>ระยะปกติ (OK)</span>
                </div>
                <div>
                    <span class="legend-val">${metrics.ok}</span>
                    <span class="legend-pct">(${Math.max(0, okPct)}%)</span>
                </div>
            </div>
        `;
    }

    renderUrgentAlerts() {
        const container = document.getElementById('alert-list-container');
        const alertBadge = document.getElementById('alert-count-badge');
        
        // Find overdue & call-in vehicles
        const urgentVehicles = this.manager.getVehicles().filter(v => 
            v.status === "เกินระยะPM" || v.status === "ติดตามเรียกเข้า PM"
        ).sort((a, b) => a.remainingKm - b.remainingKm); // Most critical first
        
        alertBadge.innerText = urgentVehicles.length;
        
        if (urgentVehicles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path></svg>
                    <p>ไม่มีรอบรถซ่อมบำรุงที่เกินระยะหรือต้องแจ้งเตือนในขณะนี้</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        // Show top 25 urgent vehicles to keep DOM clean
        const limit = Math.min(urgentVehicles.length, 25);
        for (let i = 0; i < limit; i++) {
            const v = urgentVehicles[i];
            const isOverdue = v.status === "เกินระยะPM";
            const colorDot = isOverdue ? '#ef4444' : '#f97316';
            const statusLabel = isOverdue ? "เกินกำหนด PM" : "ใกล้ถึงรอบเรียกเข้าทำ PM";
            const formattedDiff = v.remainingKm.toLocaleString();
            
            const alertElement = document.createElement('div');
            alertElement.className = 'alert-item';
            alertElement.innerHTML = `
                <div class="alert-info-col">
                    <span class="alert-dot-indicator" style="background-color: ${colorDot};"></span>
                    <div>
                        <div class="alert-item-title">เบอร์รถ ${v.vehicleNo} (${v.license})</div>
                        <div class="alert-item-subtitle">${v.model} | คลัง: ${v.fleet} | ผู้ดูแล: ${v.responsible}</div>
                    </div>
                </div>
                <div class="alert-action-col">
                    <div class="alert-item-meta" style="color: ${colorDot}">${formattedDiff} กม.</div>
                    <div class="alert-item-date">${statusLabel}</div>
                </div>
            `;
            
            alertElement.addEventListener('click', () => this.openVehicleModal(v));
            container.appendChild(alertElement);
        }
    }

    renderBusinessTypeBars() {
        const container = document.getElementById('business-summary-bars');
        const summary = this.manager.getSummaryGrouping('businessType');
        
        container.innerHTML = "";
        
        // Sum total vehicles for percentage calculation
        const totalVehicles = this.manager.getVehicles().length || 1;
        
        summary.forEach(g => {
            const pct = Math.round((g.total / totalVehicles) * 100);
            
            // Percentage of safe vehicles in this business
            // Safe = OK + Prepare + Call-In
            const nonOverdue = g.ok + g.prepare + g.callIn;
            const safetyRate = g.total > 0 ? Math.round((nonOverdue / g.total) * 100) : 0;
            let safetyColor = '#10b981'; // Green
            if (safetyRate < 80) safetyColor = '#f59e0b'; // Yellow
            if (safetyRate < 60) safetyColor = '#f97316'; // Orange
            if (safetyRate < 40) safetyColor = '#ef4444'; // Red
            
            container.innerHTML += `
                <div class="summary-bar-item">
                    <div class="bar-labels">
                        <span>ธุรกิจ: <strong>${g.name}</strong></span>
                        <span>${g.total} คัน (${pct}%)</span>
                    </div>
                    <div class="bar-details flex-row justify-between" style="font-size:0.75rem; margin-top:2px; margin-bottom:4px;">
                        <span>ความปลอดภัยฟลีต: <strong style="color: ${safetyColor}">${safetyRate}%</strong> (ปกติ ${g.ok + g.prepare} | เกินระยะ ${g.overdue})</span>
                        <span>ผู้จัดการดูแลหลัก: ${this.getTopResponsibleForBusiness(g.name)}</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${safetyRate}%; background: ${safetyColor};"></div>
                    </div>
                </div>
            `;
        });
    }

    getTopResponsibleForBusiness(bizName) {
        const vehicles = this.manager.getVehicles().filter(v => v.businessType === bizName);
        const counter = {};
        vehicles.forEach(v => {
            counter[v.responsible] = (counter[v.responsible] || 0) + 1;
        });
        
        let topRes = "-";
        let maxVal = -1;
        for (let name in counter) {
            if (counter[name] > maxVal) {
                maxVal = counter[name];
                topRes = name;
            }
        }
        return topRes;
    }

    renderVehicleTypeMix() {
        const container = document.getElementById('vehicle-type-mix');
        if (!container) return;
        const groups = this.manager.getSummaryGrouping('vehicleType')
            .filter(g => g.name && g.name !== 'ไม่ระบุประเภทรถ')
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);
        if (!groups.length) {
            container.innerHTML = '<div class="mini-empty">ยังไม่พบข้อมูลประเภทรถจาก Column AL</div>';
            return;
        }
        const total = this.manager.getVehicles().length || 1;
        container.innerHTML = groups.map((g, idx) => {
            const pct = Math.round(g.total / total * 100);
            const health = g.total ? Math.round(((g.ok + g.prepare + g.callIn) / g.total) * 100) : 0;
            const tone = health >= 98 ? 'excellent' : health >= 95 ? 'good' : health >= 90 ? 'watch' : 'risk';
            return `
                <div class="vehicle-type-row ${tone}" style="--vt-width:${pct}%">
                    <div class="vehicle-type-rank">${idx + 1}</div>
                    <div class="vehicle-type-main">
                        <strong>${this.escapeHtml(g.name)}</strong>
                        <span>${g.total.toLocaleString()} คัน (${pct}%) | เกิน ${g.overdue} | ติดตาม ${g.callIn} | เตรียม ${g.prepare}</span>
                    </div>
                    <div class="vehicle-type-health">${health}%</div>
                </div>
            `;
        }).join('');
    }

    // VIEW 2: SUMMARY GROUPING RENDER
    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    getSummaryFieldConfig() {
        const groupBy = this.currentSummaryGroupBy;
        if (groupBy === 'fleet') {
            return { fieldName: 'fleet', titleLabel: 'ประจำคลังโยกฟลีต', colLabel: 'ประจำคลังโยกฟลีต' };
        }
        if (groupBy === 'model') {
            return { fieldName: 'model', titleLabel: 'รุ่นรถยนต์ (Vehicle Model)', colLabel: 'รุ่นรถยนต์' };
        }
        if (groupBy === 'vehicleType') {
            return { fieldName: 'vehicleType', titleLabel: 'ประเภทรถ', colLabel: 'ประเภทรถ' };
        }
        if (groupBy === 'responsible') {
            return { fieldName: 'responsible', titleLabel: 'ผู้รับผิดชอบดำเนินการ', colLabel: 'ผู้รับผิดชอบ' };
        }
        return { fieldName: 'businessType', titleLabel: 'ประเภทธุรกิจขนส่ง', colLabel: 'ประเภทธุรกิจ' };
    }

    getSummaryVehicles(fieldName, groupName, statusType = 'total') {
        return this.manager.getVehicles().filter(v => {
            const sameGroup = (v[fieldName] || 'ไม่ระบุ') === groupName;
            if (!sameGroup) return false;
            if (statusType === 'total') return true;
            if (statusType === 'overdue') return v.status === 'เกินระยะPM';
            if (statusType === 'callIn') return v.status === 'ติดตามเรียกเข้า PM';
            if (statusType === 'prepare') return v.status === 'เตรียมPM';
            if (statusType === 'ok') return v.status === 'OK';
            return true;
        }).sort((a, b) => a.vehicleNo.localeCompare(b.vehicleNo, 'th', { numeric: true }));
    }

    makeSummaryCountButton(rowName, statusType, count, extraClass = '') {
        const active = this.currentSummaryDrilldown &&
            this.currentSummaryDrilldown.name === rowName &&
            this.currentSummaryDrilldown.statusType === statusType;
        const disabled = count === 0 ? 'disabled' : '';
        return `<button class="summary-count-btn ${extraClass} ${active ? 'active' : ''}" data-summary-name="${this.escapeHtml(rowName)}" data-summary-status="${statusType}" ${disabled}>${Number(count).toLocaleString()}</button>`;
    }

    getStatusLabel(statusType) {
        const map = {
            total: 'รถทั้งหมด',
            overdue: 'เกินระยะ PM',
            callIn: 'ติดตามเรียกเข้า PM',
            prepare: 'เตรียม PM',
            ok: 'ปลอดภัย (OK)'
        };
        return map[statusType] || 'รถทั้งหมด';
    }

    getStatusValueFromSummaryType(statusType) {
        const map = {
            overdue: 'เกินระยะPM',
            callIn: 'ติดตามเรียกเข้า PM',
            prepare: 'เตรียมPM',
            ok: 'OK'
        };
        return map[statusType] || 'all';
    }

    getSummaryDrilldownContext() {
        if (!this.currentSummaryDrilldown) return null;
        const { fieldName } = this.getSummaryFieldConfig();
        const { name, statusType } = this.currentSummaryDrilldown;
        const vehicles = this.getSummaryVehicles(fieldName, name, statusType);
        return { fieldName, name, statusType, vehicles };
    }

    makeVehicleLine(v, index = null) {
        const prefix = index === null ? '' : `${index + 1}. `;
        return `${prefix}${v.vehicleNo} | ทะเบียน ${v.license || '-'} | รุ่น ${v.model || '-'} | คลัง ${v.fleet || '-'} | ผู้ดูแล ${v.responsible || '-'} | คงเหลือ ${Number(v.remainingKm || 0).toLocaleString()} กม. | Plan ${DateUtils.formatThaiDate(v.planDate) || '-'}`;
    }

    copySummaryDrilldownText() {
        const ctx = this.getSummaryDrilldownContext();
        if (!ctx || ctx.vehicles.length === 0) {
            this.showToast('ไม่มีรายการรถให้คัดลอก', 'warning');
            return;
        }
        const title = `AutoPM: ${ctx.name} | ${this.getStatusLabel(ctx.statusType)} ${ctx.vehicles.length.toLocaleString()} คัน`;
        const text = [title, ...ctx.vehicles.map((v, i) => this.makeVehicleLine(v, i))].join('\n');
        const done = () => this.showToast('คัดลอกรายการรถแล้ว พร้อมส่งไลน์/แชท', 'success');
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done).catch(() => this.fallbackCopyText(text, done));
        } else {
            this.fallbackCopyText(text, done);
        }
    }

    fallbackCopyText(text, callback) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try { document.execCommand('copy'); } catch (e) { console.warn('Copy failed', e); }
        document.body.removeChild(textarea);
        if (callback) callback();
    }

    csvEscape(value) {
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
    }

    exportSummaryDrilldownCSV() {
        const ctx = this.getSummaryDrilldownContext();
        if (!ctx || ctx.vehicles.length === 0) {
            this.showToast('ไม่มีรายการรถให้ Export', 'warning');
            return;
        }
        const headers = ['ลำดับ', 'เบอร์รถ', 'ทะเบียนรถ', 'รุ่นรถ', 'M/Y', 'ประเภทรถ', 'ประเภทธุรกิจ', 'คลังโยกฟลีต', 'KM ล่าสุด', 'KM ถัดไป', 'ระยะคงเหลือ', 'วันที่ Plan', 'เปลี่ยนล่าสุด', 'สถานะ', 'ผู้รับผิดชอบ'];
        let csvContent = '﻿' + headers.map(h => this.csvEscape(h)).join(',') + '\r\n';
        ctx.vehicles.forEach((v, idx) => {
            const row = [idx + 1, v.vehicleNo, v.license, v.model, v.modelYear, v.vehicleType, v.businessType, v.fleet, v.lastKm, v.nextKm, v.remainingKm, DateUtils.formatThaiDate(v.planDate), v.lastChangeDate, v.status, v.responsible];
            csvContent += row.map(val => this.csvEscape(val)).join(',') + '\r\n';
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = String(ctx.name).replace(/[\/:*?"<>|]+/g, '_').slice(0, 40);
        link.href = url;
        link.download = `AutoPM_Drilldown_${safeName}_${ctx.statusType}_${DateUtils.todayStr()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showToast('Export รายการรถเป็น CSV แล้ว', 'success');
    }

    openSummaryDrilldownInTracking() {
        const ctx = this.getSummaryDrilldownContext();
        if (!ctx) return;

        this.navItems.forEach(nav => nav.classList.toggle('active', nav.getAttribute('data-target') === 'fleet'));
        this.contentViews.forEach(view => view.classList.remove('active'));
        const fleetView = document.getElementById('view-fleet');
        if (fleetView) fleetView.classList.add('active');
        this.updateHeaderTitles('fleet');

        this.fleetSearchInput.value = '';
        this.fleetFilterBusiness.value = 'all';
        this.currentQuickStatusFilter = this.getStatusValueFromSummaryType(ctx.statusType);
        this.statusQuickTabs.forEach(tab => tab.classList.toggle('active', tab.getAttribute('data-status') === this.currentQuickStatusFilter));
        this.updateFleetDependentDropdowns({ resetFleet: true, resetModel: true, resetVehicleType: true, resetModelYear: true, resetResponsible: true });

        if (ctx.fieldName === 'businessType') {
            this.fleetFilterBusiness.value = ctx.name;
            this.updateFleetDependentDropdowns({ resetFleet: true, resetModel: true, resetVehicleType: true, resetModelYear: true, resetResponsible: true });
        } else if (ctx.fieldName === 'fleet') {
            this.fleetFilterFleet.value = ctx.name;
            this.updateFleetDependentDropdowns({ resetModel: true, resetModelYear: true, resetResponsible: true });
        } else if (ctx.fieldName === 'model') {
            this.fleetFilterModel.value = ctx.name;
            this.updateFleetDependentDropdowns({ resetVehicleType: true, resetModelYear: true, resetResponsible: true });
        } else if (ctx.fieldName === 'vehicleType') {
            if (this.fleetFilterVehicleType) this.fleetFilterVehicleType.value = ctx.name;
            this.updateFleetDependentDropdowns({ resetModelYear: true, resetResponsible: true });
        } else if (ctx.fieldName === 'responsible') {
            this.fleetFilterResponsible.value = ctx.name;
        }

        this.applyFilters(true);
        this.showToast(`เปิดหน้าติดตามพร้อมฟิลเตอร์ ${ctx.vehicles.length.toLocaleString()} คัน`, 'success');
    }

    renderSummaryDetailRow(row, fieldName) {
        if (!this.currentSummaryDrilldown || this.currentSummaryDrilldown.name !== row.name) return '';

        const vehicles = this.getSummaryVehicles(fieldName, row.name, this.currentSummaryDrilldown.statusType);
        const title = `${row.name} | ${this.getStatusLabel(this.currentSummaryDrilldown.statusType)} ${vehicles.length.toLocaleString()} คัน`;

        if (vehicles.length === 0) {
            return `
                <tr class="summary-detail-row">
                    <td colspan="7">
                        <div class="summary-detail-box phase3-drilldown">
                            <div class="summary-detail-header">
                                <div>
                                    <strong>${this.escapeHtml(title)}</strong>
                                    <div class="summary-detail-hint">ไม่มีรถในสถานะนี้</div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }

        const metrics = {
            total: vehicles.length,
            overdue: vehicles.filter(v => v.status === 'เกินระยะPM').length,
            callIn: vehicles.filter(v => v.status === 'ติดตามเรียกเข้า PM').length,
            prepare: vehicles.filter(v => v.status === 'เตรียมPM').length,
            ok: vehicles.filter(v => v.status === 'OK').length,
            negativeKm: vehicles.filter(v => Number(v.remainingKm || 0) < 0).length,
            nearKm: vehicles.filter(v => Number(v.remainingKm || 0) >= 0 && Number(v.remainingKm || 0) <= 1000).length
        };

        const vehicleRows = vehicles.map(v => {
            let badgeClass = 'status-ok';
            if (v.status === 'เกินระยะPM') badgeClass = 'status-overdue';
            else if (v.status === 'ติดตามเรียกเข้า PM') badgeClass = 'status-call';
            else if (v.status === 'เตรียมPM') badgeClass = 'status-prepare';
            return `
                <tr class="summary-vehicle-row" data-vehicle-no="${this.escapeHtml(v.vehicleNo)}">
                    <td><button class="vehicle-link-btn summary-open-vehicle" data-vehicle-no="${this.escapeHtml(v.vehicleNo)}">${this.escapeHtml(v.vehicleNo)}</button></td>
                    <td>${this.escapeHtml(v.license)}</td>
                    <td>
                        <strong>${this.escapeHtml(v.model)}</strong>
                        <div class="summary-subtext">M/Y: ${this.escapeHtml(v.modelYear || '-')}</div>
                    </td>
                    <td>
                        <strong>${this.escapeHtml(v.businessType)}</strong>
                        <div class="summary-subtext">${this.escapeHtml(v.fleet)}</div>
                    </td>
                    <td>${this.escapeHtml(v.responsible)}</td>
                    <td class="text-right ${v.remainingKm < 0 ? 'text-danger' : ''}">${Number(v.remainingKm || 0).toLocaleString()}</td>
                    <td>
                        <strong>${this.escapeHtml(DateUtils.formatThaiDate(v.planDate))}</strong>
                        <div class="summary-subtext">ล่าสุด: ${this.escapeHtml(v.lastChangeDate || '-')}</div>
                    </td>
                    <td><span class="badge badge-status ${badgeClass}">${this.escapeHtml(v.status)}</span></td>
                </tr>
            `;
        }).join('');

        return `
            <tr class="summary-detail-row">
                <td colspan="7">
                    <div class="summary-detail-box phase3-drilldown">
                        <div class="summary-detail-header phase3-header">
                            <div>
                                <div class="phase3-title">${this.escapeHtml(title)}</div>
                                <div class="summary-detail-hint">Quick Action: คัดลอก / Export / เปิดต่อในหน้าติดตาม / กดเบอร์รถเพื่อดูรายละเอียด</div>
                            </div>
                            <div class="summary-action-group">
                                <button class="btn btn-secondary btn-sm summary-action-btn" data-action="copy">คัดลอกรายการ</button>
                                <button class="btn btn-secondary btn-sm summary-action-btn" data-action="csv">Export CSV</button>
                                <button class="btn btn-primary btn-sm summary-action-btn" data-action="tracking">เปิดใน Tracking</button>
                            </div>
                        </div>
                        <div class="summary-kpi-strip">
                            <div class="summary-kpi-card"><span>ทั้งหมด</span><strong>${metrics.total.toLocaleString()}</strong></div>
                            <div class="summary-kpi-card danger"><span>เกินระยะ</span><strong>${metrics.overdue.toLocaleString()}</strong></div>
                            <div class="summary-kpi-card orange"><span>เรียกเข้า</span><strong>${metrics.callIn.toLocaleString()}</strong></div>
                            <div class="summary-kpi-card warning"><span>เตรียม PM</span><strong>${metrics.prepare.toLocaleString()}</strong></div>
                            <div class="summary-kpi-card success"><span>OK</span><strong>${metrics.ok.toLocaleString()}</strong></div>
                            <div class="summary-kpi-card danger"><span>คงเหลือติดลบ</span><strong>${metrics.negativeKm.toLocaleString()}</strong></div>
                            <div class="summary-kpi-card warning"><span>≤ 1,000 กม.</span><strong>${metrics.nearKm.toLocaleString()}</strong></div>
                        </div>
                        <div class="summary-detail-scroll">
                            <table class="summary-detail-table">
                                <thead>
                                    <tr>
                                        <th>เบอร์รถ</th>
                                        <th>ทะเบียน</th>
                                        <th>รุ่น / M/Y</th>
                                        <th>ธุรกิจ / คลังโยกฟลีต</th>
                                        <th>ผู้รับผิดชอบ</th>
                                        <th class="text-right">ระยะคงเหลือ</th>
                                        <th>Plan / ล่าสุด</th>
                                        <th>สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>${vehicleRows}</tbody>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    // VIEW 2: SUMMARY GROUPING RENDER
    renderSummaryTab() {
        const { fieldName, titleLabel, colLabel } = this.getSummaryFieldConfig();

        this.summaryTableTitle.innerText = `สรุปผลจำนวนรถยนต์และสถานะเข้า PM แยกราย${titleLabel}`;
        document.getElementById('summary-col-name').innerText = colLabel;
        
        const summaryData = this.manager.getSummaryGrouping(fieldName);
        
        this.summaryTableBody.innerHTML = "";
        
        if (summaryData.length === 0) {
            this.summaryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">ไม่พบข้อมูลสรุปผล</td>
                </tr>
            `;
            return;
        }

        const html = [];
        summaryData.forEach(row => {
            let safetyColor = 'var(--success)';
            if (row.pctSafe < 85) safetyColor = 'var(--warning)';
            if (row.pctSafe < 70) safetyColor = 'var(--warning-orange)';
            if (row.pctSafe < 50) safetyColor = 'var(--danger)';
            
            html.push(`
                <tr class="summary-main-row">
                    <td><strong>${this.escapeHtml(row.name)}</strong></td>
                    <td><strong>${this.makeSummaryCountButton(row.name, 'total', row.total, 'count-total')} คัน</strong></td>
                    <td class="text-danger" style="font-weight:600;">${this.makeSummaryCountButton(row.name, 'overdue', row.overdue, 'count-danger')}</td>
                    <td style="color:#f97316; font-weight:600;">${this.makeSummaryCountButton(row.name, 'callIn', row.callIn, 'count-orange')}</td>
                    <td class="text-warning" style="font-weight:600;">${this.makeSummaryCountButton(row.name, 'prepare', row.prepare, 'count-warning')}</td>
                    <td class="text-success">${this.makeSummaryCountButton(row.name, 'ok', row.ok, 'count-success')}</td>
                    <td>
                        <div class="flex-row align-center gap-12">
                            <div class="bar-track" style="width: 100px; height: 6px; margin:0;">
                                <div class="bar-fill" style="width: ${row.pctSafe}%; background: ${safetyColor};"></div>
                            </div>
                            <span style="font-weight: 700; color: ${safetyColor}">${row.pctSafe}%</span>
                        </div>
                    </td>
                </tr>
            `);
            html.push(this.renderSummaryDetailRow(row, fieldName));
        });

        this.summaryTableBody.innerHTML = html.join('');

        this.summaryTableBody.querySelectorAll('.summary-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.currentTarget.dataset.summaryName;
                const statusType = e.currentTarget.dataset.summaryStatus;
                const isSame = this.currentSummaryDrilldown &&
                    this.currentSummaryDrilldown.name === name &&
                    this.currentSummaryDrilldown.statusType === statusType;
                this.currentSummaryDrilldown = isSame ? null : { name, statusType };
                this.renderSummaryTab();
            });
        });

        this.summaryTableBody.querySelectorAll('.summary-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action === 'copy') this.copySummaryDrilldownText();
                else if (action === 'csv') this.exportSummaryDrilldownCSV();
                else if (action === 'tracking') this.openSummaryDrilldownInTracking();
            });
        });

        this.summaryTableBody.querySelectorAll('.summary-open-vehicle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vehicleNo = e.currentTarget.dataset.vehicleNo;
                const vehicle = this.manager.getVehicles().find(v => v.vehicleNo === vehicleNo);
                if (vehicle) this.openVehicleModal(vehicle);
            });
        });
    }

    // VIEW 3: FLEET PM LIST & TRACKING RENDER
    applyFilters(resetPage = false) {
        if (resetPage) this.currentPage = 1;
        
        const searchQuery = this.fleetSearchInput.value.toLowerCase().trim();
        const bizFilter = this.fleetFilterBusiness.value;
        const fleetFilter = this.fleetFilterFleet.value;
        const modelFilter = this.fleetFilterModel.value;
        const modelYearFilter = this.fleetFilterModelYear?.value || 'all';
        const vehicleTypeFilter = this.fleetFilterVehicleType?.value || 'all';
        const resFilter = this.fleetFilterResponsible.value;
        const sortVal = this.fleetSortBy.value;
        const statusFilter = this.currentQuickStatusFilter;
        
        // Render quick filter item counts
        const allVehicles = this.manager.getVehicles();
        document.getElementById('count-quick-all').innerText = allVehicles.length;
        document.getElementById('count-quick-overdue').innerText = allVehicles.filter(v => v.status === 'เกินระยะPM').length;
        document.getElementById('count-quick-call').innerText = allVehicles.filter(v => v.status === 'ติดตามเรียกเข้า PM').length;
        document.getElementById('count-quick-prepare').innerText = allVehicles.filter(v => v.status === 'เตรียมPM').length;
        document.getElementById('count-quick-ok').innerText = allVehicles.filter(v => v.status === 'OK').length;

        // Perform filtering
        this.filteredVehicles = allVehicles.filter(v => {
            const matchSearch = v.vehicleNo.toLowerCase().includes(searchQuery) || 
                                v.license.toLowerCase().includes(searchQuery) || 
                                v.model.toLowerCase().includes(searchQuery) ||
                                String(v.modelYear || '').toLowerCase().includes(searchQuery) ||
                                String(v.vehicleType || '').toLowerCase().includes(searchQuery) ||
                                v.responsible.toLowerCase().includes(searchQuery);
            
            const matchBiz = bizFilter === 'all' || v.businessType === bizFilter;
            const matchFleet = fleetFilter === 'all' || v.fleet === fleetFilter;
            const matchModel = modelFilter === 'all' || v.model === modelFilter;
            const matchModelYear = modelYearFilter === 'all' || v.modelYear === modelYearFilter;
            const matchVehicleType = vehicleTypeFilter === 'all' || v.vehicleType === vehicleTypeFilter;
            const matchRes = resFilter === 'all' || v.responsible === resFilter;
            const matchStatus = statusFilter === 'all' || v.status === statusFilter;
            
            return matchSearch && matchBiz && matchFleet && matchModel && matchVehicleType && matchModelYear && matchRes && matchStatus;
        });

        // Perform sorting
        this.filteredVehicles.sort((a, b) => {
            if (sortVal === 'id-asc') {
                return parseInt(a.id) - parseInt(b.id);
            } else if (sortVal === 'id-desc') {
                return parseInt(b.id) - parseInt(a.id);
            } else if (sortVal === 'remaining-asc') {
                return a.remainingKm - b.remainingKm;
            } else if (sortVal === 'remaining-desc') {
                return b.remainingKm - a.remainingKm;
            } else if (sortVal === 'plan-asc') {
                // Parse date strings for comparison
                const da = DateUtils.parseThaiCSVDate(a.planDate) || '9999-12-31';
                const db = DateUtils.parseThaiCSVDate(b.planDate) || '9999-12-31';
                return da.localeCompare(db);
            } else if (sortVal === 'plan-desc') {
                const da = DateUtils.parseThaiCSVDate(a.planDate) || '0000-01-01';
                const db = DateUtils.parseThaiCSVDate(b.planDate) || '0000-01-01';
                return db.localeCompare(da);
            }
            return 0;
        });

        this.renderFleetTable();
    }

    renderFleetTable() {
        const total = this.filteredVehicles.length;
        this.paginationTotal.innerText = total;
        
        if (total === 0) {
            this.fleetTableBody.innerHTML = "";
            this.fleetEmptyState.style.display = 'flex';
            this.paginationStart.innerText = 0;
            this.paginationEnd.innerText = 0;
            this.paginationPageNums.innerHTML = "";
            return;
        }
        
        this.fleetEmptyState.style.display = 'none';
        
        const totalPages = Math.ceil(total / this.itemsPerPage);
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        if (this.currentPage < 1) this.currentPage = 1;
        
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = Math.min(startIdx + this.itemsPerPage, total);
        
        this.paginationStart.innerText = startIdx + 1;
        this.paginationEnd.innerText = endIdx;
        
        // Render pagination numbers list
        this.paginationPageNums.innerHTML = "";
        
        // Show max 5 pages numbers around current page
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let p = startPage; p <= endPage; p++) {
            const pageNumBtn = document.createElement('button');
            pageNumBtn.className = `pagination-num ${p === this.currentPage ? 'active' : ''}`;
            pageNumBtn.innerText = p;
            pageNumBtn.addEventListener('click', () => {
                this.currentPage = p;
                this.renderFleetTable();
            });
            this.paginationPageNums.appendChild(pageNumBtn);
        }

        // Render rows
        this.fleetTableBody.innerHTML = "";
        
        for (let i = startIdx; i < endIdx; i++) {
            const v = this.filteredVehicles[i];
            
            // Identify badge CSS class
            let badgeClass = "status-ok";
            if (v.status === "เกินระยะPM") badgeClass = "status-overdue";
            else if (v.status === "ติดตามเรียกเข้า PM") badgeClass = "status-call";
            else if (v.status === "เตรียมPM") badgeClass = "status-prepare";
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="vehicle-cell">
                        <span class="vehicle-id">${v.vehicleNo}</span>
                        <span class="sub-label">ลำดับ: ${v.id}</span>
                    </div>
                </td>
                <td><strong>${v.license}</strong></td>
                <td>
                    <div class="vehicle-cell">
                        <strong>${v.model}</strong>
                        <span class="sub-label">M/Y: ${this.escapeHtml(v.modelYear || '-')}</span>
                        <span class="vehicle-type-chip">${this.escapeHtml(v.vehicleType || '-')}</span>
                    </div>
                </td>
                <td>
                    <div class="vehicle-cell">
                        <strong>${v.businessType}</strong>
                        <span class="vehicle-license">${v.fleet}</span>
                        <span class="sub-label">ประเภทรถ: ${this.escapeHtml(v.vehicleType || '-')}</span>
                    </div>
                </td>
                <td class="text-right">
                    <div class="vehicle-cell text-right">
                        <strong>${v.lastKm.toLocaleString()}</strong>
                        <span class="sub-label">${v.lastKmDate}</span>
                    </div>
                </td>
                <td class="text-right" style="font-weight: 600;">${v.nextKm.toLocaleString()}</td>
                <td class="text-right">
                    <span class="remaining-val ${v.remainingKm < 0 ? 'text-danger' : ''}">${v.remainingKm.toLocaleString()}</span>
                </td>
                <td>
                    <div class="vehicle-cell">
                        <strong>${DateUtils.formatThaiDate(v.planDate)}</strong>
                        <span class="sub-label">เปลี่ยนล่าสุด: ${v.lastChangeDate}</span>
                    </div>
                </td>
                <td><strong class="text-primary">${v.responsible}</strong></td>
                <td>
                    <span class="badge badge-status ${badgeClass}">${v.status}</span>
                </td>
                <td class="text-center">
                    <button class="btn btn-secondary btn-sm btn-view-detail" title="ดูรายละเอียดภาระซ่อม PM">
                        ดูข้อมูล
                    </button>
                </td>
            `;
            
            tr.querySelector('.btn-view-detail').addEventListener('click', () => this.openVehicleModal(v));
            this.fleetTableBody.appendChild(tr);
        }
    }


    // CALENDAR PHASE 2: range filters and summary helpers
    formatDateInput(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    parseInputDate(value) {
        if (!value) return null;
        const [y, m, d] = value.split('-').map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    }

    addDays(dateObj, days) {
        const d = new Date(dateObj);
        d.setDate(d.getDate() + days);
        return d;
    }

    initializeCalendarRangeDefaults() {
        if (!this.calendarDateStart || !this.calendarDateEnd) return;
        if (this.calendarDateStart.value && this.calendarDateEnd.value) return;
        const y = this.currentCalendarDate.getFullYear();
        const m = this.currentCalendarDate.getMonth();
        this.calendarPeriodMode.value = 'month';
        this.calendarDateStart.value = this.formatDateInput(new Date(y, m, 1));
        this.calendarDateEnd.value = this.formatDateInput(new Date(y, m + 1, 0));
    }

    getCalendarDateRange() {
        return {
            start: this.parseInputDate(this.calendarDateStart?.value),
            end: this.parseInputDate(this.calendarDateEnd?.value)
        };
    }

    updateCalendarFleetDropdown(keepSelection = true) {
        if (!this.calendarFilterFleet) return;
        const currentFleet = this.calendarFilterFleet.value || 'all';
        const biz = this.calendarFilterBusiness?.value || 'all';
        const { start, end } = this.getCalendarDateRange();

        const fleetOptions = [...new Set(this.manager.getVehicles()
            .filter(v => {
                if (biz !== 'all' && v.businessType !== biz) return false;
                const d = this.getVehicleCalendarDateObj(v);
                if (start && d && d < start) return false;
                if (end && d && d > end) return false;
                return !!v.fleet;
            })
            .map(v => v.fleet))]
            .filter(Boolean)
            .sort();

        this.calendarFilterFleet.innerHTML = '<option value="all">ทุกคลังโยกฟลีต</option>';
        fleetOptions.forEach(f => {
            this.calendarFilterFleet.innerHTML += `<option value="${f}">${f}</option>`;
        });

        if (keepSelection && fleetOptions.includes(currentFleet)) {
            this.calendarFilterFleet.value = currentFleet;
        } else {
            this.calendarFilterFleet.value = 'all';
        }
    }

    resetCalendarFilters() {
        const now = new Date();
        this.currentCalendarDate = new Date(now.getFullYear(), now.getMonth(), 1);
        if (this.calendarPeriodMode) this.calendarPeriodMode.value = 'month';
        if (this.calendarDateSource) this.calendarDateSource.value = 'planDate';
        if (this.calendarFilterBusiness) this.calendarFilterBusiness.value = 'all';
        this.syncCalendarRangeWithMode();
        this.updateCalendarFleetDropdown(false);
        this.renderCalendar();
        this.showToast('รีเซ็ตตัวกรองปฏิทินเรียบร้อย', 'success');
    }

    syncCalendarRangeWithMode() {
        if (!this.calendarDateStart || !this.calendarDateEnd || !this.calendarPeriodMode) return;
        const mode = this.calendarPeriodMode.value;
        const y = this.currentCalendarDate.getFullYear();
        const m = this.currentCalendarDate.getMonth();
        if (mode === 'week') {
            const base = this.parseInputDate(this.calendarDateStart.value) || new Date(y, m, 1);
            this.calendarDateStart.value = this.formatDateInput(base);
            this.calendarDateEnd.value = this.formatDateInput(this.addDays(base, 6));
        } else if (mode === 'month') {
            this.calendarDateStart.value = this.formatDateInput(new Date(y, m, 1));
            this.calendarDateEnd.value = this.formatDateInput(new Date(y, m + 1, 0));
        } else if (mode === 'year') {
            this.calendarDateStart.value = this.formatDateInput(new Date(y, 0, 1));
            this.calendarDateEnd.value = this.formatDateInput(new Date(y, 11, 31));
        }
    }

    getCalendarDateField() {
        return this.calendarDateSource?.value || 'planDate';
    }

    getCalendarDateLabel() {
        return this.getCalendarDateField() === 'lastChangeDate' ? 'วันที่เข้าเปลี่ยนล่าสุด' : 'ประมาณการ Plan';
    }

    getVehicleCalendarDateKey(v) {
        const field = this.getCalendarDateField();
        return DateUtils.parseThaiCSVDate(v[field]);
    }

    getVehicleCalendarDateObj(v) {
        const key = this.getVehicleCalendarDateKey(v);
        if (!key) return null;
        const [y, m, d] = key.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    getVehiclePlanDateObj(v) {
        const key = DateUtils.parseThaiCSVDate(v.planDate);
        if (!key) return null;
        const [y, m, d] = key.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    getCalendarFilteredVehicles() {
        const start = this.parseInputDate(this.calendarDateStart?.value);
        const end = this.parseInputDate(this.calendarDateEnd?.value);
        const biz = this.calendarFilterBusiness?.value || 'all';
        const fleet = this.calendarFilterFleet?.value || 'all';
        return this.manager.getVehicles().filter(v => {
            const d = this.getVehicleCalendarDateObj(v);
            if (!d) return false;
            if (start && d < start) return false;
            if (end && d > end) return false;
            if (biz !== 'all' && v.businessType !== biz) return false;
            if (fleet !== 'all' && v.fleet !== fleet) return false;
            return true;
        });
    }

    renderCalendarRangeSummary(filteredVehicles) {
        if (!this.calendarRangeSummary || !this.calendarRangeTotal) return;
        const groupField = this.calendarSummaryGroup?.value || 'businessType';
        const startText = this.calendarDateStart?.value || '-';
        const endText = this.calendarDateEnd?.value || '-';
        this.calendarRangeTotal.innerText = `${filteredVehicles.length.toLocaleString()} คัน`;
        const dateLabel = this.getCalendarDateLabel();
        const groups = {};
        filteredVehicles.forEach(v => {
            const key = v[groupField] || 'ไม่ระบุ';
            if (!groups[key]) groups[key] = { total: 0, overdue: 0, callIn: 0, prepare: 0, ok: 0 };
            groups[key].total++;
            if (v.status === 'เกินระยะPM') groups[key].overdue++;
            else if (v.status === 'ติดตามเรียกเข้า PM') groups[key].callIn++;
            else if (v.status === 'เตรียมPM') groups[key].prepare++;
            else groups[key].ok++;
        });
        const rows = Object.entries(groups).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total);
        if (rows.length === 0) {
            this.calendarRangeSummary.innerHTML = `<div class="range-empty">ไม่พบข้อมูล${dateLabel} ในช่วง ${startText} ถึง ${endText}</div>`;
            return;
        }
        const label = groupField === 'fleet' ? 'คลังโยกฟลีต' : 'ธุรกิจขนส่ง';
        this.calendarRangeSummary.innerHTML = rows.slice(0, 12).map(row => `
            <div class="range-summary-card">
                <div class="range-summary-name">${row.name}</div>
                <div class="range-summary-count">${row.total.toLocaleString()} คัน</div>
                <div class="range-summary-meta">${label} | ${dateLabel}</div>
                <div class="range-summary-status">
                    <span class="dot danger"></span>${row.overdue}
                    <span class="dot orange"></span>${row.callIn}
                    <span class="dot warning"></span>${row.prepare}
                    <span class="dot success"></span>${row.ok}
                </div>
            </div>
        `).join('');
    }

    // VIEW 4: PM CALENDAR RENDER
    renderCalendar() {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth(); // 0-indexed
        
        this.calendarMonthYearText.innerText = DateUtils.formatThaiMonthYear(month, year);
        
        // Clear Grid
        this.calendarDaysGrid.innerHTML = "";
        
        // Days in month logic
        const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week (0-6)
        const totalDays = new Date(year, month + 1, 0).getDate(); // Number of days in current month
        const prevMonthTotalDays = new Date(year, month, 0).getDate();
        
        // Prev Month trailing days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day-cell inactive';
            cell.innerHTML = `<span class="calendar-day-num">${prevMonthTotalDays - i}</span>`;
            this.calendarDaysGrid.appendChild(cell);
        }
        
        // Current Month days
        if (!this.calendarDateStart?.value || !this.calendarDateEnd?.value) {
            this.initializeCalendarRangeDefaults();
        }
        const vehicles = this.getCalendarFilteredVehicles();
        this.renderCalendarRangeSummary(vehicles);
        
        for (let d = 1; d <= totalDays; d++) {
            const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            
            const cell = document.createElement('div');
            cell.className = 'calendar-day-cell';
            
            // Check if matches today
            const todayObj = new Date();
            if (year === todayObj.getFullYear() && month === todayObj.getMonth() && d === todayObj.getDate()) {
                cell.classList.add('today');
            }
            
            cell.innerHTML = `<span class="calendar-day-num">${d}</span>`;
            
            // Find vehicles whose selected calendar date field matches this calendar cell day
            const cellDateCSVFormat = `${d}/${month + 1}/${year}`;
            const cellDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const matches = vehicles.filter(v => this.getVehicleCalendarDateKey(v) === cellDateKey);
            
            if (matches.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'calendar-day-events';
                
                // Show maximum 3 event pills to fit cell
                const limit = Math.min(matches.length, 3);
                for (let i = 0; i < limit; i++) {
                    const v = matches[i];
                    
                    // Pick the month package code if available (e.g. C, A1, C2)
                    let code = "PM";
                    if (v.monthlySchedule[month]) {
                        code = v.monthlySchedule[month].packageCode;
                    }
                    
                    let eventClass = "calendar-event-c";
                    if (code.startsWith('A')) eventClass = "calendar-event-a";
                    else if (code.startsWith('T')) eventClass = "calendar-event-t";
                    else if (code.startsWith('S')) eventClass = "calendar-event-s";
                    
                    eventsContainer.innerHTML += `
                        <span class="calendar-event-pill ${eventClass}" title="เบอร์รถ ${v.vehicleNo} [PM-${code}]">
                            ${v.vehicleNo}-${code}
                        </span>
                    `;
                }
                
                if (matches.length > 3) {
                    eventsContainer.innerHTML += `
                        <span class="calendar-event-pill" style="background:#475569; color:#f1f5f9; font-size:0.55rem; padding: 1px 2px;">
                            +${matches.length - 3} คัน
                        </span>
                    `;
                }
                
                cell.appendChild(eventsContainer);
            }
            
            // Event listener for day click
            cell.addEventListener('click', () => {
                // Remove selected states from other cells
                document.querySelectorAll('.calendar-day-cell').forEach(c => c.style.borderColor = '');
                cell.style.borderColor = 'var(--primary)';
                
                this.selectedCalendarDateStr = cellDateCSVFormat;
                this.renderCalendarDayDetails(cellDateCSVFormat, matches);
            });
            
            this.calendarDaysGrid.appendChild(cell);
        }
        
        // Next Month leading days to fill grid (assuming 42 grids total)
        const totalGrids = firstDayIndex + totalDays;
        const nextMonthDays = totalGrids > 35 ? 42 - totalGrids : 35 - totalGrids;
        for (let d = 1; d <= nextMonthDays; d++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day-cell inactive';
            cell.innerHTML = `<span class="calendar-day-num">${d}</span>`;
            this.calendarDaysGrid.appendChild(cell);
        }

        // Render selected/today details initially using the same filtered dataset
        const todayObj = new Date();
        const todayStrInCSVFormat = `${todayObj.getDate()}/${todayObj.getMonth() + 1}/${todayObj.getFullYear()}`;
        const todayKey = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
        const initialMatches = vehicles.filter(v => this.getVehicleCalendarDateKey(v) === todayKey);
        this.renderCalendarDayDetails(todayStrInCSVFormat, initialMatches);
    }

    renderCalendarDayDetails(dateCSVStr, matches) {
        this.calendarDetailDateText.innerText = `${this.getCalendarDateLabel()} ประจำวันที่: ${DateUtils.formatThaiDate(dateCSVStr)}`;
        this.calendarDayCountBadge.innerText = `${matches.length} คัน`;
        
        this.calendarDetailList.innerHTML = "";
        
        if (matches.length === 0) {
            this.calendarDetailList.innerHTML = `
                <p class="text-center text-muted" style="margin-top: 40px;">
                    ไม่มีรอบรถเข้าแผน PM ในวันวันนี้
                </p>
            `;
            return;
        }

        matches.forEach(v => {
            let badgeClass = "status-ok";
            if (v.status === "เกินระยะPM") badgeClass = "status-overdue";
            else if (v.status === "ติดตามเรียกเข้า PM") badgeClass = "status-call";
            else if (v.status === "เตรียมPM") badgeClass = "status-prepare";
            
            const monthVal = this.currentCalendarDate.getMonth();
            let code = "PM";
            if (v.monthlySchedule[monthVal]) {
                code = v.monthlySchedule[monthVal].packageCode;
            }

            const item = document.createElement('div');
            item.className = "calendar-detail-item";
            item.innerHTML = `
                <div class="calendar-detail-item-header">
                    <span class="calendar-detail-item-plate">เบอร์รถ: ${v.vehicleNo} (${v.license})</span>
                    <span class="badge ${badgeClass}" style="font-size:0.68rem; padding: 2px 6px;">${v.status}</span>
                </div>
                <div class="calendar-detail-item-name">
                    งาน PM รอบเดือน (${code}) | ระยะคงเหลือ ${v.remainingKm.toLocaleString()} กม.
                </div>
                <div class="calendar-detail-item-meta flex-row justify-between">
                    <span>คลัง: ${v.fleet} | ${v.businessType}</span>
                    <span>ผู้ดูแล: <strong>${v.responsible}</strong></span>
                </div>
                <div class="calendar-detail-item-meta" style="margin-top:6px;">
                    <span>Plan: ${DateUtils.formatThaiDate(v.planDate) || '-'} | เข้าเปลี่ยนล่าสุด: ${DateUtils.formatThaiDate(v.lastChangeDate) || '-'}</span>
                </div>
            `;
            
            item.addEventListener('click', () => this.openVehicleModal(v));
            this.calendarDetailList.appendChild(item);
        });
    }

    // MODAL: VEHICLE DETAIL & SCHEDULE TIMELINE
    openVehicleModal(v) {
        // Set Header
        const statusBadge = document.getElementById('modal-vehicle-status');
        statusBadge.innerText = v.status;
        statusBadge.className = "modal-badge-status";
        
        let badgeClass = "status-ok";
        if (v.status === "เกินระยะPM") badgeClass = "status-overdue";
        else if (v.status === "ติดตามเรียกเข้า PM") badgeClass = "status-call";
        else if (v.status === "เตรียมPM") badgeClass = "status-prepare";
        statusBadge.classList.add(badgeClass);
        
        document.getElementById('modal-vehicle-title').innerText = `รายละเอียดแผนรอบ PM รถเบอร์ ${v.vehicleNo}`;
        document.getElementById('modal-vehicle-subtitle').innerText = `ทะเบียน: ${v.license} | รุ่นรถ: ${v.model}`;
        
        // Set Info items
        document.getElementById('md-vehicle-no').innerText = v.vehicleNo;
        document.getElementById('md-license').innerText = v.license;
        document.getElementById('md-model').innerText = v.model;
        if (document.getElementById('md-vehicle-type')) document.getElementById('md-vehicle-type').innerText = v.vehicleType || '-';
        document.getElementById('md-business').innerText = v.businessType;
        document.getElementById('md-fleet').innerText = v.fleet;
        document.getElementById('md-responsible').innerText = v.responsible;
        
        // Gauge Odometer calculations
        const remVal = document.getElementById('md-remaining-km');
        remVal.innerText = `${v.remainingKm.toLocaleString()} กม.`;
        if (v.remainingKm < 0) {
            remVal.style.color = '#ef4444';
        } else if (v.remainingKm <= 2000) {
            remVal.style.color = '#f97316';
        } else if (v.remainingKm <= 4000) {
            remVal.style.color = '#f59e0b';
        } else {
            remVal.style.color = '#10b981';
        }

        document.getElementById('md-last-km').innerText = v.lastKm.toLocaleString() + ' กม.';
        document.getElementById('md-last-km-date').innerText = 'บันทึกเมื่อ: ' + v.lastKmDate;
        document.getElementById('md-next-km').innerText = v.nextKm.toLocaleString() + ' กม.';
        document.getElementById('md-plan-date').innerText = 'ประมาณการ Plan: ' + DateUtils.formatThaiDate(v.planDate);
        
        // Calculate Gauge SVG fill percentage
        // If remaining is positive, gauge shows progress towards PM.
        // If remaining is negative, vehicle went way past PM (100% full alert).
        let pct = 0;
        if (v.remainingKm <= 0) {
            pct = 100;
        } else {
            // Distance driven in cycle = interval - remaining
            const driven = Math.max(0, v.pmInterval - v.remainingKm);
            pct = Math.round((driven / v.pmInterval) * 100);
            pct = Math.min(100, Math.max(0, pct));
        }
        
        // Semi-circle gauge path length = 251.2
        const fillElement = document.getElementById('md-gauge-fill');
        const offset = 251.2 - (pct / 100) * 251.2;
        fillElement.style.strokeDashoffset = offset;
        
        // Odometer gauge color matching status
        if (v.status === "เกินระยะPM") fillElement.style.stroke = '#ef4444';
        else if (v.status === "ติดตามเรียกเข้า PM") fillElement.style.stroke = '#f97316';
        else if (v.status === "เตรียมPM") fillElement.style.stroke = '#f59e0b';
        else fillElement.style.stroke = '#10b981';

        // Render 12 Months Timeline
        const timelineContainer = document.getElementById('md-monthly-timeline');
        timelineContainer.innerHTML = "";
        
        const monthNamesThai = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        const currentMonthIndex = new Date().getMonth();
        
        for (let m = 0; m < 12; m++) {
            const hasPM = v.monthlySchedule[m] !== undefined;
            const pmData = v.monthlySchedule[m];
            
            const node = document.createElement('div');
            node.className = 'timeline-month-node';
            
            if (hasPM) {
                node.classList.add('active-pm');
                
                // Past months count as completed/past PM
                if (m < currentMonthIndex) {
                    node.classList.add('past-pm');
                }
                
                const packageCode = pmData.packageCode;
                node.innerHTML = `
                    <span class="timeline-month-lbl">${monthNamesThai[m]}</span>
                    <span class="timeline-month-badge">${packageCode}</span>
                `;
            } else {
                node.innerHTML = `
                    <span class="timeline-month-lbl">${monthNamesThai[m]}</span>
                    <span class="timeline-month-badge" style="border-style:dashed;">-</span>
                `;
            }
            timelineContainer.appendChild(node);
        }

        // Render Generated Detailed Tasks Table (Requirement 4)
        const tableBody = document.getElementById('md-tasks-table-body');
        tableBody.innerHTML = "";
        
        // Task 1: Mileage/Odometer based PM (Immediate next)
        let mileStatusBadge = "status-ok";
        if (v.status === "เกินระยะPM") mileStatusBadge = "status-overdue";
        else if (v.status === "ติดตามเรียกเข้า PM") mileStatusBadge = "status-call";
        else if (v.status === "เตรียมPM") mileStatusBadge = "status-prepare";
        
        const tr1 = document.createElement('tr');
        tr1.innerHTML = `
            <td><strong>PM เช็คระยะกิโลเมตรครั้งถัดไป</strong></td>
            <td>ซ่อมบำรุงเปลี่ยนน้ำมันเครื่องและไส้กรอง รอบเช็คระยะ ${v.pmInterval.toLocaleString()} กม. (ระยะถัดไป: <strong>${v.nextKm.toLocaleString()}</strong> กม.)</td>
            <td>-</td>
            <td><strong>${DateUtils.formatThaiDate(v.planDate)}</strong></td>
            <td><span class="badge ${mileStatusBadge}">${v.status}</span></td>
        `;
        tableBody.appendChild(tr1);

        // Tasks 2+: Time-based monthly scheduled checks
        for (let m = 0; m < 12; m++) {
            if (v.monthlySchedule[m]) {
                const pm = v.monthlySchedule[m];
                const tr = document.createElement('tr');
                
                const isPast = m < currentMonthIndex;
                const statusText = isPast ? "เสร็จสิ้น (Completed)" : "รอดำเนินการ (Planned)";
                const badgeStyle = isPast ? "badge-success" : "badge-primary";
                
                // Estimate scheduling date (e.g. 15th of month)
                const taskYear = getCurrentYear();
                const monthDisplayDate = `15/${m + 1}/${taskYear}`;
                const monthDisplayDeadline = `${new Date(taskYear, m + 1, 0).getDate()}/${m + 1}/${taskYear}`;
                
                tr.innerHTML = `
                    <td><strong>PM ประจำเดือน${pm.monthThai} ${taskYear + 543}</strong></td>
                    <td>รอบตรวจเช็ค PM รอบรถปกติ รหัสแพ็กเกจประจำรอบ: <strong>${pm.packageCode}</strong> (${v.weeklyNote || 'สัปดาห์รอบเข้าปกติ'})</td>
                    <td>${DateUtils.formatThaiDate(monthDisplayDate)}</td>
                    <td><strong>${DateUtils.formatThaiDate(monthDisplayDeadline)}</strong></td>
                    <td><span class="badge ${badgeStyle}">${statusText}</span></td>
                `;
                tableBody.appendChild(tr);
            }
        }

        // Display Modal
        this.vehicleModal.classList.add('active');
    }

    closeVehicleModal() {
        this.vehicleModal.classList.remove('active');
    }

    // BACKUP AND EXPORT LOGIC
    exportCSV() {
        const vehicles = this.manager.getVehicles();
        if (vehicles.length === 0) {
            this.showToast("ไม่มีข้อมูลส่งออก", "warning");
            return;
        }

        // CSV Headers
        const headers = [
            "ลำดับ", "เบอร์รถ", "ทะเบียนรถ", "รุ่นรถ", "ประเภทธุรกิจ", "คลังฟลีต", 
            "ระยะกำหนด PM", "วิ่งเฉลี่ยต่อเดือน", "KM ล่าสุด", "วันที่อัปเดต", 
            "กิโลเมตรครั้งต่อไป", "ระยะคงเหลือ", "วันที่ประมาณการ Plan", "สถานะ", "ผู้รับผิดชอบ"
        ];
        
        let csvContent = "\uFEFF"; // UTF-8 BOM for Thai Excel
        csvContent += headers.join(",") + "\r\n";
        
        vehicles.forEach(v => {
            const row = [
                v.id, v.vehicleNo, v.license, v.model, v.businessType, v.fleet,
                v.pmInterval, v.avgKmPerMonth, v.lastKm, v.lastKmDate,
                v.nextKm, v.remainingKm, v.planDate, v.status, v.responsible
            ].map(val => `"${val}"`).join(",");
            csvContent += row + "\r\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `AutoPM_Fleet_Export_${DateUtils.todayStr()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast("ส่งออกข้อมูล Excel/CSV เรียบร้อย", "success");
    }

    exportJSONBackup() {
        const vehicles = this.manager.getVehicles();
        if (vehicles.length === 0) {
            this.showToast("ไม่มีข้อมูลส่งออก", "warning");
            return;
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vehicles, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `AutoPM_Backup_${DateUtils.todayStr()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast("สำรองข้อมูลไฟล์ JSON สำเร็จ", "success");
    }

    // Toast alerts helper
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        if (type === 'danger') {
            icon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else if (type === 'warning') {
            icon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        } else if (type === 'info') {
            icon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }
        
        toast.innerHTML = `
            ${icon}
            <span>${message}</span>
        `;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            setTimeout(() => {
                this.toastContainer.removeChild(toast);
            }, 400);
        }, 3500);
    }
}

// App bootstrapping
document.addEventListener('DOMContentLoaded', () => {
    const manager = new VehicleManager();
    const controller = new UIController(manager);
    controller.init();
});
