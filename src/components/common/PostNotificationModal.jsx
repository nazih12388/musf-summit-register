import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from './Modal';
import {
  Bell,
  Megaphone,
  Sparkles,
  Send,
  Users,
  Shield,
  Layers,
  Crown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export const PostNotificationModal = ({
  isOpen,
  onClose,
  defaultWingId = null,
  onNotificationPosted
}) => {
  const { currentUser } = useAuth();
  const { tr, lang } = useLanguage();
  const { wings = [], sendNotification, addAuditLog } = useApp();

  const isConvener = currentUser?.role === 'convener';
  const isExecutive = currentUser?.role === 'executive';
  const isAdmin = currentUser?.role === 'admin';

  // Determine user's assigned wing if convener
  const convenerWingId = isConvener ? (currentUser?.assignedWingId || defaultWingId || 'sports') : null;
  const convenerWing = wings.find(w => w.id === convenerWingId);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all'); // 'all', 'students', 'leaders', 'judges'
  const [wingScope, setWingScope] = useState(() => defaultWingId || convenerWingId || 'all');
  const [priority, setPriority] = useState('broadcast'); // 'broadcast', 'urgent'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const targetWing = wings.find(w => w.id === wingScope);

  const authorName = currentUser?.name || (isAdmin ? 'Directorate Admin' : isExecutive ? 'Union Chairman' : 'Wing Convener');
  const authorDesignation = currentUser?.designation || (isAdmin ? 'Administrator' : isExecutive ? 'Union Chairman' : `${convenerWing?.shortName || 'Wing'} Convener`);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const resolvedWingId = isConvener ? convenerWingId : (wingScope === 'all' ? null : wingScope);
    const resolvedWingName = resolvedWingId ? (wings.find(w => w.id === resolvedWingId)?.name || null) : null;

    const newNotif = sendNotification(
      audience,
      title.trim(),
      message.trim(),
      priority,
      {
        wingId: resolvedWingId,
        wingName: resolvedWingName,
        linkTab: resolvedWingId === 'sports' ? 'sports' : (resolvedWingId === 'fine_arts' ? 'summit_register' : 'programs')
      },
      {
        name: authorName,
        role: currentUser?.role || 'admin',
        designation: authorDesignation,
        wingId: resolvedWingId,
        wingName: resolvedWingName
      }
    );

    addAuditLog(
      currentUser?.username || 'system',
      'POST_NOTIFICATION',
      `${authorDesignation} (${authorName}) posted notification: "${title.trim()}" [Audience: ${audience}]`
    );

    setIsSubmitting(false);
    setSuccessToast(tr('Notification broadcasted successfully!', 'അറിയിപ്പ് വിജയകരമായി അയച്ചു!'));

    if (typeof onNotificationPosted === 'function') {
      onNotificationPosted(newNotif);
    }

    setTimeout(() => {
      setSuccessToast('');
      setTitle('');
      setMessage('');
      if (typeof onClose === 'function') onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tr('Post Official Notification', 'ഔദ്യോഗിക അറിയിപ്പ് നൽകുക')}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author / Poster Badge Header */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/60 dark:from-slate-900/60 dark:to-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F2A4A] to-[#0E7C86] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {isAdmin ? <Shield className="w-5 h-5 text-amber-300" /> : isExecutive ? <Crown className="w-5 h-5 text-amber-300" /> : <Megaphone className="w-5 h-5 text-cyan-200" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200">
                  {authorDesignation}
                </span>
                {convenerWing && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: convenerWing.color || '#0E7C86' }}
                  >
                    {convenerWing.shortName}
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {authorName}
              </h4>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-white/70 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Real Author
          </span>
        </div>

        {/* Success Feedback Alert */}
        {successToast && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Notification Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {tr('Notification Title', 'അറിയിപ്പിന്റെ ശീർഷകം')} *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isConvener
                ? `e.g., [${convenerWing?.shortName || 'Wing'}] Event Registration & Schedule Update`
                : isExecutive
                ? 'e.g., [Union Council] General Student Assembly Tomorrow'
                : 'e.g., Important Official Directorate Notice'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/50"
          />
        </div>

        {/* Notification Body / Message Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {tr('Message Body / Description', 'വിശദാംശങ്ങൾ')} *
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={tr(
              'Enter the complete message, guidelines, time, venue, or instructions for recipients...',
              'പൂർണ്ണ വിവരങ്ങൾ, സമയം, സ്ഥലം, വിദ്യാർത്ഥികൾക്കുള്ള നിർദ്ദേശങ്ങൾ എന്നിവ രേഖപ്പെടുത്തുക...'
            )}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/50 leading-relaxed"
          />
        </div>

        {/* Target Audience & Wing Scope Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#0E7C86]" />
              <span>{tr('Target Audience', 'സ്വീകർത്താക്കൾ')}</span>
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/50"
            >
              <option value="all">{tr('All Users (Students, Leaders, Staff)', 'എല്ലാവരും (Broadcast)')}</option>
              <option value="students">{tr('Students Only', 'വിദ്യാർത്ഥികൾ മാത്രം')}</option>
              <option value="leaders">{tr('House Team Leaders Only', 'ടീം ലീഡർമാർ മാത്രം')}</option>
              <option value="judges">{tr('Judges & Evaluators Only', 'ജഡ്ജിമാർ മാത്രം')}</option>
            </select>
          </div>

          {/* Wing Scope (for Admin / Executive, or locked for convener) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>{tr('Wing Scope', 'വിംഗ്')}</span>
            </label>
            {isConvener ? (
              <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: convenerWing?.color || '#0E7C86' }} />
                <span>{convenerWing?.name || 'Assigned Wing'}</span>
              </div>
            ) : (
              <select
                value={wingScope}
                onChange={(e) => setWingScope(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/50"
              >
                <option value="all">{tr('All Wings / General Union Notice', 'പൊതുവായത് (All Wings)')}</option>
                {wings.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Priority Selector Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {tr('Notification Priority', 'മുൻഗണന')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPriority('broadcast')}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                priority === 'broadcast'
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-[#0E7C86] dark:text-teal-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tr('Standard Announcement', 'സാധാരണ അറിയിപ്പ്')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPriority('urgent')}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                priority === 'urgent'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{tr('Urgent Alert ⚡', 'അടിയന്തിരം ⚡')}</span>
            </button>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {tr('Cancel', 'റദ്ദാക്കുക')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !message.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F2A4A] via-[#163860] to-[#0E7C86] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-950/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? tr('Posting...', 'അയക്കുന്നു...') : tr('Post Notification', 'അറിയിപ്പ് പോസ്റ്റ് ചെയ്യുക')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
