Phase 3.5.2 - API Timestamp Header

เพิ่มข้อมูลเวลาที่อัปเดตจาก Apps Script API ใน Header มุมขวาบน
- แสดงวันที่ปัจจุบัน
- แสดงเวลาอัปเดตข้อมูลล่าสุดจาก API / CSV / cache
- แสดงจำนวนแถว/จำนวนรถ
- Apps Script API เพิ่ม version: 3.5.2

หลังอัป Netlify:
1) อัปโค้ด apps_script_api.gs ใน Apps Script ให้เป็นเวอร์ชันล่าสุด
2) Deploy > Manage deployments > Edit > New version > Deploy
3) เปิด AutoPM > Sync > กดดึงข้อมูลล่าสุด
