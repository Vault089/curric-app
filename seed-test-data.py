#!/usr/bin/env python3
"""
Seed script for Curric.app — inserts test data into Supabase.

Inserts:
  - 3 school profiles (international schools in Vietnam, Thailand, China)
  - 6 job listings across those schools (ESL teaching jobs)
  - 2 teacher profiles (non-native English teachers)

Requires: supabase, python-dotenv
Run:  python3 seed-test-data.py
"""

import os
import sys
from datetime import date, timedelta
from dotenv import load_dotenv
from supabase import create_client

# ── Load env ────────────────────────────────────────────────────────────
ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local")
load_dotenv(ENV_PATH)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # service-role key bypasses RLS

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env.local")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Helper ──────────────────────────────────────────────────────────────
def log(msg):
    print(f"  ✓ {msg}")

def err(msg):
    print(f"  ✗ {msg}")

# ── 1. Create auth users (needed for FK references) ────────────────────
# We create real auth users so the FK constraints are satisfied.
# Passwords are random — these are test accounts only.

school_users = [
    {"email": "admin@saigon-academy.edu.vn",   "password": "TestSchool1!", "name": "Saigon International Academy Admin"},
    {"email": "admin@bangkok-language.co.th",   "password": "TestSchool2!", "name": "Bangkok Language Center Admin"},
    {"email": "admin@shanghai-english.edu.cn",  "password": "TestSchool3!", "name": "Shanghai English Academy Admin"},
]

teacher_users = [
    {"email": "ahmed.hassan@test.com",   "password": "TestTeacher1!", "name": "Ahmed Hassan"},
    {"email": "maria.santos@test.com",    "password": "TestTeacher2!", "name": "Maria Santos"},
]

created_user_ids = {}  # email -> uuid

print("\n[1/4] Creating auth users...")
for u in school_users + teacher_users:
    try:
        resp = supabase.auth.admin.create_user({
            "email": u["email"],
            "password": u["password"],
            "email_confirm": True,
            "user_metadata": {"full_name": u["name"]},
        })
        uid = resp.user.id
        created_user_ids[u["email"]] = uid
        log(f"Created auth user: {u['email']}  ->  {uid}")
    except Exception as e:
        # If user already exists, look them up
        if "already" in str(e).lower() or "exists" in str(e).lower():
            # Try to list and find existing
            try:
                users_resp = supabase.auth.admin.list_users()
                for existing in users_resp.users:
                    if existing.email == u["email"]:
                        created_user_ids[u["email"]] = existing.id
                        log(f"Auth user already exists: {u['email']}  ->  {existing.id}")
                        break
                else:
                    err(f"Could not find existing user {u['email']}: {e}")
            except Exception as e2:
                err(f"Error finding existing user {u['email']}: {e2}")
        else:
            err(f"Error creating user {u['email']}: {e}")

print(f"  Auth users resolved: {len(created_user_ids)}/{len(school_users + teacher_users)}")

# ── 2. Insert school profiles ──────────────────────────────────────────
print("\n[2/4] Inserting school profiles...")

