import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import useAppStore, { useChatHistory, useSettings, useChatSessions } from '../store/useAppStore';

// Rwanda emergency numbers (Kinyarwanda)
const RWANDA_EMERGENCY = {
    crisis: { name: 'Telefoni y\'ubuzima bwo mu mutwe', number: '114', desc: 'Ubuntu • 24/7' },
    emergency: { name: 'Polisi/Ihutirwa', number: '112' }
};

// Typing indicator animation variants
const TYPING_ANIMATIONS = [
    { type: 'dots', label: 'Ndatekereza...' },
    { type: 'wave', label: 'Ndandika...' },
    { type: 'pulse', label: 'Ndategura...' }
];

const BreathingExercise = ({ onClose }: { onClose: () => void }) => {
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

    useEffect(() => {
        // 4-2-4 Rhythm: Inhale 4s, Hold 2s, Exhale 4s (Total 10s cycle)
        const runCycle = () => {
            setPhase('Inhale');
            setTimeout(() => setPhase('Hold'), 4000);
            setTimeout(() => setPhase('Exhale'), 6000);
        };
        runCycle();
        const interval = setInterval(runCycle, 10000);
        return () => clearInterval(interval);
    }, []);

    const getText = () => {
        switch (phase) {
            case 'Inhale': return 'Humeka...';
            case 'Hold': return 'Komeza...';
            case 'Exhale': return 'Sohora...';
        }
    };

    return (
        <div className="absolute inset-0 z-[70] bg-[#020617] flex flex-col items-center justify-center animate-fade-in overflow-hidden font-sans">
            {/* Background Ambient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-b from-teal-900/20 to-slate-950 transition-opacity duration-1000 pointer-events-none`}></div>

            <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white p-2 transition-colors z-20 group">
                <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="relative z-10 flex flex-col items-center justify-center h-full pb-20">
                <h2 className={`text-2xl font-light text-white mb-16 tracking-[0.2em] uppercase transition-all duration-1000 ${phase === 'Hold' ? 'opacity-100 scale-105' : 'opacity-70 scale-100'}`}>
                    {getText()}
                </h2>

                <div className="relative flex items-center justify-center">
                    {/* Outer Ripple Ring */}
                    <div className={`absolute border border-teal-500/20 rounded-full transition-all duration-[4000ms] ease-in-out ${phase === 'Inhale' ? 'w-80 h-80 opacity-0' : phase === 'Hold' ? 'w-72 h-72 opacity-0' : 'w-32 h-32 opacity-0'}`}></div>
                    <div className={`absolute border border-teal-500/30 rounded-full transition-all duration-[4000ms] ease-in-out delay-75 ${phase === 'Inhale' ? 'w-72 h-72 opacity-100' : phase === 'Hold' ? 'w-72 h-72 opacity-50' : 'w-32 h-32 opacity-20'}`}></div>

                    {/* Middle Blur Aura */}
                    <div className={`absolute bg-teal-400 rounded-full mix-blend-screen filter blur-3xl transition-all duration-[4000ms] ease-in-out ${phase === 'Inhale' ? 'w-56 h-56 opacity-40' : phase === 'Hold' ? 'w-56 h-56 opacity-30' : 'w-20 h-20 opacity-10'}`}></div>

                    {/* Inner Core */}
                    <div className={`rounded-full bg-gradient-to-tr from-teal-200 to-white shadow-[0_0_50px_rgba(45,212,191,0.4)] transition-all duration-[4000ms] ease-in-out ${phase === 'Inhale' ? 'w-40 h-40 scale-100' : phase === 'Hold' ? 'w-40 h-40 scale-105' : 'w-40 h-40 scale-50'}`}></div>
                </div>

                <p className="text-teal-200/50 mt-20 text-xs font-medium tracking-[0.3em] uppercase animate-pulse">Huza guhumeka kwawe</p>
            </div>
        </div>
    )
}

