'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Task, SupportNote, TaskCategory, TaskPriority, TaskStatus } from '@/types/database';
import SupportNoteModal from '@/components/SupportNoteModal';
import PomodoroTimer from '@/components/PomodoroTimer';
import BirthdaySurpriseView from '@/components/BirthdaySurpriseView';
import confetti from 'canvas-confetti';
import {
  Plus,
  BookOpen,
  Share2,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  GripVertical,
  LayoutGrid,
  Calendar as CalendarIcon,
  Flag,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<TaskCategory>('kuliah');

  // Logic Ulang Tahun & Dynamic Landing Page
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const [bypassBirthdayView, setBypassBirthdayView] = useState(false);

  // Drag & Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Form Task Baru
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [isAdding, setIsAdding] = useState(false);

  // Custom Dropdown & DatePicker State
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // State Custom Kalender & Time Picker Interaktif
  const [pickerMonth, setPickerMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // State Input Jam & Menit
  const [inputHour, setInputHour] = useState('23');
  const [inputMinute, setInputMinute] = useState('59');

  // Form Edit Task
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [isEditPriorityOpen, setIsEditPriorityOpen] = useState(false);

  // State Modal Konfirmasi Hapus Modern
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // State Fitur Support Notes
  const [supportNotes, setSupportNotes] = useState<SupportNote[]>([]);

  // Refs click outside
  const priorityRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [selectedNote, setSelectedNote] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync selectedDate saat newDueDate diset
  useEffect(() => {
    if (newDueDate) {
      const d = new Date(newDueDate);
      if (!isNaN(d.getTime()) && !selectedDate) {
        setSelectedDate(d);
      }
    } else {
      setSelectedDate(null);
    }
  }, [newDueDate]);

  // Fetch Data & Pengecekan Tanggal Otomatis
  const fetchData = useCallback(async () => {
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: notesData, error: notesError } = await supabase
      .from('support_notes')
      .select('*');

    if (tasksError) console.error('Error fetching tasks:', tasksError);
    if (notesError) console.error('Error fetching support_notes:', notesError);

    if (tasksData) setTasks(tasksData);
    if (notesData) setSupportNotes(notesData);
  }, []);

  useEffect(() => {
    void fetchData();

    // Pengecekan Tanggal Ulang Tahun (misal: 22 September)
    const today = new Date();
    const TARGET_MONTH = 8; // September (0-indexed)
    const TARGET_DATE = 14;

    const isTodayBirthday = 
      today.getMonth() === TARGET_MONTH && 
      today.getDate() === TARGET_DATE;

    setIsBirthdayToday(isTodayBirthday);
  }, [fetchData]);

  // Tambah Tugas Baru
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      title: newTitle,
      description: newDesc || null,
      category: activeTab,
      priority: newPriority,
      due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
      status: 'todo' as TaskStatus,
    };

    const { data, error } = await supabase.from('tasks').insert([newTask]).select();

    if (!error && data) {
      setTasks((prev) => [data[0], ...prev]);
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      setNewPriority('medium');
      setIsAdding(false);
    }
  };

  // Move Task Status & Trigger Support Notes
  const moveTaskStatus = async (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    const { error } = await supabase
      .from('tasks')
      .update({ status: targetStatus })
      .eq('id', taskId);

    if (error) {
      console.error('Error update task status:', error);
      void fetchData();
      return;
    }

    if (targetStatus === 'done') {
      confetti({ particleCount: 60, spread: 45, origin: { y: 0.7 } });

      const { data: notesData, error: notesError } = await supabase
        .from('support_notes')
        .select('*');

      if (!notesError && notesData && notesData.length > 0) {
        const randomIndex = Math.floor(Math.random() * notesData.length);
        const randomObj = notesData[randomIndex];

        const noteContent =
          randomObj.message ||
          randomObj.note ||
          randomObj.content ||
          randomObj.text ||
          'Semangat terus ya!';

        const authorName =
          randomObj.author ||
          randomObj.author_name ||
          randomObj.created_by ||
          randomObj.sender ||
          'Anonim';

        setSelectedNote(String(noteContent));
        setSelectedAuthor(String(authorName));
        setIsModalOpen(true);
      } else {
        setSelectedNote('Tetap semangat! Kamu sudah melakukan yang terbaik hari ini! ✨');
        setSelectedAuthor('System');
        setIsModalOpen(true);
      }
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  // Edit Task Handlers
  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditDueDate(
      task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''
    );
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDesc('');
    setEditDueDate('');
  };

  const handleUpdateTask = async (id: string) => {
    if (!editTitle.trim()) return;

    const updatedData = {
      title: editTitle,
      description: editDesc || null,
      priority: editPriority,
      due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
    };

    const { error } = await supabase.from('tasks').update(updatedData).eq('id', id);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
      );
      cancelEdit();
    }
  };

  // Handler Hapus
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const { error } = await supabase.from('tasks').delete().eq('id', taskToDelete.id);
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    }
    setTaskToDelete(null);
  };

  // Helper Date & Time Custom
  const updateDateTimeString = (date: Date | null, hStr: string, mStr: string) => {
    if (!date) {
      setNewDueDate('');
      return;
    }
    const h = hStr === '' ? 0 : parseInt(hStr, 10);
    const m = mStr === '' ? 0 : parseInt(mStr, 10);

    const updated = new Date(date);
    updated.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0);

    const year = updated.getFullYear();
    const month = String(updated.getMonth() + 1).padStart(2, '0');
    const day = String(updated.getDate()).padStart(2, '0');
    const formattedH = String(updated.getHours()).padStart(2, '0');
    const formattedM = String(updated.getMinutes()).padStart(2, '0');

    setNewDueDate(`${year}-${month}-${day}T${formattedH}:${formattedM}`);
  };

  const handleHourInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    let val = rawVal.slice(-2);

    if (val !== '' && parseInt(val, 10) > 23) {
      val = '23';
    }

    setInputHour(val);
    const targetDate = selectedDate || new Date();
    if (!selectedDate) setSelectedDate(targetDate);
    updateDateTimeString(targetDate, val, inputMinute);
  };

  const handleMinuteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    let val = rawVal.slice(-2);

    if (val !== '' && parseInt(val, 10) > 59) {
      val = '59';
    }

    setInputMinute(val);
    const targetDate = selectedDate || new Date();
    if (!selectedDate) setSelectedDate(targetDate);
    updateDateTimeString(targetDate, inputHour, val);
  };

  const handleSelectDay = (day: number) => {
    const targetDate = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day);
    setSelectedDate(targetDate);
    updateDateTimeString(targetDate, inputHour, inputMinute);
  };

  const handleQuickDatePreset = (daysFromToday: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    setSelectedDate(target);
    setPickerMonth(new Date(target.getFullYear(), target.getMonth(), 1));
    updateDateTimeString(target, inputHour, inputMinute);
  };

  const handleQuickTimePreset = (h: number, m: number) => {
    const hStr = String(h);
    const mStr = String(m);
    setInputHour(hStr);
    setInputMinute(mStr);
    const dateToUse = selectedDate || new Date();
    if (!selectedDate) setSelectedDate(dateToUse);
    updateDateTimeString(dateToUse, hStr, mStr);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendarDays = () => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfWeek(year, month);

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-7 w-7" />);
    }

    const today = new Date();

    for (let day = 1; day <= totalDays; day++) {
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleSelectDay(day)}
          className={`h-7 w-7 rounded-lg text-xs font-medium transition flex items-center justify-center ${
            isSelected
              ? 'bg-slate-900 text-white font-semibold shadow-sm'
              : isToday
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  const currentNumHour = parseInt(inputHour, 10) || 0;
  const prevHour = (currentNumHour - 1 + 24) % 24;
  const nextHour = (currentNumHour + 1) % 24;

  // Filter Tasks
  const categoryTasks = tasks.filter((t) => t.category === activeTab);
  const todoTasks = categoryTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = categoryTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = categoryTasks.filter((t) => t.status === 'done');

  // Deadline Alert
  const upcomingDeadlines = categoryTasks.filter((t) => {
    if (!t.due_date || t.status === 'done') return false;
    const diffHours = (new Date(t.due_date).getTime() - new Date().getTime()) / (1000 * 3600);
    return diffHours > 0 && diffHours <= 48;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
            MED
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
            LOW
          </span>
        );
    }
  };

  const priorityLabels: Record<TaskPriority, string> = {
    low: 'Rendah (Low)',
    medium: 'Sedang (Medium)',
    high: 'Tinggi (High)',
  };

  // Render Tampilan Kejutan jika HARI INI adalah Ulang Tahun
  if (isBirthdayToday && !bypassBirthdayView) {
    return (
      <BirthdaySurpriseView
        {...({
          onContinueToWorkspace: () => setBypassBirthdayView(true),
        } as any)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 md:p-10 font-sans tracking-tight">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Clean Solid White */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 shadow-sm p-5 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Workspace Imelda
              </h1>
            </div>
            <p className="text-slate-500 text-xs font-normal">
              Atur jadwal biar ga keteterann
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 gap-1">
              <button
                type="button"
                onClick={() => { setActiveTab('kuliah'); cancelEdit(); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'kuliah'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Kuliah
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('socmed'); cancelEdit(); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'socmed'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                Kerja
              </button>
            </div>
          </div>
        </header>

        {/* Deadline Alert Banner */}
        {upcomingDeadlines.length > 0 && (
          <div className="bg-amber-50 border border-amber-200/80 px-4 py-3 rounded-xl flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-900">
                <strong className="font-semibold">{upcomingDeadlines.length} Tugas Mendekati Batas Waktu:</strong>{' '}
                {upcomingDeadlines.map((t) => t.title).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Pomodoro Timer */}
        <PomodoroTimer />

        {/* Form Tambah Kartu Modern */}
        <div>
          {!isAdding ? (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-medium transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Kartu Baru
            </button>
          ) : (
            <form onSubmit={handleAddTask} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 animate-fade-in">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Judul tugas..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-xs font-medium text-slate-900 placeholder-slate-400 transition"
                  required
                />
                <textarea
                  placeholder="Deskripsi singkat..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-xs text-slate-900 placeholder-slate-400 transition resize-none"
                  rows={2}
                />
              </div>

              {/* Input Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* 1. Custom Priority Select */}
                <div className="space-y-1 relative" ref={priorityRef}>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Flag className="w-3 h-3" /> Prioritas
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 transition cursor-pointer"
                  >
                    <span>{priorityLabels[newPriority]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isPriorityOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20 space-y-0.5 animate-in fade-in duration-150">
                      {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setNewPriority(p);
                            setIsPriorityOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                            newPriority === p
                              ? 'bg-slate-100 text-slate-900 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span>{priorityLabels[p]}</span>
                          {newPriority === p && <Check className="w-3.5 h-3.5 text-slate-800" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Custom Date & Time Picker */}
                <div className="space-y-1 relative" ref={datePickerRef}>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarIcon className="w-3 h-3" /> Batas Waktu
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 transition cursor-pointer"
                  >
                    <span className={newDueDate ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                      {newDueDate
                        ? new Date(newDueDate).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Pilih Tanggal & Jam...'}
                    </span>
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isDatePickerOpen && (
                    <div className="absolute top-full right-0 sm:left-0 mt-1 w-full max-w-130 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-30 space-y-3.5 animate-in fade-in duration-150">
                      
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-800">Batas Waktu Tugas</span>
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(false)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleQuickDatePreset(0)}
                          className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg font-medium transition"
                        >
                          Hari Ini
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDatePreset(1)}
                          className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg font-medium transition"
                        >
                          Besok
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDatePreset(2)}
                          className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg font-medium transition"
                        >
                          Lusa
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-semibold text-slate-800">
                              {pickerMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))
                                }
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))
                                }
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center">
                            {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((dayName, idx) => (
                              <span key={idx} className="text-[10px] font-semibold text-slate-400">
                                {dayName}
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center">
                            {renderCalendarDays()}
                          </div>
                        </div>

                        <div className="border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-between space-y-3">
                          
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> Jam & Menit
                            </span>

                            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center justify-center gap-2 focus-within:ring-2 focus-within:ring-slate-800/10 transition">
                              <div className="flex flex-col items-center">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={inputHour}
                                  onChange={handleHourInputChange}
                                  placeholder="23"
                                  className="w-12 h-9 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-sm"
                                />
                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Jam</span>
                              </div>

                              <span className="text-lg font-bold text-slate-400 -mt-3.5">:</span>

                              <div className="flex flex-col items-center">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={inputMinute}
                                  onChange={handleMinuteInputChange}
                                  placeholder="59"
                                  className="w-12 h-9 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-sm"
                                />
                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Menit</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 py-1 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  const h = String(prevHour);
                                  setInputHour(h);
                                  updateDateTimeString(selectedDate || new Date(), h, inputMinute);
                                }}
                                className="hover:text-slate-800 transition"
                              >
                                -1 Jam ({prevHour})
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const h = String(nextHour);
                                  setInputHour(h);
                                  updateDateTimeString(selectedDate || new Date(), h, inputMinute);
                                }}
                                className="hover:text-slate-800 transition"
                              >
                                +1 Jam ({nextHour})
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Preset Jam</span>
                            <div className="grid grid-cols-2 gap-1 text-[11px]">
                              <button
                                type="button"
                                onClick={() => handleQuickTimePreset(9, 0)}
                                className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-center transition font-mono"
                              >
                                09:00 (Pagi)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickTimePreset(12, 0)}
                                className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-center transition font-mono"
                              >
                                12:00 (Siang)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickTimePreset(17, 0)}
                                className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-center transition font-mono"
                              >
                                17:00 (Sore)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickTimePreset(23, 59)}
                                className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-center transition font-mono"
                              >
                                23:59 (Malam)
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setNewDueDate('');
                            setSelectedDate(null);
                          }}
                          className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition"
                        >
                          Hapus Waktu
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(false)}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                        >
                          Selesai
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition rounded-xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Simpan Kartu
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Board Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {renderColumn('todo', 'Belum Dikerjakan', todoTasks)}
          {renderColumn('in_progress', 'Sedang Dikerjakan', inProgressTasks)}
          {renderColumn('done', 'Selesai', doneTasks)}
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS MODERN */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 text-center animate-in zoom-in-95 duration-200">
            
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                Hapus Tugas Ini?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Tugas <span className="font-semibold text-slate-700">"{taskToDelete.title}"</span> akan dihapus permanen.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteTask}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition shadow-sm shadow-red-600/20"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

      <SupportNoteModal
        isOpen={isModalOpen}
        message={selectedNote}
        author={selectedAuthor}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );

  // Render Kolom
  function renderColumn(
    status: TaskStatus,
    title: string,
    columnTasks: Task[]
  ) {
    const isOver = dragOverColumn === status;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, status)}
        className={`bg-slate-200/50 p-4 rounded-2xl border transition-all min-h-110 flex flex-col ${
          isOver
            ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-200'
            : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-bold text-slate-700 text-xs uppercase tracking-wider">{title}</h2>
          <span className="bg-white border border-slate-200 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold shadow-sm">
            {columnTasks.length}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {columnTasks.map((task) => renderCard(task))}
          {columnTasks.length === 0 && (
            <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 font-mono bg-white/40">
              Tarik kartu ke sini
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Kartu Task
  function renderCard(task: Task) {
    const isEditing = editingTaskId === task.id;
    const isBeingDragged = draggedTaskId === task.id;

    if (isEditing) {
      return (
        <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-300 shadow-md space-y-3 animate-fade-in">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEditPriorityOpen(!isEditPriorityOpen)}
                className="w-full flex items-center justify-between px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
              >
                <span>{priorityLabels[editPriority]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isEditPriorityOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 space-y-0.5">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setEditPriority(p);
                        setIsEditPriorityOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                        editPriority === p ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {priorityLabels[p]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="datetime-local"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleUpdateTask(task.id)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-sm flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Simpan
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        className={`bg-white hover:border-slate-300 p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all cursor-grab active:cursor-grabbing group space-y-2.5 ${
          isBeingDragged ? 'opacity-40 border-dashed border-slate-400' : ''
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition" />
              {getPriorityBadge(task.priority || 'medium')}
            </div>
            
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => startEdit(task)}
                className="p-1.5 sm:p-1 text-slate-400 hover:text-slate-700 bg-slate-50 sm:bg-transparent rounded-lg transition"
                title="Edit Tugas"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              </button>
              <button
                type="button"
                onClick={() => setTaskToDelete(task)}
                className="p-1.5 sm:p-1 text-slate-400 hover:text-red-500 bg-slate-50 sm:bg-transparent rounded-lg transition"
                title="Hapus Tugas"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              </button>
            </div>
          </div>

          <h3 className={`text-xs font-semibold text-slate-800 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
          )}
        </div>

        {task.due_date && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              {new Date(task.due_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    );
  }
}