import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  Calendar,
  Users,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Hero } from '../ui/Hero';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { ListRow } from '../ui/ListRow';
import { SectionHeader } from '../ui/SectionHeader';
import { triggerStudentConfetti } from '../ui/ConfettiHelper';
import { useLanguage } from '../../../context/LanguageContext';
import { isReducedMotion } from '../motion';

export const WingsListScreen = ({
  wings = [],
  wingPrograms = [],
  unionOfficials = [],
  onBack,
  onOpenDrawer,
  onNavigate
}) => {
  const { tr } = useLanguage();
  const reduced = isReducedMotion();
  const [selectedWing, setSelectedWing] = useState(null);

  // If a wing is selected, show Wing Detail Screen
  if (selectedWing) {
    const wingProgs = (wingPrograms || []).filter(p => p.wingId === selectedWing.id && p.type !== 'meeting');
    const wingConveners = (unionOfficials || []).filter(o => o.assignedWingId === selectedWing.id);

    return (
      <div className="space-y-6 pb-12 select-none">
        <Hero
          variant="inner"
          title={selectedWing.name}
          subtitle={`${selectedWing.shortName} Wing &bull; Autonomous Co-curricular Directorate`}
          onBack={() => setSelectedWing(null)}
        />

        <div className="px-4 sm:px-6 space-y-6">
          {/* Wing Description Card */}
          <Card className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {tr('About this Wing', 'വിംഗിനെ കുറിച്ച്')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {selectedWing.description || 'Promoting leadership, creativity, and student excellence across the campus.'}
            </p>
          </Card>

          {/* Wing Conveners */}
          {wingConveners.length > 0 && (
            <div className="space-y-2.5">
              <SectionHeader
                title={tr('Wing Conveners', 'വിംഗ് കൺവീനർമാർ')}
                subtitle={tr('Official student coordinators for this wing', 'ഈ വിംഗിന്റെ ഭാരവാഹികൾ')}
                icon={Users}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {wingConveners.map((conv, idx) => (
                  <Card key={conv.id || idx} className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#0E7C86] dark:text-teal-400">
                      {conv.designation}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0F2A4A] dark:text-white">
                      {conv.name}
                    </h4>
                    {conv.phone && (
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {conv.phone}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Wing Activities & Programs */}
          <div className="space-y-2.5">
            <SectionHeader
              title={tr('Activities & Programs', 'പരിപാടികൾ')}
              subtitle={`${wingProgs.length} activities scheduled under ${selectedWing.shortName}`}
              icon={Calendar}
            />

            {wingProgs.length === 0 ? (
              <Card className="text-center py-6 text-slate-400 text-xs">
                {tr('No events scheduled for this wing yet.', 'ഈ വിംഗിൽ പുതിയ പരിപാടികൾ ചേർത്തിട്ടില്ല.')}
              </Card>
            ) : (
              <div className="space-y-2.5">
                {wingProgs.map((prog, idx) => (
                  <Card key={prog.id || idx} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#0F2A4A] dark:text-white">
                          {prog.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {prog.description || 'Campus student competition and activity.'}
                        </p>
                      </div>

                      <Tag variant="grey" size="sm">
                        {prog.type === 'competition' ? 'Contest' : 'Activity'}
                      </Tag>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {prog.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{prog.date}</span>
                        </span>
                      )}
                      {prog.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{prog.venue}</span>
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Wings List Screen
  return (
    <div className="space-y-6 pb-12 select-none">
      <Hero
        variant="inner"
        title={tr('Union Wings', 'യൂണിയൻ വിംഗുകൾ')}
        subtitle={tr('Autonomous co-curricular directorates of MUSF', 'സ്വതന്ത്ര വിദ്യാർത്ഥി വിംഗുകൾ')}
        onBack={onBack}
      />

      <div className="px-4 sm:px-6 space-y-3">
        {wings.map((w, idx) => {
          const progCount = (wingPrograms || []).filter(p => p.wingId === w.id && p.type !== 'meeting').length;
          const convCount = (unionOfficials || []).filter(o => o.assignedWingId === w.id).length;

          return (
            <Card
              key={w.id || idx}
              onClick={() => setSelectedWing(w)}
              className="space-y-3 hover:border-teal-500/50 transition cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${w.color || '#0E7C86'}18`,
                      color: w.color || '#0E7C86'
                    }}
                  >
                    <Folder className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#0F2A4A] dark:text-white truncate">
                      {w.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {progCount} activities &bull; {convCount} conveners
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {w.description && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {w.description}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