schools = [
    {
        "id": created_user_ids.get("admin@saigon-academy.edu.vn"),
        "org_name": "Saigon International Academy",
        "org_type": "international_school",
        "country": "Vietnam",
        "city": "Ho Chi Minh City",
        "website": "https://www.saigon-academy.edu.vn",
        "description": (
            "Saigon International Academy is a leading international school in Ho Chi Minh City, "
            "offering the IB Diploma Programme and Cambridge IGCSE to over 800 students from "
            "40+ nationalities. Founded in 2008, we are committed to nurturing globally-minded "
            "learners through inquiry-based education and multilingual programs."
        ),
        "contact_email": "hr@saigon-academy.edu.vn",
        "contact_phone": "+84 28 3823 4567",
        "is_verified": True,
        "is_active": True,
    },
    {
        "id": created_user_ids.get("admin@bangkok-language.co.th"),
        "org_name": "Bangkok Language Center",
        "org_type": "language_center",
        "country": "Thailand",
        "city": "Bangkok",
        "website": "https://www.bangkok-language.co.th",
        "description": (
            "Bangkok Language Center is one of Thailand's premier English language training providers, "
            "serving corporate clients, university students, and young learners since 2012. We offer "
            "IELTS preparation, business English, and general English courses across 5 locations in "
            "the Bangkok metropolitan area."
        ),
        "contact_email": "recruit@bangkok-language.co.th",
        "contact_phone": "+66 2 654 7890",
        "is_verified": True,
        "is_active": True,
    },
    {
        "id": created_user_ids.get("admin@shanghai-english.edu.cn"),
        "org_name": "Shanghai English Academy",
        "org_type": "language_center",
        "country": "China",
        "city": "Shanghai",
        "website": "https://www.shanghai-english.edu.cn",
        "description": (
            "Shanghai English Academy operates 8 training centers across Shanghai, specializing in "
            "K-12 English education and exam preparation for Chinese students. With a team of 120+ "
            "foreign and local teachers, we deliver curriculum-aligned English programs to over 5,000 "
            "students annually."
        ),
        "contact_email": "jobs@shanghai-english.edu.cn",
        "contact_phone": "+86 21 5888 3456",
        "is_verified": True,
        "is_active": True,
    },
]

school_ids = []
for s in schools:
    if not s["id"]:
        err(f"Skipping school '{s['org_name']}' — no auth user ID")
        continue
    try:
        resp = supabase.table("school_profiles").insert(s).execute()
        sid = resp.data[0]["id"]
        school_ids.append(sid)
        log(f"Inserted school: {s['org_name']}  ({s['country']})")
    except Exception as e:
        err(f"Error inserting school '{s['org_name']}': {e}")

print(f"  Schools inserted: {len(school_ids)}/{len(schools)}")

# ── 3. Insert job listings ─────────────────────────────────────────────
print("\n[3/4] Inserting job listings...")

today = date.today()

