import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import useAppStore, { useChatHistory } from '../store/useAppStore';

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
            case 'Inhale': return 'Breathe In...';
            case 'Hold': return 'Hold...';
            case 'Exhale': return 'Breathe Out...';
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
                <h2 className={`text-3xl font-light text-white mb-16 tracking-[0.2em] uppercase transition-all duration-1000 ${phase === 'Hold' ? 'opacity-100 scale-105' : 'opacity-70 scale-100'}`}>
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

                <p className="text-teal-200/50 mt-20 text-xs font-medium tracking-[0.3em] uppercase animate-pulse">Sync your breathing</p>
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crisis Support</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">You are not alone. Help is available.</p>
                </div>
            </div>
            <div className="space-y-4">
                <a href="tel:988" className="flex items-center justify-between w-full p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-red-100 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group shadow-sm">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">Suicide & Crisis Lifeline</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Confidential • 24/7</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-xl group-hover:text-red-700 dark:group-hover:text-red-400">988</span>
                </a>
                <a href="tel:911" className="flex items-center justify-between w-full p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Emergency Services</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xl">911</span>
                </a>
            </div>
            <button onClick={onClose} className="mt-8 w-full py-4 text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-900/50 rounded-2xl">Dismiss</button>
        </div>
    </div>
);

interface MentalHealthChatProps {
    onBack?: () => void;
}

const MentalHealthChat: React.FC<MentalHealthChatProps> = ({ onBack }) => {
    const messages = useChatHistory();
    const { addChatMessage } = useAppStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showBreathing, setShowBreathing] = useState(false);
    const [showSOS, setShowSOS] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        addChatMessage(userMsg);
        setInput('');
        setIsLoading(true);

        try {
            // Use current messages for history
            // 'messages' here is from the render scope, so it doesn't have userMsg yet.
            // But sendMessageToGemini takes (history, newMessage), so this is correct.
            const history = messages;

            // Try to get AI response with retries
            let responseText: string;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    responseText = await sendMessageToGemini(history, userMsg.text);

                    // Check if response is valid
                    if (responseText && responseText.trim().length > 0) {
                        const botMsg: ChatMessage = {
                            id: (Date.now() + 1).toString(),
                            role: 'model',
                            text: responseText,
                            timestamp: new Date()
                        };
                        addChatMessage(botMsg);
                        setIsLoading(false);
                        return;
                    }
                    break;
                } catch (apiError: any) {
                    attempts++;
                    console.warn(`AI API attempt ${attempts} failed:`, apiError);

                    if (attempts >= maxAttempts) {
                        throw apiError;
                    }

                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }

            // If we get here, all attempts failed or empty response
            throw new Error('Unable to get a valid response from AI');

        } catch (error: any) {
            console.error('Chat error:', error);

            // Provide helpful fallback response based on error type
            let fallbackText = "I'm having trouble connecting right now. ";

            if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
                fallbackText += "It seems there's a configuration issue. Please contact support or try again later.";
            } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
                fallbackText += "We've reached our daily limit. Please try again tomorrow or contact support.";
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                fallbackText += "Please check your internet connection and try again.";
            } else {
                fallbackText += "Sometimes taking a deep breath helps. Would you like to try the breathing exercise?";
            }

            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: fallbackText,
                timestamp: new Date()
            };

            addChatMessage(errorMsg);

            // Show error toast
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-slide-up';
            toast.textContent = 'AI temporarily unavailable. Showing fallback response.';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);

        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative font-sans text-slate-800 dark:text-slate-200 transition-colors duration-500">
            {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
            {showSOS && <SOSModal onClose={() => setShowSOS(false)} />}

            {/* Professional Header */}
            <div className="pt-14 px-6 pb-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-30 sticky top-0 flex justify-between items-end transition-colors duration-300">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <svg className="w-5 h-5 text-slate-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Vestie</h1>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Wellness Companion</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowBreathing(true)} className="px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-2 active:scale-95 border border-teal-100 dark:border-teal-900/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Breathe
                    </button>
                    <button onClick={() => setShowSOS(true)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2 group active:scale-95 border border-slate-200 dark:border-slate-700">
                        <svg className="w-4 h-4 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Support
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 no-scrollbar space-y-6 pb-48" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center pt-10">
                        <div className="w-24 h-24 bg-gradient-to-tr from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-300 dark:text-slate-600 mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">How are you feeling?</h2>
                        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mb-10 leading-relaxed mx-auto">
                            This is a safe, private space. Select a topic below or type whatever is on your mind.
                        </p>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
                            {[
                                { label: 'Anxiety', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>, prompt: "I'm feeling anxious" },
                                { label: 'Stress', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, prompt: "I'm really stressed out" },
                                { label: 'Sleep', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>, prompt: "I'm having trouble sleeping" },
                                { label: 'Vent', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>, prompt: "I just need to vent" }
                            ].map((item) => (
                                <button key={item.label} onClick={() => handleSend(item.prompt)} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-left shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-teal-100 dark:hover:border-teal-900/50 transition-all active:scale-[0.98] group">
                                    <div className="text-slate-400 dark:text-slate-600 group-hover:text-teal-500 dark:group-hover:text-teal-400 mb-3 transition-colors">{item.icon}</div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    const isSequence = index > 0 && messages[index - 1].role === msg.role;
                    return (
                        <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${!isSequence ? 'mt-6' : 'mt-2'} animate-slide-up`}>
                            {!isUser && !isSequence && (
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-500 self-end mb-1 mr-3 shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                </div>
                            )}
                            {!isUser && isSequence && <div className="w-[52px]"></div>}
                            <div className="flex flex-col max-w-[85%]">
                                <div className={`px-6 py-4 text-[15px] leading-relaxed shadow-sm ${isUser ? `bg-slate-900 dark:bg-teal-600 text-white ${isSequence ? 'rounded-[2rem] rounded-tr-md' : 'rounded-[2rem] rounded-br-md'}` : `bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 ${isSequence ? 'rounded-[2rem] rounded-tl-md' : 'rounded-[2rem] rounded-bl-md'}`}`}>{msg.text}</div>
                                {(!messages[index + 1] || messages[index + 1].role !== msg.role) && <p className={`text-[10px] text-slate-300 dark:text-slate-600 mt-2 px-2 font-bold uppercase tracking-wide ${isUser ? 'text-right' : 'text-left'}`}>{formatTime(msg.timestamp)}</p>}
                            </div>
                        </div>
                    );
                })}
                {isLoading && (
                    <div className="flex justify-start mt-6 animate-fade-in ml-14">
                        <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-[2rem] rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-800 flex space-x-2 items-center">
                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                            <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-6" />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-32 left-0 w-full px-6 z-40 pointer-events-none">
                <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-end gap-2 max-w-2xl mx-auto transition-colors duration-300">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] px-6 py-2 border border-transparent focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-slate-200 dark:focus-within:border-slate-700 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-900/20 transition-all">
                        <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Type your message..." rows={1} className="w-full bg-transparent py-3 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base resize-none max-h-32" style={{ minHeight: '48px' }} />
                    </div>
                    <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className={`p-4 rounded-full mb-1 transition-all duration-300 shrink-0 ${!input.trim() ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600' : 'bg-slate-900 dark:bg-teal-600 text-white shadow-lg shadow-slate-200 dark:shadow-teal-900/40 active:scale-90 hover:scale-105'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MentalHealthChat;