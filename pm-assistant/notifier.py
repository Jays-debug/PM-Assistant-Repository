import requests
import datetime
import json
import os
import time
from pathlib import Path
from sqlalchemy.orm import Session
from database import PMPlan, Setting, NotificationLog

LOG_DIR = Path(__file__).resolve().parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

def _append_log(filename: str, message: str):
    try:
        with open(LOG_DIR / filename, "a", encoding="utf-8") as f:
            f.write(f"{datetime.datetime.now().isoformat(timespec='seconds')} {message}\n")
    except Exception:
        pass

def _mask_token(token: str) -> str:
    if not token:
        return ""
    return token[:8] + "..." + token[-8:] if len(token) > 20 else "***"

def analyze_line_error(status_code, response_text, token, target_id, payload):
    """LINE Diagnostic Build v1.4.1: classify token / target / payload / API errors."""
    token_clean = (token or "").strip()
    target_clean = (target_id or "").strip()
    text = ""
    try:
        text = payload.get("messages", [{}])[0].get("text", "")
    except Exception:
        text = ""

    token_ok = bool(token_clean and len(token_clean) > 40)
    target_prefix_ok = bool(target_clean and target_clean[0] in ["C", "U", "R"])
    target_len_ok = bool(target_clean and len(target_clean) >= 20)
    payload_ok = bool(text and len(text.strip()) > 0 and len(text) <= 5000)

    line_message = ""
    line_details = []
    try:
        parsed = json.loads(response_text or "{}")
        line_message = parsed.get("message", "") or ""
        line_details = parsed.get("details", []) or []
    except Exception:
        parsed = None
        line_message = response_text or ""

    root_cause = "UNKNOWN"
    suggestion = "ดู Raw HTTP Response เพิ่มเติม หรือกด System Snapshot ส่งให้วิเคราะห์"
    severity = "warning"

    if not token_ok:
        root_cause = "TOKEN_MISSING_OR_TOO_SHORT"
        suggestion = "Channel Access Token ว่าง/สั้นเกินไป ให้กด Reissue ใน LINE Developers แล้วบันทึกใหม่"
        severity = "danger"
    elif status_code == 401:
        root_cause = "INVALID_OR_EXPIRED_TOKEN"
        suggestion = "Token ผิดหรือหมดอายุ ให้ Reissue Channel Access Token และบันทึกใหม่"
        severity = "danger"
    elif not target_prefix_ok or not target_len_ok:
        root_cause = "INVALID_TARGET_FORMAT"
        suggestion = "Target ID ต้องขึ้นต้นด้วย C/U/R และต้องเป็นค่าเต็มที่ได้จาก Webhook ล่าสุด"
        severity = "danger"
    elif not payload_ok:
        root_cause = "INVALID_PAYLOAD_TEXT"
        suggestion = "ข้อความว่างหรือยาวเกิน 5,000 ตัวอักษร ให้ลดความยาวข้อความ/แบ่งข้อความ"
        severity = "danger"
    elif status_code == 200:
        root_cause = "OK"
        suggestion = "ส่งข้อความสำเร็จ"
        severity = "success"
    elif status_code == 400:
        # LINE often returns generic 'Failed to send messages'; keep raw response too.
        msg_lower = (line_message or "").lower()
        detail_text = json.dumps(line_details, ensure_ascii=False).lower()
        if "to" in msg_lower or "to" in detail_text:
            root_cause = "TARGET_REJECTED_BY_LINE"
            suggestion = "LINE ปฏิเสธ Target ID: ตรวจว่าใช้ Group ID ล่าสุด, Bot ยังอยู่ในกลุ่ม, และเลือก Target จากรายการ LINE Targets"
        elif "message" in msg_lower or "messages" in msg_lower or "text" in detail_text:
            root_cause = "PAYLOAD_REJECTED_BY_LINE"
            suggestion = "LINE ปฏิเสธข้อความ: ตรวจว่าข้อความไม่ว่าง ไม่เกิน 5,000 ตัวอักษร และรูปแบบ messages ถูกต้อง"
        else:
            root_cause = "TARGET_OR_PAYLOAD_REJECTED"
            suggestion = "LINE แจ้ง 400 แบบกว้าง ๆ ให้ดู Raw Request/Response: มักเกิดจาก Target ID ไม่ถูกต้อง, Bot ไม่อยู่ในกลุ่ม, หรือข้อความผิดรูปแบบ"
        severity = "danger"
    elif status_code == 403:
        root_cause = "FORBIDDEN_OR_BOT_NOT_IN_GROUP"
        suggestion = "Bot อาจไม่ได้อยู่ในกลุ่ม หรือสิทธิ์ Push ถูกจำกัด ให้เชิญ Bot เข้ากลุ่มและเปิด Allow bot to join group chats"
        severity = "danger"
    elif status_code == 429:
        root_cause = "RATE_LIMIT"
        suggestion = "ส่งข้อความถี่เกินไปหรือเกินโควต้า ให้รอสักครู่แล้วลองใหม่"
        severity = "warning"
    elif status_code and 500 <= status_code < 600:
        root_cause = "LINE_SERVER_ERROR"
        suggestion = "LINE API มีปัญหาชั่วคราว ให้ลองใหม่ภายหลัง"
        severity = "warning"

    return {
        "root_cause": root_cause,
        "reason": root_cause,  # backward compatible for old UI
        "suggestion": suggestion,
        "severity": severity,
        "line_message": line_message,
        "line_details": line_details,
        "raw_response_parsed": parsed,
        "checks": {
            "token_format": token_ok,
            "target_prefix": target_prefix_ok,
            "target_length": target_len_ok,
            "payload_text": payload_ok,
            "payload_text_length": len(text or "")
        }
    }