const SOSModal = ({ onClose }: { onClose: () => void }) => (
    <div className="absolute inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-end justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-slide-up mb-24 relative overflow-hidden transition-colors border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ubufasha bw'Ihutirwa</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Nturi wenyine. Ubufasha burahari.</p>
                </div>
            </div>
            <div className="space-y-4">
                <a href="tel:114" className="flex items-center justify-between w-full p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-red-100 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group shadow-sm">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">{RWANDA_EMERGENCY.crisis.name}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{RWANDA_EMERGENCY.crisis.desc}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-red-700 dark:group-hover:text-red-400">{RWANDA_EMERGENCY.crisis.number}</span>
                </a>
                <a href="tel:112" className="flex items-center justify-between w-full p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{RWANDA_EMERGENCY.emergency.name}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-lg">{RWANDA_EMERGENCY.emergency.number}</span>
                </a>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-4">
                Numero z'ihutirwa mu Rwanda. Mu gihe cy'ihutirwa, hamagara serivisi z'aho uherereye.
            </p>
            <button onClick={onClose} className="mt-4 w-full py-4 text-slate-400 dark:text-slate-500 font-bold text-xs hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-900/50 rounded-2xl">Funga</button>
        </div>
    </div>
);

interface MentalHealthChatProps {
    onBack?: () => void;
}

