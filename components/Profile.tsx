
import React, { useState, useEffect, useRef, useMemo } from 'react';
import useAppStore, { useUser, useTransactions, useSavingsGoals, useChatHistory, useHealthData } from '../store/useAppStore';
import { useTranslation } from '../hooks/useTranslation';
import exportService from '../services/exportService';
import { notificationService } from '../services/notificationService';
import supabaseAuthService from '../services/supabaseAuth';
import { supabase } from '../lib/supabase';

interface ProfileProps {
    onBack: () => void;
    onLogout: () => void;
}

type ModalType = 'NONE' | 'PERSONAL_INFO' | 'HELP' | 'PRIVACY' | 'TERMS' | 'SECURITY' | 'UPGRADE' | 'CONFIRM_LOGOUT';
type SecurityView = 'OVERVIEW' | 'EMAIL' | 'PASSWORD' | 'TWO_STEP' | 'LOGOUT';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatar: string;
}

// Premium tier logic
type PremiumTier = 'free' | 'basic' | 'premium' | 'pro';

interface PremiumStatus {
    tier: PremiumTier;
    label: string;
    color: string;
    gradient: string;
    features: string[];
}

const PREMIUM_TIERS: Record<PremiumTier, PremiumStatus> = {
    free: {
        tier: 'free',
        label: 'Free Plan',
        color: 'text-slate-400',
        gradient: 'from-slate-400 to-slate-500',
        features: ['Basic budgeting', '5 transactions/month', 'Limited chat']
    },
    basic: {
        tier: 'basic',
        label: 'Basic Member',
        color: 'text-blue-500',
        gradient: 'from-blue-400 to-blue-600',
        features: ['Unlimited transactions', 'Basic analytics', 'Email support']
    },
    premium: {
        tier: 'premium',
        label: 'Premium Member',
        color: 'text-brand',
        gradient: 'from-brand to-purple-600',
        features: ['All Basic features', 'AI Chat unlimited', 'Health tracking', 'Priority support']
    },
    pro: {
        tier: 'pro',
        label: 'Pro Member',
        color: 'text-purple-500',
        gradient: 'from-purple-500 to-pink-500',
        features: ['All Premium features', 'Family sharing', 'Custom reports', 'API access']
    }
};

