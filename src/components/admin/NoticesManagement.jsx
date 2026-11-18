import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Bell,
  Plus,
  Send,
  Eye,
  Trash2,
  Edit2,
  Calendar,
  Users,
  Pin,
  CheckCircle2,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export const NoticesManagement = () => {
  const {
    notices,
    notifications,
    students,
    classes,
    teams,
    programs,
    addNotice,
    updateNotice,
    deleteNotice
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('notices'); // 'notices' or 'history'
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedNoticeToView, setSelectedNoticeToView] = useState(null);
  const [deletingNoticeId, setDeletingNoticeId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [status, setStatus] = useState('published'); // 'draft', 'scheduled', 'published'
  const [publishTime, setPublishTime] = useState(new Date().toISOString().slice(0, 16));
  const [pinned, setPinned] = useState(false);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || n.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [notices, searchQuery, statusFilter]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!title || !message) return;

    addNotice({
      title,
      message,
      audience,
      status,
      publishTime,
      pinned,
      author: currentUser?.name || 'College Directorate'
    }, currentUser?.username);

    setIsComposerOpen(false);
    setTitle('');
    setMessage('');
    setPinned(false);
  };

  const handleTogglePin = (notice) => {
    updateNotice(notice.id, { pinned: !notice.pinned }, currentUser?.username);
  };

  const handleTogglePublishStatus = (notice) => {
    const next = notice.status === 'published' ? 'draft' : 'published';
    updateNotice(notice.id, { status: next }, currentUser?.username);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0E7C86]" />
            <span>Official Notices & Announcements</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {notices.length} Notices
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Publish targeted notices (All, Leaders, Judges, Students, Specific Teams/Classes) with read tracking and scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden text-xs">
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-3 py-1.5 font-semibold ${activeTab === 'notices' ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white' : 'bg-white dark:bg-slate-900'}`}
            >
              Notices
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 font-semibold ${activeTab === 'history' ? 'bg-[#0F2A4A] dark:bg-[#0E7C86] text-white' : 'bg-white dark:bg-slate-900'}`}
            >
              Push History ({notifications.length})
            </button>
          </div>

          <button
            onClick={() => setIsComposerOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Notice</span>
          </button>
        </div>
      </div>

      {activeTab === 'notices' ? (
        <>
          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notices by title or content..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">All Statuses (Draft, Scheduled, Published)</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>

          {/* Notices Cards List */}
          <div className="space-y-3">
            {filteredNotices.map(notice => {
              const readCount = notice.readBy?.length || 0;

              return (
                <div
                  key={notice.id}
                  className={`p-5 rounded-xl bg-white dark:bg-[#0F1B2B] border shadow-xs transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    notice.pinned ? 'border-amber-400 dark:border-amber-600' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {notice.pinned && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold flex items-center gap-1 text-[10px]">
                          <Pin className="w-3 h-3" /> PINNED
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        notice.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                        notice.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {notice.status}
                      </span>

                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                        Audience: {notice.audience}
                      </span>

                      <span className="text-slate-400 text-[11px]">
                        {notice.date} • By {notice.author}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-[#0F2A4A] dark:text-white">
                      {notice.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl line-clamp-3">
                      {notice.message}
                    </p>

                    <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                      <span>👁️ Read by <strong>{readCount}</strong> users</span>
                      {notice.status === 'scheduled' && (
                        <span>⏰ Scheduled for: {notice.publishTime}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleTogglePin(notice)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                        notice.pinned ? 'text-amber-600 bg-amber-50 dark:bg-amber-950' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                      title={notice.pinned ? "Unpin notice" : "Pin notice"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleTogglePublishStatus(notice)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {notice.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>

                    <button
                      onClick={() => setDeletingNoticeId(notice.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Notification History Page */
        <div className="bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Notification Title</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {notifications.map(n => {
                  const student = students.find(s => s.id === n.userId);
                  return (
                    <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(n.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {student ? `${student.name} (${student.chestNo})` : n.userId}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#0F2A4A] dark:text-[#0E7C86]">
                        {n.title}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        {n.message}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          n.read ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {n.read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compose Notice Modal */}
      <Modal isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} title="Compose Official Notice" maxWidth="max-w-lg">
        <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update for November Summit Colloquium"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">All Users & Roles</option>
                <option value="leaders">Only Team Leaders</option>
                <option value="judges">Only Judges</option>
                <option value="students">Only Students</option>
                <option value="class1">Class 1 Students</option>
                <option value="class5">Class 5 (Post Graduate)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Publish Workflow</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="published">Publish Now</option>
                <option value="scheduled">Schedule for Later</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
          </div>

          {status === 'scheduled' && (
            <div>
              <label className="block font-semibold mb-1">Schedule Date & Time</label>
              <input
                type="datetime-local"
                value={publishTime}
                onChange={(e) => setPublishTime(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1">Notice Body Message</label>
            <textarea
              rows="5"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter full notice announcement details..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded text-[#0E7C86]"
              />
              <span className="font-semibold">Mark as Pinned / High Priority Announcement</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold rounded-lg mt-3"
          >
            {status === 'published' ? 'Publish Announcement Now' : status === 'scheduled' ? 'Schedule Announcement' : 'Save as Draft'}
          </button>
        </form>
      </Modal>

      {/* Delete Notice Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deletingNoticeId)}
        onClose={() => setDeletingNoticeId(null)}
        onConfirm={() => {
          if (deletingNoticeId) {
            deleteNotice(deletingNoticeId, currentUser?.username);
            setDeletingNoticeId(null);
          }
        }}
        title="Delete Notice"
        message="Are you sure you want to delete this official announcement?"
      />
    </div>
  );
};
