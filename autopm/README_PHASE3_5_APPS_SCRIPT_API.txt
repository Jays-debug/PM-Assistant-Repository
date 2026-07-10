AutoPM Phase 3.5 - Google Sheet + Apps Script API

สิ่งที่เพิ่ม:
1) AutoPM รองรับ Apps Script Web App URL ที่ส่งข้อมูล JSON แล้ว
2) ยังรองรับ CSV เดิมและ data.csv สำรองเหมือนเดิม
3) มี JSONP fallback สำหรับ Apps Script กรณี Browser ติด CORS/Redirect

วิธีติดตั้ง Apps Script API:
1. เปิด Google Sheet ฐานข้อมูล PM
2. ไปที่ Extensions > Apps Script
3. สร้างไฟล์ Code.gs แล้ววางโค้ดจากไฟล์ apps_script_api.gs
4. กด Save
5. กด Deploy > New deployment
6. Type เลือก Web app
7. Execute as: Me
8. Who has access: Anyone with the link
9. กด Deploy แล้ว Copy Web app URL
10. เปิด AutoPM > ดึงข้อมูล & อัปเดต (Sync)
11. วาง Web app URL ลงช่อง Google Sheet API URL / CSV Link
12. กด ดึงข้อมูลล่าสุดจาก API / Google Sheets

หมายเหตุ:
- ค่าเริ่มต้นของ Apps Script จะอ่านชีทชื่อ "ข้อมูล PM"
- ถ้าชื่อชีทไม่ตรง สามารถเติมท้าย URL ได้ เช่น
  https://script.google.com/macros/s/xxxxx/exec?sheet=PM%20Data
- ถ้าต้องการกลับไปใช้ CSV เดิม ยังใช้ลิงก์ output=csv ได้เหมือนเดิม
