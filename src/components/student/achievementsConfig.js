/**
 * Student Dynamic Achievements Computation
 * Computed strictly from existing live student data with zero mock data.
 */

export const computeStudentAchievements = ({
  student,
  myRegisteredWingPrograms = [],
  myUnionWins = [],
  myCertificates = [],
  mySummitEntries = [],
  team
}) => {
  const registeredCount = myRegisteredWingPrograms.length;
  const winsCount = myUnionWins.length;
  const firstPlacesCount = myUnionWins.filter(w => w.place === '1st').length;
  const certificatesCount = myCertificates.length;
  const summitEntriesCount = mySummitEntries.length;

  // Distinct wings participated in
  const distinctWings = new Set();
  myRegisteredWingPrograms.forEach(r => {
    if (r.program?.wingId) distinctWings.add(r.program.wingId);
    if (r.wing?.id) distinctWings.add(r.wing.id);
  });
  myUnionWins.forEach(w => {
    if (w.program?.wingId) distinctWings.add(w.program.wingId);
    if (w.wing?.id) distinctWings.add(w.wing.id);
  });

  const badges = [
    {
      id: 'first_step',
      title: 'First Step',
      description: 'Registered for your first union activity or event',
      icon: 'Footprints',
      category: 'Participation',
      color: '#0E7C86',
      earned: registeredCount >= 1,
      hint: 'Register for any upcoming program or workshop',
      progress: `${Math.min(registeredCount, 1)}/1`
    },
    {
      id: 'active_member',
      title: 'Active Participant',
      description: 'Registered for 3 or more campus events',
      icon: 'Sparkles',
      category: 'Participation',
      color: '#6366F1',
      earned: registeredCount >= 3,
      hint: `Register for ${Math.max(0, 3 - registeredCount)} more program${3 - registeredCount === 1 ? '' : 's'}`,
      progress: `${Math.min(registeredCount, 3)}/3`
    },
    {
      id: 'summit_contender',
      title: 'Summit Contender',
      description: 'Nominated for Fine Arts Summit stage or off-stage events',
      icon: 'Palette',
      category: 'Arts & Culture',
      color: '#EC4899',
      earned: summitEntriesCount >= 1,
      hint: 'Get nominated by your house leader for a summit event',
      progress: `${Math.min(summitEntriesCount, 1)}/1`
    },
    {
      id: 'podium_finisher',
      title: 'Podium Finisher',
      description: 'Secured a 1st, 2nd, or 3rd place in any collegiate competition',
      icon: 'Medal',
      category: 'Excellence',
      color: '#F59E0B',
      earned: winsCount >= 1,
      hint: 'Win a podium finish in any collegiate competition',
      progress: `${Math.min(winsCount, 1)}/1`
    },
    {
      id: 'gold_champion',
      title: 'Gold Medalist',
      description: 'Secured 1st place champion honor in a college contest',
      icon: 'Crown',
      category: 'Excellence',
      color: '#D97706',
      earned: firstPlacesCount >= 1,
      hint: 'Win 1st place in any collegiate competition',
      progress: `${Math.min(firstPlacesCount, 1)}/1`
    },
    {
      id: 'certified_merit',
      title: 'Merit Holder',
      description: 'Awarded an official verified certificate of merit or honor',
      icon: 'Award',
      category: 'Honors',
      color: '#10B981',
      earned: certificatesCount >= 1,
      hint: 'Earn a verified co-curricular certificate from any wing',
      progress: `${Math.min(certificatesCount, 1)}/1`
    },
    {
      id: 'multi_talented',
      title: 'Multi-Talented',
      description: 'Engaged across 2 or more distinct union wings',
      icon: 'Layers',
      category: 'Diversity',
      color: '#8B5CF6',
      earned: distinctWings.size >= 2,
      hint: 'Participate in activities across at least 2 different wings',
      progress: `${Math.min(distinctWings.size, 2)}/2 wings`
    },
    {
      id: 'house_pillar',
      title: 'House Pillar',
      description: 'Proud member of an official collegiate house team',
      icon: 'Shield',
      category: 'Affiliation',
      color: '#3B82F6',
      earned: Boolean(team || student?.teamId),
      hint: 'Join an active house team roster',
      progress: team ? team.name : 'Unassigned'
    }
  ];

  return badges;
};
