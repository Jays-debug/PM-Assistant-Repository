Phase 3.5.3 - API + Count + Sync Stabilize

เพิ่ม/แก้ไข:
1) หน้า Sync มีแผงสถานะข้อมูลระบบ
   - แสดงรถที่ใช้ใน Dashboard
   - แสดงแถวดิบจาก API/CSV
   - แสดงแถวที่ถูกข้าม/ไม่เข้าเงื่อนไข
   - แสดงแหล่งข้อมูล, ประเภทลิงก์, API Version, เวลาอัปเดตล่าสุด

2) แก้ Count ให้ชัดเจน
   - มุมขวาบนยังใช้จำนวนรถที่ระบบใช้งานจริง ไม่ใช่แถวดิบจาก API
   - แยก Raw rows กับ Valid vehicles ในหน้า Sync เพื่อให้ตรวจสอบง่าย

3) Sync ชัดขึ้น
   - ถ้าดึง API สดสำเร็จจะแสดงเป็น Apps Script API / CSV Live
   - ถ้าดึงสดไม่ได้แต่ใช้ cache/data.csv จะแสดงเป็นข้อมูลสำรอง พร้อมข้อความเตือน
   - เพิ่มปุ่มล้าง Cache ข้อมูลสำรอง

4) Apps Script API version เป็น 3.5.3
   - เพิ่ม validRowCount ใน response เพื่อช่วยตรวจสอบข้อมูล

วิธีใช้งาน:
1) อัป ZIP นี้ขึ้น Netlify ทับตัวเดิม
2) นำ apps_script_api.gs ตัวใหม่ไปวางใน Apps Script
3) Deploy > Manage deployments > Edit > New version > Deploy
4) กลับ AutoPM หน้า Sync แล้วกด ดึงข้อมูลล่าสุดจาก API / Google Sheets
5) ตรวจแผงสถานะข้อมูลระบบ
