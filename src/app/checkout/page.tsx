'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Plan configuration
const PLANS = {
  proactive: {
    name: 'Proactive Plan - Monthly Kit',
    price: '€12.99',
    period: 'month',
    lookupKey: 'proactive-monthly',
  },
  balanced: {
    name: 'Balanced Plan - Bi-Monthly Kit',
    price: '€16.99',
    period: '2 months',
    lookupKey: 'balanced-bimonthly',
  },
  essential: {
    name: 'Essential Plan - Quarterly Kit',
    price: '€19.99',
    period: 'quarter',
    lookupKey: 'essential-quarterly',
  },
};

const Logo = () => (
  <div className="flex justify-center mb-6">
    <Image
      src="/logo-dark.svg"
      alt="Santelle"
      width={200}
      height={50}
      className="object-contain"
    />
  </div>
);

const ProductDisplay = ({ planKey }: { planKey: string }) => {
  const plan = PLANS[planKey as keyof typeof PLANS] || PLANS.proactive;
  
  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 max-w-2xl mx-auto">
      <Logo />
      
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-[#721422] mb-2">
          {plan.name}
        </h3>
        <h5 className="text-xl text-[#721422]/80 font-semibold">
          {plan.price} / {plan.period}
        </h5>
      </div>

      <form action="/create-checkout-session" method="POST">
        <input type="hidden" name="lookup_key" value={plan.lookupKey} />
        <button
          id="checkout-and-portal-button"
          type="submit"
          className="w-full bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200"
        >
          Checkout
        </button>
      </form>
    </div>
  );
};

const SuccessDisplay = ({ sessionId, planKey }: { sessionId: string; planKey: string }) => {
  const plan = PLANS[planKey as keyof typeof PLANS] || PLANS.proactive;
  
  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 max-w-2xl mx-auto">
      <Logo />
      
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#721422] mb-4">
          Subscription to {plan.name} successful!
        </h3>
        <p className="text-lg text-[#721422]/80">
          Welcome to Santelle! You&apos;ll receive a confirmation email shortly.
        </p>
      </div>

      <form action="/create-portal-session" method="POST" className="space-y-4">
        <input
          type="hidden"
          id="session-id"
          name="session_id"
          value={sessionId}
        />
        <button
          id="checkout-and-portal-button"
          type="submit"
          className="w-full bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200"
        >
          Manage your billing information
        </button>
      </form>
    </div>
  );
};

const Message = ({ message }: { message: string }) => (
  <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 max-w-2xl mx-auto">
    <Logo />
    
    <div className="text-center">
      <p className="text-xl text-[#721422]">{message}</p>
    </div>

    <div className="mt-8 text-center">
      <a
        href="/quiz"
        className="inline-block bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200"
      >
        Back to Plans
      </a>
    </div>
  </div>
);

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  // Get plan from URL parameter (defaults to 'proactive')
  const planParam = searchParams.get('plan')?.toLowerCase() || 'proactive';

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const successParam = searchParams.get('success');
    const canceledParam = searchParams.get('canceled');
    const sessionIdParam = searchParams.get('session_id');

    if (successParam) {
      setSuccess(true);
      setSessionId(sessionIdParam || '');
    }

    if (canceledParam) {
      setSuccess(false);
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, [searchParams]);

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      {/* Background - Video for Desktop, Image for Mobile */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center">
        {/* Desktop Video Background */}
        <video
          src="/background_desktop.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          style={{ 
            objectFit: 'cover', 
            objectPosition: 'center',
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Mobile Background Image */}
        <div 
          className="absolute inset-0 w-full h-full block md:hidden"
          style={{
            backgroundImage: 'url(/background-mobile.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            width: '100vw',
            height: '100dvh'
          }}
        />
        
        {/* Overlay - Blur only, no color */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-[95%] max-w-7xl mx-auto px-4 py-16">
        {!success && message === '' ? (
          <ProductDisplay planKey={planParam} />
        ) : success && sessionId !== '' ? (
          <SuccessDisplay sessionId={sessionId} planKey={planParam} />
        ) : (
          <Message message={message} />
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center">
        {/* Background - Video for Desktop, Image for Mobile */}
        <div className="fixed inset-0 -z-10 flex items-center justify-center">
          {/* Desktop Video Background */}
          <video
            src="/background_desktop.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover hidden md:block"
            style={{ 
              objectFit: 'cover', 
              objectPosition: 'center',
              width: '100vw',
              height: '100dvh'
            }}
          />
          
          {/* Mobile Background Image */}
          <div 
            className="absolute inset-0 w-full h-full block md:hidden"
            style={{
              backgroundImage: 'url(/background-mobile.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              width: '100vw',
              height: '100dvh'
            }}
          />
          
          {/* Overlay - Blur only, no color */}
          <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
        </div>
        
        <div className="relative z-10 text-[#721422] text-xl">Loading...</div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

