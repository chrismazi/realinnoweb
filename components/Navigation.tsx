
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { Tab } from '../types';

interface NavigationProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();
    const navItems = [
        {
            id: Tab.DASHBOARD, label: t('common.dashboard'), icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            )
        },
        {
            id: Tab.BUDGET, label: t('common.plan'), icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            )
        },
        {
            id: Tab.WELLNESS, label: t('common.chat'), icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            )
        },
        {
            id: Tab.HEALTH, label: t('common.health'), icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            )
        },
        {
            id: Tab.PROFILE, label: t('common.profile'), icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 18.75a7.5 7.5 0 0115 0" /></svg>
            )
        },
    ];

    return (
        <motion.div
            className="absolute bottom-8 left-0 w-full px-3 z-50 pointer-events-none"
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.15 }}
        >
            <motion.div
                className="relative pointer-events-auto mx-auto max-w-sm"
                whileHover={{ scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
                <div className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-br from-[#FF8A3D] via-[#FF6B3D] to-[#FFB347] shadow-[0_18px_50px_-24px_rgba(255,107,61,0.6)]" />
                <div className="absolute inset-0 rounded-[2.25rem] bg-white/18 backdrop-blur-xl border border-white/35" />
                <div className="relative flex items-center justify-between px-2.5 py-2.5 gap-1">
                    {navItems.map((item, index) => {
                        const isActive = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className="relative flex flex-col items-center justify-center w-12 h-12"
                                whileTap={{ scale: 0.92 }}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 420,
                                    damping: 30,
                                    delay: 0.25 + index * 0.05,
                                }}
                            >
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-active-pill"
                                            className="absolute inset-0 rounded-2xl bg-white/22 border border-white/40 shadow-[0_15px_30px_rgba(15,23,42,0.12)]"
                                            initial={{ opacity: 0, scale: 0.75 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.75 }}
                                            transition={{ type: 'spring', stiffness: 480, damping: 32 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    className={`relative z-10 flex items-center justify-center ${isActive ? 'text-white' : 'text-white/70'}`}
                                    animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.08 : 1 }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                                >
                                    {item.icon}
                                </motion.div>

                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-white"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 480, damping: 28 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.span
                                    className="absolute inset-0 rounded-2xl"
                                    whileTap={{ backgroundColor: 'rgba(255,255,255,0.2)', transition: { duration: 0.12 } }}
                                />
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Navigation;
