
import React, { useEffect, useState } from 'react';
import Logo from './Logo.png';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 400);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Brand Logo */}
      <div className="w-32 h-32 relative mb-6 animate-bounce">
        <img src={Logo} alt="RealWorks Logo" className="w-full h-full object-contain drop-shadow-xl" />
      </div>
      
      <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">RealWorks</h1>
      <p className="text-[#F97316] mt-3 font-bold tracking-widest uppercase text-sm">Ubuzima.Imari.Intego</p>
    </div>
  );
};

export default SplashScreen;
