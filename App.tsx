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
const Learn = lazy(() => import('./components/Learn'));

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [userName, setUserName] = useState<string>('');

  // Get store actions
  const { loadFromStorage, syncWithSupabase } = useAppStore();

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
          // Sync data with Supabase
          syncWithSupabase();
        }
      });

      // Subscribe to auth state changes
      const { data: { subscription } } = supabaseAuthService.onAuthStateChange((session) => {
        if (session) {
          setIsAuthenticated(true);
          // Sync data when session is established
          syncWithSupabase();
        } else {
          setIsAuthenticated(false);
          setUserName('');
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
  }, [loadFromStorage, syncWithSupabase]);

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

  const handleLogin = (userData?: { name: string; email: string }) => {
    localStorage.setItem('isAuthenticated', 'true');
    if (userData) {
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userEmail', userData.email);
      setUserName(userData.name);
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

    if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

    return (
      <ErrorBoundary>
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
          <Suspense fallback={<PageLoader />}>
            {activeTab === Tab.DASHBOARD && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}
            {activeTab === Tab.BUDGET && <BudgetPlanner />}
            {activeTab === Tab.LEARN && <Learn />}
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