const MentalHealthChat: React.FC<MentalHealthChatProps> = ({ onBack }) => {
    const messages = useChatHistory();
    const chatSessions = useChatSessions();
    const { addChatMessage, clearChatHistory, restoreChatSession, deleteChatSession } = useAppStore();
    const settings = useSettings();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showBreathing, setShowBreathing] = useState(false);
    const [showSOS, setShowSOS] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [typingAnimation, setTypingAnimation] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setTypingAnimation(prev => (prev + 1) % TYPING_ANIMATIONS.length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    const messagesWithDates = useMemo(() => {
        const result: { type: 'date' | 'message'; date?: string; message?: ChatMessage }[] = [];
        let lastDate = '';
        messages.forEach((msg) => {
            const msgDate = new Date(msg.timestamp).toDateString();

            if (msgDate !== lastDate) {
                result.push({ type: 'date', date: msgDate });
                lastDate = msgDate;
            }
            result.push({ type: 'message', message: msg });
        });
        return result;
    }, [messages]);

    const filteredSessions = useMemo(() => {
        const query = historySearch.trim().toLowerCase();
        if (!query) return chatSessions;
        return chatSessions.filter((session) =>
            session.title.toLowerCase().includes(query) ||
            session.messages.some((msg) => msg.text.toLowerCase().includes(query))
        );
    }, [chatSessions, historySearch]);

    const formatSessionMeta = (session: ChatSession) => {
        const updated = new Date(session.updatedAt);
        return `${updated.toLocaleDateString()} • ${session.messages.length} ubutumwa`;
    };

    const handleRestoreSession = async (sessionId: string) => {
        setRestoringId(sessionId);
        const success = await restoreChatSession(sessionId);
        setRestoringId(null);
        if (success) {
            setShowHistoryPanel(false);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
    };

    const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteChatSession(sessionId);
    };

    const formatDateSeparator = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'Uyu munsi';
        if (date.toDateString() === yesterday.toDateString()) return 'Ejo';
        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const handleClearChat = async () => {
        await clearChatHistory();
        setShowClearConfirm(false);
    };

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        const historyForAI = [...messages, userMsg];

        await addChatMessage(userMsg);
        setInput('');
        setIsLoading(true);

        try {
            let responseText: string;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    responseText = await sendMessageToGemini(historyForAI, userMsg.text);
                    if (responseText && responseText.trim().length > 0) {
                        const botMsg: ChatMessage = {
                            id: (Date.now() + 1).toString(),
                            role: 'model',
                            text: responseText,
                            timestamp: new Date()
                        };
                        await addChatMessage(botMsg);
                        setIsLoading(false);
                        return;
                    }

                    break;
                } catch (apiError: any) {
                    attempts++;
                    if (attempts >= maxAttempts) throw apiError;
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }
            throw new Error('Unable to get a valid response from AI');
        } catch (error: any) {
            let fallbackText = "Mfite ikibazo cyo guhuza ubu. ";
            if (error.message?.includes('API_KEY_INVALID')) {
                fallbackText += "Nyamuneka vugana n'abafasha cyangwa ugerageze nyuma.";
            } else {
                fallbackText += "Ushaka kugerageza guhumeka?";
            }
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: fallbackText,
                timestamp: new Date()
            };
            addChatMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleStartNewConversation = () => {
        if (messages.length === 0) return;
        setShowClearConfirm(true);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative font-sans text-slate-800 dark:text-slate-200 transition-colors duration-500 overflow-hidden">
            {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
            {showSOS && <SOSModal onClose={() => setShowSOS(false)} />}

            {showClearConfirm && (
                <div className="absolute inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowClearConfirm(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tangira ikiganiro gishya?</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Ibi bizasiba amateka y'ikiganiro cyawe.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs">Hagarika</button>
                            <button onClick={handleClearChat} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs">Tangira Bishya</button>
                        </div>
                    </div>
                </div>
            )}

            {showHistoryPanel && (
                <div className="absolute inset-0 z-[65] bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowHistoryPanel(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl animate-slide-up relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Ibiganiro byawe</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Ibiganiro Byarangiye</h3>
                            </div>
                            <button onClick={() => setShowHistoryPanel(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {chatSessions.length > 0 && (
                            <div className="mb-4">
                                <div className="relative">
                                    <input value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} placeholder="Shakisha mu mateka..." className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none" />
                                    <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
                                </div>
                            </div>
                        )}

                        {chatSessions.length === 0 ? (
                            <div className="text-center py-10 px-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Ntureba ibyahise kuko utarabika ikiganiro na Vestie.</p>
                                <p className="text-xs text-slate-400 mt-2">Tangira ikiganiro gishya, hanyuma usibe cyangwa utangire bundi bushya kugira ngo kibikwe hano.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {filteredSessions.length === 0 && (
                                    <p className="text-xs text-center text-slate-400 font-medium">Nta kiganiro gihuye n'ibyo washakishije.</p>
                                )}
                                {filteredSessions.map((session) => (
                                    <button key={session.id} onClick={() => handleRestoreSession(session.id)} className="w-full text-left bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-4 shadow-sm hover:border-teal-200 dark:hover:border-teal-700 transition-all group">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.title || 'Ikiganiro kidafite izina'}</p>
                                                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mt-1">{formatSessionMeta(session)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => handleDeleteSession(session.id, e)} className="p-2 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                                <div className="p-2 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300">
                                                    {restoringId === session.id ? (
                                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M8 12H4" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="pt-14 px-6 pb-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-30 sticky top-0 transition-colors duration-300">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <svg className="w-5 h-5 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                        )}
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">Vestie</h1>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Umufasha w'Ubuzima</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-full bg-white/85 dark:bg-slate-900/70 border border-white/50 dark:border-slate-800/60 shadow-[0_10px_26px_rgba(15,23,42,0.12)] backdrop-blur flex-nowrap min-w-max">
                            <button onClick={() => setShowClearConfirm(true)} className="h-10 px-3.5 rounded-full bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.22)] hover:shadow-[0_10px_26px_rgba(15,23,42,0.26)] transition-all flex items-center gap-1.5 active:scale-95 text-[10px] font-bold whitespace-nowrap">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Gishya
                            </button>

                            {messages.length > 0 && (
                                <button onClick={() => setShowClearConfirm(true)} className="h-10 px-3.5 rounded-full bg-white/95 dark:bg-slate-900/55 text-slate-500 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/50 shadow-[0_6px_16px_rgba(15,23,42,0.12)] hover:text-red-500 hover:border-red-200/80 dark:hover:border-red-500/50 transition-all flex items-center gap-1.5 active:scale-95 text-[10px] font-bold whitespace-nowrap">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Siba
                                </button>
                            )}

                            <button onClick={() => setShowHistoryPanel(true)} className="h-10 px-3.5 rounded-full bg-white/90 dark:bg-slate-900/60 text-slate-600 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60 shadow-[0_6px_18px_rgba(15,23,42,0.12)] hover:text-teal-600 hover:border-teal-200/80 dark:hover:border-teal-500/60 transition-all flex items-center gap-1.5 active:scale-95 text-[10px] font-bold whitespace-nowrap">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h10m-10 5h16" /></svg>
                                Ibyahise
                                {chatSessions.length > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[9px] font-black flex items-center justify-center">{chatSessions.length}
                                    </span>
                                )}
                            </button>

                            <button onClick={() => setShowBreathing(true)} className="h-10 px-3.5 rounded-full bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.22)] hover:shadow-[0_10px_26px_rgba(15,23,42,0.26)] transition-all flex items-center gap-1.5 active:scale-95 text-[10px] font-bold whitespace-nowrap">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                Humeka
                            </button>

                            <button onClick={() => setShowSOS(true)} className="h-10 px-3.5 rounded-full bg-gradient-to-br from-[#FF8A3D] via-[#FF6B3D] to-[#FFB347] text-white shadow-[0_14px_30px_rgba(255,107,61,0.38)] hover:shadow-[0_18px_36px_rgba(255,107,61,0.48)] transition-all flex items-center gap-1.5 active:scale-95 text-[10px] font-bold whitespace-nowrap">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                SOS
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-4 space-y-6 pb-56" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center animate-fade-in text-center px-4">
                        <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-500 dark:text-teal-400 mb-4 border border-teal-100 dark:border-teal-900/30">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Wiyumva ute?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-[280px] mb-5 leading-relaxed">
                            Aha ni ahantu hizewe kandi h'ibanga. Hitamo ingingo muziri hasi gato y'iyi nteruro cyangwa wandike icyo utekereza
                        </p>
                        <div className="grid grid-cols-2 gap-2 w-full max-w-[280px]">
                            {[
                                { label: 'Ubwoba', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>, prompt: "Mfite ubwoba" },
                                { label: 'Stress', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, prompt: "Mfite stress nyinshi" },
                                { label: 'Ibitotsi', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>, prompt: "Mfite ikibazo cyo gusinzira" },
                                { label: 'Kuvuga', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>, prompt: "Nshaka kuvuga ibyanjye" }
                            ].map((item) => (
                                <button key={item.label} onClick={() => handleSend(item.prompt)} className="p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-center hover:bg-white dark:hover:bg-slate-800 hover:border-teal-200 dark:hover:border-teal-800 transition-all active:scale-[0.97] group">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 mb-2 mx-auto transition-all">{item.icon}</div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messagesWithDates.map((item) => {
                    if (item.type === 'date') {
                        return (
                            <div key={`date-${item.date}`} className="flex items-center justify-center my-6">
                                <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        {formatDateSeparator(item.date!)}
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    const msg = item.message!;

                    const msgIndex = messages.findIndex(m => m.id === msg.id);
                    const isUser = msg.role === 'user';
                    const isSequence = msgIndex > 0 && messages[msgIndex - 1].role === msg.role;

                    return (
                        <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${!isSequence ? 'mt-6' : 'mt-2'} animate-slide-up`}>
                            {!isUser && !isSequence && (
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-500 self-end mb-1 mr-3 shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                </div>
                            )}
                            {!isUser && isSequence && <div className="w-[52px]"></div>}
                            <div className="flex flex-col max-w-[85%]">
                                <div className={`px-6 py-4 text-[14px] leading-relaxed shadow-sm ${isUser ? 'bg-slate-900 dark:bg-teal-600 text-white rounded-[2rem] rounded-br-md' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-[2rem] rounded-bl-md'}`}>{msg.text}</div>
                                {(!messages[msgIndex + 1] || messages[msgIndex + 1].role !== msg.role) && <p className={`text-[9px] text-slate-300 dark:text-slate-600 mt-2 px-2 font-bold uppercase tracking-wide ${isUser ? 'text-right' : 'text-left'}`}>{formatTime(msg.timestamp)}</p>}
                            </div>
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex justify-start mt-6 animate-fade-in ml-14">
                        <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-[2rem] rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="flex space-x-1.5">
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                {TYPING_ANIMATIONS[typingAnimation].label}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="absolute left-0 right-0 p-5 pb-9 bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent dark:from-slate-950 dark:via-slate-950/85 backdrop-blur-xl z-20" style={{ bottom: '5.5rem' }}>
                <div className="flex items-end max-w-2xl mx-auto">
                    <div className="relative flex-1">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            placeholder="Andika ubutumwa bwawe..."
                            className="w-full bg-white/95 dark:bg-slate-900/95 rounded-[1.6rem] px-5 py-4 pr-16 text-[13px] text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none max-h-32 shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-slate-200/60 dark:border-slate-700/60 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/50 transition"
                            rows={1}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className="absolute bottom-2 right-2 w-11 h-11 rounded-xl flex items-center justify-center bg-transparent text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/35 dark:focus-visible:ring-white/35"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MentalHealthChat;