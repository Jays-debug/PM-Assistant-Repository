Phase 4.1.7 — Business Filter Column AK Fix

สิ่งที่แก้ไข:
- ปรับ Mapping ประเภทธุรกิจ/ธุรกิจขนส่ง ให้ใช้ข้อมูลจาก Google Sheet Column AK เป็นหลัก
- แก้ปัญหา Filter ธุรกิจขนส่งไปจับหัวคอลัมน์เก่าหรือคอลัมน์อื่นผิดตำแหน่ง
- Dashboard / Summary / Tracking / Calendar / Dropdown ธุรกิจ จะอิงจาก Column AK เดียวกัน

หมายเหตุ:
- Column AK = ประเภทธุรกิจ
- Column AL = ประเภทรถ
- Column AM = ผู้รับผิดชอบ
- รอบนี้ไม่ต้องแก้ Apps Script ถ้า API เดิมส่งข้อมูลทั้งแถวครบอยู่แล้ว

วิธีใช้:
1. อัป ZIP ขึ้น Netlify ทับ Project หลัก
2. เปิดเว็บแล้วกด Refresh API หรือ Ctrl+F5
3. ไปหน้า Tracking แล้วเช็ก Filter ธุรกิจขนส่ง ต้องเห็นค่าเช่น Oil / Non-oil / ใช้ในกิจการ PTGLG ตามข้อมูล Column AK