def send_line_message_debug(token: str, target_id: str, text: str):
    """Send LINE push message and return full LINE Diagnostic Build details."""
    url = "https://api.line.me/v2/bot/message/push"
    token_clean = (token or "").strip()
    target_clean = (target_id or "").strip()
    text_value = text or ""
    payload = {"to": target_clean, "messages": [{"type": "text", "text": text_value}]}
    safe_headers = {"Content-Type": "application/json", "Authorization": f"Bearer {_mask_token(token_clean)}"}
    timeline = []
    def mark(step, ok=True, detail=""):
        timeline.append({"time": datetime.datetime.now().isoformat(timespec='seconds'), "step": step, "ok": bool(ok), "detail": detail})

    result = {
        "success": False,
        "status_code": None,
        "url": url,
        "method": "POST",
        "request_headers": safe_headers,
        "request_payload": payload,
        "request_body": payload,
        "response_headers": {},
        "response_text": "",
        "response_json": None,
        "error_type": "",
        "analysis": {},
        "timeline": timeline,
        "token_masked": _mask_token(token_clean),
        "target_id": target_clean,
        "target_type": "group" if target_clean.startswith("C") else ("user" if target_clean.startswith("U") else ("room" if target_clean.startswith("R") else "unknown")),
        "message_length": len(text_value),
        "elapsed_ms": None,
        "sent_at": datetime.datetime.now().isoformat(timespec='seconds')
    }

    mark("validate_config", True, "ตรวจ Token / Target / Payload")
    if not token_clean or not target_clean:
        result["error_type"] = "CONFIG_MISSING"
        result["analysis"] = analyze_line_error(None, "", token_clean, target_clean, payload)
        mark("stop", False, "Token หรือ Target ว่าง")
        _append_log("line.log", json.dumps(result, ensure_ascii=False))
        return result

    if not text_value.strip():
        result["error_type"] = "PAYLOAD_EMPTY"
        result["analysis"] = analyze_line_error(None, "", token_clean, target_clean, payload)
        mark("stop", False, "ข้อความว่าง")
        _append_log("line.log", json.dumps(result, ensure_ascii=False))
        return result

    if len(text_value) > 5000:
        result["error_type"] = "PAYLOAD_TOO_LONG"
        result["analysis"] = analyze_line_error(None, "", token_clean, target_clean, payload)
        mark("stop", False, "ข้อความยาวเกิน 5,000 ตัวอักษร")
        _append_log("line.log", json.dumps(result, ensure_ascii=False))
        return result

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token_clean}"}
    mark("build_request", True, f"Target={target_clean[:8]}... MessageLength={len(text_value)}")
    start_time = time.time()
    try:
        mark("send_to_line_api", True, url)
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        result["elapsed_ms"] = int((time.time() - start_time) * 1000)
        result["status_code"] = response.status_code
        result["response_text"] = response.text
        result["response_headers"] = {k: v for k, v in response.headers.items() if k.lower() in ["content-type", "x-line-request-id", "date"]}
        try:
            result["response_json"] = response.json()
        except Exception:
            result["response_json"] = None
        result["success"] = response.status_code == 200
        result["error_type"] = "OK" if result["success"] else "LINE_API_ERROR"
        mark("receive_line_response", result["success"], f"HTTP {response.status_code} in {result['elapsed_ms']} ms")
        result["analysis"] = analyze_line_error(response.status_code, response.text, token_clean, target_clean, payload)
        mark("analyze_response", result["success"], result["analysis"].get("root_cause", "UNKNOWN"))
        _append_log("line.log", json.dumps(result, ensure_ascii=False))
        return result
    except requests.exceptions.Timeout as e:
        result["elapsed_ms"] = int((time.time() - start_time) * 1000)
        result["error_type"] = "TIMEOUT"
        result["response_text"] = str(e)
        mark("request_exception", False, "TIMEOUT")
    except Exception as e:
        result["elapsed_ms"] = int((time.time() - start_time) * 1000)
        result["error_type"] = "REQUEST_EXCEPTION"
        result["response_text"] = str(e)
        mark("request_exception", False, str(e))
    result["analysis"] = analyze_line_error(result["status_code"], result["response_text"], token_clean, target_clean, payload)
    _append_log("line.log", json.dumps(result, ensure_ascii=False))
    return result

