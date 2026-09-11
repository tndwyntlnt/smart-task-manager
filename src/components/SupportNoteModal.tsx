'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface SupportNoteModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function SupportNoteModal({ isOpen, message, onClose }: SupportNoteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-pink-100 text-center relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 rounded-full p-1 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 fill-pink-500" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">Pesan Untukmu ✨</h3>
            <p className="text-gray-600 text-sm italic mb-6">&quot;{message}&quot;</p>

            <button
              onClick={onClose}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-xl shadow-md transition"
            >
              Lanjut Semangat! 💪
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}