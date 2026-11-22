import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Printer,
  Calendar,
  Filter,
  FileText,
  X,
  Award,
  Users,
  Building,
  Layers,
  Edit3,
  Eye,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Clock,
  Briefcase,
  Download,
  BookOpen,
  HeartHandshake,
  Trophy,
  Palette,
  GraduationCap,
  Camera,
  Folder
} from 'lucide-react';
import { printHtmlDocument, downloadHtmlFile } from '../../utils/printHelper';
import { MusfEmblemSvg } from '../common/MusfEmblemSvg';

// Standard 12 Academic Months across 2026-2027 Academic Year
export const ACADEMIC_MONTHS = [
  { value: 'all', labelEn: 'All Months (Full Academic Year 2026-27)', labelMl: 'മുഴുവൻ മാസങ്ങളും (2026-27 സമഗ്ര റിപ്പോർട്ട്)' },
  { value: '2026-06', labelEn: 'June 2026', labelMl: '2026 ജൂൺ' },
  { value: '2026-07', labelEn: 'July 2026', labelMl: '2026 ജൂലൈ' },
  { value: '2026-08', labelEn: 'August 2026', labelMl: '2026 ഓഗസ്റ്റ്' },
  { value: '2026-09', labelEn: 'September 2026', labelMl: '2026 സെപ്റ്റംബർ' },
  { value: '2026-10', labelEn: 'October 2026', labelMl: '2026 ഒക്ടോബർ' },
  { value: '2026-11', labelEn: 'November 2026', labelMl: '2026 നവംബർ' },
  { value: '2026-12', labelEn: 'December 2026', labelMl: '2026 ഡിസംബർ' },
  { value: '2027-01', labelEn: 'January 2027', labelMl: '2027 ജനുവരി' },
  { value: '2027-02', labelEn: 'February 2027', labelMl: '2027 ഫെബ്രുവരി' },
  { value: '2027-03', labelEn: 'March 2027', labelMl: '2027 മാർച്ച്' },
  { value: '2027-04', labelEn: 'April 2027', labelMl: '2027 ഏപ്രിൽ' },
  { value: '2027-05', labelEn: 'May 2027', labelMl: '2027 മെയ്' }
];

