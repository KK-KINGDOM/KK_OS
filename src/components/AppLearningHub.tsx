import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
  Play,
  FileText,
  UploadCloud,
  Sparkles,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { playClickSound } from "../utils/sound";

interface Course {
  id: string;
  title: string;
  provider: "Coursera" | "Udemy" | "Duolingo" | "Classroom";
  instructor: string;
  progress: number;
  badgeColor: string;
  nextLesson: string;
  category: string;
}

const COURSES: Course[] = [
  {
    id: "c1",
    title: "Spanish: Conversational Fluency Level 3",
    provider: "Duolingo",
    instructor: "Duo AI Tutor",
    progress: 78,
    badgeColor: "bg-emerald-500",
    nextLesson: "Lesson 4: Ordering Tapas & Asking Directions",
    category: "Languages"
  },
  {
    id: "c2",
    title: "Deep Learning Specialization with Gemini & PyTorch",
    provider: "Coursera",
    instructor: "Andrew Ng & Google Brain",
    progress: 64,
    badgeColor: "bg-blue-600",
    nextLesson: "Module 6: Multi-Head Attention Mechanisms",
    category: "AI & Computer Science"
  },
  {
    id: "c3",
    title: "Complete 2026 Web Development Bootcamp",
    provider: "Udemy",
    instructor: "Angela Yu",
    progress: 92,
    badgeColor: "bg-purple-600",
    nextLesson: "Section 28: React 18 Concurrent Rendering",
    category: "Programming"
  },
  {
    id: "c4",
    title: "CS 401: Distributed Operating Systems",
    provider: "Classroom",
    instructor: "Prof. Tanenbaum",
    progress: 45,
    badgeColor: "bg-amber-600",
    nextLesson: "Assignment 3: Microkernel Inter-Process Messaging",
    category: "University"
  }
];

export default function AppLearningHub() {
  const [activeProvider, setActiveProvider] = useState<"All" | "Duolingo" | "Coursera" | "Udemy" | "Classroom">("All");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [streakCount, setStreakCount] = useState<number>(42);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const filtered = COURSES.filter(
    (c) => activeProvider === "All" || c.provider === activeProvider
  );

  const handleSelectQuiz = (ans: string) => {
    playClickSound();
    setQuizAnswer(ans);
    setIsSubmitted(true);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white select-none font-sans overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 text-white shadow-md">
            <GraduationCap size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">Learning Hub</h2>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
              <Flame size={12} className="fill-amber-400" />
              <span>{streakCount} Day Streak Active!</span>
            </div>
          </div>
        </div>

        {/* Provider Filter */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold overflow-x-auto scrollbar-none">
          {(["All", "Duolingo", "Coursera", "Udemy", "Classroom"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                playClickSound();
                setActiveProvider(p);
              }}
              className={`px-2 py-1 rounded-lg transition-all shrink-0 ${
                activeProvider === p ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Interactive Duolingo Daily Quiz Widget */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-emerald-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Daily Spanish Challenge (Duolingo)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">+15 XP</span>
          </div>

          <p className="text-xs font-bold text-white">
            Translate: <span className="text-amber-300 font-black">"Where is the train station?"</span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "A", text: "¿Dónde está la estación de tren?" },
              { id: "B", text: "¿Cómo te llamas?" },
              { id: "C", text: "¿Cuánto cuesta el billete?" },
              { id: "D", text: "Buenas noches, señor." }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectQuiz(opt.id)}
                className={`p-2.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  quizAnswer === opt.id
                    ? opt.id === "A"
                      ? "bg-emerald-600 border-emerald-400 text-white shadow"
                      : "bg-rose-600 border-rose-400 text-white"
                    : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>

          {isSubmitted && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>¡Excelente! Correct answer: 15 XP added to your profile!</span>
            </div>
          )}
        </div>

        {/* Active Enrolled Courses */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
            Enrolled Courses & Assignments
          </h3>

          <div className="space-y-3">
            {filtered.map((course) => (
              <div
                key={course.id}
                onClick={() => {
                  playClickSound();
                  setSelectedCourse(course);
                }}
                className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer group transition-all space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase">
                      {course.provider} • {course.category}
                    </span>
                    <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">{course.instructor}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Play size={14} />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Progress</span>
                    <span className="text-white font-bold">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-300 font-medium truncate flex items-center gap-1.5">
                  <BookOpen size={12} className="text-emerald-400 shrink-0" />
                  <span>Next: {course.nextLesson}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
