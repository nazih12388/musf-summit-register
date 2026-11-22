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
  Filter,
  Sparkles,
  Megaphone
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
    deleteNotice,
    sendNotification,
    deleteNotification,
    clearAllNotifications
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('notices'); // 'notices' or 'history'
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [selectedNoticeToView, setSelectedNoticeToView] = useState(null);
  const [deletingNoticeId, setDeletingNoticeId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState('');

  // Form states - Notice
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [status, setStatus] = useState('published'); // 'draft', 'scheduled', 'published'
  const [publishTime, setPublishTime] = useState(new Date().toISOString().slice(0, 16));
  const [pinned, setPinned] = useState(false);
  const [broadcastAsPopup, setBroadcastAsPopup] = useState(true);

  // Form states - Instant Push Notification
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifAudience, setNotifAudience] = useState('all');
  const [notifType, setNotifType] = useState('broadcast'); // 'broadcast', 'urgent', 'general'
  const [alsoPostAsNotice, setAlsoPostAsNotice] = useState(true);

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
      title: title.trim(),
      message: message.trim(),
      audience,
      status,
      publishTime,
      pinned,
      author: currentUser?.name || 'College Directorate'
    }, currentUser?.username);

    // If marked as broadcast popup and published, dispatch push notification
    if (broadcastAsPopup && status === 'published') {
      sendNotification(
        audience,
        title.trim(),
        message.trim(),
        pinned ? 'urgent' : 'broadcast'
      );
    }

    setFeedbackToast('Notice published successfully!' + (broadcastAsPopup ? ' Live animated pop-up notification dispatched.' : ''));
    setTimeout(() => setFeedbackToast(''), 4500);

    setIsComposerOpen(false);
    setTitle('');
    setMessage('');
    setPinned(false);
  };

  const handleSendNotificationSubmit = (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    sendNotification(
      notifAudience,
      notifTitle.trim(),
      notifMessage.trim(),
      notifType,
      {
        author: currentUser?.name || 'Administrator',
        authorRole: currentUser?.role || 'admin',
        authorDesignation: currentUser?.designation || 'Central Administration',
        wingId: null,
        wingName: 'Central Administration'
      }
    );

    if (alsoPostAsNotice) {
      addNotice({
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        audience: notifAudience,
        status: 'published',
        pinned: notifType === 'urgent' || notifType === 'broadcast',
        author: currentUser?.name || 'College Directorate'
      }, currentUser?.username);
    }

    setFeedbackToast('Push notification broadcast successfully! All users will see the animated popup on their screens.');
    setTimeout(() => setFeedbackToast(''), 5000);

    setIsNotifModalOpen(false);
    setNotifTitle('');
    setNotifMessage('');
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
      {/* Success Feedback Toast */}
      {feedbackToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-semibold text-xs flex items-center justify-between border border-emerald-200 dark:border-emerald-800 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <button
            onClick={() => setFeedbackToast('')}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 text-sm font-bold ml-3 px-2 py-0.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            ✕
          </button>
        </div>
      )}

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
            Publish targeted notices & live animated broadcast notifications across all user logins with real-time delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            type="button"
            onClick={() => setIsNotifModalOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
            title="Dispatch instant animated broadcast notification to all user logins"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Send Push Notification</span>
          </button>

          <button
            onClick={() => setIsComposerOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
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
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Read by <strong>{readCount}</strong> users</span>
                      </span>
                      {notice.status === 'scheduled' && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Scheduled for: {notice.publishTime}</span>
                        </span>
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
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing total <span className="font-bold text-slate-800 dark:text-slate-200">{notifications.length}</span> push notification(s) sent.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(true)}
                className="py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>+ Send Push Notification</span>
              </button>

              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL push notifications history?')) {
                      clearAllNotifications(null, currentUser?.username);
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F1B2B] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left text-xs min-w-[580px] sm:min-w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Sender / Wing</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Notification Title</th>
                    <th className="py-3 px-4">Message</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center space-y-3">
                        <p className="text-slate-400">No push notifications sent yet.</p>
                        <button
                          type="button"
                          onClick={() => setIsNotifModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Dispatch First Broadcast Notification</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    notifications.map(n => {
                      const student = students.find(s => s.id === n.userId);
                      return (
                        <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(n.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {n.author || 'Admin / Union Official'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {n.wingName || n.authorDesignation || 'Central Council'}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                            {student ? student.name : (n.userId === 'all' ? '📢 All Users (Broadcast)' : n.userId)}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#0F2A4A] dark:text-[#0E7C86]">
                            {n.title}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                            {n.message}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              n.read ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {n.read ? 'Read' : 'Live / Active'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this notification?')) {
                                  deleteNotification(n.id, currentUser?.username);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                              title="Delete Notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
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

          <div className="space-y-2">
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

            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg border border-teal-200 dark:border-teal-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={broadcastAsPopup}
                  onChange={(e) => setBroadcastAsPopup(e.target.checked)}
                  className="rounded text-[#0E7C86]"
                />
                <span className="font-semibold text-teal-900 dark:text-teal-200">
                  ✨ Also dispatch as live animated pop-up window across all user logins
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0F2A4A] dark:bg-[#0E7C86] text-white font-semibold rounded-lg mt-3"
          >
            {status === 'published' ? 'Publish Announcement Now' : status === 'scheduled' ? 'Schedule Announcement' : 'Save as Draft'}
          </button>
        </form>
      </Modal>

      {/* Send Instant Push Notification Modal */}
      <Modal isOpen={isNotifModalOpen} onClose={() => setIsNotifModalOpen(false)} title="Broadcast Push Notification & Live Pop-up" maxWidth="max-w-lg">
        <form onSubmit={handleSendNotificationSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Instant Animated Pop-Up:</strong> This announcement will appear immediately as an eye-catching, animated pop-up modal window with glowing animated text when students, leaders, or any user logs into the app.
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Notification Title *</label>
            <input
              type="text"
              required
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="e.g. Urgent Notice: College Summit Rescheduled to 03:00 PM"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Target Audience</label>
              <select
                value={notifAudience}
                onChange={(e) => setNotifAudience(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">📢 All Users (Everyone)</option>
                <option value="students">🎓 Students Only</option>
                <option value="leaders">⭐ House Leaders Only</option>
                <option value="judges">⚖️ Judges Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Notification Priority</label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="broadcast">✨ Standard Broadcast</option>
                <option value="urgent">🚨 Urgent Alert</option>
                <option value="general">ℹ️ General Information</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Notification Message / Announcement Body *</label>
            <textarea
              rows="4"
              required
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="Write the message text that will animate on the users' screens..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoPostAsNotice}
                onChange={(e) => setAlsoPostAsNotice(e.target.checked)}
                className="rounded text-[#0E7C86]"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Also save as permanent entry in Official Notices Board
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNotifModalOpen(false)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
              <span>Broadcast Live Notification</span>
            </button>
          </div>
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
