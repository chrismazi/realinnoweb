import React, { useState } from 'react';
import { AuthState } from '../types';
import supabaseAuthService from '../services/supabaseAuth';
import { useTranslation } from '../hooks/useTranslation';

interface AuthProps {
  onLogin: (userData?: { name: string; email: string; id: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<AuthState>(AuthState.LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (view === AuthState.LOGIN) {
        // Sign in with Supabase
        const response = await supabaseAuthService.signIn({ email, password });

        if (!response.success) {
          setError(response.error || 'Invalid email or password. Please try again.');
          setIsLoading(false);
          return;
        }

        // Success! Store user data and log in
        if (response.data) {
          const { user, profile } = response.data;

          // Store in localStorage for compatibility with existing app
          localStorage.setItem('userId', user.id);
          localStorage.setItem('userEmail', user.email || '');
          localStorage.setItem('userName', profile.name);

          // Show success toast
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-50 animate-slide-up';
          toast.textContent = `Welcome back, ${profile.name}!`;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);

          // Call onLogin with user data
          onLogin({
            id: user.id,
            name: profile.name,
            email: user.email || ''
          });
        }

      } else if (view === AuthState.SIGNUP) {
        // Sign up with Supabase
        const response = await supabaseAuthService.signUp({ email, password, name });

        if (!response.success) {
          setError(response.error || 'Account creation failed. Please try again.');
          setIsLoading(false);
          return;
        }

        // Success! Show verification message or auto-login
        if (response.data) {
          const { user, profile } = response.data;

          // Check if email confirmation is required
          const requiresEmailConfirmation = !user.email_confirmed_at;

          if (requiresEmailConfirmation) {
            // Show email verification message
            setSuccessMessage(
              `Account created successfully! Please check ${email} for a verification link.`
            );
            setIsLoading(false);

            // Switch to login view after a delay
            setTimeout(() => {
              setView(AuthState.LOGIN);
              setSuccessMessage(null);
            }, 5000);
          } else {
            // Auto-login if no email confirmation needed
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userEmail', user.email || '');
            localStorage.setItem('userName', profile.name);

            // Show success toast
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-50 animate-slide-up';
            toast.textContent = `Welcome to WellVest, ${profile.name}!`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            onLogin({
              id: user.id,
              name: profile.name,
              email: user.email || ''
            });
          }
        }

      } else if (view === AuthState.FORGOT_PASSWORD) {
        // Send password reset email
        const response = await supabaseAuthService.resetPassword(email);

        if (!response.success) {
          setError(response.error || 'Failed to send reset email. Please try again.');
          setIsLoading(false);
          return;
        }

        // Show success notification
        setSuccessMessage(
          `Password reset link sent to ${email}. Please check your inbox (and spam folder).`
        );

        setTimeout(() => {
          setView(AuthState.LOGIN);
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    type: string,
    placeholder: string,
    icon: React.ReactNode,
    value: string,
    onChange: (value: string) => void
  ) => (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors duration-300">{icon}</div>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/60 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all placeholder-slate-400 dark:placeholder-slate-500 font-medium"
      />
    </div>
  );

  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center p-6 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Elegant Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"></div>

        {/* Animated Aurora Orbs - Updated to Orange/Brand */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/20 dark:bg-brand/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-[80px] animate-bounce-soft"></div>

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-sm bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-[2.5rem] p-8 relative z-10 animate-scale-in border border-white/60 dark:border-white/10">
        <div className="text-center mb-10">
          {/* Brand Logo */}
          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 dark:border-slate-700">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-brand">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" />
              <g transform="translate(50 50)">
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <path
                    key={i}
                    d="M0 -10 C 10 -25, 10 -35, 0 -40 C -10 -35, -10 -25, 0 -10 Z"
                    fill="currentColor"
                    transform={`rotate(${angle}) translate(0, 5)`}
                  />
                ))}
                <circle cx="0" cy="0" r="8" fill="currentColor" />
              </g>
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {view === AuthState.LOGIN && t('auth.welcomeBack')}
            {view === AuthState.SIGNUP && t('auth.join')}
            {view === AuthState.FORGOT_PASSWORD && t('auth.recovery')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium leading-relaxed">
            {view === AuthState.LOGIN && t('auth.subtitleLogin')}
            {view === AuthState.SIGNUP && t('auth.subtitleSignup')}
            {view === AuthState.FORGOT_PASSWORD && t('auth.subtitleRecovery')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 animate-shake">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4 animate-slide-up">
            <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleAuthAction} className="space-y-5">
          {view === AuthState.SIGNUP && renderInput('text', t('auth.name'), <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, name, setName)}
          {renderInput('email', t('auth.email'), <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, email, setEmail)}
          {view !== AuthState.FORGOT_PASSWORD && renderInput('password', t('auth.password'), <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, password, setPassword)}

          {view === AuthState.LOGIN && (
            <div className="flex justify-end"><button type="button" onClick={() => setView(AuthState.FORGOT_PASSWORD)} className="text-xs text-brand font-bold hover:text-orange-700 dark:hover:text-orange-300 transition-colors">{t('auth.forgotPassword')}</button></div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 dark:shadow-black/20 active:scale-[0.98] transition-all flex items-center justify-center hover:bg-slate-800 dark:hover:bg-slate-200">
            {isLoading ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <>{view === AuthState.LOGIN && t('auth.loginButton')}{view === AuthState.SIGNUP && t('auth.signupButton')}{view === AuthState.FORGOT_PASSWORD && t('auth.sendReset')}</>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {view === AuthState.LOGIN ? t('auth.noAccount') + " " : view === AuthState.SIGNUP ? t('auth.haveAccount') + " " : t('auth.remembered') + " "}
            <button onClick={() => setView(view === AuthState.LOGIN ? AuthState.SIGNUP : AuthState.LOGIN)} className="text-brand font-bold hover:underline transition-all ml-1">{view === AuthState.LOGIN ? t('auth.signupButton') : t('auth.loginButton')}</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
