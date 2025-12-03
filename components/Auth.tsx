import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthState } from '../types';
import supabaseAuthService from '../services/supabaseAuth';
import { useTranslation } from '../hooks/useTranslation';
import { getLegalDocument } from '../utils/legalContent';
import type { LegalDocumentType } from '../utils/legalContent';
import Logo from './Logo.png';

interface AuthProps {
  onLogin: (userData?: { name: string; email: string; id: string }) => void;
}

// Password strength calculator
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-green-500' };
  return { score, label: 'Very Strong', color: 'bg-emerald-500' };
};

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

const messageVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

const formVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: 'easeIn' } }
};

const footerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.3 } }
};

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { t, language } = useTranslation();
  const [view, setView] = useState<AuthState>(AuthState.LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalDocumentType | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password strength for signup
  const passwordStrength = calculatePasswordStrength(password);

  // Auto-dismiss error messages after 6 seconds (longer than default 3s)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
        // Validate terms acceptance
        if (!acceptedTerms) {
          setError(t('auth.acceptTermsError'));
          setIsLoading(false);
          return;
        }

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
            toast.textContent = `Welcome to RealWorks, ${profile.name}!`;
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
    label: string,
    icon: React.ReactNode,
    value: string,
    onChange: (value: string) => void,
    placeholder?: string
  ) => (
    <label className="block text-left">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
      <div className="relative group mt-2">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors duration-300">{icon}</div>
        <input
          type={type}
          required
          placeholder={placeholder || label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all placeholder-slate-400 dark:placeholder-slate-500 font-semibold"
        />
      </div>
    </label>
  );

  const legalDocument = activeLegal ? getLegalDocument(activeLegal, (language as 'en' | 'rw')) : null;

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 overflow-y-auto transition-colors duration-500">
      <div className="min-h-[100dvh] flex flex-col items-center px-6 py-12 sm:py-16">
        <motion.div
          className="w-full max-w-md flex-1 flex flex-col gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <img src={Logo} alt="RealWorks Logo" className="w-20 h-20 object-contain drop-shadow-xl" />

            <div>
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
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="auth-error"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                key="auth-success"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
              >
                <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {successMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.form
              key={view}
              onSubmit={handleAuthAction}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
            >
            {view === AuthState.SIGNUP && renderInput('text', t('auth.name'), <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, name, setName)}
            {renderInput('email', t('auth.email'), <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, email, setEmail)}

            {/* Password field with show/hide toggle */}
            {view !== AuthState.FORGOT_PASSWORD && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/60 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-slate-800 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            )}

            {/* Password Strength Indicator (Signup only) */}
            {view === AuthState.SIGNUP && password.length > 0 && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs font-medium ${
                    passwordStrength.score <= 1
                      ? 'text-red-500'
                      : passwordStrength.score <= 2
                        ? 'text-orange-500'
                        : passwordStrength.score <= 3
                          ? 'text-yellow-600'
                          : 'text-green-500'
                  }`}
                >
                  Password strength: {passwordStrength.label}
                </p>
              </div>
            )}

            {view === AuthState.LOGIN && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView(AuthState.FORGOT_PASSWORD)}
                  className="text-xs text-brand font-bold hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}

            {/* Terms & Privacy Checkbox (Signup only) */}
            {view === AuthState.SIGNUP && (
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                      acceptedTerms
                        ? 'bg-brand border-brand'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-brand/50'
                    }`}
                  >
                    {acceptedTerms && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('auth.termsPrompt')}{' '}
                  <button type="button" onClick={() => setActiveLegal('terms')} className="text-brand font-semibold hover:underline">
                    {t('auth.termsLink')}
                  </button>
                  {' '}<span className="text-slate-400">&amp;</span>{' '}
                  <button type="button" onClick={() => setActiveLegal('privacy')} className="text-brand font-semibold hover:underline">
                    {t('auth.privacyLink')}
                  </button>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading || (view === AuthState.SIGNUP && !acceptedTerms)}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center ${
                isLoading || (view === AuthState.SIGNUP && !acceptedTerms)
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-200 dark:shadow-black/20 hover:bg-slate-800 dark:hover:bg-slate-200'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  {view === AuthState.LOGIN && t('auth.loginButton')}
                  {view === AuthState.SIGNUP && t('auth.signupButton')}
                  {view === AuthState.FORGOT_PASSWORD && t('auth.sendReset')}
                </>
              )}
            </button>
            </motion.form>
          </AnimatePresence>

          <motion.div
            variants={footerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 text-center"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {view === AuthState.LOGIN ? t('auth.noAccount') + " " : view === AuthState.SIGNUP ? t('auth.haveAccount') + " " : t('auth.remembered') + " "}
              <button onClick={() => setView(view === AuthState.LOGIN ? AuthState.SIGNUP : AuthState.LOGIN)} className="text-brand font-bold hover:underline transition-all ml-1">{view === AuthState.LOGIN ? t('auth.signupButton') : t('auth.loginButton')}</button>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeLegal && legalDocument && (
          <motion.div
            key="legal-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveLegal(null)}></div>
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t('profile.legalTag')}</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{legalDocument.title}</h3>
                </div>
                <button onClick={() => setActiveLegal(null)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
                {legalDocument.updatedOn}
              </div>
              <div className="space-y-6 overflow-y-auto pr-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed no-scrollbar">
                {legalDocument.sections.map((section, index) => (
                  <section key={`${section.title}-${index}`}>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{section.title}</h4>
                    {section.body && <p>{section.body}</p>}
                    {section.bullets && (
                      <ul className="list-disc list-inside space-y-1">
                        {section.bullets.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
