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

// 5. MASTER PROGRAM LIBRARY
export const INITIAL_PROGRAM_LIBRARY = [
  // Thamheediyya Library (4 Common Programs)
  {
    id: 'lib_th_1',
    name: 'Arabic Calligraphy & Orthography',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: 'Mastery in Thuluth, Naskh and Diwani scripts with grammatical diacritics.',
    rules: '30 minutes time limit. Bring own pens.',
    active: true
  },
  {
    id: 'lib_th_2',
    name: "Qur'anic Memorization & Tajweed",
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: 'Hafs an Asim recitation with advanced Tajweed rules and vocal melodics.',
    rules: 'Selected Surahs from Juz Amma.',
    active: true
  },
  {
    id: 'lib_th_3',
    name: 'English Elocution & Reading',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: 'Fluency, pronunciation, cadence, and thematic articulation.',
    rules: '5 minutes allocated per speaker.',
    active: true
  },
  {
    id: 'lib_th_4',
    name: 'Islamic History Foundation Quiz',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'group',
    maxMarks: 10,
    defaultAllowedPerTeam: 2,
    description: 'Early Islamic history, prophetic biography, and early civilization.',
    rules: '2 members per team group.',
    active: true
  },

  // Aliya Communicative Library (3 Programs)
  {
    id: 'lib_al_1',
    name: 'Parliamentary Debate Championship',
    fieldId: 'f_communicative',
    sectionId: 'aliya',
    type: 'group',
    maxMarks: 10,
    defaultAllowedPerTeam: 2,
    description: 'Oxford & Parliamentary style debate on contemporary socio-theological topics.',
    rules: '2 members per team group. 6 minutes substantive speech.',
    active: true
  },
  {
    id: 'lib_al_2',
    name: 'Public Discourse & Rhetoric',
    fieldId: 'f_communicative',
    sectionId: 'aliya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: 'Extempore discourse in Arabic and English on assigned academic questions.',
    rules: '5 minutes prep, 4 minutes delivery.',
    active: true
  },
  {
    id: 'lib_al_3',
    name: 'Media Critique & Analytical Journalism',
    fieldId: 'f_communicative',
    sectionId: 'aliya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: 'Analytical deconstruction of international editorial columns.',
    rules: 'Delegated leader mark entry with admin review.',
    active: true
  },

  // Aliya Creative Library (3 Programs)
  {
    id: 'lib_al_4',
    name: 'Research Paper Presentation',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: 'Peer-reviewed scholarly paper defense with slide deck presentation.',
    rules: '8 minutes defense + 2 minutes Q&A.',
    active: true
  },
  {
    id: 'lib_al_5',
    name: 'Academic Essay Colloquium',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: 'In-depth philosophical essay on epistemic foundations and modern epistemology.',
    rules: 'Structured essay with verified citations.',
    active: true
  },
  {
    id: 'lib_al_6',
    name: 'Creative Literary Composition',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    description: 'Classical Arabic & English poetry or narrative composition.',
    rules: 'Original unassisted composition on assigned thematic motif.',
    active: true
  }
];

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
    assignedPrograms: ['p_oct1_1', 'p_oct1_2', 'p_oct1_3', 'p_oct1_4', 'p_oct2_1', 'p_oct3_1', 'p_oct4_1', 'p_nov1_1', 'p_nov2_1', 'p_nov3_1']
  },
  {
    id: 'j2',
    name: 'Dr. K. Muhammed Ali Wafy',
    username: 'judge2',
    passwordHash: HASHED_PASSWORDS.judge,
    role: 'judge',
    assignedPrograms: ['p_oct1_1', 'p_oct1_3', 'p_oct1_4', 'p_oct2_3', 'p_oct3_2', 'p_oct4_3', 'p_nov1_2', 'p_nov2_3', 'p_nov3_2']
  },
  {
    id: 'j3',
    name: 'Prof. Hamza Qasimi',
    username: 'judge3',
    passwordHash: HASHED_PASSWORDS.judge,
    role: 'judge',
    assignedPrograms: ['p_oct1_2', 'p_oct2_2', 'p_oct3_1', 'p_nov1_1', 'p_nov2_2', 'p_nov3_1']
  },
  {
    id: 'j4',
    name: 'Dr. Zubair Hudawi',
    username: 'judge4',
    passwordHash: HASHED_PASSWORDS.judge,
    role: 'judge',
    assignedPrograms: ['p_oct2_1', 'p_oct3_2', 'p_oct4_2', 'p_nov2_1', 'p_nov3_2']
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
export const INITIAL_NOTICES = [
  {
    id: 'n1',
    title: 'Announcement: Weekly Academic Summit Calendar (October & November 2026)',
    message: 'The College Directorate announces weekly academic summits every Friday across October and November 2026 for Thamheediyya (Preparatory) and Aliya (Degree) sections.',
    audience: 'all',
    author: 'Prof. Abdurrahman Wafy',
    date: '2026-10-01',
    publishTime: '2026-10-01T09:00:00Z',
    status: 'published',
    pinned: true,
    readBy: ['s1', 's2', 's3', 's6', 's11', 's16']
  },
  {
    id: 'n2',
    title: 'Aliya House Team Program Assignment Matrix Released',
    message: 'The summit assignment matrix for Aliya Communicative and Creative programs has been finalized. Team leaders may nominate members up to the allocated slot limits.',
    audience: 'leaders',
    author: 'Academic Evaluation Cell',
    date: '2026-10-15',
    publishTime: '2026-10-15T08:30:00Z',
    status: 'published',
    pinned: false,
    readBy: ['s1', 's6', 's11', 's16']
  }
];

// 13. NOTIFICATIONS
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 's1',
    title: 'Result Declared: October Summit 1 Calligraphy',
    message: 'Results for Arabic Calligraphy & Orthography have been published. You secured 1st position with 9.6/10 (Grade A).',
    type: 'result',
    read: false,
    timestamp: '2026-10-02T12:00:00Z'
  },
  {
    id: 'notif-2',
    userId: 's1',
    title: 'Nomination Window Open for November Summit 4',
    message: 'Registration window is open for November Summit 4 programs. Please ensure team member slots are filled.',
    type: 'assignment',
    read: true,
    timestamp: '2026-11-20T09:00:00Z'
  }
];

// 14. AUDIT LOGS
export const INITIAL_AUDIT_LOGS = [
  {
    id: 'al-1',
    actor: 'admin (Prof. Abdurrahman)',
    action: 'CONFIGURE_SECTIONS',
    details: 'Configured Section divisions: Thamheediyya (Class 1-2) and Aliya (Class 3-5)',
    timestamp: '2026-09-01T08:00:00Z'
  },
  {
    id: 'al-2',
    actor: 'admin (Prof. Abdurrahman)',
    action: 'BULK_CREATE_SUMMITS',
    details: 'Bulk-created 4 weekly summits for October 2026 and 4 weekly summits for November 2026',
    timestamp: '2026-09-25T10:00:00Z'
  },
  {
    id: 'al-3',
    actor: 'admin (Prof. Abdurrahman)',
    action: 'PUBLISH_RESULTS',
    details: 'Published results for November Summit 3 Research Colloquium & Seminar',
    timestamp: '2026-11-20T18:00:00Z'
  }
];

// 15. SETTINGS
export const INITIAL_SETTINGS = {
  collegeName: 'Majlis Umariyya Wafy College',
  appTitle: 'MUSF Summit Register',
  fairJudgingMode: false,
  enforceJudgeRestrictions: true,
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
