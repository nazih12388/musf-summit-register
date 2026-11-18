import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { generateResultCardCanvas, shareResultOnWhatsApp } from '../../utils/whatsappShare';
import { Share2, Download, Check, Sparkles } from 'lucide-react';

export const WhatsAppShareModal = ({ isOpen, onClose, resultData }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && resultData) {
      setGenerating(true);
      generateResultCardCanvas(resultData)
        .then(url => {
          setImageSrc(url);
          setGenerating(false);
        })
        .catch(err => {
          console.error("Card generation failed", err);
          setGenerating(false);
        });
    } else {
      setImageSrc(null);
    }
  }, [isOpen, resultData]);

  if (!resultData) return null;

  const handleDownload = () => {
    if (!imageSrc) return;
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = `Result_${resultData.programName.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handleShareWhatsApp = () => {
    shareResultOnWhatsApp(resultData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Result Card" maxWidth="max-w-lg">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Generated official result graphic for <strong>{resultData.programName}</strong> ready to publish on WhatsApp Status, Groups, or Instagram.
        </p>

        {/* Image Preview Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-600/30 bg-slate-950 flex items-center justify-center min-h-[300px]">
          {generating ? (
            <div className="flex flex-col items-center gap-2 p-8 text-slate-400">
              <span className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Generating high-res card...</span>
            </div>
          ) : imageSrc ? (
            <img src={imageSrc} alt="Result Card Preview" className="w-full max-h-[420px] object-contain shadow-inner" />
          ) : (
            <span className="text-sm text-slate-500">Could not generate preview</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={!imageSrc}
            className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Image</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
