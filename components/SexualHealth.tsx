import React, { useState, useEffect, useMemo } from 'react';
import MentalHealthChat from './MentalHealthChat';
import useAppStore, { useHealthData } from '../store/useAppStore';
import { HealthData } from '../types';
type ViewState = 'DASHBOARD' | 'WOMENS_HEALTH' | 'CONTRACEPTION_GUIDE' | 'ARTICLE_VIEW' | 'MENS_HEALTH_VIEW' | 'MENTAL_HEALTH_VIEW';
type MensTab = 'VITALITY' | 'EXAM' | 'RISKS';
type WomensTab = 'CYCLE' | 'INSIGHTS' | 'LOG' | 'RESOURCES';
type WomensResourceView = 'NONE' | 'PREGNANCY' | 'HORMONAL' | 'MENOPAUSE' | 'PELVIC';
type MentalTab = 'DASHBOARD' | 'JOURNAL' | 'LIBRARY' | 'TOOLS' | 'SUPPORT' | 'CHAT';
type BudgetItemType = 'monthly' | 'one-time';

interface BudgetItem {
  name: string;
  cost: number;
  type: BudgetItemType;
  category: string;
}

interface JournalEntry {
  id: number;
  date: Date;
  text: string;
  mood?: string;
  tags: string[];
}

interface MoodLog {
  id: number;
  date: Date;
  level: number; // 1-5
  physical: string[];
  factors: string[];
  note: string;
}
type ContraceptionTab = 'MATCH' | 'REMINDERS' | 'SIDE_EFFECTS';
type FamilyPlanningTab = 'GUIDE' | 'CHECKLIST' | 'BUDGET';
type ArticleId = 'planning';

interface ContraceptiveMethod {
  id: string;
  name: string;
  efficacy: string;
  efficacyValue: number; // 0-100
  type: string;
  desc: string;
  pros: string[];
  cons: string[];
  tags: string[];
  bestFor: string;
}

// --- Icons (Consistent Stroke) ---
const Icons = {
  Back: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  ChevronDown: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  Close: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Leaf: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Check: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Activity: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Info: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Drop: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Search: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Calendar: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Moon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0112 21a9.003 9.003 0 018.354-5.646z" /></svg>,
  Zap: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  UserPlus: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  Sparkles: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Fire: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
  Chip: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  Clock: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Bell: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Refresh: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Play: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
  Pause: (props: any) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M10 19H6V5h4v14zm8-14h-4v14h4V5z" /></svg>,
  Trash: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Star: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Calculator: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  List: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Heart: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  ChartBar: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Book: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Brain: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Pen: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Male: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="10" cy="14" r="4" strokeWidth={1.8} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 10.5l7-7M20.5 3.5h-5M20.5 3.5v5" /></svg>,
  Female: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="9.5" r="4.5" strokeWidth={1.8} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14v6M9 19h6" /></svg>,
};

const formatRWF = (value: number) =>
  new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(value);

const KegelTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const [phase, setPhase] = useState<'SQUEEZE' | 'RELAX'>('SQUEEZE');
  const [reps, setReps] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && reps < 10) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s === 1) {
            if (phase === 'SQUEEZE') {
              setPhase('RELAX');
              return 5;
            } else {
              setPhase('SQUEEZE');
              setReps(r => r + 1);
              return 5;
            }
          }
          return s - 1;
        });
      }, 1000);
    } else if (reps >= 10) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, reps]);

  const reset = () => { setIsActive(false); setSeconds(5); setPhase('SQUEEZE'); setReps(0); };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-teal-100 dark:border-teal-900 shadow-sm text-center relative overflow-hidden transition-colors">
      <h4 className="font-bold text-teal-900 dark:text-teal-400 mb-6 text-lg">Pelvic Floor Trainer</h4>
      <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full border-4 ${phase === 'SQUEEZE' ? 'border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'border-teal-100 dark:border-teal-900'} transition-all duration-500`}></div>
        <div className={`w-full h-full rounded-full bg-teal-500 transition-transform duration-1000 ease-in-out ${phase === 'SQUEEZE' ? 'scale-90 opacity-20' : 'scale-50 opacity-10'}`}></div>
        <div className="relative z-10">
          <span className="block text-4xl font-black text-teal-900 dark:text-teal-100">{seconds}</span>
          <span className="text-xs font-bold text-teal-500 dark:text-teal-400 uppercase tracking-widest">{phase}</span>
        </div>
      </div>
      <div className="flex justify-between items-center px-4 mb-6">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Reps: {reps}/10</span>
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i < reps ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
          ))}
        </div>
      </div>
      {!isActive ? (
        <button onClick={() => setIsActive(true)} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-teal-200 dark:shadow-teal-900/40 active:scale-95 transition-transform">{reps >= 10 ? 'Start Again' : 'Start Session'}</button>
      ) : (
        <button onClick={reset} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-sm">Stop</button>
      )}
    </div>
  );
};