const Profile: React.FC<ProfileProps> = ({ onBack, onLogout }) => {
    const { settings, updateSettings, toggleDarkMode: toggleTheme, setUser } = useAppStore();
    const { notifications, biometrics: faceId, darkMode } = settings;
    const { t, language } = useTranslation();

    // Get real data from store
    const user = useUser();
    const transactions = useTransactions();
    const savingsGoals = useSavingsGoals();
    const chatHistory = useChatHistory();
    const healthData = useHealthData();

    const handleToggleLanguage = () => {
        const newLang = language === 'en' ? 'rw' : 'en';
        updateSettings({ language: newLang });
    };

    // Modal State
    const [activeModal, setActiveModal] = useState<ModalType>('NONE');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Profile Data State - Initialize from store user data
    const [profile, setProfile] = useState<UserProfile>({
        name: user.name || 'User',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
    });

    // Update profile when user data changes
    useEffect(() => {
        setProfile({
            name: user.name || 'User',
            email: user.email || '',
            phone: user.phone || '',
            avatar: user.avatar || ''
        });
        setSecurityEmail(user.email || '');
    }, [user]);

    // Temp state for editing
    const [editForm, setEditForm] = useState<UserProfile>(profile);
    const [securityAutoLock, setSecurityAutoLock] = useState(true);
    const [securityTwoStep, setSecurityTwoStep] = useState(true);
    const [securityView, setSecurityView] = useState<SecurityView>('OVERVIEW');
    const [securityEmail, setSecurityEmail] = useState(user.email || '');
    const [securityPassword, setSecurityPassword] = useState({ current: '', new: '', confirm: '' });
    const [securityCode, setSecurityCode] = useState('');
    const [isLoggingOutEverywhere, setIsLoggingOutEverywhere] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (fullName: string) => {
        if (!fullName) return 'R';
        const parts = fullName.trim().split(' ').filter(Boolean);
        if (parts.length === 0) return 'R';
        if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'R';
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    };

    // Calculate real profile completion
    const profileCompletion = useMemo(() => {
        let score = 0;
        const items: { label: string; completed: boolean; points: number }[] = [];

        // Name (20 points)
        const hasName = profile.name && profile.name.length > 1 && profile.name !== 'User';
        items.push({ label: 'Add your name', completed: hasName, points: 20 });
        if (hasName) score += 20;

        // Email (20 points)
        const hasEmail = profile.email && profile.email.includes('@');
        items.push({ label: 'Verify email', completed: hasEmail, points: 20 });
        if (hasEmail) score += 20;

        // Phone (15 points)
        const hasPhone = profile.phone && profile.phone.length > 5;
        items.push({ label: 'Add phone number', completed: hasPhone, points: 15 });
        if (hasPhone) score += 15;

        // Avatar (15 points)
        const hasAvatar = profile.avatar && !profile.avatar.includes('unsplash');
        items.push({ label: 'Upload profile photo', completed: hasAvatar, points: 15 });
        if (hasAvatar) score += 15;

        // Has transactions (15 points)
        const hasTransactions = transactions.length > 0;
        items.push({ label: 'Add first transaction', completed: hasTransactions, points: 15 });
        if (hasTransactions) score += 15;

        // Has savings goal (15 points)
        const hasSavings = savingsGoals.length > 0;
        items.push({ label: 'Create savings goal', completed: hasSavings, points: 15 });
        if (hasSavings) score += 15;

        const nextAction = items.find(item => !item.completed);

        return { score, items, nextAction };
    }, [profile, transactions, savingsGoals]);

    // Calculate real stats
    const stats = useMemo(() => {
        // Streak: Days with consecutive activity (transactions or chat)
        const today = new Date();
        let streak = 0;
        const activityDates = new Set<string>();

        transactions.forEach(t => {
            const date = new Date(t.date).toDateString();
            activityDates.add(date);
        });

        chatHistory.forEach(m => {
            const date = new Date(m.timestamp).toDateString();
            activityDates.add(date);
        });

        // Count consecutive days from today backwards
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            if (activityDates.has(checkDate.toDateString())) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        // Total savings
        const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);

        // Financial health score (0-100)
        let healthScore = 50; // Base score

        // Bonus for having savings goals
        if (savingsGoals.length > 0) healthScore += 10;

        // Bonus for progress on goals
        const avgProgress = savingsGoals.length > 0
            ? savingsGoals.reduce((sum, g) => sum + (g.current / g.target), 0) / savingsGoals.length
            : 0;
        healthScore += Math.round(avgProgress * 20);

        // Bonus for regular tracking
        if (transactions.length > 10) healthScore += 10;
        if (transactions.length > 50) healthScore += 10;

        // Cap at 100
        healthScore = Math.min(100, healthScore);

        return {
            streak: streak || 0,
            savings: totalSavings,
            score: healthScore
        };
    }, [transactions, savingsGoals, chatHistory]);

    // Determine premium tier based on usage/settings
    const premiumStatus = useMemo((): PremiumStatus => {
        // In a real app, this would come from a subscription service
        // For now, determine based on activity level
        const hasHealthData = Object.keys(healthData.cycleData || {}).length > 0 ||
            Object.keys(healthData.mentalHealth || {}).length > 0;
        const hasSignificantActivity = transactions.length > 20 && savingsGoals.length > 2;

        if (hasSignificantActivity && hasHealthData) {
            return PREMIUM_TIERS.premium;
        } else if (transactions.length > 5 || savingsGoals.length > 0) {
            return PREMIUM_TIERS.basic;
        }
        return PREMIUM_TIERS.free;
    }, [transactions, savingsGoals, healthData]);

    // Initialize Theme
    useEffect(() => {
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

    const handleSaveProfile = async () => {
        if (!user.id) {
            showToast('Please log in to save changes', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // Update profile in Supabase
            const result = await supabaseAuthService.updateProfile(user.id, {
                name: editForm.name,
                phone: editForm.phone,
                avatar_url: editForm.avatar
            });

            if (result.success) {
                // Update local state
                setProfile(editForm);
                // Update store
                setUser({
                    name: editForm.name,
                    phone: editForm.phone,
                    avatar: editForm.avatar
                });
                showToast('Profile updated successfully!', 'success');
                setActiveModal('NONE');
            } else {
                showToast(result.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Save profile error:', error);
            showToast('Failed to save changes', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const openEditModal = () => {
        setEditForm(profile);
        setActiveModal('PERSONAL_INFO');
    };

    // Helper function for toast notifications
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        };
        const toast = document.createElement('div');
        toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be less than 5MB', 'error');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        setIsUploading(true);

        try {
            // If user is logged in, upload to Supabase Storage
            if (user.id) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    // Fall back to base64 if storage fails
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                    showToast('Using local storage for image', 'info');
                } else {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(filePath);

                    setEditForm(prev => ({ ...prev, avatar: publicUrl }));
                    showToast('Photo uploaded!', 'success');
                }
            } else {
                // Not logged in, use base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            console.error('Photo upload error:', error);
            // Fallback to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
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

            exportService.full.downloadJSON(data, 'realworks_backup');

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
        exportService.transactions.download(state.transactions, 'realworks_transactions');

        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
        toast.textContent = 'Transactions exported as CSV!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const openSecurityModal = () => {
        setSecurityView('OVERVIEW');
        setActiveModal('SECURITY');
    };

    const closeSecurityModal = () => {
        setActiveModal('NONE');
        setSecurityView('OVERVIEW');
        setSecurityPassword({ current: '', new: '', confirm: '' });
        setSecurityCode('');
        setIsLoggingOutEverywhere(false);
    };

    const menuItems = [
        {
            section: t('profile.account'), items: [
                { id: 'personal', label: t('auth.name'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, action: openEditModal },
            ]
        },
        {
            section: t('profile.preferences'), items: [
                { id: 'language', label: t('profile.language'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>, type: 'value', value: language === 'en' ? 'English' : 'Kinyarwanda', action: handleToggleLanguage },
                { id: 'notifications', label: t('profile.notifications'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, type: 'toggle', value: notifications, toggle: handleToggleNotifications },
                { id: 'faceid', label: 'Face ID Security', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.571-4.189" /></svg>, type: 'toggle', value: faceId, toggle: handleToggleFaceId },
                { id: 'darkmode', label: t('profile.darkMode'), icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>, type: 'toggle', value: darkMode, toggle: toggleTheme },
            ]
        },
        {
            section: 'Data & Privacy', items: [
                { id: 'security', label: 'Privacy & Security', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.571-4.189" /></svg>, action: openSecurityModal },
                { id: 'export', label: 'Export Transactions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, action: handleExportTransactions },
                { id: 'backup', label: 'Backup All Data', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>, action: handleExportData },
            ]
        },
        {
            section: 'Support & Legal', items: [
                { id: 'help', label: 'Help Center', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, action: () => setActiveModal('HELP') },
                { id: 'terms', label: 'Terms & Conditions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, action: () => setActiveModal('TERMS') },
                { id: 'privacy', label: 'Privacy Policy', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, action: () => setActiveModal('PRIVACY') },
            ]
        },
    ];

    // --- Modals ---

    const renderPersonalInfoModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Information</h3>
                    </div>
                    <button onClick={() => setActiveModal('NONE')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                        <Icons.Close className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <button
                        className="relative"
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                            {editForm.avatar ? (
                                <img src={editForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold text-slate-500 dark:text-white">{getInitials(editForm.name || profile.name)}</span>
                            )}
                        </div>
                        <span className="absolute -bottom-2 right-0 text-[10px] font-semibold text-brand bg-white rounded-full px-3 py-1 shadow">{isUploading ? 'Uploading...' : 'Change'}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                </div>

                <div className="space-y-4">
                    {[{ label: 'Full name', type: 'text', value: editForm.name, key: 'name' }, { label: 'Email', type: 'email', value: editForm.email, key: 'email' }, { label: 'Phone number', type: 'tel', value: editForm.phone, key: 'phone' }].map(field => (
                        <div key={field.key}>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{field.label}</label>
                            <input
                                type={field.type}
                                value={field.value}
                                onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3.5 px-5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/40 outline-none transition"
                            />
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || isUploading}
                    className={`w-full mt-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 ${isSaving || isUploading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                >
                    {isSaving ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save changes'}
                </button>
            </div>
        </div>
    );

    const renderLogoutConfirmModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Session</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Are you sure you want to log out?</h3>
                    </div>
                    <button onClick={() => setActiveModal('NONE')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                        <Icons.Close className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                    Logging out will end your current session on this device. You can always log back in with your email and password.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setActiveModal('NONE')}
                        className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 py-3 font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        Stay logged in
                    </button>
                    <button
                        onClick={() => {
                            setActiveModal('NONE');
                            onLogout();
                        }}
                        className="flex-1 rounded-2xl bg-red-500 text-white py-3 font-bold text-sm shadow-sm hover:bg-red-600 transition-colors"
                    >
                        Log me out
                    </button>
                </div>
            </div>
        </div>
    );

    const renderHelpModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Support</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Help Center</h3>
                    </div>
                    <button onClick={() => setActiveModal('NONE')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                        <Icons.Close className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
                    Browse common questions or chat with us anytime.
                </div>

                <div className="space-y-4 overflow-y-auto pr-1 no-scrollbar">
                    {[
                        { q: 'How is my data secured?', a: 'We use 256-bit encryption, secure storage, and anonymized chat logs. Only you control exports.' },
                        { q: 'Can I connect my bank account?', a: 'Manual entry is available today. Secure bank syncing is scheduled for RealWorks v3.0.' },
                        { q: 'How does the cycle tracker work?', a: 'Track your periods and symptoms; the predictions become smarter the more you log.' },
                        { q: 'Is Vestie giving medical advice?', a: 'Vestie offers supportive coaching, not diagnoses. Always consult licensed professionals for care.' }
                    ].map((faq, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}

                    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white/10 dark:text-white flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </span>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Need more help?</p>
                                <p className="text-base font-semibold text-slate-900 dark:text-white">Our team replies in under 24h.</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            Send us a quick note and we’ll reach out by email or chat as soon as possible.
                        </p>
                        <button className="w-full py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSecurityModal = () => {
        const renderOverview = () => (
            <div className="space-y-1">
                <div className="flex items-center justify-between px-1 py-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Auto-lock security</p>
                        <p className="text-xs text-slate-400">After 5 min of inactivity</p>
                    </div>
                    <button
                        onClick={() => setSecurityAutoLock(!securityAutoLock)}
                        className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${securityAutoLock ? 'bg-slate-900' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                        <span className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${securityAutoLock ? 'translate-x-5' : ''}`}></span>
                    </button>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />

                {[{
                    label: 'Change email address', value: securityEmail || 'Add email', view: 'EMAIL'
                }, {
                    label: 'Change password', value: '**********', view: 'PASSWORD'
                }, {
                    label: '2-step verification', value: securityTwoStep ? 'Status: On' : 'Status: Off', view: 'TWO_STEP'
                }, {
                    label: 'Log out of everywhere', value: 'End active sessions', view: 'LOGOUT'
                }].map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSecurityView(item.view as SecurityView)}
                        className="w-full flex items-center justify-between px-1 py-4 text-left active:bg-slate-50 dark:active:bg-slate-800/50 rounded-xl"
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.value}</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                ))}
            </div>
        );

        const renderEmailForm = () => (
            <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">We'll send a confirmation to your new email.</p>
                <div>
                    <label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1 block">New email</label>
                    <input
                        type="email"
                        value={securityEmail}
                        onChange={(e) => setSecurityEmail(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/40 outline-none"
                    />
                </div>
                <button
                    onClick={() => setSecurityView('OVERVIEW')}
                    className="w-full bg-slate-900 text-white rounded-2xl py-3 text-sm font-bold"
                >
                    Save email
                </button>
            </div>
        );

        const renderPasswordForm = () => (
            <div className="space-y-4">
                {['current', 'new', 'confirm'].map((field) => (
                    <div key={field}>
                        <label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1 block">{field === 'current' ? 'Current password' : field === 'new' ? 'New password' : 'Confirm password'}</label>
                        <input
                            type="password"
                            value={securityPassword[field as keyof typeof securityPassword]}
                            onChange={(e) => setSecurityPassword({ ...securityPassword, [field]: e.target.value })}
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/40 outline-none"
                        />
                    </div>
                ))}
                <button
                    onClick={() => { setSecurityPassword({ current: '', new: '', confirm: '' }); setSecurityView('OVERVIEW'); }}
                    className="w-full bg-slate-900 text-white rounded-2xl py-3 text-sm font-bold"
                >
                    Update password
                </button>
            </div>
        );

        const renderTwoStep = () => (
            <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter the 6-digit code from your authenticator app.</p>
                <input
                    type="text"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    maxLength={6}
                    className="w-full tracking-[0.5em] text-center text-lg font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3"
                />
                <button
                    onClick={() => { setSecurityTwoStep(!securityTwoStep); setSecurityCode(''); setSecurityView('OVERVIEW'); }}
                    className="w-full bg-slate-900 text-white rounded-2xl py-3 text-sm font-bold"
                >
                    {securityTwoStep ? 'Turn off 2-step verification' : 'Enable 2-step verification'}
                </button>
            </div>
        );

        const renderLogoutEverywhere = () => (
            <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">This logs you out of all devices except this one.</p>
                <button
                    onClick={() => { setIsLoggingOutEverywhere(true); setTimeout(() => { setIsLoggingOutEverywhere(false); setSecurityView('OVERVIEW'); }, 1500); }}
                    className={`w-full rounded-2xl py-3 text-sm font-bold ${isLoggingOutEverywhere ? 'bg-slate-200 text-slate-500 cursor-wait' : 'bg-red-500 text-white'}`}
                    disabled={isLoggingOutEverywhere}
                >
                    {isLoggingOutEverywhere ? 'Logging out...' : 'Log out of all sessions'}
                </button>
            </div>
        );

        const getTitle = () => {
            switch (securityView) {
                case 'EMAIL':
                    return 'Change Email';
                case 'PASSWORD':
                    return 'Change Password';
                case 'TWO_STEP':
                    return '2-step Verification';
                case 'LOGOUT':
                    return 'Log out Everywhere';
                default:
                    return 'Privacy & Security';
            }
        };

        const getSubtitle = () => {
            switch (securityView) {
                case 'EMAIL':
                    return 'Update the email associated with your account.';
                case 'PASSWORD':
                    return 'Use at least 8 characters with numbers or symbols.';
                case 'TWO_STEP':
                    return 'Add an extra layer of protection to your data.';
                case 'LOGOUT':
                    return 'Sign out from every device for safety.';
                default:
                    return 'Manage account safety settings and device access.';
            }
        };

        const renderContent = () => {
            switch (securityView) {
                case 'EMAIL':
                    return renderEmailForm();
                case 'PASSWORD':
                    return renderPasswordForm();
                case 'TWO_STEP':
                    return renderTwoStep();
                case 'LOGOUT':
                    return renderLogoutEverywhere();
                default:
                    return renderOverview();
            }
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={closeSecurityModal}></div>
                <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up flex flex-col max-h-[85vh]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Security</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{getTitle()}</h3>
                        </div>
                        <div className="flex gap-2">
                            {securityView !== 'OVERVIEW' && (
                                <button onClick={() => setSecurityView('OVERVIEW')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                            )}
                            <button onClick={closeSecurityModal} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                                <Icons.Close className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
                        {getSubtitle()}
                    </div>

                    <div className="overflow-y-auto no-scrollbar pr-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        );
    };

    const renderTermsModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Legal</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Terms & Conditions</h3>
                    </div>
                    <button onClick={() => setActiveModal('NONE')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                        <Icons.Close className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
                    Last updated on <span className="font-semibold text-slate-700 dark:text-slate-200">12 March 2025</span>
                </div>

                <div className="space-y-6 overflow-y-auto pr-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed no-scrollbar">
                    <section>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Eligibility</h4>
                        <ul className="list-decimal list-inside space-y-1">
                            <li>You are at least 18 years old or meet your country’s legal age.</li>
                            <li>You can enter a binding agreement with RealWorks.</li>
                            <li>You will use the app for lawful personal finance and wellness tracking.</li>
                        </ul>
                    </section>
                    <section>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Acceptable use</h4>
                        <p>Do not misuse the platform, attempt unauthorized access, or upload harmful content. We may suspend accounts that violate these rules.</p>
                    </section>
                    <section>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Subscriptions</h4>
                        <p>Paid tiers renew monthly and can be cancelled anytime inside the app. Fees are non-refundable for the current billing cycle.</p>
                    </section>
                    <section>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Contact</h4>
                        <p>Email legal@realworks.africa for questions regarding these terms.</p>
                    </section>
                </div>
            </div>
        </div>
    );

    const renderPrivacyModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Legal</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                    </div>
                    <button onClick={() => setActiveModal('NONE')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                        <Icons.Close className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
                    Last updated on <span className="font-semibold text-slate-700 dark:text-slate-200">06 March 2025</span>
                </div>

                <div className="space-y-6 overflow-y-auto pr-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed no-scrollbar">
                    <section>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">How we handle your data</h4>
                        <p>
                            We collect the details you provide (name, email, phone, health logs) to personalize RealWorks and power the AI companion. This data is encrypted in transit and at rest and is never sold to third parties.
                        </p>
                    </section>
                    <section>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Information we collect</h4>
                        <ul className="list-decimal list-inside space-y-1 text-sm">
                            <li>Personal details you share when creating an account.</li>
                            <li>Financial activity you enter or import for budgeting.</li>
                            <li>Wellness logs (cycle data, check-ins) you choose to store.</li>
                        </ul>
                    </section>
                    <section>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Your control</h4>
                        <p>
                            You can download, update, or delete your information at any time from the Account screen. Contact support@realworks.africa for additional privacy requests.
                        </p>
                    </section>
                    <section>
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Questions?</h4>
                        <p>Read the full policy at realworks.africa/privacy or chat with support for clarifications.</p>
                    </section>
                </div>
            </div>
        </div>
    );

    const renderUpgradeModal = () => (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveModal('NONE')}></div>
            <div className="bg-white dark:bg-slate-950 w-full max-w-lg h-[85vh] rounded-t-[2.5rem] shadow-2xl animate-slide-up relative z-10 border-t border-white/10 overflow-hidden flex flex-col">
                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-20">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6"></div>
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upgrade Plan</h3>
                        <button onClick={() => setActiveModal('NONE')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Icons.Close className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 no-scrollbar space-y-4">
                    <div className="text-center mb-6">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            You're currently on the <span className={`font-bold ${premiumStatus.color}`}>{premiumStatus.label}</span>
                        </p>
                    </div>

                    {Object.values(PREMIUM_TIERS).map((tier) => (
                        <div
                            key={tier.tier}
                            className={`p-5 rounded-2xl border-2 transition-all ${tier.tier === premiumStatus.tier
                                    ? 'border-brand bg-brand/5'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                                        {tier.label}
                                    </span>
                                    {tier.tier === premiumStatus.tier && (
                                        <span className="px-2 py-0.5 bg-brand/20 text-brand text-[10px] font-bold rounded-full">
                                            CURRENT
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    {tier.tier === 'free' ? 'Free' : tier.tier === 'basic' ? '$4.99/mo' : tier.tier === 'premium' ? '$9.99/mo' : '$19.99/mo'}
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            {tier.tier !== premiumStatus.tier && tier.tier !== 'free' && (
                                <button className={`w-full mt-4 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${tier.gradient} shadow-lg active:scale-[0.98] transition-transform`}>
                                    Upgrade to {tier.label}
                                </button>
                            )}
                        </div>
                    ))}

                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-6">
                        Subscriptions can be cancelled anytime. Prices may vary by region.
                    </p>
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
            {activeModal === 'SECURITY' && renderSecurityModal()}
            {activeModal === 'TERMS' && renderTermsModal()}
            {activeModal === 'PRIVACY' && renderPrivacyModal()}
            {activeModal === 'UPGRADE' && renderUpgradeModal()}
            {activeModal === 'CONFIRM_LOGOUT' && renderLogoutConfirmModal()}

            {/* Minimal background */}
            <div className="absolute inset-0 bg-white dark:bg-slate-950" aria-hidden="true"></div>

            {/* Navbar Area */}
            <div className="pt-14 px-6 pb-4 relative z-20 flex justify-between items-center text-slate-900 dark:text-white">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow border border-slate-200 text-slate-600 hover:text-slate-900 transition-all active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-lg font-bold tracking-wide">Profile</h1>
                <button onClick={openEditModal} className="w-10 h-10 rounded-full bg-white shadow border border-slate-200 text-slate-600 hover:text-slate-900 transition-all active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 relative z-20 no-scrollbar">

                {/* Compact User Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="relative group" onClick={openEditModal}>
                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-slate-600 dark:text-white">{getInitials(profile.name)}</span>
                                )}
                            </div>
                        </button>
                        <div>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Account</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{profile.email}</p>
                        </div>
                    </div>
                    <button onClick={openEditModal} className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                        See personal info
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Menu Sections */}
                <div className="space-y-8">
                    {menuItems.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{group.section}</h3>
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                                {group.items.map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={item.type === 'toggle' ? item.toggle : item.action}
                                        className="w-full flex items-center justify-between px-4 py-4 text-left active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                {item.icon}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                                                {item.type === 'value' && (
                                                    <p className="text-[11px] text-slate-400">{item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                        {item.type === 'toggle' ? (
                                            <div
                                                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${item.value ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${item.value ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                        ) : (
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => setActiveModal('CONFIRM_LOGOUT')}
                    className="w-full mt-8 p-4 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 transition-all flex items-center justify-center gap-2 mb-10 group shadow-sm active:scale-[0.98]"
                >
                    <div className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </div>
                    {t('profile.logout')}
                </button>

                <p className="text-center text-[10px] text-gray-400 dark:text-slate-600 font-bold tracking-widest uppercase mb-4 opacity-50">RealWorks v2.4.0 • Built with ❤️</p>
            </div>
        </div>
    );
};

export default Profile;
