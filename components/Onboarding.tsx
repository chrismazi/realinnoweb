
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: "Master Your Money",
    desc: "Track expenses, visualize your budget, and achieve your financial dreams with ease.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80",
    color: "bg-teal-50"
  },
  {
    id: 2,
    title: "Wellness Companion",
    desc: "A safe space to chat, reflect, and find mental clarity with our AI support.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    color: "bg-indigo-50"
  },
  {
    id: 3,
    title: "Health First",
    desc: "Empowering you with trusted knowledge about your reproductive health.",
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
    color: "bg-pink-50"
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

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Image Section */}
      <div className="flex-1 relative">
         {slides.map((slide, index) => (
            <div 
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
                <img
                    src={slide.image}
                    alt="Onboarding"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
            </div>
         ))}
      </div>

      {/* Content Section */}
      <div className="h-[45%] flex flex-col items-center justify-between p-8 pb-12 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative -mt-12 z-10">
        <div className="text-center mt-6">
          <h2 className="text-3xl font-extrabold mb-4 text-gray-900 tracking-tight">
            {slides[currentSlide].title}
          </h2>
          <p className="text-gray-500 leading-relaxed px-2 text-lg">
            {slides[currentSlide].desc}
          </p>
        </div>

        <div className="w-full flex flex-col items-center gap-8">
            {/* Indicators */}
            <div className="flex space-x-2">
                {slides.map((_, idx) => (
                <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-500 ${
                    idx === currentSlide ? 'w-8 bg-gray-900' : 'w-2 bg-gray-200'
                    }`}
                />
                ))}
            </div>

            <button
                onClick={nextSlide}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 active:scale-[0.98] transition-all"
            >
                {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;