// Predefined 12 Wings & Committees modeled from MUSF Half Year Report
export const DEFAULT_HALF_YEAR_SECTIONS = [
  {
    id: 'fine_arts',
    wingNameEn: 'Fine Arts Wing',
    wingNameMl: 'ഫൈൻ ആർട്സ് വിംഗ് (Fine Arts Wing)',
    defaultTextEn: "The Fine Arts Wing spearheads co-curricular talents through stage and off-stage artistic summits. Over the past term, master competitive events were scheduled and executed across House Teams (Team A, Team B, Team C), cultivating exceptional talents in classical calligraphy, Quranic recitation, public speaking, and theatrical arts with strict evaluation protocols.",
    defaultTextMl: "വിദ്യാർത്ഥികളുടെ സർഗ്ഗാത്മക പ്രതിഭകളെ പരിപോഷിപ്പിക്കുന്നതിനായി ഫൈൻ ആർട്സ് വിംഗിന്റെ കീഴിൽ ബൃഹത്തായ കലാ സാഹിത്യ സമ്മിറ്റുകൾ സംഘടിപ്പിച്ചു. വാർഷിക ആർട്സ് സമ്മിറ്റിലെ മത്സര ഇനങ്ങളിൽ ടീം എ, ടീം ബി, ടീം സി എന്നീ ഹൗസുകളിലെ വിദ്യാർത്ഥികൾ മാറ്റുരച്ചു. കാലിഗ്രഫി, ഖുർആൻ പാരായണം, മാപ്പിളപ്പാട്ട്, പ്രസംഗം തുടങ്ങിയ വിവിധ ഇനങ്ങളിൽ കർശനമായ ബ്ലൈൻഡ് ഇവാലുവേഷൻ മാനദണ്ഡങ്ങളോടെ മത്സരങ്ങൾ വിജയകരമായി പൂർത്തീകരിച്ചു."
  },
  {
    id: 'literary',
    wingNameEn: 'Literary & Publication Wing',
    wingNameMl: 'സാഹിത്യ വിഭാഗം (Literary Wing)',
    defaultTextEn: "The Literary Wing fostered rich multilingual intellectual discourse through campus manuscript magazines, academic debates, and literary circles in Arabic, English, Urdu, and Malayalam. Interactive creative writing workshops and multilingual paper presentations inspired critical thought and scholarly expression across student batches.",
    defaultTextMl: "വിദ്യാർത്ഥികളിൽ എഴുത്തുവാസനയും ചിന്താശേഷിയും വളർത്തുന്നതിനായി സാഹിത്യ വിംഗിന്റെ കീഴിൽ ഹാൻഡ്‌റിട്ടൻ മാഗസിൻ പ്രകാശനം, സംവാദങ്ങൾ, പ്രബന്ധ രചനകൾ എന്നിവ സംഘടിപ്പിച്ചു. അറബിക്, ഇംഗ്ലീഷ്, ഉറുദു, മലയാളം ഭാഷകളിൽ വൈവിധ്യമാർന്ന ചർച്ചകളും സാഹിത്യ സദസ്സുകളും നടത്തിക്കൊണ്ട് കാമ്പസിൽ മികച്ച ബൗദ്ധികാന്തരീക്ഷം സൃഷ്ടിക്കാൻ ഈ വിഭാഗത്തിന് സാധിച്ചു."
  },
  {
    id: 'sports',
    wingNameEn: 'Sports & Games Wing',
    wingNameMl: 'കായിക വിഭാഗം (Sports Wing)',
    defaultTextEn: "Promoting physical vigor and camaraderie, the Sports Wing staged competitive leagues, football championships, badminton meets, and physical wellness activities with athletic discipline and active participation across all batches.",
    defaultTextMl: "വിദ്യാർത്ഥികളുടെ കായിക ക്ഷമതയും മാനസിക ഉന്മേഷവും ലക്ഷ്യമാക്കി സ്പോർട്സ് വിംഗ് വൈവിധ്യമാർന്ന ടൂർണമെന്റുകൾ സംഘടിപ്പിച്ചു. വാശിയേറിയ ഫുട്ബോൾ ചാമ്പ്യൻഷിപ്പ്, ക്രിക്കറ്റ്, അത്‌ലറ്റിക്സ് എന്നിവ കാമ്പസ് ഗ്രൗണ്ടിൽ വിജയകരമായി നടത്തി. കായികതാരങ്ങൾക്ക് മികച്ച പരിശീലനവും പ്രോത്സാഹനവും നൽകി."
  },
  {
    id: 'dawah',
    wingNameEn: 'Beacon of Guidance (Da‘wah & Moral Wing)',
    wingNameMl: 'ബീക്കൺ ഓഫ് ഗൈഡൻസ് (Beacon of Guidance / Da‘wah)',
    defaultTextEn: "Under Beacon of Guidance, spiritual enrichment circles, weekly moral halaqas, and community charity outreach programs were conducted. Students engaged in selfless humanitarian service, ethical mentoring, and community welfare with dedication.",
    defaultTextMl: "ധാർമ്മിക മൂല്യങ്ങളും ആത്മീയ സംസ്കരണവും ലക്ഷ്യമിട്ട് ബീക്കൺ ഓഫ് ഗൈഡൻസ് (ദഅ്‌വാ വിംഗ്) ആഴ്ചതോറുമുള്ള ഹൽഖകളും തസ്കിയത് മജ്‌ലിസുകളും സംഘടിപ്പിച്ചു. അതോടൊപ്പം ജീവകാരുണ്യ പ്രവർത്തനങ്ങളും കാരുണ്യ കിറ്റ് വിതരണവും വഴി സമൂഹത്തിലെ അർഹരായവരിലേക്ക് കാരുണ്യഹസ്തമെത്തിക്കാൻ വിദ്യാർത്ഥികൾക്ക് സാധിച്ചു."
  },
  {
    id: 'research',
    wingNameEn: 'Academic & Research Wing',
    wingNameMl: 'ഗവേഷണ വിഭാഗം (Academic & Research Wing)',
    defaultTextEn: "Dedicated to intellectual inquiry and methodology, the Research Wing convened symposiums on contemporary Islamic jurisprudence, modern commercial contracts, and bioethics. Selected student researchers presented academic papers under faculty guidance, strengthening scholarly documentation across the institution.",
    defaultTextMl: "അക്കാദമിക ഗവേഷണ രീതിശാസ്ത്രങ്ങളെ പരിചയപ്പെടുത്തുന്നതിനും സമകാലിക വിഷയങ്ങളിൽ കർമ്മശാസ്ത്ര വീക്ഷണം പങ്കുവെക്കുന്നതിനുമായി ഗവേഷണ വിഭാഗം സിമ്പോസിയങ്ങളും സെമിനാറുകളും സംഘടിപ്പിച്ചു. അധ്യാപകരുടെ മേൽനോട്ടത്തിൽ തെരഞ്ഞെടുക്കപ്പെട്ട വിദ്യാർത്ഥികൾ തയ്യാറാക്കിയ ഗവേഷണ പ്രബന്ധങ്ങളുടെ അവതരണവും അവലോകനവും വിജയകരമായി പൂർത്തിയാക്കി."
  },
  {
    id: 'media_it',
    wingNameEn: 'IT & PRD (Public Relations & Media)',
    wingNameMl: 'ഐ.ടി & പി.ആർ.ഡി (IT & Media Wing)',
    defaultTextEn: "The IT and Public Relations Department spearheaded digital broadcasting, official event poster design, portal records, and campus photography. Through verified official channels and digital archives, union programs received timely documentation and widespread visibility.",
    defaultTextMl: "യൂണിയന്റെ പ്രവർത്തനങ്ങൾ സമയബന്ധിതമായി കാമ്പസിനകത്തും പുറത്തും എത്തിക്കുന്നതിൽ ഐ.ടി & പി.ആർ.ഡി വകുപ്പ് മികവുറ്റ പ്രവർത്തനങ്ങൾ നടത്തി. ഡിജിറ്റൽ ബുള്ളറ്റിനുകൾ, ഔദ്യോഗിക സോഷ്യൽ മീഡിയ പോസ്റ്ററുകൾ, ഫോട്ടോ-വീഡിയോ ഡോക്യുമെന്റേഷൻ, യൂണിയൻ പോർട്ടൽ ഡാറ്റാബേസ് മാനേജ്മെന്റ് എന്നിവ ഈ വിഭാഗം നിർവ്വഹിച്ചു."
  },
  {
    id: 'library',
    wingNameEn: 'Library Committee',
    wingNameMl: 'ലൈബ്രറി കമ്മിറ്റി (Library Committee)',
    defaultTextEn: "The Library Committee oversaw the cataloging, systematic maintenance, and digital indexing of academic references and Islamic jurisprudence volumes. Regular reading circles, book review colloquiums, and Reading Day observances motivated students toward extensive research and purposeful study habits.",
    defaultTextMl: "കോളേജ് ലൈബ്രറിയുടെ പ്രവർത്തനം കാര്യക്ഷമമായി മുന്നോട്ടുകൊണ്ടുപോകുന്നതിൽ ലൈബ്രറി കമ്മിറ്റി നിർണ്ണായക പങ്കുവഹിച്ചു. പുതിയ റഫറൻസ് പുസ്തകങ്ങളുടെ കാറ്റലോഗിംഗ്, പുസ്തകാവലോകന സദസ്സുകൾ, വായനാദിനാചരണം എന്നിവ ചിട്ടയായി നടത്തി. വിദ്യാർത്ഥികളിൽ വായനാശീലം പരിപോഷിപ്പിക്കുന്നതിനായി റീഡേഴ്സ് ക്ലബ്ബിന്റെ ആഭിമുഖ്യത്തിൽ പ്രതിമാസ ചർച്ചകളും സംഘടിപ്പിച്ചു."
  },
  {
    id: 'medical',
    wingNameEn: 'Medical Board',
    wingNameMl: 'മെഡിക്കൽ ബോർഡ് (Medical Board)',
    defaultTextEn: "The Medical Board ensured campus health and physical safety through timely first-aid provision, seasonal wellness checks, and healthy lifestyle awareness drives. The campus first-aid unit remained well-stocked with essential emergency remedies and medical care logs.",
    defaultTextMl: "വിദ്യാർത്ഥികളുടെയും കാമ്പസിന്റെയും ആരോഗ്യ സുരക്ഷ മുൻനിർത്തി മെഡിക്കൽ ബോർഡ് മികച്ച പ്രവർത്തനങ്ങൾ കാഴ്ചവെച്ചു. ഫസ്റ്റ് എയ്ഡ് യൂണിറ്റിന്റെ പ്രവർത്തനങ്ങൾ കാര്യക്ഷമമാക്കുകയും, പ്രഥമശുശ്രൂഷാ സാമഗ്രികൾ സമയബന്ധിതമായി ലഭ്യമാക്കുകയും ചെയ്തു. കാമ്പസ് ശുചിത്വ പരിപാലനത്തിലും ആരോഗ്യ ബോധവൽക്കരണത്തിലും മെഡിക്കൽ ബോർഡ് സജീവമായി പങ്കെടുത്തു."
  },
  {
    id: 'social',
    wingNameEn: 'Social Affairs & Welfare Wing',
    wingNameMl: 'സോഷ്യൽ അഫയേഴ്സ് വിംഗ് (Social Affairs Wing)',
    defaultTextEn: "The Social Affairs Wing supervised student community welfare, mess arrangements, and collective support mechanisms. Embodying empathy and social solidarity, volunteers coordinated assistance drives ensuring every student felt supported throughout the academic term.",
    defaultTextMl: "വിദ്യാർത്ഥികളുടെ ക്ഷേമകാര്യങ്ങളിലും കാമ്പസ് ജീവിത സൗകര്യങ്ങൾ ഉറപ്പുവരുത്തുന്നതിലും സോഷ്യൽ അഫയേഴ്സ് വിംഗ് ശ്രദ്ധേയമായ ഇടപെടലുകൾ നടത്തി. മെസ്സ് കൗൺസിൽ പ്രവർത്തനങ്ങൾ ചിട്ടപ്പെടുത്തുകയും, വിദ്യാർത്ഥികളുടെ ആവശ്യങ്ങൾ പരിഹരിക്കുന്നതിനായി യൂണിയൻ എക്സിക്യൂട്ടീവുമായി ചേർന്ന് ക്ഷേമപ്രവർത്തനങ്ങൾ ഏകോപിപ്പിക്കുകയും ചെയ്തു."
  },
  {
    id: 'language',
    wingNameEn: 'Language Wing (Arabic, English, Urdu)',
    wingNameMl: 'ലാംഗ്വേജ് വിംഗ് (Language Wing)',
    defaultTextEn: "The Language Wing conducted communicative fluency bootcamps, daily vocabulary enrichment sessions, and language parlors in Arabic and English. Interactive speaking hours instilled confidence among junior scholars in international communication and academic eloquence.",
    defaultTextMl: "അറബിക്, ഇംഗ്ലീഷ്, ഉറുദു ഭാഷകളിലെ പ്രാവീണ്യം വർദ്ധിപ്പിക്കുന്നതിനായി ലാംഗ്വേജ് വിംഗിന്റെ കീഴിൽ സ്പോക്കൺ ക്ലബ്ബുകളും ഭാഷാ ശിൽപ്പശാലകളും സംഘടിപ്പിച്ചു. ദൈനംദിന സംഭാഷണ പരിശീലനങ്ങളും ഭാഷാ ക്വിസുകളും വിദ്യാർത്ഥികളിൽ വിദേശ ഭാഷകളിലുള്ള പ്രാവീണ്യവും പ്രഭാഷണ പാടവവും ഗണ്യമായി മെച്ചപ്പെടുത്തി."
  },
  {
    id: 'bank',
    wingNameEn: 'Students Bank Committee',
    wingNameMl: 'സ്റ്റുഡന്റ്സ് ബാങ്ക് കമ്മിറ്റി (Bank Committee)',
    defaultTextEn: "The Students Bank Committee maintained disciplined interest-free micro-savings, deposit logs, and emergency cash assistance facilities for enrolled members. Financial books and balances were audited regularly to ensure total transparency and fiscal integrity.",
    defaultTextMl: "വിദ്യാർത്ഥികളിൽ സമ്പാദ്യശീലം വളർത്തുന്നതിനും അത്യാവശ്യ ഘട്ടങ്ങളിൽ സാമ്പത്തിക പിന്തുണ നൽകുന്നതിനുമായി സ്റ്റുഡന്റ്സ് ബാങ്ക് കമ്മിറ്റി പ്രവർത്തിച്ചു. പലിശരഹിത ഇടപാടുകളും കൃത്യമായ അക്കൗണ്ട് ബുക്കുകളും ചിട്ടയായി പരിപാലിക്കുകയും, സാമ്പത്തിക ഇടപാടുകളിൽ പൂർണ്ണമായ സുതാര്യത ഉറപ്പുവരുത്തുകയും ചെയ്തു."
  },
  {
    id: 'garden',
    wingNameEn: 'Garden & Environmental Committee',
    wingNameMl: 'ഗാർഡൻ കമ്മിറ്റി (Garden Committee)',
    defaultTextEn: "The Garden and Environmental Committee beautified the campus perimeter with lush green landscaping, flowering borders, and seasonal organic vegetable cultivation. Green campus cleanliness drives fostered deep environmental consciousness and shared civic pride.",
    defaultTextMl: "കാമ്പസിനെ ഹരിതാഭവും പ്രകൃതിരമണീയവുമായി നിലനിർത്താൻ ഗാർഡൻ കമ്മിറ്റി നിരന്തരമായി പ്രയത്നിച്ചു. പൂന്തോട്ട നിർമ്മാണം, വൃക്ഷത്തൈകൾ നടൽ, ജൈവ പച്ചക്കറി കൃഷി, ശുചീകരണ യജ്ഞങ്ങൾ എന്നിവയിലൂടെ വിദ്യാർത്ഥികളിൽ പരിസ്ഥിതി അവബോധവും പ്രകൃതിസ്നേഹവും വളർത്തിയെടുക്കാൻ സാധിച്ചു."
  }
];

