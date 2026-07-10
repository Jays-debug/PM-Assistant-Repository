AutoPM Phase 4.1.6 — Fleet Command Center Final

เป้าหมาย:
ยกระดับหน้า Dashboard PM จากรายงานทั่วไปให้เป็น Fleet Command Center ที่ผู้บริหารเปิดแล้วเข้าใจสถานการณ์ใน 5 วินาที

สิ่งที่เพิ่มในเวอร์ชันนี้:
1) Hero Zone Premium
- เพิ่ม Total Fleet, Safe Rate, Risk Load ใต้ Fleet Health Score
- ถ้ามี Overdue จะขึ้นโทน Risk ถ้าไม่มีและคะแนนดีจะขึ้นโทน Excellent
วิธีใช้: เปิดหน้า Dashboard PM ดูภาพรวม Fleet ได้ทันที

2) KPI Trend
- เพิ่มป้าย Trend ใน Command Brief เช่น เพิ่ม/ลดจาก Snapshot ก่อนหน้า
- Overdue/Follow Up ลดลง = สีเขียว, เพิ่มขึ้น = สีแดง
วิธีใช้: ใช้ดูทิศทางว่า PM ดีขึ้นหรือแย่ลงจากรอบก่อนหน้า

3) Vehicle Type Mix
- ใช้ข้อมูล Column AL ประเภทรถ
- เพิ่มแถบสัดส่วนในแต่ละประเภทรถ
วิธีใช้: ดูสัดส่วนประเภทรถและสถานะสุขภาพของแต่ละกลุ่ม

4) Top 10 Critical
- เพิ่มกล่องรถเกินระยะหนักสุด 10 อันดับ
- คลิกแต่ละคันเพื่อเปิดรายละเอียดรถ
- ถ้าไม่มี Overdue จะแสดง Empty State ว่าไม่มีรถเกินระยะ
วิธีใช้: ใช้ตอบผู้บริหารทันทีว่า “คันไหนต้องจัดการก่อน”

5) Sync Monitor
- แสดงสถานะ Online/Cache Mode
- แสดง Last Sync, Records, API Version, Mode
วิธีใช้: ใช้ตรวจว่า Dashboard ใช้ข้อมูลล่าสุดหรือข้อมูล Cache

Storyboard การใช้งาน:
1. ผู้บริหารเปิดหน้า Dashboard PM
2. มอง Fleet Health Score และ Hero Zone ก่อน
3. ตรวจ Overdue / Follow Up ใน Command Brief
4. ดู Top 10 Critical เพื่อรู้คันที่ต้องเร่งทำ
5. ใช้ Quick Action เพื่อเปิด Tracking/Calendar/Copy/Export/Refresh
6. ตรวจ Sync Monitor เพื่อยืนยันว่าข้อมูลอัปเดตล่าสุด

หมายเหตุ:
เวอร์ชันนี้ไม่ต้องแก้ Apps Script เพิ่ม อัป ZIP ทับ Netlify แล้วกด Ctrl+F5 / Sync ได้เลย