def send_line_message(token: str, target_id: str, text: str) -> bool:
    result = send_line_message_debug(token, target_id, text)
    if result.get("success"):
        print("[Notifier] Line notification sent successfully.")
    else:
        print(f"[Notifier] Failed to send Line notification. Status: {result.get('status_code')}, Response: {result.get('response_text')}, Analysis: {result.get('analysis')}")
    return bool(result.get("success"))

def get_alert_summary_text(db: Session) -> str:
    """
    Generates a structured report text for the Line alert including:
    1. Overdue vehicles
    2. Today's PM schedule
    3. Tomorrow's PM schedule
    4. General stats (Total, Planned, In Progress, Overdue, Completed)
    """
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)
    
    # 1. Overdue vehicles: deadline_date < today AND status != 'Completed' AND status != 'Cancelled'
    overdue_query = db.query(PMPlan).filter(
        PMPlan.deadline_date < today,
        PMPlan.status != "Completed",
        PMPlan.status != "Cancelled"
    ).all()
    
    # 2. Today's PM plans: planned_date == today
    today_query = db.query(PMPlan).filter(
        PMPlan.planned_date == today,
        PMPlan.status != "Cancelled"
    ).all()

    # 3. Tomorrow's PM plans: planned_date == tomorrow
    tomorrow_query = db.query(PMPlan).filter(
        PMPlan.planned_date == tomorrow,
        PMPlan.status != "Cancelled"
    ).all()
    
    # 4. Overall stats
    total_active = db.query(PMPlan).filter(PMPlan.status != "Cancelled").count()
    planned_count = db.query(PMPlan).filter(PMPlan.status == "Planned").count()
    in_progress_count = db.query(PMPlan).filter(PMPlan.status == "In Progress").count()
    completed_count = db.query(PMPlan).filter(PMPlan.status == "Completed").count()
    overdue_count = len(overdue_query)
    
    # Format message
    msg = f"🔔 [รายงานสรุปแผนงาน PM ประจำวันที่ {today.strftime('%d/%m/%Y')}]\n"
    msg += "=========================\n"
    
    # Today section
    msg += f"📍 แผนเข้าวันนี้ ({len(today_query)} คัน):\n"
    if today_query:
        for idx, plan in enumerate(today_query, 1):
            msg += f" {idx}. ทะเบียน: {plan.vehicle_no}\n"
            msg += f"    งาน: {plan.job_title}\n"
            msg += f"    สถานที่: {plan.location}\n"
            msg += f"    สถานะ: {plan.status}\n"
    else:
        msg += " - ไม่มีแผนเข้าวันนี้ -\n"
        
    msg += "-------------------------\n"
    
    # Tomorrow section
    msg += f"🗓️ แผนเข้าวันพรุ่งนี้ ({len(tomorrow_query)} คัน):\n"
    if tomorrow_query:
        for idx, plan in enumerate(tomorrow_query, 1):
            msg += f" {idx}. ทะเบียน: {plan.vehicle_no}\n"
            msg += f"    งาน: {plan.job_title}\n"
            msg += f"    สถานที่: {plan.location}\n"
    else:
        msg += " - ไม่มีแผนเข้าวันพรุ่งนี้ -\n"
        
    msg += "-------------------------\n"

    # Overdue section
    msg += f"⚠️ งานเลยกำหนดส่งมอบ (Overdue - {overdue_count} คัน):\n"
    if overdue_query:
        for idx, plan in enumerate(overdue_query, 1):
            msg += f" {idx}. ทะเบียน: {plan.vehicle_no}\n"
            msg += f"    งาน: {plan.job_title}\n"
            msg += f"    กำหนดเสร็จ (Deadline): {plan.deadline_date.strftime('%d/%m/%Y')}\n"
    else:
        msg += " - ไม่มีงานเลยกำหนด -\n"
        
    msg += "=========================\n"
    
    # Stats section
    msg += "📊 สรุปยอดแผนงานทั้งหมด:\n"
    msg += f"- แผนทั้งหมดที่ยังไม่ยกเลิก: {total_active} คัน\n"
    msg += f"- รอนัดเข้าทำ (Planned): {planned_count} คัน\n"
    msg += f"- กำลังดำเนินการ (In Progress): {in_progress_count} คัน\n"
    msg += f"- เลยกำหนดส่งมอบ (Overdue): {overdue_count} คัน\n"
    msg += f"- เสร็จสิ้นแล้ว (Completed): {completed_count} คัน\n"
    
    return msg

