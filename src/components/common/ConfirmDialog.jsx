import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmLabel,
  isDestructive = true
}) => {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4 py-2">
        <div className={`p-3 rounded-full ${isDestructive ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-amber-100 text-amber-600'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {message || t.common.confirmDelete}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center active:scale-98"
        >
          {t.common.cancel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-sm font-bold rounded-xl text-white transition shadow-sm flex items-center justify-center active:scale-98 ${
            isDestructive 
              ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500' 
              : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500'
          }`}
        >
          {confirmLabel || t.common.delete}
        </button>
      </div>
    </Modal>
  );
};