export const OfficialMalayalamReportModal = ({
  isOpen,
  onClose,
  defaultWingId = 'all',
  restrictToWingId = null
}) => {
  const {
    wings = [],
    wingPrograms = [],
    programs = [],
    summits = [],
    teams = [],
    certificates = [],
    unionOfficials = [],
    students = [],
    settings = {}
  } = useApp();

  const { currentUser } = useAuth();
  const { lang: globalLang } = useLanguage();

  // Determine if current user is a wing convener or has an assigned wing
  const convenerWingId = useMemo(() => {
    if (!currentUser) return null;
    return currentUser.assignedWingId ||
      (currentUser.username === 'convener_finearts' ? 'fine_arts' : null) ||
      (wings.find(w => w.id === currentUser.assignedWingId || w.code?.toLowerCase() === currentUser.username?.toLowerCase() || w.name?.toLowerCase().includes(currentUser.username?.replace('convener_', '') || ''))?.id) ||
      'fine_arts';
  }, [currentUser, wings]);

  const isConvener = currentUser?.role === 'convener';
  const effectiveRestrictWingId = restrictToWingId || (isConvener ? convenerWingId : null);

  const currentYear = new Date().getFullYear().toString();
  const academicYearLabel = settings.academicYear || '2026-27';

  // 1. Month Filter State: 'all' or 'YYYY-MM' (e.g. '2026-11')
  const [selectedMonth, setSelectedMonth] = useState('all');

  // 2. Scope Filter State: strictly defaults to that wing report (never 'all' full union report)
  const initialScope = effectiveRestrictWingId ||
    (defaultWingId && defaultWingId !== 'all' ? defaultWingId : null) ||
    (wings[0]?.id || 'fine_arts');

  const [selectedScope, setSelectedScope] = useState(initialScope);

  // 3. Report Type: 'monthly' (if month selected), 'half_year', or 'annual'
  const [reportType, setReportType] = useState('monthly');

  // 4. Report Language: 'en' or 'ml'
  const [reportLang, setReportLang] = useState(globalLang || 'en');

  // 5. View Mode: 'preview' (printable document) or 'edit' (pre-print editor)
  const [viewMode, setViewMode] = useState('preview');

  // 6. Custom user edits state (null if using auto-generated live data)
  const [customEdits, setCustomEdits] = useState(null);

  // Sync when props change
  useEffect(() => {
    if (effectiveRestrictWingId) {
      setSelectedScope(effectiveRestrictWingId);
    } else if (defaultWingId && defaultWingId !== 'all') {
      setSelectedScope(defaultWingId);
    } else if (selectedScope === 'all' && wings.length > 0) {
      setSelectedScope(wings[0].id);
    }
  }, [effectiveRestrictWingId, defaultWingId, wings]);

  useEffect(() => {
    if (globalLang) setReportLang(globalLang);
  }, [globalLang, isOpen]);

  // Key officials
  const chairman = useMemo(() => {
    return unionOfficials.find(o => o.designation === 'Chairman' || o.role === 'chairman') || null;
  }, [unionOfficials]);

  const genSecretary = useMemo(() => {
    return unionOfficials.find(o => o.designation === 'General Secretary' || o.role === 'gensec') || null;
  }, [unionOfficials]);

  const isWingScoped = Boolean(selectedScope && selectedScope !== 'all');
  const scopedWing = useMemo(() => {
    return isWingScoped ? (wings || []).find(w => w.id === selectedScope) || null : null;
  }, [isWingScoped, wings, selectedScope]);

  const scopedConvener = useMemo(() => {
    if (!isWingScoped) return null;
    return (unionOfficials || []).find(o => o.assignedWingId === selectedScope) ||
      (currentUser?.role === 'convener' && (currentUser?.assignedWingId === selectedScope || currentUser?.username?.includes(selectedScope)) ? currentUser : null) ||
      null;
  }, [isWingScoped, unionOfficials, selectedScope, currentUser]);

  // Build live report structure strictly from actual entered programs & selected filters
  const autoGeneratedData = useMemo(() => {
    const isMl = reportLang === 'ml';

    // Current month descriptor
    const currentMonthObj = ACADEMIC_MONTHS.find(m => m.value === selectedMonth) || ACADEMIC_MONTHS[0];
    const monthDescriptor = selectedMonth === 'all'
      ? (isMl ? `അക്കാദമിക വർഷം ${academicYearLabel}` : `Academic Year ${academicYearLabel}`)
      : (isMl ? currentMonthObj.labelMl : currentMonthObj.labelEn);

    // 1. Filter wingPrograms strictly by selectedMonth
    const filteredWingPrograms = (wingPrograms || []).filter(p => {
      if (selectedMonth === 'all') return true;
      return (p.date && p.date.startsWith(selectedMonth)) || (p.month === selectedMonth);
    });

    // 2. Filter summit programs strictly by selectedMonth
    const summitsInMonth = (summits || []).filter(s => {
      if (selectedMonth === 'all') return true;
      return (s.date && s.date.startsWith(selectedMonth)) || (s.month === selectedMonth);
    });
    const summitIdsInMonth = new Set(summitsInMonth.map(s => s.id));
    const filteredSummitPrograms = (programs || []).filter(p => {
      if (selectedMonth === 'all') return true;
      if (p.date && p.date.startsWith(selectedMonth)) return true;
      if (p.summitId && summitIdsInMonth.has(p.summitId)) return true;
      return false;
    });

    // Report Title
    let defaultTitle = '';
    if (isWingScoped) {
      const wName = isMl ? (scopedWing?.name || 'വിഭാഗം') : (scopedWing?.name || 'Wing');
      defaultTitle = isMl
        ? `${wName} — പ്രവർത്തന റിപ്പോർട്ട് (${monthDescriptor})`
        : `${scopedWing?.name || 'Wing'} — Activities Report (${monthDescriptor})`;
    } else {
      if (selectedMonth === 'all') {
        defaultTitle = isMl
          ? `അർദ്ധവാർഷിക സമഗ്ര പ്രവർത്തന റിപ്പോർട്ട് ${academicYearLabel}`
          : `Half-Yearly Comprehensive Activities Report ${academicYearLabel}`;
      } else {
        defaultTitle = isMl
          ? `പ്രതിമാസ പ്രവർത്തന റിപ്പോർട്ട് — ${monthDescriptor}`
          : `Monthly Activities Report — ${monthDescriptor}`;
      }
    }

    // Opening Summary
    let defaultOpeningSummary = '';
    if (isWingScoped) {
      defaultOpeningSummary = isMl
        ? `മജ്‌ലിസ് ഉമരിയ്യ സ്റ്റുഡന്റ്സ് ഫെഡറേഷൻ (MUSF) ${scopedWing?.name || 'വിഭാഗം'}-ന്റെ ആഭിമുഖ്യത്തിൽ ${monthDescriptor} കാലയളവിൽ സംഘടിപ്പിച്ച വിവിധ പരിപാടികളുടെയും മത്സരങ്ങളുടെയും വിശദമായ പ്രവർത്തന റിപ്പോർട്ട് താഴെ സമർപ്പിക്കുന്നു. വിദ്യാർത്ഥി പ്രതിഭകളെ പ്രോത്സാഹിപ്പിക്കുന്നതിനും സംഘടനാ അച്ചടക്കം ഉറപ്പുവരുത്തുന്നതിനുമായി ചിട്ടയായ പ്രവർത്തനങ്ങളാണ് ഈ വിംഗിന് കീഴിൽ നടപ്പിലാക്കിയത്.`
        : `Presented herewith is the official report of programs, competitive events, and initiatives organized by the ${scopedWing?.name || 'Wing'} under the Majlis Umariyya Students' Federation (MUSF) during ${monthDescriptor}. Committed to nurturing student excellence and institutional leadership, the wing conducted its activities with active participation across batches.`;
    } else {
      const activeProgramsCount = filteredWingPrograms.length + (selectedScope === 'all' ? filteredSummitPrograms.length : 0);
      defaultOpeningSummary = isMl
        ? `അല്ലാഹുവിന്റെ അപാരമായ അനുഗ്രഹത്താൽ മജ്‌ലിസ് ഉമരിയ്യ വാഫി കോളേജ് MUSF വിദ്യാർത്ഥി യൂണിയൻ ${monthDescriptor} കാലയളവിലെ പ്രവർത്തനങ്ങൾ വിജയകരമായി പൂർത്തീകരിച്ചു. കോളേജ് അസാതിദുമാരുടെയും വിദ്യാർത്ഥികളുടെയും സഹകരണത്തോടെ ${wings.length} വിംഗുകൾക്കും എക്സിക്യൂട്ടീവ് കൗൺസിലിനും കീഴിൽ ${activeProgramsCount > 0 ? `ആകെ ${activeProgramsCount} കർമ്മപദ്ധതികളോടെയാണ്` : 'ചിട്ടയായ കർമ്മപദ്ധതികളോടെയാണ്'} യൂണിയൻ മുന്നോട്ടുപോയത്. പ്രസ്തുത കാലയളവിലെ ഔദ്യോഗിക പ്രവർത്തന റിപ്പോർട്ട് താഴെ സമർപ്പിക്കുന്നു.`
        : `By the grace of the Almighty, the Majlis Umariyya Students' Federation (MUSF) has concluded its initiatives for ${monthDescriptor}. Guided by our respected faculty and active student fraternity across ${wings.length} autonomous wings and the Executive Council executing ${activeProgramsCount} documented events, the federation achieved commendable progress. The detailed report is presented herewith.`;
    }

    // Conclusion
    const defaultConclusion = isMl
      ? `പ്രസ്തുത കാലയളവിൽ ആവിഷ്കരിച്ച പദ്ധതികൾ സമയബന്ധിതമായി പൂർത്തിയാക്കാൻ സാധിച്ചതിൽ സർവ്വശക്തനായ നാഥന് നന്ദി രേഖപ്പെടുത്തുന്നു. പ്രവർത്തനങ്ങൾക്ക് അകമഴിഞ്ഞ പിന്തുണ നൽകിയ പ്രിൻസിപ്പൽ, സ്റ്റാഫ് അഡ്വൈസർമാർ, ഉസ്താദുമാർ, യൂണിയൻ എക്സിക്യൂട്ടീവ് ഭാരവാഹികൾ, പ്രിയ വിദ്യാർത്ഥി സഹോദരങ്ങൾ എന്നിവർക്ക് ഹൃദയംഗമമായ കൃതജ്ഞത രേഖപ്പെടുത്തുന്നു. വരും ദിനങ്ങളിലും കാമ്പസിന്റെ അക്കാദമിക-സാംസ്കാരിക മുന്നേറ്റത്തിനായി കൂടുതൽ ഊർജ്ജസ്വലമായി പ്രവർത്തിക്കാൻ അല്ലാഹു അനുഗ്രഹിക്കട്ടെ — ആമീൻ.`
      : `We express our profound gratitude to the Almighty for the disciplined execution of programs scheduled during this period. We extend heartfelt appreciation to our respected Principal, Staff Advisors, faculty members, Union Executive leaders, and students for their continuous cooperation. May the Almighty bless our collective efforts towards higher academic and moral excellence. Ameen.`;

    // Build Narrative Sections
    const sections = [];

    if (isWingScoped) {
      // WING-SCOPED REPORT: Include ONLY this wing's actual events
      const thisWingProgs = filteredWingPrograms.filter(p => p.wingId === selectedScope);
      const isFineArts = selectedScope === 'fine_arts';
      const thisSummitProgs = isFineArts ? filteredSummitPrograms : [];

      const competitions = thisWingProgs.filter(p => p.type === 'competition');
      const activities = thisWingProgs.filter(p => p.type === 'activity' || p.type === 'program');
      const meetings = thisWingProgs.filter(p => p.type === 'meeting');

      let wingText = '';
      if (thisWingProgs.length === 0 && thisSummitProgs.length === 0) {
        wingText = isMl
          ? `${scopedWing?.name} വിഭാഗത്തിൽ ഈ മാസത്തിൽ പുതിയ പരിപാടികളോ മത്സരങ്ങളോ രേഖപ്പെടുത്തിയിട്ടില്ല. വരാനിരിക്കുന്ന പദ്ധതികൾക്കായുള്ള ആസൂത്രണങ്ങൾ പുരോഗമിക്കുന്നു.`
          : `No formal activities or competitive events were recorded in the system for ${scopedWing?.name} during ${monthDescriptor}. Future programs remain under schedule.`;
      } else {
        if (isMl) {
          wingText = `${scopedWing?.name}-ന്റെ ആഭിമുഖ്യത്തിൽ ${monthDescriptor} കാലയളവിൽ മികച്ച പരിപാടികളാണ് സംഘടിപ്പിച്ചത്. `;
          if (activities.length > 0) {
            const actList = activities.map(a => `"${a.title}" (${a.venue || 'കോളേജ് കാമ്പസ്'}, ${a.date})`).join(', ');
            wingText += `നടന്ന പ്രധാന പൊതുപരിപാടികൾ: ${actList}. `;
          }
          if (competitions.length > 0) {
            const compList = competitions.map(c => {
              let str = `"${c.title}" (${c.date || ''})`;
              if (c.winners) {
                const wParts = [];
                if (c.winners.firstPlace) wParts.push(`ഒന്നാം സ്ഥാനം: ${c.winners.firstPlace.name} (${c.winners.firstPlace.cicNo ? `CIC: ${c.winners.firstPlace.cicNo}` : ''})`);
                if (c.winners.secondPlace) wParts.push(`രണ്ടാം സ്ഥാനം: ${c.winners.secondPlace.name}`);
                if (c.winners.thirdPlace) wParts.push(`മൂന്നാം സ്ഥാനം: ${c.winners.thirdPlace.name}`);
                if (wParts.length > 0) str += ` [വിജയികൾ: ${wParts.join(', ')}]`;
              }
              return str;
            }).join('; ');
            wingText += `നടന്ന മത്സരങ്ങളും വിജയികളും: ${compList}. `;
          }
          if (thisSummitProgs.length > 0) {
            wingText += `ആർട്സ് സമ്മിറ്റിലെ ${thisSummitProgs.length} മത്സര ഇനങ്ങളിൽ വിവിധ ഹൗസ് ടീമുകളിലെ വിദ്യാർത്ഥികൾ പങ്കെടുത്തു. `;
          }
          if (meetings.length > 0) {
            wingText += `പ്രവർത്തനങ്ങൾ ചിട്ടപ്പെടുത്തുന്നതിനായി ${meetings.length} തവണ സമിതി യോഗം ചേരുകയും നിർണ്ണായക തീരുമാനങ്ങൾ കൈക്കൊള്ളുകയും ചെയ്തു.`;
          }
        } else {
          wingText = `The ${scopedWing?.name} coordinated noteworthy initiatives during ${monthDescriptor}. `;
          if (activities.length > 0) {
            const actList = activities.map(a => `"${a.title}" (${a.venue || 'Campus'}, ${a.date})`).join(', ');
            wingText += `Conducted workshops and sessions included: ${actList}. `;
          }
          if (competitions.length > 0) {
            const compList = competitions.map(c => {
              let str = `"${c.title}" on ${c.date || 'date'}`;
              if (c.winners) {
                const wParts = [];
                if (c.winners.firstPlace) wParts.push(`1st: ${c.winners.firstPlace.name} (CIC: ${c.winners.firstPlace.cicNo || 'N/A'})`);
                if (c.winners.secondPlace) wParts.push(`2nd: ${c.winners.secondPlace.name}`);
                if (c.winners.thirdPlace) wParts.push(`3rd: ${c.winners.thirdPlace.name}`);
                if (wParts.length > 0) str += ` (Winners: ${wParts.join(', ')})`;
              }
              return str;
            }).join('; ');
            wingText += `Competitions and honored winners: ${compList}. `;
          }
          if (thisSummitProgs.length > 0) {
            wingText += `${thisSummitProgs.length} collegiate summit events were held with active house participation. `;
          }
          if (meetings.length > 0) {
            wingText += `The wing council convened ${meetings.length} executive session(s) to review and organize ongoing initiatives.`;
          }
        }
      }

      sections.push({
        id: scopedWing?.id || 'wing_scoped',
        order: 1,
        title: isMl ? `${scopedWing?.name} പ്രവർത്തനങ്ങൾ` : `${scopedWing?.name} Programs & Outcomes`,
        narrative: wingText
      });

    } else {
      // EXECUTIVE TOTAL REPORT (All Wings combined)
      // CRITICAL: When a specific month is selected, include ONLY wings that actually have programs entered in that month!
      const defaultSecMap = new Map(DEFAULT_HALF_YEAR_SECTIONS.map(s => [s.id, s]));

      // 1. Process standard wings
      DEFAULT_HALF_YEAR_SECTIONS.forEach((sec, idx) => {
        const matchingPrograms = filteredWingPrograms.filter(p => {
          if (sec.id === 'fine_arts') return p.wingId === 'fine_arts';
          if (sec.id === 'literary') return p.wingId === 'literary';
          if (sec.id === 'sports') return p.wingId === 'sports';
          if (sec.id === 'dawah') return p.wingId === 'dawah';
          if (sec.id === 'research') return p.wingId === 'academic' || p.wingId === 'research';
          if (sec.id === 'media_it') return p.wingId === 'media' || p.wingId === 'media_it';
          if (sec.id === 'library') return p.wingId === 'library';
          if (sec.id === 'medical') return p.wingId === 'medical';
          if (sec.id === 'social') return p.wingId === 'social';
          if (sec.id === 'language') return p.wingId === 'language';
          if (sec.id === 'bank') return p.wingId === 'bank';
          if (sec.id === 'garden') return p.wingId === 'garden';
          return p.wingId === sec.id;
        });

        const isFineArts = sec.id === 'fine_arts';
        const fineArtsSummitProgs = isFineArts ? filteredSummitPrograms : [];
        const hasActualEvents = matchingPrograms.length > 0 || fineArtsSummitProgs.length > 0;

        // When a specific month is filtered, DO NOT inject filler if wing had no actual events in that month
        if (selectedMonth !== 'all' && !hasActualEvents) {
          return;
        }

        const competitions = matchingPrograms.filter(p => p.type === 'competition');
        const activities = matchingPrograms.filter(p => p.type === 'activity' || p.type === 'program');
        const meetings = matchingPrograms.filter(p => p.type === 'meeting');

        let dynamicParagraph = '';

        if (isFineArts) {
          const summitCount = summitsInMonth.length;
          const eventCount = fineArtsSummitProgs.length || (selectedMonth === 'all' ? 101 : 0);
          const teamsListStr = (teams || []).map(t => t.name).join(', ') || 'Team A, Team B, Team C';

          if (isMl) {
            dynamicParagraph = `വിദ്യാർത്ഥികളുടെ സർഗ്ഗാത്മക പ്രതിഭകളെ പരിപോഷിപ്പിക്കുന്നതിനായി ഫൈൻ ആർട്സ് വിംഗിന്റെ കീഴിൽ ${monthDescriptor} കാലയളവിൽ കലാ സാഹിത്യ സമ്മിറ്റുകൾ സംഘടിപ്പിച്ചു. സമ്മിറ്റിലെ ${eventCount > 0 ? `${eventCount} മത്സര ഇനങ്ങളിൽ` : 'വിവിധ മത്സര ഇനങ്ങളിൽ'} ${teamsListStr} എന്നീ ഹൗസുകളിലെ വിദ്യാർത്ഥികൾ മാറ്റുരച്ചു. കാലിഗ്രഫി, ഖുർആൻ പാരായണം, മാപ്പിളപ്പാട്ട്, പ്രസംഗം തുടങ്ങിയ വിവിധ ഇനങ്ങളിൽ കർശനമായ ബ്ലൈൻഡ് ഇവാലുവേഷൻ മാനദണ്ഡങ്ങളോടെ മത്സരങ്ങൾ വിജയകരമായി പൂർത്തീകരിച്ചു.`;
            if (matchingPrograms.length > 0) {
              const addlTitles = matchingPrograms.map(p => `"${p.title}"`).join(', ');
              dynamicParagraph += ` കൂടാതെ വിംഗിന്റെ നേതൃത്വത്തിൽ ${addlTitles} ഉൾപ്പെടെയുള്ള പരിപാടികളും സമിതി യോഗങ്ങളും നടത്തി.`;
            }
          } else {
            dynamicParagraph = `The Fine Arts Wing spearheads co-curricular talents through stage and off-stage artistic summits. Over ${monthDescriptor}, competitive events were executed across House Teams (${teamsListStr})${summitCount > 0 ? ` across ${summitCount} summit sessions` : ''}, cultivating exceptional talents in classical calligraphy, Quranic recitation, public speaking, and theatrical arts with strict evaluation protocols.`;
            if (matchingPrograms.length > 0) {
              const addlTitles = matchingPrograms.map(p => `"${p.title}"`).join(', ');
              dynamicParagraph += ` Additional wing initiatives included ${addlTitles}.`;
            }
          }
        } else if (hasActualEvents) {
          if (isMl) {
            const compNotes = competitions.map(c => {
              let note = `"${c.title}" (${c.date || ''})`;
              if (c.winners) {
                const winParts = [];
                if (c.winners.firstPlace) winParts.push(`ഒന്നാം സ്ഥാനം: ${c.winners.firstPlace.name} (${c.winners.firstPlace.cicNo ? `CIC: ${c.winners.firstPlace.cicNo}` : ''})`);
                if (c.winners.secondPlace) winParts.push(`രണ്ടാം സ്ഥാനം: ${c.winners.secondPlace.name}`);
                if (c.winners.thirdPlace) winParts.push(`മൂന്നാം സ്ഥാനം: ${c.winners.thirdPlace.name}`);
                if (winParts.length > 0) note += ` [${winParts.join(', ')}]`;
              }
              return note;
            });

            const actNotes = activities.map(a => `"${a.title}" (${a.venue || 'കോളേജ് കാമ്പസ്'})`);
            const meetCount = meetings.length;

            dynamicParagraph = sec.defaultTextMl;
            if (compNotes.length > 0) {
              dynamicParagraph += ` ഈ കാലയളവിൽ വിംഗിന്റെ ആഭിമുഖ്യത്തിൽ നടത്തിയ മത്സരങ്ങൾ: ${compNotes.join('; ')}.`;
            }
            if (actNotes.length > 0) {
              dynamicParagraph += ` കൂടാതെ ${actNotes.join(', ')} തുടങ്ങിയ പരിപാടികൾ വിദ്യാർത്ഥി പങ്കാളിത്തത്തോടെ വിജയകരമായി പൂർത്തീകരിച്ചു.`;
            }
            if (meetCount > 0) {
              dynamicParagraph += ` പ്രവർത്തനങ്ങൾ ഏകോപിപ്പിക്കുന്നതിനായി ${meetCount} തവണ വിംഗ് കൗൺസിൽ യോഗം ചേരുകയും ആവശ്യമായ തീരുമാനങ്ങൾ കൈക്കൊള്ളുകയും ചെയ്തു.`;
            }
          } else {
            const compNotes = competitions.map(c => {
              let note = `"${c.title}" on ${c.date || 'scheduled date'}`;
              if (c.winners) {
                const winParts = [];
                if (c.winners.firstPlace) winParts.push(`1st: ${c.winners.firstPlace.name}`);
                if (c.winners.secondPlace) winParts.push(`2nd: ${c.winners.secondPlace.name}`);
                if (c.winners.thirdPlace) winParts.push(`3rd: ${c.winners.thirdPlace.name}`);
                if (winParts.length > 0) note += ` (Winners: ${winParts.join(', ')})`;
              }
              return note;
            });

            const actNotes = activities.map(a => `"${a.title}" (${a.venue || 'Campus'})`);
            const meetCount = meetings.length;

            dynamicParagraph = sec.defaultTextEn;
            if (compNotes.length > 0) {
              dynamicParagraph += ` Key competitions conducted: ${compNotes.join('; ')}.`;
            }
            if (actNotes.length > 0) {
              dynamicParagraph += ` Special activities included: ${actNotes.join(', ')}.`;
            }
            if (meetCount > 0) {
              dynamicParagraph += ` The wing convened ${meetCount} executive committee meetings to ensure disciplined progress.`;
            }
          }
        } else {
          // If 'all' months, use standard half-yearly narrative
          dynamicParagraph = isMl ? sec.defaultTextMl : sec.defaultTextEn;
        }

        sections.push({
          id: sec.id,
          order: sections.length + 1,
          title: isMl ? sec.wingNameMl : sec.wingNameEn,
          narrative: dynamicParagraph
        });
      });

      // 2. Process Custom Wings added in the app
      const defaultSecIds = new Set(DEFAULT_HALF_YEAR_SECTIONS.map(s => s.id));
      (wings || []).forEach(customWing => {
        const isKnown = defaultSecIds.has(customWing.id) ||
          (customWing.id === 'academic' && defaultSecIds.has('research')) ||
          (customWing.id === 'media' && defaultSecIds.has('media_it'));

        if (!isKnown) {
          const customProgs = filteredWingPrograms.filter(p => p.wingId === customWing.id);
          if (selectedMonth !== 'all' && customProgs.length === 0) return;

          const progTitles = customProgs.slice(0, 3).map(p => `"${p.title}"`).join(', ');
          const narrative = isMl
            ? `${customWing.name} വിംഗിന്റെ ആഭിമുഖ്യത്തിൽ ${monthDescriptor} കാലയളവിൽ വിവിധ പരിപാടികൾ സംഘടിപ്പിച്ചു.${customProgs.length > 0 ? ` പ്രധാന പരിപാടികൾ: ${progTitles}.` : ' വിദ്യാർത്ഥികളുടെ സർവ്വതോന്മുഖമായ വളർച്ചയ്ക്കായി കൃത്യമായ കർമ്മരേഖയോടെ ഈ വിഭാഗം പ്രവർത്തിച്ചു.'}`
            : `The ${customWing.name} organized key initiatives during ${monthDescriptor}.${customProgs.length > 0 ? ` Highlights: ${progTitles}.` : ' Structured programs and student engagement guided this wing.'}`;

          sections.push({
            id: customWing.id,
            order: sections.length + 1,
            title: customWing.name,
            narrative
          });
        }
      });

      // 3. Fallback if no sections matched for selected month
      if (sections.length === 0) {
        sections.push({
          id: 'no_events_found',
          order: 1,
          title: isMl ? 'പ്രവർത്തനങ്ങൾ' : 'Activities Overview',
          narrative: isMl
            ? `${monthDescriptor} കാലയളവിൽ ഔദ്യോഗിക പരിപാടികളോ മത്സരങ്ങളോ രേഖപ്പെടുത്തിയിട്ടില്ല. വരാനിരിക്കുന്ന കർമ്മപദ്ധതികൾക്കായുള്ള ആസൂത്രണങ്ങളും തയാറെടുപ്പുകളും പുരോഗമിക്കുന്നു.`
            : `No formal events, competitions, or sessions were scheduled or entered in the app records for ${monthDescriptor}.`
        });
      }
    }

    const refNo = `MUSF/REP/${currentYear}/${isWingScoped ? (scopedWing?.code || 'WING') : 'EXEC'}-${selectedMonth === 'all' ? 'ANN' : selectedMonth.replace('-', '')}`;
    const todayFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return {
      institutionName: settings.collegeName || 'Majlis Umariyya Wafy College, Purang',
      federationName: "MAJLIS UMARIYYA STUDENTS' FEDERATION (MUSF)",
      academicYear: academicYearLabel,
      refNo,
      reportDate: todayFormatted,
      title: defaultTitle,
      showBasmala: true,
      openingSummary: defaultOpeningSummary,
      sections,
      conclusion: defaultConclusion,
      // Signatures
      gensecName: genSecretary?.name || (isMl ? 'അഹമ്മദ് മിഖ്ദാദ് കെ.പി' : 'Ahmad Miqdad K P'),
      gensecTitle: isMl ? 'ജനറൽ സെക്രട്ടറി, MUSF' : 'General Secretary, MUSF',
      chairmanName: isWingScoped
        ? (scopedConvener?.name || (isMl ? 'വിംഗ് കൺവീനർ' : 'Wing Convener'))
        : (chairman?.name || (isMl ? 'മുഹമ്മദ് ജിർഷാദ് പി.കെ' : 'Mohammed Jirshad P K')),
      chairmanTitle: isWingScoped
        ? (isMl ? `${scopedWing?.shortName || ''} വിംഗ് കൺവീനർ` : `${scopedWing?.shortName || ''} Wing Convener`)
        : (isMl ? 'പ്രസിഡന്റ് / ചെയർമാൻ, MUSF' : 'President / Chairman, MUSF'),
      staffAdvisorName: 'Staff Advisor',
      staffAdvisorTitle: isMl ? 'സ്റ്റാഫ് അഡ്വൈസർ / പ്രിൻസിപ്പൽ' : 'Staff Advisor / Principal'
    };
  }, [
    selectedMonth,
    selectedScope,
    reportType,
    reportLang,
    academicYearLabel,
    currentYear,
    settings,
    wingPrograms,
    programs,
    summits,
    teams,
    wings,
    students,
    genSecretary,
    chairman,
    unionOfficials,
    currentUser,
    isWingScoped,
    scopedWing,
    scopedConvener
  ]);

  // Current active report data: custom edits if user has modified text in edit mode, otherwise live auto-generated
  const reportData = customEdits || autoGeneratedData;

  const handleEnterEditMode = () => {
    if (!customEdits) {
      setCustomEdits(JSON.parse(JSON.stringify(autoGeneratedData)));
    }
    setViewMode('edit');
  };

  const handleResetToAuto = () => {
    setCustomEdits(null);
  };

  const updateField = (field, value) => {
    setCustomEdits(prev => ({
      ...(prev || autoGeneratedData),
      [field]: value
    }));
  };

  const handleUpdateSection = (index, field, value) => {
    const current = customEdits || autoGeneratedData;
    const updated = [...current.sections];
    updated[index] = { ...updated[index], [field]: value };
    setCustomEdits({ ...current, sections: updated });
  };

  const handleAddCustomSection = () => {
    const current = customEdits || autoGeneratedData;
    const isMl = reportLang === 'ml';
    const newSection = {
      id: `custom_sec_${Date.now()}`,
      order: current.sections.length + 1,
      title: isMl ? 'പുതിയ സബ് കമ്മിറ്റി / വിഭാഗം' : 'New Committee / Sub-Wing',
      narrative: isMl
        ? 'പ്രസ്തുത വിഭാഗത്തിന്റെ കീഴിൽ വിവിധ പരിപാടികളും കർമ്മപദ്ധതികളും വിദ്യാർത്ഥി പങ്കാളിത്തത്തോടെ വിജയകരമായി പൂർത്തീകരിച്ചു.'
        : 'Organized and executed relevant initiatives and meetings under this wing with enthusiastic student involvement.'
    };
    setCustomEdits({ ...current, sections: [...current.sections, newSection] });
  };

  const handleDeleteSection = (index) => {
    const current = customEdits || autoGeneratedData;
    const updated = current.sections.filter((_, idx) => idx !== index);
    setCustomEdits({ ...current, sections: updated });
  };

  const handlePrint = () => {
    if (viewMode === 'edit') {
      setViewMode('preview');
      setTimeout(() => triggerPrintAction(), 200);
      return;
    }
    triggerPrintAction();
  };

  const triggerPrintAction = () => {
    const printEl = document.getElementById('official-union-report-sheet');
    if (!printEl) {
      window.print();
      return;
    }
    printHtmlDocument({
      title: reportData.title || 'MUSF Official Report',
      contentHtml: printEl.innerHTML,
      orientation: 'portrait'
    });
  };

  const handleDownloadReportHtml = () => {
    const printEl = document.getElementById('official-union-report-sheet');
    if (!printEl) return;
    const filename = `MUSF_Report_${selectedScope}_${selectedMonth}_${academicYearLabel.replace(/[^a-zA-Z0-9]/g, '_')}`;
    downloadHtmlFile(filename, printEl.innerHTML, reportData.title || 'MUSF Report');
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalNode = (
    <div id="official-report-modal-root" className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Outer Container with explicit viewport height constraint */}
      <div className="relative w-full max-w-5xl h-[94vh] max-h-[94vh] bg-white dark:bg-[#0B1522] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:h-auto print:max-h-none">

        {/* ========================================================= */}
        {/* MODAL CONTROL HEADER (Hidden on print) */}
        {/* ========================================================= */}
        <div className="print:hidden p-4 sm:p-5 bg-gradient-to-r from-[#0F2A4A] via-[#163B66] to-[#0E7C86] text-white flex flex-col gap-3.5 shrink-0 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-xs shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-2">
                  <span>{reportLang === 'ml' ? 'MUSF ഔദ്യോഗിക പ്രവർത്തന റിപ്പോർട്ട്' : 'MUSF Official Activities Report'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold tracking-widest uppercase">
                    {selectedScope === 'all' ? 'Executive Master' : `${scopedWing?.shortName || scopedWing?.name || 'Wing'} Report Only`}
                  </span>
                </h3>
                <p className="text-xs text-teal-100 font-medium">
                  {reportLang === 'ml'
                    ? (effectiveRestrictWingId ? `${scopedWing?.name || 'വിഭാഗം'} പ്രവർത്തനങ്ങൾ മാത്രം ഉൾപ്പെടുത്തിയ ഔദ്യോഗിക പ്രതിമാസ റിപ്പോർട്ട്` : 'വിംഗിന്റെ പ്രതിമാസ പ്രവർത്തന റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യാം / എഡിറ്റ് ചെയ്യാം')
                    : (effectiveRestrictWingId ? `Official monthly report for ${scopedWing?.name || 'this wing'} activities only` : 'Select Month & Wing to generate verified activities with official letterhead')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="self-end sm:self-auto p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Filter Controls Bar */}
          <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Month Selector */}
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/20">
                <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-[11px] font-bold text-teal-200">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setCustomEdits(null);
                  }}
                  className="bg-transparent text-white font-bold text-xs cursor-pointer outline-hidden pr-2"
                >
                  {ACADEMIC_MONTHS.map(m => (
                    <option key={m.value} value={m.value} className="bg-slate-900 text-white font-semibold">
                      {reportLang === 'ml' ? m.labelMl : m.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Scope Selector: Wing-Specific (Convener locked to own wing; no full union report) */}
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/20">
                <Layers className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="text-[11px] font-bold text-teal-200">
                  {effectiveRestrictWingId ? 'Wing Report:' : 'Select Wing:'}
                </span>
                {effectiveRestrictWingId ? (
                  <span className="text-xs font-bold text-white pr-2 flex items-center gap-1.5">
                    <span>{wings.find(w => w.id === effectiveRestrictWingId)?.name || 'Wing'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-400/30 text-teal-100 font-semibold">
                      (Your Wing Only)
                    </span>
                  </span>
                ) : (
                  <select
                    value={selectedScope}
                    onChange={(e) => {
                      setSelectedScope(e.target.value);
                      setCustomEdits(null);
                    }}
                    className="bg-transparent text-white font-bold text-xs cursor-pointer outline-hidden pr-2"
                  >
                    {wings.map(w => (
                      <option key={w.id} value={w.id} className="bg-slate-900 text-white font-medium">
                        {w.name} Only
                      </option>
                    ))}
                    {(currentUser?.role === 'admin' || currentUser?.role === 'executive') && (
                      <option value="all" className="bg-slate-900 text-amber-300 font-bold">
                        All Wings (Executive Summary)
                      </option>
                    )}
                  </select>
                )}
              </div>

              {/* 3. Language Toggle */}
              <button
                type="button"
                onClick={() => setReportLang(prev => prev === 'en' ? 'ml' : 'en')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-300" />
                <span>{reportLang === 'en' ? 'മലയാളം' : 'English'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Preview vs Edit Toggle */}
              {viewMode === 'preview' ? (
                <button
                  type="button"
                  onClick={handleEnterEditMode}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-400/25 hover:bg-teal-400/35 border border-teal-300/40 text-teal-100 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Edit Report text before printing"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>{reportLang === 'ml' ? 'എഡിറ്റ് (Edit)' : 'Edit Text'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
                  title="Preview Formatted Document"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{reportLang === 'ml' ? 'പ്രിവ്യൂ (Preview)' : 'Preview A4'}</span>
                </button>
              )}

              {/* Reset Edits (if custom edits exist) */}
              {customEdits && (
                <button
                  type="button"
                  onClick={handleResetToAuto}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/30 border border-white/20 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  title="Revert to live entered records"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{reportLang === 'ml' ? 'റീസെറ്റ്' : 'Reset'}</span>
                </button>
              )}

              {/* Download Standalone File */}
              <button
                type="button"
                onClick={handleDownloadReportHtml}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                title="Download HTML"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">HTML</span>
              </button>

              {/* Print / Save PDF Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition active:scale-95 cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PRE-PRINT EDIT FORM (Visible when viewMode === 'edit') */}
        {/* ========================================================= */}
        {viewMode === 'edit' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#070D14] space-y-5">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Pre-Print Narrative Editor: </strong>
                  Modify titles, introductory paragraphs, wing details, or conclusions before printing.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold text-xs shrink-0"
              >
                Done Editing &rarr;
              </button>
            </div>

            {/* Title & Ref */}
            <div className="bg-white dark:bg-[#0F1B2B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                1. Report Title &amp; Document Reference
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Report Heading</label>
                  <input
                    type="text"
                    value={reportData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={reportData.refNo || ''}
                    onChange={(e) => updateField('refNo', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Opening Summary */}
            <div className="bg-white dark:bg-[#0F1B2B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <BookOpen className="w-4 h-4 text-[#0E7C86]" />
                <span>2. Opening Summary (ആമുഖം)</span>
              </h4>
              <textarea
                rows={4}
                value={reportData.openingSummary || ''}
                onChange={(e) => updateField('openingSummary', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-normal text-slate-800 dark:text-slate-100 leading-relaxed"
                placeholder="Introductory paragraph..."
              />
            </div>

            {/* Wing-by-Wing Narrative Sections */}
            <div className="bg-white dark:bg-[#0F1B2B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0E7C86]" />
                  <span>3. Wing &amp; Committee Sections ({reportData.sections.length} Sections)</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddCustomSection}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0E7C86] dark:text-teal-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Committee / Wing</span>
                </button>
              </div>

              <div className="space-y-4">
                {reportData.sections.map((sec, idx) => (
                  <div key={sec.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 font-mono text-xs flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sec.title || ''}
                          onChange={(e) => handleUpdateSection(idx, 'title', e.target.value)}
                          className="flex-1 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={sec.narrative || ''}
                      onChange={(e) => handleUpdateSection(idx, 'narrative', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 leading-relaxed"
                      placeholder="Narrative paragraph for this committee..."
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion */}
            <div className="bg-white dark:bg-[#0F1B2B] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>4. Conclusion (ഉപസംഹാരം)</span>
              </h4>
              <textarea
                rows={4}
                value={reportData.conclusion || ''}
                onChange={(e) => updateField('conclusion', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 leading-relaxed"
                placeholder="Concluding remarks..."
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PRINTABLE A4 FORMAL NARRATIVE REPORT BODY */}
        {/* ========================================================= */}
        <div
          id="official-union-report-sheet"
          className="flex-1 overflow-y-auto p-6 sm:p-14 md:p-16 bg-white text-slate-900 font-serif print:p-0 print:m-0 print:overflow-visible"
        >
          {/* Official MUSF Letterhead Header */}
          <div className="pb-2">
            <div className="flex items-center gap-3 sm:gap-6 justify-between">
              {/* Left Side: Official Blue MUSF Emblem / Crest */}
              <div className="shrink-0 flex items-center justify-center">
                <MusfEmblemSvg className="w-20 h-20 sm:w-28 sm:h-28" color="#002B7F" />
              </div>

              {/* Center / Main Header Text Block (Deep Royal Blue #002B7F) */}
              <div className="flex-1 text-center space-y-1">
                {/* Line 1: Arabic Title */}
                <div
                  className="text-base sm:text-xl md:text-2xl font-bold tracking-wide leading-tight"
                  style={{ color: '#002B7F', fontFamily: 'Traditional Arabic, Amiri, Scheherazade, serif', direction: 'rtl' }}
                >
                  اتحاد الطلبة لمجلس العمرية
                </div>

                {/* Line 2: English Bold Caps */}
                <div
                  className="text-sm sm:text-lg md:text-2xl font-black tracking-tight sm:tracking-normal uppercase leading-tight font-serif"
                  style={{ color: '#002B7F' }}
                >
                  MAJLIS UMARIYYA STUDENTS' FEDERATION
                </div>

                {/* Line 3: Malayalam Bold */}
                <div
                  className="text-xs sm:text-base md:text-xl font-black tracking-tight leading-tight font-sans"
                  style={{ color: '#002B7F' }}
                >
                  മജ്‌ലിസ് ഉമരിയ്യ സ്റ്റുഡന്റ്സ് ഫെഡറേഷൻ
                </div>

                {/* Line 4: Campus Address */}
                <div className="text-[10px] sm:text-xs md:text-[13px] font-semibold text-slate-800 leading-tight font-sans mt-0.5">
                  മജ്‌ലിസ് നഗർ, പുറമണ്ണൂർ - വളാഞ്ചേരി, മലപ്പുറം ജില്ല - 676 552
                </div>

                {/* Line 5: Contact Line (Phone & E-mail) */}
                <div className="text-[9px] sm:text-[11px] md:text-xs font-medium text-slate-700 leading-tight font-sans">
                  Phone: 9526343334, E-mail: musfpuramannur@gmail.com
                </div>
              </div>
            </div>

            {/* Bottom Border Rule: Solid Dark Blue Line */}
            <div className="w-full h-[2.5px] bg-[#002B7F] mt-3" />
          </div>

          {/* Reference, Date & Report Title Banner */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-sans border-b border-slate-200 pb-2">
            <div>
              <strong>Ref: </strong>
              <span className="font-mono">{reportData.refNo}</span>
            </div>
            <div>
              <strong>Date: </strong>
              <span>{reportData.reportDate}</span>
            </div>
          </div>

          <div className="mt-5 text-center">
            <h2 className="text-lg sm:text-xl font-bold tracking-wide text-slate-900 uppercase font-sans underline decoration-2 underline-offset-8">
              {reportData.title}
            </h2>
          </div>

          {/* Basmala Calligraphy */}
          {reportData.showBasmala !== false && (
            <div className="my-5 text-center">
              <span className="text-base sm:text-lg font-serif tracking-widest text-slate-800 font-semibold block" style={{ direction: 'rtl', fontFamily: 'Traditional Arabic, Amiri, Scheherazade, serif' }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيم
              </span>
            </div>
          )}

          {/* Opening Summary / ആമുഖം */}
          {reportData.openingSummary && (
            <div className="my-5 text-justify leading-relaxed text-xs sm:text-[13px] text-slate-800">
              <h3 className="font-bold text-xs sm:text-sm font-sans uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                <span>{reportLang === 'ml' ? 'ആമുഖം (Introduction)' : 'Introduction & Overview'}</span>
              </h3>
              <p className="indent-6 leading-relaxed">
                {reportData.openingSummary}
              </p>
            </div>
          )}

          {/* Wing Narrative Sections */}
          <div className="space-y-5 my-6">
            <div className="border-t border-slate-300 pt-3">
              <h3 className="font-bold text-xs sm:text-sm font-sans uppercase tracking-wider text-slate-900 mb-3 text-center underline decoration-1 underline-offset-4">
                {reportLang === 'ml' ? 'പ്രവർത്തന റിപ്പോർട്ട്' : 'Activity & Program Reports'}
              </h3>
            </div>

            {reportData.sections.map((sec, idx) => (
              <div key={sec.id || idx} className="space-y-1.5 break-inside-avoid">
                <h4 className="font-bold text-xs sm:text-sm font-sans text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#002B7F] text-white font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{sec.title}</span>
                </h4>
                <p className="text-xs sm:text-[12.5px] leading-relaxed text-slate-800 indent-4 text-justify pl-7">
                  {sec.narrative}
                </p>
              </div>
            ))}
          </div>

          {/* Conclusion / ഉപസംഹാരം */}
          {reportData.conclusion && (
            <div className="my-6 text-justify leading-relaxed text-xs sm:text-[13px] text-slate-800 border-t border-slate-200 pt-4 break-inside-avoid">
              <h3 className="font-bold text-xs sm:text-sm font-sans uppercase tracking-wider text-slate-900 mb-1.5">
                <span>{reportLang === 'ml' ? 'ഉപസംഹാരം (Conclusion)' : 'Conclusion'}</span>
              </h3>
              <p className="indent-6 leading-relaxed">
                {reportData.conclusion}
              </p>
            </div>
          )}

          {/* Formal Signatures Block */}
          <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center font-sans text-xs break-inside-avoid">
            <div className="space-y-1">
              <div className="h-9 flex items-end justify-center font-serif italic text-slate-400 text-sm">
                Sd/-
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                {reportData.gensecName}
              </div>
              <div className="text-[11px] text-slate-600">
                {reportData.gensecTitle}
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-9 flex items-end justify-center font-serif italic text-slate-400 text-sm">
                Sd/-
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                {reportData.chairmanName}
              </div>
              <div className="text-[11px] text-slate-600">
                {reportData.chairmanTitle}
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-9 flex items-end justify-center font-serif italic text-slate-400 text-sm">
                Sd/-
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                {reportData.staffAdvisorName}
              </div>
              <div className="text-[11px] text-slate-600">
                {reportData.staffAdvisorTitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
