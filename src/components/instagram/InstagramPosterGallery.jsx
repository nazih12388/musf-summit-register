import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Instagram } from '../common/InstagramIcon';
import {
  RefreshCw,
  ExternalLink,
  Calendar,
  Heart,
  MessageCircle,
  Filter,
  Search,
  Sparkles,
  Plus,
  Trash2,
  X,
  Maximize2,
  CheckCircle2,
  Share2,
  AlertCircle,
  ShieldCheck,
  SlidersHorizontal,
  LayoutGrid,
  Tv,
  Globe,
  Radio,
  Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  DEFAULT_INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  INSTAGRAM_EMBED_PROFILE_URL,
  extractInstagramPostInfo,
  getInstagramConfig,
  saveInstagramConfig,
  syncInstagramFeed,
  createManualInstagramPost,
  removeStoredInstagramPost
} from '../../services/instagramFeedService';
import { Modal } from '../common/Modal';

export const InstagramPosterGallery = ({ isModal = false, onClose }) => {
  const { currentUser } = useAuth();
  const { lang, tr } = useLanguage();
  const { instagramPosts = [], setInstagramPosts, unionOfficials = [] } = useApp ? useApp() : { instagramPosts: [] };

  const [posts, setPosts] = useState(instagramPosts || []);
  const [activeTab, setActiveTab] = useState('embeds'); // 'embeds' | 'profile_stream'
  const [embedViewMode, setEmbedViewMode] = useState('full'); // 'full' (official Instagram embeds) | 'compact' (poster card view)
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePoster, setActivePoster] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [feedConfig, setFeedConfig] = useState(getInstagramConfig());

  // Add Post Form State
  const [newPostForm, setNewPostForm] = useState({
    postUrl: '',
    title: '',
    caption: '',
    imageUrl: '',
    category: 'program',
    date: new Date().toISOString().split('T')[0],
    isPinned: false
  });

  // Check if current user is Admin, Executive, or Media Wing Convener
  const canManage = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'executive') return true;
    if (currentUser.role === 'leader' && currentUser.wingId === 'media') return true;
    const isOfficial = (unionOfficials || []).some(
      o => (o.studentCic === currentUser.cicNumber || o.phone === currentUser.username) &&
           (o.wingId === 'media' || o.position?.toLowerCase().includes('media') || o.position?.toLowerCase().includes('secretary') || o.position?.toLowerCase().includes('chairman'))
    );
    return isOfficial;
  }, [currentUser, unionOfficials]);

  // Load official Instagram embed.js script dynamically
  useEffect(() => {
    const existingScript = document.getElementById('instagram-embed-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        if (window.instgrm?.Embeds?.process) {
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    } else {
      if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
      }
    }
  }, []);

  // Re-process Instagram embeds whenever posts change or tab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [posts, activeTab, embedViewMode]);

  // Initial Sync / load
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsSyncing(true);
      const res = await syncInstagramFeed({ force: false });
      if (mounted) {
        if (res?.posts) {
          setPosts(res.posts);
          if (typeof setInstagramPosts === 'function') setInstagramPosts(res.posts);
        }
        setIsSyncing(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Syncing with @musf_puramannur feed...');
    try {
      const res = await syncInstagramFeed({ force: true });
      if (res?.posts) {
        setPosts(res.posts);
        if (typeof setInstagramPosts === 'function') setInstagramPosts(res.posts);
      }
      setSyncStatusMsg(res.source === 'live_feed' ? 'Live feed refreshed!' : 'Posts updated from cache.');
      setTimeout(() => setSyncStatusMsg(''), 4000);
    } catch (err) {
      setSyncStatusMsg('Sync failed, loaded cached posters.');
      setTimeout(() => setSyncStatusMsg(''), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSavePost = (e) => {
    e.preventDefault();
    if (!newPostForm.postUrl.trim() && !newPostForm.imageUrl.trim()) {
      alert('Please enter an Instagram post URL (e.g. https://www.instagram.com/p/XXXX/) or an image URL.');
      return;
    }

    const updated = createManualInstagramPost({
      url: newPostForm.postUrl.trim(),
      permalink: newPostForm.postUrl.trim(),
      title: newPostForm.title.trim() || 'Instagram Post',
      caption: newPostForm.caption.trim(),
      imageUrl: newPostForm.imageUrl.trim(),
      category: newPostForm.category,
      date: newPostForm.date,
      isPinned: newPostForm.isPinned
    }, currentUser?.username || 'admin');

    setPosts(updated);
    if (typeof setInstagramPosts === 'function') setInstagramPosts(updated);
    setIsAddModalOpen(false);
    setNewPostForm({
      postUrl: '',
      title: '',
      caption: '',
      imageUrl: '',
      category: 'program',
      date: new Date().toISOString().split('T')[0],
      isPinned: false
    });

    // Trigger Instagram parser
    setTimeout(() => {
      if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
    }, 200);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this Instagram post from the showcase?')) {
      const updated = removeStoredInstagramPost(postId, currentUser?.username || 'admin');
      setPosts(updated);
      if (typeof setInstagramPosts === 'function') setInstagramPosts(updated);
      if (activePoster?.id === postId) setActivePoster(null);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const saved = saveInstagramConfig(feedConfig);
    setFeedConfig(saved);
    setIsSettingsModalOpen(false);
    handleManualSync();
  };

  // Filtered list
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery = !searchQuery.trim() ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortcode?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  const content = (
    <div className="space-y-6">
      {/* Top Banner / Feed Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0F2A4A] via-[#1E3A5F] to-[#0E7C86] text-white shadow-lg relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-[#E1306C]/30 via-[#F77737]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <Instagram className="w-4 h-4 text-rose-300" />
              <span>Official Instagram Showcase</span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>@{feedConfig.handle || DEFAULT_INSTAGRAM_HANDLE}</span>
                <ShieldCheck className="w-5 h-5 text-teal-300" title="Verified College Handle" />
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {tr(
                "Official Instagram posters, program announcements, sports events, and summit highlights from Majlis Umariyya Wafy College MUSF Students' Union.",
                "മജ്‌ലിസ് ഉമരിയ്യ വാഫി കോളേജ് MUSF വിദ്യാർത്ഥി യൂണിയന്റെ തത്സമയ ഇൻസ്റ്റാഗ്രാം പോസ്റ്ററുകൾ, പ്രോഗ്രാം അനൗൺസ്‌മെന്റുകൾ, കായികമേള, സമ്മിറ്റ് പോസ്റ്ററുകൾ."
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-xs"
              title="Auto-Sync with Instagram Feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-300' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Refresh / Sync'}</span>
            </button>

            <a
              href={`https://www.instagram.com/${feedConfig.handle || DEFAULT_INSTAGRAM_HANDLE}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E1306C] via-[#C13584] to-[#833AB4] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md"
            >
              <Instagram className="w-4 h-4" />
              <span>Open on Instagram</span>
              <ExternalLink className="w-3 h-3 text-rose-200" />
            </a>

            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                  title="Paste real Instagram Post URL"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Real Post</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                  title="Feed Settings & Auto-Sync Config"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sync Toast Notification */}
        {syncStatusMsg && (
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2 text-xs text-teal-200 font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-teal-300" />
            <span>{syncStatusMsg}</span>
          </div>
        )}
      </div>

      {/* Primary View Mode Tabs: Live Embeds Grid vs Profile Stream */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('embeds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'embeds'
                ? 'bg-[#0E7C86] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{tr('Live Posts Grid', 'പോസ്റ്റുകൾ')}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'embeds' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
              {posts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile_stream')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'profile_stream'
                ? 'bg-gradient-to-r from-[#E1306C] to-[#833AB4] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Official Profile Timeline (@{feedConfig.handle || DEFAULT_INSTAGRAM_HANDLE})</span>
          </button>
        </div>

        {activeTab === 'embeds' && (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setEmbedViewMode('full')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                embedViewMode === 'full'
                  ? 'bg-white dark:bg-slate-700 text-[#0E7C86] dark:text-teal-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Render authentic Instagram widgets"
            >
              Instagram Embed View
            </button>
            <button
              type="button"
              onClick={() => setEmbedViewMode('compact')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                embedViewMode === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-[#0E7C86] dark:text-teal-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Compact card showcase"
            >
              Card View
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: PROFILE STREAM IFRAME */}
      {activeTab === 'profile_stream' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-[#E1306C]" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  Live Stream from https://www.instagram.com/{feedConfig.handle || DEFAULT_INSTAGRAM_HANDLE}/
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Browse official stories, reels, and feeds directly from the verified college handle.
                </p>
              </div>
            </div>
            <a
              href={`https://www.instagram.com/${feedConfig.handle || DEFAULT_INSTAGRAM_HANDLE}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#E1306C] hover:bg-[#C13584] text-white text-xs font-bold shrink-0 transition"
            >
              Follow Profile &rarr;
            </a>
          </div>

          <div className="w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-[#0F1B2B]">
            <iframe
              src={`https://www.instagram.com/${feedConfig.handle || DEFAULT_INSTAGRAM_HANDLE}/embed`}
              title="Official MUSF Instagram Timeline"
              className="w-full h-[700px] border-0"
              scrolling="yes"
              allowTransparency="true"
              allow="encrypted-media"
            />
          </div>
        </div>
      )}

      {/* VIEW 2: EMBEDS & POSTERS GRID */}
      {activeTab === 'embeds' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1B2B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: tr('All Posters', 'എല്ലാ പോസ്റ്ററുകളും'), count: posts.length },
                { id: 'program', label: tr('Programs', 'പരിപാടികൾ'), count: posts.filter(p => p.category === 'program').length },
                { id: 'achievement', label: tr('Achievements', 'നേട്ടങ്ങൾ'), count: posts.filter(p => p.category === 'achievement').length },
                { id: 'update', label: tr('Updates', 'അറിയിപ്പുകൾ'), count: posts.filter(p => p.category === 'update').length }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-[#0E7C86] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posters or captions..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0E7C86]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#0F1B2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Instagram className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No posters found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No matching Instagram posts match your query or category filter. Try clearing filters or paste a real Instagram post URL.
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#0E7C86] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Paste Instagram Post Link</span>
                </button>
              )}
            </div>
          ) : embedViewMode === 'full' ? (
            /* OFFICIAL INSTAGRAM EMBED VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const permalink = post.permalink || `https://www.instagram.com/p/${post.shortcode}/`;

                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-[#0F1B2B] rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between relative group"
                  >
                    {/* Header info bar */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0E7C86] dark:text-teal-400 font-bold text-[11px]">
                        {lang === 'en'
                          ? (post.category === 'achievement' ? 'Achievement' : post.category === 'update' ? 'Announcement' : 'Program')
                          : (post.categoryLabel?.replace(/^[^\w\u0D00-\u0D7F]+/u, '') || 'പരിപാടി')}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span>{post.date}</span>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Official Instagram Blockquote Embed Container */}
                    <div className="w-full flex justify-center overflow-hidden min-h-[420px] rounded-2xl bg-slate-50 dark:bg-slate-900/50 py-2">
                      <blockquote
                        className="instagram-media"
                        data-instgrm-captioned
                        data-instgrm-permalink={permalink}
                        data-instgrm-version="14"
                        style={{
                          background: '#FFF',
                          border: 0,
                          borderRadius: '12px',
                          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                          margin: '1px',
                          maxWidth: '540px',
                          minWidth: '280px',
                          padding: 0,
                          width: '99.375%'
                        }}
                      >
                        <div style={{ padding: '16px' }}>
                          <a
                            href={permalink}
                            style={{
                              background: '#FFFFFF',
                              lineHeight: 0,
                              padding: '0 0',
                              textAlign: 'center',
                              textDecoration: 'none',
                              width: '100%'
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="text-center py-10 space-y-2">
                              <Instagram className="w-8 h-8 mx-auto text-[#E1306C] animate-pulse" />
                              <div className="text-xs font-bold text-slate-800">
                                @{DEFAULT_INSTAGRAM_HANDLE}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Loading live post from Instagram...
                              </div>
                            </div>
                          </a>
                        </div>
                      </blockquote>
                    </div>

                    {/* Direct Link Action */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[180px]">
                        {post.title || `@${DEFAULT_INSTAGRAM_HANDLE}`}
                      </span>
                      <a
                        href={permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#E1306C] hover:underline"
                      >
                        <span>Open on App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* COMPACT POSTER CARD VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#0F1B2B] rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0E7C86] dark:text-teal-400 font-bold text-[11px]">
                      {lang === 'en'
                        ? (post.category === 'achievement' ? 'Achievement' : post.category === 'update' ? 'Announcement' : 'Program')
                        : (post.categoryLabel?.replace(/^[^\w\u0D00-\u0D7F]+/u, '') || 'പരിപാടി')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {post.date}
                    </span>
                  </div>

                  {post.imageUrl && (
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                      <img
                        src={post.imageUrl}
                        alt={post.title || 'Official Poster'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-white text-[11px] font-semibold drop-shadow-md">
                          {lang === 'ml' && post.titleMl ? post.titleMl : (post.title || 'Majlis Umariyya Wafy College')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0F2A4A] dark:text-white line-clamp-2">
                        {lang === 'ml' && post.titleMl ? post.titleMl : post.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                        {lang === 'ml' && post.captionMl ? post.captionMl : post.caption}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-3">
                      <div className="flex items-center gap-1.5 text-rose-500 font-semibold">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{post.likesCount || 0}</span>
                      </div>
                      <a
                        href={post.permalink || `https://www.instagram.com/${DEFAULT_INSTAGRAM_HANDLE}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E1306C] to-[#833AB4] text-white font-bold text-xs"
                      >
                        <Instagram className="w-3 h-3" />
                        <span>View Post</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD REAL INSTAGRAM POST */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Real Instagram Post (@musf_puramannur)"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSavePost} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
              <strong>Paste Real Instagram Link:</strong> Copy the link from any post or reel published by{' '}
              <strong>@musf_puramannur</strong> (e.g., <code>https://www.instagram.com/p/XXXX/</code>). The app will automatically embed the official interactive photo, caption, and likes!
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Instagram Post / Reel URL *
              </label>
              <input
                type="url"
                value={newPostForm.postUrl}
                onChange={(e) => setNewPostForm({ ...newPostForm, postUrl: e.target.value })}
                placeholder="https://www.instagram.com/p/DF..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0E7C86]"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Poster Image URL (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setNewPostForm({ ...newPostForm, imageUrl: '/amu-wafy-poster.jpg' })}
                  className="text-[10px] text-[#0E7C86] dark:text-teal-400 font-bold hover:underline"
                >
                  + Use College Poster
                </button>
              </div>
              <input
                type="text"
                value={newPostForm.imageUrl}
                onChange={(e) => setNewPostForm({ ...newPostForm, imageUrl: e.target.value })}
                placeholder="e.g. /amu-wafy-poster.jpg or https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0E7C86]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={newPostForm.category}
                  onChange={(e) => setNewPostForm({ ...newPostForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="program">{tr('Program / Summit', 'പരിപാടി')}</option>
                  <option value="achievement">{tr('Achievement / Winner', 'നേട്ടം')}</option>
                  <option value="update">{tr('Union Announcement', 'യൂണിയൻ അറിയിപ്പ്')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newPostForm.date}
                  onChange={(e) => setNewPostForm({ ...newPostForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Post Title / Brief (Optional)
              </label>
              <input
                type="text"
                value={newPostForm.title}
                onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                placeholder="e.g. Fine Arts Summit Poster Launch"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Caption / Description (Optional)
              </label>
              <textarea
                rows={2}
                value={newPostForm.caption}
                onChange={(e) => setNewPostForm({ ...newPostForm, caption: e.target.value })}
                placeholder="Brief Malayalam or English caption..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0E7C86] text-white font-bold text-xs shadow-md hover:bg-[#0c6b74] transition"
              >
                Add Real Post to Feed
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: FEED SETTINGS & AUTO-SYNC (BEHOLD.SO) */}
      {isSettingsModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSettingsModalOpen(false)}
          title="Instagram Feed Auto-Sync & Endpoint Configuration"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveConfig} className="p-5 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong>Zero-Maintenance Feed Sync:</strong> You can connect a free <strong>Behold.so</strong> JSON Feed URL (or RSS2JSON endpoint) below. The app will automatically query the endpoint and refresh posts in the background without manual pasting.
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Official Instagram Handle
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">@</span>
                <input
                  type="text"
                  value={feedConfig.handle}
                  onChange={(e) => setFeedConfig({ ...feedConfig, handle: e.target.value.replace('@', '') })}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Custom Feed Endpoint / Behold.so URL (Optional)
              </label>
              <input
                type="url"
                value={feedConfig.customFeedUrl}
                onChange={(e) => setFeedConfig({ ...feedConfig, customFeedUrl: e.target.value })}
                placeholder="https://feeds.behold.so/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supports Behold.so JSON, Juicer, or RSSHub endpoints.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0E7C86] text-white font-bold shadow-md hover:bg-[#0c6b74] transition"
              >
                Save Settings &amp; Sync
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );

  if (isModal) {
    return (
      <Modal isOpen={true} onClose={onClose} title="MUSF Instagram Live Showcase (@musf_puramannur)" maxWidth="max-w-6xl">
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
          {content}
        </div>
      </Modal>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {content}
    </div>
  );
};
