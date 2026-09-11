'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Sparkles, Music } from 'lucide-react';

type TimerMode = 'work' | 'break';

// Direct Online MP3 Link (Lofi / Relaxing Loop)
const ONLINE_LOFI_URL =
  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

export default function PomodoroTimer() {
  const WORK_TIME = 25 * 60; // 25 Menit
  const BREAK_TIME = 5 * 60; // 5 Menit

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Music State
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inisialisasi Audio Online & Loop Continuous
  useEffect(() => {
    audioRef.current = new Audio(ONLINE_LOFI_URL);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Toggle Play / Pause Lagu
  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch((err) => {
          console.error('Playback error:', err);
          alert('Gagal memutar audio online. Periksa koneksi internet.');
        });
    }
  };

  // Timer Countdown & Auto Transition Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (mode === 'work') {
        // Selesai Sesi Fokus -> Pindah Otomatis ke Istirahat (5m) & Tetap Jalankan Timer
        setCompletedSessions((prev) => prev + 1);
        setMode('break');
        setTimeLeft(BREAK_TIME);
        setIsActive(true); // Lanjut otomatis ke timer istirahat
      } else {
        // Selesai Sesi Istirahat -> Kembalikan ke Fokus (25m) & BERHENTI (Pause)
        setMode('work');
        setTimeLeft(WORK_TIME);
        setIsActive(false); // Stop timer, tunggu user tekan Start lagi
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setTimeLeft(WORK_TIME);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header Info & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-200/60">
            {mode === 'work' ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <Coffee className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">
              {mode === 'work' ? 'Sesi Fokus (Work)' : 'Istirahat (Break)'}
            </h2>
            <p className="text-[11px] text-slate-500">
              {mode === 'work'
                ? 'Fokus selesaiin tugasss'
                : 'istirahat dulu bentarr'}
            </p>
          </div>
        </div>

        {/* Tab Switcher Manual */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => switchMode('work')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-xl transition ${
              mode === 'work'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Fokus (25m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('break')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-xl transition ${
              mode === 'break'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Istirahat (5m)
          </button>
        </div>
      </div>

      {/* Timer Display & Controls */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTimer}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              isActive
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Start
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="p-2 text-slate-400 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition shadow-sm"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Music Controller */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={toggleMusic}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
            isPlayingMusic
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Music
            className={`w-3.5 h-3.5 ${isPlayingMusic ? 'animate-spin' : ''}`}
          />
          {isPlayingMusic ? 'Pause Musik Lofi' : 'Putar Musik Lofi'}
        </button>

        <span className="text-[11px] font-medium text-slate-400">
          🎵 Lofi Study Beat (Online Loop)
        </span>
      </div>

      {completedSessions > 0 && (
        <p className="text-[11px] text-slate-500 text-right pt-1">
          Selesai <span className="font-bold text-slate-900">{completedSessions}</span> sesi fokus hari ini.
        </p>
      )}
    </div>
  );
}