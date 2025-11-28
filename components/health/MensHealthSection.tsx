/**
 * Men's Health Section Component
 * Vitality tracking, health exams, and risk assessment
 */

import React, { useState, memo, useCallback } from 'react';
import { HealthIcons } from './HealthIcons';

type MensTab = 'VITALITY' | 'EXAM' | 'RISKS';

interface MensHealthSectionProps {
  onBack: () => void;
}

const MensHealthSection: React.FC<MensHealthSectionProps> = memo(({ onBack }) => {
  const [activeTab, setActiveTab] = useState<MensTab>('VITALITY');
  const [vitalityScore, setVitalityScore] = useState(72);
  
  // Health metrics
  const [metrics, setMetrics] = useState({
    sleep: 7,
    exercise: 4,
    stress: 3,
    nutrition: 6,
  });

  const vitalityFactors = [
    { id: 'sleep', label: 'Sleep Quality', value: metrics.sleep, max: 10, icon: '😴', color: 'from-indigo-500 to-purple-500' },
    { id: 'exercise', label: 'Exercise Frequency', value: metrics.exercise, max: 7, unit: 'days/week', icon: '💪', color: 'from-green-500 to-teal-500' },
    { id: 'stress', label: 'Stress Level', value: metrics.stress, max: 10, inverse: true, icon: '🧘', color: 'from-orange-500 to-red-500' },
    { id: 'nutrition', label: 'Nutrition Score', value: metrics.nutrition, max: 10, icon: '🥗', color: 'from-yellow-500 to-orange-500' },
  ];

  const examSchedule = [
    { name: 'Annual Physical', frequency: 'Yearly', lastDone: '6 months ago', nextDue: 'In 6 months', status: 'ok' },
    { name: 'Blood Pressure Check', frequency: 'Every 2 years', lastDone: '1 year ago', nextDue: 'In 1 year', status: 'ok' },
    { name: 'Cholesterol Screening', frequency: 'Every 4-6 years', lastDone: '3 years ago', nextDue: 'In 1-3 years', status: 'ok' },
    { name: 'Diabetes Screening', frequency: 'Every 3 years (40+)', lastDone: 'Never', nextDue: 'Schedule now', status: 'warning' },
    { name: 'Prostate Exam', frequency: 'Yearly (50+)', lastDone: 'N/A', nextDue: 'Age 50', status: 'pending' },
    { name: 'Colonoscopy', frequency: 'Every 10 years (45+)', lastDone: 'N/A', nextDue: 'Age 45', status: 'pending' },
  ];

  const riskFactors = [
    { 
      name: 'Heart Disease', 
      risk: 'Moderate',
      factors: ['Family history', 'Sedentary lifestyle'],
      preventions: ['Regular exercise', 'Heart-healthy diet', 'Regular checkups']
    },
    { 
      name: 'Diabetes', 
      risk: 'Low',
      factors: ['Slightly elevated BMI'],
      preventions: ['Maintain healthy weight', 'Limit sugar intake', 'Regular screening']
    },
    { 
      name: 'Prostate Cancer', 
      risk: 'Average',
      factors: ['Age', 'Male'],
      preventions: ['Regular PSA tests after 50', 'Healthy diet', 'Stay active']
    },
  ];

  const tips = [
    { title: 'Stay Active', desc: 'Aim for 150 minutes of moderate exercise per week', icon: '🏃' },
    { title: 'Sleep Well', desc: 'Get 7-9 hours of quality sleep each night', icon: '😴' },
    { title: 'Eat Smart', desc: 'Focus on lean proteins, vegetables, and whole grains', icon: '🥦' },
    { title: 'Manage Stress', desc: 'Practice mindfulness or relaxation techniques', icon: '🧘' },
    { title: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water daily', icon: '💧' },
    { title: 'Regular Checkups', desc: "Don't skip your annual physical exam", icon: '🩺' },
  ];

  const updateMetric = useCallback((id: string, value: number) => {
    setMetrics(prev => ({ ...prev, [id]: value }));
    // Recalculate vitality score
    const newScore = Math.round(
      (metrics.sleep / 10 * 25) +
      (metrics.exercise / 7 * 25) +
      ((10 - metrics.stress) / 10 * 25) +
      (metrics.nutrition / 10 * 25)
    );
    setVitalityScore(newScore);
  }, [metrics]);

  return (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl pt-14 pb-4 px-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
            <HealthIcons.Back className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Men's Health</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {(['VITALITY', 'EXAM', 'RISKS'] as MensTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Vitality Tab */}
        {activeTab === 'VITALITY' && (
          <>
            {/* Vitality Score */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm opacity-80">Your Vitality Score</p>
                  <h2 className="text-5xl font-bold">{vitalityScore}</h2>
                </div>
                <div className="text-4xl">💪</div>
              </div>
              <p className="text-sm opacity-80">
                {vitalityScore >= 80 ? 'Excellent! Keep up the great work!' :
                 vitalityScore >= 60 ? 'Good progress. Room for improvement.' :
                 'Focus on building healthier habits.'}
              </p>
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${vitalityScore}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Health Metrics</h3>
              {vitalityFactors.map(factor => (
                <div key={factor.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{factor.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white">{factor.label}</h4>
                      <p className="text-sm text-slate-500">
                        {factor.value}/{factor.max} {factor.unit || ''}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${factor.color}`}
                      style={{ width: `${(factor.value / factor.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Health Tips</h3>
              <div className="grid grid-cols-2 gap-3">
                {tips.slice(0, 4).map((tip, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <span className="text-2xl mb-2 block">{tip.icon}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tip.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Exam Tab */}
        {activeTab === 'EXAM' && (
          <>
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[2rem] p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Preventive Care</h2>
              <p className="text-sm opacity-90">
                Regular screenings can detect health issues early when they're most treatable.
              </p>
            </div>

            <div className="space-y-3">
              {examSchedule.map((exam, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{exam.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      exam.status === 'ok' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                      exam.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {exam.status === 'ok' ? 'Up to date' :
                       exam.status === 'warning' ? 'Schedule' : 'Future'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Frequency:</span>
                      <p className="text-slate-700 dark:text-slate-300">{exam.frequency}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Next due:</span>
                      <p className="text-slate-700 dark:text-slate-300">{exam.nextDue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-bold">
              Schedule Appointment
            </button>
          </>
        )}

        {/* Risks Tab */}
        {activeTab === 'RISKS' && (
          <>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-[2rem] p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Risk Assessment</h2>
              <p className="text-sm opacity-90">
                Understanding your risk factors helps you take preventive action.
              </p>
            </div>

            <div className="space-y-4">
              {riskFactors.map((risk, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 dark:text-white">{risk.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      risk.risk === 'Low' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                      risk.risk === 'Moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                      'bg-red-100 dark:bg-red-900/30 text-red-600'
                    }`}>
                      {risk.risk} Risk
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 font-medium mb-1">Contributing Factors:</p>
                    <div className="flex flex-wrap gap-2">
                      {risk.factors.map((factor, j) => (
                        <span key={j} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">Prevention:</p>
                    <ul className="space-y-1">
                      {risk.preventions.map((prevention, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <HealthIcons.Check className="w-4 h-4 text-green-500" />
                          {prevention}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> This is a general assessment. Consult your healthcare provider for personalized advice.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

MensHealthSection.displayName = 'MensHealthSection';

export default MensHealthSection;
