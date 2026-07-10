import datetime
import csv
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Date, DateTime, Boolean, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./pm_tracking.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class VehicleMaster(Base):
    __tablename__ = "vehicle_master"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_no = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_code = Column(String(80), nullable=True)
    transport_type = Column(String(120), nullable=True)
    vehicle_model = Column(String(120), nullable=True)
    fleet = Column(String(120), nullable=True)
    vehicle_type = Column(String(120), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Location(Base):
    __tablename__ = "location_master"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    province = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    service_type = Column(String(50), default="external")
    address = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class PMPlan(Base):
    __tablename__ = "pm_plan"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_no = Column(String(50), nullable=False, index=True)
    job_title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    planned_date = Column(Date, nullable=False, index=True)
    actual_date = Column(Date, nullable=True)
    deadline_date = Column(Date, nullable=False, index=True)
    location = Column(String(100), nullable=False)
    vehicle_code = Column(String(80), nullable=True)
    vehicle_model = Column(String(120), nullable=True)
    transport_type = Column(String(120), nullable=True)
    fleet = Column(String(120), nullable=True)
    vehicle_type = Column(String(120), nullable=True)
    status = Column(String(50), default="Planned")
    created_by = Column(String(100), default="system")
    updated_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class PMHistory(Base):
    __tablename__ = "pm_history"
    id = Column(Integer, primary_key=True, index=True)
    pm_plan_id = Column(Integer, index=True, nullable=False)
    action = Column(String(50), nullable=False)  # create/update/delete/import
    changed_by = Column(String(100), default="system")
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)
    old_data = Column(Text, nullable=True)
    new_data = Column(Text, nullable=True)
    note = Column(Text, nullable=True)

class LineTarget(Base):
    __tablename__ = "line_targets"
    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String(30), nullable=False)  # user/group/room
    source_id = Column(String(200), unique=True, index=True, nullable=False)
    display_name = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    last_event_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LineWebhookEvent(Base):
    __tablename__ = "line_webhook_events"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=True)
    source_type = Column(String(30), nullable=True)
    source_id = Column(String(200), nullable=True)
    raw_payload = Column(Text, nullable=True)
    status = Column(String(50), default="received")
    received_at = Column(DateTime, default=datetime.datetime.utcnow)

class NotificationLog(Base):
    __tablename__ = "notification_log"
    id = Column(Integer, primary_key=True, index=True)
    channel = Column(String(50), default="LINE")
    target_id = Column(String(200), nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String(50), nullable=False)  # success/failed/skipped
    response = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)

