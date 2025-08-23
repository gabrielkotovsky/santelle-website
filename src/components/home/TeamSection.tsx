'use client';

import Image from 'next/image';

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
      <section id="team" className="hidden md:flex w-full py-0 px-8 lg:px-32 flex-col items-center gap-12 min-h-screen" style={{minWidth: '100vw', width: '100vw'}}>
        <h2 className="font-bold text-[#721422] mb-10 text-center"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)'
            }}>
          <span className="chunko-bold">Our Team</span>
        </h2>
        <p className="text-center text-[#721422] mb-8 font-bold" style={{fontSize: 'clamp(0.875rem, 1.25vw, 1.25rem)'}}>
          Santelle is built by a passionate team with backgrounds in health, tech, and women&apos;s wellness.
        </p>
        {/* Logos Row */}
        <div className="w-full px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {/* Left: Roxanne Sabbag */}
            <a 
              href="https://www.linkedin.com/in/roxanne-sabbag-642a3014b/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-sm"
            >
              <div 
                className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-full h-[600px] border border-white/50"
              >
                <div className="w-full h-96 flex items-center justify-center overflow-hidden relative bg-cover bg-center bg-no-repeat" style={{
                  backgroundImage: 'url(/profile_background.webp)'
                }}>
                  <Image
                    src="/RS.png"
                    alt="Roxanne Sabbag"
                    width={500}
                    height={500}
                    className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-130 h-130 object-cover"
                    priority
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#721422] mb-2">Roxanne Sabbag</h3>
                  <p className="text-lg font-semibold text-[#ff4fa3] mb-4">Founder & CEO</p>
                  <div className="flex items-center gap-3">
                    <Image src="/McK.webp" alt="McKinsey & Co." width={60} height={60} className="w-25 mr-4 h-auto object-contain" />
                    <Image src="/ICL.webp" alt="Imperial College London" width={60} height={60} className="w-25 h-auto object-contain" />
                    <Image src="/INSEAD.webp" alt="INSEAD" width={80} height={80} className="w-30 h-auto object-contain" />
                  </div>
                </div>
              </div>
            </a>

            {/* Center: Leonor Landeau */}
            <a 
              href="https://www.linkedin.com/in/léonor-landeau-412197121/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-sm"
            >
              <div 
                className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-full h-[600px] border border-white/50"
              >
                <div className="w-full h-96 flex items-center justify-center overflow-hidden relative bg-cover bg-center bg-no-repeat" style={{
                  backgroundImage: 'url(/profile_background.webp)'
                }}>
                  <Image
                    src="/LL.png"
                    alt="Leonor Landeau"
                    width={400}
                    height={400}
                    className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-150 h-150 object-cover"
                    priority
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#721422] mb-2">Leonor Landeau</h3>
                  <p className="text-lg font-semibold text-[#ff4fa3] mb-4">Collaborator & Advisor</p>
                  <div className="flex items-center gap-3">
                    <Image src="/feelmore_labs_logo.jpeg" alt="Feelmore Labs" width={60} height={60} className="w-15 mr-8 h-auto object-contain" />
                    <Image src="/LSE_Logo.svg" alt="London School of Economics" width={60} height={60} className="w-15 h-auto object-contain" />
                    <Image src="/INSEAD.webp" alt="INSEAD" width={60} height={60} className="w-30 h-auto object-contain" />
                  </div>
                </div>
              </div>
            </a>

            {/* Right: Tomasso Busolo */}
            <a 
              href="https://www.linkedin.com/in/tommaso-busolo/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-sm"
            >
              <div 
                className="bg-white/30 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/40 cursor-pointer relative w-full h-[600px] border border-white/50"
              >
                <div className="w-full h-96 flex items-center justify-center overflow-hidden relative bg-cover bg-center bg-no-repeat" style={{
                  backgroundImage: 'url(/profile_background.webp)'
                }}>
                  <Image
                    src="/TB.png"
                    alt="Tomasso Busolo"
                    width={400}
                    height={400}
                    className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-130 h-130 object-cover"
                    priority
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#721422] mb-2">Dr. Tomasso Busolo</h3>
                  <p className="text-lg font-semibold text-[#ff4fa3] mb-4">Collaborator & Advisor</p>
                  <div className="flex items-center gap-3">
                    <Image src="/almafutura_logo.jpeg" alt="Alma Futura" width={60} height={60} className="w-15 mr-4 h-auto object-contain" />
                    <Image src="/daya_ventures_femtech_logo.jpeg" alt="Daya Ventures" width={60} height={60} className="w-15 h-auto object-contain" />
                    <Image src="/cambridge.svg" alt="University of Cambridge" width={60} height={60} className="w-30 h-auto object-contain" />
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
