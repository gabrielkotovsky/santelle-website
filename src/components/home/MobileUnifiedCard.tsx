'use client';

import { LazyImage, LazyText } from '../shared';

export default function MobileUnifiedCard() {
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
    <section id="mobile-unified-card" className="block md:hidden w-full py-8">
      <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 border border-white/50">
        
        {/* Stats Section */}
        <div data-section="stats" className="py-40">
          <LazyText className="text-center" delay={200}>
            <div className="poppins-bold text-3xl font-bold text-[#721422] mb-20">
              Vaginal infections affect 3 in 4 women. 50% are recurrent.
            </div>
            <div className="text-2xl text-[#721422] mb-20">
              Untreated, they can lead to<br/>
              <span className="font-bold">pregnancy complications</span><br/>
              <span className="font-bold">long-term discomfort</span><br/>
              <span className="font-bold">infertility</span>
            </div>
            <div className="text-2xl font-bold text-[#721422] mb-4">
              It&apos;s time to take charge of your vaginal health — with insights, not guesswork.
            </div>
          </LazyText>
        </div>

        {/* Meet Section Title */}
        <div data-section="meet" className="py-40">
          <LazyText className="flex items-center gap-4 mb-6" delay={400}>
            <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
            <h2 className="font-bold text-4xl text-[#721422] text-center">
              <span className="chunko-bold">Meet Santelle</span>
            </h2>
            <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
          </LazyText>
          <div className="flex flex-col items-start text-left">
            
            <LazyText className="mb-4 self-center" delay={600}>
              <LazyImage
                src="/SantelleKit+App.png"
                alt="Santelle Kit and App"
                width={300}
                height={300}
                className="w-full max-w-[300px] h-auto object-contain drop-shadow-lg"
                sizes="300px"
                quality={85}
              />
            </LazyText>
            <LazyText className="font-bold text-xl text-[#721422] text-left mb-4" delay={800}>
              Your discreet, at-home vaginal health companion
            </LazyText>
            <LazyText className="text-lg text-[#721422] mb-4 leading-relaxed" delay={1000}>
              Santelle makes it simple to check in on your intimate health each month — with instant
              results, personalised insights, and no awkward clinic visits.
            </LazyText>
            <LazyText className="list-disc pl-6 text-[#721422] mb-6 space-y-1 text-lg text-left">
              <li>Instant results from home</li>
              <li>Multi-biomarker analysis — beyond pH</li>
              <li>Connected app with personalised insights & tips</li>
            </LazyText>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex justify-center mt-0 mb-6">
                <LazyText>
                <button
                  className="bg-[#721422] text-white font-bold text-xl px-8 py-6 rounded-full hover:bg-[#8a1a2a] hover:text-white transition cursor-pointer get-access-pulse flex items-center justify-center text-center"
                  style={{ minHeight: '4.5rem' }}
                  onClick={focusHeroEmailInput}
                  type="button"
                >
                  Take the quiz to discover your ideal plan
                </button>
                </LazyText>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div data-section="how-it-works" className="py-40">
          <LazyText className="flex items-center gap-4 mb-6" delay={1200}>
            <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
            <h2 className="font-bold text-4xl text-[#721422] text-center">
              <span className="chunko-bold">How It Works</span>
            </h2>
            <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
          </LazyText>
          {howItWorksSteps.slice(0, 4).map((step, stepIdx) => (
            <LazyText key={step.number} className="mb-6" delay={1400 + stepIdx * 100}>
              {/* Step content */}
              <div className="flex flex-col items-start text-left">
                {/* Step number and title */}
                <div className="flex flex-col items-center gap-3 mb-3 w-full">
                  <span className="text-3xl font-bold text-white bg-[#721422] rounded-full w-12 h-12 aspect-square flex items-center justify-center">
                    {step.number}
                  </span>
                  <div className="text-2xl font-bold text-[#721422] text-center">
                    {step.title}
                  </div>
                </div>
                
                {/* Image */}
                <LazyText className="flex items-center justify-center w-full mb-3" delay={1600 + stepIdx * 100}>
                  <LazyImage 
                    src={step.img}
                    width={240}
                    height={240}
                    alt={step.title} 
                    className={`${stepIdx === 2 ? 'w-4/5 h-auto' : 'h-60 w-auto'} object-contain`} 
                    sizes="(max-width: 768px) 240px, 240px"
                    quality={85}
                  />
                </LazyText>
                
                {/* Description */}
                <LazyText className="text-lg text-[#721422] leading-relaxed" delay={1800 + stepIdx * 100}>
                  {stepIdx === 0 && (
                    <>
                      A discreet kit delivered to your door each month — with everything you need to check in with your <span className="font-bold">vaginal health</span> from home.
                    </>
                  )}
                  {stepIdx === 1 && (
                    <>
                      Use a small sample of discharge to test for <span className="font-bold">6 key biomarkers</span> linked to <span className="font-bold">infection</span>, <span className="font-bold">inflammation</span>, and <span className="font-bold">imbalance</span>.
                    </>
                  )}
                  {stepIdx === 2 && (
                    <>
                      Match your strip to the color guide and enter your results in the <span className="biomarker-highlight">Santelle app</span>. Get <span className="font-bold">instant, clear personalized insights</span> to understand what&apos;s going on.
                    </>
                  )}
                  {stepIdx === 3 && (
                    <>
                      See <span className="font-bold">patterns</span>, get <span className="font-bold">monthly tips</span>, and stay ahead of changes — whether you&apos;re managing <span className="font-bold">symptoms</span>, <span className="font-bold">pregnancy</span>, or just staying in tune.
                    </>
                  )}
                </LazyText>
              </div>
              
              {/* Divider - don't show after last step */}
              {stepIdx < 3 && (
                <div className="flex justify-center py-4">
                  <div className="w-20 h-0.5 bg-[#721422]/40 rounded-full"></div>
                </div>
              )}
            </LazyText>
          ))}
          
          {/* Take the quiz to discover your ideal plan Button */}
          <div className="flex justify-center mt-0 mb-6">
            <LazyText>
            <button
              className="bg-[#721422] text-white font-bold text-xl px-8 py-6 rounded-full hover:bg-[#8a1a2a] hover:text-white transition cursor-pointer get-access-pulse flex items-center justify-center text-center"
              style={{ minHeight: '4.5rem' }}
              onClick={focusHeroEmailInput}
              type="button"
            >
              Take the quiz to discover your ideal plan
            </button>
            </LazyText>
          </div>
        </div>

        {/* Team Section */}
        <div data-section="team" className="py-40">
          <LazyText className="flex items-center gap-4 mb-6" delay={2000}>
            <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
            <h2 className="font-bold text-4xl text-[#721422] text-center">
              <span className="chunko-bold">Our Team</span>
            </h2>
            <div className="flex-1 h-1 bg-[#721422] rounded-full"></div>
          </LazyText>

          <div className="space-y-4">
            {/* Team Member Cards */}
            <a 
              href="https://www.linkedin.com/in/roxanne-sabbag-642a3014b/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <LazyText className="block" delay={2200}>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                      <LazyImage
                        src="/RS.png"
                        alt="Roxanne Sabbag"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain scale-170"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#721422]">Roxanne Sabbag</h3>
                      <p className="text-xl font-semibold text-[#ff4fa3] mb-2">Founder & CEO</p>
                      <div className="flex items-center gap-9 justify-start">
                        <LazyImage src="/McK.webp" alt="McKinsey & Co." width={40} height={40} className="w-10 h-auto ml-3 object-contain scale-150" />
                        <LazyImage src="/ICL.webp" alt="Imperial College London" width={40} height={40} className="w-10 h-auto object-contain scale-150" />
                        <LazyImage src="/INSEAD.webp" alt="INSEAD" width={50} height={50} className="w-12 h-auto object-contain scale-170" />
                      </div>
                    </div>
                  </div>
                </div>
              </LazyText>
            </a>

            <a 
              href="https://www.linkedin.com/in/léonor-landeau-412197121/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <LazyText className="block" delay={2400}>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                      <LazyImage
                        src="/LL.png"
                        alt="Leonor Landeau"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain scale-200"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#721422]">Leonor Landeau</h3>
                      <p className="text-xl font-semibold text-[#ff4fa3] mb-2">Collaborator & Advisor</p>
                      <div className="flex items-center gap-2 justify-start">
                        <LazyImage src="/feelmore_labs_logo.jpeg" alt="Feelmore Labs" width={40} height={40} className="w-10 h-auto object-contain scale-100" />
                        <LazyImage src="/LSE_Logo.svg" alt="London School of Economics" width={40} height={40} className="w-10 h-auto object-contain scale-100" />
                        <LazyImage src="/INSEAD.webp" alt="INSEAD" width={50} height={50} className="w-12 h-auto object-contain scale-170" />
                      </div>
                    </div>
                  </div>
                </div>
              </LazyText>
            </a>

            <a 
              href="https://www.linkedin.com/in/tommaso-busolo/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <LazyText className="block" delay={2600}>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FBD5DB] to-[#F48CA3] rounded-full flex items-center justify-center overflow-hidden">
                      <LazyImage
                        src="/TB.png"
                        alt="Tomasso Busolo"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain scale-170"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#721422]">Tomasso Busolo</h3>
                      <p className="text-xl font-semibold text-[#ff4fa3] mb-2">Collaborator & Advisor</p>
                      <div className="flex items-center gap-2 justify-start">
                        <LazyImage src="/almafutura_logo.jpeg" alt="Alma Futura" width={40} height={40} className="w-10 h-auto object-contain" />
                        <LazyImage src="/daya_ventures_femtech_logo.jpeg" alt="Daya Ventures" width={40} height={40} className="w-10 h-auto object-contain" />
                        <LazyImage src="/cambridge.svg" alt="University of Cambridge" width={40} height={40} className="w-10 h-auto ml-4 object-contain scale-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </LazyText>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