class ImportLog(Base):
    __tablename__ = "import_log"
    id = Column(Integer, primary_key=True, index=True)
    import_type = Column(String(50), nullable=False)  # plans/locations/vehicles
    filename = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)  # previewed/imported/failed
    total_rows = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    error_rows = Column(Integer, default=0)
    imported_rows = Column(Integer, default=0)
    errors = Column(Text, nullable=True)
    created_by = Column(String(100), default="system")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserMaster(Base):
    __tablename__ = "user_master"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(150), nullable=True)
    role = Column(String(50), default="Admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PMTaskState(Base):
    __tablename__ = "pm_task_state"
    id = Column(Integer, primary_key=True, index=True)
    pm_plan_id = Column(Integer, unique=True, index=True, nullable=False)
    paused = Column(Boolean, default=False)
    pause_reason = Column(String(200), nullable=True)
    followup_status = Column(String(100), nullable=True)
    quick_note = Column(Text, nullable=True)
    snooze_until = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    last_reminded_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class WeeklyCampaign(Base):
    __tablename__ = "weekly_campaign"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    month = Column(Integer, nullable=False, index=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class WeeklyCampaignItem(Base):
    __tablename__ = "weekly_campaign_item"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, nullable=False, index=True)
    vehicle_no = Column(String(80), nullable=False, index=True)
    registration = Column(String(80), nullable=True)
    pm_group = Column(String(80), nullable=True)
    week_no = Column(Integer, default=1, index=True)
    lot_name = Column(String(100), nullable=True)
    status = Column(String(30), default="pending", index=True)
    actual_date = Column(Date, nullable=True)
    note = Column(Text, nullable=True)
    pm_plan_id = Column(Integer, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"
    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=True)

def _table_exists(inspector, table_name: str) -> bool:
    try:
        return table_name in inspector.get_table_names()
    except Exception:
        return False

def import_data_car_to_vehicle_master(db):
    csv_path = os.path.join(os.path.dirname(__file__), "Data Car.csv")
    if not os.path.exists(csv_path):
        return 0
    count = 0
    try:
        cache = {v.vehicle_no: v for v in db.query(VehicleMaster).all()}
        with open(csv_path, mode="r", encoding="cp874", errors="ignore") as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                if len(row) < 5:
                    continue
                vehicle_no = row[4].strip()
                if not vehicle_no:
                    continue
                vm = cache.get(vehicle_no)
                if not vm:
                    vm = VehicleMaster(vehicle_no=vehicle_no)
                    db.add(vm)
                    cache[vehicle_no] = vm
                    count += 1
                vm.vehicle_code = row[0].strip() if len(row) > 0 else ""
                vm.transport_type = row[1].strip() if len(row) > 1 else ""
                vm.vehicle_model = row[2].strip() if len(row) > 2 else ""
                vm.fleet = row[3].strip() if len(row) > 3 else ""
                vm.vehicle_type = row[5].strip() if len(row) > 5 else ""
                vm.updated_at = datetime.datetime.utcnow()
        db.commit()
    except Exception as e:
        print("Vehicle master import warning:", e)
        db.rollback()
    return count

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        inspector = inspect(engine)
        # Migrate old v1 tables into new master tables once.
        if _table_exists(inspector, "locations") and db.query(Location).count() == 0:
            rows = db.execute(text("SELECT name, province, district, service_type, address, note FROM locations")).fetchall()
            for r in rows:
                db.add(Location(name=r[0], province=r[1], district=r[2], service_type=r[3] or "external", address=r[4], note=r[5]))
            db.commit()
        if _table_exists(inspector, "pm_plans") and db.query(PMPlan).count() == 0:
            rows = db.execute(text("SELECT vehicle_no, job_title, description, planned_date, actual_date, deadline_date, location, vehicle_code, vehicle_model, transport_type, fleet, vehicle_type, status, created_at FROM pm_plans")).fetchall()
            for r in rows:
                def pd(v):
                    if not v: return None
                    if isinstance(v, datetime.date): return v
                    return datetime.date.fromisoformat(str(v)[:10])
                db.add(PMPlan(vehicle_no=r[0], job_title=r[1], description=r[2], planned_date=pd(r[3]), actual_date=pd(r[4]), deadline_date=pd(r[5]), location=r[6], vehicle_code=r[7], vehicle_model=r[8], transport_type=r[9], fleet=r[10], vehicle_type=r[11], status=r[12] or "Planned"))
            db.commit()
        if db.query(Location).count() == 0:
            for loc in [
                {"name":"ศูนย์ ISUZU (แหลมฉบัง อ.ศรีราชา)", "province":"ชลบุรี", "district":"ศรีราชา", "service_type":"external"},
                {"name":"ศูนย์ ISUZU (ทับมา จ.ระยอง)", "province":"ระยอง", "district":"เมืองระยอง", "service_type":"external"},
                {"name":"Volvo (บางละมุง)", "province":"ชลบุรี", "district":"บางละมุง", "service_type":"external"},
                {"name":"ฟลีตซ่อมบำรุงศรีราชา", "province":"ชลบุรี", "district":"ศรีราชา", "service_type":"internal"}
            ]:
                db.add(Location(**loc))
            db.commit()
        import_data_car_to_vehicle_master(db)
        if not db.query(UserMaster).filter(UserMaster.username == "admin").first():
            db.add(UserMaster(username="admin", display_name="System Admin", role="Admin"))
        default_settings = {
            "line_channel_access_token": "",
            "line_target_id": "",
            "line_channel_secret": "",
            "line_webhook_enabled": "true",
            "alert_days_before": "3",
            "scheduler_time": "08:00",
            "scheduler_enabled": "false",
            "notification_template": "🔔 รายงาน PM {date}\nวันนี้ {today_count} คัน | พรุ่งนี้ {tomorrow_count} คัน | Overdue {overdue_count} คัน",
            "debug_mode": "false",
            "last_line_debug": "",
            "morning_brief_time": "08:00",
            "followup_time": "14:00",
            "evening_summary_time": "17:30",
            "weekly_summary_day": "fri",
            "weekly_summary_time": "17:00",
            "assistant_notifications_enabled": "false"
        }
        for k, v in default_settings.items():
            if not db.query(Setting).filter(Setting.key == k).first():
                db.add(Setting(key=k, value=v))
        db.commit()
    except Exception as e:
        print("Error initializing database:", e)
        db.rollback()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
