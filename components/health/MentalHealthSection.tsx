/**
 * Mental Health Section Component
 * Mood tracking, journaling, meditation, and mental health resources
 */

import React, { useState, useEffect, memo, useCallback } from 'react';
import { HealthIcons } from './HealthIcons';
import MentalHealthChat from '../MentalHealthChat';

type MentalTab = 'DASHBOARD' | 'JOURNAL' | 'LIBRARY' | 'TOOLS' | 'SUPPORT' | 'CHAT';

interface JournalEntry {
  id: number;
  date: Date;
  text: string;
  mood?: string;
  tags: string[];
}

interface MentalHealthSectionProps {
  onBack: () => void;
}

const MentalHealthSection: React.FC<MentalHealthSectionProps> = memo(({ onBack }) => {
  const [mentalTab, setMentalTab] = useState<MentalTab>('DASHBOARD');
  const [mood, setMood] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationTime, setMeditationTime] = useState(300); // 5 minutes
  const [moodHistory, setMoodHistory] = useState<{ date: Date; level: number }[]>([
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), level: 3 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), level: 4 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), level: 2 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), level: 4 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), level: 5 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), level: 3 },
    { date: new Date(), level: 4 },
  ]);

  // Meditation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (meditationActive && meditationTime > 0) {
      interval = setInterval(() => {
        setMeditationTime(t => t - 1);
      }, 1000);
    } else if (meditationTime === 0) {
      setMeditationActive(false);
      // Could play a sound here
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [meditationActive, meditationTime]);

  const handleSaveJournal = useCallback(() => {
    if (!journalEntry.trim()) return;
    
    const newEntry: JournalEntry = {
      id: Date.now(),
      date: new Date(),
      text: journalEntry,
      mood: mood || undefined,
      tags: [],
    };
    
    setJournalEntries(prev => [newEntry, ...prev]);
    setJournalEntry('');
    setMood(null);
  }, [journalEntry, mood]);

  const handleDeleteEntry = useCallback((id: number) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const moods = [
    { emoji: '😢', label: 'Low', level: 1 },
    { emoji: '😐', label: 'Okay', level: 2 },
    { emoji: '🙂', label: 'Good', level: 3 },
    { emoji: '😊', label: 'Great', level: 4 },
    { emoji: '🤩', label: 'Amazing', level: 5 },
  ];

  const resources = [
    { title: 'Managing Anxiety', duration: '5 min read', icon: '😌', category: 'Article' },
    { title: 'Sleep Better Tonight', duration: '8 min read', icon: '😴', category: 'Guide' },
    { title: 'Breathing Exercises', duration: '3 min', icon: '🧘', category: 'Exercise' },
    { title: 'Stress Management', duration: '10 min read', icon: '💆', category: 'Article' },
  ];

  const crisisResources = [
    { name: 'National Suicide Prevention Lifeline', number: '988', available: '24/7' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' },
  ];

  if (mentalTab === 'CHAT') {
    return <MentalHealthChat />;
  }

  return (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl pt-14 pb-4 px-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <HealthIcons.Back className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mental Wellness</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {(['DASHBOARD', 'JOURNAL', 'LIBRARY', 'TOOLS', 'SUPPORT', 'CHAT'] as MentalTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setMentalTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                mentalTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab === 'CHAT' ? '💬 Vestie' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Dashboard Tab */}
        {mentalTab === 'DASHBOARD' && (
          <>
            {/* Mood Check-in */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">How are you feeling?</h3>
              <div className="flex justify-between">
                {moods.map(item => (
                  <button
                    key={item.label}
                    onClick={() => setMood(item.label)}
                    className={`flex flex-col items-center gap-2 transition-transform active:scale-90 ${
                      mood === item.label ? 'scale-125' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <span className="text-4xl">{item.emoji}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      mood === item.label ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Insight */}
            {mood && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-[2rem] p-6 text-white animate-fade-in">
                <h3 className="font-bold mb-2">Tip for today:</h3>
                <p className="text-sm opacity-90">
                  {mood === 'Low' && "It's okay to not be okay. Try the meditation timer for 5 minutes of peace."}
                  {mood === 'Okay' && "Balance is key. A short walk might boost your serotonin."}
                  {mood === 'Good' && "Great! Keep this momentum. Maybe journal about what went well?"}
                  {mood === 'Great' && "Fantastic! Share your energy with a friend or tackle a big goal."}
                  {mood === 'Amazing' && "You're on fire! Document this feeling and what contributed to it."}
                </p>
              </div>
            )}

            {/* Mood Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Your Week</h3>
              <div className="flex items-end justify-between h-32 gap-2">
                {moodHistory.map((entry, i) => {
                  const height = (entry.level / 5) * 100;
                  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-500 to-indigo-400 rounded-lg transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] font-bold text-slate-400">
                        {days[entry.date.getDay()]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMentalTab('JOURNAL')}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-left hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                <HealthIcons.Pen className="w-8 h-8 text-purple-500 mb-2" />
                <h4 className="font-bold text-slate-900 dark:text-white">Journal</h4>
                <p className="text-xs text-slate-500">Write your thoughts</p>
              </button>
              
              <button
                onClick={() => setMentalTab('TOOLS')}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-left hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                <HealthIcons.Brain className="w-8 h-8 text-indigo-500 mb-2" />
                <h4 className="font-bold text-slate-900 dark:text-white">Meditate</h4>
                <p className="text-xs text-slate-500">Find your calm</p>
              </button>
            </div>
          </>
        )}

        {/* Journal Tab */}
        {mentalTab === 'JOURNAL' && (
          <>
            {/* New Entry */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">New Entry</h3>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl resize-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  {moods.slice(0, 4).map(m => (
                    <button
                      key={m.label}
                      onClick={() => setMood(m.label)}
                      className={`text-xl transition-transform ${mood === m.label ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSaveJournal}
                  disabled={!journalEntry.trim()}
                  className="px-6 py-2 bg-purple-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-purple-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Past Entries */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Past Entries</h3>
              {journalEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <HealthIcons.Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No journal entries yet</p>
                  <p className="text-sm">Start writing your thoughts above</p>
                </div>
              ) : (
                journalEntries.map(entry => (
                  <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{entry.mood ? moods.find(m => m.label === entry.mood)?.emoji : '📝'}</span>
                        <span className="text-xs text-slate-400">
                          {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <HealthIcons.Trash className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">{entry.text}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Library Tab */}
        {mentalTab === 'LIBRARY' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Resources</h3>
            {resources.map((resource, i) => (
              <button
                key={i}
                className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors text-left"
              >
                <span className="text-3xl">{resource.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{resource.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-500 font-medium">{resource.category}</span>
                    <span className="text-xs text-slate-400">• {resource.duration}</span>
                  </div>
                </div>
                <HealthIcons.ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        )}

        {/* Tools Tab */}
        {mentalTab === 'TOOLS' && (
          <div className="space-y-6">
            {/* Meditation Timer */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Meditation Timer</h3>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{formatTime(meditationTime)}</div>
                <p className="text-white/70">Focus on your breath</p>
              </div>
              
              {/* Duration Presets */}
              {!meditationActive && (
                <div className="flex justify-center gap-2 mb-4">
                  {[60, 180, 300, 600].map(sec => (
                    <button
                      key={sec}
                      onClick={() => setMeditationTime(sec)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        meditationTime === sec ? 'bg-white text-purple-600' : 'bg-white/20'
                      }`}
                    >
                      {sec / 60}m
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setMeditationActive(!meditationActive)}
                  className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-bold"
                >
                  {meditationActive ? (
                    <>
                      <HealthIcons.Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <HealthIcons.Play className="w-5 h-5" />
                      Start
                    </>
                  )}
                </button>
                {meditationTime < 300 && (
                  <button
                    onClick={() => { setMeditationTime(300); setMeditationActive(false); }}
                    className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-xl font-bold"
                  >
                    <HealthIcons.Refresh className="w-5 h-5" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Breathing Exercise */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">4-7-8 Breathing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                A calming technique: Breathe in for 4 seconds, hold for 7, exhale for 8.
              </p>
              <button className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-bold">
                Start Exercise
              </button>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {mentalTab === 'SUPPORT' && (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-[2rem] p-6 border border-red-200 dark:border-red-800">
              <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">Crisis Resources</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                If you're in crisis, please reach out for help immediately.
              </p>
              
              <div className="space-y-3">
                {crisisResources.map((resource, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{resource.name}</h4>
                    <a 
                      href={`tel:${resource.number.replace(/\D/g, '')}`}
                      className="text-red-600 dark:text-red-400 font-bold"
                    >
                      {resource.number}
                    </a>
                    <span className="text-xs text-slate-400 ml-2">{resource.available}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Talk to Vestie */}
            <button
              onClick={() => setMentalTab('CHAT')}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-[2rem] p-6 text-white text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  💬
                </div>
                <div>
                  <h3 className="font-bold text-lg">Talk to Vestie</h3>
                  <p className="text-sm opacity-80">Your AI wellness companion</p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

MentalHealthSection.displayName = 'MentalHealthSection';

export default MentalHealthSection;
