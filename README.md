# MUSF Summit Register
### Majlis Umariyya Wafy College
**Collegiate Academic, Leadership & Multi-Disciplinary Summit Management System**

MUSF Summit Register is a production-quality, mobile-first web application and installable PWA designed specifically for Majlis Umariyya Wafy College. It provides complete institutional governance for weekly academic summits, monthly evaluations, symposiums, colloquiums, debates, seminars, quizzes, and leadership programs across the two collegiate sections (**Thamheediyya** and **Aliya**).

---

## 🏛️ System Philosophy & Scope

Unlike traditional festival software, MUSF Summit Register is engineered exclusively for **collegiate summit management**:
- **No Arts Fest Elements**: Strictly collegiate terminology, categories, and academic metrics throughout the system.
- **Login-First Gatekeeper**: The application opens directly to a secure, professional institutional login screen (college branding, logo, credentials). No public scoreboard or distracting live animations.
- **Weekly Summits Cadence**:
  - Summits are conducted weekly and grouped by month (e.g., "October 2026 - Summit 1", "October 2026 - Summit 2"). Months feature 4 or 5 weekly summits.
  - **Month Overview Screen**: Shows all summits of a selected month with statuses (`planned`, `open`, `locked`, `completed`, `published`), programs scheduled, and participant counts.
  - **Automated Bulk Creator**: 1-click generation of all weekly recurring dates (e.g. every Friday) for any chosen month.
- **Monthly & Multi-Month Calculations**:
  - **Month Total for Student**: Sum of final marks obtained across all weekly summits in that month.
  - **Month Marks %**: `(marks obtained / (programs assigned in the month x 10)) x 100`.
  - **Month Attendance %**: `(sessions present / (number of summits held in the month x 3)) x 100`.
  - **Class & Team Averages**: Section-wise (Thamheediyya & Aliya) and combined rankings, averages per member, and field-wise point breakdowns.
- **Comprehensive Academic Reports (PDF, Excel, Print)**:
  - **Monthly Report (PDF)**: Cover page with crest, Executive Summary, Summit-wise breakdown table with house totals, Class-wise report (5 classes grouped under Thamheediyya & Aliya), Team-wise report with field totals, and Top 10 rankings.
  - **Selected Months Total Report (PDF)**: Multi-select months, month range, or full academic year with cumulative totals plus month-by-month column breakdown.
  - **Student-Wise Detailed Dossier**: Summit-by-summit breakdown showing program names, fields, marks/10, letter grades (A, B, C), 3-session attendance (START, MID, END), absent/not-performed handling, and overall, class, and house positions.
  - **Individual Student Report Card (PDF)**: Official 1-page report card with student header, summit logs, attendance metrics, and signatures.
- **Participant Limits (Per-Team, Per-Program)**:
  - Allowed participant counts apply to **each team individually**, not to the program as a whole.
  - Admin can configure unique participant limits or team-specific overrides. Group programs specify precise group sizes.
  - Real-time status indicators display allowed vs registered counts per team and total across the college.
  - Hard constraint blocking prevents exceeding team limits, with actionable guidance.
- **Two Leaders Per Team Co-Governance**:
  - Every house team has **two leaders (Leader 1 and Leader 2)** with independent credentials.
  - Admin can appoint, replace, or swap leaders anytime (a replaced leader smoothly reverts to a normal team member).
  - Optional section scope restriction per leader: `all` (entire team), `thamheediyya` (junior classes only), or `aliya` (senior classes only).
  - Absolute team isolation: a team leader can **never** view, search, select, or assign members of another house team.
  - Team leaders can download their **own team's monthly report PDF**.

---

## 🎨 Theme & Typography

