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

// 6. WEEKLY SUMMITS (12-Month Academic Year - 4 Weekly Summits per Month)
export const INITIAL_SUMMITS = [
  // --- JUNE 2026 (4 Weekly Summits) ---
  { id: 'summit_jun_1', name: 'June 2026 - Summit 1: Academic Orientation & Induction', month: '2026-06', date: '2026-06-05', registrationDeadline: '2026-06-02T18:00', venue: 'Wafy Central Auditorium', registrationLocked: true, status: 'completed' },
  { id: 'summit_jun_2', name: 'June 2026 - Summit 2: Foundational Literary Review', month: '2026-06', date: '2026-06-12', registrationDeadline: '2026-06-09T18:00', venue: 'Conference Hall A', registrationLocked: true, status: 'completed' },
  { id: 'summit_jun_3', name: 'June 2026 - Summit 3: Scholastic Discourse Workshop', month: '2026-06', date: '2026-06-19', registrationDeadline: '2026-06-16T18:00', venue: 'Preliminary Seminar Room', registrationLocked: true, status: 'completed' },
  { id: 'summit_jun_4', name: 'June 2026 - Summit 4: Monthly Scholastic Synthesis', month: '2026-06', date: '2026-06-26', registrationDeadline: '2026-06-23T18:00', venue: 'Main Auditorium', registrationLocked: true, status: 'completed' },

  // --- JULY 2026 (4 Weekly Summits) ---
  { id: 'summit_jul_1', name: 'July 2026 - Summit 1: Arabic Rhetoric & Translation', month: '2026-07', date: '2026-07-03', registrationDeadline: '2026-06-30T18:00', venue: 'Academic Seminar Complex', registrationLocked: true, status: 'completed' },
  { id: 'summit_jul_2', name: 'July 2026 - Summit 2: Jurisprudence & Logic Session', month: '2026-07', date: '2026-07-10', registrationDeadline: '2026-07-07T18:00', venue: 'Conference Hall B', registrationLocked: true, status: 'completed' },
  { id: 'summit_jul_3', name: 'July 2026 - Summit 3: Qur’anic Hermeneutics Colloquium', month: '2026-07', date: '2026-07-17', registrationDeadline: '2026-07-14T18:00', venue: 'Chamber Hall A', registrationLocked: true, status: 'completed' },
  { id: 'summit_jul_4', name: 'July 2026 - Summit 4: Academic Writing & Debate', month: '2026-07', date: '2026-07-24', registrationDeadline: '2026-07-21T18:00', venue: 'Central Auditorium', registrationLocked: true, status: 'completed' },

  // --- AUGUST 2026 (4 Weekly Summits) ---
  { id: 'summit_aug_1', name: 'August 2026 - Summit 1: Hadith Sciences & Analysis', month: '2026-08', date: '2026-08-07', registrationDeadline: '2026-08-04T18:00', venue: 'Wafy Central Auditorium', registrationLocked: true, status: 'completed' },
  { id: 'summit_aug_2', name: 'August 2026 - Summit 2: Comparative Literature Forum', month: '2026-08', date: '2026-08-14', registrationDeadline: '2026-08-11T18:00', venue: 'Conference Hall A', registrationLocked: true, status: 'completed' },
  { id: 'summit_aug_3', name: 'August 2026 - Summit 3: Public Eloquence Workshop', month: '2026-08', date: '2026-08-21', registrationDeadline: '2026-08-18T18:00', venue: 'Preliminary Seminar Room', registrationLocked: true, status: 'completed' },
  { id: 'summit_aug_4', name: 'August 2026 - Summit 4: Historical Perspectives Round', month: '2026-08', date: '2026-08-28', registrationDeadline: '2026-08-25T18:00', venue: 'Main Auditorium', registrationLocked: true, status: 'completed' },

  // --- SEPTEMBER 2026 (4 Weekly Summits) ---
  { id: 'summit_sep_1', name: 'September 2026 - Summit 1: Classical Grammatical Dialectics', month: '2026-09', date: '2026-09-04', registrationDeadline: '2026-09-01T18:00', venue: 'Academic Seminar Complex', registrationLocked: true, status: 'completed' },
  { id: 'summit_sep_2', name: 'September 2026 - Summit 2: Critical Thinking & Philosophy', month: '2026-09', date: '2026-09-11', registrationDeadline: '2026-09-08T18:00', venue: 'Conference Hall B', registrationLocked: true, status: 'completed' },
  { id: 'summit_sep_3', name: 'September 2026 - Summit 3: English Prose & Declamation', month: '2026-09', date: '2026-09-18', registrationDeadline: '2026-09-15T18:00', venue: 'Chamber Hall A', registrationLocked: true, status: 'completed' },
  { id: 'summit_sep_4', name: 'September 2026 - Summit 4: Mid-Year Scholastic Assembly', month: '2026-09', date: '2026-09-25', registrationDeadline: '2026-09-22T18:00', venue: 'Central Auditorium', registrationLocked: true, status: 'completed' },

  // --- OCTOBER 2026 (4 Weekly Summits) ---
  {
    id: 'summit_oct_1',
    name: 'October 2026 - Summit 1: Arabic Calligraphy & Recitation',
    month: '2026-10',
    date: '2026-10-02',
    registrationDeadline: '2026-09-29T18:00',
    venue: 'Wafy Central Auditorium',
    registrationLocked: true,
    status: 'completed'
  },
  {
    id: 'summit_oct_2',
    name: 'October 2026 - Summit 2: Discourse & Analytical Skills',
    month: '2026-10',
    date: '2026-10-09',
    registrationDeadline: '2026-10-06T18:00',
    venue: 'Conference Hall & Grounds',
    registrationLocked: true,
    status: 'completed'
  },
  {
    id: 'summit_oct_3',
    name: 'October 2026 - Summit 3: Quranic Tajweed & Essay Colloquium',
    month: '2026-10',
    date: '2026-10-16',
    registrationDeadline: '2026-10-13T18:00',
    venue: 'Preliminary Seminar Room',
    registrationLocked: true,
    status: 'completed'
  },
  {
    id: 'summit_oct_4',
    name: 'October 2026 - Summit 4: Islamic History Quiz & Creative Writing',
    month: '2026-10',
    date: '2026-10-23',
    registrationDeadline: '2026-10-20T18:00',
    venue: 'Main Auditorium',
    registrationLocked: true,
    status: 'completed'
  },

  // --- NOVEMBER 2026 (4 Weekly Summits) ---
  {
    id: 'summit_nov_1',
    name: 'November 2026 - Summit 1: Arabic Calligraphy & Debate Round 1',
    month: '2026-11',
    date: '2026-11-06',
    registrationDeadline: '2026-11-03T18:00',
    venue: 'Academic Seminar Complex',
    registrationLocked: true,
    status: 'completed'
  },
  {
    id: 'summit_nov_2',
    name: 'November 2026 - Summit 2: English Elocution & Media Workshop',
    month: '2026-11',
    date: '2026-11-13',
    registrationDeadline: '2026-11-10T18:00',
    venue: 'Conference Hall B',
    registrationLocked: true,
    status: 'completed'
  },
  {
    id: 'summit_nov_3',
    name: 'November 2026 - Summit 3: Research Colloquium & Seminar',
    month: '2026-11',
    date: '2026-11-20',
    registrationDeadline: '2026-11-18T18:00',
    venue: 'Chamber Hall A',
    registrationLocked: true,
    status: 'published'
  },
  {
    id: 'summit_nov_4',
    name: 'November 2026 - Summit 4: Grand Academic Colloquium & Finals',
    month: '2026-11',
    date: '2026-11-24',
    registrationDeadline: '2026-11-22T18:00',
    venue: 'Central Auditorium',
    registrationLocked: false,
    status: 'open'
  },

  // --- DECEMBER 2026 (4 Weekly Summits) ---
  { id: 'summit_dec_1', name: 'December 2026 - Summit 1: Contemporary Thought Colloquium', month: '2026-12', date: '2026-12-04', registrationDeadline: '2026-12-01T18:00', venue: 'Wafy Central Auditorium', registrationLocked: false, status: 'planned' },
  { id: 'summit_dec_2', name: 'December 2026 - Summit 2: Analytical Manuscript Studies', month: '2026-12', date: '2026-12-11', registrationDeadline: '2026-12-08T18:00', venue: 'Conference Hall A', registrationLocked: false, status: 'planned' },
  { id: 'summit_dec_3', name: 'December 2026 - Summit 3: International Affairs & Media', month: '2026-12', date: '2026-12-18', registrationDeadline: '2026-12-15T18:00', venue: 'Preliminary Seminar Room', registrationLocked: false, status: 'planned' },
  { id: 'summit_dec_4', name: 'December 2026 - Summit 4: Winter Scholastic Forum', month: '2026-12', date: '2026-12-25', registrationDeadline: '2026-12-22T18:00', venue: 'Main Auditorium', registrationLocked: false, status: 'planned' },

  // --- JANUARY 2027 (4 Weekly Summits) ---
  { id: 'summit_jan_1', name: 'January 2027 - Summit 1: Usul al-Fiqh Advanced Colloquium', month: '2027-01', date: '2027-01-01', registrationDeadline: '2026-12-29T18:00', venue: 'Academic Seminar Complex', registrationLocked: false, status: 'planned' },
  { id: 'summit_jan_2', name: 'January 2027 - Summit 2: Scientific Inquiries in Islamic Thought', month: '2027-01', date: '2027-01-08', registrationDeadline: '2027-01-05T18:00', venue: 'Conference Hall B', registrationLocked: false, status: 'planned' },
  { id: 'summit_jan_3', name: 'January 2027 - Summit 3: Rhetorical Dialectics & Oratory', month: '2027-01', date: '2027-01-15', registrationDeadline: '2027-01-12T18:00', venue: 'Chamber Hall A', registrationLocked: false, status: 'planned' },
  { id: 'summit_jan_4', name: 'January 2027 - Summit 4: Inter-Disciplinary Research Session', month: '2027-01', date: '2027-01-22', registrationDeadline: '2027-01-19T18:00', venue: 'Central Auditorium', registrationLocked: false, status: 'planned' },

  // --- FEBRUARY 2027 (4 Weekly Summits) ---
  { id: 'summit_feb_1', name: 'February 2027 - Summit 1: Islamic Economics & Contemporary Finance', month: '2027-02', date: '2027-02-05', registrationDeadline: '2027-02-02T18:00', venue: 'Wafy Central Auditorium', registrationLocked: false, status: 'planned' },
  { id: 'summit_feb_2', name: 'February 2027 - Summit 2: Arabic Lexicography & Linguistics', month: '2027-02', date: '2027-02-12', registrationDeadline: '2027-02-09T18:00', venue: 'Conference Hall A', registrationLocked: false, status: 'planned' },
  { id: 'summit_feb_3', name: 'February 2027 - Summit 3: Educational Methodology & Pedagogy', month: '2027-02', date: '2027-02-19', registrationDeadline: '2027-02-16T18:00', venue: 'Preliminary Seminar Room', registrationLocked: false, status: 'planned' },
  { id: 'summit_feb_4', name: 'February 2027 - Summit 4: Scholastic Symposia & Evaluation', month: '2027-02', date: '2027-02-26', registrationDeadline: '2027-02-23T18:00', venue: 'Main Auditorium', registrationLocked: false, status: 'planned' },

  // --- MARCH 2027 (4 Weekly Summits) ---
  { id: 'summit_mar_1', name: 'March 2027 - Summit 1: Quranic Sciences & Exegesis Symposium', month: '2027-03', date: '2027-03-05', registrationDeadline: '2027-03-02T18:00', venue: 'Academic Seminar Complex', registrationLocked: false, status: 'planned' },
  { id: 'summit_mar_2', name: 'March 2027 - Summit 2: Ethical Inquiry & Moral Philosophy', month: '2027-03', date: '2027-03-12', registrationDeadline: '2027-03-09T18:00', venue: 'Conference Hall B', registrationLocked: false, status: 'planned' },
  { id: 'summit_mar_3', name: 'March 2027 - Summit 3: Digital Humanities & Islamic Heritage', month: '2027-03', date: '2027-03-19', registrationDeadline: '2027-03-16T18:00', venue: 'Chamber Hall A', registrationLocked: false, status: 'planned' },
  { id: 'summit_mar_4', name: 'March 2027 - Summit 4: Spring Academic Colloquium', month: '2027-03', date: '2027-03-26', registrationDeadline: '2027-03-23T18:00', venue: 'Central Auditorium', registrationLocked: false, status: 'planned' },

  // --- APRIL 2027 (4 Weekly Summits) ---
  { id: 'summit_apr_1', name: 'April 2027 - Summit 1: Advanced Research Thesis Defense', month: '2027-04', date: '2027-04-02', registrationDeadline: '2027-03-30T18:00', venue: 'Wafy Central Auditorium', registrationLocked: false, status: 'planned' },
  { id: 'summit_apr_2', name: 'April 2027 - Summit 2: Academic Parliamentary Assembly', month: '2027-04', date: '2027-04-09', registrationDeadline: '2027-04-06T18:00', venue: 'Conference Hall A', registrationLocked: false, status: 'planned' },
  { id: 'summit_apr_3', name: 'April 2027 - Summit 3: Scholastic Documentation & Archival', month: '2027-04', date: '2027-04-16', registrationDeadline: '2027-04-13T18:00', venue: 'Preliminary Seminar Room', registrationLocked: false, status: 'planned' },
  { id: 'summit_apr_4', name: 'April 2027 - Summit 4: Annual Scholastic Colloquium', month: '2027-04', date: '2027-04-23', registrationDeadline: '2027-04-20T18:00', venue: 'Main Auditorium', registrationLocked: false, status: 'planned' },

  // --- MAY 2027 (4 Weekly Summits) ---
  { id: 'summit_may_1', name: 'May 2027 - Summit 1: Graduation Thesis Presentations', month: '2027-05', date: '2027-05-07', registrationDeadline: '2027-05-04T18:00', venue: 'Academic Seminar Complex', registrationLocked: false, status: 'planned' },
  { id: 'summit_may_2', name: 'May 2027 - Summit 2: Grand Oratory & Colloquium Finals', month: '2027-05', date: '2027-05-14', registrationDeadline: '2027-05-11T18:00', venue: 'Conference Hall B', registrationLocked: false, status: 'planned' },
  { id: 'summit_may_3', name: 'May 2027 - Summit 3: Academic Review & Special Honors', month: '2027-05', date: '2027-05-21', registrationDeadline: '2027-05-18T18:00', venue: 'Chamber Hall A', registrationLocked: false, status: 'planned' },
  { id: 'summit_may_4', name: 'May 2027 - Summit 4: Valedictory Grand Academic Summit', month: '2027-05', date: '2027-05-28', registrationDeadline: '2027-05-25T18:00', venue: 'Central Auditorium', registrationLocked: false, status: 'planned' }
];

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
export const INITIAL_PROGRAMS = [
  // --- OCTOBER SUMMIT 1 (2026-10-02) ---
  {
    id: 'p_oct1_1',
    summitId: 'summit_oct_1',
    libraryProgramId: 'lib_th_1',
    name: 'Arabic Calligraphy & Orthography',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Preliminary Seminar Room',
    date: '2026-10-02',
    time: '09:00 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildThamheediyyaAllocations(1),
    assignedJudges: ['j1', 'j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_oct1_2',
    summitId: 'summit_oct_1',
    libraryProgramId: 'lib_th_2',
    name: "Qur'anic Memorization & Tajweed",
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Mosque Annex Hall',
    date: '2026-10-02',
    time: '11:00 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildThamheediyyaAllocations(1),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_oct1_3',
    summitId: 'summit_oct_1',
    libraryProgramId: 'lib_al_1',
    name: 'Parliamentary Debate Championship',
    fieldId: 'f_communicative',
    sectionId: 'aliya',
    type: 'group',
    stage: 'Chamber Hall A',
    date: '2026-10-02',
    time: '02:00 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 2,
    teamAllocations: {
      t1: { assigned: true, allowedCount: 2 },
      t2: { assigned: true, allowedCount: 2 },
      t3: { assigned: false, allowedCount: 0 },
      t4: { assigned: true, allowedCount: 2 }
    },
    assignedJudges: ['j1', 'j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_oct1_4',
    summitId: 'summit_oct_1',
    libraryProgramId: 'lib_al_4',
    name: 'Research Paper Presentation',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'Main Seminar Hall',
    date: '2026-10-02',
    time: '04:00 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildAllTeamsAllocations(1),
    assignedJudges: ['j1', 'j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },

  // --- OCTOBER SUMMIT 2 (2026-10-09) ---
  {
    id: 'p_oct2_1',
    summitId: 'summit_oct_2',
    libraryProgramId: 'lib_th_3',
    name: 'English Elocution & Reading',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Conference Hall B',
    date: '2026-10-09',
    time: '10:00 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildThamheediyyaAllocations(1),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_oct2_2',
    summitId: 'summit_oct_2',
    libraryProgramId: 'lib_al_3',
    name: 'Media Critique & Analytical Journalism',
    fieldId: 'f_communicative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'IT Research Lab',
    date: '2026-10-09',
    time: '02:30 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildAllTeamsAllocations(1),
    assignedJudges: [],
    allowLeaderMarkEntry: true,
    status: 'published'
  },
  {
    id: 'p_oct2_3',
    summitId: 'summit_oct_2',
    libraryProgramId: 'lib_al_5',
    name: 'Academic Essay Colloquium',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'Library Reading Hall',
    date: '2026-10-09',
    time: '04:30 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: {
      t1: { assigned: true, allowedCount: 1 },
      t2: { assigned: false, allowedCount: 0 },
      t3: { assigned: true, allowedCount: 1 },
      t4: { assigned: true, allowedCount: 1 }
    },
    assignedJudges: ['j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },

  // --- OCTOBER SUMMIT 3 (2026-10-16) ---
  {
    id: 'p_oct3_1',
    summitId: 'summit_oct_3',
    libraryProgramId: 'lib_th_2',
    name: "Qur'anic Memorization & Tajweed",
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Mosque Annex',
    date: '2026-10-16',
    time: '09:30 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildThamheediyyaAllocations(1),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_oct3_2',
    summitId: 'summit_oct_3',
    libraryProgramId: 'lib_al_2',
    name: 'Public Discourse & Rhetoric',
    fieldId: 'f_communicative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'Research Annex',
    date: '2026-10-16',
    time: '02:00 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildAllTeamsAllocations(1),
    assignedJudges: ['j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },

  // --- OCTOBER SUMMIT 4 (2026-10-23) ---
  // Note: Nihal Rahman (s1) enters BOTH p_oct4_1 (Quiz) AND p_oct4_2 (Elocution)
  {
    id: 'p_oct4_1',
    summitId: 'summit_oct_4',
    libraryProgramId: 'lib_th_4',
    name: 'Islamic History Foundation Quiz',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'group',
    stage: 'Auditorium Main',
    date: '2026-10-23',
    time: '10:00 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 2,
    teamAllocations: buildThamheediyyaAllocations(2),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_oct4_2',
    summitId: 'summit_oct_4',
    libraryProgramId: 'lib_th_3',
    name: 'English Elocution & Reading',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Seminar Room 2',
    date: '2026-10-23',
    time: '11:30 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildThamheediyyaAllocations(1),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_oct4_3',
    summitId: 'summit_oct_4',
    libraryProgramId: 'lib_al_6',
    name: 'Creative Literary Composition',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'Writing Hall',
    date: '2026-10-23',
    time: '03:00 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildAllTeamsAllocations(1),
    assignedJudges: ['j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },

  // --- NOVEMBER SUMMIT 1 (2026-11-06) ---
  {
    id: 'p_nov1_1',
    summitId: 'summit_nov_1',
    libraryProgramId: 'lib_th_1',
    name: 'Arabic Calligraphy & Orthography',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Calligraphy Hall',
    date: '2026-11-06',
    time: '09:00 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildThamheediyyaAllocations(1),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_nov1_2',
    summitId: 'summit_nov_1',
    libraryProgramId: 'lib_al_1',
    name: 'Parliamentary Debate Championship',
    fieldId: 'f_communicative',
    sectionId: 'aliya',
    type: 'group',
    stage: 'Chamber Hall B',
    date: '2026-11-06',
    time: '02:00 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 2,
    teamAllocations: buildAllTeamsAllocations(2),
    assignedJudges: ['j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },

  // --- NOVEMBER SUMMIT 2 (2026-11-13) ---
  // Note: Mazin Noor (s14) entered in p_nov2_3 was absent!
  {
    id: 'p_nov2_1',
    summitId: 'summit_nov_2',
    libraryProgramId: 'lib_th_3',
    name: 'English Elocution & Reading',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Auditorium Stage',
    date: '2026-11-13',
    time: '10:00 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildThamheediyyaAllocations(1),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_nov2_2',
    summitId: 'summit_nov_2',
    libraryProgramId: 'lib_al_3',
    name: 'Media Critique & Analytical Journalism',
    fieldId: 'f_communicative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'IT Lab',
    date: '2026-11-13',
    time: '02:00 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildAllTeamsAllocations(1),
    assignedJudges: [],
    allowLeaderMarkEntry: true,
    status: 'published'
  },
  {
    id: 'p_nov2_3',
    summitId: 'summit_nov_2',
    libraryProgramId: 'lib_al_5',
    name: 'Academic Essay Colloquium',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'Colloquium Room',
    date: '2026-11-13',
    time: '04:00 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildAllTeamsAllocations(1),
    assignedJudges: ['j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },

  // --- NOVEMBER SUMMIT 3 (2026-11-20) ---
  {
    id: 'p_nov3_1',
    summitId: 'summit_nov_3',
    libraryProgramId: 'lib_th_4',
    name: 'Islamic History Foundation Quiz',
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'group',
    stage: 'Central Auditorium',
    date: '2026-11-20',
    time: '10:00 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 2,
    teamAllocations: buildThamheediyyaAllocations(2),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },
  {
    id: 'p_nov3_2',
    summitId: 'summit_nov_3',
    libraryProgramId: 'lib_al_4',
    name: 'Research Paper Presentation',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'Research Hall',
    date: '2026-11-20',
    time: '02:30 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildAllTeamsAllocations(1),
    assignedJudges: ['j2'],
    allowLeaderMarkEntry: false,
    status: 'published'
  },

  // --- NOVEMBER SUMMIT 4 (2026-11-27) ---
  {
    id: 'p_nov4_1',
    summitId: 'summit_nov_4',
    libraryProgramId: 'lib_th_2',
    name: "Qur'anic Memorization & Tajweed",
    fieldId: 'f_foundation',
    sectionId: 'thamheediyya',
    type: 'individual',
    stage: 'Mosque Annex',
    date: '2026-11-27',
    time: '10:00 AM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildThamheediyyaAllocations(1),
    assignedJudges: ['j1'],
    allowLeaderMarkEntry: false,
    status: 'open'
  },
  {
    id: 'p_nov4_2',
    summitId: 'summit_nov_4',
    libraryProgramId: 'lib_al_6',
    name: 'Creative Literary Composition',
    fieldId: 'f_creative',
    sectionId: 'aliya',
    type: 'individual',
    stage: 'Writing Annex',
    date: '2026-11-27',
    time: '02:30 PM',
    maxMarks: 10,
    defaultAllowedPerTeam: 1,
    teamAllocations: buildAllTeamsAllocations(1),
    assignedJudges: ['j2'],
    allowLeaderMarkEntry: false,
    status: 'open'
  }
];

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
