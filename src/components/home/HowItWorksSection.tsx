'use client';

import { LazyImage, LazyText } from '../shared';

export default function HowItWorksSection() {
  const howItWorksSteps = [
    {
      number: 1,
      title: 'Receive your kit',
      desc: 'A discreet kit delivered to your door each month — with everything you need to check in with your vaginal health from home.',
      img: '/kit.webp',
    },
    {
      number: 2,
      title: 'Test in Minutes',
      desc: 'Use a small sample of discharge to test for 6 key biomarkers linked to infection, inflammation, and imbalance.',
      img: '/step2.webp',
    },
    {
      number: 3,
      title: 'Enter Your Results in the App',
      desc: 'Match your strip to the color guide and enter your results in the Santelle app. Get instant, clear personalized insights to understand what\'s going on.',
      img: '/step3.webp',
    },
    {
      number: 4,
      title: 'Track, Learn & Take Control',
      desc: 'See patterns, get monthly tips, and stay ahead of changes — whether you\'re managing symptoms, pregnancy, or just staying in tune.',
      img: '/step4.webp',
    },
    {
      number: 5,
      title: 'About the 6 Key Biomarkers',
      desc: '', // Will render custom content
      img: '/kit.webp', // Placeholder, can be changed
    },
  ];

  const focusHeroEmailInput = () => {
    // Dispatch event to open waitlist
    window.dispatchEvent(new Event('openWaitlist'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const emailInput = document.getElementById('waitlist-email') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  };

  return (
    <>
      {/* Desktop Horizontal Divider */}
      <div className="hidden md:block w-full py-20">
        <div className="max-w-4xl mx-auto">
          <div className="h-1 bg-[#721422] rounded-full"></div>
        </div>
      </div>

      {/* Desktop Product Intro Section */}
      <section id="how-it-works" className="hidden md:flex w-full py-0 mt-0 flex-col items-center gap-12 min-h-screen">
        <LazyText className="hidden md:block font-bold text-[#721422] mb-0 md:mb-10 text-center" delay={200}
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)'
            }}>
          <span className="chunko-bold">How you&apos;ll use it</span>
        </LazyText>
        <div className="hidden md:block w-full mx-auto flex flex-col" style={{maxWidth: 'clamp(70vw, 70vw, 70vw)'}}>
          {howItWorksSteps.slice(0, 4).map((step, index) => (
            <div
              key={step.number}
              className={`w-full flex flex-col items-center justify-center bg-white/30 backdrop-blur-lg rounded-3xl shadow-none mb-16 border border-white/50`}
              style={{
                padding: 'clamp(2rem, 2vw, 2rem)',
                gap: '0'
              }}
            >
              {/* Top: Step number and heading */}
              <LazyText className="flex flex-row items-center w-full justify-center p-4" delay={300 + index * 200}
                   style={{
                     gap: 'clamp(1rem, 2vw, 2rem)',
                     height: 'clamp(80px, 10vh, 120px)'
                   }}>
                <span className="font-bold text-white bg-[#721422] rounded-full aspect-square flex items-center justify-center"
                      style={{
                        fontSize: 'clamp(1.25rem, 2.5vw, 2.5rem)',
                        width: 'clamp(2.5rem, 5vw, 4rem)',
                        height: 'clamp(2.5rem, 5vw, 4rem)'
                      }}>
                  {step.number}
                </span>
                <div className="font-bold text-[#721422]" style={{fontSize: 'clamp(1rem, 2vw, 2rem)'}}>
                  {step.title}
                </div>
              </LazyText>
              {/* Middle: Image */}
              <LazyText className="flex items-center justify-center w-full p-4" delay={400 + index * 200}
                   style={{
                     height: 'clamp(200px, 25vh, 400px)'
                   }}>
                <LazyImage 
                  src={step.img} 
                  alt={step.title} 
                  width={500}
                  height={500}
                  className="w-full h-full object-contain mx-auto"
                  style={{
                    height: 'clamp(200px, 25vh, 400px)',
                    width: 'clamp(200px, 60vw, 500px)',
                    maxWidth: '100%'
                  }}
                  sizes="(max-width: 768px) 200px, (max-width: 1024px) 300px, 500px"
                  quality={85}
                />
              </LazyText>
              {/* Bottom: Description */}
              <LazyText className="w-full text-center flex items-center p-4 text-[#721422]" delay={500 + index * 200}
                   style={{
                     fontSize: 'clamp(0.875rem, 1.5vw, 1.5rem)',
                     minHeight: 'clamp(80px, 10vh, 120px)'
                   }}>
                {step.desc}
              </LazyText>
            </div>
          ))}
        </div>

        {/* Mobile: Single card with dividers */}
        <div className="block md:hidden w-full max-w-7xl mx-auto">
          <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 border border-white/50">
            {howItWorksSteps.slice(0, 4).map((step, index) => (
              <div key={step.number}>
                {/* Step content */}
                <div className="flex flex-col items-center text-center py-6">
                  {/* Step number and title */}
                  <LazyText className="flex flex-col items-center gap-4 mb-4" delay={300 + index * 200}>
                    <span className="text-3xl font-bold text-white bg-[#721422] rounded-full w-16 h-16 aspect-square flex items-center justify-center">
                      {step.number}
                    </span>
                    <div className="text-xl font-bold text-[#721422]">
                      {step.title}
                    </div>
                  </LazyText>
                  
                  {/* Image */}
                  <LazyText className="flex items-center justify-center w-full h-32 mb-4" delay={400 + index * 200}>
                    <LazyImage 
                      src={step.img} 
                      alt={step.title} 
                      width={128}
                      height={128}
                      className="h-32 w-auto object-contain"
                      unoptimized
                    />
                  </LazyText>
                  
                  {/* Description */}
                  <LazyText className="text-base text-[#721422] leading-relaxed" delay={500 + index * 200}>
                    {step.desc}
                  </LazyText>
                </div>
                
                {/* Divider - don't show after last step */}
                {step.number < 4 && (
                  <div className="flex justify-center py-4">
                    <div className="w-16 h-0.5 bg-[#721422]/30 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <LazyText className="flex flex-col items-center mt-32 md:mt-12" delay={1000}>
          <div className="text-3xl font-semibold mb-6" style={{color: '#721422'}}>
            Ready to take control?
          </div>
          <button
            className="bg-[#721422] text-white font-bold text-2xl px-12 py-5 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-[#18321f]/40 transition-all duration-300 cursor-pointer hover:bg-[#8a1a2a] hover:text-[#ffffff] get-access-pulse"
            onClick={focusHeroEmailInput}
            type="button"
          >
            Take the quiz to discover your ideal plan
          </button>
        </LazyText>
      </section>
    </>
  );
}
