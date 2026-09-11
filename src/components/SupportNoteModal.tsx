// 'use client';

// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Heart, X } from 'lucide-react';

// interface SupportNoteModalProps {
//   isOpen: boolean;
//   message: string;
//   onClose: () => void;
// }

// export default function SupportNoteModal({ isOpen, message, onClose }: SupportNoteModalProps) {
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0, y: 20 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0.8, opacity: 0, y: 20 }}
//             className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-pink-100 text-center relative overflow-hidden"
//           >
//             <button
//               onClick={onClose}
//               className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 rounded-full p-1 transition"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Heart className="w-6 h-6 fill-pink-500" />
//             </div>

//             <h3 className="text-lg font-bold text-gray-800 mb-2">Pesan Untukmu ✨</h3>
//             <p className="text-gray-600 text-sm italic mb-6">&quot;{message}&quot;</p>

//             <button
//               onClick={onClose}
//               className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-xl shadow-md transition"
//             >
//               Lanjut Semangat! 💪
//             </button>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// }

'use client';

import { Heart, X } from 'lucide-react';

interface SupportNoteModalProps {
  isOpen: boolean;
  message: string;
  author?: string; // Prop opsional untuk nama author
  onClose: () => void;
}

export default function SupportNoteModal({
  isOpen,
  message,
  author,
  onClose,
}: SupportNoteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-500 border border-pink-100 shadow-sm">
          <Heart className="w-6 h-6 fill-pink-500" />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">
            Pesan Untukmu ✨
          </h3>
          <p className="text-xs italic text-slate-600 leading-relaxed px-2">
            "{message}"
          </p>
          
          {/* Render nama author jika ketersediaan data ditemukan */}
          {author && (
            <p className="text-[11px] font-semibold text-pink-600 pt-1">
              — {author}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-pink-500 hover:bg-pink-600 py-2.5 text-xs font-semibold text-white transition shadow-sm shadow-pink-500/20"
        >
          Lanjut Semangat! 💪
        </button>

      </div>
    </div>
  );
}