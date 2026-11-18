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

// 3. TEAMS / HOUSES (Each team has exactly Two Leaders: Leader 1 and Leader 2)
export const INITIAL_TEAMS = [
  { id: 't1', name: 'Team Al-Bayan', color: '#0E7C86', leaderId: 's1', leader1Id: 's1', leader2Id: 's3' },
  { id: 't2', name: 'Team Al-Furqan', color: '#334E73', leaderId: 's6', leader1Id: 's6', leader2Id: 's8' },
  { id: 't3', name: 'Team Al-Ihsan', color: '#14919D', leaderId: 's11', leader1Id: 's11', leader2Id: 's13' },
  { id: 't4', name: 'Team Al-Hikmah', color: '#0F2A4A', leaderId: 's16', leader1Id: 's16', leader2Id: 's18' }
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
export const INITIAL_STUDENTS = [
  // Team Al-Bayan (t1)
  { id: 's1', name: 'Nihal Rahman', cicNo: 'WAFY-2024-101', classId: 'c1', teamId: 't1', sectionId: 'thamheediyya', fieldId: 'f_foundation', username: 'cic101', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-101', isLeader: true, leaderRole: 'leader1', leaderUsername: 'leader1', leaderPasswordHash: HASHED_PASSWORDS.leader, leaderSectionRestriction: 'all' },
  { id: 's2', name: 'Zayan K. Ahmed', cicNo: 'WAFY-2024-102', classId: 'c2', teamId: 't1', sectionId: 'thamheediyya', fieldId: 'f_foundation', username: 'cic102', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-102', isLeader: false },
  { id: 's3', name: 'Ammar Farooq', cicNo: 'WAFY-2024-103', classId: 'c3', teamId: 't1', sectionId: 'aliya', fieldId: 'f_communicative', username: 'cic103', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-103', isLeader: true, leaderRole: 'leader2', leaderUsername: 'leader1b', leaderPasswordHash: HASHED_PASSWORDS.leader, leaderSectionRestriction: 'all' },
  { id: 's4', name: 'Rashid Hashmi', cicNo: 'WAFY-2024-104', classId: 'c4', teamId: 't1', sectionId: 'aliya', fieldId: 'f_creative', username: 'cic104', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-104', isLeader: false },
  { id: 's5', name: 'Rayyan Shafi', cicNo: 'WAFY-2024-105', classId: 'c5', teamId: 't1', sectionId: 'aliya', fieldId: 'f_communicative', username: 'cic105', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-105', isLeader: false },

  // Team Al-Furqan (t2)
  { id: 's6', name: 'Bilal Hashim', cicNo: 'WAFY-2024-106', classId: 'c1', teamId: 't2', sectionId: 'thamheediyya', fieldId: 'f_foundation', username: 'cic106', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-106', isLeader: true, leaderRole: 'leader1', leaderUsername: 'leader2', leaderPasswordHash: HASHED_PASSWORDS.leader, leaderSectionRestriction: 'all' },
  { id: 's7', name: 'Owais Qadir', cicNo: 'WAFY-2024-107', classId: 'c2', teamId: 't2', sectionId: 'thamheediyya', fieldId: 'f_foundation', username: 'cic107', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-107', isLeader: false },
  { id: 's8', name: 'Suhail Musthafa', cicNo: 'WAFY-2024-108', classId: 'c3', teamId: 't2', sectionId: 'aliya', fieldId: 'f_creative', username: 'cic108', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-108', isLeader: true, leaderRole: 'leader2', leaderUsername: 'leader2b', leaderPasswordHash: HASHED_PASSWORDS.leader, leaderSectionRestriction: 'all' },
  { id: 's9', name: 'Adil Munawar', cicNo: 'WAFY-2024-109', classId: 'c4', teamId: 't2', sectionId: 'aliya', fieldId: 'f_communicative', username: 'cic109', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-109', isLeader: false },
  { id: 's10', name: 'Fahad Basheer', cicNo: 'WAFY-2024-110', classId: 'c5', teamId: 't2', sectionId: 'aliya', fieldId: 'f_creative', username: 'cic110', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-110', isLeader: false },

  // Team Al-Ihsan (t3)
  { id: 's11', name: 'Salman Faris', cicNo: 'WAFY-2024-111', classId: 'c1', teamId: 't3', sectionId: 'thamheediyya', fieldId: 'f_foundation', username: 'cic111', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-111', isLeader: true, leaderRole: 'leader1', leaderUsername: 'leader3', leaderPasswordHash: HASHED_PASSWORDS.leader, leaderSectionRestriction: 'all' },
  { id: 's12', name: 'Junaid Al-Hadi', cicNo: 'WAFY-2024-112', classId: 'c2', teamId: 't3', sectionId: 'thamheediyya', fieldId: 'f_foundation', username: 'cic112', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-112', isLeader: false },
  { id: 's13', name: 'Hisham Tariq', cicNo: 'WAFY-2024-113', classId: 'c3', teamId: 't3', sectionId: 'aliya', fieldId: 'f_communicative', username: 'cic113', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-113', isLeader: true, leaderRole: 'leader2', leaderUsername: 'leader3b', leaderPasswordHash: HASHED_PASSWORDS.leader, leaderSectionRestriction: 'all' },
  { id: 's14', name: 'Mazin Noor', cicNo: 'WAFY-2024-114', classId: 'c4', teamId: 't3', sectionId: 'aliya', fieldId: 'f_creative', username: 'cic114', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-114', isLeader: false },
  { id: 's15', name: 'Tahir Zubair', cicNo: 'WAFY-2024-115', classId: 'c5', teamId: 't3', sectionId: 'aliya', fieldId: 'f_communicative', username: 'cic115', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-115', isLeader: false },

  // Team Al-Hikmah (t4)
  { id: 's16', name: 'Uvais Zain', cicNo: 'WAFY-2024-116', classId: 'c1', teamId: 't4', sectionId: 'thamheediyya', fieldId: 'f_foundation', username: 'cic116', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-116', isLeader: true, leaderRole: 'leader1', leaderUsername: 'leader4', leaderPasswordHash: HASHED_PASSWORDS.leader, leaderSectionRestriction: 'all' },
  { id: 's17', name: 'Hamza Niyas', cicNo: 'WAFY-2024-117', classId: 'c2', teamId: 't4', sectionId: 'thamheediyya', fieldId: 'f_foundation', username: 'cic117', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-117', isLeader: false },
  { id: 's18', name: 'Danish Ameen', cicNo: 'WAFY-2024-118', classId: 'c3', teamId: 't4', sectionId: 'aliya', fieldId: 'f_creative', username: 'cic118', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-118', isLeader: true, leaderRole: 'leader2', leaderUsername: 'leader4b', leaderPasswordHash: HASHED_PASSWORDS.leader, leaderSectionRestriction: 'all' },
  { id: 's19', name: 'Yaseen Jaleel', cicNo: 'WAFY-2024-119', classId: 'c4', teamId: 't4', sectionId: 'aliya', fieldId: 'f_communicative', username: 'cic119', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-119', isLeader: false },
  { id: 's20', name: 'Sinan Shihab', cicNo: 'WAFY-2024-120', classId: 'c5', teamId: 't4', sectionId: 'aliya', fieldId: 'f_creative', username: 'cic120', passwordHash: HASHED_PASSWORDS.student, chestNo: 'C-120', isLeader: false }
];

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
export const INITIAL_ENTRIES = [
  // --- OCTOBER SUMMIT 1 ---
  { id: 'e_oct1_1', programId: 'p_oct1_1', studentId: 's1', teamId: 't1', chestNo: 'C-101', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-09-25T10:00:00Z' },
  { id: 'e_oct1_2', programId: 'p_oct1_1', studentId: 's6', teamId: 't2', chestNo: 'C-106', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-09-25T10:15:00Z' },
  { id: 'e_oct1_3', programId: 'p_oct1_1', studentId: 's11', teamId: 't3', chestNo: 'C-111', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-09-25T10:30:00Z' },
  { id: 'e_oct1_4', programId: 'p_oct1_1', studentId: 's16', teamId: 't4', chestNo: 'C-116', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-09-25T10:45:00Z' },

  { id: 'e_oct1_5', programId: 'p_oct1_2', studentId: 's2', teamId: 't1', chestNo: 'C-102', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-09-26T09:00:00Z' },
  { id: 'e_oct1_6', programId: 'p_oct1_2', studentId: 's7', teamId: 't2', chestNo: 'C-107', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-09-26T09:15:00Z' },
  { id: 'e_oct1_7', programId: 'p_oct1_2', studentId: 's12', teamId: 't3', chestNo: 'C-112', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-09-26T09:30:00Z' },
  { id: 'e_oct1_8', programId: 'p_oct1_2', studentId: 's17', teamId: 't4', chestNo: 'C-117', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-09-26T09:45:00Z' },

  { id: 'e_oct1_9', programId: 'p_oct1_3', groupName: 'Al-Bayan Debaters', memberIds: ['s3', 's4'], teamId: 't1', chestNo: 'G-201', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-09-27T11:00:00Z' },
  { id: 'e_oct1_10', programId: 'p_oct1_3', groupName: 'Al-Furqan Debaters', memberIds: ['s8', 's9'], teamId: 't2', chestNo: 'G-202', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-09-27T11:20:00Z' },
  { id: 'e_oct1_11', programId: 'p_oct1_3', groupName: 'Al-Hikmah Debaters', memberIds: ['s18', 's19'], teamId: 't4', chestNo: 'G-203', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-09-27T11:40:00Z' },

  { id: 'e_oct1_12', programId: 'p_oct1_4', studentId: 's5', teamId: 't1', chestNo: 'C-105', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-09-28T14:00:00Z' },
  { id: 'e_oct1_13', programId: 'p_oct1_4', studentId: 's10', teamId: 't2', chestNo: 'C-110', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-09-28T14:15:00Z' },
  { id: 'e_oct1_14', programId: 'p_oct1_4', studentId: 's13', teamId: 't3', chestNo: 'C-113', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-09-28T14:30:00Z' },
  { id: 'e_oct1_15', programId: 'p_oct1_4', studentId: 's20', teamId: 't4', chestNo: 'C-120', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-09-28T14:45:00Z' },

  // --- OCTOBER SUMMIT 2 ---
  { id: 'e_oct2_1', programId: 'p_oct2_1', studentId: 's1', teamId: 't1', chestNo: 'C-101', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-10-04T09:00:00Z' },
  { id: 'e_oct2_2', programId: 'p_oct2_1', studentId: 's6', teamId: 't2', chestNo: 'C-106', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-10-04T09:15:00Z' },
  { id: 'e_oct2_3', programId: 'p_oct2_1', studentId: 's11', teamId: 't3', chestNo: 'C-111', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-10-04T09:30:00Z' },
  { id: 'e_oct2_4', programId: 'p_oct2_1', studentId: 's16', teamId: 't4', chestNo: 'C-116', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-10-04T09:45:00Z' },

  { id: 'e_oct2_5', programId: 'p_oct2_2', studentId: 's3', teamId: 't1', chestNo: 'C-103', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-10-05T11:00:00Z' },
  { id: 'e_oct2_6', programId: 'p_oct2_2', studentId: 's8', teamId: 't2', chestNo: 'C-108', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-10-05T11:15:00Z' },
  { id: 'e_oct2_7', programId: 'p_oct2_2', studentId: 's14', teamId: 't3', chestNo: 'C-114', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-10-05T11:30:00Z' },
  { id: 'e_oct2_8', programId: 'p_oct2_2', studentId: 's18', teamId: 't4', chestNo: 'C-118', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-10-05T11:45:00Z' },

  { id: 'e_oct2_9', programId: 'p_oct2_3', studentId: 's4', teamId: 't1', chestNo: 'C-104', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-10-06T15:00:00Z' },
  { id: 'e_oct2_10', programId: 'p_oct2_3', studentId: 's15', teamId: 't3', chestNo: 'C-115', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-10-06T15:30:00Z' },
  { id: 'e_oct2_11', programId: 'p_oct2_3', studentId: 's19', teamId: 't4', chestNo: 'C-119', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-10-06T15:45:00Z' },

  // --- OCTOBER SUMMIT 3 ---
  { id: 'e_oct3_1', programId: 'p_oct3_1', studentId: 's2', teamId: 't1', chestNo: 'C-102', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-10-11T10:00:00Z' },
  { id: 'e_oct3_2', programId: 'p_oct3_1', studentId: 's7', teamId: 't2', chestNo: 'C-107', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-10-11T10:15:00Z' },
  { id: 'e_oct3_3', programId: 'p_oct3_1', studentId: 's12', teamId: 't3', chestNo: 'C-112', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-10-11T10:30:00Z' },
  { id: 'e_oct3_4', programId: 'p_oct3_1', studentId: 's17', teamId: 't4', chestNo: 'C-117', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-10-11T10:45:00Z' },

  { id: 'e_oct3_5', programId: 'p_oct3_2', studentId: 's5', teamId: 't1', chestNo: 'C-105', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-10-12T14:00:00Z' },
  { id: 'e_oct3_6', programId: 'p_oct3_2', studentId: 's9', teamId: 't2', chestNo: 'C-109', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-10-12T14:15:00Z' },
  { id: 'e_oct3_7', programId: 'p_oct3_2', studentId: 's13', teamId: 't3', chestNo: 'C-113', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-10-12T14:30:00Z' },
  { id: 'e_oct3_8', programId: 'p_oct3_2', studentId: 's19', teamId: 't4', chestNo: 'C-119', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-10-12T14:45:00Z' },

  // --- OCTOBER SUMMIT 4 ---
  // Nihal Rahman (s1) enters BOTH History Quiz AND Elocution
  { id: 'e_oct4_1', programId: 'p_oct4_1', groupName: 'Al-Bayan Historians', memberIds: ['s1', 's2'], teamId: 't1', chestNo: 'G-204', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-10-18T10:00:00Z' },
  { id: 'e_oct4_2', programId: 'p_oct4_1', groupName: 'Al-Furqan Historians', memberIds: ['s6', 's7'], teamId: 't2', chestNo: 'G-205', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-10-18T10:15:00Z' },
  { id: 'e_oct4_3', programId: 'p_oct4_1', groupName: 'Al-Ihsan Historians', memberIds: ['s11', 's12'], teamId: 't3', chestNo: 'G-206', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-10-18T10:30:00Z' },
  { id: 'e_oct4_4', programId: 'p_oct4_1', groupName: 'Al-Hikmah Historians', memberIds: ['s16', 's17'], teamId: 't4', chestNo: 'G-207', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-10-18T10:45:00Z' },

  // s1 multi-program performance in same summit
  { id: 'e_oct4_5', programId: 'p_oct4_2', studentId: 's1', teamId: 't1', chestNo: 'C-101', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-10-19T09:00:00Z' },
  { id: 'e_oct4_6', programId: 'p_oct4_2', studentId: 's6', teamId: 't2', chestNo: 'C-106', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-10-19T09:15:00Z' },
  { id: 'e_oct4_7', programId: 'p_oct4_2', studentId: 's11', teamId: 't3', chestNo: 'C-111', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-10-19T09:30:00Z' },
  { id: 'e_oct4_8', programId: 'p_oct4_2', studentId: 's16', teamId: 't4', chestNo: 'C-116', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-10-19T09:45:00Z' },

  { id: 'e_oct4_9', programId: 'p_oct4_3', studentId: 's4', teamId: 't1', chestNo: 'C-104', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-10-20T14:00:00Z' },
  { id: 'e_oct4_10', programId: 'p_oct4_3', studentId: 's10', teamId: 't2', chestNo: 'C-110', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-10-20T14:15:00Z' },
  { id: 'e_oct4_11', programId: 'p_oct4_3', studentId: 's15', teamId: 't3', chestNo: 'C-115', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-10-20T14:30:00Z' },
  { id: 'e_oct4_12', programId: 'p_oct4_3', studentId: 's20', teamId: 't4', chestNo: 'C-120', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-10-20T14:45:00Z' },

  // --- NOVEMBER SUMMIT 1 ---
  { id: 'e_nov1_1', programId: 'p_nov1_1', studentId: 's1', teamId: 't1', chestNo: 'C-101', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-11-01T10:00:00Z' },
  { id: 'e_nov1_2', programId: 'p_nov1_1', studentId: 's6', teamId: 't2', chestNo: 'C-106', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-11-01T10:15:00Z' },
  { id: 'e_nov1_3', programId: 'p_nov1_1', studentId: 's11', teamId: 't3', chestNo: 'C-111', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-11-01T10:30:00Z' },
  { id: 'e_nov1_4', programId: 'p_nov1_1', studentId: 's16', teamId: 't4', chestNo: 'C-116', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-11-01T10:45:00Z' },

  { id: 'e_nov1_5', programId: 'p_nov1_2', groupName: 'Al-Bayan Orators', memberIds: ['s3', 's5'], teamId: 't1', chestNo: 'G-208', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-11-02T11:00:00Z' },
  { id: 'e_nov1_6', programId: 'p_nov1_2', groupName: 'Al-Furqan Orators', memberIds: ['s8', 's10'], teamId: 't2', chestNo: 'G-209', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-11-02T11:15:00Z' },
  { id: 'e_nov1_7', programId: 'p_nov1_2', groupName: 'Al-Ihsan Orators', memberIds: ['s13', 's15'], teamId: 't3', chestNo: 'G-210', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-11-02T11:30:00Z' },
  { id: 'e_nov1_8', programId: 'p_nov1_2', groupName: 'Al-Hikmah Orators', memberIds: ['s18', 's20'], teamId: 't4', chestNo: 'G-211', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-11-02T11:45:00Z' },

  // --- NOVEMBER SUMMIT 2 ---
  { id: 'e_nov2_1', programId: 'p_nov2_1', studentId: 's2', teamId: 't1', chestNo: 'C-102', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-11-08T09:00:00Z' },
  { id: 'e_nov2_2', programId: 'p_nov2_1', studentId: 's7', teamId: 't2', chestNo: 'C-107', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-11-08T09:15:00Z' },
  { id: 'e_nov2_3', programId: 'p_nov2_1', studentId: 's12', teamId: 't3', chestNo: 'C-112', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-11-08T09:30:00Z' },
  { id: 'e_nov2_4', programId: 'p_nov2_1', studentId: 's17', teamId: 't4', chestNo: 'C-117', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-11-08T09:45:00Z' },

  { id: 'e_nov2_5', programId: 'p_nov2_2', studentId: 's3', teamId: 't1', chestNo: 'C-103', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-11-09T14:00:00Z' },
  { id: 'e_nov2_6', programId: 'p_nov2_2', studentId: 's8', teamId: 't2', chestNo: 'C-108', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-11-09T14:15:00Z' },
  { id: 'e_nov2_7', programId: 'p_nov2_2', studentId: 's13', teamId: 't3', chestNo: 'C-113', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-11-09T14:30:00Z' },
  { id: 'e_nov2_8', programId: 'p_nov2_2', studentId: 's18', teamId: 't4', chestNo: 'C-118', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-11-09T14:45:00Z' },

  // Mazin Noor (s14) nominated but absent in Summit 2
  { id: 'e_nov2_9', programId: 'p_nov2_3', studentId: 's4', teamId: 't1', chestNo: 'C-104', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-11-10T16:00:00Z' },
  { id: 'e_nov2_10', programId: 'p_nov2_3', studentId: 's9', teamId: 't2', chestNo: 'C-109', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-11-10T16:15:00Z' },
  { id: 'e_nov2_11', programId: 'p_nov2_3', studentId: 's14', teamId: 't3', chestNo: 'C-114', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-11-10T16:30:00Z' },
  { id: 'e_nov2_12', programId: 'p_nov2_3', studentId: 's19', teamId: 't4', chestNo: 'C-119', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-11-10T16:45:00Z' },

  // --- NOVEMBER SUMMIT 3 ---
  { id: 'e_nov3_1', programId: 'p_nov3_1', groupName: 'Al-Bayan Historians Nov', memberIds: ['s1', 's2'], teamId: 't1', chestNo: 'G-212', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-11-15T10:00:00Z' },
  { id: 'e_nov3_2', programId: 'p_nov3_1', groupName: 'Al-Furqan Historians Nov', memberIds: ['s6', 's7'], teamId: 't2', chestNo: 'G-213', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-11-15T10:15:00Z' },
  { id: 'e_nov3_3', programId: 'p_nov3_1', groupName: 'Al-Ihsan Historians Nov', memberIds: ['s11', 's12'], teamId: 't3', chestNo: 'G-214', nominatedBy: 'Salman Faris (Leader 1)', nominatedByUsername: 'leader3', nominatedAt: '2026-11-15T10:30:00Z' },
  { id: 'e_nov3_4', programId: 'p_nov3_1', groupName: 'Al-Hikmah Historians Nov', memberIds: ['s16', 's17'], teamId: 't4', chestNo: 'G-215', nominatedBy: 'Uvais Zain (Leader 1)', nominatedByUsername: 'leader4', nominatedAt: '2026-11-15T10:45:00Z' },

  { id: 'e_nov3_5', programId: 'p_nov3_2', studentId: 's5', teamId: 't1', chestNo: 'C-105', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-11-16T14:00:00Z' },
  { id: 'e_nov3_6', programId: 'p_nov3_2', studentId: 's10', teamId: 't2', chestNo: 'C-110', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-11-16T14:15:00Z' },
  { id: 'e_nov3_7', programId: 'p_nov3_2', studentId: 's15', teamId: 't3', chestNo: 'C-115', nominatedBy: 'Hisham Tariq (Leader 2)', nominatedByUsername: 'leader3b', nominatedAt: '2026-11-16T14:30:00Z' },
  { id: 'e_nov3_8', programId: 'p_nov3_2', studentId: 's20', teamId: 't4', chestNo: 'C-120', nominatedBy: 'Danish Ameen (Leader 2)', nominatedByUsername: 'leader4b', nominatedAt: '2026-11-16T14:45:00Z' },

  // --- NOVEMBER SUMMIT 4 (Open Registrations) ---
  { id: 'e_nov4_1', programId: 'p_nov4_1', studentId: 's1', teamId: 't1', chestNo: 'C-101', nominatedBy: 'Nihal Rahman (Leader 1)', nominatedByUsername: 'leader1', nominatedAt: '2026-11-22T09:00:00Z' },
  { id: 'e_nov4_2', programId: 'p_nov4_1', studentId: 's6', teamId: 't2', chestNo: 'C-106', nominatedBy: 'Bilal Hashim (Leader 1)', nominatedByUsername: 'leader2', nominatedAt: '2026-11-22T09:15:00Z' },
  { id: 'e_nov4_3', programId: 'p_nov4_2', studentId: 's4', teamId: 't1', chestNo: 'C-104', nominatedBy: 'Ammar Farooq (Leader 2)', nominatedByUsername: 'leader1b', nominatedAt: '2026-11-23T11:00:00Z' },
  { id: 'e_nov4_4', programId: 'p_nov4_2', studentId: 's9', teamId: 't2', chestNo: 'C-109', nominatedBy: 'Suhail Musthafa (Leader 2)', nominatedByUsername: 'leader2b', nominatedAt: '2026-11-23T11:15:00Z' }
];

// 10. EVALUATION SCORES ACROSS 8 SUMMITS
export const INITIAL_MARKS = [
  // --- OCTOBER SUMMIT 1 MARKS ---
  { id: 'm_oct1_1', programId: 'p_oct1_1', entryId: 'e_oct1_1', studentId: 's1', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.6, status: 'approved', timestamp: '2026-10-02T10:00:00Z' },
  { id: 'm_oct1_2', programId: 'p_oct1_1', entryId: 'e_oct1_2', studentId: 's6', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.9, status: 'approved', timestamp: '2026-10-02T10:15:00Z' },
  { id: 'm_oct1_3', programId: 'p_oct1_1', entryId: 'e_oct1_3', studentId: 's11', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.4, status: 'approved', timestamp: '2026-10-02T10:30:00Z' },
  { id: 'm_oct1_4', programId: 'p_oct1_1', entryId: 'e_oct1_4', studentId: 's16', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 7.7, status: 'approved', timestamp: '2026-10-02T10:45:00Z' },

  { id: 'm_oct1_5', programId: 'p_oct1_2', entryId: 'e_oct1_5', studentId: 's2', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.4, status: 'approved', timestamp: '2026-10-02T12:00:00Z' },
  { id: 'm_oct1_6', programId: 'p_oct1_2', entryId: 'e_oct1_6', studentId: 's7', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.7, status: 'approved', timestamp: '2026-10-02T12:15:00Z' },
  { id: 'm_oct1_7', programId: 'p_oct1_2', entryId: 'e_oct1_7', studentId: 's12', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.5, status: 'approved', timestamp: '2026-10-02T12:30:00Z' },
  { id: 'm_oct1_8', programId: 'p_oct1_2', entryId: 'e_oct1_8', studentId: 's17', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.0, status: 'approved', timestamp: '2026-10-02T12:45:00Z' },

  { id: 'm_oct1_9', programId: 'p_oct1_3', entryId: 'e_oct1_9', studentId: 's3', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.2, status: 'approved', timestamp: '2026-10-02T15:00:00Z' },
  { id: 'm_oct1_10', programId: 'p_oct1_3', entryId: 'e_oct1_10', studentId: 's8', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.8, status: 'approved', timestamp: '2026-10-02T15:15:00Z' },
  { id: 'm_oct1_11', programId: 'p_oct1_3', entryId: 'e_oct1_11', studentId: 's18', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.4, status: 'approved', timestamp: '2026-10-02T15:30:00Z' },

  { id: 'm_oct1_12', programId: 'p_oct1_4', entryId: 'e_oct1_12', studentId: 's5', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.5, status: 'approved', timestamp: '2026-10-02T17:00:00Z' },
  { id: 'm_oct1_13', programId: 'p_oct1_4', entryId: 'e_oct1_13', studentId: 's10', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.0, status: 'approved', timestamp: '2026-10-02T17:15:00Z' },
  { id: 'm_oct1_14', programId: 'p_oct1_4', entryId: 'e_oct1_14', studentId: 's13', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.6, status: 'approved', timestamp: '2026-10-02T17:30:00Z' },
  { id: 'm_oct1_15', programId: 'p_oct1_4', entryId: 'e_oct1_15', studentId: 's20', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.2, status: 'approved', timestamp: '2026-10-02T17:45:00Z' },

  // --- OCTOBER SUMMIT 2 MARKS ---
  { id: 'm_oct2_1', programId: 'p_oct2_1', entryId: 'e_oct2_1', studentId: 's1', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.3, status: 'approved', timestamp: '2026-10-09T11:00:00Z' },
  { id: 'm_oct2_2', programId: 'p_oct2_1', entryId: 'e_oct2_2', studentId: 's6', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.9, status: 'approved', timestamp: '2026-10-09T11:15:00Z' },
  { id: 'm_oct2_3', programId: 'p_oct2_1', entryId: 'e_oct2_3', studentId: 's11', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.5, status: 'approved', timestamp: '2026-10-09T11:30:00Z' },
  { id: 'm_oct2_4', programId: 'p_oct2_1', entryId: 'e_oct2_4', studentId: 's16', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.0, status: 'approved', timestamp: '2026-10-09T11:45:00Z' },

  { id: 'm_oct2_5', programId: 'p_oct2_2', entryId: 'e_oct2_5', studentId: 's3', enteredBy: 's1', enteredByName: 'Leader Nihal Rahman', sourceRole: 'leader', marks: 9.1, status: 'approved', timestamp: '2026-10-09T15:00:00Z' },
  { id: 'm_oct2_6', programId: 'p_oct2_2', entryId: 'e_oct2_6', studentId: 's8', enteredBy: 's6', enteredByName: 'Leader Bilal Hashim', sourceRole: 'leader', marks: 8.7, status: 'approved', timestamp: '2026-10-09T15:15:00Z' },
  { id: 'm_oct2_7', programId: 'p_oct2_2', entryId: 'e_oct2_7', studentId: 's14', enteredBy: 's11', enteredByName: 'Leader Salman Faris', sourceRole: 'leader', marks: 8.5, status: 'approved', timestamp: '2026-10-09T15:30:00Z' },
  { id: 'm_oct2_8', programId: 'p_oct2_2', entryId: 'e_oct2_8', studentId: 's18', enteredBy: 's16', enteredByName: 'Leader Uvais Zain', sourceRole: 'leader', marks: 8.0, status: 'approved', timestamp: '2026-10-09T15:45:00Z' },

  { id: 'm_oct2_9', programId: 'p_oct2_3', entryId: 'e_oct2_9', studentId: 's4', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 9.4, status: 'approved', timestamp: '2026-10-09T17:00:00Z' },
  { id: 'm_oct2_10', programId: 'p_oct2_3', entryId: 'e_oct2_10', studentId: 's15', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.8, status: 'approved', timestamp: '2026-10-09T17:15:00Z' },
  { id: 'm_oct2_11', programId: 'p_oct2_3', entryId: 'e_oct2_11', studentId: 's19', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.3, status: 'approved', timestamp: '2026-10-09T17:30:00Z' },

  // --- OCTOBER SUMMIT 3 MARKS ---
  { id: 'm_oct3_1', programId: 'p_oct3_1', entryId: 'e_oct3_1', studentId: 's2', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.5, status: 'approved', timestamp: '2026-10-16T11:00:00Z' },
  { id: 'm_oct3_2', programId: 'p_oct3_1', entryId: 'e_oct3_2', studentId: 's7', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.8, status: 'approved', timestamp: '2026-10-16T11:15:00Z' },
  { id: 'm_oct3_3', programId: 'p_oct3_1', entryId: 'e_oct3_3', studentId: 's12', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.6, status: 'approved', timestamp: '2026-10-16T11:30:00Z' },
  { id: 'm_oct3_4', programId: 'p_oct3_1', entryId: 'e_oct3_4', studentId: 's17', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.1, status: 'approved', timestamp: '2026-10-16T11:45:00Z' },

  { id: 'm_oct3_5', programId: 'p_oct3_2', entryId: 'e_oct3_5', studentId: 's5', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 9.3, status: 'approved', timestamp: '2026-10-16T15:00:00Z' },
  { id: 'm_oct3_6', programId: 'p_oct3_2', entryId: 'e_oct3_6', studentId: 's9', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.7, status: 'approved', timestamp: '2026-10-16T15:15:00Z' },
  { id: 'm_oct3_7', programId: 'p_oct3_2', entryId: 'e_oct3_7', studentId: 's13', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.9, status: 'approved', timestamp: '2026-10-16T15:30:00Z' },
  { id: 'm_oct3_8', programId: 'p_oct3_2', entryId: 'e_oct3_8', studentId: 's19', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.4, status: 'approved', timestamp: '2026-10-16T15:45:00Z' },

  // --- OCTOBER SUMMIT 4 MARKS ---
  { id: 'm_oct4_1', programId: 'p_oct4_1', entryId: 'e_oct4_1', studentId: 's1', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.6, status: 'approved', timestamp: '2026-10-23T11:00:00Z' },
  { id: 'm_oct4_2', programId: 'p_oct4_1', entryId: 'e_oct4_2', studentId: 's6', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.0, status: 'approved', timestamp: '2026-10-23T11:15:00Z' },
  { id: 'm_oct4_3', programId: 'p_oct4_1', entryId: 'e_oct4_3', studentId: 's11', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.6, status: 'approved', timestamp: '2026-10-23T11:30:00Z' },
  { id: 'm_oct4_4', programId: 'p_oct4_1', entryId: 'e_oct4_4', studentId: 's16', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.2, status: 'approved', timestamp: '2026-10-23T11:45:00Z' },

  // Nihal Rahman s1 second performance in Summit 4
  { id: 'm_oct4_5', programId: 'p_oct4_2', entryId: 'e_oct4_5', studentId: 's1', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.5, status: 'approved', timestamp: '2026-10-23T12:00:00Z' },
  { id: 'm_oct4_6', programId: 'p_oct4_2', entryId: 'e_oct4_6', studentId: 's6', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.8, status: 'approved', timestamp: '2026-10-23T12:15:00Z' },
  { id: 'm_oct4_7', programId: 'p_oct4_2', entryId: 'e_oct4_7', studentId: 's11', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.4, status: 'approved', timestamp: '2026-10-23T12:30:00Z' },
  { id: 'm_oct4_8', programId: 'p_oct4_2', entryId: 'e_oct4_8', studentId: 's16', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.1, status: 'approved', timestamp: '2026-10-23T12:45:00Z' },

  { id: 'm_oct4_9', programId: 'p_oct4_3', entryId: 'e_oct4_9', studentId: 's4', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 9.3, status: 'approved', timestamp: '2026-10-23T16:00:00Z' },
  { id: 'm_oct4_10', programId: 'p_oct4_3', entryId: 'e_oct4_10', studentId: 's10', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.9, status: 'approved', timestamp: '2026-10-23T16:15:00Z' },
  { id: 'm_oct4_11', programId: 'p_oct4_3', entryId: 'e_oct4_11', studentId: 's15', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.7, status: 'approved', timestamp: '2026-10-23T16:30:00Z' },
  { id: 'm_oct4_12', programId: 'p_oct4_3', entryId: 'e_oct4_12', studentId: 's20', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.2, status: 'approved', timestamp: '2026-10-23T16:45:00Z' },

  // --- NOVEMBER SUMMIT 1 MARKS ---
  { id: 'm_nov1_1', programId: 'p_nov1_1', entryId: 'e_nov1_1', studentId: 's1', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.7, status: 'approved', timestamp: '2026-11-06T10:00:00Z' },
  { id: 'm_nov1_2', programId: 'p_nov1_1', entryId: 'e_nov1_2', studentId: 's6', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.0, status: 'approved', timestamp: '2026-11-06T10:15:00Z' },
  { id: 'm_nov1_3', programId: 'p_nov1_1', entryId: 'e_nov1_3', studentId: 's11', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.6, status: 'approved', timestamp: '2026-11-06T10:30:00Z' },
  { id: 'm_nov1_4', programId: 'p_nov1_1', entryId: 'e_nov1_4', studentId: 's16', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.1, status: 'approved', timestamp: '2026-11-06T10:45:00Z' },

  { id: 'm_nov1_5', programId: 'p_nov1_2', entryId: 'e_nov1_5', studentId: 's3', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 9.3, status: 'approved', timestamp: '2026-11-06T15:00:00Z' },
  { id: 'm_nov1_6', programId: 'p_nov1_2', entryId: 'e_nov1_6', studentId: 's8', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.8, status: 'approved', timestamp: '2026-11-06T15:15:00Z' },
  { id: 'm_nov1_7', programId: 'p_nov1_2', entryId: 'e_nov1_7', studentId: 's13', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.5, status: 'approved', timestamp: '2026-11-06T15:30:00Z' },
  { id: 'm_nov1_8', programId: 'p_nov1_2', entryId: 'e_nov1_8', studentId: 's18', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.2, status: 'approved', timestamp: '2026-11-06T15:45:00Z' },

  // --- NOVEMBER SUMMIT 2 MARKS ---
  { id: 'm_nov2_1', programId: 'p_nov2_1', entryId: 'e_nov2_1', studentId: 's2', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.4, status: 'approved', timestamp: '2026-11-13T11:00:00Z' },
  { id: 'm_nov2_2', programId: 'p_nov2_1', entryId: 'e_nov2_2', studentId: 's7', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.8, status: 'approved', timestamp: '2026-11-13T11:15:00Z' },
  { id: 'm_nov2_3', programId: 'p_nov2_1', entryId: 'e_nov2_3', studentId: 's12', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.5, status: 'approved', timestamp: '2026-11-13T11:30:00Z' },
  { id: 'm_nov2_4', programId: 'p_nov2_1', entryId: 'e_nov2_4', studentId: 's17', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.1, status: 'approved', timestamp: '2026-11-13T11:45:00Z' },

  { id: 'm_nov2_5', programId: 'p_nov2_2', entryId: 'e_nov2_5', studentId: 's3', enteredBy: 's1', enteredByName: 'Leader Nihal Rahman', sourceRole: 'leader', marks: 9.2, status: 'approved', timestamp: '2026-11-13T15:00:00Z' },
  { id: 'm_nov2_6', programId: 'p_nov2_2', entryId: 'e_nov2_6', studentId: 's8', enteredBy: 's6', enteredByName: 'Leader Bilal Hashim', sourceRole: 'leader', marks: 8.7, status: 'approved', timestamp: '2026-11-13T15:15:00Z' },
  { id: 'm_nov2_7', programId: 'p_nov2_2', entryId: 'e_nov2_7', studentId: 's13', enteredBy: 's11', enteredByName: 'Leader Salman Faris', sourceRole: 'leader', marks: 8.4, status: 'approved', timestamp: '2026-11-13T15:30:00Z' },
  { id: 'm_nov2_8', programId: 'p_nov2_2', entryId: 'e_nov2_8', studentId: 's18', enteredBy: 's16', enteredByName: 'Leader Uvais Zain', sourceRole: 'leader', marks: 8.1, status: 'approved', timestamp: '2026-11-13T15:45:00Z' },

  { id: 'm_nov2_9', programId: 'p_nov2_3', entryId: 'e_nov2_9', studentId: 's4', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 9.4, status: 'approved', timestamp: '2026-11-13T17:00:00Z' },
  { id: 'm_nov2_10', programId: 'p_nov2_3', entryId: 'e_nov2_10', studentId: 's9', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.9, status: 'approved', timestamp: '2026-11-13T17:15:00Z' },
  // s14 Absent / Not Performed: 0 marks
  { id: 'm_nov2_11', programId: 'p_nov2_3', entryId: 'e_nov2_11', studentId: 's14', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 0.0, status: 'approved', timestamp: '2026-11-13T17:30:00Z' },
  { id: 'm_nov2_12', programId: 'p_nov2_3', entryId: 'e_nov2_12', studentId: 's19', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.3, status: 'approved', timestamp: '2026-11-13T17:45:00Z' },

  // --- NOVEMBER SUMMIT 3 MARKS ---
  { id: 'm_nov3_1', programId: 'p_nov3_1', entryId: 'e_nov3_1', studentId: 's1', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 9.5, status: 'approved', timestamp: '2026-11-20T11:00:00Z' },
  { id: 'm_nov3_2', programId: 'p_nov3_1', entryId: 'e_nov3_2', studentId: 's6', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.9, status: 'approved', timestamp: '2026-11-20T11:15:00Z' },
  { id: 'm_nov3_3', programId: 'p_nov3_1', entryId: 'e_nov3_3', studentId: 's11', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.6, status: 'approved', timestamp: '2026-11-20T11:30:00Z' },
  { id: 'm_nov3_4', programId: 'p_nov3_1', entryId: 'e_nov3_4', studentId: 's16', enteredBy: 'j1', enteredByName: 'Usthad Abdul Rasheed', sourceRole: 'judge', marks: 8.0, status: 'approved', timestamp: '2026-11-20T11:45:00Z' },

  { id: 'm_nov3_5', programId: 'p_nov3_2', entryId: 'e_nov3_5', studentId: 's5', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 9.6, status: 'approved', timestamp: '2026-11-20T15:00:00Z' },
  { id: 'm_nov3_6', programId: 'p_nov3_2', entryId: 'e_nov3_6', studentId: 's10', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 9.0, status: 'approved', timestamp: '2026-11-20T15:15:00Z' },
  { id: 'm_nov3_7', programId: 'p_nov3_2', entryId: 'e_nov3_7', studentId: 's15', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.8, status: 'approved', timestamp: '2026-11-20T15:30:00Z' },
  { id: 'm_nov3_8', programId: 'p_nov3_2', entryId: 'e_nov3_8', studentId: 's20', enteredBy: 'j2', enteredByName: 'Dr. K. Muhammed Ali', sourceRole: 'judge', marks: 8.2, status: 'approved', timestamp: '2026-11-20T15:45:00Z' }
];

// 11. ATTENDANCE SEED (START, MID, END across all 8 summits x 20 students)
export const generateInitialAttendance = () => {
  const records = [];
  const summitIds = [
    'summit_oct_1', 'summit_oct_2', 'summit_oct_3', 'summit_oct_4',
    'summit_nov_1', 'summit_nov_2', 'summit_nov_3', 'summit_nov_4'
  ];
  const sessions = ['START', 'MID', 'END'];

  summitIds.forEach((sId, sIdx) => {
    sessions.forEach(sess => {
      INITIAL_STUDENTS.forEach((student, stIdx) => {
        let status = 'Present';

        // Mazin Noor (s14, stIdx 13) is Absent in summit_nov_2
        if (sId === 'summit_nov_2' && student.id === 's14') {
          status = 'Absent';
        }
        // Rayyan Shafi (s5, stIdx 4) Excused in summit_oct_3 END
        else if (sId === 'summit_oct_3' && student.id === 's5' && sess === 'END') {
          status = 'Excused';
        }
        // Fahad Basheer (s10, stIdx 9) Late in summit_oct_2 START
        else if (sId === 'summit_oct_2' && student.id === 's10' && sess === 'START') {
          status = 'Late';
        }
        // Sinan Shihab (s20, stIdx 19) Absent in summit_nov_1 START
        else if (sId === 'summit_nov_1' && student.id === 's20' && sess === 'START') {
          status = 'Absent';
        }
        // Adil Munawar (s9, stIdx 8) Late in summit_nov_3 MID
        else if (sId === 'summit_nov_3' && student.id === 's9' && sess === 'MID') {
          status = 'Late';
        }

        records.push({
          id: `att_${sId}_${sess}_${student.id}`,
          summitId: sId,
          session: sess,
          studentId: student.id,
          status,
          markedBy: 'admin',
          locked: sIdx < 7
        });
      });
    });
  });

  return records;
};

export const INITIAL_ATTENDANCE = generateInitialAttendance();

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
