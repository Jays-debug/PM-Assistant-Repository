PM Tracking System v1.4.1 - LINE Diagnostic Build

อัปเดตหลัก:
1. LINE Inspector ตรวจสถานะ Token / Target / Webhook / Last Push
2. Raw HTTP Request แสดง method, URL, headers แบบ mask token, body ที่ส่งไป LINE
3. Raw HTTP Response แสดง status, headers, response_text, response_json จาก LINE API
4. Error Analyzer v2 แยก root cause: token / target / payload / forbidden / rate limit / LINE server
5. Notification Timeline แสดงขั้นตอน validate -> build request -> send -> receive -> analyze
6. Request History แสดงประวัติส่ง LINE พร้อม HTTP code และ root cause
7. Health Check Upgrade ตรวจ database, vehicle, PM, LINE, logs
8. LINE Message Simulator v2 preview payload ก่อนส่งจริง
9. Config Validator Upgrade ใช้ข้อมูล validation เดิมและ health check เพิ่ม
10. Log Center รองรับ line/webhook/scheduler/system/api logs
11. Developer Console ใต้เมนูซ้ายล่าง เพิ่มทางลัด Inspector, History, Logs, API Tester, Snapshot
12. API Tester เตรียม/ตรวจ payload endpoint ภายใน
13. System Snapshot export ZIP สำหรับ debug โดยไม่เปิดเผย Token เต็ม

หมายเหตุ:
- ใช้ฐานข้อมูล pm_tracking.db เดิมจากไฟล์ที่อัปโหลดไว้ ไม่สร้างฐานใหม่ทับ
- Token ใน Snapshot จะถูก mask
- ถ้า LINE ยังตอบ 400 ให้ดู Raw HTTP Response และ Request Payload ใน LINE Inspector
