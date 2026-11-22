import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import {
  Trophy,
  Users,
  Calendar,
  Award,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  UserPlus,
  Shield,
  Medal,
  Clock,
  MapPin,
  Flame,
  ArrowRight,
  Filter,
  UserCheck,
  ChevronRight,
  FileText,
  Zap,
  Sparkles,
  Layers,
  Crown,
  Check,
  X,
  UploadCloud,
  ListPlus,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Megaphone
} from 'lucide-react';

export const SportsWingManager = ({
  isLeaderView = false,
  isManagerView = false,
  leaderGroupId = null,
  defaultMode = 'teams',
  embedded = false,
  onOpenCertificateModal,
  onOpenReportModal,
  onOpenPostNotice
}) => {
  const {
    teams = [],
    addTeam,
    updateTeam,
    deleteTeam,
    bulkAssignTeams,
    updateStudent,
    sportsGroups = [],
    addSportsGroup,
    updateSportsGroup,
    deleteSportsGroup,
    addStudentToSportsGroup,
    removeStudentFromSportsGroup,
    assignSportsGroupLeader,
    assignSportsGroupManager,
    sportsFixtures = [],
    addSportsFixture,
    bulkAddSportsFixtures,
    updateSportsFixture,
    deleteSportsFixture,
    recordSportsMarks,
    togglePublishSportsFixture,
    students = [],
    classes = [],
    addCertificate
  } = useApp();

  const { currentUser } = useAuth();
  const { lang, tr } = useLanguage();

  // Primary Navigation Tab: 'teams' | 'groups' | 'matches' | 'standings' | 'add_events' | 'certificates'
  const [activeTab, setActiveTab] = useState(() => {
    if (isLeaderView || isManagerView) return 'groups';
    if (defaultMode === 'add_events') return 'add_events';
    if (defaultMode === 'standings') return 'standings';
    if (defaultMode === 'matches') return 'matches';
    return 'teams';
  });

  // Add Events Sub-Tabs: 'bulk_import' | 'multi_row'
  const [eventCreationTab, setEventCreationTab] = useState('bulk_import');

  // House Teams & Student Assignment State
  const [selectedTeamId, setSelectedTeamId] = useState(() => teams[0]?.id || 'team_a');
  const [teamStudentSearch, setTeamStudentSearch] = useState('');
  const [teamClassFilter, setTeamClassFilter] = useState('all');
  const [isAssignStudentModalOpen, setIsAssignStudentModalOpen] = useState(false);
  const [assignModalSearch, setAssignModalSearch] = useState('');
  const [assignModalClass, setAssignModalClass] = useState('all');
  const [selectedStudentIdsForTeam, setSelectedStudentIdsForTeam] = useState([]);

  // Add / Edit / Delete Sports Team State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    color: '#0E7C86'
  });
  const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [reassignTeamId, setReassignTeamId] = useState('');

  // Bulk Import State
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportSport, setBulkImportSport] = useState('Athletics & Track');
  const [bulkImportDate, setBulkImportDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkImportVenue, setBulkImportVenue] = useState('College Main Ground');

  // Standings & Team Points State
  const [standingsViewMode, setStandingsViewMode] = useState('teams'); // 'teams' | 'squads'
  const [isTeamBreakdownModalOpen, setIsTeamBreakdownModalOpen] = useState(false);
  const [selectedTeamForBreakdown, setSelectedTeamForBreakdown] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingTeam, setAdjustingTeam] = useState(null);
  const [adjustPointsForm, setAdjustPointsForm] = useState({ bonusPoints: 0, reason: '' });

  const [searchMember, setSearchMember] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(() => {
    if (isLeaderView && leaderGroupId) return leaderGroupId;
    return sportsGroups[0]?.id || '';
  });

  // Matches Filter
  const [matchSportFilter, setMatchSportFilter] = useState('all');
  const [matchStatusFilter, setMatchStatusFilter] = useState('all');

  // Active House Team
  const activeHouseTeam = useMemo(() => {
    return teams.find(t => t.id === selectedTeamId) || teams[0] || null;
  }, [teams, selectedTeamId]);

  // Effective visible groups (scoped if Team Leader / Manager)
  const visibleGroups = useMemo(() => {
    if ((isLeaderView || isManagerView) && leaderGroupId) {
      return sportsGroups.filter(g => g.id === leaderGroupId);
    }
    return sportsGroups;
  }, [sportsGroups, isLeaderView, isManagerView, leaderGroupId]);

  const activeGroup = useMemo(() => {
    return visibleGroups.find(g => g.id === selectedGroupId) || visibleGroups[0] || null;
  }, [visibleGroups, selectedGroupId]);

  // Scoped Fixtures: if leader view, only their squad's matches
  const visibleFixtures = useMemo(() => {
    if ((isLeaderView || isManagerView) && activeGroup) {
      return sportsFixtures.filter(f => f.group1Id === activeGroup.id || f.group2Id === activeGroup.id);
    }
    return sportsFixtures;
  }, [sportsFixtures, isLeaderView, isManagerView, activeGroup]);

  // Classes map for student info
  const classesMap = useMemo(() => Object.fromEntries(classes.map(c => [c.id, c])), [classes]);

  // Toast State
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Group Modal (Create / Edit Squad)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    sport: 'Football',
    category: 'Team Sport',
    leaderId: '',
    managerId: '',
    color: '#047857'
  });

  // Assign Manager Modal State
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [managerPickerSearch, setManagerPickerSearch] = useState('');

  // Assign Leader Modal State
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);

  // Add Member to Squad Modal State
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberPickerSearch, setMemberPickerSearch] = useState('');
  const [memberPickerClass, setMemberPickerClass] = useState('all');

  // Single Fixture Modal State
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [fixtureForm, setFixtureForm] = useState({
    title: '',
    sport: 'Football',
    group1Id: '',
    group2Id: '',
    date: new Date().toISOString().split('T')[0],
    time: '04:00 PM',
    venue: 'College Main Ground',
    status: 'scheduled'
  });

  // Score & Points & Marks Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoringFixture, setScoringFixture] = useState(null);
  const [scoreForm, setScoreForm] = useState({
    score1: 0,
    score2: 0,
    winnerGroupId: '',
    points1: 10,
    points2: 6,
    topStudentId: '',
    topStudentMarks: 10,
    studentAwardTitle: 'Star Athlete of the Match'
  });
  // Participant Points Rows: [{ studentId, marks, position }]
  const [participantPointsList, setParticipantPointsList] = useState([
    { studentId: '', marks: 10, position: '1st Place (Gold)' },
    { studentId: '', marks: 7, position: '2nd Place (Silver)' },
    { studentId: '', marks: 5, position: '3rd Place (Bronze)' }
  ]);
  // Direct House Team Points: { [teamId]: number }
  const [teamPointsInputs, setTeamPointsInputs] = useState({});
  const [publishImmediately, setPublishImmediately] = useState(false);

  // Multi-Row Batch Event Setup State
  const [multiRows, setMultiRows] = useState([
    { title: 'Inter-House 100m Sprint', sport: 'Athletics & Track', date: new Date().toISOString().split('T')[0], time: '09:00 AM', venue: 'Main Track' },
    { title: 'Inter-House 200m Sprint', sport: 'Athletics & Track', date: new Date().toISOString().split('T')[0], time: '10:00 AM', venue: 'Main Track' },
    { title: 'Inter-House Football Cup Match', sport: 'Football', date: new Date().toISOString().split('T')[0], time: '04:00 PM', venue: 'Football Ground' }
  ]);

  // =========================================================================
  // AUTOMATIC HOUSE TEAM TOTAL POINTS CALCULATION & STANDINGS
  // =========================================================================
  const teamStandings = useMemo(() => {
    const table = {};
    teams.forEach(t => {
      table[t.id] = {
        id: t.id,
        name: t.name,
        color: t.color || '#0E7C86',
        totalPoints: 0,
        contestedEvents: 0,
        studentPointsSum: 0,
        teamPointsSum: 0,
        bonusPoints: Number(t.sportsBonusPoints) || 0,
        breakdown: []
      };
    });

    sportsFixtures.forEach(fix => {
      // ONLY count points if the result is explicitly published!
      if (!fix.isResultPublished) return;

      const hasPoints = fix.status === 'completed' || Object.keys(fix.studentMarks || {}).length > 0 || Object.keys(fix.teamPoints || {}).length > 0;
      if (hasPoints) {
        // 1. Direct team points from fixture
        if (fix.teamPoints) {
          Object.entries(fix.teamPoints).forEach(([tId, pts]) => {
            const num = Number(pts) || 0;
            if (num > 0 && table[tId]) {
              table[tId].totalPoints += num;
              table[tId].teamPointsSum += num;
              table[tId].contestedEvents += 1;
              table[tId].breakdown.push({
                fixtureId: fix.id,
                fixtureTitle: fix.title,
                sport: fix.sport,
                date: fix.date,
                points: num,
                source: 'Direct Placement / Team Points'
              });
            }
          });
        }

        // 2. Student marks mapped to student's house team
        if (fix.studentMarks) {
          Object.entries(fix.studentMarks).forEach(([sId, pts]) => {
            const num = Number(pts) || 0;
            if (num > 0) {
              const st = students.find(s => s.id === sId);
              const tId = st?.teamId;
              if (tId && table[tId]) {
                table[tId].totalPoints += num;
                table[tId].studentPointsSum += num;
                table[tId].contestedEvents += 1;
                table[tId].breakdown.push({
                  fixtureId: fix.id,
                  fixtureTitle: fix.title,
                  sport: fix.sport,
                  date: fix.date,
                  points: num,
                  source: `${st.name} (${classesMap[st.classId]?.name || 'Class'})`
                });
              }
            }
          });
        }
      }
    });

    // Add bonus points to each team
    Object.values(table).forEach(item => {
      item.totalPoints += item.bonusPoints;
    });

    return Object.values(table).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [teams, sportsFixtures, students, classesMap]);

  // Standings calculation for Sports Squads (only for published results)
  const groupStandings = useMemo(() => {
    const table = {};
    sportsGroups.forEach(g => {
      table[g.id] = {
        id: g.id,
        name: g.name,
        sport: g.sport,
        color: g.color || '#047857',
        played: 0,
        won: 0,
        lost: 0,
        drawn: 0,
        totalPoints: 0
      };
    });

    sportsFixtures.forEach(fix => {
      // ONLY include published results in squad standings
      if (!fix.isResultPublished) return;

      if (fix.status === 'completed') {
        const g1 = table[fix.group1Id];
        const g2 = table[fix.group2Id];
        if (g1) g1.played += 1;
        if (g2) g2.played += 1;

        const pts1 = Number(fix.pointsAwarded?.[fix.group1Id]) || 0;
        const pts2 = Number(fix.pointsAwarded?.[fix.group2Id]) || 0;
        if (g1) g1.totalPoints += pts1;
        if (g2) g2.totalPoints += pts2;

        if (fix.score1 > fix.score2) {
          if (g1) g1.won += 1;
          if (g2) g2.lost += 1;
        } else if (fix.score2 > fix.score1) {
          if (g2) g2.won += 1;
          if (g1) g1.lost += 1;
        } else {
          if (g1) g1.drawn += 1;
          if (g2) g2.drawn += 1;
        }
      }
    });

    return Object.values(table).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [sportsGroups, sportsFixtures]);

  // Handlers for College Sports House Teams (Add, Edit, Delete)
  const handleOpenAddTeam = () => {
    setEditingTeam(null);
    setTeamForm({
      name: '',
      color: '#0E7C86'
    });
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeam = (tm, e) => {
    if (e) e.stopPropagation();
    setEditingTeam(tm);
    setTeamForm({
      name: tm.name,
      color: tm.color || '#0E7C86'
    });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = (e) => {
    e.preventDefault();
    const trimmed = (teamForm.name || '').trim();
    if (!trimmed) return;

    if (editingTeam) {
      updateTeam(editingTeam.id, { name: trimmed, color: teamForm.color }, currentUser?.name || 'Sports Convener');
      showToast(`Team "${trimmed}" updated!`);
    } else {
      const created = addTeam({ name: trimmed, color: teamForm.color }, currentUser?.name || 'Sports Convener');
      if (created?.id) setSelectedTeamId(created.id);
      showToast(`Created new sports team "${trimmed}"!`);
    }
    setIsTeamModalOpen(false);
  };

  const handleOpenDeleteTeam = (tm, e) => {
    if (e) e.stopPropagation();
    if (teams.length <= 1) {
      alert('Cannot delete the only remaining team. At least one sports team must exist.');
      return;
    }
    setTeamToDelete(tm);
    const otherTeam = teams.find(t => t.id !== tm.id);
    setReassignTeamId(otherTeam ? otherTeam.id : '');
    setIsDeleteTeamModalOpen(true);
  };

  const handleConfirmDeleteTeam = () => {
    if (!teamToDelete) return;
    const tm = teamToDelete;
    deleteTeam(tm.id, reassignTeamId || null, currentUser?.name || 'Sports Convener');

    if (selectedTeamId === tm.id) {
      const remaining = teams.filter(t => t.id !== tm.id);
      setSelectedTeamId(remaining[0]?.id || '');
    }
    showToast(`Team "${tm.name}" has been deleted.`);
    setIsDeleteTeamModalOpen(false);
    setTeamToDelete(null);
  };

  // Handlers for Sports Groups / Squads
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      sport: 'Football',
      category: 'Team Sport',
      leaderId: '',
      managerId: '',
      color: '#047857'
    });
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (g) => {
    setEditingGroup(g);
    setGroupForm({
      name: g.name,
      sport: g.sport || 'Football',
      category: g.category || 'Team Sport',
      leaderId: g.leaderId || '',
      managerId: g.managerId || '',
      color: g.color || '#047857'
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;

    const leaderStudent = students.find(s => s.id === groupForm.leaderId);
    const managerStudent = students.find(s => s.id === groupForm.managerId);
    const payload = {
      ...groupForm,
      leaderName: leaderStudent?.name || '',
      leaderUsername: `leader_${groupForm.sport.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      managerName: managerStudent?.name || '',
      managerUsername: `manager_${groupForm.sport.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    };

    if (editingGroup) {
      updateSportsGroup(editingGroup.id, payload, currentUser?.name || 'Convener');
      showToast(`Sports squad "${groupForm.name}" updated!`);
    } else {
      const created = addSportsGroup(payload, currentUser?.name || 'Convener');
      setSelectedGroupId(created.id);
      showToast(`Created new sports squad "${groupForm.name}"!`);
    }
    setIsGroupModalOpen(false);
  };

  const handleDeleteGroup = (g) => {
    if (window.confirm(`Are you sure you want to remove the sports squad "${g.name}"?`)) {
      deleteSportsGroup(g.id, currentUser?.name || 'Convener');
      showToast(`Removed squad "${g.name}".`);
      if (selectedGroupId === g.id) {
        setSelectedGroupId(sportsGroups.find(x => x.id !== g.id)?.id || '');
      }
    }
  };

  // Member Management
  const handleAddMemberToActiveGroup = (studentId) => {
    if (!activeGroup) return;
    addStudentToSportsGroup(activeGroup.id, studentId, currentUser?.name || 'Convener');
    const st = students.find(s => s.id === studentId);
    showToast(`Added ${st?.name || 'Student'} to ${activeGroup.name}!`);
  };

  const handleRemoveMember = (studentId) => {
    if (!activeGroup) return;
    const st = students.find(s => s.id === studentId);
    if (window.confirm(`Remove ${st?.name || 'student'} from ${activeGroup.name}?`)) {
      removeStudentFromSportsGroup(activeGroup.id, studentId, currentUser?.name || 'Convener');
      showToast(`Removed ${st?.name || 'student'} from squad.`);
    }
  };

  // Assign Team Manager
  const handleSelectManager = (studentId) => {
    if (!activeGroup) return;
    assignSportsGroupManager(activeGroup.id, studentId, 'Team Manager', currentUser?.name || 'Convener');
    const st = students.find(s => s.id === studentId);
    setIsManagerModalOpen(false);
    showToast(`Appointed ${st?.name} as Team Manager of ${activeGroup.name}!`);
  };

  // Assign Team Leader
  const handleSelectLeader = (studentId) => {
    if (!activeGroup) return;
    assignSportsGroupLeader(activeGroup.id, studentId, 'Team Leader', currentUser?.name || 'Convener');
    const st = students.find(s => s.id === studentId);
    setIsLeaderModalOpen(false);
    showToast(`Appointed ${st?.name} as Team Leader of ${activeGroup.name}!`);
  };

  // Single Fixture Handlers
  const handleOpenAddFixture = () => {
    setEditingFixture(null);
    setFixtureForm({
      title: '',
      sport: activeGroup?.sport || 'Football',
      group1Id: visibleGroups[0]?.id || '',
      group2Id: visibleGroups[1]?.id || visibleGroups[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '04:00 PM',
      venue: 'College Main Ground',
      status: 'scheduled'
    });
    setIsFixtureModalOpen(true);
  };

  const handleSaveFixture = (e) => {
    e.preventDefault();
    if (!fixtureForm.title.trim()) return;

    const g1 = sportsGroups.find(g => g.id === fixtureForm.group1Id);
    const g2 = sportsGroups.find(g => g.id === fixtureForm.group2Id);

    const payload = {
      ...fixtureForm,
      group1Name: g1?.name || 'Squad 1',
      group2Name: g2?.name || 'Squad 2'
    };

    if (editingFixture) {
      updateSportsFixture(editingFixture.id, payload, currentUser?.name || 'Convener');
      showToast(`Updated fixture "${payload.title}"!`);
    } else {
      addSportsFixture(payload, currentUser?.name || 'Convener');
      showToast(`Scheduled new sports match "${payload.title}"!`);
    }
    setIsFixtureModalOpen(false);
  };

  // Multi-Row Bulk Creator Handlers
  const handleAddMultiRow = () => {
    setMultiRows(prev => [
      ...prev,
      { title: '', sport: 'Football', date: new Date().toISOString().split('T')[0], time: '04:00 PM', venue: 'College Ground' }
    ]);
  };

  const handleRemoveMultiRow = (idx) => {
    setMultiRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMultiRowChange = (idx, field, value) => {
    setMultiRows(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSaveMultiRows = (e) => {
    e.preventDefault();
    const validRows = multiRows.filter(r => r.title.trim());
    if (validRows.length === 0) {
      alert('Please fill in at least one event title.');
      return;
    }

    const g1 = sportsGroups[0]?.id || '';
    const g2 = sportsGroups[1]?.id || sportsGroups[0]?.id || '';
    const g1Name = sportsGroups[0]?.name || 'Squad 1';
    const g2Name = sportsGroups[1]?.name || 'Squad 2';

    const payloads = validRows.map(r => ({
      title: r.title,
      sport: r.sport,
      date: r.date || new Date().toISOString().split('T')[0],
      time: r.time || '04:00 PM',
      venue: r.venue || 'College Ground',
      group1Id: g1,
      group2Id: g2,
      group1Name: g1Name,
      group2Name: g2Name,
      status: 'scheduled'
    }));

    bulkAddSportsFixtures(payloads, currentUser?.name || 'Sports Convener');
    showToast(`Installed ${payloads.length} sports events in bulk!`);
    setMultiRows([
      { title: '', sport: 'Football', date: new Date().toISOString().split('T')[0], time: '04:00 PM', venue: 'Main Ground' }
    ]);
  };

  // Bulk Text / Comma Import Handler
  const handleSaveBulkImport = (e) => {
    e.preventDefault();
    if (!bulkImportText.trim()) {
      alert('Please paste or enter at least one sports event name.');
      return;
    }

    const rawEvents = bulkImportText
      .split(/[\r\n,]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (rawEvents.length === 0) {
      alert('No valid event names found. Please check your text.');
      return;
    }

    const g1 = sportsGroups[0]?.id || '';
    const g2 = sportsGroups[1]?.id || sportsGroups[0]?.id || '';
    const g1Name = sportsGroups[0]?.name || 'Team A / Squad';
    const g2Name = sportsGroups[1]?.name || 'Team B / Squad';

    const payloads = rawEvents.map(title => ({
      title,
      sport: bulkImportSport || 'Athletics & Track',
      date: bulkImportDate || new Date().toISOString().split('T')[0],
      time: '04:00 PM',
      venue: bulkImportVenue || 'College Main Ground',
      group1Id: g1,
      group2Id: g2,
      group1Name: g1Name,
      group2Name: g2Name,
      status: 'scheduled',
      score1: 0,
      score2: 0,
      pointsAwarded: {},
      studentMarks: {},
      teamPoints: {}
    }));

    bulkAddSportsFixtures(payloads, currentUser?.name || 'Sports Convener');
    showToast(`Successfully imported & installed ${payloads.length} sports events!`);
    setBulkImportText('');
    setIsBulkImportModalOpen(false);
  };

  // House Team Student Assignment Handlers
  const handleAssignStudentToTeam = (studentId, targetTeamId) => {
    updateStudent(studentId, { teamId: targetTeamId }, currentUser?.name || 'Sports Convener');
    const st = students.find(s => s.id === studentId);
    const tm = teams.find(t => t.id === targetTeamId);
    showToast(`Assigned ${st?.name || 'Student'} to ${tm?.name || 'Team'}!`);
  };

  const handleRemoveStudentFromTeam = (studentId) => {
    const st = students.find(s => s.id === studentId);
    if (window.confirm(`Unassign ${st?.name || 'student'} from ${activeHouseTeam?.name}?`)) {
      updateStudent(studentId, { teamId: '' }, currentUser?.name || 'Sports Convener');
      showToast(`Unassigned ${st?.name || 'student'} from team.`);
    }
  };

  const handleBatchAssignStudents = () => {
    if (!activeHouseTeam || selectedStudentIdsForTeam.length === 0) return;
    const assignments = {};
    selectedStudentIdsForTeam.forEach(sId => {
      assignments[sId] = activeHouseTeam.id;
    });
    bulkAssignTeams(assignments, currentUser?.name || 'Sports Convener');
    showToast(`Assigned ${selectedStudentIdsForTeam.length} students to ${activeHouseTeam.name}!`);
    setSelectedStudentIdsForTeam([]);
    setIsAssignStudentModalOpen(false);
  };

  // Team Bonus / Points Adjustment Handler
  const handleOpenAdjustBonus = (tm) => {
    setAdjustingTeam(tm);
    setAdjustPointsForm({
      bonusPoints: Number(tm.sportsBonusPoints) || 0,
      reason: ''
    });
    setIsAdjustModalOpen(true);
  };

  const handleSaveBonusPoints = (e) => {
    e.preventDefault();
    if (!adjustingTeam) return;
    const val = Number(adjustPointsForm.bonusPoints) || 0;
    updateTeam(adjustingTeam.id, { sportsBonusPoints: val }, currentUser?.name || 'Sports Convener');
    showToast(`Updated points adjustment for ${adjustingTeam.name} (${val >= 0 ? '+' : ''}${val} pts)!`);
    setIsAdjustModalOpen(false);
  };

  // Score & Points Modal Handlers
  const handleOpenScoring = (fix) => {
    setScoringFixture(fix);
    const defaultWinner = fix.score1 > fix.score2 ? fix.group1Id : (fix.score2 > fix.score1 ? fix.group2Id : '');
    setScoreForm({
      score1: fix.score1 || 0,
      score2: fix.score2 || 0,
      winnerGroupId: fix.winnerGroupId || defaultWinner,
      points1: fix.pointsAwarded?.[fix.group1Id] !== undefined ? fix.pointsAwarded[fix.group1Id] : 10,
      points2: fix.pointsAwarded?.[fix.group2Id] !== undefined ? fix.pointsAwarded[fix.group2Id] : 6,
      topStudentId: '',
      topStudentMarks: 10,
      studentAwardTitle: 'Star Athlete of the Match'
    });
    setPublishImmediately(Boolean(fix.isResultPublished));

    // Populate existing or default participant marks list
    const existingMarks = Object.entries(fix.studentMarks || {});
    if (existingMarks.length > 0) {
      setParticipantPointsList(existingMarks.map(([sId, pts], i) => ({
        studentId: sId,
        marks: pts,
        position: i === 0 ? '1st Place (Gold)' : (i === 1 ? '2nd Place (Silver)' : (i === 2 ? '3rd Place (Bronze)' : `Place ${i + 1}`))
      })));
    } else {
      setParticipantPointsList([
        { studentId: '', marks: 10, position: '1st Place (Gold)' },
        { studentId: '', marks: 7, position: '2nd Place (Silver)' },
        { studentId: '', marks: 5, position: '3rd Place (Bronze)' }
      ]);
    }

    // Populate team points inputs
    const initialTeamPts = {};
    teams.forEach(t => {
      initialTeamPts[t.id] = fix.teamPoints?.[t.id] !== undefined ? fix.teamPoints[t.id] : 0;
    });
    setTeamPointsInputs(initialTeamPts);

    setIsScoreModalOpen(true);
  };

  const handleAddParticipantRow = () => {
    setParticipantPointsList(prev => [
      ...prev,
      { studentId: '', marks: 3, position: `Participant #${prev.length + 1}` }
    ]);
  };

  const handleRemoveParticipantRow = (idx) => {
    setParticipantPointsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleParticipantChange = (idx, field, value) => {
    setParticipantPointsList(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSaveScores = (e) => {
    e.preventDefault();
    if (!scoringFixture) return;

    // Collect all valid student marks
    const studentMarksObj = {};
    participantPointsList.forEach(p => {
      if (p.studentId && Number(p.marks) > 0) {
        studentMarksObj[p.studentId] = Number(p.marks);
      }
    });

    // Also include topStudentId if provided and not already added
    if (scoreForm.topStudentId && !studentMarksObj[scoreForm.topStudentId]) {
      studentMarksObj[scoreForm.topStudentId] = Number(scoreForm.topStudentMarks) || 10;
    }

    // Collect team points
    const teamPointsObj = {};
    Object.entries(teamPointsInputs).forEach(([tId, pts]) => {
      if (Number(pts) > 0) {
        teamPointsObj[tId] = Number(pts);
      }
    });

    recordSportsMarks(
      scoringFixture.id,
      {
        score1: Number(scoreForm.score1) || 0,
        score2: Number(scoreForm.score2) || 0,
        winnerGroupId: scoreForm.winnerGroupId || null,
        pointsAwarded: {
          [scoringFixture.group1Id]: Number(scoreForm.points1) || 0,
          [scoringFixture.group2Id]: Number(scoreForm.points2) || 0
        },
        studentMarks: studentMarksObj,
        teamPoints: teamPointsObj,
        status: 'completed',
        isResultPublished: publishImmediately
      },
      currentUser?.name || 'Convener'
    );

    setIsScoreModalOpen(false);
    if (publishImmediately) {
      showToast(`Recorded and PUBLISHED results live for "${scoringFixture.title}"! Points added to leaderboard.`);
    } else {
      showToast(`Saved draft results for "${scoringFixture.title}" (Unpublished). Publish whenever you're ready!`);
    }
  };

  // Filtered students for House Team assignment
  const studentsInSelectedTeam = useMemo(() => {
    if (!activeHouseTeam) return [];
    return students.filter(st => {
      if (st.teamId !== activeHouseTeam.id) return false;
      if (teamClassFilter !== 'all' && st.classId !== teamClassFilter) return false;
      if (teamStudentSearch.trim()) {
        const q = teamStudentSearch.toLowerCase();
        return st.name.toLowerCase().includes(q) || st.cicNo?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [students, activeHouseTeam, teamClassFilter, teamStudentSearch]);

  const eligibleStudentsForTeamAssignment = useMemo(() => {
    if (!activeHouseTeam) return [];
    return students.filter(st => {
      if (st.teamId === activeHouseTeam.id) return false;
      if (assignModalClass !== 'all' && st.classId !== assignModalClass) return false;
      if (assignModalSearch.trim()) {
        const q = assignModalSearch.toLowerCase();
        return st.name.toLowerCase().includes(q) || st.cicNo?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [students, activeHouseTeam, assignModalClass, assignModalSearch]);

  // Eligible students for squad enrollment
  const eligibleStudentsForPicker = useMemo(() => {
    if (!activeGroup) return [];
    const enrolledIds = new Set(activeGroup.memberIds || []);
    return students.filter(st => {
      if (enrolledIds.has(st.id)) return false;
      if (memberPickerClass !== 'all' && st.classId !== memberPickerClass) return false;
      if (memberPickerSearch.trim()) {
        const q = memberPickerSearch.toLowerCase();
        return st.name.toLowerCase().includes(q) || st.cicNo?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [students, activeGroup, memberPickerClass, memberPickerSearch]);

  const activeLeader = students.find(s => s.id === activeGroup?.leaderId);
  const activeManager = students.find(s => s.id === activeGroup?.managerId);

  // Filtered Fixtures for Matches Tab
  const filteredFixtures = useMemo(() => {
    return visibleFixtures.filter(f => {
      if (matchSportFilter !== 'all' && f.sport !== matchSportFilter) return false;
      if (matchStatusFilter === 'completed' && f.status !== 'completed') return false;
      if (matchStatusFilter === 'scheduled' && f.status !== 'scheduled') return false;
      if (matchStatusFilter === 'published' && !f.isResultPublished) return false;
      if (matchStatusFilter === 'draft' && (!f.status === 'completed' || f.isResultPublished)) return false;
      return true;
    });
  }, [visibleFixtures, matchSportFilter, matchStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      {!embedded ? (
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#0E7C86] text-white shadow-xl shadow-emerald-950/25">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-1/3 w-60 h-60 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-sm">
                <Trophy className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-emerald-200 uppercase tracking-wide whitespace-nowrap">
                    <Shield className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>
                      {isLeaderView || isManagerView
                        ? (isManagerView ? 'Team Manager Console' : 'Team Leader Console')
                        : (currentUser?.designation || 'Sports Joint Convener • Sports & Games Wing')}
                    </span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                  {(isLeaderView || isManagerView) && activeGroup
                    ? `${activeGroup.name} (${isManagerView ? 'Manager' : 'Leader'})`
                    : 'Sports & Games Wing'}
                </h1>
                <p className="text-xs text-emerald-100/90 max-w-xl font-medium line-clamp-1 sm:line-clamp-none">
                  {(isLeaderView || isManagerView) && activeGroup
                    ? `Managing ${activeGroup.name} (${activeGroup.sport}) with ${activeGroup.memberIds?.length || 0} enrolled athletes.`
                    : 'Annual athletic meets, house championship, sports squads, match fixtures & live leaderboard.'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            {!(isLeaderView || isManagerView) && (
              <div className="relative z-10 flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBulkImportModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-950" />
                  <span>Bulk Import</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddGroup}
                  className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Create Squad</span>
                </button>
                {onOpenReportModal && (
                  <button
                    type="button"
                    onClick={onOpenReportModal}
                    className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-300" />
                    <span>Report (PDF)</span>
                  </button>
                )}
                {onOpenPostNotice && (
                  <button
                    type="button"
                    onClick={onOpenPostNotice}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-slate-950" />
                    <span>Notice</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sleek, Professional Sub-Header for Embedded View inside Sports Wing Convener Dashboard */
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-900/30 via-teal-900/20 to-slate-900/40 border border-emerald-600/30 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Trophy className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  College Sports Management
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Houses &amp; Squads
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                House Championship points, student assignments, squads, match fixtures &amp; live results.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddTeam}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>+ Add Team</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddGroup}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-teal-500" />
              <span>+ Create Squad</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBulkImportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-white" />
              <span>Bulk Import</span>
            </button>
          </div>
        </div>
      )}

      {/* Athletic Quick Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">House Teams</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {teams.length} Houses
          </div>
          <span className="text-[11px] text-slate-500">Championship contenders</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Athletes</span>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {students.filter(s => s.teamId).length} <span className="text-xs font-normal text-slate-400">/ {students.length}</span>
          </div>
          <span className="text-[11px] text-slate-500">Enrolled in house teams</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Events &amp; Matches</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {sportsFixtures.length} Events
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {sportsFixtures.filter(f => f.status === 'completed').length} completed
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Championship Points</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-500">
            {teamStandings.reduce((acc, t) => acc + t.totalPoints, 0)} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <span className="text-[11px] text-slate-500">Published live points</span>
        </div>
      </div>

      {/* Unified Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          ...(!(isLeaderView || isManagerView) ? [{ id: 'teams', label: 'House Teams & Rosters', icon: Shield, count: teams.length }] : []),
          { id: 'groups', label: 'Sports Squads', icon: Users, count: visibleGroups.length },
          { id: 'matches', label: 'Matches & Events', icon: Calendar, count: visibleFixtures.length },
          { id: 'standings', label: 'Standings & Leaderboard', icon: Trophy },
          ...(!(isLeaderView || isManagerView) ? [{ id: 'add_events', label: 'Add & Bulk Events', icon: ListPlus }] : []),
          ...((onOpenCertificateModal || embedded) ? [{ id: 'certificates', label: 'Sports Certificates', icon: Award }] : [])
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'certificates' && onOpenCertificateModal) {
                  onOpenCertificateModal();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${isActive
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: HOUSE TEAMS & STUDENT ROSTERS
          ========================================================================= */}
      {activeTab === 'teams' && !(isLeaderView || isManagerView) && (
        <div className="space-y-5">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0F1B2B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>House Teams &amp; Student Rosters</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                  {teams.length} Teams
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage sports houses, add new teams, or delete teams. Assign students to each house team cleanly.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddTeam}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Team</span>
            </button>
          </div>

          {/* House Teams Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {teams.map(tm => {
              const isSelected = tm.id === selectedTeamId;
              const memberCount = students.filter(s => s.teamId === tm.id).length;
              const teamPts = teamStandings.find(x => x.id === tm.id)?.totalPoints || 0;
              return (
                <div
                  key={tm.id}
                  onClick={() => setSelectedTeamId(tm.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden ${isSelected
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-[#0F1B2B] border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0"
                        style={{ backgroundColor: tm.color || '#0E7C86' }}
                      >
                        🛡️
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {tm.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {memberCount} Assigned Students
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                          {teamPts} pts
                        </span>
                        <span className="text-[10px] text-slate-400">Total Points</span>
                      </div>

                      <div className="flex items-center gap-0.5 ml-1">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditTeam(tm, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Edit Team"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenDeleteTeam(tm, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete Team (DLT Team)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      <span>✓ Active Team Selected</span>
                      <span className="text-xs">Manage Roster →</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected House Team Roster Management */}
          {activeHouseTeam && (
            <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: activeHouseTeam.color || '#0E7C86' }}
                    />
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {activeHouseTeam.name} Roster
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      {students.filter(s => s.teamId === activeHouseTeam.id).length} Students
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign students to {activeHouseTeam.name}, search by class or name, and manage house team composition.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenAdjustBonus(activeHouseTeam)}
                    className="px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Adjust Bonus (+/-)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAssignModalSearch('');
                      setAssignModalClass('all');
                      setSelectedStudentIdsForTeam([]);
                      setIsAssignStudentModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Assign Students to {activeHouseTeam.name}</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={teamStudentSearch}
                    onChange={(e) => setTeamStudentSearch(e.target.value)}
                    placeholder={`Search students in ${activeHouseTeam.name}...`}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <select
                  value={teamClassFilter}
                  onChange={(e) => setTeamClassFilter(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold sm:w-44"
                >
                  <option value="all">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">CIC Number</th>
                      <th className="p-3">Class</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentsInSelectedTeam.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          No students found in {activeHouseTeam.name}. Click "+ Assign Students" above to enroll members.
                        </td>
                      </tr>
                    ) : (
                      studentsInSelectedTeam.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                          <td className="p-3 font-mono text-slate-500">{st.cicNo}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            {classesMap[st.classId]?.name || 'Class'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveStudentFromTeam(st.id)}
                              className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-bold cursor-pointer transition"
                              title="Unassign from team"
                            >
                              Unassign
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SPORTS SQUADS (FOOTBALL, CRICKET, ATHLETICS...)
          ========================================================================= */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Squads List Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Sports Squads</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600">
                  {visibleGroups.length}
                </span>
              </h3>

              {!(isLeaderView || isManagerView) && (
                <button
                  type="button"
                  onClick={handleOpenAddGroup}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Squad</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {visibleGroups.map(g => {
                const isSelected = g.id === (activeGroup?.id || selectedGroupId);
                const manager = students.find(s => s.id === g.managerId);
                const leader = students.find(s => s.id === g.leaderId);
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-white dark:bg-[#0F1B2B] border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: g.color || '#047857' }}
                        />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.name}</h4>
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {g.sport} • {g.memberIds?.length || 0} Athletes
                          </span>
                        </div>
                      </div>

                      {!(isLeaderView || isManagerView) && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditGroup(g);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Edit Squad"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(g);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete Squad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex flex-col gap-1 text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>Manager: <strong className="text-slate-700 dark:text-slate-300">{manager?.name || g.managerName || 'Unassigned'}</strong></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Leader: <strong className="text-slate-700 dark:text-slate-300">{leader?.name || g.leaderName || 'Unassigned'}</strong></span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Squad Detail & Member Roster */}
          <div className="lg:col-span-8 space-y-4">
            {activeGroup ? (
              <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs">
                {/* Active Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {activeGroup.sport}
                      </span>
                      <span className="text-xs text-slate-400">
                        {activeGroup.memberIds?.length || 0} Registered Athletes
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {activeGroup.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!(isLeaderView || isManagerView) && (
                      <button
                        type="button"
                        onClick={() => setIsAddMemberModalOpen(true)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Add Athletes</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Manager & Leader Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Manager</span>
                      {!(isLeaderView || isManagerView) && (
                        <button
                          type="button"
                          onClick={() => {
                            setManagerPickerSearch('');
                            setIsManagerModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        {activeManager?.name || activeGroup.managerName || 'No Manager Appointed'}
                      </span>
                      {activeManager && (
                        <span className="text-[11px] text-slate-400">
                          CIC: {activeManager.cicNo} • {classesMap[activeManager.classId]?.name || 'Class'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Leader</span>
                      {!(isLeaderView || isManagerView) && (
                        <button
                          type="button"
                          onClick={() => setIsLeaderModalOpen(true)}
                          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        {activeLeader?.name || activeGroup.leaderName || 'No Leader Appointed'}
                      </span>
                      {activeLeader && (
                        <span className="text-[11px] text-slate-400">
                          CIC: {activeLeader.cicNo} • {classesMap[activeLeader.classId]?.name || 'Class'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Squad Members Roster */}
                <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Enrolled Athletes ({activeGroup.memberIds?.length || 0})
                </h4>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    placeholder="Search athletes..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
                {(activeGroup.memberIds || [])
                  .map(mid => students.find(s => s.id === mid))
                  .filter(Boolean)
                  .filter(st => {
                    if (!searchMember.trim()) return true;
                    const q = searchMember.toLowerCase();
                    return st.name.toLowerCase().includes(q) || st.cicNo?.toLowerCase().includes(q);
                  })
                  .map(st => {
                    const houseTeam = teams.find(t => t.id === st.teamId);
                    return (
                      <div
                        key={st.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: houseTeam?.color || '#0E7C86' }}
                            title={houseTeam?.name || 'No House Team'}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {st.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              CIC: {st.cicNo} • {classesMap[st.classId]?.name || 'Class'} • {houseTeam?.name || 'No House'}
                            </span>
                          </div>
                        </div>

                        {!(isLeaderView || isManagerView) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(st.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove from squad"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          ) : (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-[#0F1B2B] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No sports squad selected. Create a squad or select one from the sidebar.
          </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MATCHES & EVENTS (LIVE SCORES & PUBLISH TOGGLE)
          ========================================================================= */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
      {/* Header & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={matchSportFilter}
            onChange={(e) => setMatchSportFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="all">All Sports Disciplines</option>
            <option value="Athletics & Track">Athletics &amp; Track</option>
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
            <option value="Badminton">Badminton</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Tug of War">Tug of War</option>
          </select>

          <select
            value={matchStatusFilter}
            onChange={(e) => setMatchStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="all">All Match Status</option>
            <option value="scheduled">Scheduled Matches</option>
            <option value="completed">Completed Matches</option>
            <option value="published">Published Live Results</option>
            <option value="draft">Draft (Unpublished)</option>
          </select>
        </div>

        {!(isLeaderView || isManagerView) && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Bulk Import</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddFixture}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Schedule Match</span>
            </button>
          </div>
        )}
      </div>

      {/* Fixtures List */}
      {filteredFixtures.length === 0 ? (
        <div className="py-14 text-center text-slate-400 text-xs bg-white dark:bg-[#0F1B2B] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          No matches found matching your filters. Click "+ Schedule Match" or "Bulk Import" to install events.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFixtures.map(fix => {
            const isCompleted = fix.status === 'completed';
            const g1 = sportsGroups.find(g => g.id === fix.group1Id);
            const g2 = sportsGroups.find(g => g.id === fix.group2Id);
            return (
              <div
                key={fix.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1B2B] space-y-3.5 shadow-xs hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {fix.sport}
                  </span>

                  {/* Result Publish Badge */}
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${fix.isResultPublished
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : isCompleted
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                    {fix.isResultPublished
                      ? '✓ Published Live'
                      : isCompleted
                        ? '⏳ Draft (Unpublished)'
                        : 'Scheduled'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{fix.title}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" /> {fix.date} at {fix.time} • <MapPin className="w-3 h-3" /> {fix.venue}
                  </p>
                </div>

                {/* Match Score Display */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-center min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {fix.group1Name || g1?.name || 'Squad 1'}
                    </span>
                    <span className="text-xl font-black text-emerald-600">{fix.score1}</span>
                  </div>

                  <div className="px-3 text-xs font-bold text-slate-400">VS</div>

                  <div className="text-center min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {fix.group2Name || g2?.name || 'Squad 2'}
                    </span>
                    <span className="text-xl font-black text-emerald-600">{fix.score2}</span>
                  </div>
                </div>

                {/* Points & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isCompleted ? (
                      fix.isResultPublished ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Points counted on leaderboard
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          ⏳ Draft: Publish to add points
                        </span>
                      )
                    ) : (
                      <span>Points pending score entry</span>
                    )}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Publish / Unpublish Live Button */}
                    {!(isLeaderView || isManagerView) && isCompleted && (
                      <button
                        type="button"
                        onClick={() => togglePublishSportsFixture(fix.id, currentUser?.name || 'Convener')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition active:scale-95 cursor-pointer ${fix.isResultPublished
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        title={fix.isResultPublished ? 'Unpublish result' : 'Publish result live to leaderboard'}
                      >
                        {fix.isResultPublished ? (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Publish</span>
                          </>
                        )}
                      </button>
                    )}

                    {!(isLeaderView || isManagerView) && (
                      <button
                        type="button"
                        onClick={() => handleOpenScoring(fix)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Edit Scores' : 'Record Result'}</span>
                      </button>
                    )}

                    {!(isLeaderView || isManagerView) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete match "${fix.title}"?`)) {
                            deleteSportsFixture(fix.id, currentUser?.name || 'Convener');
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: STANDINGS & LEADERBOARD (HOUSE TOTAL POINTS & SQUADS)
          ========================================================================= */}
      {activeTab === 'standings' && (
        <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-500" />
            <span>Collegiate Sports Leaderboard &amp; Team Total Points</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Live team standings automatically aggregated across all published sports events, student athlete marks, and direct placements.
          </p>
        </div>

        {/* View Switcher: House Teams vs Sports Squads */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setStandingsViewMode('teams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${standingsViewMode === 'teams'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>House Teams (Total Points)</span>
          </button>

          <button
            type="button"
            onClick={() => setStandingsViewMode('squads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${standingsViewMode === 'squads'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Sports Squads Table</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: HOUSE TEAMS TOTAL POINTS LEADERBOARD */}
      {standingsViewMode === 'teams' && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {teamStandings.slice(0, 3).map((item, idx) => {
              const medalEmoji = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉');
              const medalTitle = idx === 0 ? '1st Place Champion' : (idx === 1 ? '2nd Place Runner-Up' : '3rd Place');
              const badgeBg = idx === 0
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : (idx === 1
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  : 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700');

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border ${badgeBg} relative overflow-hidden shadow-xs transition hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{medalEmoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-900/60">
                      {medalTitle}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                        {item.name}
                      </h4>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        {item.totalPoints}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total Points
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {item.contestedEvents} events scored • {item.breakdown.length} scoring contributions
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comprehensive House Teams Standings Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3 w-16 text-center">Rank</th>
                  <th className="p-3">House Team</th>
                  <th className="p-3 text-center">Events Scored</th>
                  <th className="p-3 text-center">Athlete Points</th>
                  <th className="p-3 text-center">Placement Points</th>
                  <th className="p-3 text-center">Adjustments (+/-)</th>
                  <th className="p-3 text-center font-black text-emerald-600 dark:text-emerald-400">
                    Total Points
                  </th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teamStandings.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 text-center font-black">
                      {idx === 0 ? '🥇 1' : (idx === 1 ? '🥈 2' : (idx === 2 ? '🥉 3' : `${idx + 1}`))}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                      {item.contestedEvents}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                      {item.studentPointsSum} pts
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                      {item.teamPointsSum} pts
                    </td>
                    <td className="p-3 text-center font-semibold text-amber-600 dark:text-amber-400">
                      {item.bonusPoints !== 0 ? `${item.bonusPoints > 0 ? '+' : ''}${item.bonusPoints} pts` : '-'}
                    </td>
                    <td className="p-3 text-center font-black text-sm text-[#047857] dark:text-emerald-400">
                      {item.totalPoints} pts
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeamForBreakdown(item);
                            setIsTeamBreakdownModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer transition"
                        >
                          Breakdown
                        </button>

                        {!(isLeaderView || isManagerView) && (
                          <button
                            type="button"
                            onClick={() => handleOpenAdjustBonus(item)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold cursor-pointer transition"
                            title="Adjust bonus points"
                          >
                            Adjust (+/-)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: SPORTS SQUADS STANDINGS TABLE */}
      {standingsViewMode === 'squads' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3 w-12 text-center">Rank</th>
                <th className="p-3">Sports Squad</th>
                <th className="p-3">Sport</th>
                <th className="p-3 text-center">P</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">D</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-center font-black text-emerald-600 dark:text-emerald-400">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {groupStandings.map((g, idx) => (
                <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-center font-black">
                    {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                  </td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color || '#047857' }} />
                    <span>{g.name}</span>
                  </td>
                  <td className="p-3 text-slate-500 font-medium">{g.sport}</td>
                  <td className="p-3 text-center font-semibold">{g.played}</td>
                  <td className="p-3 text-center font-semibold text-emerald-600">{g.won}</td>
                  <td className="p-3 text-center font-semibold text-slate-400">{g.drawn}</td>
                  <td className="p-3 text-center font-semibold text-rose-500">{g.lost}</td>
                  <td className="p-3 text-center font-black text-sm text-[#047857] dark:text-emerald-400">
                    {g.totalPoints} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )}

      {/* =========================================================================
          TAB 5: ADD & BULK INSTALL EVENTS
          ========================================================================= */}
      {activeTab === 'add_events' && !(isLeaderView || isManagerView) && (
    <div className="space-y-5">
      {/* Sub Navigation Bar for Add Events */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEventCreationTab('bulk_import')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${eventCreationTab === 'bulk_import'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white dark:bg-[#0F1B2B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Bulk Text Import (Paste Multiple)</span>
          </button>

          <button
            type="button"
            onClick={() => setEventCreationTab('multi_row')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${eventCreationTab === 'multi_row'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white dark:bg-[#0F1B2B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Multi-Row Batch Setup</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenAddFixture}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Single Match</span>
        </button>
      </div>

      {/* Bulk Text Import View */}
      {eventCreationTab === 'bulk_import' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
              <span>Bulk Import Sports Programs &amp; Events</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste multiple sports program names at once (one per line or comma-separated). They will be registered and scheduled immediately.
            </p>
          </div>

          {/* Quick Preset Clickable Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick-Add Standard Events (Click to insert):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                '100m Sprint',
                '200m Sprint',
                '400m Race',
                '800m Run',
                '4x100m Relay',
                'Long Jump',
                'High Jump',
                'Shot Put',
                'Discus Throw',
                'Javelin Throw',
                'Tug of War',
                'Football Championship',
                'Cricket League',
                'Shuttle Badminton Doubles',
                'Volleyball Cup'
              ].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setBulkImportText(prev => {
                      const trimmed = prev.trim();
                      if (!trimmed) return preset;
                      return `${trimmed}\n${preset}`;
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold cursor-pointer transition active:scale-95"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveBulkImport} className="space-y-4">
            <div>
              <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">
                Event Names *
              </label>
              <textarea
                rows={6}
                required
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                placeholder={"100m Sprint\n200m Sprint\n400m Race\nLong Jump\nHigh Jump\nShot Put\nDiscus Throw\nJavelin Throw\n4x100m Relay\nTug of War & Volleyball"}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>One event name per line or separated by commas</span>
                <span>
                  Detected:{' '}
                  <strong className="text-emerald-600 font-bold">
                    {bulkImportText.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean).length} events
                  </strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">
                  Sport Discipline
                </label>
                <select
                  value={bulkImportSport}
                  onChange={(e) => setBulkImportSport(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="Athletics & Track">Athletics &amp; Track</option>
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Tug of War">Tug of War</option>
                  <option value="Team Sport">General Team Sport</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">
                  Default Date
                </label>
                <input
                  type="date"
                  value={bulkImportDate}
                  onChange={(e) => setBulkImportDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">
                  Default Venue
                </label>
                <input
                  type="text"
                  value={bulkImportVenue}
                  onChange={(e) => setBulkImportVenue(e.target.value)}
                  placeholder="College Ground / Arena"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Import All Events Now</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Multi-Row Batch Creator View */}
      {eventCreationTab === 'multi_row' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Multi-Row Batch Event Setup</span>
              </h3>
              <p className="text-xs text-slate-500">
                Add multiple sports competitions in one single spreadsheet-style form.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMultiRow}
              className="px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Row</span>
            </button>
          </div>

          <form onSubmit={handleSaveMultiRows} className="space-y-3">
            <div className="space-y-2.5">
              {multiRows.map((row, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      value={row.title}
                      onChange={(e) => handleMultiRowChange(idx, 'title', e.target.value)}
                      placeholder="Event Title (e.g. Volleyball Cup Match 1)"
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={row.sport}
                      onChange={(e) => handleMultiRowChange(idx, 'sport', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    >
                      <option value="Football">Football</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Athletics & Track">Athletics</option>
                      <option value="Volleyball">Volleyball</option>
                      <option value="Table Tennis">Table Tennis</option>
                      <option value="Tug of War">Tug of War</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => handleMultiRowChange(idx, 'date', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={row.venue}
                      onChange={(e) => handleMultiRowChange(idx, 'venue', e.target.value)}
                      placeholder="Venue (e.g. Main Ground)"
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveMultiRow(idx)}
                      disabled={multiRows.length === 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Save &amp; Install All Events ({multiRows.length})
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )}

      {/* =========================================================================
          TAB 6: SPORTS CERTIFICATES
          ========================================================================= */}
      {activeTab === 'certificates' && (
    <div className="bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Sports Certificates Management</span>
          </h3>
          <p className="text-xs text-slate-500">
            Generate and allocate official verified sports winner &amp; participation certificates for collegiate athletes.
          </p>
        </div>

        {onOpenCertificateModal && (
          <button
            type="button"
            onClick={onOpenCertificateModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>+ Allocate Sports Certificate</span>
          </button>
        )}
      </div>
    </div>
  )}

      {/* =========================================================================
          ALL 12 MODALS (CRITICAL OPERATIONS)
          ========================================================================= */}

      {/* MODAL 1: ADD / EDIT SPORTS GROUP */}
      {isGroupModalOpen && (
    <Modal
      isOpen={isGroupModalOpen}
      onClose={() => setIsGroupModalOpen(false)}
      title={editingGroup ? 'Edit Sports Squad' : 'Create New Sports Squad'}
    >
      <form onSubmit={handleSaveGroup} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Squad Name *</label>
          <input
            type="text"
            required
            value={groupForm.name}
            onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Campus Football Squad"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sport Discipline *</label>
            <select
              value={groupForm.sport}
              onChange={(e) => setGroupForm(prev => ({ ...prev, sport: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Badminton">Badminton</option>
              <option value="Athletics & Track">Athletics &amp; Track</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Table Tennis">Table Tennis</option>
              <option value="Tug of War">Tug of War</option>
              <option value="Chess">Chess</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={groupForm.category}
              onChange={(e) => setGroupForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              <option value="Team Sport">Team Sport</option>
              <option value="Racquet Sport">Racquet Sport</option>
              <option value="Individual & Relay">Individual &amp; Relay</option>
              <option value="Indoor Board">Indoor Board</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Appoint Team Manager (from Student Body)
          </label>
          <select
            value={groupForm.managerId}
            onChange={(e) => setGroupForm(prev => ({ ...prev, managerId: e.target.value }))}
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          >
            <option value="">-- Select Team Manager --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({classesMap[s.classId]?.name || 'Class'}) • CIC: {s.cicNo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Appoint Team Leader
          </label>
          <select
            value={groupForm.leaderId}
            onChange={(e) => setGroupForm(prev => ({ ...prev, leaderId: e.target.value }))}
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          >
            <option value="">-- Select Team Leader --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({classesMap[s.classId]?.name || 'Class'}) • CIC: {s.cicNo}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => setIsGroupModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
          >
            {editingGroup ? 'Save Changes' : 'Create Squad'}
          </button>
        </div>
      </form>
    </Modal>
  )}

  {/* MODAL 2: APPOINT TEAM MANAGER */}
  {isManagerModalOpen && (
    <Modal
      isOpen={isManagerModalOpen}
      onClose={() => setIsManagerModalOpen(false)}
      title={`Appoint Team Manager for ${activeGroup?.name}`}
    >
      <div className="space-y-4 text-xs">
        <input
          type="text"
          value={managerPickerSearch}
          onChange={(e) => setManagerPickerSearch(e.target.value)}
          placeholder="Search student by name or CIC..."
          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
        />

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          {students
            .filter(st => {
              if (!managerPickerSearch.trim()) return true;
              const q = managerPickerSearch.toLowerCase();
              return st.name.toLowerCase().includes(q) || st.cicNo?.toLowerCase().includes(q);
            })
            .slice(0, 50)
            .map(st => {
              const isCurrent = activeGroup?.managerId === st.id;
              return (
                <div
                  key={st.id}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{st.name}</span>
                    <span className="text-[11px] text-slate-400">
                      CIC: {st.cicNo} • {classesMap[st.classId]?.name || 'Class'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectManager(st.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${isCurrent
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                  >
                    {isCurrent ? 'Appointed ✓' : 'Appoint as Manager'}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </Modal>
  )}

  {/* MODAL 3: APPOINT TEAM LEADER */}
  {isLeaderModalOpen && (
    <Modal
      isOpen={isLeaderModalOpen}
      onClose={() => setIsLeaderModalOpen(false)}
      title={`Appoint Team Leader for ${activeGroup?.name}`}
    >
      <div className="space-y-4 text-xs">
        <p className="text-xs text-slate-500">
          Select a team leader from the squad members or student body.
        </p>

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          {(activeGroup?.memberIds || []).map(mid => students.find(s => s.id === mid)).filter(Boolean).map(st => {
            const isCurrent = activeGroup?.leaderId === st.id;
            return (
              <div
                key={st.id}
                className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{st.name}</span>
                  <span className="text-[11px] text-slate-400">
                    CIC: {st.cicNo} • {classesMap[st.classId]?.name || 'Class'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectLeader(st.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${isCurrent
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                >
                  {isCurrent ? 'Appointed ✓' : 'Appoint as Leader'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  )}

  {/* MODAL 4: ADD ATHLETES TO SQUAD */}
  {isAddMemberModalOpen && (
    <Modal
      isOpen={isAddMemberModalOpen}
      onClose={() => setIsAddMemberModalOpen(false)}
      title={`Add Athletes to ${activeGroup?.name}`}
    >
      <div className="space-y-4 text-xs">
        <div className="flex gap-2">
          <input
            type="text"
            value={memberPickerSearch}
            onChange={(e) => setMemberPickerSearch(e.target.value)}
            placeholder="Search student by name or CIC..."
            className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          />
          <select
            value={memberPickerClass}
            onChange={(e) => setMemberPickerClass(e.target.value)}
            className="w-32 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          {eligibleStudentsForPicker.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No eligible students found or all matched students are already enrolled in this squad.
            </div>
          ) : (
            eligibleStudentsForPicker.map(st => (
              <div
                key={st.id}
                className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{st.name}</span>
                  <span className="text-[11px] text-slate-400">
                    CIC: {st.cicNo} • {classesMap[st.classId]?.name || 'Class'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddMemberToActiveGroup(st.id)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer active:scale-95"
                >
                  + Add
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsAddMemberModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )}

  {/* MODAL 5: SCHEDULE SINGLE MATCH */}
  {isFixtureModalOpen && (
    <Modal
      isOpen={isFixtureModalOpen}
      onClose={() => setIsFixtureModalOpen(false)}
      title="Schedule Sports Match"
    >
      <form onSubmit={handleSaveFixture} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Match Title *</label>
          <input
            type="text"
            required
            value={fixtureForm.title}
            onChange={(e) => setFixtureForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Inter-Squad Football League Match 2"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Squad 1 *</label>
            <select
              value={fixtureForm.group1Id}
              onChange={(e) => setFixtureForm(prev => ({ ...prev, group1Id: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              {sportsGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.sport})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Squad 2 *</label>
            <select
              value={fixtureForm.group2Id}
              onChange={(e) => setFixtureForm(prev => ({ ...prev, group2Id: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              {sportsGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.sport})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={fixtureForm.date}
              onChange={(e) => setFixtureForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
            <input
              type="text"
              value={fixtureForm.time}
              onChange={(e) => setFixtureForm(prev => ({ ...prev, time: e.target.value }))}
              placeholder="04:00 PM"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue</label>
            <input
              type="text"
              value={fixtureForm.venue}
              onChange={(e) => setFixtureForm(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="Ground / Court"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => setIsFixtureModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer active:scale-95"
          >
            Schedule Match
          </button>
        </div>
      </form>
    </Modal>
  )}

  {/* MODAL 6: RECORD SCORE, SQUAD POINTS & STUDENT ATHLETE MARKS */}
  {isScoreModalOpen && scoringFixture && (
    <Modal
      isOpen={isScoreModalOpen}
      onClose={() => setIsScoreModalOpen(false)}
      title={`Record Results & Points: ${scoringFixture.title}`}
    >
      <form onSubmit={handleSaveScores} className="space-y-4 text-xs">
        {/* Match Scores (Squad 1 vs Squad 2) */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-center flex-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 truncate">
              {scoringFixture.group1Name}
            </span>
            <input
              type="number"
              min="0"
              value={scoreForm.score1}
              onChange={(e) => setScoreForm(prev => ({ ...prev, score1: e.target.value }))}
              className="w-20 p-2 text-center text-lg font-black rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="font-bold text-slate-400 px-3">VS</div>

          <div className="text-center flex-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 truncate">
              {scoringFixture.group2Name}
            </span>
            <input
              type="number"
              min="0"
              value={scoreForm.score2}
              onChange={(e) => setScoreForm(prev => ({ ...prev, score2: e.target.value }))}
              className="w-20 p-2 text-center text-lg font-black rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Direct House Team Points Awarding */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Award House Team Placement Points</span>
            </label>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              Auto-adds to Team Total Points
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {teams.map(tm => (
              <div key={tm.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tm.color }} />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{tm.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={teamPointsInputs[tm.id] !== undefined ? teamPointsInputs[tm.id] : ''}
                    onChange={(e) => setTeamPointsInputs(prev => ({ ...prev, [tm.id]: Number(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-14 p-1.5 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Student Athlete Event Marks & Podium */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Student Athlete Marks &amp; Placings</span>
              </label>
              <p className="text-[10px] text-slate-500">
                Points awarded to students are automatically credited to their assigned house team!
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddParticipantRow}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Athlete</span>
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {participantPointsList.map((row, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate block">
                    {row.position || `Place #${idx + 1}`}
                  </span>
                </div>

                <div className="col-span-6">
                  <select
                    value={row.studentId}
                    onChange={(e) => handleParticipantChange(idx, 'studentId', e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="">-- Select Student Athlete --</option>
                    {students.map(s => {
                      const tm = teams.find(t => t.id === s.teamId);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({tm?.name || 'No House'}) • CIC: {s.cicNo}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="col-span-2 flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={row.marks}
                    onChange={(e) => handleParticipantChange(idx, 'marks', e.target.value)}
                    placeholder="pts"
                    className="w-full p-1.5 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">pts</span>
                </div>

                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipantRow(idx)}
                    disabled={participantPointsList.length <= 1}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                    title="Remove row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Squad Points (if Squad match) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">
              Points for {scoringFixture.group1Name}
            </label>
            <input
              type="number"
              value={scoreForm.points1}
              onChange={(e) => setScoreForm(prev => ({ ...prev, points1: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">
              Points for {scoringFixture.group2Name}
            </label>
            <input
              type="number"
              value={scoreForm.points2}
              onChange={(e) => setScoreForm(prev => ({ ...prev, points2: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>
        </div>

        {/* Publish Results Option (Publish vs Draft) */}
        <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/80 dark:bg-emerald-950/40 flex items-start gap-3">
          <input
            type="checkbox"
            id="publishImmediatelySportsCheckbox"
            checked={publishImmediately}
            onChange={(e) => setPublishImmediately(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="publishImmediatelySportsCheckbox" className="text-xs cursor-pointer select-none space-y-0.5">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Publish Results to Official Leaderboard &amp; Students</span>
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 block leading-tight">
              When enabled, scores, marks, and team points become live on the public leaderboard and student profiles immediately. If unchecked, scores are saved as a <strong>Draft (Unpublished)</strong> and points will NOT count toward the team leaderboard until you click Publish.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsScoreModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-5 py-2.5 rounded-xl font-extrabold cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5 text-white ${publishImmediately
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
              : 'bg-amber-600 hover:bg-amber-700'
              }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{publishImmediately ? 'Save & Publish Results Live 📢' : 'Save as Draft Results (Unpublished)'}</span>
          </button>
        </div>
      </form>
    </Modal>
  )}

  {/* MODAL 7: BULK IMPORT SPORTS PROGRAMS */}
  {isBulkImportModalOpen && (
    <Modal
      isOpen={isBulkImportModalOpen}
      onClose={() => setIsBulkImportModalOpen(false)}
      title="Bulk Import Sports Programs & Events"
    >
      <form onSubmit={handleSaveBulkImport} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Paste Event Names (One per line or comma-separated) *
          </label>
          <textarea
            rows={6}
            required
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            placeholder={"100m Sprint\n200m Sprint\n400m Race\nLong Jump\nHigh Jump\nShot Put\nDiscus Throw\nJavelin Throw\n4x100m Relay\nTug of War & Volleyball"}
            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Separate by line break or commas</span>
            <span>
              Detected events:{' '}
              <strong className="text-emerald-600 font-bold">
                {bulkImportText.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean).length}
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sport / Discipline
            </label>
            <select
              value={bulkImportSport}
              onChange={(e) => setBulkImportSport(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              <option value="Athletics & Track">Athletics &amp; Track</option>
              <option value="Athletics & Field">Athletics &amp; Field</option>
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Badminton">Badminton</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Table Tennis">Table Tennis</option>
              <option value="Tug of War">Tug of War</option>
              <option value="Team Sport">General Team Sport</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Date
            </label>
            <input
              type="date"
              value={bulkImportDate}
              onChange={(e) => setBulkImportDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Venue
            </label>
            <input
              type="text"
              value={bulkImportVenue}
              onChange={(e) => setBulkImportVenue(e.target.value)}
              placeholder="Main Ground / Track"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsBulkImportModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import All Events</span>
          </button>
        </div>
      </form>
    </Modal>
  )}

  {/* MODAL 8: ASSIGN STUDENTS TO HOUSE TEAM */}
  {isAssignStudentModalOpen && activeHouseTeam && (
    <Modal
      isOpen={isAssignStudentModalOpen}
      onClose={() => setIsAssignStudentModalOpen(false)}
      title={`Assign Students to ${activeHouseTeam.name}`}
    >
      <div className="space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={assignModalSearch}
              onChange={(e) => setAssignModalSearch(e.target.value)}
              placeholder="Search students to assign..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>

          <select
            value={assignModalClass}
            onChange={(e) => setAssignModalClass(e.target.value)}
            className="w-full sm:w-36 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Batch Select Controls */}
        <div className="flex items-center justify-between py-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (selectedStudentIdsForTeam.length === eligibleStudentsForTeamAssignment.length) {
                  setSelectedStudentIdsForTeam([]);
                } else {
                  setSelectedStudentIdsForTeam(eligibleStudentsForTeamAssignment.map(s => s.id));
                }
              }}
              className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              {selectedStudentIdsForTeam.length === eligibleStudentsForTeamAssignment.length && eligibleStudentsForTeamAssignment.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Select All ({eligibleStudentsForTeamAssignment.length})</span>
            </button>
          </div>

          {selectedStudentIdsForTeam.length > 0 && (
            <button
              type="button"
              onClick={handleBatchAssignStudents}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-2xs"
            >
              Assign Selected ({selectedStudentIdsForTeam.length})
            </button>
          )}
        </div>

        {/* Students List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          {eligibleStudentsForTeamAssignment.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No eligible students found matching your criteria.
            </div>
          ) : (
            eligibleStudentsForTeamAssignment.map(st => {
              const currentTeam = teams.find(t => t.id === st.teamId);
              const isChecked = selectedStudentIdsForTeam.includes(st.id);
              return (
                <div
                  key={st.id}
                  className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIdsForTeam(prev => [...prev, st.id]);
                        } else {
                          setSelectedStudentIdsForTeam(prev => prev.filter(x => x !== st.id));
                        }
                      }}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {st.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        CIC: {st.cicNo} • {classesMap[st.classId]?.name || 'Class'}
                        {currentTeam && (
                          <span className="ml-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                            (Currently {currentTeam.name})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAssignStudentToTeam(st.id, activeHouseTeam.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    + Assign
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsAssignStudentModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )}

  {/* MODAL 9: TEAM POINTS BREAKDOWN */}
  {isTeamBreakdownModalOpen && selectedTeamForBreakdown && (
    <Modal
      isOpen={isTeamBreakdownModalOpen}
      onClose={() => setIsTeamBreakdownModalOpen(false)}
      title={`${selectedTeamForBreakdown.name} - Total Points Breakdown`}
    >
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
              Cumulative Score
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {selectedTeamForBreakdown.totalPoints} Total Points
            </span>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <span>{selectedTeamForBreakdown.contestedEvents} Events Scored</span>
            <br />
            <span>{selectedTeamForBreakdown.breakdown.length} Contributions</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
            Detailed Points Log:
          </h4>

          {selectedTeamForBreakdown.breakdown.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No points recorded for this team yet. Record match marks to start populating this table.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
              {selectedTeamForBreakdown.breakdown.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {item.fixtureTitle}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.sport} • {item.source}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                    +{item.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsTeamBreakdownModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )}

  {/* MODAL 10: ADJUST TEAM BONUS POINTS */}
  {isAdjustModalOpen && adjustingTeam && (
    <Modal
      isOpen={isAdjustModalOpen}
      onClose={() => setIsAdjustModalOpen(false)}
      title={`Adjust Points for ${adjustingTeam.name}`}
    >
      <form onSubmit={handleSaveBonusPoints} className="space-y-4 text-xs">
        <p className="text-slate-500 text-xs">
          Manually add bonus points or apply adjustments to {adjustingTeam.name}'s total points tally.
        </p>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Bonus / Adjustment Points (+/-) *
          </label>
          <input
            type="number"
            required
            value={adjustPointsForm.bonusPoints}
            onChange={(e) => setAdjustPointsForm(prev => ({ ...prev, bonusPoints: e.target.value }))}
            placeholder="e.g. 5 or -2"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Reason / Note (Optional)
          </label>
          <input
            type="text"
            value={adjustPointsForm.reason}
            onChange={(e) => setAdjustPointsForm(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="e.g. Fair Play Award, March Past Bonus"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => setIsAdjustModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
          >
            Save Adjustment
          </button>
        </div>
      </form>
    </Modal>
  )}

  {/* MODAL 11: ADD / EDIT SPORTS TEAM */}
  {isTeamModalOpen && (
    <Modal
      isOpen={isTeamModalOpen}
      onClose={() => setIsTeamModalOpen(false)}
      title={editingTeam ? `Edit Team: ${editingTeam.name}` : 'Add New Sports Team'}
    >
      <form onSubmit={handleSaveTeam} className="space-y-4 text-xs">
        <p className="text-slate-500 text-xs">
          {editingTeam
            ? 'Update team name and house color.'
            : 'Create a new sports team for College Sports championships and student allocations.'}
        </p>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Team / House Name *
          </label>
          <input
            type="text"
            required
            value={teamForm.name}
            onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Team Phoenix, Team Ruby, Emerald House"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Team House Color
          </label>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {[
              '#059669', // Emerald
              '#0E7C86', // Teal
              '#0891B2', // Cyan
              '#2563EB', // Blue
              '#4F46E5', // Indigo
              '#7C3AED', // Purple
              '#D97706', // Amber
              '#EA580C', // Orange
              '#E11D48', // Rose
              '#475569'  // Slate
            ].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setTeamForm(prev => ({ ...prev, color: c }))}
                className={`w-7 h-7 rounded-xl transition cursor-pointer border-2 ${teamForm.color === c ? 'border-slate-900 dark:border-white scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                  }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={teamForm.color}
              onChange={(e) => setTeamForm(prev => ({ ...prev, color: e.target.value }))}
              className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
            />
            <input
              type="text"
              value={teamForm.color}
              onChange={(e) => setTeamForm(prev => ({ ...prev, color: e.target.value }))}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs w-28 uppercase font-semibold"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsTeamModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition active:scale-95 shadow-sm"
          >
            {editingTeam ? 'Save Changes' : '+ Create Team'}
          </button>
        </div>
      </form>
    </Modal>
  )}

  {/* MODAL 12: DELETE SPORTS TEAM (DLT TEAM) */}
  {isDeleteTeamModalOpen && teamToDelete && (
    <Modal
      isOpen={isDeleteTeamModalOpen}
      onClose={() => setIsDeleteTeamModalOpen(false)}
      title={`Delete Team: ${teamToDelete.name}`}
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200">
          <p className="font-bold">Are you sure you want to delete this team?</p>
          <p className="text-[11px] mt-1 text-rose-700 dark:text-rose-300">
            Team <strong>"{teamToDelete.name}"</strong> will be removed from College Sports.
          </p>
        </div>

        {(() => {
          const assignedMembers = students.filter(s => s.teamId === teamToDelete.id);
          const otherTeams = teams.filter(t => t.id !== teamToDelete.id);
          return (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>Currently Assigned Students:</span>
                <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {assignedMembers.length} Students
                </span>
              </div>

              {assignedMembers.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reassign these students to:
                  </label>
                  <select
                    value={reassignTeamId}
                    onChange={(e) => setReassignTeamId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    {otherTeams.map(ot => (
                      <option key={ot.id} value={ot.id}>
                        Reassign to {ot.name}
                      </option>
                    ))}
                    <option value="">Unassign (Leave without team)</option>
                  </select>
                </div>
              )}
            </div>
          );
        })()}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsDeleteTeamModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDeleteTeam}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition active:scale-95 shadow-sm"
          >
            Confirm Delete Team
          </button>
        </div>
      </div>
    </Modal>
  )}
</div>
  );
};
