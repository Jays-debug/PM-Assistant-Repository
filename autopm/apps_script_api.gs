/**
 * AutoPM Apps Script API (JSON)
 * ใช้กับ Google Sheet ที่มีชีทชื่อ "ข้อมูล PM" หรือ "PM Data"
 * Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
 * Execute as: Me
 * Who has access: Anyone with the link
 */

const DEFAULT_SHEET_NAME = 'ข้อมูล PM';
const API_VERSION = '3.5.3';

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const sheetName = params.sheet || DEFAULT_SHEET_NAME;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName) || ss.getSheetByName('PM Data') || ss.getSheets()[0];

    const range = sheet.getDataRange();
    const rows = range.getDisplayValues(); // ใช้ค่าที่เห็นในชีทจริง เช่น วันที่/เลขไมล์ format เดิม
    const validRowCount = Math.max(rows.slice(1).filter(r => String(r[0] || '').trim() !== '').length, 0);

    const output = {
      success: true,
      source: 'Apps Script API',
      version: API_VERSION,
      spreadsheetName: ss.getName(),
      sheetName: sheet.getName(),
      updatedAt: new Date().toISOString(),
      rowCount: Math.max(rows.length - 1, 0),
      validRowCount: validRowCount,
      rows: rows
    };

    // รองรับ JSONP fallback: ?callback=functionName
    if (params.callback) {
      return ContentService
        .createTextOutput(params.callback + '(' + JSON.stringify(output) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const output = {
      success: false,
      version: API_VERSION,
      error: String(err && err.message ? err.message : err),
      updatedAt: new Date().toISOString()
    };

    const params = (e && e.parameter) || {};
    if (params.callback) {
      return ContentService
        .createTextOutput(params.callback + '(' + JSON.stringify(output) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testApi() {
  const result = doGet({ parameter: { sheet: DEFAULT_SHEET_NAME } }).getContent();
  Logger.log(result.slice(0, 1000));
}
