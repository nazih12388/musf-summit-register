-- Supabase PostgreSQL Schema with Row-Level Security (RLS)
-- MUSF Summit Register - Majlis Umariyya Wafy College
-- Collegiate Academic, Leadership & Multi-Disciplinary Summit Management System

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('admin', 'leader', 'judge', 'student');
CREATE TYPE section_type AS ENUM ('thamheediyya', 'aliya', 'all');
CREATE TYPE program_type AS ENUM ('individual', 'group');
CREATE TYPE program_status AS ENUM ('draft', 'open', 'locked', 'published');
CREATE TYPE attendance_session AS ENUM ('start', 'mid', 'end');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- 2. Classes Table (Linked to Collegiate Sections)
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  section section_type NOT NULL DEFAULT 'thamheediyya'
);

-- 3. Teams Table (Two Leaders per Team)
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  leader1_id TEXT,
  leader2_id TEXT
);

-- 4. Academic Fields (Communicative, Creative, Research, etc.)
CREATE TABLE fields (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  section section_type NOT NULL DEFAULT 'aliya',
  order_no INT NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);

-- 5. Summits Table
CREATE TABLE summits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  month TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  is_registration_locked BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Students Table (with Leader Roles & Scope Restrictions)
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cic_no TEXT UNIQUE NOT NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE RESTRICT,
  team_id TEXT REFERENCES teams(id) ON DELETE RESTRICT,
  chest_no TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_leader BOOLEAN DEFAULT FALSE,
  leader_role TEXT CHECK (leader_role IN ('leader1', 'leader2', NULL)),
  leader_username TEXT,
  leader_section_restriction section_type DEFAULT 'all',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Master Program Library
CREATE TABLE programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  field_id TEXT REFERENCES fields(id) ON DELETE SET NULL,
  section section_type NOT NULL,
  type program_type NOT NULL DEFAULT 'individual',
  venue TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  max_marks NUMERIC DEFAULT 10,
  default_participants_per_team INT DEFAULT 1,
  allow_leader_mark_entry BOOLEAN DEFAULT FALSE,
  status program_status NOT NULL DEFAULT 'open',
  description TEXT
);