def trigger_daily_notification(db: Session) -> bool:
    """Retrieves Line credentials, builds report, sends it, and writes Notification_Log."""
    token_setting = db.query(Setting).filter(Setting.key == "line_channel_access_token").first()
    target_setting = db.query(Setting).filter(Setting.key == "line_target_id").first()
    template_setting = db.query(Setting).filter(Setting.key == "notification_template").first()

    token = token_setting.value if token_setting else ""
    target_id = target_setting.value if target_setting else ""

    if not token or not target_id:
        db.add(NotificationLog(channel="LINE", target_id=target_id, message="", status="skipped", response="Line token/target not configured"))
        db.commit()
        print("[Notifier] Trigger failed: Line parameters are not fully configured.")
        return False

    msg_text = get_alert_summary_text(db)
    # Quick edit header/footer template. The full report is appended so operation detail is not lost.
    if template_setting and template_setting.value:
        today = datetime.date.today()
        tomorrow = today + datetime.timedelta(days=1)
        overdue_count = db.query(PMPlan).filter(PMPlan.deadline_date < today, PMPlan.status != "Completed", PMPlan.status != "Cancelled").count()
        today_count = db.query(PMPlan).filter(PMPlan.planned_date == today, PMPlan.status != "Cancelled").count()
        tomorrow_count = db.query(PMPlan).filter(PMPlan.planned_date == tomorrow, PMPlan.status != "Cancelled").count()
        header = template_setting.value.format(date=today.strftime('%d/%m/%Y'), today_count=today_count, tomorrow_count=tomorrow_count, overdue_count=overdue_count)
        msg_text = header + "\n\n" + msg_text

    result = send_line_message_debug(token, target_id, msg_text)
    success = bool(result.get("success"))
    db.add(NotificationLog(channel="LINE", target_id=target_id, message=msg_text, status="success" if success else "failed", response=json.dumps(result, ensure_ascii=False)))
    db.commit()
    return success
