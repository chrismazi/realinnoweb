
import React, { useState, useEffect, useRef } from 'react';
import useAppStore from '../store/useAppStore';
import exportService from '../services/exportService';
import { notificationService } from '../services/notificationService';

interface ProfileProps {
    onBack: () => void;
    onLogout: () => void;
}

type ModalType = 'NONE' | 'PERSONAL_INFO' | 'HELP' | 'PRIVACY';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatar: string;
}

const Profile: React.FC<ProfileProps> = ({ onBack, onLogout }) => {
    const { settings, updateSettings, toggleDarkMode: toggleTheme } = useAppStore();
    const { notifications, biometrics: faceId, darkMode } = settings;

    // Modal State
    const [activeModal, setActiveModal] = useState<ModalType>('NONE');

    // Profile Data State
    const [profile, setProfile] = useState<UserProfile>({
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
    });

    // Temp state for editing
    const [editForm, setEditForm] = useState<UserProfile>(profile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize Theme
    useEffect(() => {
        // Theme is handled by store now, but we can ensure class is present
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleToggleNotifications = async () => {
        if (!notifications) {
            const granted = await notificationService.requestPermission();
            if (granted) {
                updateSettings({ notifications: true });
            } else {
                // Could show a toast here
                console.warn('Notification permission denied');
            }
        } else {
            updateSettings({ notifications: false });
        }
    };

    const handleToggleFaceId = () => {
        updateSettings({ biometrics: !faceId });
    };

    const handleSaveProfile = () => {
        setProfile(editForm);
        setActiveModal('NONE');
    };

    const openEditModal = () => {
        setEditForm(profile);
        setActiveModal('PERSONAL_INFO');
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExportData = async () => {
        try {
            const state = useAppStore.getState();
            const data = {
                transactions: state.transactions,
                savingsGoals: state.savingsGoals,
                healthData: state.healthData,
                settings: state.settings
            };

            exportService.full.downloadJSON(data, 'wellvest_backup');

            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Data exported successfully!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } catch (error) {
            console.error('Export error:', error);
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'Export failed. Please try again.';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    };

    const handleExportTransactions = () => {
        const state = useAppStore.getState();
        exportService.transactions.download(state.transactions, 'wellvest_transactions');

        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
        toast.textContent = 'Transactions exported as CSV!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const menuItems = [
        {
            section: 'Account Settings', items: [
                { id: 'personal', label: 'Personal Information', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, action: openEditModal },
            ]
        },
        {
            section: 'App Preferences', items: [
                { id: 'notifications', label: 'Push Notifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, type: 'toggle', value: notifications, toggle: handleToggleNotifications },
                { id: 'faceid', label: 'Face ID Security', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.571-4.189" /></svg>, type: 'toggle', value: faceId, toggle: handleToggleFaceId },
                { id: 'darkmode', label: 'Dark Mode', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>, type: 'toggle', value: darkMode, toggle: toggleTheme },
            ]
        },
        {
            section: 'Data & Privacy', items: [
                { id: 'export', label: 'Export Transactions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, action: handleExportTransactions },
                { id: 'backup', label: 'Backup All Data', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>, action: handleExportData },
            ]
        },
        {
            section: 'Support & Legal', items: [
                { id: 'help', label: 'Help Center', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, action: () => setActiveModal('HELP') },
                { id: 'privacy', label: 'Privacy Policy', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, action: () => setActiveModal('PRIVACY') },
            ]
        },
    ];

    // --- Modals ---

    const renderPersonalInfoModal = () => (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-slide-up relative z-10 border-t border-white/10 overflow-hidden">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8"></div>

                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                    <button onClick={() => setActiveModal('NONE')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center mb-2">
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand to-purple-500">
                                <img src={editForm.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900" />
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="text-brand font-bold text-xs mt-3 hover:underline">Change Photo</button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Full Name</label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/50 border border-slate-200 dark:border-slate-800 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Email Address</label>
                        <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/50 border border-slate-200 dark:border-slate-800 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Phone Number</label>
                        <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-900 rounded-3xl py-4 px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/50 border border-slate-200 dark:border-slate-800 transition-all"
                        />
                    </div>
                </div>

                <button onClick={handleSaveProfile} className="w-full mt-10 py-4 bg-brand text-white rounded-3xl font-bold text-sm shadow-xl shadow-brand/20 active:scale-[0.98] transition-transform">
                    Save Changes
                </button>
            </div>
        </div>
    );

    const renderHelpModal = () => (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="bg-white dark:bg-slate-950 w-full max-w-lg h-[85vh] rounded-t-[2.5rem] shadow-2xl animate-slide-up relative z-10 border-t border-white/10 overflow-hidden flex flex-col">
                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-20">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Help Center</h3>
                        <button onClick={() => setActiveModal('NONE')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Icons.Close className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {[
                        { q: 'How is my data secured?', a: 'We use 256-bit encryption to protect your financial and personal health data. Your chat history is anonymized.' },
                        { q: 'Can I connect my bank account?', a: 'Currently, you can manually input transactions. Bank syncing is coming in v3.0.' },
                        { q: 'How does the cycle tracker work?', a: 'The tracker uses your input dates to predict phases. The more you log, the more accurate it becomes.' },
                        { q: 'Is the AI advice medical diagnosis?', a: 'No. "Vestie" is a supportive companion, not a doctor. Always consult a professional for medical needs.' }
                    ].map((faq, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{faq.q}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}

                    <div className="mt-8 p-6 bg-brand/10 rounded-[2rem] text-center">
                        <p className="font-bold text-brand mb-2">Still need help?</p>
                        <button className="px-6 py-3 bg-brand text-white rounded-xl text-xs font-bold shadow-lg shadow-brand/30">Contact Support</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPrivacyModal = () => (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="bg-white dark:bg-slate-950 w-full max-w-lg h-[85vh] rounded-t-[2.5rem] shadow-2xl animate-slide-up relative z-10 border-t border-white/10 overflow-hidden flex flex-col">
                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-20">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                        <button onClick={() => setActiveModal('NONE')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Icons.Close className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 no-scrollbar text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-6">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">1. Data Collection</h4>
                        <p>We collect information you provide directly to us, such as your name, email address, transaction history, and health logs. We do not sell this data.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">2. Use of Information</h4>
                        <p>We use your data to provide, maintain, and improve our services, including the AI chat features and financial analytics.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">3. Data Security</h4>
                        <p>We implement industry-standard security measures, including encryption and secure socket layers (SSL), to protect your personal information.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">4. User Rights</h4>
                        <p>You have the right to access, correct, or delete your personal data at any time through the app settings or by contacting support.</p>
                    </div>
                    <div className="pt-8 text-xs text-center text-slate-400">
                        Last Updated: October 2024
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Icons Helper ---
    const Icons = {
        Close: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    };

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-950 flex flex-col font-sans relative overflow-hidden transition-colors duration-500">
            {activeModal === 'PERSONAL_INFO' && renderPersonalInfoModal()}
            {activeModal === 'HELP' && renderHelpModal()}
            {activeModal === 'PRIVACY' && renderPrivacyModal()}

            {/* Immersive Header Background with New Orange Glow */}
            <div className="absolute top-0 w-full h-[340px] bg-[#0F172A] z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand rounded-full blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-900 rounded-full blur-[120px] opacity-30 transform -translate-x-1/2 translate-y-1/2"></div>

                {/* Decorative Mesh Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Curved Bottom */}
                <div className="absolute -bottom-1 left-0 right-0 h-16 bg-slate-50 dark:bg-slate-950 rounded-t-[3rem] z-10 transition-colors duration-500"></div>
            </div>

            {/* Navbar Area */}
            <div className="pt-14 px-6 pb-2 relative z-20 flex justify-between items-center text-white">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-lg font-bold tracking-wide">My Profile</h1>
                <button onClick={openEditModal} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 relative z-20 no-scrollbar">

                {/* User Info Card */}
                <div className="flex flex-col items-center mt-2 mb-8">
                    <div className="relative mb-5 group cursor-pointer" onClick={openEditModal}>
                        <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-brand via-orange-400 to-purple-500 shadow-2xl shadow-purple-500/20">
                            <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-[#0F172A] group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="absolute bottom-1 right-1 w-9 h-9 bg-slate-900 border-4 border-[#0F172A] rounded-full flex items-center justify-center text-brand shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">{profile.name}</h2>
                    <p className="text-slate-400 text-sm font-medium mb-5">{profile.email}</p>

                    {/* Animated Badge */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                        <span className="relative px-6 py-2 bg-slate-900 rounded-full text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-purple-200 border border-slate-700 shadow-xl flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                            Premium Member
                        </span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Streak', value: '12 Days', icon: '🔥', color: 'text-orange-600', gradient: 'from-orange-50 to-white dark:from-brand/20 dark:to-slate-800', border: 'border-orange-100 dark:border-brand/20' },
                        { label: 'Savings', value: '$7.4k', icon: '💎', color: 'text-teal-600', gradient: 'from-teal-50 to-white dark:from-teal-900/30 dark:to-slate-800', border: 'border-teal-100 dark:border-teal-500/20' },
                        { label: 'Score', value: '94', icon: '📈', color: 'text-purple-600', gradient: 'from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-800', border: 'border-purple-100 dark:border-purple-500/20' },
                    ].map((stat, i) => (
                        <div key={i} className={`rounded-[1.5rem] p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border ${stat.border} bg-gradient-to-b ${stat.gradient} flex flex-col items-center justify-center gap-2 group hover:-translate-y-1 transition-transform duration-300`}>
                            <div className="text-2xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                            <div className="text-center">
                                <span className="block text-lg font-black text-slate-800 dark:text-slate-100 leading-none mb-1">{stat.value}</span>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Profile Completion Bar */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-800 mb-8 relative overflow-hidden transition-colors">
                    <div className="flex justify-between items-center mb-2 relative z-10">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Profile Completion</span>
                        <span className="text-xs font-bold text-brand">85%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative z-10">
                        <div className="h-full bg-brand w-[85%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-[10px]">⚠️</div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Action: Verify your phone number +50 pts</span>
                    </div>
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>
                </div>

                {/* Menu List */}
                <div className="space-y-6">
                    {menuItems.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4 mb-3">{group.section}</h3>
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
                                {group.items.map((item: any, i) => (
                                    <div
                                        key={item.id}
                                        onClick={item.type === 'toggle' ? item.toggle : item.action}
                                        className={`flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${i !== group.items.length - 1 ? 'border-b border-gray-50 dark:border-slate-800' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-brand group-hover:text-white dark:group-hover:text-white transition-colors duration-300 shadow-sm">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                                        </div>
                                        {item.type === 'toggle' ? (
                                            <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${item.value ? 'bg-brand shadow-lg shadow-brand/30' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${item.value ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        ) : (
                                            <svg className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    className="w-full mt-8 p-4 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 transition-all flex items-center justify-center gap-2 mb-10 group shadow-sm active:scale-[0.98]"
                >
                    <div className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </div>
                    Log Out
                </button>

                <p className="text-center text-[10px] text-gray-400 dark:text-slate-600 font-bold tracking-widest uppercase mb-4 opacity-50">WellVest v2.4.0 • Built with ❤️</p>
            </div>
        </div>
    );
};

export default Profile;
