'use client';

import React from 'react';
import { Gift, Sparkles, Heart } from 'lucide-react';

interface BirthdayOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BirthdayOverlay({ isOpen, onClose }: BirthdayOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200/90 shadow-xl rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-slate-800 relative">
        
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-pink-50 border border-pink-200 text-pink-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Gift className="w-7 h-7" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold rounded-full font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Special Day
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Selamat Ulang Tahun, Sayangggg!
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Semoga di usia kamu yang baru ini makin bahagia, makin rajinn, dan makin sukses yaaa. aku bikinin kamu ini biar makin produktif!
          </p>
        </div>

        {/* Agenda Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2.5">
          <h3 className="font-semibold text-slate-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
            Agenda Hari Ini:
          </h3>
          <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
            <li>Kuliah dan Buka Kado dari Aku</li>
            <li>Makan Makannn</li>
          </ul>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 fill-pink-400 text-pink-400" /> Masuk ke Workspace
          </button>
        </div>

      </div>
    </div>
  );
}