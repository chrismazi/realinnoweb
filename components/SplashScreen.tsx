
import React, { useEffect, useState } from 'react';

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
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#F97316] drop-shadow-xl">
            {/* Circle Container */}
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" />
            
            {/* Flower Petals */}
            <g transform="translate(50 50)">
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <path
                        key={i}
                        d="M0 -10 C 10 -25, 10 -35, 0 -40 C -10 -35, -10 -25, 0 -10 Z"
                        fill="currentColor"
                        transform={`rotate(${angle}) translate(0, 5)`}
                    />
                ))}
                {/* Center Dot */}
                <circle cx="0" cy="0" r="8" fill="currentColor" />
            </g>
        </svg>
      </div>
      
      <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Real Works</h1>
      <p className="text-[#F97316] mt-3 font-bold tracking-widest uppercase text-sm">Health. Wealth. You.</p>
    </div>
  );
};

export default SplashScreen;
