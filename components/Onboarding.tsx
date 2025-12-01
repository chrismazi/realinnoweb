import React, { useState } from 'react';
import real1 from './real1.jpg';
import real2 from './real2.jpg';
import real3 from './real3.jpg';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: "Genzura Amafaranga Yawe",
    desc: "Kurikirana uko utunze, wubake ingengo y'imari, kandi ugenze neza ukoresheje WellVest.",
    image: real1,
  },
  {
    id: 2,
    title: "Inshuti y'Ubuzima",
    desc: "Ahantu hizewe ho kuganira, kwibuka, no kubona amahoro mu mutwe hamwe n'ubufasha bwa AI.",
    image: real2,
  },
  {
    id: 3,
    title: "Ubuzima Ni Bwo Bwa Mbere",
    desc: "Kukugezaho ubumenyi bwizewe ku buzima bw'imyororokere no kwita ku mubiri.",
    image: real3,
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => onComplete();

  return (
    <div className="relative h-full bg-[#f4f2ee] overflow-hidden">
      {/* Background imagery */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Deep gradient base for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-white via-white/60 to-transparent" />
          </div>
        ))}
      </div>

      {/* Top bar with Skip */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-8">
        <div className="flex-1" />
        <button onClick={handleSkip} className="text-white text-sm font-semibold tracking-wide drop-shadow-lg">
          Skip
        </button>
      </div>

      {/* Bottom content (title + subtitle + button + indicators) */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-10">
        {/* Soft white glow hill effect */}
        <div className="absolute inset-x-0 -bottom-20 h-80 bg-white rounded-[100%] blur-2xl opacity-75 scale-150 pointer-events-none" />

        <div className="relative text-center mb-8 z-10">
          <h2 className="text-[26px] leading-tight font-bold text-slate-900">
            {slides[currentSlide].title}
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
            {slides[currentSlide].desc}
          </p>
        </div>

        <div className="relative z-10">
          <button
            onClick={nextSlide}
            className="w-full py-4 rounded-full bg-slate-900 text-white font-semibold text-lg shadow-[0_8px_25px_rgba(15,23,42,0.4)] hover:shadow-[0_12px_35px_rgba(15,23,42,0.45)] active:scale-[0.98] transition-all duration-200"
          >
            {currentSlide === slides.length - 1 ? 'Tangira' : 'Komeza'}
          </button>

          <div className="mt-10 flex justify-center gap-2.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-slate-900' : 'w-3 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;