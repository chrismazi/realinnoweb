import React, { useState, useEffect, Suspense, lazy } from 'react';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/ui/LoadingStates';
import { Tab } from './types';
import useAppStore from './store/useAppStore';

// Lazy load heavy components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const BudgetPlanner = lazy(() => import('./components/BudgetPlanner'));
const MentalHealthChat = lazy(() => import('./components/MentalHealthChat'));
const SexualHealth = lazy(() => import('./components/SexualHealth'));
const Profile = lazy(() => import('./components/Profile'));
// const Learn = lazy(() => import('./components/Learn'));

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [userName, setUserName] = useState<string>('');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get store actions
  const { loadFromStorage, syncWithSupabase, setUser } = useAppStore();

  // State for password reset flow
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Handle auth callback (email verification, password reset, etc.)
  useEffect(() => {
    const handleAuthCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      const isPasswordReset = url.pathname.includes('/auth/reset-password');
      const isEmailVerification = url.pathname.includes('/auth/callback');
      
      // Check if this is an auth callback
      if (isEmailVerification || isPasswordReset || code || error) {
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setAuthMessage({ type: 'error', text: errorDescription || 'Authentication failed. Please try again.' });
          window.history.replaceState({}, '', '/');
          return;
        }
        
        if (code) {
          try {
            // Exchange code for session using Supabase
            const { supabase } = await import('./lib/supabase');
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('Code exchange error:', exchangeError);
              setAuthMessage({ type: 'error', text: 'Verification failed. The link may have expired.' });
              window.history.replaceState({}, '', '/');
            } else if (data.session) {
              // Check if this is a password reset flow
              if (isPasswordReset) {
                console.log('Password reset session established');
                setShowPasswordReset(true);
                // Keep the session but show password reset UI
                window.history.replaceState({}, '', '/');
              } else {
                // Email verification flow
                console.log('Email verified successfully!');
                setAuthMessage({ type: 'success', text: 'Email verified successfully! You can now sign in.' });
                setIsAuthenticated(true);
                window.history.replaceState({}, '', '/');
              }
            }
          } catch (err) {
            console.error('Auth callback processing error:', err);
            setAuthMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
            window.history.replaceState({}, '', '/');
          }
        }
      }
    };
    
    handleAuthCallback();
  }, []);

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setAuthMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    if (newPassword.length < 8) {
      setAuthMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { supabase } = await import('./lib/supabase');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        console.error('Password update error:', error);
        setAuthMessage({ type: 'error', text: error.message || 'Failed to update password.' });
      } else {
        setAuthMessage({ type: 'success', text: 'Password updated successfully! You can now sign in.' });
        setShowPasswordReset(false);
        setNewPassword('');
        setConfirmPassword('');
        // Sign out so user can log in with new password
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.error('Password update exception:', err);
      setAuthMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Initialize app on mount
  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Load data from storage
    loadFromStorage();

    // Check for existing session on mount
    import('./services/supabaseAuth').then(({ default: supabaseAuthService }) => {
      supabaseAuthService.getCurrentUser().then((response) => {
        if (response.success && response.data) {
          setIsAuthenticated(true);
          setUserName(response.data.profile.name);
          // Update store with full user data including ID
          setUser({
            id: response.data.user.id,
            name: response.data.profile.name,
            email: response.data.profile.email,
            phone: response.data.profile.phone || '',
            avatar: response.data.profile.avatar_url || '',
            isAuthenticated: true
          });
          // Sync data with Supabase
          syncWithSupabase();
        }
      });

      // Subscribe to auth state changes
      const { data: { subscription } } = supabaseAuthService.onAuthStateChange(async (session) => {
        if (session) {
          setIsAuthenticated(true);
          // Load user profile when session changes
          const userResponse = await supabaseAuthService.getCurrentUser();
          if (userResponse.success && userResponse.data) {
            setUserName(userResponse.data.profile.name);
            setUser({
              id: userResponse.data.user.id,
              name: userResponse.data.profile.name,
              email: userResponse.data.profile.email,
              phone: userResponse.data.profile.phone || '',
              avatar: userResponse.data.profile.avatar_url || '',
              isAuthenticated: true
            });
          }
          // Sync data when session is established
          syncWithSupabase();
        } else {
          setIsAuthenticated(false);
          setUserName('');
          setUser({ id: null, name: '', email: '', phone: '', avatar: '', isAuthenticated: false });
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    });

    // Debug: Log current auth state
    console.log('App initialized. Auth state:', {
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      hasSeenOnboarding: localStorage.getItem('hasSeenOnboarding'),
      userName: localStorage.getItem('userName'),
    });
  }, [loadFromStorage, syncWithSupabase, setUser]);

  // Splash Screen Timer
  const handleSplashFinish = () => {
    setShowSplash(false);

    // Check if user has valid session (has both isAuthenticated AND userName)
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUserName = localStorage.getItem('userName');

    if (storedAuth === 'true' && storedUserName) {
      // User has valid session
      setUserName(storedUserName);
      setIsAuthenticated(true);
    } else {
      // Clear any partial auth state
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');

      // Check if they need to see onboarding
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleLogin = (userData?: { name: string; email: string; id?: string }) => {
    localStorage.setItem('isAuthenticated', 'true');
    if (userData) {
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userEmail', userData.email);
      setUserName(userData.name);
      // Update store with user data
      setUser({
        id: userData.id || null,
        name: userData.name,
        email: userData.email,
        isAuthenticated: true
      });
    }
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    // Confirm logout
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    // Sign out from Supabase
    const { default: supabaseAuthService } = await import('./services/supabaseAuth');
    await supabaseAuthService.signOut();

    // Clear Zustand store
    const clearAllData = (window as any).__RealWorks_STORE__?.getState?.()?.clearAllData;
    if (clearAllData) {
      clearAllData();
    }

    // Clear all auth-related data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear RealWorks-storage (Zustand persist)
    localStorage.removeItem('RealWorks-storage');

    // Reset state
    setUserName('');
    setIsAuthenticated(false);
    setActiveTab(Tab.DASHBOARD);

    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-50 animate-slide-up';
    toast.textContent = 'Successfully logged out';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Screen Content Router
  const renderContent = () => {
    if (showSplash) return <SplashScreen onFinish={handleSplashFinish} />;

    if (showOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;

    // Password Reset UI
    if (showPasswordReset) return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        {/* Auth Message Toast */}
        {authMessage && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl z-[100] animate-slide-up ${
            authMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white text-sm font-medium`}>
            {authMessage.text}
            <button onClick={() => setAuthMessage(null)} className="ml-3 text-white/80 hover:text-white">✕</button>
          </div>
        )}
        
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Reset Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6">Enter your new password below</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <button
              onClick={handlePasswordUpdate}
              disabled={isResettingPassword || !newPassword || !confirmPassword}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResettingPassword ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : 'Update Password'}
            </button>
            
            <button
              onClick={() => {
                setShowPasswordReset(false);
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="w-full py-3 text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );

    if (!isAuthenticated) return (
      <>
        {/* Auth Message Toast */}
        {authMessage && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl z-[100] animate-slide-up ${
            authMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white text-sm font-medium`}>
            {authMessage.text}
            <button 
              onClick={() => setAuthMessage(null)} 
              className="ml-3 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        <Auth onLogin={handleLogin} />
      </>
    );

    return (
      <ErrorBoundary>
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
          <Suspense fallback={<PageLoader />}>
            {activeTab === Tab.DASHBOARD && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
            {activeTab === Tab.BUDGET && <BudgetPlanner />}
            {/* Learn tab temporarily hidden */}
            {activeTab === Tab.WELLNESS && <MentalHealthChat />}
            {activeTab === Tab.HEALTH && <SexualHealth />}
            {activeTab === Tab.PROFILE && <Profile onBack={() => setActiveTab(Tab.DASHBOARD)} onLogout={handleLogout} />}
          </Suspense>
        </div>
        {activeTab !== Tab.PROFILE && <Navigation activeTab={activeTab} onTabChange={setActiveTab} />}
      </ErrorBoundary>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center font-sans p-0 sm:p-8 transition-colors duration-500">
      {/* Mobile Device Simulator Frame */}
      <div className="w-full h-[100dvh] sm:w-[400px] sm:h-[850px] bg-white dark:bg-slate-950 relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden sm:rounded-[3rem] sm:border-[12px] sm:border-gray-900 ring-8 ring-gray-900/5">

        {/* Dynamic Island / Notch (Desktop Visual only) */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-50 pointer-events-none"></div>

        {/* App Content */}
        {renderContent()}

      </div>
    </div>
  );
};

export default App;
