'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Clock } from 'lucide-react';
import { lofiAudio } from '@/lib/lofiAudio';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      lofiAudio.stop();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const toggleTimer = async () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    
    if (nextState && isSoundOn) {
      await lofiAudio.start();
    } else {
      lofiAudio.stop();
    }
  };

  const toggleSound = async () => {
    const nextSound = !isSoundOn;
    setIsSoundOn(nextSound);
    if (isRunning) {
      if (nextSound) {
        await lofiAudio.start();
      } else {
        lofiAudio.stop();
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    lofiAudio.stop();
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 p-3.5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100/80 rounded-xl text-slate-700">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 text-xs flex items-center gap-2">
            Focus Timer (25m)
            {isRunning && isSoundOn && (
              <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                ♪ Lo-Fi Active
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Fokus kerjakan tugasmu tanpa gangguan</p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <span className="text-base font-mono font-bold text-slate-900 bg-slate-100/80 px-3.5 py-1 rounded-lg border border-slate-200/60 shadow-inner">
          {formatTime(timeLeft)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-lg transition ${
              isSoundOn
                ? 'text-slate-800 bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title={isSoundOn ? 'Mute Lo-Fi' : 'Play Lo-Fi'}
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition shadow-sm"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="p-2 text-slate-400 hover:text-slate-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}