'use client';

import { smoothScrollTo } from '../shared/SmoothScroll';

export default function StatsSection() {
  function handleSmoothScroll(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, sectionId: string) {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      smoothScrollTo(el, { 
        duration: 800, 
        easing: 'easeInOutQuad',
        block: 'start',
        offset: 100 
      });
    }
  }

  return (
    <section id="stats" className="hidden md:flex w-full min-h-screen flex-col justify-center items-center gap-2 p-0 m-0 -mt-8 md:-mt-26">
      <div className="px-4 md:px-8 py-8 md:py-12 w-full flex justify-center items-center">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-none px-4 py-6 md:px-8 md:py-12 flex flex-col justify-center items-center text-center border border-white/50" style={{height: 'clamp(90vh, 95vh, 98vh)', width: 'clamp(90vw, 95vw, 98vw)'}}>
          <div
            className="block md:inline-flex md:flex-row items-center md:items-start font-bold mb-12 text-center relative poppins-bold"
            style={{
              fontSize: 'clamp(1rem, 2vw, 2rem)',
              color: '#721422'
            }}
          >
            <span className="transition-opacity duration-[1200ms] opacity-100">
              Vaginal infections affect 3 in 4 women.
            </span>
          </div>
          <div
            className="block md:inline-flex md:flex-row items-center md:items-start font-bold mb-12 text-center relative poppins-bold"
            style={{
              fontSize: 'clamp(1rem, 2vw, 2rem)',
              color: '#721422'
            }}
          >
            <span className="transition-opacity duration-[1200ms] opacity-100">
              50% are recurrent.
            </span>
          </div>
          <div 
            className="text-[#721422] mb-12 transition-opacity duration-[1200ms] opacity-100"
            style={{
              fontSize: 'clamp(0.5rem, 1.5vw, 1.5rem)'
            }}
          >
            Left untreated, this can lead to <span className="font-bold">infertility</span>, <span className="font-bold">pregnancy complications</span>, and <span className="font-bold">long-term discomfort</span>.
          </div>
          <div 
            className="font-bold text-[#721422] mb-12 transition-opacity duration-[1200ms] opacity-100"
            style={{
              fontSize: 'clamp(0.5rem, 1.5vw, 1.5rem)'
            }}
          >
            It&apos;s time to take charge of your vaginal health — with insights, not guesswork.
          </div>
          <button
            onClick={e => handleSmoothScroll(e, 'kit')}
            className="mx-auto mt-10 flex items-center justify-center bg-white text-[#721422] font-bold rounded-full shadow-lg border-2 border-[#721422] focus:outline-none focus:ring-4 focus:ring-[#721422]/40 transition-all duration-300 cursor-pointer hover:bg-[#721422] hover:text-white"
            style={{
              fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
              paddingLeft: 'clamp(1rem, 2vw, 2rem)',
              paddingRight: 'clamp(1rem, 2vw, 2rem)',
              paddingTop: 'clamp(0.75rem, 1.5vw, 1rem)',
              paddingBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
              width: 'clamp(250px, 30vw, 400px)',
              whiteSpace: 'nowrap'
            }}
            aria-label="Scroll to kit section"
          >
            Discover how you can prevent this
          </button>
        </div>
      </div>
    </section>
  );
}
