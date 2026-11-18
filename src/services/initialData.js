// Seed Data for MUSF Summit Register
// Majlis Umariyya Wafy College
// ACADEMIC, SEMINARS, DEBATES, QUIZZES, SKILLS & SPORTS SUMMITS

export const HASHED_PASSWORDS = {
  admin1234: "156d01335d4143135ca9ea0c4b067d4f522182ac8938b3036b9c28c73a4ffa01", // 1234
  admin: "156d01335d4143135ca9ea0c4b067d4f522182ac8938b3036b9c28c73a4ffa01",     // 1234
  leader: "6a41b847ce7d8171e5f4120128aafdddf58c89e039e3aeeba8a86683b9ac71f0",  // leader123
  judge: "96db2bbc1d6858dfda7da4689eb39a2522c72701367f3f130a53bdc81905999f",   // judge123
  student: "444292e887cd8de61e50f4c894e64bea883735d2a0c16f302db764aa30aa6b4a" // student123
};

// 1. SECTIONS (STAGES)
export const INITIAL_SECTIONS = [
  { id: 'thamheediyya', name: 'Thamheediyya (Preparatory)', order: 1, description: 'Junior Academic Division (Class 1 & 2)' },
  { id: 'aliya', name: 'Aliya (Degree)', order: 2, description: 'Senior Academic Degree Division (Class 3, 4 & 5)' }
];

// 2. CLASSES with SECTION LINK
export const INITIAL_CLASSES = [
  { id: 'c1', name: 'Class 1 (Wafy Preliminary 1)', sectionId: 'thamheediyya' },
  { id: 'c2', name: 'Class 2 (Wafy Preliminary 2)', sectionId: 'thamheediyya' },
  { id: 'c3', name: 'Class 3 (Wafy Degree 1)', sectionId: 'aliya' },
  { id: 'c4', name: 'Class 4 (Wafy Degree 2)', sectionId: 'aliya' },
  { id: 'c5', name: 'Class 5 (Wafy Degree 3)', sectionId: 'aliya' }
];

// 3. TEAMS / HOUSES (Fresh app: Leaders to be appointed from enrolled students)
export const INITIAL_TEAMS = [
  { id: 't1', name: 'Team Al-Bayan', color: '#0E7C86', leaderId: null, leader1Id: null, leader2Id: null },
  { id: 't2', name: 'Team Al-Furqan', color: '#334E73', leaderId: null, leader1Id: null, leader2Id: null },
  { id: 't3', name: 'Team Al-Ihsan', color: '#14919D', leaderId: null, leader1Id: null, leader2Id: null },
  { id: 't4', name: 'Team Al-Hikmah', color: '#0F2A4A', leaderId: null, leader1Id: null, leader2Id: null }
];

// 4. FIELDS (Program Groups)
export const INITIAL_FIELDS = [
  { id: 'f_foundation', name: 'Foundational Academic', sectionId: 'thamheediyya', order: 1, description: 'Script, Quranic recitation, language fundamentals' },
  { id: 'f_communicative', name: 'Communicative', sectionId: 'aliya', order: 2, description: 'Debate, rhetoric, journalism, and public address' },
  { id: 'f_creative', name: 'Creative', sectionId: 'aliya', order: 3, description: 'Research papers, essays, literary creations and colloquia' }
];

// 5. MASTER PROGRAM LIBRARY (Fresh start - empty by default, managed by Admin)
export const INITIAL_PROGRAM_LIBRARY = [];

// Helper to build team allocations
const buildThamheediyyaAllocations = (allowedCount = 1) => ({
  t1: { assigned: true, allowedCount },
  t2: { assigned: true, allowedCount },
  t3: { assigned: true, allowedCount },
  t4: { assigned: true, allowedCount }
});

const buildAllTeamsAllocations = (allowedCount = 1) => ({
  t1: { assigned: true, allowedCount },
  t2: { assigned: true, allowedCount },
  t3: { assigned: true, allowedCount },
  t4: { assigned: true, allowedCount }
});

// 6. WEEKLY SUMMITS (Fresh start - empty by default, scheduled by admin)
export const INITIAL_SUMMITS = [];

export const INITIAL_CATEGORIES = [
  'Foundational Academic',
  'Debate & Rhetoric',
  'Quiz & General Knowledge',
  'Speech & Communication',
  'Skill & Media Workshop',
  'Seminar Presentation',
  'Religious Jurisprudence'
];