jobs = [
    # --- Saigon International Academy (Vietnam) ---
    {
        "school_id": school_ids[0] if len(school_ids) > 0 else None,
        "title": "ESL Teacher - Secondary School",
        "description": (
            "Saigon International Academy is seeking an experienced ESL teacher for our "
            "secondary school program (Grades 7-12). You will teach English Language & Literature "
            "to a diverse, multilingual student body following the Cambridge curriculum. "
            "Responsibilities include lesson planning, formative assessment, and contributing to "
            "the school's English department professional learning community."
        ),
        "country": "Vietnam",
        "city": "Ho Chi Minh City",
        "job_type": "full_time",
        "subject": "english",
        "grade_level": "secondary",
        "salary_min": 2200,
        "salary_max": 2800,
        "min_experience": 2,
        "required_education": "Bachelor's degree",
        "required_certifications": ["TEFL", "TESOL", "CELTA"],
        "start_date": str(today + timedelta(days=45)),
        "application_deadline": str(today + timedelta(days=30)),
        "status": "active",
        "is_featured": True,
    },
    {
        "school_id": school_ids[0] if len(school_ids) > 0 else None,
        "title": "English Language Coordinator",
        "description": (
            "We are looking for a senior English professional to coordinate our K-12 English "
            "language program. This role combines teaching with curriculum leadership: you will "
            "oversee lesson plans for 6 English teachers, manage student language assessments, "
            "and liaise with the academic director on program improvements. Ideal for an educator "
            "looking to step into a leadership position."
        ),
        "country": "Vietnam",
        "city": "Ho Chi Minh City",
        "job_type": "full_time",
        "subject": "english",
        "grade_level": "secondary",
        "salary_min": 2500,
        "salary_max": 3000,
        "min_experience": 4,
        "required_education": "Bachelor's degree",
        "required_certifications": ["TESOL", "CELTA", "DELTA"],
        "start_date": str(today + timedelta(days=60)),
        "application_deadline": str(today + timedelta(days=45)),
        "status": "active",
        "is_featured": False,
    },
    # --- Bangkok Language Center (Thailand) ---
    {
        "school_id": school_ids[1] if len(school_ids) > 1 else None,
        "title": "IELTS Instructor",
        "description": (
            "Bangkok Language Center is hiring an IELTS preparation instructor to join our "
            "test-prep team. You will deliver IELTS Academic and General Training courses to "
            "adult learners targeting band scores of 6.5+. Classes run in the evenings and on "
            "weekends. We provide all course materials and ongoing training from certified "
            "IELTS examiner trainers."
        ),
        "country": "Thailand",
        "city": "Bangkok",
        "job_type": "part_time",
        "subject": "english",
        "grade_level": "adult",
        "salary_min": 1500,
        "salary_max": 2000,
        "min_experience": 1,
        "required_education": "Bachelor's degree",
        "required_certifications": ["IELTS", "TEFL", "TESOL"],
        "start_date": str(today + timedelta(days=30)),
        "application_deadline": str(today + timedelta(days=21)),
        "status": "active",
        "is_featured": True,
    },
    {
        "school_id": school_ids[1] if len(school_ids) > 1 else None,
        "title": "Business English Trainer",
        "description": (
            "Join our corporate training division delivering Business English workshops to "
            "multinational companies in Bangkok. You will conduct on-site and virtual sessions "
            "covering presentations, negotiations, email writing, and cross-cultural communication. "
            "This is a contract role with potential for renewal based on client demand."
        ),
        "country": "Thailand",
        "city": "Bangkok",
        "job_type": "contract",
        "subject": "english",
        "grade_level": "adult",
        "salary_min": 1800,
        "salary_max": 2400,
        "min_experience": 2,
        "required_education": "Bachelor's degree",
        "required_certifications": ["TEFL", "TESOL", "CELTA"],
        "start_date": str(today + timedelta(days=20)),
        "application_deadline": str(today + timedelta(days=14)),
        "status": "active",
        "is_featured": False,
    },
    # --- Shanghai English Academy (China) ---
    {
        "school_id": school_ids[2] if len(school_ids) > 2 else None,
        "title": "ESL Teacher - Primary & Middle School",
        "description": (
            "Shanghai English Academy is expanding and seeking enthusiastic ESL teachers for "
            "our Pudong and Jing'an campuses. You will teach English reading, writing, speaking, "
            "and listening to students aged 6-15 using a communicative, immersive approach. "
            "Maximum class size of 15 students. Teacher housing assistance provided."
        ),
        "country": "China",
        "city": "Shanghai",
        "job_type": "full_time",
        "subject": "english",
        "grade_level": "primary",
        "salary_min": 2000,
        "salary_max": 2600,
        "min_experience": 1,
        "required_education": "Bachelor's degree",
        "required_certifications": ["TEFL", "TESOL"],
        "start_date": str(today + timedelta(days=60)),
        "application_deadline": str(today + timedelta(days=40)),
        "status": "active",
        "is_featured": True,
    },
    {
        "school_id": school_ids[2] if len(school_ids) > 2 else None,
        "title": "Online ESL Tutor (Part-time)",
        "description": (
            "We are recruiting online ESL tutors to deliver 1-on-1 and small group lessons to "
            "Chinese students via our proprietary platform. Flexible scheduling — choose from "
            "afternoon and evening slots (Beijing time). Lessons are 25 or 50 minutes. "
            "Great opportunity for teachers who prefer remote work."
        ),
        "country": "China",
        "city": "Shanghai",
        "job_type": "online",
        "subject": "english",
        "grade_level": "primary",
        "salary_min": 1500,
        "salary_max": 2000,
        "min_experience": 0,
        "required_education": "Bachelor's degree",
        "required_certifications": ["TEFL"],
        "start_date": str(today + timedelta(days=14)),
        "application_deadline": str(today + timedelta(days=10)),
        "status": "active",
        "is_featured": False,
    },
]

