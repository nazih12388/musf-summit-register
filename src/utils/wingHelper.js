/**
 * Wing Identification & Dashboard Routing Helper
 * Majlis Umariyya Wafy College - MUSF Students' Union
 */

export const resolveConvenerWing = (user, wings = [], unionOfficials = []) => {
  if (!user) return null;

  // 1. Find matching official record from unionOfficials list
  const matchingOfficial = (unionOfficials || []).find(o =>
    (o.username && o.username.toLowerCase() === user.username?.toLowerCase()) ||
    (o.id && o.id === user.id) ||
    (o.studentId && (o.studentId === user.id || o.studentId === user.studentId)) ||
    (o.cicNo && (o.cicNo === user.cicNo || o.cicNo === user.username))
  );

  const rawCandidates = [
    user.assignedWingId,
    user.wingId,
    user.wing,
    user.wingName,
    matchingOfficial?.assignedWingId,
    matchingOfficial?.wingId,
    user.designation,
    matchingOfficial?.designation,
    user.username
  ].filter(Boolean).map(s => String(s).toLowerCase().trim());

  const matchesKeyword = (kw) => rawCandidates.some(c => c.includes(kw.toLowerCase()));

  // 2. Direct exact Wing ID match against available wings
  if (Array.isArray(wings) && wings.length > 0) {
    for (const w of wings) {
      if (rawCandidates.some(c =>
        c === w.id.toLowerCase() ||
        c === w.name.toLowerCase() ||
        c === w.shortName?.toLowerCase() ||
        c === w.code?.toLowerCase()
      )) {
        return w;
      }
    }
  }

  // 3. Keyword / substring based matching
  if (matchesKeyword('sport') || matchesKeyword('sgw')) {
    return wings.find(w => w.id === 'sports') || {
      id: 'sports',
      name: 'Sports & Games Wing',
      shortName: 'Sports',
      color: '#D97706',
      icon: 'Trophy',
      description: 'Annual athletic meets, football, cricket, badminton, volleyball, and physical wellness'
    };
  }

  if (matchesKeyword('fine') || matchesKeyword('art') || matchesKeyword('faw') || matchesKeyword('summit')) {
    return wings.find(w => w.id === 'fine_arts') || {
      id: 'fine_arts',
      name: 'Fine Arts Wing',
      shortName: 'Fine Arts',
      color: '#0E7C86',
      icon: 'Palette',
      isSummitModule: true,
      description: 'Arts, cultural summits, creative performances, master literary & stage competitions'
    };
  }

  if (matchesKeyword('lit') || matchesKeyword('publicat') || matchesKeyword('lpw')) {
    return wings.find(w => w.id === 'literary') || {
      id: 'literary',
      name: 'Literary & Publication Wing',
      shortName: 'Literary',
      color: '#334E73',
      icon: 'BookOpen',
      description: 'College magazines, journals, debates, speeches, and creative writing colloquiums'
    };
  }

  if (matchesKeyword('dawah') || matchesKeyword('social') || matchesKeyword('ssdw')) {
    return wings.find(w => w.id === 'dawah') || {
      id: 'dawah',
      name: "Social Service & Da'wah Wing",
      shortName: "Da'wah & Social",
      color: '#10B981',
      icon: 'HeartHandshake',
      description: "Community outreach, charity missions, social service camps, and ethical da'wah drives"
    };
  }

  if (matchesKeyword('acad') || matchesKeyword('research') || matchesKeyword('arw')) {
    return wings.find(w => w.id === 'academic') || {
      id: 'academic',
      name: 'Academic & Research Wing',
      shortName: 'Academic',
      color: '#6366F1',
      icon: 'GraduationCap',
      description: 'Scholarly paper presentations, intellectual symposiums, research circles, and seminars'
    };
  }

  if (matchesKeyword('media') || matchesKeyword('it') || matchesKeyword('mitw')) {
    return wings.find(w => w.id === 'media') || {
      id: 'media',
      name: 'Media & IT Wing',
      shortName: 'Media & IT',
      color: '#8B5CF6',
      icon: 'Camera',
      description: 'Campus multimedia, web management, event photography, graphic design & digital broadcasting'
    };
  }

  // 4. Default fallback: first wing if available, or generic wing
  return (wings && wings[0]) || {
    id: 'general',
    name: 'Union Wing',
    shortName: 'Wing',
    color: '#0E7C86',
    icon: 'Folder',
    description: 'Autonomous Wing Programs & Co-curricular Operations'
  };
};

export const isMandatoryWing = (wing) => {
  if (!wing) return false;
  const id = String(wing.id || '').toLowerCase().trim();
  const name = String(wing.name || '').toLowerCase().trim();
  const code = String(wing.code || '').toLowerCase().trim();
  return (
    wing.isMandatory === true ||
    wing.isSummitModule === true ||
    id === 'fine_arts' ||
    id === 'fine-arts' ||
    id === 'sports' ||
    id === 'sports-wing' ||
    code === 'faw' ||
    code === 'sgw' ||
    name.includes('fine art') ||
    name.includes('sport')
  );
};

export const isSportsWingConvener = (user, wings = [], unionOfficials = []) => {
  const wing = resolveConvenerWing(user, wings, unionOfficials);
  if (!wing) return false;
  const id = String(wing.id || '').toLowerCase().trim();
  const name = String(wing.name || '').toLowerCase().trim();
  const code = String(wing.code || '').toLowerCase().trim();
  return id === 'sports' || id === 'sports-wing' || code === 'sgw' || name.includes('sport');
};

export const isFineArtsWingConvener = (user, wings = [], unionOfficials = []) => {
  const wing = resolveConvenerWing(user, wings, unionOfficials);
  if (!wing) return false;
  const id = String(wing.id || '').toLowerCase().trim();
  const name = String(wing.name || '').toLowerCase().trim();
  const code = String(wing.code || '').toLowerCase().trim();
  return wing.isSummitModule === true || id === 'fine_arts' || id === 'fine-arts' || code === 'faw' || name.includes('fine art') || name.includes('summit');
};
