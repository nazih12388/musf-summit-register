import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    appTitle: "MUSF Students' Union",
    unionFullName: "Majlis Umariyya Students' Federation",
    collegeName: "Majlis Umariyya Wafy College",
    tagline: "Academic, Leadership & Union Governance System",
    loginSubtitle: "Sign in with your official college credentials",
    roles: {
      admin: "Administrator",
      leader: "Team Leader",
      judge: "Judge / Evaluator",
      student: "Student"
    },
    nav: {
      dashboard: "Dashboard",
      summits: "Summits & Sessions",
      programs: "Programs & Events",
      attendance: "Attendance",
      marks: "Marks & Scoring",
      students: "Students",
      teamsAndClasses: "Classes & Teams",
      leaders: "Team Leaders",
      judges: "Judges & Evaluators",
      notifications: "Notifications & Notices",
      reports: "Reports & Evaluations",
      top10: "Top 10 & Rankings",
      certificates: "Certificates",
      settings: "Settings & Audit",
      logout: "Sign Out",
      login: "Sign In",
      changePassword: "Change Password"
    },
    attendance: {
      title: "Summit Attendance",
      sessions: "Sessions (Start, Mid, End)",
      start: "Start Session",
      mid: "Mid Session",
      end: "End Session",
      present: "Present",
      absent: "Absent",
      late: "Late",
      excused: "Excused",
      markAllPresent: "Mark All Present",
      attendancePct: "Attendance %",
      lockSession: "Lock Session",
      unlockSession: "Unlock Session",
      sessionLockedNotice: "This session is locked by the admin. Further changes are restricted."
    },
    marks: {
      obtained: "Marks Obtained",
      maximum: "Max Marks",
      percentage: "Marks %",
      overallScore: "Overall Performance Score",
      source: "Entered By",
      status: "Status",
      submitted: "Submitted",
      approved: "Approved",
      editedByAdmin: "Edited by Admin",
      leaderUpload: "Upload Team Marks",
      publishResults: "Publish Results",
      unpublishResults: "Unpublish Results",
      published: "Published",
      draft: "Draft (Hidden from students)"
    },
    common: {
      search: "Search...",
      filter: "Filter",
      all: "All",
      actions: "Actions",
      add: "Add New",
      edit: "Edit",
      delete: "Delete",
      save: "Save Changes",
      submit: "Submit",
      cancel: "Cancel",
      close: "Close",
      download: "Download",
      exportExcel: "Export Excel",
      exportPdf: "Export PDF",
      print: "Print Report",
      importExcel: "Import Excel / CSV",
      lock: "Lock",
      unlock: "Unlock",
      status: "Status",
      date: "Date",
      category: "Category",
      type: "Type",
      venue: "Venue",
      individual: "Individual",
      group: "Group",
      marks: "Marks",
      grade: "Grade",
      position: "Position",
      first: "1st Place",
      second: "2nd Place",
      third: "3rd Place",
      chestNo: "Chest No",
      cicNo: "CIC Number",
      team: "Team",
      class: "Class",
      name: "Name",
      username: "Username",
      password: "Password",
      total: "Total",
      average: "Average",
      confirmDelete: "Are you sure you want to delete this?",
      archive: "Archive",
      restore: "Restore"
    }
  },
  ml: {
    appTitle: "MUSF സ്റ്റുഡന്റ്സ് യൂണിയൻ",
    unionFullName: "മജ്‌ലിസ് ഉമരിയ്യ സ്റ്റുഡന്റ്സ് ഫെഡറേഷൻ",
    collegeName: "മജ്‌ലിസ് ഉമരിയ്യ വാഫി കോളേജ്",
    tagline: "വിദ്യാർത്ഥി യൂണിയൻ മാനേജ്‌മെന്റ് സിസ്റ്റം",
    loginSubtitle: "നിങ്ങളുടെ ഔദ്യോഗിക വിവരങ്ങൾ ഉപയോഗിച്ച് പ്രവേശിക്കുക",
    roles: {
      admin: "അഡ്മിനിസ്ട്രേറ്റർ",
      leader: "ടീം ലീഡർ",
      judge: "വിധികർത്താവ്",
      student: "വിദ്യാർത്ഥി"
    },
    nav: {
      dashboard: "ഡാഷ്‌ബോർഡ്",
      summits: "സമ്മിറ്റുകൾ & സെഷനുകൾ",
      programs: "പരിപാടികൾ & മത്സരങ്ങൾ",
      attendance: "ഹാജർ നില",
      marks: "മാർക്ക് രേഖപ്പെടുത്തൽ",
      students: "വിദ്യാർത്ഥികൾ",
      teamsAndClasses: "ക്ലാസുകളും ടീമുകളും",
      leaders: "ടീം ലീഡർമാർ",
      judges: "വിധികർത്താക്കൾ",
      notifications: "അറിയിപ്പുകൾ",
      reports: "റിപ്പോർട്ടുകൾ & അവലോകനം",
      top10: "ടോപ് 10 & റാങ്കിംഗ്",
      certificates: "സർട്ടിഫിക്കറ്റുകൾ",
      settings: "ക്രമീകരണങ്ങൾ",
      logout: "പുറത്തുകടക്കുക",
      login: "പ്രവേശിക്കുക",
      changePassword: "പാസ്‌വേഡ് മാറ്റുക"
    },
    attendance: {
      title: "സമ്മിറ്റ് ഹാജർ",
      sessions: "സെഷനുകൾ (തുടക്കം, ഇടവേള, അവസാനം)",
      start: "ആദ്യ സെഷൻ",
      mid: "മധ്യ സെഷൻ",
      end: "അവസാന സെഷൻ",
      present: "ഹാജർ",
      absent: "ഗൈർഹാജർ",
      late: "വൈകി",
      excused: "അനുമതിയോടെ",
      markAllPresent: "എല്ലാവരെയും ഹാജർ രേഖപ്പെടുത്തുക",
      attendancePct: "ഹാജർ ശതമാനം",
      lockSession: "സെഷൻ ലോക്ക് ചെയ്യുക",
      unlockSession: "സെഷൻ അൺലോക്ക് ചെയ്യുക",
      sessionLockedNotice: "അഡ്മിൻ ഈ സെഷൻ ലോക്ക് ചെയ്തിരിക്കുന്നു."
    },
    marks: {
      obtained: "ലഭിച്ച മാർക്ക്",
      maximum: "പരമാവധി മാർക്ക്",
      percentage: "മാർക്ക് ശതമാനം",
      overallScore: "ആകെ പ്രകടന സ്കോർ",
      source: "രേഖപ്പെടുത്തിയത്",
      status: "നില",
      submitted: "സമർപ്പിച്ചത്",
      approved: "അംഗീകരിച്ചത്",
      editedByAdmin: "അഡ്മിൻ തിരുത്തിയത്",
      leaderUpload: "ടീം മാർക്കുകൾ നൽകുക",
      publishResults: "ഫലങ്ങൾ പ്രസിദ്ധീകരിക്കുക",
      unpublishResults: "പ്രസിദ്ധീകരണം പിൻവലിക്കുക",
      published: "പ്രസിദ്ധീകരിച്ചത്",
      draft: "ഡ്രാഫ്റ്റ് (വിദ്യാർത്ഥികളിൽ നിന്ന് മറച്ചത്)"
    },
    common: {
      search: "തിരയുക...",
      filter: "ഫിൽട്ടർ",
      all: "എല്ലാം",
      actions: "നടപടികൾ",
      add: "പുതിയത് ചേർക്കുക",
      edit: "മാറ്റം വരുത്തുക",
      delete: "നീക്കം ചെയ്യുക",
      save: "സംരക്ഷിക്കുക",
      submit: "സമർപ്പിക്കുക",
      cancel: "റദ്ദാക്കുക",
      close: "അടയ്ക്കുക",
      download: "ഡൗൺലോഡ്",
      exportExcel: "എക്സൽ കയറ്റുമതി",
      exportPdf: "പി.ഡി.എഫ് ഡൗൺലോഡ്",
      print: "പ്രിന്റ് ചെയ്യുക",
      importExcel: "എക്സൽ ചേർക്കുക",
      lock: "ലോക്ക് ചെയ്യുക",
      unlock: "അൺലോക്ക് ചെയ്യുക",
      status: "നില",
      date: "തീയതി",
      category: "വിഭാഗം",
      type: "ഇനം",
      venue: "വേദി",
      individual: "വ്യക്തിഗതം",
      group: "ഗ്രൂപ്പ്",
      marks: "മാർക്കുകൾ",
      grade: "ഗ്രേഡ്",
      position: "സ്ഥാനം",
      first: "ഒന്നാം സ്ഥാനം",
      second: "രണ്ടാം സ്ഥാനം",
      third: "മൂന്നാം സ്ഥാനം",
      chestNo: "ചെസ്റ്റ് നമ്പർ",
      cicNo: "സി.ഐ.സി നമ്പർ",
      team: "ടീം",
      class: "ക്ലാസ്",
      name: "പേര്",
      username: "യൂസർനെയിം",
      password: "പാസ്‌വേഡ്",
      total: "ആകെ",
      average: "ശരാശരി",
      confirmDelete: "ഇത് തീർച്ചയായും നീക്കം ചെയ്യണോ?",
      archive: "ആർക്കൈവ്",
      restore: "തിരികെ എടുക്കുക"
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('musf_summit_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('musf_summit_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ml' : 'en'));
  };

  const t = translations[lang] || translations.en;

  // Translation helper: always returns clean English when lang === 'en', and Malayalam only when lang === 'ml'
  const tr = (enText, mlText) => (lang === 'ml' ? (mlText || enText) : enText);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, tr }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