job_ids = []
for j in jobs:
    if not j["school_id"]:
        err(f"Skipping job '{j['title']}' — no school_id")
        continue
    try:
        resp = supabase.table("job_listings").insert(j).execute()
        jid = resp.data[0]["id"]
        job_ids.append(jid)
        salary = f"${j['salary_min']:,}-${j['salary_max']:,}/mo"
        log(f"Inserted job: {j['title']}  ({j['country']}, {salary})")
    except Exception as e:
        err(f"Error inserting job '{j['title']}': {e}")

print(f"  Jobs inserted: {len(job_ids)}/{len(jobs)}")

# ── 4. Insert teacher profiles ─────────────────────────────────────────
print("\n[4/4] Inserting teacher profiles...")

teachers = [
    {
        "id": created_user_ids.get("ahmed.hassan@test.com"),
        "full_name": "Ahmed Hassan",
        "email": "ahmed.hassan@test.com",
        "phone": "+20 100 123 4567",
        "nationality": "Egyptian",
        "current_country": "Egypt",
        "city": "Cairo",
        "bio": (
            "Experienced ESL teacher with 5 years of classroom experience across Egypt and the "
            "Middle East. I hold a BA in English Literature from Cairo University and a TEFL "
            "certificate from the British Council. I'm passionate about helping learners from "
            "diverse backgrounds build confidence in English. Currently looking to relocate to "
            "Southeast Asia for my next teaching adventure."
        ),
        "highest_education": "Bachelor's degree",
        "degree_field": "English Literature",
        "certifications": ["TEFL", "IELTS"],
        "years_experience": 5,
        "languages": ["English", "Arabic", "French"],
        "preferred_countries": ["Vietnam", "Thailand", "China"],
        "preferred_job_types": ["Full-time", "Contract"],
        "min_salary_usd": 1800,
        "is_public": True,
    },
    {
        "id": created_user_ids.get("maria.santos@test.com"),
        "full_name": "Maria Santos",
        "email": "maria.santos@test.com",
        "phone": "+63 917 890 1234",
        "nationality": "Filipino",
        "current_country": "Philippines",
        "city": "Manila",
        "bio": (
            "Dedicated English teacher from the Philippines with 3 years of experience in "
            "language schools and online tutoring. I graduated with a BS in Education majoring in "
            "English from the University of Santo Tomas and hold both TESOL and CELTA "
            "certifications. I love working with young learners and have experience with IELTS "
            "prep and communicative English classes."
        ),
        "highest_education": "Bachelor's degree",
        "degree_field": "Education (English)",
        "certifications": ["TESOL", "CELTA", "IELTS"],
        "years_experience": 3,
        "languages": ["English", "Filipino", "Tagalog"],
        "preferred_countries": ["Vietnam", "Thailand", "China"],
        "preferred_job_types": ["Full-time", "Part-time", "Online"],
        "min_salary_usd": 1500,
        "is_public": True,
    },
]

for t in teachers:
    if not t["id"]:
        err(f"Skipping teacher '{t['full_name']}' — no auth user ID")
        continue
    try:
        resp = supabase.table("teacher_profiles").insert(t).execute()
        log(f"Inserted teacher: {t['full_name']}  ({t['nationality']}, {t['years_experience']} yrs exp)")
    except Exception as e:
        err(f"Error inserting teacher '{t['full_name']}': {e}")

# ── Summary ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("SEED COMPLETE")
print("=" * 60)

# Verify by counting
try:
    schools_count = len(supabase.table("school_profiles").select("*").execute().data)
    jobs_count = len(supabase.table("job_listings").select("*").execute().data)
    teachers_count = len(supabase.table("teacher_profiles").select("*").execute().data)
    print(f"  School profiles in DB:  {schools_count}")
    print(f"  Job listings in DB:     {jobs_count}")
    print(f"  Teacher profiles in DB: {teachers_count}")
except Exception as e:
    print(f"  (Could not verify counts: {e})")

print(f"\n  Data inserted:")
print(f"    - {len(school_ids)} school profiles")
print(f"    - {len(job_ids)} job listings")
print(f"    - {len([t for t in teachers if t['id']])} teacher profiles")
print()
