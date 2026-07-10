# Phase 4.1.2 - Grade S Dashboard UX + Vehicle Type (Column AL)

ฐานไฟล์: เริ่มจาก `viwe_pm_phase4_1_grade_s_dashboard_ux.zip` เพื่อไม่ให้ UI ถอยกลับไปเป็น Phase 3.5.4

## สิ่งที่แก้
1. รักษา Layout Grade S Premium ของ Phase 4.1
2. เพิ่มตัวอ่านวันที่หลายรูปแบบสำหรับ PM Monthly Trend
   - 22/06/2569
   - 2026-06-22
   - 22 มิ.ย. 2569
   - Google Sheets serial date
3. เพิ่มข้อมูล `ประเภทรถ` จาก Column AL
4. เพิ่ม Dashboard card: Vehicle Type Mix / สัดส่วนประเภทรถ
5. เพิ่ม Summary tab: ประเภทรถ
6. เพิ่ม Tracking filter: ทุกประเภทรถ
7. เพิ่ม chip ประเภทรถในตาราง Tracking และ Modal รายละเอียดรถ
8. ย่อกล่องนิยามสถานะ PM ให้เป็นหมายเหตุ ไม่แย่งจุดโฟกัสหลัก

## หมายเหตุ
- ไม่ต้องแก้ Apps Script หาก API ส่งข้อมูลครบทุกคอลัมน์อยู่แล้ว
- ถ้า Column AL ยังไม่แสดง ให้กด Sync ใหม่และล้าง Cache ในหน้า Sync