-- 8. Summit Program Allocations (Per-Team Participant Caps)
CREATE TABLE summit_program_allocations (
  id TEXT PRIMARY KEY,
  summit_id TEXT REFERENCES summits(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES programs(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  assigned BOOLEAN DEFAULT TRUE,
  allowed_count INT DEFAULT 1,
  UNIQUE(summit_id, program_id, team_id)
);

-- 9. Program Nominations / Entries (with Nominator Tracking)
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  summit_id TEXT REFERENCES summits(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES programs(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  chest_no TEXT NOT NULL,
  group_name TEXT,
  member_ids TEXT[],
  nominated_by TEXT,
  nominated_by_username TEXT,
  nominated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(summit_id, program_id, student_id)
);

-- 10. Marks Table (Judge Evaluations & Leader Uploads)
CREATE TABLE marks (
  id TEXT PRIMARY KEY,
  summit_id TEXT REFERENCES summits(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES programs(id) ON DELETE CASCADE,
  entry_id TEXT REFERENCES entries(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  entered_by TEXT NOT NULL,
  source_role TEXT NOT NULL CHECK (source_role IN ('judge', 'leader', 'admin')),
  marks NUMERIC NOT NULL CHECK (marks >= 0 AND marks <= 10),
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Three-Session Attendance Table
CREATE TABLE attendance (
  id TEXT PRIMARY KEY,
  summit_id TEXT REFERENCES summits(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  session_type attendance_session NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  marked_by TEXT NOT NULL,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(summit_id, student_id, session_type)
);

-- 12. Institutional Notices
CREATE TABLE notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'published',
  date DATE DEFAULT CURRENT_DATE,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Notifications (Peer & System Alerts)
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Audit Logs (Append-Only)
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE summits ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE summit_program_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get authenticated user's student/leader record
CREATE OR REPLACE FUNCTION current_user_student()
RETURNS students AS $$
  SELECT * FROM students WHERE username = auth.jwt() ->> 'preferred_username' OR id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE;

-- 1. Read access for institutional catalogs
CREATE POLICY "Public authenticated can read classes" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read teams" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read fields" ON fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read summits" ON summits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read programs" ON programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read allocations" ON summit_program_allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read notices" ON notices FOR SELECT TO authenticated USING (status = 'published');

-- 2. Students Policy: Leaders see ONLY their own team members; students see self
CREATE POLICY "Admin full access students" ON students FOR ALL TO authenticated USING (
  (auth.jwt() ->> 'role') = 'admin'
);
CREATE POLICY "Leader views own team members only" ON students FOR SELECT TO authenticated USING (
  (auth.jwt() ->> 'role') = 'leader' AND team_id = (current_user_student()).team_id
);
CREATE POLICY "Student views own record" ON students FOR SELECT TO authenticated USING (
  id = auth.uid()::text OR username = auth.jwt() ->> 'preferred_username'
);

-- 3. Entries (Nominations):
-- Leader can nominate and remove ONLY members of their own team, provided registration is not locked.
CREATE POLICY "Leader can nominate own team members" ON entries FOR INSERT TO authenticated WITH CHECK (
  (auth.jwt() ->> 'role') = 'leader' AND
  team_id = (current_user_student()).team_id AND
  EXISTS (
    SELECT 1 FROM summits s
    WHERE s.id = entries.summit_id AND s.is_registration_locked = FALSE
  )
);

CREATE POLICY "Leader can delete own team nomination before lock" ON entries FOR DELETE TO authenticated USING (
  (auth.jwt() ->> 'role') = 'leader' AND
  team_id = (current_user_student()).team_id AND
  EXISTS (
    SELECT 1 FROM summits s
    WHERE s.id = entries.summit_id AND s.is_registration_locked = FALSE
  )
);

CREATE POLICY "Admin full control on entries" ON entries FOR ALL TO authenticated USING (
  (auth.jwt() ->> 'role') = 'admin'
);

-- 4. Marks Policies:
-- Judges score open programs; Leaders submit marks for own team members; published marks viewable
CREATE POLICY "Judges insert marks on open programs" ON marks FOR INSERT TO authenticated WITH CHECK (
  (auth.jwt() ->> 'role') = 'judge' AND
  EXISTS (
    SELECT 1 FROM programs p
    WHERE p.id = marks.program_id AND p.status != 'locked'
  )
);

CREATE POLICY "Leaders upload marks for own team" ON marks FOR INSERT TO authenticated WITH CHECK (
  (auth.jwt() ->> 'role') = 'leader' AND
  team_id = (current_user_student()).team_id AND
  EXISTS (
    SELECT 1 FROM programs p
    WHERE p.id = marks.program_id AND p.allow_leader_mark_entry = TRUE
  )
);

CREATE POLICY "View published marks or privileged access" ON marks FOR SELECT TO authenticated USING (
  (auth.jwt() ->> 'role') IN ('admin', 'judge') OR
  ((auth.jwt() ->> 'role') = 'leader' AND team_id = (current_user_student()).team_id) OR
  EXISTS (
    SELECT 1 FROM programs p
    WHERE p.id = marks.program_id AND p.status = 'published'
  )
);

-- 5. Attendance Policies:
-- Leaders record for own team members when unlocked; students read own records
CREATE POLICY "Leaders record own team attendance" ON attendance FOR ALL TO authenticated USING (
  (auth.jwt() ->> 'role') = 'leader' AND
  team_id = (current_user_student()).team_id AND
  locked = FALSE
);

CREATE POLICY "Students read own attendance" ON attendance FOR SELECT TO authenticated USING (
  student_id = (current_user_student()).id
);

-- 6. Notifications: User reads own notifications; Leaders can insert peer alerts
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT TO authenticated USING (
  user_id = auth.uid()::text OR (auth.jwt() ->> 'role') = 'admin'
);

CREATE POLICY "Leaders and Admins create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (
  (auth.jwt() ->> 'role') IN ('admin', 'leader')
);

-- 7. Audit Logs: Append-only
CREATE POLICY "Admins read audit logs" ON audit_logs FOR SELECT TO authenticated USING (
  (auth.jwt() ->> 'role') = 'admin'
);
CREATE POLICY "Authenticated users append audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