export const INITIAL_ADMINS = [
  {
    id: 'admin_1',
    name: 'Hashim MV',
    username: 'hashim',
    passwordHash: HASHED_PASSWORDS.admin1234,
    role: 'admin',
    designation: 'Administrator 1'
  },
  {
    id: 'admin_2',
    name: 'Muhammed Nazih',
    username: 'nazih',
    passwordHash: HASHED_PASSWORDS.admin1234,
    role: 'admin',
    designation: 'Administrator 2'
  },
  {
    id: 'admin_3',
    name: 'Muhammed Hisham',
    username: 'hisham',
    passwordHash: HASHED_PASSWORDS.admin1234,
    role: 'admin',
    designation: 'Administrator 3'
  },
  {
    id: 'admin_general',
    name: 'General Admin',
    username: 'admin',
    passwordHash: HASHED_PASSWORDS.admin1234,
    role: 'admin',
    designation: 'System Administrator'
  }
];

export const INITIAL_JUDGES = [
  {
    id: 'j1',
    name: 'Usthad Abdul Rasheed Al-Baqavi',
    username: 'judge1',
    passwordHash: HASHED_PASSWORDS.judge,
    role: 'judge',
    unrestricted: false,
    allowMarkEditing: true,
    assignedSummits: [],
    assignedPrograms: []
  },
  {
    id: 'j2',
    name: 'Dr. K. Muhammed Ali Wafy',
    username: 'judge2',
    passwordHash: HASHED_PASSWORDS.judge,
    role: 'judge',
    unrestricted: false,
    allowMarkEditing: true,
    assignedSummits: [],
    assignedPrograms: []
  },
  {
    id: 'j3',
    name: 'Prof. Hamza Qasimi',
    username: 'judge3',
    passwordHash: HASHED_PASSWORDS.judge,
    role: 'judge',
    unrestricted: false,
    allowMarkEditing: true,
    assignedSummits: [],
    assignedPrograms: []
  },
  {
    id: 'j4',
    name: 'Dr. Zubair Hudawi',
    username: 'judge4',
    passwordHash: HASHED_PASSWORDS.judge,
    role: 'judge',
    unrestricted: false,
    allowMarkEditing: false,
    assignedSummits: [],
    assignedPrograms: []
  }
];

// 7. STUDENTS (20 Students across 5 Classes and 4 Teams)
// 7. FRESH APP: STUDENTS LIST (Empty by default - to be enrolled by Admin)
export const INITIAL_STUDENTS = [];

// 8. PROGRAMS ALLOCATED ACROSS 8 WEEKLY SUMMITS
export const INITIAL_PROGRAMS = [];

// 9. STUDENT NOMINATIONS & ENTRIES ACROSS 8 SUMMITS
export const INITIAL_ENTRIES = [];

// 10. EVALUATION SCORES ACROSS 8 SUMMITS
export const INITIAL_MARKS = [];

// 11. ATTENDANCE SEED (START, MID, END across all 8 summits x 20 students)
export const INITIAL_ATTENDANCE = [];

// 12. NOTICES
export const INITIAL_NOTICES = [];

export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_AUDIT_LOGS = [];

export const INITIAL_SETTINGS = {
  collegeName: 'Majlis Umariyya Wafy College',
  appTitle: 'MUSF Summit Register',
  fairJudgingMode: false,
  enforceJudgeRestrictions: true,
  allowJudgeMarkEditing: true,
  lateCountsAsPresent: true,
  excusedCountsAsPresent: true,
  lowAttendanceThreshold: 75,
  enableOverallPerformanceScore: false,
  overallMarksWeight: 80,
  overallAttendanceWeight: 20,
  maxProgramsPerStudent: 0,
  gradeRanges: [
    { grade: 'A', min: 9.0, max: 10.0, label: 'Outstanding (A)' },
    { grade: 'B', min: 7.0, max: 8.99, label: 'Very Good (B)' },
    { grade: 'C', min: 5.0, max: 6.99, label: 'Good (C)' },
    { grade: 'No Grade', min: 0.0, max: 4.99, label: 'Below Minimum' }
  ]
};

// 16. CERTIFICATES (Top Performers of the Month and Class-wise Toppers)
export const INITIAL_CERTIFICATES = [];
