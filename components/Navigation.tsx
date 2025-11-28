
import React from 'react';
import { Tab } from '../types';

interface NavigationProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        {
            id: Tab.DASHBOARD, label: 'Home', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            )
        },
        {
            id: Tab.BUDGET, label: 'Plan', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            )
        },
        {
            id: Tab.WELLNESS, label: 'Chat', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            )
        },
        {
            id: Tab.HEALTH, label: 'Health', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            )
        },
        {
            id: Tab.LEARN, label: 'Learn', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            )
        },
    ];

    return (
        <div className="absolute bottom-8 left-0 w-full px-6 z-50 pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] py-3 px-2 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] pointer-events-auto flex justify-between items-center border border-white/50 dark:border-white/5 transition-colors duration-500">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group"
                        >
                            {/* Active Pill Indicator - Updated to Brand Orange */}
                            {isActive && (
                                <span className="absolute inset-0 bg-gradient-to-tr from-brand/10 to-brand/5 dark:from-brand/20 dark:to-brand/5 rounded-2xl animate-scale-in"></span>
                            )}

                            {/* Icon */}
                            <div className={`relative z-10 transition-all duration-500 ${isActive ? 'text-brand -translate-y-1' : 'text-slate-400 dark:text-slate-500 group-active:scale-95'}`}>
                                {item.icon}
                            </div>

                            {/* Active Dot - Updated to Brand Orange */}
                            <div className={`absolute bottom-2 w-1 h-1 rounded-full bg-brand transition-all duration-500 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default Navigation;
