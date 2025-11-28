/**
 * Women's Health Section Component
 * Cycle tracking, insights, and women's health resources
 */

import React, { useState, memo, useCallback, useMemo } from 'react';
import { HealthIcons } from './HealthIcons';
import KegelTimer from './KegelTimer';

type WomensTab = 'CYCLE' | 'INSIGHTS' | 'LOG' | 'RESOURCES';
type ResourceView = 'NONE' | 'PREGNANCY' | 'HORMONAL' | 'MENOPAUSE' | 'PELVIC';

interface CycleDay {
  date: Date;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  symptoms?: string[];
  flow?: 'light' | 'medium' | 'heavy';
  notes?: string;
}

interface WomensHealthSectionProps {
  onBack: () => void;
}

const WomensHealthSection: React.FC<WomensHealthSectionProps> = memo(({ onBack }) => {
  const [activeTab, setActiveTab] = useState<WomensTab>('CYCLE');
  const [resourceView, setResourceView] = useState<ResourceView>('NONE');
  const [cycleDay, setCycleDay] = useState(14);
  const [lastPeriod, setLastPeriod] = useState<Date>(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [flowLevel, setFlowLevel] = useState<'light' | 'medium' | 'heavy' | null>(null);
  const [notes, setNotes] = useState('');

  const cyclePhases = useMemo(() => {
    const phases = [
      { name: 'Menstrual', days: '1-5', color: 'bg-red-500', desc: 'Period phase' },
      { name: 'Follicular', days: '6-13', color: 'bg-pink-400', desc: 'Energy building' },
      { name: 'Ovulation', days: '14-16', color: 'bg-purple-500', desc: 'Peak fertility' },
      { name: 'Luteal', days: '17-28', color: 'bg-indigo-500', desc: 'Pre-period' },
    ];
    return phases;
  }, []);

  const currentPhase = useMemo(() => {
    if (cycleDay <= 5) return cyclePhases[0];
    if (cycleDay <= 13) return cyclePhases[1];
    if (cycleDay <= 16) return cyclePhases[2];
    return cyclePhases[3];
  }, [cycleDay, cyclePhases]);

  const symptoms = [
    { id: 'cramps', label: 'Cramps', emoji: '😣' },
    { id: 'bloating', label: 'Bloating', emoji: '🎈' },
    { id: 'headache', label: 'Headache', emoji: '🤕' },
    { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
    { id: 'mood', label: 'Mood Swings', emoji: '🎭' },
    { id: 'acne', label: 'Acne', emoji: '😤' },
    { id: 'cravings', label: 'Cravings', emoji: '🍫' },
    { id: 'breast', label: 'Breast Tenderness', emoji: '😖' },
  ];

  const resources = [
    { id: 'PREGNANCY', title: 'Pregnancy Planning', icon: '🤰', color: 'from-pink-500 to-rose-500' },
    { id: 'HORMONAL', title: 'Hormonal Health', icon: '⚖️', color: 'from-purple-500 to-indigo-500' },
    { id: 'MENOPAUSE', title: 'Menopause Guide', icon: '🌸', color: 'from-orange-400 to-pink-500' },
    { id: 'PELVIC', title: 'Pelvic Health', icon: '💪', color: 'from-teal-500 to-cyan-500' },
  ];

  const insights = useMemo(() => {
    const phase = currentPhase;
    const insightsByPhase: Record<string, { title: string; tips: string[] }> = {
      Menstrual: {
        title: 'Take it easy',
        tips: [
          'Rest more and practice self-care',
          'Stay hydrated and eat iron-rich foods',
          'Light exercise can help with cramps',
          'Use heat therapy for pain relief',
        ],
      },
      Follicular: {
        title: 'Energy is rising',
        tips: [
          'Great time to start new projects',
          'Your skin may be clearer now',
          'High-intensity workouts work well',
          'Social activities are energizing',
        ],
      },
      Ovulation: {
        title: 'Peak energy window',
        tips: [
          'Your fertility is at its highest',
          'Communication skills are enhanced',
          'Great time for important meetings',
          'You may feel more confident',
        ],
      },
      Luteal: {
        title: 'Wind down phase',
        tips: [
          'PMS symptoms may begin',
          'Focus on stress management',
          'Cravings are normal - balance them',
          'Prepare for your upcoming period',
        ],
      },
    };
    return insightsByPhase[phase.name] || insightsByPhase.Menstrual;
  }, [currentPhase]);

  const toggleSymptom = useCallback((symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  }, []);

  const handleLogEntry = useCallback(() => {
    // In a real app, this would save to the store
    console.log('Logging:', { cycleDay, symptoms: selectedSymptoms, flowLevel, notes });
    setSelectedSymptoms([]);
    setFlowLevel(null);
    setNotes('');
    // Show success feedback
  }, [cycleDay, selectedSymptoms, flowLevel, notes]);

  // Resource detail view
  if (resourceView !== 'NONE') {
    return (
      <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-slate-50 dark:bg-slate-950">
        <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl pt-14 pb-4 px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setResourceView('NONE')} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <HealthIcons.Back className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {resources.find(r => r.id === resourceView)?.title}
            </h1>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {resourceView === 'PELVIC' && <KegelTimer />}
          
          {resourceView === 'PREGNANCY' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Fertility Window</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Based on your cycle, your fertility window is typically days 12-16.
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: 7 }, (_, i) => i + 10).map(day => (
                    <div
                      key={day}
                      className={`flex-1 py-3 rounded-lg text-center text-sm font-bold ${
                        day >= 12 && day <= 16
                          ? 'bg-pink-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Pre-Conception Checklist</h3>
                {['Start prenatal vitamins', 'Schedule preconception checkup', 'Track your cycle regularly', 'Maintain healthy lifestyle'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-5 h-5 rounded-full border-2 border-pink-500" />
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resourceView === 'HORMONAL' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Understanding Your Hormones</h3>
                <p className="text-sm opacity-90">
                  Your cycle is driven by estrogen, progesterone, FSH, and LH. 
                  Each hormone plays a crucial role in your monthly cycle.
                </p>
              </div>
              
              {[
                { name: 'Estrogen', role: 'Builds uterine lining, peaks at ovulation', color: 'bg-pink-500' },
                { name: 'Progesterone', role: 'Maintains pregnancy, rises in luteal phase', color: 'bg-purple-500' },
                { name: 'FSH', role: 'Stimulates egg development', color: 'bg-blue-500' },
                { name: 'LH', role: 'Triggers ovulation', color: 'bg-indigo-500' },
              ].map((hormone, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <div className={`w-3 h-12 ${hormone.color} rounded-full`} />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{hormone.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{hormone.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resourceView === 'MENOPAUSE' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Navigating Menopause</h3>
                <p className="text-sm opacity-90">
                  Menopause is a natural transition. Understanding the stages can help you manage symptoms.
                </p>
              </div>
              
              {[
                { stage: 'Perimenopause', years: '4-8 years before', desc: 'Hormone fluctuations begin' },
                { stage: 'Menopause', years: '12 months no period', desc: 'Official transition point' },
                { stage: 'Postmenopause', years: 'After menopause', desc: 'New phase of life' },
              ].map((stage, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white">{stage.stage}</h4>
                  <p className="text-xs text-orange-500 font-medium">{stage.years}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{stage.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl pt-14 pb-4 px-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <HealthIcons.Back className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Women's Health</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(['CYCLE', 'INSIGHTS', 'LOG', 'RESOURCES'] as WomensTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-pink-500 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Cycle Tab */}
        {activeTab === 'CYCLE' && (
          <>
            {/* Current Phase Card */}
            <div className={`bg-gradient-to-r ${
              currentPhase.name === 'Menstrual' ? 'from-red-500 to-pink-500' :
              currentPhase.name === 'Follicular' ? 'from-pink-400 to-rose-400' :
              currentPhase.name === 'Ovulation' ? 'from-purple-500 to-pink-500' :
              'from-indigo-500 to-purple-500'
            } rounded-[2rem] p-6 text-white`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm opacity-80">Day {cycleDay} of 28</p>
                  <h2 className="text-2xl font-bold">{currentPhase.name} Phase</h2>
                </div>
                <div className="text-3xl">
                  {currentPhase.name === 'Menstrual' ? '🩸' :
                   currentPhase.name === 'Follicular' ? '🌱' :
                   currentPhase.name === 'Ovulation' ? '✨' : '🌙'}
                </div>
              </div>
              <p className="text-sm opacity-90">{currentPhase.desc}</p>
              
              {/* Cycle Progress */}
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(cycleDay / 28) * 100}%` }}
                />
              </div>
            </div>

            {/* Phase Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Cycle Phases</h3>
              <div className="space-y-3">
                {cyclePhases.map((phase, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                    <div className="flex-1">
                      <span className="font-medium text-slate-900 dark:text-white">{phase.name}</span>
                      <span className="text-slate-400 text-sm ml-2">Days {phase.days}</span>
                    </div>
                    {cycleDay >= parseInt(phase.days.split('-')[0]) && 
                     cycleDay <= parseInt(phase.days.split('-')[1] || phase.days.split('-')[0]) && (
                      <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-full font-bold">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Period */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <HealthIcons.Calendar className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Next period in</p>
                <p className="font-bold text-slate-900 dark:text-white">{28 - cycleDay} days</p>
              </div>
            </div>
          </>
        )}

        {/* Insights Tab */}
        {activeTab === 'INSIGHTS' && (
          <>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] p-6 text-white">
              <h2 className="text-xl font-bold mb-2">{insights.title}</h2>
              <p className="text-sm opacity-80">Tips for your {currentPhase.name.toLowerCase()} phase</p>
            </div>

            <div className="space-y-3">
              {insights.tips.map((tip, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <HealthIcons.Check className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Log Tab */}
        {activeTab === 'LOG' && (
          <>
            {/* Symptoms */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Log Symptoms</h3>
              <div className="grid grid-cols-4 gap-3">
                {symptoms.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-pink-100 dark:bg-pink-900/30 border-2 border-pink-500'
                        : 'bg-slate-50 dark:bg-slate-800 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-2xl mb-1">{symptom.emoji}</span>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{symptom.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flow Level */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Flow Level</h3>
              <div className="flex gap-3">
                {(['light', 'medium', 'heavy'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setFlowLevel(level)}
                    className={`flex-1 py-3 rounded-xl font-medium capitalize transition-all ${
                      flowLevel === level
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl resize-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleLogEntry}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold"
            >
              Save Today's Log
            </button>
          </>
        )}

        {/* Resources Tab */}
        {activeTab === 'RESOURCES' && (
          <div className="grid grid-cols-2 gap-4">
            {resources.map(resource => (
              <button
                key={resource.id}
                onClick={() => setResourceView(resource.id as ResourceView)}
                className={`bg-gradient-to-br ${resource.color} rounded-2xl p-5 text-white text-left`}
              >
                <span className="text-3xl mb-3 block">{resource.icon}</span>
                <h3 className="font-bold">{resource.title}</h3>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

WomensHealthSection.displayName = 'WomensHealthSection';

export default WomensHealthSection;