- **Primary Deep Navy**: `#0F2A4A` (Institutional authority)
- **Secondary Slate Blue**: `#334E73` (Headers and structure)
- **Accent Muted Teal**: `#0E7C86` (Interactive actions and indicators)
- **Highlight Soft Gold**: `#C9A227` (Merit badges, awards, and distinction only)
- **Off-White Canvas**: `#F6F8FB` with pure white cards and subtle borders
- **Dark Mode**: High-contrast navy-charcoal palette (`#080E18` / `#0F1B2B`)
- **Typography**: Inter / Poppins for Latin characters; Noto Sans Malayalam for Malayalam

---

## 🚀 Demo Accounts & 1-Click Login

The application includes convenient 1-click quick-login buttons on the Login page:

| Role | Username | Password | Institutional Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | **Prof. Abdurrahman Wafy (Summit Director)**: Full governance over sections, fields, weekly summits, participant limits, two leaders, marks, publishing, reports, and settings. |
| **Team Al-Bayan Leader 1** | `leader1` | `leader123` | **Nihal Rahman (Leader 1)**: Manages Al-Bayan nominations within allowed limits, tracks live slots, records 3-session attendance, and downloads Team Monthly Report PDF. |
| **Team Al-Bayan Leader 2** | `leader1b` | `leader123` | **Muhammed Anas (Leader 2)**: Co-governs Team Al-Bayan with independent login, synced nominations, and peer change alerts. |
| **Judge** | `judge1` | `judge123` | **Usthad Abdul Rasheed Al-Baqavi**: Evaluates assigned academic programs out of 10.0; fair-judging mode hides house team names for complete objectivity. |
| **Student** | `cic101` | `student123` | **Nihal Rahman (Class 1, Chest C-101)**: Personal dashboard, nominated programs, published results, 3-session attendance %, and downloads personal Progress Report Card PDF. |

*Additional Accounts:*
- Team Al-Furqan Leaders: `leader2` / `leader123` (Leader 1) & `leader2b` / `leader123` (Leader 2)
- Team Al-Ihsan Leaders: `leader3` / `leader123` (Leader 1) & `leader3b` / `leader123` (Leader 2)
- Team Al-Hikmah Leaders: `leader4` / `leader123` (Leader 1) & `leader4b` / `leader123` (Leader 2)
- Judge 2: `judge2` / `judge123` (Dr. K. Muhammed Ali Wafy)
- Students: `cic102` through `cic120` (all default password `student123`)

---

## 📊 Modules & Key Capabilities

### 1. Weekly Summits & Month Overview
- Weekly cadence with automatic running names ("Summit 1" through "Summit 5" inside each month).
- Month Overview screen showing status, programs count, participant count, and quick registration lock toggles.
- Automated Bulk Creator to generate all weekly dates (e.g. every Friday) of any month in 1 click.

### 2. Comprehensive Academic Report Center
- **Monthly Report (PDF, Excel, Print)**: Cover section, executive metrics, summit schedule & team totals, class evaluations for 5 classes, house team standings with field points, and period Top 10 leaders.
- **Selected Months Total Report**: Multi-month selection, date range, or full academic year audit with month-by-month column breakdown.
- **Student-Wise Detailed Dossiers**: Every student's complete participation record across weekly summits with marks, grades, and attendance checkpoints.
- **1-Page Student Report Card**: Downloadable official dossier with institutional signatures and personal rankings.
- **Report History Log**: Searchable audit log of generated reports with re-download capabilities.

### 3. Specialized Analytical Reports
- **Summit Program List**: Section & field breakdown of all scheduled programs.
- **Participation Report**: Multi-dimensional participation matrix across teams, classes, sections, and fields.
- **Field-Wise Performance Report**: Points and average marks distribution by field.
- **Aliya Team Program Assignment Report**: Full matrix representation of Aliya program assignments.
- **Team Registration Status Report**: Per-summit, per-section, per-team, per-program registration quotas, filled vs allowed counts, unfilled slot alerts, and `nominatedBy` details.

---

## 🛠️ Build & Verification

```bash
# Navigate to directory
cd "c:\Users\user\Desktop\summitt app"

# Run Vite dev server
npm run dev

# Run Production Build
npm run build
```
