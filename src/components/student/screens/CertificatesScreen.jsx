import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  Download,
  Calendar,
  Award,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { Hero } from '../ui/Hero';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { SectionHeader } from '../ui/SectionHeader';
import { generateCertificatePDF } from '../../../utils/certificate';
import { triggerStudentConfetti } from '../ui/ConfettiHelper';
import { useLanguage } from '../../../context/LanguageContext';
import { isReducedMotion, SPRING_POP } from '../motion';

export const CertificatesScreen = ({
  student,
  certificates = [],
  cl,
  team,
  onBack
}) => {
  const { tr } = useLanguage();
  const reduced = isReducedMotion();
  const [filter, setFilter] = useState('all'); // 'all' | 'merit' | 'participation'
  const [downloadingId, setDownloadingId] = useState(null);

  const filteredCerts = useMemo(() => {
    return (certificates || []).filter(c => {
      if (filter === 'all') return true;
      if (filter === 'merit') {
        return c.category === 'WING_WINNER' || c.rank || c.place || c.type === 'merit';
      }
      if (filter === 'participation') {
        return c.type === 'participation' || (!c.rank && !c.place);
      }
      return true;
    });
  }, [certificates, filter]);

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    try {
      generateCertificatePDF({
        ...cert,
        studentName: cert.studentName || student?.name || 'Student',
        cicNo: cert.cicNo || student?.cicNo || '',
        className: cert.className || cl?.name || student?.className || 'Class',
        teamName: cert.teamName || team?.name || student?.teamName || 'House Team',
        awardTitle: cert.awardTitle || cert.title || cert.programTitle || 'Merit Certificate',
        wingName: cert.wingName || cert.wingShortName || (cert.category?.includes('WING') ? 'Union Wing' : 'MUSF Union'),
        programTitle: cert.programTitle || cert.title || '',
        place: cert.place || (cert.rank === 1 ? '1st' : cert.rank === 2 ? '2nd' : cert.rank === 3 ? '3rd' : ''),
        issueDate: cert.issueDate || cert.issuedDate || cert.createdAt || new Date().toISOString().slice(0, 10),
        citation: cert.citation || `Awarded with distinction for commendable achievement under ${cert.wingName || 'the Students Union'}.`
      });
      triggerStudentConfetti();
    } catch (err) {
      console.error('Certificate generation error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1200);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      <Hero
        variant="inner"
        title={tr('Certificates', 'സർട്ടിഫിക്കറ്റുകൾ')}
        subtitle={tr('Official credentials and verified merit records', 'ഔദ്യോഗിക അംഗീകാര രേഖകൾ')}
        onBack={onBack}
      />

      <div className="px-4 sm:px-6 space-y-6">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: tr('All Certificates', 'എല്ലാം'), count: certificates.length },
            { id: 'merit', label: tr('Merit & Honors', 'മെറിറ്റ്'), count: certificates.filter(c => c.category === 'WING_WINNER' || c.place || c.rank).length },
            { id: 'participation', label: tr('Participation', 'പങ്കാളിത്തം'), count: certificates.filter(c => !c.place && !c.rank).length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#0E7C86] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0B1522] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        <div className="space-y-3">
          <SectionHeader
            title={tr('Verified Documents', 'സാക്ഷ്യപ്പെടുത്തിയ സർട്ടിഫിക്കറ്റുകൾ')}
            subtitle={tr('Digitally signed and verifiable credentials', 'ഡിജിറ്റലായി സാക്ഷ്യപ്പെടുത്തിയത്')}
            badge={filteredCerts.length > 0 ? `${filteredCerts.length}` : undefined}
          />

          {filteredCerts.length === 0 ? (
            <Card className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {tr('No certificates available in this category', 'സർട്ടിഫിക്കറ്റുകൾ ലഭ്യമല്ല')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {tr(
                    'Certificates are published upon conclusion of wing competitions and academic summit sessions.',
                    'മത്സരങ്ങളും പരിപാടികളും പൂർത്തിയാകുമ്പോൾ സർട്ടിഫിക്കറ്റുകൾ ഇവിടെ ലഭ്യമാകും.'
                  )}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCerts.map((cert, idx) => {
                const isDownloading = downloadingId === cert.id;
                const isMerit = cert.place || cert.rank || cert.category === 'WING_WINNER';

                return (
                  <motion.div
                    key={cert.id || idx}
                    initial={reduced ? {} : { opacity: 0, y: 12 }}
                    animate={reduced ? {} : { opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, ...SPRING_POP }}
                  >
                    <Card className="h-full flex flex-col justify-between p-4.5 space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <Tag variant={isMerit ? 'amber' : 'teal'}>
                            {cert.place ? `${cert.place} Prize` : isMerit ? 'Merit Certificate' : 'Participation'}
                          </Tag>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {cert.issueDate || 'Recent'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {cert.awardTitle || cert.title || 'Certificate of Merit'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {cert.wingName || 'Students Union Directorate'}
                          </p>
                        </div>

                        {cert.citation && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            "{cert.citation}"
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="text-[11px] text-slate-400 font-medium">
                          ID: {cert.id?.slice(0, 14)}...
                        </div>
                        <motion.button
                          type="button"
                          whileTap={reduced ? undefined : { scale: 0.94 }}
                          onClick={() => handleDownload(cert)}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#0E7C86] hover:bg-[#0c6b74] text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
                        >
                          {isDownloading ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
                              <span>Generated</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
