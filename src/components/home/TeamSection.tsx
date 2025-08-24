'use client';

import { LazyImage, LazyText } from '../shared';

export default function TeamSection() {
  return (
    <>
      {/* Desktop Horizontal Divider */}
      <div className="hidden md:block w-full py-20">
        <div className="max-w-4xl mx-auto">
          <div className="h-1 bg-[#721422] rounded-full"></div>
        </div>
      </div>

      {/* Desktop Team/Leadership Section */}
      <section id="team" className="hidden md:flex w-full py-0 px-8 lg:px-32 flex-col items-center gap-16 min-h-screen" style={{minWidth: '100vw', width: '100vw'}}>
        <LazyText className="font-bold text-[#721422] mb-12 text-center" delay={200}
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)'
            }}>
          <span className="chunko-bold">Our Team</span>
        </LazyText>
        <LazyText className="text-center text-[#721422] mb-10 font-bold" delay={400}
            style={{fontSize: 'clamp(0.875rem, 1.25vw, 1.25rem)'}}>
          Santelle is built by a passionate team with backgrounds in health, tech, and women&apos;s wellness.
        </LazyText>
        {/* Logos Row */}
        <div className="w-full px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
            {/* Left: Roxanne Sabbag */}
            <LazyText delay={600}>
              <a 
                href="https://www.linkedin.com/in/roxanne-sabbag-642a3014b/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-100"
              >
                <div 
                  className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-100 h-[700px] border border-white/50"
                >
                  <div className="w-full h-[450px] flex items-center justify-center overflow-hidden relative" style={{
                    backgroundImage: 'url(/profile_background.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}>
                    <LazyImage
                      src="/RS.png"
                      alt="Roxanne Sabbag"
                      width={256}
                      height={256}
                      className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-cover rounded-full scale-350"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-3xl font-bold text-[#721422] mb-3">Roxanne Sabbag</h3>
                    <p className="text-xl font-semibold text-[#ff4fa3] mb-6">Founder & CEO</p>
                    <div className="flex items-center gap-5 justify-center">
                      <LazyImage 
                        src="/McK.webp" 
                        alt="McKinsey & Co." 
                        width={60} 
                        height={60} 
                        className="w-25 h-10 mr-4 ml-8 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                      <LazyImage 
                        src="/ICL.webp" 
                        alt="Imperial College London" 
                        width={60} 
                        height={60} 
                        className="w-25 h-10 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                      <LazyImage 
                        src="/INSEAD.webp" 
                        alt="INSEAD" 
                        width={80} 
                        height={80} 
                        className="w-30 h-25 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </div>
                </div>
              </a>
            </LazyText>

            {/* Center: Leonor Landeau */}
            <LazyText delay={800}>
              <a 
                href="https://www.linkedin.com/in/léonor-landeau-412197121/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-100"
              >
                <div 
                  className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-100 h-[700px] border border-white/50"
                >
                  <div className="w-full h-[450px] flex items-center justify-center overflow-hidden relative" style={{
                    backgroundImage: 'url(/profile_background.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}>
                    <LazyImage
                      src="/LL.png"
                      alt="Leonor Landeau"
                      width={256}
                      height={256}
                      className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-cover rounded-full scale-420"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-3xl font-bold text-[#721422] mb-3">Leonor Landeau</h3>
                    <p className="text-xl font-semibold text-[#ff4fa3] mb-6">Collaborator & Advisor</p>
                    <div className="flex items-center gap-10 justify-center">
                      <LazyImage 
                        src="/feelmore_labs_logo_optimized.png" 
                        alt="Feelmore Labs" 
                        width={60} 
                        height={60} 
                        className="w-16 h-16 mr-8 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                      <LazyImage 
                        src="/LSE_Logo.svg" 
                        alt="London School of Economics" 
                        width={60} 
                        height={60} 
                        className="w-16 h-16 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                      <LazyImage 
                        src="/INSEAD.webp" 
                        alt="INSEAD" 
                        width={60} 
                        height={60} 
                        className="w-30 h-25 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </div>
                </div>
              </a>
            </LazyText>

            {/* Right: Tomasso Busolo */}
            <LazyText delay={1000}>
              <a 
                href="https://www.linkedin.com/in/tommaso-busolo/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-100"
              >
                <div 
                  className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-100 h-[700px] border border-white/50"
                >
                  <div className="w-full h-[450px] flex items-center justify-center overflow-hidden relative" style={{
                    backgroundImage: 'url(/profile_background.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}>
                    <LazyImage
                      src="/TB.png"
                      alt="Tomasso Busolo"
                      width={256}
                      height={256}
                      className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-cover rounded-full scale-365"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-3xl font-bold text-[#721422] mb-3">Dr. Tomasso Busolo</h3>
                    <p className="text-xl font-semibold text-[#ff4fa3] mb-6">Collaborator & Advisor</p>
                    <div className="flex items-center gap-6 justify-center">
                      <LazyImage 
                        src="/almafutura_logo_optimized.png" 
                        alt="Alma Futura" 
                        width={60} 
                        height={60} 
                        className="w-16 h-16 object-contain mr-6 opacity-80 hover:opacity-100 transition-opacity" 
                      />
                      <LazyImage 
                        src="/daya_ventures_femtech_logo_optimized.png" 
                        alt="Daya Ventures" 
                        width={60} 
                        height={60} 
                        className="w-16 h-16 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                      <LazyImage 
                        src="/cambridge.svg" 
                        alt="University of Cambridge" 
                        width={60} 
                        height={60} 
                        className="w-40 h-25 object-contain opacity-80 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </div>
                </div>
              </a>
            </LazyText>
          </div>
        </div>
      </section>
    </>
  );
}