const SexualHealth: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [mensTab, setMensTab] = useState<MensTab>('VITALITY');
  const [womensTab, setWomensTab] = useState<WomensTab>('CYCLE');
  const [womensResource, setWomensResource] = useState<WomensResourceView>('NONE');
  const [contraceptionTab, setContraceptionTab] = useState<ContraceptionTab>('MATCH');
  const [familyTab, setFamilyTab] = useState<FamilyPlanningTab>('GUIDE');

  const [activeArticle, setActiveArticle] = useState<ArticleId | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mensChecklist, setMensChecklist] = useState<string[]>([]);
  const [examStep, setExamStep] = useState(0);
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  // Pregnancy Tracker State
  const [dueDate, setDueDate] = useState<string>('');
  const [pregnancyWeek, setPregnancyWeek] = useState<number | null>(null);

  // Contraception State
  const [methodFilter, setMethodFilter] = useState<string>('Byose');
  const [pillReminder, setPillReminder] = useState<boolean>(false);
  const [pillTime, setPillTime] = useState<string>('09:00');
  const [selectedSideEffect, setSelectedSideEffect] = useState<string | null>(null);

  // LARC Tracker State
  const [larcDate, setLarcDate] = useState<string>('');
  const [larcYears, setLarcYears] = useState<number>(3);

  // Family Planning State
  const [familyPhase, setFamilyPhase] = useState<string>('PREP');
  const [checklist, setChecklist] = useState<string[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { name: 'Impapuro z’abana n’isuku', cost: 0, type: 'monthly', category: 'Ibikoresho by’ingenzi' },
    { name: 'Ifunguro ry’umwana', cost: 0, type: 'monthly', category: 'Ibikoresho by’ingenzi' },
    { name: 'Gutunganya icyumba cy’umwana', cost: 0, type: 'one-time', category: 'Icyumba cy’umwana' },
    { name: 'Imodoka y’umwana n’intebe', cost: 0, type: 'one-time', category: 'Ibikoresho' },
    { name: 'Gusura muganga', cost: 0, type: 'monthly', category: 'Ubuvuzi' },
    { name: 'Imyenda y’umwana', cost: 0, type: 'one-time', category: 'Ibikoresho by’ingenzi' }
  ]);
  const initialBudgetItem: BudgetItem = {
    name: '',
    cost: 0,
    type: 'monthly',
    category: '',
  };
  const [newBudgetItem, setNewBudgetItem] = useState<BudgetItem>(initialBudgetItem);

  // Mental Health State
  const [mood, setMood] = useState<string | null>(null);

  // Mental Health State
  const [mentalTab, setMentalTab] = useState<MentalTab>('DASHBOARD');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInStep, setCheckInStep] = useState(0);
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [currentPhysical, setCurrentPhysical] = useState<string[]>([]);
  const [currentFactors, setCurrentFactors] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationTime, setMeditationTime] = useState(300);
  const [soundscape, setSoundscape] = useState('SILENCE');
  const [groundingSteps, setGroundingSteps] = useState<number[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [readingArticle, setReadingArticle] = useState<any | null>(null);
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [showJournalSuccess, setShowJournalSuccess] = useState(false);
  const [activePrompt, setActivePrompt] = useState("Ni iki cyari ikintu kigoye kurusha ibindi mu kazi kawe uyu munsi?");
  const { updateHealthData } = useAppStore();
  const storeHealthData = useHealthData();

  const moodHistory = useMemo(() => {
    const logs = storeHealthData.mentalHealth?.moodLogs || [];
    return logs
      .map((h: any) => ({
        id: h.id,
        date: new Date(h.date),
        level: parseInt(h.level || '3'),
        physical: h.physical || [],
        factors: h.factors || [],
        note: h.note || ''
      }))
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
  }, [storeHealthData]);

  const toggleMensCheck = (item: string) => {
    if (mensChecklist.includes(item)) setMensChecklist(mensChecklist.filter(i => i !== item));
    else setMensChecklist([...mensChecklist, item]);
  };

  const toggleSymptom = (symptom: string) => {
    if (symptoms.includes(symptom)) setSymptoms(symptoms.filter(s => s !== symptom));
    else setSymptoms([...symptoms, symptom]);
  };

  const navigateToResource = (resource: WomensResourceView) => {
    setWomensTab('RESOURCES');
    setWomensResource(resource);
  };

  const handleDueDateChange = (dateStr: string) => {
    setDueDate(dateStr);
    if (dateStr) {
      const due = new Date(dateStr);
      const today = new Date();
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daysPassed = 280 - diffDays; // 40 weeks = 280 days
      const week = Math.floor(daysPassed / 7);
      setPregnancyWeek(week > 0 ? (week > 42 ? 42 : week) : 0);
    } else {
      setPregnancyWeek(null);
    }
  };

  const getBabySize = (week: number) => {
    if (week < 4) return "Poppy Seed";
    if (week < 8) return "Blueberry";
    if (week < 12) return "Lime";
    if (week < 16) return "Avocado";
    if (week < 20) return "Banana";
    if (week < 24) return "Ear of Corn";
    if (week < 28) return "Eggplant";
    if (week < 32) return "Squash";
    if (week < 36) return "Honeydew";
    return "Watermelon";
  };

  // --- Data ---
  const methods: ContraceptiveMethod[] = [
    {
      id: '1', name: 'Ibinini', efficacy: '99%', efficacyValue: 95, type: 'Imiti ngendanubuzima',
      desc: 'Imiti yo kumira buri munsi.',
      pros: ['Itunganya imihango', 'Igabanya udusebe', 'Igaruka vuba'],
      cons: ['Gusaba kwibuka buri munsi', 'Impinduka z\'imyumvire'],
      tags: ['Buri munsi', 'Imiti ngendanubuzima'],
      bestFor: 'Abakunda gahunda bakeneye kugabanya udusebe.'
    },
    {
      id: '2', name: 'IUD (Umuringa)', efficacy: '>99%', efficacyValue: 99.8, type: 'Nta miti ngendanubuzima',
      desc: 'Igikoresho kidafite imiti ngendanubuzima gishyirwa mu mura.',
      pros: ['Imara imyaka 10-12', 'Nta miti ngendanubuzima', 'Ushyira ukirengagiza'],
      cons: ['Imihango irushaho', 'Kubabara igihe bishyirwamo'],
      tags: ['Igihe kirekire', 'Nta miti ngendanubuzima'],
      bestFor: 'Uburyo bwo kwirinda igihe kirekire nta miti ngendanubuzima.'
    },
    {
      id: '3', name: 'IUD (Imiti ngendanubuzima)', efficacy: '>99%', efficacyValue: 99.5, type: 'Imiti ngendanubuzima',
      desc: 'Igikoresho gifite imiti ngendanubuzima nke.',
      pros: ['Imihango yoroheje', 'Imara imyaka 3-7', 'Ushyira ukirengagiza'],
      cons: ['Kutagira uburuhukiro igihe bishyirwamo', 'Gutakaza amaraso mu ntangiriro'],
      tags: ['Igihe kirekire', 'Imiti ngendanubuzima'],
      bestFor: 'Imihango yoroheje n\'uburyo bworoshye bw\'igihe kirekire.'
    },
    {
      id: '4', name: 'Agakingirizo', efficacy: '85-98%', efficacyValue: 88, type: 'Igikingirizo',
      desc: 'Igikingirizo cy\'indwara zandurira mu mibonano mpuzabitsina n\'inda.',
      pros: ['Kurinda indwara zandurira', 'Nta miti ngendanubuzima', 'Igihe icyo ari cyo cyose'],
      cons: ['Bihagarika akanya', 'Bishobora gucika/kwiruka'],
      tags: ['Nta miti ngendanubuzima', 'Igihe icyo ari cyo cyose'],
      bestFor: 'Kurinda indwara zandurira n\'ubundi buryo.'
    },
    {
      id: '5', name: 'Implanon', efficacy: '>99%', efficacyValue: 99.9, type: 'Imiti ngendanubuzima',
      desc: 'Agati gato kashyirwa munsi y\'uruhu rw\'ukuboko.',
      pros: ['Imara imyaka 3', 'Ntigaragara', 'Irakora neza'],
      cons: ['Gutakaza amaraso bidahoraho', 'Igikorwa gito'],
      tags: ['Igihe kirekire', 'Imiti ngendanubuzima'],
      bestFor: 'Uburyo bwo kwirinda bwiza cyane, nta mwanya usabwa.'
    },
  ];

  const sideEffects = [
    { id: 'nausea', label: 'Kwongera kurya', guidance: 'Ibi birashobora kubaho kwa estrogen. Bimwe bifasha mu minsi 2-3.', tip: 'Kurya n\'ijoro cyangwa mbere yo kwiba.', alert: 'Kumira cyane mu nda.' },
    { id: 'spotting', label: 'Kutakaza amaraso', guidance: 'Ibi birashobora kubaho mu minsi 3-6 ya mbere ya LARC cyangwa ibinini.', tip: 'Kwandika buri munsi. Kuba n\'amaraso ahari.', alert: 'Kutakaza amaraso kanke kandi kibisi.' },
  ];

  const dashboardCards = [
    {
      id: 'mental',
      title: 'Ubuzima bwo mu mutwe',
      subtitle: 'Shakisha ubuyobozi n\'ibikoresho bigufasha kubaho neza.',
      cta: 'Soma byinshi',
      icon: 'Brain' as const,
      iconBg: 'bg-[#FFDAB9]/40 text-[#FF7A1C]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfWj8Wr-VYsgwzhZal_ONQ8LtyX6FSXsS9RAAglcdtdAx7_aNYfMLpVoWGAX2hREy367qmykuyYx05gaZmKrim-rIpqO1ATVEt99BXMCRm_qNneco404KndFceTQ90LZYHSc_j0Y2fW1jngkouxu87yE9tBqUyUbs3dHWqwZIoAgH8sZhBx8o-bCbKyGbIRk1Ptpj78U96T8WMh-r9AcWg_ZZ9YXa_ZpUiA4Dxb_6kE61dg5FGDzCRj1xJTFm7b97byxA8C8Cyn3U',
      imageAlt: 'Ishusho y\'umuntu utekereza mu bwiza bw\'ibidukikije.',
      imageBg: 'bg-[#FFDAB9]/35',
      action: () => setView('MENTAL_HEALTH_VIEW'),
    },
    {
      id: 'contraception',
      title: 'Uburyo bwo kwirinda gusama',
      subtitle: 'Menya uburyo butandukanye uhitemo ibikwiye.',
      cta: 'Soma byinshi',
      icon: 'Shield' as const,
      iconBg: 'bg-[#FFDAB9]/40 text-[#FF9500]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAv9eKUvF9G7gPr3ggKbg1CoJ-PGUc-XtNfFcG0wAxfJ5iBLDl3HihiPxVQz3m50BsK3-oxZU6J1TjroZXDB4X_O3o-hv_y9igGuXita-DXCvbZpT9OCIfHm04yuOstWYpMxemZmUEEakqW85LpXFMWyg8n6hImyA6k0qWYyz4m-SeEbRGmofgA87PvA643VNtFNTEEbaTbwyLoXBu0RsyqEYzIyeyIPsuD1iZoEw1XW7znTi5tJeVUX6sWt5Uornb-6KPeX7CNwb4',
      imageAlt: 'Ishusho y\'uburyo butandukanye bwo kwirinda gusama.',
      imageBg: 'bg-[#B0E0E6]/30',
      action: () => setView('CONTRACEPTION_GUIDE'),
    },
    {
      id: 'family',
      title: 'Gutegura umuryango',
      subtitle: 'Ibikoresho n\'ubufasha ku rugendo rwo kuba umubyeyi.',
      cta: 'Soma byinshi',
      icon: 'UserPlus' as const,
      iconBg: 'bg-[#FFE2D5]/45 text-[#FF6B3D]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-Y694N-6I_QDJAtNbTba7QN2gUnkU1Sf9q2msvZGBN7DKSkeL0nJtZQp8lrC8ZYsMYPYcoqN91kUHQddtqBFGMsqHgB07yzHwwLxZSmZSJR1EbEae3koqzGeTxX7zEQn29J08Yo3sOBCX031_D_odruOWAm02ULmSMd6ImmeU81B50h1vOkKlASDmeKO3WWqRKI7XCTj1_6yKvqJhVwBeVSl5Zrv31tqJ6cjuQK8qUsAA1kGitIicyOwAbZy_EP_5gWAICio7-mU',
      imageAlt: 'Ishusho y\'abashakanye bategura ejo hazaza.',
      imageBg: 'bg-[#B0E0E6]/30',
      action: () => { setActiveArticle('planning'); setView('ARTICLE_VIEW'); },
    },
    {
      id: 'mens',
      title: 'Ubuzima bw\'imyororokere bw\'abagabo',
      subtitle: 'Amakuru ku buzima, imibereho myiza, no kwirinda indwara.',
      cta: 'Soma byinshi',
      icon: 'Male' as const,
      iconBg: 'bg-[#FFDAB9]/35 text-[#2563EB]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBenVMuDCMT1GgC_J5KgOd9CwYdJtC5BJ5PZvbM2BDDCh7awvd29VIg2V45ArvvN5lQK1KGvkHwja0v3xC0hq9vaGjz-DRl8NQOK-D2dJ7Vqzt9o5fV5V8S3DWJr9ahCZHvRlaj5nVevPgYZPsYK3Avca1CqGWTIcB4HpqF_RsRoCKpqMviSZG6bR0WoxeneCu4R-drljH-p5mU_KRp-TwuXKs1xGJ64MDzBj9ALenF_-4WtjfJE44Yv82oSp6If8rN_yW3-vPBr5A',
      imageAlt: 'Ishusho y\'umusore wishimye aharanira ubuzima bw\'abagabo.',
      imageBg: 'bg-[#FFDAB9]/30',
      action: () => setView('MENS_HEALTH_VIEW'),
    },
    {
      id: 'womens',
      title: 'Ubuzima bw\'imyororokere bw\'abagore',
      subtitle: 'Ubuyobozi ku mihango, gusuzumwa, n\'ibindi byinshi.',
      cta: 'Soma byinshi',
      icon: 'Female' as const,
      iconBg: 'bg-[#FFE2F2]/45 text-[#D946EF]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNdM0AGZDhQS2qvyp08uKmBmqpYocEGxlowZjBpwfP5Uj2pSfu4572EOfFgBzUJIVwc2IP9F2IjrBDAFZXE1vFmp-_CyHqsoXamjIrOwhDyMfrNDAHsrMWBHRu0cCApmKa1dRbvlVxKIVmoC7EiANyYul8gCTHRVCZ_ohoq6bxAC87LvCjNbTCynicHIGmBHFhUkcXi_H4S547hmchdVr43blj4sefeX19gAOS-efP6i9xMyPkEfw5TLgBRZEA_0raXaVOmPqUCBw',
      imageAlt: 'Ishusho y\'umukobwa utekereza aharanira ubuzima bw\'abagore.',
      imageBg: 'bg-[#B0E0E6]/25',
      action: () => setView('WOMENS_HEALTH'),
    },
  ];

  const handleSaveJournal = () => {
    if (!journalEntry.trim()) return;
    const newEntry: JournalEntry = { id: Date.now(), date: new Date(), text: journalEntry, mood: 'Neutral', tags: ['Daily Entry'] };
    setJournalHistory([newEntry, ...journalHistory]);
    setJournalEntry('');
    setShowJournalSuccess(true);
    setTimeout(() => setShowJournalSuccess(false), 3000);
  };
  const deleteJournal = (id: number) => setJournalHistory(journalHistory.filter(j => j.id !== id));
  const shufflePrompt = () => {
    const prompts = ["Ni iki cyagenze neza uyu munsi?", "Urumva umubiri wawe umeze ute?", "Ni iki witeze mu minsi iri imbere?", "Ese uyu munsi wiyumvaga utekanye?"];
    setActivePrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  };
  const finishCheckIn = () => {
    const newLog: MoodLog = {
      id: Date.now(),
      date: new Date(),
      level: currentMood,
      physical: currentPhysical,
      factors: currentFactors,
      note: currentNote
    };
    const newHistory = [newLog, ...moodHistory];
    updateHealthData('mentalHealth', { moodLogs: newHistory });
    setIsCheckInOpen(false);
    setCheckInStep(0);
    setCurrentPhysical([]);
    setCurrentFactors([]);
    setCurrentNote('');
  };
  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs < 10 ? '0' : ''}${secs}`; };

  // --- Effects ---
  useEffect(() => {
    let interval: any = null;
    if (meditationActive && meditationTime > 0) {
      interval = setInterval(() => { setMeditationTime(t => t - 1); }, 1000);
    } else if (meditationTime === 0) { setMeditationActive(false); }
    return () => clearInterval(interval);
  }, [meditationActive, meditationTime]);

  // --- Data ---
  const articles = [
    { id: 1, title: "Managing Shift Work Sleep Disorder", category: "Sleep", read: "4 min", desc: "Strategies to adjust your body clock when working rotating shifts." },
    { id: 2, title: "Financial Anxiety & Mental Health", category: "Money", read: "5 min", desc: "Understanding the link between your wallet and your wellbeing." },
    { id: 3, title: "Reconnecting After a Roster", category: "Family", read: "3 min", desc: "Tips for transitioning from work mode back to family life." },
    { id: 4, title: "Spotting the Signs of Burnout", category: "Health", read: "6 min", desc: "Physical and emotional warning signs you shouldn't ignore." }
  ];

  const renderMentalHealth = () => {
    if (mentalTab === 'CHAT') return <MentalHealthChat onBack={() => setMentalTab('DASHBOARD')} />;
    return (
      <div className="animate-slide-in-right pb-44">
        <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl mb-6 transition-colors border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 py-3">
            {(['DASHBOARD', 'JOURNAL', 'LIBRARY', 'TOOLS', 'SUPPORT', 'CHAT'] as MentalTab[]).map(tab => (
              <button key={tab} onClick={() => { setMentalTab(tab); setReadingArticle(null); setActiveAssessment(null); }} className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${mentalTab === tab ? 'bg-slate-900 text-white shadow-slate-300 dark:shadow-slate-900/50 scale-105 border-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{tab === 'DASHBOARD' && 'Ubuzima bwanjye'}{tab === 'JOURNAL' && 'Andika'}{tab === 'LIBRARY' && 'Isomero'}{tab === 'TOOLS' && 'Ibikoresho'}{tab === 'SUPPORT' && 'Ubufasha'}{tab === 'CHAT' && 'Ibiganiro'}</button>
            ))}
          </div>
        </div>
        <div className="px-6">
          {mentalTab === 'DASHBOARD' && !activeAssessment && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-black rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
                <h2 className="text-2xl font-bold mb-2 relative z-10">Mwiriwe neza</h2>
                <p className="text-slate-300 text-sm mb-8 max-w-[80%] relative z-10">Gufata akanya ko kwisuzuma bishobora gukumira umunaniro.</p>
                <button onClick={() => setIsCheckInOpen(true)} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 relative z-10 hover:bg-slate-50">Tangira kwisuzuma</button>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Imyumvire y'icyumweru</h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Iminsi 7 ishize</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Avg: 3.2</span>
                  </div>
                </div>
                <div className="h-32 flex items-end justify-between gap-2">
                  {moodHistory.slice(0, 7).reverse().map((log, idx) => {
                    const heightPercent = (log.level / 5) * 100;
                    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-teal-500'];
                    const bgColor = colors[log.level - 1] || 'bg-slate-300';
                    const days = ['Cyu', 'Mbe', 'Kab', 'Gat', 'Kan', 'Gat', 'Gic'];
                    const dayIdx = new Date(log.date).getDay();

                    return (
                      <div key={log.id} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center justify-end h-24 relative">
                          <div
                            className={`w-full rounded-t-lg ${bgColor} transition-all hover:opacity-80 cursor-pointer relative group`}
                            style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                          >
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Level {log.level}/5
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {days[dayIdx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Umunsi mwiza</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Kuwa kane</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Iminsi ikurikirana</p>
                    <p className="text-sm font-bold text-teal-600 dark:text-teal-400">Iminsi 5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Kwisuzuma</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">7/7</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {mentalTab === 'TOOLS' && (
            <div className="space-y-8 animate-slide-up flex flex-col items-center">
              <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Igihe cya meditasiyo</h3>
                <div className="flex gap-2 mb-8">{[{ id: 'SILENCE', label: 'Ahantu hatuje' }, { id: 'RAIN', label: 'Imvura' }, { id: 'NATURE', label: 'Mu mutuzo w’ibidukikije' }].map(s => (<button key={s.id} onClick={() => setSoundscape(s.id)} className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${soundscape === s.id ? 'bg-teal-500 text-white border-teal-500' : 'text-slate-500 border-slate-200 dark:border-slate-700 hover:border-teal-200'}`}>{s.label}</button>))}</div>
                <div className="w-64 h-64 rounded-full border-8 border-slate-50 dark:border-slate-800 flex items-center justify-center relative mb-8">{meditationActive && (<><div className="absolute inset-0 rounded-full border-4 border-teal-500 opacity-20 animate-ping" style={{ animationDuration: '4s' }}></div><div className="absolute inset-0 rounded-full border-t-4 border-teal-500 animate-spin" style={{ animationDuration: '4s' }}></div></>)}<div><span className="block text-5xl font-black text-slate-900 dark:text-white tabular-nums">{formatTime(meditationTime)}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{meditationActive ? 'Humeka... Sohora' : 'Witeguye'}</span></div></div>
                <button onClick={() => setMeditationActive(!meditationActive)} className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-90 ${meditationActive ? 'bg-slate-300 text-slate-500' : 'bg-teal-500'}`}>{meditationActive ? <Icons.Pause className="w-6 h-6" /> : <Icons.Play className="w-6 h-6 ml-1" />}</button>
              </div>
              <div className="w-full bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] p-8 border border-rose-100 dark:border-rose-900/20"><h3 className="font-bold text-lg text-rose-900 dark:text-rose-300 mb-2">Gukemura ubwoba</h3><div className="space-y-3">{[{ num: 5, text: 'Ibintu ubona' }, { num: 4, text: 'Ibintu ukoraho' }, { num: 3, text: 'Ibintu wumva' }, { num: 2, text: 'Ibintu uhumurirwa' }, { num: 1, text: 'Ikintu uryoherwa' }].map(step => (<div key={step.num} onClick={() => { if (groundingSteps.includes(step.num)) setGroundingSteps(groundingSteps.filter(n => n !== step.num)); else setGroundingSteps([...groundingSteps, step.num]); }} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${groundingSteps.includes(step.num) ? 'bg-white/50 dark:bg-black/20 opacity-50' : 'bg-white dark:bg-slate-900 shadow-sm'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${groundingSteps.includes(step.num) ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}`}>{groundingSteps.includes(step.num) ? <Icons.Check className="w-4 h-4" /> : step.num}</div><span className={`text-sm font-bold ${groundingSteps.includes(step.num) ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{step.text}</span></div>))}</div></div>
            </div>
          )}
          {mentalTab === 'LIBRARY' && !readingArticle && (<div className="space-y-6 animate-slide-up"><div className="space-y-4">{articles.map(article => (<div key={article.id} onClick={() => setReadingArticle(article)} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex gap-4 cursor-pointer active:scale-[0.98] transition-all group"><div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 flex items-center justify-center text-2xl group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 transition-colors">{article.category === 'Sleep' ? '💤' : article.category === 'Money' ? '💸' : article.category === 'Family' ? '🏠' : '🩺'}</div><div><h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">{article.title}</h3><p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{article.desc}</p></div></div>))}</div></div>)}
          {readingArticle && (<div className="animate-slide-up"><button onClick={() => setReadingArticle(null)} className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-slate-800 w-fit">
            <Icons.Back className="w-5 h-5" />
            Back to Library
          </button><div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm"><h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6 leading-tight">{readingArticle.title}</h1><div className="prose prose-slate dark:prose-invert prose-sm"><p className="leading-relaxed">This is a placeholder for the full article content.</p></div></div></div>)}
          {mentalTab === 'JOURNAL' && (<div className="space-y-6 animate-slide-up"><div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">{showJournalSuccess && (<div className="absolute top-0 left-0 w-full bg-green-500 text-white text-xs font-bold py-2 text-center animate-fade-in z-20">Entry Saved Successfully!</div>)}<div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl mb-4 relative"><p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Igitekerezo cyo kwandikaho</p><p className="text-indigo-900 dark:text-indigo-200 font-medium text-sm leading-relaxed pr-8">"{activePrompt}"</p><button onClick={shufflePrompt} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600 dark:hover:text-white transition-colors"><Icons.Refresh className="w-4 h-4" /></button></div><textarea value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} placeholder="Tangirira hano wandika..." className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/40 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 transition-all border border-slate-100 dark:border-slate-700" /><div className="flex justify-between mt-4"><span className="text-xs text-slate-400 font-medium">{new Date().toLocaleDateString()}</span><button onClick={handleSaveJournal} className="px-6 py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-200 dark:shadow-purple-900/30 active:scale-95 transition-transform flex items-center gap-2"><Icons.Check className="w-4 h-4" /> Bika</button></div></div><div className="space-y-4"><h3 className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest px-2">Ibiheruka</h3>{journalHistory.length === 0 ? (<div className="text-center py-10 opacity-50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]"><p className="text-sm font-medium text-slate-500">Nta na kimwe kirandikwa. Tangira wandike!</p></div>) : (journalHistory.map((entry) => (<div key={entry.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none relative group"><div className="flex justify-between items-start mb-3"><div className="flex gap-2"><span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{entry.date.toLocaleDateString()}</span></div><button onClick={() => deleteJournal(entry.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Icons.Trash className="w-4 h-4" /></button></div><p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{entry.text}</p></div>)))}</div></div>)}
          {mentalTab === 'SUPPORT' && (<div className="space-y-6 animate-slide-up"><div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] text-center shadow-xl"><h2 className="text-2xl font-bold text-white dark:text-slate-900 mb-2">Nturi wenyine.</h2><p className="text-slate-300 dark:text-slate-600 text-sm mb-8 leading-relaxed">Gusaba ubufasha ni ikimenyetso cy'imbaraga, si ubugoryi.</p><div className="grid grid-cols-1 gap-3"><a href="tel:114" className="flex items-center justify-center gap-3 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-transform">Hamagara umurongo w'ubufasha (114)</a></div></div></div>)}
          {isCheckInOpen && (<div className="fixed inset-0 z-50 flex items-end justify-center"><div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => { if (checkInStep === 0) setIsCheckInOpen(false); }}></div><div className="bg-white dark:bg-slate-900 w-full max-w-lg h-[85vh] rounded-t-[2.5rem] shadow-2xl animate-slide-up relative z-10 flex flex-col overflow-hidden"><div className="p-6 flex justify-between items-center"><button onClick={() => { if (checkInStep > 0) setCheckInStep(checkInStep - 1); else setIsCheckInOpen(false); }}><Icons.Back className="w-6 h-6 text-slate-400" /></button><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {checkInStep + 1} of 4</span><button onClick={() => setIsCheckInOpen(false)}><Icons.Close className="w-6 h-6 text-slate-400" /></button></div><div className="flex-1 p-8 flex flex-col items-center justify-center text-center animate-fade-in">{checkInStep === 0 && (<><h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Umunsi wawe wagenze ute?</h2><div className="flex flex-col gap-4 w-full max-w-xs">{[{ lvl: 5, label: 'Byiza cyane', emoji: '🤩' }, { lvl: 4, label: 'Byiza', emoji: '🙂' }, { lvl: 3, label: 'Biraho', emoji: '😐' }, { lvl: 2, label: 'Byari Bigoye', emoji: '😔' }, { lvl: 1, label: 'Birababaje cyane', emoji: '😫' }].map(opt => (<button key={opt.lvl} onClick={() => { setCurrentMood(opt.lvl); setCheckInStep(1); }} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between hover:scale-105 ${currentMood === opt.lvl ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-teal-200'}`}><span className="font-bold text-slate-700 dark:text-slate-200">{opt.label}</span><span className="text-2xl">{opt.emoji}</span></button>))}</div></>)}{checkInStep === 1 && (<><h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Isuzuma ry’umubiri</h2><div className="flex flex-wrap justify-center gap-3">{['Umunaniro', 'Ububabare mu mugongo', 'Ububabare bw’umutwe', 'Ufite imbaraga', 'Utuje', 'Umunaniro ukabije'].map(tag => (<button key={tag} onClick={() => currentPhysical.includes(tag) ? setCurrentPhysical(currentPhysical.filter(t => t !== tag)) : setCurrentPhysical([...currentPhysical, tag])} className={`px-6 py-3 rounded-full text-sm font-bold transition-all border-2 ${currentPhysical.includes(tag) ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>{tag}</button>))}</div><button onClick={() => setCheckInStep(2)} className="mt-12 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">Komeza</button></>)}{checkInStep === 2 && (<><h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ni iki kigutera ikibazo cyangwa kukubuza amahoro?</h2><div className="flex flex-wrap justify-center gap-3">{['Akazi', 'Amafaranga', 'Umuryango', 'Ubuzima'].map(tag => (<button key={tag} onClick={() => currentFactors.includes(tag) ? setCurrentFactors(currentFactors.filter(t => t !== tag)) : setCurrentFactors([...currentFactors, tag])} className={`px-6 py-3 rounded-full text-sm font-bold transition-all border-2 ${currentFactors.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>{tag}</button>))}</div><button onClick={() => setCheckInStep(3)} className="mt-12 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">Komeza</button></>)}{checkInStep === 3 && (<><h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ibyo utekereza ku musozo</h2><textarea value={currentNote} onChange={e => setCurrentNote(e.target.value)} placeholder="Optional note..." className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-8 resize-none focus:ring-2 focus:ring-teal-500 outline-none" /><button onClick={finishCheckIn} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform">Nasoje</button></>)}</div></div></div>)}
        </div>
      </div>
    );
  };

  const renderContraceptionGuide = () => {
    const filteredMethods = methodFilter === 'Byose'
      ? methods
      : methods.filter(m => m.tags.includes(methodFilter));

    return (
      <div className="animate-slide-in-right pb-44">
        <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl mb-6 transition-colors border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 py-3">
            {(['MATCH', 'REMINDERS', 'SIDE_EFFECTS'] as ContraceptionTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setContraceptionTab(tab)}
                className={`px-6 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${contraceptionTab === tab ? 'bg-slate-900 text-white shadow-slate-300 dark:shadow-slate-900/50 scale-105 border-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {tab === 'MATCH' ? 'Hitamo uburyo' : tab === 'REMINDERS' ? 'Kwibutsa' : 'Ingaruka mbi'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6">
          {contraceptionTab === 'MATCH' && (
            <div className="space-y-6 animate-slide-up">
              {/* ... (Existing Matcher UI) ... */}
              <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-center text-white relative overflow-hidden transition-colors shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-20 -ml-10 -mb-10"></div>
                <h2 className="text-3xl font-bold mb-2 relative z-10">Hitamo ibikwiye</h2>
                <p className="text-slate-300 text-sm leading-relaxed relative z-10 max-w-xs mx-auto">Shaka uburyo ukurikije imibereho yawe, ibyo ukunda, n'ibyo ukeneye mu buzima.</p>

                <div className="flex flex-wrap justify-center gap-2 mt-6 relative z-10">
                  {['Byose', 'Imiti ngendanubuzima', 'Nta miti ngendanubuzima', 'Igihe kirekire', 'Buri munsi'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setMethodFilter(tag)}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${methodFilter === tag ? 'bg-white text-slate-900 border-white' : 'bg-transparent text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {filteredMethods.map(method => (
                  <div key={method.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-5 group hover:shadow-lg transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xl">{method.name}</h3>
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg uppercase tracking-wider">{method.type}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{method.desc}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Imikorere</span>
                        <span className="text-teal-600 dark:text-teal-400">{method.efficacy}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${method.efficacyValue}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contraceptionTab === 'REMINDERS' && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Kwibutsa ibinini bya buri munsi</h3>
                  <button onClick={() => setPillReminder(!pillReminder)} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${pillReminder ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${pillReminder ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>
                <input type="time" value={pillTime} onChange={(e) => setPillTime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center font-bold text-3xl text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-700 mb-6" />
                <div className="grid grid-cols-7 gap-2">
                  {['Mbe', 'Kab', 'Gat', 'Kan', 'Gat', 'Gic', 'Cyu'].map((d, i) => (
                    <div key={i} className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold ${i < 4 ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{d}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {contraceptionTab === 'SIDE_EFFECTS' && (
            <div className="space-y-4 animate-slide-up">
              {sideEffects.map(effect => (
                <div key={effect.id} onClick={() => setSelectedSideEffect(effect.id === selectedSideEffect ? null : effect.id)} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-teal-200 transition-colors">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 dark:text-white">{effect.label}</h4>
                    <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${selectedSideEffect === effect.id ? 'rotate-180' : ''}`} />
                  </div>
                  {selectedSideEffect === effect.id && (
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{effect.guidance}</p>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                        <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-1">Igihe cyo guhamagara muganga</p>
                        <p className="text-xs text-red-700 dark:text-red-300 font-medium">{effect.alert}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMensHealth = () => {
    // Vitality Tab: Lifestyle & Daily Protocol
    const renderVitality = () => (
      <div className="space-y-8 animate-slide-up">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">Ubuzima Bwose</p>
                <h2 className="text-5xl font-extrabold tracking-tight">85<span className="text-2xl text-blue-300/50">/100</span></h2>
                <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-bold uppercase tracking-wide">Imiterere: Nziza cyane</span>
              </div>
              {/* Interactive Ring Mockup */}
              <div className="w-20 h-20 rounded-full border-[6px] border-blue-500/30 flex items-center justify-center relative">
                <svg className="absolute w-full h-full transform -rotate-90"><circle cx="36" cy="36" r="30" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-blue-500" strokeDasharray="188" strokeDashoffset="28" strokeLinecap="round" /></svg>
                <Icons.Activity className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Ibitotsi', val: '7.5h', score: 'bg-green-500', sub: 'Byiza' },
                { label: 'Stress', val: 'Hasi', score: 'bg-green-500', sub: 'Biragenzuwe' },
                { label: 'Imyitozo', val: '45m', score: 'bg-blue-500', sub: 'Urakora' }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors group/item">
                  <div className={`w-2 h-2 ${item.score} rounded-full mb-2`}></div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="font-bold text-lg leading-none mb-1">{item.val}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrient Optimization Section */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-bold text-gray-900 text-lg">Tegura Umubiri Wawe</h3>
            <span className="text-xs font-bold text-slate-500">Inkomoko Kamere</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Icons.Activity className="w-32 h-32 text-slate-900" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1 relative z-10">Zinc</h4>
              <p className="text-xs text-slate-500 mb-4 relative z-10">Ubudahangarwa & Testosterone</p>
              <div className="space-y-2 relative z-10">
                {[
                  { name: 'Pumpkin Seeds', icon: '🎃' },
                  { name: 'Oysters', icon: '🦪' },
                  { name: 'Spinach', icon: '🥗' }
                ].map((food, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                    <span className="text-sm">{food.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{food.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Icons.Activity className="w-32 h-32 text-slate-900" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1 relative z-10">Magnesium</h4>
              <p className="text-xs text-slate-500 mb-4 relative z-10">Gusubirana & Ibitotsi</p>
              <div className="space-y-2 relative z-10">
                {[
                  { name: 'Dark Chocolate', icon: '🍫' },
                  { name: 'Almonds', icon: '🌰' },
                  { name: 'Bananas', icon: '🍌' }
                ].map((food, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                    <span className="text-sm">{food.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{food.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Protocol Checklist */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Gahunda yo Kunoza</h3>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{mensChecklist.length}/4 Byarangiye</span>
          </div>
          <div className="space-y-3">
            {[
              { id: 'hydro', label: 'Hydration (3L)', desc: 'Supports kidney function & energy.', icon: <Icons.Drop className="w-4 h-4" /> },
              { id: 'mind', label: 'Decompression', desc: 'Cortisol management.', icon: <Icons.Leaf className="w-4 h-4" /> },
              { id: 'move', label: 'Movement', desc: 'Blood flow & prostate health.', icon: <Icons.Activity className="w-4 h-4" /> },
              { id: 'supps', label: 'Supplements', desc: 'Zinc, Vit D, Magnesium.', icon: <Icons.Shield className="w-4 h-4" /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleMensCheck(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${mensChecklist.includes(item.id) ? 'bg-slate-900 border-slate-900 shadow-md transform scale-[1.01]' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mensChecklist.includes(item.id) ? 'bg-white/10 text-white' : 'bg-white text-slate-500 shadow-sm'}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <span className={`font-bold block transition-colors ${mensChecklist.includes(item.id) ? 'text-white' : 'text-gray-900'}`}>{item.label}</span>
                    <span className={`text-xs font-medium transition-colors ${mensChecklist.includes(item.id) ? 'text-gray-400' : 'text-gray-500'}`}>{item.desc}</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${mensChecklist.includes(item.id) ? 'bg-green-500 border-green-500 scale-110' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                  {mensChecklist.includes(item.id) && <Icons.Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    const renderExams = () => (
      <div className="space-y-6 animate-slide-up">
        {/* Prostate Health Card */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-sm">
              <Icons.Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 text-lg">Ubuzima bwa Prostate</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">Ingenzi</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Prostate cancer is the second most common cancer in men. Early screening significantly improves outcomes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Ibimenyetso by'ingenzi</p>
              <ul className="text-xs text-slate-600 space-y-2 font-bold">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>Night Urination</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>Weak Flow</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>Discomfort</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">Gahunda yo gusuzumwa</p>
              <div className="mb-2">
                <p className="text-xs text-blue-900 font-bold">PSA Blood Test</p>
                <p className="text-[10px] text-blue-600">Yearly starting at age 50.</p>
              </div>
              <div>
                <p className="text-xs text-blue-900 font-bold">DRE Exam</p>
                <p className="text-[10px] text-blue-600">Per doctor recommendation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testicular Self-Exam Interactive Guide */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Kwisuzuma Amabya</h3>
              <p className="text-xs text-gray-400 font-medium">Buri kwezi • Iminota 3 • Mu mazi</p>
            </div>
            <div className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-full uppercase tracking-wide">Intambwe ku ntambwe</div>
          </div>

          <div className="relative">
            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-slate-900 transition-all duration-500 ease-out" style={{ width: `${((examStep + 1) / 3) * 100}%` }}></div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 min-h-[200px] flex flex-col justify-center relative overflow-hidden border border-gray-100">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Icons.Activity className="w-32 h-32 text-slate-900" />
              </div>
              {examStep === 0 && (
                <div className="animate-fade-in relative z-10">
                  <span className="text-slate-200 font-black text-6xl absolute -top-6 -left-4 select-none">01</span>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl relative z-10">Kwitegura</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium relative z-10">Best performed during or immediately after a warm shower. The heat relaxes the scrotum, making it easier to detect anything unusual. Check one testicle at a time.</p>
                </div>
              )}
              {examStep === 1 && (
                <div className="animate-fade-in relative z-10">
                  <span className="text-slate-200 font-black text-6xl absolute -top-6 -left-4 select-none">02</span>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl relative z-10">Isuzuma</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium relative z-10">Hold the testicle between your thumbs and fingers with both hands. Gently roll it between your fingers. Look and feel for any hard lumps or smooth rounded bumps.</p>
                </div>
              )}
              {examStep === 2 && (
                <div className="animate-fade-in relative z-10">
                  <span className="text-slate-200 font-black text-6xl absolute -top-6 -left-4 select-none">03</span>
                  <h4 className="font-bold text-gray-900 mb-3 text-xl relative z-10">Menya imiterere</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium relative z-10">Locate the epididymis, a soft, rope-like structure behind the testicle. This is normal. If you find any other lumps, changes in size, or feel pain, consult a urologist.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button disabled={examStep === 0} onClick={() => setExamStep(s => s - 1)} className="px-6 py-3 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Subira inyuma</button>
              <button disabled={examStep === 2} onClick={() => setExamStep(s => s + 1)} className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg shadow-slate-200">Komeza</button>
            </div>
          </div>
        </div>
      </div>
    );

    // Risks Tab: Interactive Accordion
    const renderRisks = () => (
      <div className="space-y-4 animate-slide-up">
        {[
          {
            id: 'prostate',
            title: 'Prostate Cancer',
            tag: 'Oncology',
            desc: 'Second most common cancer in men.',
            details: 'Early detection is critical. Risks include age (50+), race, and family history. Diets high in animal fat may increase risk.',
            action: 'Schedule PSA',
            color: 'bg-blue-100 text-blue-700'
          },
          {
            id: 'low-t',
            title: 'Low Testosterone',
            tag: 'Endocrine',
            desc: 'Impacts mood, energy, and muscle.',
            details: 'Symptoms: Fatigue, depression, reduced libido. Causes: Aging, obesity, stress. Managed via lifestyle changes or TRT.',
            action: 'Hormone Panel',
            color: 'bg-amber-100 text-amber-700'
          },
          {
            id: 'cvd',
            title: 'Cardiovascular',
            tag: 'Heart',
            desc: 'ED can be an early warning sign.',
            details: 'Erectile dysfunction often precedes heart disease by 3-5 years due to smaller artery size. Cardio exercise is essential.',
            action: 'Check BP',
            color: 'bg-red-100 text-red-700'
          },
          {
            id: 'mental',
            title: 'Ubuzima bwo mu mutwe',
            tag: 'Psychology',
            desc: 'Depression often manifests as anger.',
            details: 'Men are less likely to seek help. Symptoms include irritability, risk-taking, and isolation. Therapy builds resilience.',
            action: 'Find Therapist',
            color: 'bg-purple-100 text-purple-700'
          },
        ].map((risk) => (
          <div key={risk.id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <button
              onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${risk.color}`}>{risk.tag}</span>
                  <h4 className="font-bold text-gray-900 text-base">{risk.title}</h4>
                </div>
                <p className="text-xs text-gray-500 font-medium">{risk.desc}</p>
              </div>
              <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${expandedRisk === risk.id ? 'rotate-180 bg-slate-900 text-white' : 'text-gray-400'}`}>
                <Icons.ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {expandedRisk === risk.id && (
              <div className="px-5 pb-5 animate-fade-in">
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 font-medium">{risk.details}</p>
                  <button className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-slate-900 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                    <span>Action Step: {risk.action}</span>
                    <Icons.Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );

    return (
      <div className="animate-slide-in-right pb-24">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar px-1 py-1">
          {(['VITALITY', 'EXAM', 'RISKS'] as MensTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setMensTab(tab)}
              className={`px-6 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${mensTab === tab ? 'bg-slate-900 text-white shadow-slate-300 scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
            >
              {tab === 'VITALITY' && 'Vitality & Nutrition'}
              {tab === 'EXAM' && 'Screening Guide'}
              {tab === 'RISKS' && 'Risk Library'}
            </button>
          ))}
        </div>

        {mensTab === 'VITALITY' && renderVitality()}
        {mensTab === 'EXAM' && renderExams()}
        {mensTab === 'RISKS' && renderRisks()}

        {/* Actionable Toolkit Footer */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 px-1">Ibikoresho by'Ubufasha</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
            <button className="flex-shrink-0 w-36 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 group hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icons.Search className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-xs text-gray-900">Shaka Muganga</span>
                <span className="text-[10px] text-gray-400">Inzobere hafi</span>
              </div>
            </button>
            <button className="flex-shrink-0 w-36 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 group hover:border-green-200 transition-colors">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icons.Calendar className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-xs text-gray-900">Gahunda Isuzuma</span>
                <span className="text-[10px] text-gray-400">Isuzuma rya buri mwaka</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderWomensHealth = () => (
    <div className="animate-slide-in-right pb-44">
      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl mb-6 transition-colors border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 py-3">
          {(['CYCLE', 'INSIGHTS', 'LOG', 'RESOURCES'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setWomensTab(tab); if (tab !== 'RESOURCES') setWomensResource('NONE'); }}
              className={`px-6 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${womensTab === tab ? 'bg-slate-900 text-white shadow-slate-300 dark:shadow-slate-900/50 scale-105 border-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {tab === 'CYCLE' && 'Imihango & Kalendari'}
              {tab === 'INSIGHTS' && "Amakuru y'Umunsi"}
              {tab === 'LOG' && 'Ibimenyetso'}
              {tab === 'RESOURCES' && "Isomero ry'Ubuzima"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        {womensTab === 'CYCLE' && (
          <div className="space-y-6 animate-slide-up">
            {/* Wellness Quick Access */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { id: 'PREGNANCY', label: 'Baby', icon: <Icons.UserPlus className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
                { id: 'HORMONAL', label: 'PCOS', icon: <Icons.Sparkles className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
                { id: 'MENOPAUSE', label: 'Pause', icon: <Icons.Fire className="w-5 h-5" />, color: 'bg-rose-100 text-rose-600' },
                { id: 'PELVIC', label: 'Pelvic', icon: <Icons.Chip className="w-5 h-5" />, color: 'bg-teal-100 text-teal-600' },
              ].map(item => (
                <button key={item.id} onClick={() => navigateToResource(item.id as WomensResourceView)} className="flex flex-col items-center gap-2 group">
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-br from-rose-50 via-white to-rose-100 dark:from-rose-900/20 dark:via-slate-900 dark:to-rose-900/10 rounded-[2.5rem] p-8 text-center shadow-lg shadow-rose-100/50 dark:shadow-none relative overflow-hidden border border-rose-100/50 dark:border-rose-900/20">
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-rose-500 font-extrabold tracking-widest uppercase text-[10px] mb-6 bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm">Igihe cya Follicular</span>
                <div className="w-48 h-48 relative flex items-center justify-center mb-6">
                  <svg className="absolute w-full h-full transform -rotate-90"><circle cx="96" cy="96" r="88" stroke="#ffe4e6" strokeWidth="12" fill="transparent" className="dark:stroke-rose-900/20" />
                    <circle cx="96" cy="96" r="88" stroke="#f43f5e" strokeWidth="12" fill="transparent" strokeDasharray="552" strokeDashoffset="380" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="text-center">
                    <span className="block text-6xl font-black text-slate-900 dark:text-white leading-none">9</span>
                    <span className="text-sm text-slate-400 font-bold">Umunsi wa 28</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Imbaraga Ziyongera</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0">Urugero rwa Estrogen ruriyongera.</p>
              </div>
            </div>
          </div>
        )}

        {womensTab === 'RESOURCES' && (
          <div className="animate-slide-up">
            {womensResource !== 'NONE' && (
              <button onClick={() => setWomensResource('NONE')} className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-slate-800 w-fit">
                <Icons.Back className="w-4 h-4" />
                Subira mu Isomero
              </button>
            )}

            {womensResource === 'PREGNANCY' && (
              <div className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] p-6 border border-amber-100 dark:border-amber-900/30">
                  <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-300 mb-2">Gukurikirana Inda</h2>
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-6">Kurikirana imikurire y'umwana icyumweru ku kindi.</p>

                  <label className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider block mb-2">Itariki y'Ukwibaruka</label>
                  <input type="date" value={dueDate} onChange={(e) => handleDueDateChange(e.target.value)} className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100 font-bold outline-none focus:ring-2 focus:ring-amber-400" />
                </div>

                {pregnancyWeek !== null && (
                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Aho Ugeze</p>
                    <h3 className="text-6xl font-black text-slate-900 dark:text-white mb-2">{pregnancyWeek} <span className="text-xl text-slate-400 font-bold">Ibyumweru</span></h3>
                    <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full font-bold text-sm mb-8">
                      Umwana afite ingano ya {getBabySize(pregnancyWeek)}
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(pregnancyWeek / 40) * 100}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Ibiribwa Byiza by'Aho</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ name: 'Amaranth (Dodo)', ben: 'Folic Acid' }, { name: 'Millet', ben: 'Iron & Calcium' }, { name: 'Avocado', ben: 'Healthy Fats' }, { name: 'Sweet Potato', ben: 'Vitamin A' }, { name: 'Small Fish', ben: 'Calcium/Protein' }].map((food, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{food.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mt-1">{food.ben}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {womensResource === 'PELVIC' && (
              <div className="space-y-6">
                <KegelTimer />
              </div>
            )}

            {womensResource === 'NONE' && (
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'PREGNANCY', title: 'Inda & Uburumbuke', desc: 'Imirire, amabwiriza y\'amezi atatu ya mbere & umutekano.', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', icon: <Icons.UserPlus className="w-6 h-6" /> },
                  { id: 'HORMONAL', title: 'Imiterere y\'Hormoni', desc: 'PCOS, Endometriosis & gusuzuma ibimenyetso.', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', icon: <Icons.Sparkles className="w-6 h-6" /> },
                  { id: 'MENOPAUSE', title: 'Ubuvuzi bwa Menopause', desc: 'Gukurikirana ubushyuhe & ubuyobozi bwa HRT.', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400', icon: <Icons.Fire className="w-6 h-6" /> },
                  { id: 'PELVIC', title: 'Ubuzima bw\'Inda', desc: 'Imyitozo ya Kegel & gukira nyuma yo kubyara.', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400', icon: <Icons.Chip className="w-6 h-6" /> },
                ].map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setWomensResource(res.id as WomensResourceView)}
                    className="w-full bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-5 group active:scale-[0.98] transition-all"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${res.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      {res.icon}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{res.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{res.desc}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                      <Icons.ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderFamilyPlanning = () => {
    // ... (Existing Render Logic) ...
    // Keeping existing renderFamilyPlanning logic exactly as is for brevity in this response, 
    // but assuming it's part of the file as before.
    // Re-inserting the previous implementation here to ensure it's not lost.
    const journeyPhases = [
      {
        id: 'PREP',
        title: 'Gutegura',
        timeline: 'Amezi 3-6 mbere',
        color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        icon: <Icons.Sparkles className="w-6 h-6" />,
        description: 'Tekereza nkaho utegura ubutaka mbere yo gutera. Shira umwete ku guhindura imyitwarire no kubika intungamubiri.',
        tips: ['Tangira imiti yinda ifite 400mcg ya Folic Acid.', 'Gabanya ikawa kugira ngo wirinde kubabara umutwe nyuma.', 'Gena igihe cyo gusuzumwa mbere yo gusama.']
      },
      {
        id: 'TRACK',
        title: 'Gusobanukirwa',
        timeline: 'Amezi 1-3 mbere',
        color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        icon: <Icons.ChartBar className="w-6 h-6" />,
        description: 'Umubiri wawe uguha ibimenyetso buri kwezi. Ubu ni igihe cyo kwiga ururimi rwimihango yawe.',
        tips: ['Gusohora igi ntabwo buri gihe biba ku munsi wa 14. Kurikirana ubushyuhe bwumubiri.', 'Shakisha umwanda winkondo usa nubugi bwigi.', 'Gabanya stress; cortisol nyinshi ishobora gutinda gusohora igi.']
      },
      {
        id: 'TRY',
        title: 'Kugerageza',
        timeline: 'Igihe cyiza',
        color: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
        icon: <Icons.Heart className="w-6 h-6" />,
        description: 'Igikorwa nyamukuru. Tegura neza igihe utabuze urukundo.',
        tips: ['Intanga zumugabo zimara kugeza iminsi 5; amagi amara amasaha 12-24 gusa.', 'Gerageza guhuza ku minsi O-2 na O-1.', 'Bikorwe mu bishimishije—stress ibuza uburumbuke.']
      }
    ];

    const checklistCategories = [
      {
        name: 'Ubuvuzi', tasks: [
          { id: 'folic', label: 'Folic Acid ya buri munsi', desc: 'Irinda ibibazo byuruti rwumwana.' },
          { id: 'checkup', label: 'Gusura muganga', desc: 'Gusuzuma imiti ninkingo.' },
          { id: 'dentist', label: 'Gusukura amenyo', desc: 'Ubuzima bwamenyo bugira ingaruka ku nda.' }
        ]
      },
      {
        name: 'Imibereho', tasks: [
          { id: 'habits', label: 'Gabanya ikawa', desc: 'Munsi ya 200mg ku munsi (ikombe 1).' },
          { id: 'smoke', label: 'Reka kunywa itabi', desc: 'Ni ngombwa ku migi myiza.' },
          { id: 'sleep', label: 'Ibitotsi byiza', desc: 'Amasaha 7-8 kugira ngo hormone zitunganye.' }
        ]
      },
      {
        name: 'Amafaranga', tasks: [
          { id: 'insurance', label: 'Suzuma ubwishingizi', desc: 'Reba niba bufite ubuvuzi bwabagore batwite.' },
          { id: 'fund', label: 'Amafaranga yibihutirwa', desc: 'Tegura amafaranga yamezi 3.' }
        ]
      }
    ];

    const annualTotal = budgetItems.reduce((acc, item) => acc + (item.type === 'monthly' ? item.cost * 12 : item.cost), 0);
    const monthlyTotal = budgetItems.filter(item => item.type === 'monthly').reduce((acc, item) => acc + item.cost, 0);
    const oneTimeTotal = budgetItems.filter(item => item.type === 'one-time').reduce((acc, item) => acc + item.cost, 0);
    const typeLabels: Record<'monthly' | 'one-time', string> = {
      monthly: 'Buri kwezi',
      'one-time': 'Rimwe',
    };

    const handleNewBudgetChange = (field: keyof BudgetItem, value: string | number) => {
      setNewBudgetItem(prev => ({
        ...prev,
        [field]: field === 'cost' ? (Number.isNaN(Number(value)) ? 0 : Number(value)) : value,
      }));
    };

    const handleAddBudgetItem = () => {
      if (!newBudgetItem.name.trim()) return;
      const sanitized: BudgetItem = {
        name: newBudgetItem.name.trim(),
        category: newBudgetItem.category.trim() || 'Ibikoresho by’ingenzi',
        type: newBudgetItem.type,
        cost: Math.max(0, Math.floor(newBudgetItem.cost)),
      };
      setBudgetItems(prev => [...prev, sanitized]);
      setNewBudgetItem(initialBudgetItem);
    };

    const handleRemoveBudgetItem = (index: number) => {
      setBudgetItems(prev => prev.filter((_, i) => i !== index));
    };

    return (
      <div className="animate-slide-in-right pb-44">
        {/* Sticky Tabs */}
        <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl mb-6 transition-colors border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 py-3">
            {(['GUIDE', 'CHECKLIST', 'BUDGET'] as FamilyPlanningTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFamilyTab(tab)}
                className={`px-6 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm flex items-center gap-2 border ${familyTab === tab ? 'bg-slate-900 text-white shadow-slate-300 dark:shadow-slate-900/50 scale-105 border-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {tab === 'GUIDE' && <><Icons.UserPlus className="w-4 h-4" /> Inzira</>}
                {tab === 'CHECKLIST' && <><Icons.List className="w-4 h-4" /> Urutonde</>}
                {tab === 'BUDGET' && <><Icons.Calculator className="w-4 h-4" /> Ingengo</>}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6">
          {familyTab === 'GUIDE' && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inzira yo kuba umubyeyi</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hitamo icyiciro uri kuri cyo kugira ngo ubone inama.</p>
              </div>

              <div className="flex justify-between relative mb-8 px-2">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>

                {journeyPhases.map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => setFamilyPhase(phase.id)}
                    className={`flex flex-col items-center gap-2 transition-all duration-300 active:scale-95 ${familyPhase === phase.id ? 'scale-110' : 'opacity-60 grayscale'}`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 dark:border-slate-950 ${phase.color}`}>
                      {phase.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${familyPhase === phase.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{phase.title}</span>
                  </button>
                ))}
              </div>

              {/* Active Phase Content */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-scale-in transition-colors">
                {journeyPhases.map(phase => familyPhase === phase.id && (
                  <div key={phase.id}>
                    <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold ${phase.color}`}>
                      {phase.timeline}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Icyiciro cya {phase.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-8 font-medium">{phase.description}</p>

                    <div className="space-y-4">
                      {phase.tips.map((tip, i) => (
                        <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group hover:bg-white dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md">
                          <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white mt-1.5 shrink-0 group-hover:scale-125 transition-transform"></div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {familyTab === 'CHECKLIST' && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] p-8 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">Amanota yo Kwitegura</h2>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium mt-1">Rangiza ibikorwa kugira ngo uzamuke.</p>
                </div>
                <div className="w-16 h-16 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-indigo-200 dark:text-indigo-900" strokeWidth="6" fill="transparent" />
                    <circle cx="32" cy="32" r="28" stroke="#4f46e5" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * (checklist.length / 8))} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <span className="absolute text-sm font-bold text-indigo-900 dark:text-indigo-300">{Math.round((checklist.length / 8) * 100)}%</span>
                </div>
              </div>

              {checklistCategories.map((cat, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-3">
                    <span className={`w-1.5 h-6 rounded-full ${idx === 0 ? 'bg-teal-500' : idx === 1 ? 'bg-orange-500' : 'bg-purple-500'}`}></span>
                    {cat.name} Check
                  </h3>
                  <div className="space-y-3">
                    {cat.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          if (checklist.includes(task.id)) setChecklist(checklist.filter(i => i !== task.id));
                          else setChecklist([...checklist, task.id]);
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] group ${checklist.includes(task.id) ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'}`}
                      >
                        <div className="text-left">
                          <p className={`text-sm font-bold ${checklist.includes(task.id) ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{task.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{task.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checklist.includes(task.id) ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-700 group-hover:border-slate-400'}`}>
                          {checklist.includes(task.id) && <Icons.Check className="w-3.5 h-3.5 text-white dark:text-slate-900" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {familyTab === 'BUDGET' && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden transition-colors group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative z-10">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Igiciro cy'Umwaka wa 1</p>
                  <h2 className="text-5xl font-black mb-8 tracking-tight">
                    {formatRWF(annualTotal)}
                  </h2>
                  <div className="flex gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md flex-1 border border-white/5 hover:bg-white/15 transition-colors">
                      <p className="text-[10px] text-teal-300 uppercase font-bold mb-1">Buri kwezi</p>
                      <p className="font-bold text-xl">{formatRWF(monthlyTotal)}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md flex-1 border border-white/5 hover:bg-white/15 transition-colors">
                      <p className="text-[10px] text-orange-300 uppercase font-bold mb-1">Rimwe</p>
                      <p className="font-bold text-xl">{formatRWF(oneTimeTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Igikoresho cyo Kubara</h3>
                
                {/* Add new item form */}
                <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Ongeraho igikorwa gishya</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <input
                      type="text"
                      value={newBudgetItem.name}
                      onChange={(e) => setNewBudgetItem({...newBudgetItem, name: e.target.value})}
                      className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Izina ry'igikorwa"
                    />
                    <input
                      type="text"
                      value={newBudgetItem.category}
                      onChange={(e) => setNewBudgetItem({...newBudgetItem, category: e.target.value})}
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Icyiciro"
                    />
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={newBudgetItem.cost || ''}
                      onChange={(e) => setNewBudgetItem({...newBudgetItem, cost: Number(e.target.value) || 0})}
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Amafaranga (RWF)"
                    />
                    <select
                      value={newBudgetItem.type}
                      onChange={(e) => setNewBudgetItem({...newBudgetItem, type: e.target.value as BudgetItemType})}
                      className="col-span-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="monthly">Buri kwezi</option>
                      <option value="one-time">Rimwe</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (!newBudgetItem.name.trim()) return;
                      setBudgetItems([...budgetItems, {
                        name: newBudgetItem.name.trim(),
                        category: newBudgetItem.category.trim() || 'Ibindi',
                        cost: Math.max(0, newBudgetItem.cost),
                        type: newBudgetItem.type
                      }]);
                      setNewBudgetItem(initialBudgetItem);
                    }}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-teal-600 text-white hover:bg-teal-700 transition-colors active:scale-95"
                  >
                    + Ongeraho
                  </button>
                </div>

                <div className="space-y-6">
                  {budgetItems.map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{item.category} • {typeLabels[item.type]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-teal-600 dark:text-teal-400">{formatRWF(item.cost)}</p>
                          <button
                            onClick={() => setBudgetItems(budgetItems.filter((_, idx) => idx !== i))}
                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            title="Kuraho"
                          >
                            <Icons.Close className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.cost}
                        onChange={(e) => {
                          const newItems = [...budgetItems];
                          const nextValue = Number(e.target.value);
                          newItems[i].cost = Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue);
                          setBudgetItems(newItems);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Injiza amafaranga (RWF)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-4 bg-teal-600 text-white rounded-3xl font-bold text-sm shadow-xl shadow-teal-100 dark:shadow-teal-900/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <Icons.Calculator className="w-4 h-4" />
                Bika mu Ingengo
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto pb-44 no-scrollbar bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="pt-14 px-6 pb-6 bg-slate-50/95 dark:bg-slate-950/95 sticky top-0 z-20 shadow-sm flex items-center gap-2 transition-colors duration-300 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        {view !== 'DASHBOARD' && (
          <button onClick={() => setView('DASHBOARD')} className="p-3 -ml-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95">
            <Icons.Back className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {view === 'DASHBOARD' && 'Health'}
            {view === 'CONTRACEPTION_GUIDE' && 'Uburyo bwo kwirinda gusama'}
            {view === 'MENS_HEALTH_VIEW' && 'Men\'s Health'}
            {view === 'WOMENS_HEALTH' && 'Women\'s Wellness'}
            {view === 'ARTICLE_VIEW' && 'Family Planning'}
            {view === 'MENTAL_HEALTH_VIEW' && 'Ubuzima bwo mu mutwe'}
          </h1>
        </div>
      </div>

      {view === 'DASHBOARD' && (
        <div className="p-6 grid grid-cols-1 gap-8 animate-slide-up">
          {dashboardCards.filter(card => card.id !== 'mens' && card.id !== 'womens').map(card => (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={card.action}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.action?.();
                  }
                }}
                className="rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.08)] p-5 flex flex-col gap-4 transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9500] cursor-pointer"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    {card.subtitle}
                  </p>
                </div>

                <div className={`relative h-24 rounded-xl overflow-hidden ${card.imageBg || 'bg-slate-100 dark:bg-slate-800'}`}>
                  <img
                    src={card.image}
                    alt={card.imageAlt || card.title}
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      card.action?.();
                    }}
                    className="text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full text-white bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-white/10 shadow-sm hover:shadow-md transition-all"
                  >
                    {card.cta}
                  </button>
                </div>
              </div>
          ))}
        </div>
      )}

      {view === 'CONTRACEPTION_GUIDE' && renderContraceptionGuide()}
      {view === 'MENS_HEALTH_VIEW' && renderMensHealth()}
      {view === 'WOMENS_HEALTH' && renderWomensHealth()}
      {view === 'ARTICLE_VIEW' && renderFamilyPlanning()}
      {view === 'MENTAL_HEALTH_VIEW' && renderMentalHealth()}
    </div>
  );
};

export default SexualHealth;