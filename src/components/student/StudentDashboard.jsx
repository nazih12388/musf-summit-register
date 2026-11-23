import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { routeVariants } from './motion';
import { DrawerMenu } from './ui/DrawerMenu';
import { Hero } from './ui/Hero';

// Modular Student Screens
import { StudentHomeScreen } from './screens/StudentHomeScreen';
import { WingsListScreen } from './screens/WingsListScreen';
import { ProgramsScreen } from './screens/ProgramsScreen';
import { MyPrizesScreen } from './screens/MyPrizesScreen';
import { CertificatesScreen } from './screens/CertificatesScreen';
import { UnionLeadersScreen } from './screens/UnionLeadersScreen';
import { NoticesScreen } from './screens/NoticesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { FineArtsSummitScreen } from './screens/FineArtsSummitScreen';
import { StudentPersonalActivityReport } from './StudentPersonalActivityReport';

export { StudentPersonalActivityReport } from './StudentPersonalActivityReport';

export const StudentDashboard = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const {
    students = [],
    teams = [],
    classes = [],
    sections = [],
    fields = [],
    programs = [],
    entries = [],
    summits = [],
    notices = [],
    notifications = [],
    programResultsMap = {},
    studentStandings = [],
    teamStandings = [],
    certificates = [],
    unionOfficials = [],
    wingPrograms = [],
    wings = [],
    banners = [],
    addBanner,
    deleteBanner,
    registerForWingProgram,
    cancelWingProgramRegistration,
    markNotificationRead
  } = useApp();

  // Screen navigation state (synced with activeTab prop if provided)
  const [internalTab, setInternalTab] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Normalizer for screen keys across sidebar, drawer, and quick access tiles
  const normalizeTabKey = (key) => {
    if (!key) return 'overview';
    if (key === 'dashboard') return 'overview';
    if (key === 'union_prizes') return 'prizes';
    if (key === 'fine_arts_summit') return 'summit';
    if (key === 'executives' || key === 'officials') return 'leaders';
    if (key === 'college_sports') return 'sports';
    if (key === 'report' || key === 'personal_report' || key === 'activity_report') return 'activity_report';
    return key;
  };

  // Sync internalTab when activeTab prop changes
  useEffect(() => {
    if (activeTab) {
      setInternalTab(normalizeTabKey(activeTab));
    }
  }, [activeTab]);

  const handleNavigate = (targetScreen) => {
    const screenKey = normalizeTabKey(targetScreen);
    setInternalTab(screenKey);
    if (typeof setActiveTab === 'function') {
      setActiveTab(screenKey === 'overview' ? 'dashboard' : screenKey);
    }
  };

  const handleToggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('musf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('musf_theme', 'light');
    }
  };

  // Resolve Student Record
  const student = useMemo(() => {
    return (students || []).find(s =>
      s?.id === currentUser?.id ||
      s?.id === currentUser?.studentId ||
      s?.cicNo === currentUser?.username ||
      s?.cicNo === currentUser?.cicNo
    ) || students[0] || null;
  }, [students, currentUser]);

  const team = useMemo(() => (teams || []).find(t => t?.id === student?.teamId), [teams, student]);
  const cl = useMemo(() => (classes || []).find(c => c?.id === student?.classId), [classes, student]);
  const sec = useMemo(() => (sections || []).find(s => s?.id === (cl?.sectionId || student?.sectionId)), [sections, cl, student]);
  const fieldsMap = useMemo(() => Object.fromEntries((fields || []).map(f => [f?.id, f])), [fields]);
  const summitsMap = useMemo(() => Object.fromEntries((summits || []).map(s => [s?.id, s])), [summits]);

  // Programs the student has registered for across Union Wings
  const myRegisteredWingPrograms = useMemo(() => {
    if (!student) return [];
    const list = [];
    (wingPrograms || []).forEach(p => {
      const reg = (p.registeredStudents || []).find(r => r.studentId === student.id || r.cicNo === student.cicNo);
      if (reg) {
        const wing = (wings || []).find(w => w.id === p.wingId);
        list.push({
          program: p,
          wing,
          registration: reg
        });
      }
    });
    return list;
  }, [wingPrograms, wings, student]);

  // My competition wins across all union wings
  const myUnionWins = useMemo(() => {
    if (!student) return [];
    const wins = [];

    (wingPrograms || []).forEach(p => {
      if (!p.winners) return;
      const wing = (wings || []).find(w => w.id === p.wingId);

      if (p.winners.firstPlace && (p.winners.firstPlace.studentId === student.id || p.winners.firstPlace.cicNo === student.cicNo)) {
        wins.push({
          program: p,
          wing,
          place: '1st',
          placeLabel: 'First place',
          points: p.winners.firstPlace.points || 10,
          remarks: p.winners.remarks
        });
      } else if (p.winners.secondPlace && (p.winners.secondPlace.studentId === student.id || p.winners.secondPlace.cicNo === student.cicNo)) {
        wins.push({
          program: p,
          wing,
          place: '2nd',
          placeLabel: 'Second place',
          points: p.winners.secondPlace.points || 7,
          remarks: p.winners.remarks
        });
      } else if (p.winners.thirdPlace && (p.winners.thirdPlace.studentId === student.id || p.winners.thirdPlace.cicNo === student.cicNo)) {
        wins.push({
          program: p,
          wing,
          place: '3rd',
          placeLabel: 'Third place',
          points: p.winners.thirdPlace.points || 5,
          remarks: p.winners.remarks
        });
      }
    });

    return wins;
  }, [wingPrograms, wings, student]);

  // Official Merit Certificates from Wings, Summits & Direct Certs
  const myCertificates = useMemo(() => {
    if (!student) return [];

    // 1. Direct certificates
    const directCerts = (certificates || [])
      .filter(c => {
        const matchesStudent = c.studentId === student.id || (student.cicNo && c.cicNo === student.cicNo);
        const isPublished = c.isPublished !== false;
        return matchesStudent && isPublished;
      })
      .map(c => ({
        ...c,
        awardTitle: c.awardTitle || c.title || `${c.wingName || 'Union'} Certificate`,
        issueDate: c.issueDate || c.issuedDate || c.createdAt || new Date().toISOString().slice(0, 10)
      }));

    // 2. Wing competitions prizes / winners
    const wingPrizes = [];
    (wingPrograms || []).forEach(p => {
      const w = (wings || []).find(x => x.id === p.wingId);
      const wName = w?.name || 'Union Wing';
      const wShort = w?.shortName || w?.name || 'Wing';

      if (p.winners) {
        const checkWinner = (entry, place) => {
          if (!entry) return;
          const isMatch = entry.studentId === student.id ||
            (entry.cicNo && entry.cicNo === student.cicNo) ||
            (entry.name && student.name && entry.name.toLowerCase().trim() === student.name.toLowerCase().trim());

          if (isMatch) {
            wingPrizes.push({
              id: `wing_cert_${p.id}_${String(place).replace(/\s+/g, '_')}`,
              studentId: student.id,
              studentName: student.name,
              cicNo: student.cicNo,
              className: cl?.name || student.className || 'Class',
              teamName: team?.name || student.teamName || 'House',
              wingId: p.wingId,
              wingName: wName,
              wingShortName: wShort,
              programId: p.id,
              programTitle: p.title,
              category: 'WING_WINNER',
              place: place,
              rank: place === '1st' ? 1 : place === '2nd' ? 2 : place === '3rd' ? 3 : null,
              awardTitle: `${place} Prize - ${p.title}`,
              citation: `Conferred with honor for securing ${place} position in "${p.title}" organized by ${wName}.`,
              issueDate: p.date || new Date().toISOString().slice(0, 10),
              isPublished: true
            });
          }
        };

        checkWinner(p.winners.firstPlace, '1st');
        checkWinner(p.winners.secondPlace, '2nd');
        checkWinner(p.winners.thirdPlace, '3rd');
      }
    });

    const combined = [...directCerts];
    wingPrizes.forEach(wp => {
      const exists = combined.some(c =>
        c.id === wp.id ||
        (c.programId && c.programId === wp.programId && c.place === wp.place)
      );
      if (!exists) {
        combined.push(wp);
      }
    });

    return combined;
  }, [certificates, wingPrograms, wings, student, cl, team]);

  // Fine Arts Summit Registered programs & published results
  const myProgramsList = useMemo(() => {
    const list = [];
    (programs || []).forEach(prog => {
      const sm = summitsMap[prog.summitId];
      if (prog.status === 'draft' || prog.status === 'planned') return;
      if (sm && sm.status === 'planned') return;

      const progEntries = entries.filter(e => e.programId === prog.id);
      const isEnrolled = progEntries.some(e => e.studentId === student?.id || (e.memberIds && e.memberIds.includes(student?.id)));

      if (isEnrolled) {
        const results = programResultsMap[prog.id] || [];
        const res = results.find(r => r.studentId === student?.id || (r.memberIds && r.memberIds.includes(student?.id)));
        const isPublished = prog.status === 'published';
        const fld = fieldsMap[prog.fieldId];

        list.push({
          program: prog,
          fieldName: fld?.name || prog.category || 'General',
          summitName: sm?.name || 'Summit',
          isPublished,
          obtainedMark: isPublished ? res?.finalMark : null,
          maxMarks: prog.maxMarks || 10,
          marksPercentage: isPublished && res ? res.percentage : null,
          grade: isPublished ? res?.grade : '-',
          position: isPublished ? res?.position : '-',
          rank: isPublished ? res?.rank : null
        });
      }
    });
    return list;
  }, [programs, entries, programResultsMap, student, fieldsMap, summitsMap]);

  // Unread notifications calculation
  const unreadCount = useMemo(() => {
    return (notifications || []).filter(n => {
      const isTargeted = !n.userId ||
        n.userId === 'all' ||
        n.userId === currentUser?.id ||
        n.userId === currentUser?.studentId ||
        n.userId === currentUser?.username ||
        (n.userId === 'students' && currentUser?.role === 'student');

      if (!isTargeted) return false;
      const readBy = Array.isArray(n.readBy) ? n.readBy : [];
      const hasRead = readBy.includes(currentUser?.id) ||
        readBy.includes(currentUser?.studentId) ||
        readBy.includes(currentUser?.username);

      return !n.read && !hasRead;
    }).length;
  }, [notifications, currentUser]);

  if (!student) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 max-w-md mx-auto my-12">
        <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">No student account found</p>
        <p className="text-xs text-slate-500">Please enroll students in the Admin Console or log in with a valid student CIC number.</p>
      </div>
    );
  }

  // Active Screen View
  const renderCurrentScreen = () => {
    switch (internalTab) {
      case 'wings':
        return (
          <WingsListScreen
            wings={wings}
            wingPrograms={wingPrograms}
            unionOfficials={unionOfficials}
            onBack={() => handleNavigate('overview')}
            onOpenDrawer={() => setDrawerOpen(true)}
            onNavigate={handleNavigate}
          />
        );

      case 'sports':
        return (
          <WingsListScreen
            wings={wings}
            wingPrograms={wingPrograms}
            unionOfficials={unionOfficials}
            initialWingId="sports"
            onBack={() => handleNavigate('overview')}
            onOpenDrawer={() => setDrawerOpen(true)}
            onNavigate={handleNavigate}
          />
        );

      case 'programs':
        return (
          <ProgramsScreen
            student={student}
            wings={wings}
            wingPrograms={wingPrograms}
            onBack={() => handleNavigate('overview')}
            registerForWingProgram={registerForWingProgram}
            cancelWingProgramRegistration={cancelWingProgramRegistration}
          />
        );

      case 'prizes':
        return (
          <MyPrizesScreen
            student={student}
            myUnionWins={myUnionWins}
            myProgramsList={myProgramsList}
            onBack={() => handleNavigate('overview')}
            onNavigate={handleNavigate}
          />
        );

      case 'certificates':
        return (
          <CertificatesScreen
            student={student}
            certificates={myCertificates}
            cl={cl}
            team={team}
            onBack={() => handleNavigate('overview')}
          />
        );

      case 'leaders':
        return (
          <UnionLeadersScreen
            unionOfficials={unionOfficials}
            wings={wings}
            onBack={() => handleNavigate('overview')}
          />
        );

      case 'notices':
        return (
          <NoticesScreen
            notices={notices}
            notifications={notifications}
            wings={wings}
            currentUser={currentUser}
            onBack={() => handleNavigate('overview')}
            markNotificationRead={markNotificationRead}
          />
        );

      case 'summit':
        return (
          <FineArtsSummitScreen
            summits={summits}
            student={student}
            team={team}
            teamStandings={teamStandings}
            studentStandings={studentStandings}
            myProgramsList={myProgramsList}
            onBack={() => handleNavigate('overview')}
            onNavigate={handleNavigate}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            student={student}
            cl={cl}
            sec={sec}
            team={team}
            myRegisteredWingPrograms={myRegisteredWingPrograms}
            myProgramsList={myProgramsList}
            onBack={() => handleNavigate('overview')}
            onNavigate={handleNavigate}
          />
        );

      case 'activity_report':
        return (
          <div className="space-y-6 pb-12 select-none">
            <Hero
              variant="inner"
              title="Participation & Activity Report"
              subtitle="Monthly participation history across wings and summits"
              onBack={() => handleNavigate('overview')}
            />
            <div className="px-4 sm:px-6">
              <StudentPersonalActivityReport
                student={student}
                currentClass={cl}
                currentTeam={team}
              />
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <StudentHomeScreen
            student={student}
            cl={cl}
            sec={sec}
            wings={wings}
            wingPrograms={wingPrograms}
            unionOfficials={unionOfficials}
            students={students}
            myRegisteredWingPrograms={myRegisteredWingPrograms}
            myUnionWins={myUnionWins}
            myCertificates={myCertificates}
            mySummitEntries={myProgramsList}
            notifications={notifications}
            unreadCount={unreadCount}
            team={team}
            banners={banners}
            addBanner={addBanner}
            deleteBanner={deleteBanner}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenDrawer={() => setDrawerOpen(true)}
            onOpenNotifications={() => handleNavigate('notices')}
            registerForWingProgram={registerForWingProgram}
            cancelWingProgramRegistration={cancelWingProgramRegistration}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#080E18] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Route animated screen switcher */}
      <AnimatePresence mode="wait">
        <motion.div
          key={internalTab}
          variants={routeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {renderCurrentScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Slide-in Navigation Drawer */}
      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={internalTab}
        onSelectTab={(tab) => {
          handleNavigate(tab);
          setDrawerOpen(false);
        }}
        isDark={isDark}
        onToggleTheme={handleToggleDark}
      />
    </div>
  );
};
export default StudentDashboard;
