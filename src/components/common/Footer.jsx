import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 space-y-1">
        <p className="font-bold text-slate-700 dark:text-slate-300">
          {t.collegeName} • {t.appTitle}
        </p>
        <p className="text-[11px] text-slate-400">
          Official Collegiate Summit Management System • Majlis Umariyya Wafy College • All rights reserved &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};
