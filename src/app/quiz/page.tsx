'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { analytics } from '@/lib/analytics';

const quizQuestions = [
  {
    id: 1,
    title: 'Frequency of Discomfort',
    question: 'How often do you experience vaginal infections or discomfort per year?',
    options: [
      'Less than once',
      '1-2 times per year',
      '2-4 times per year',
      '4 or more times per year'
    ]
  },
  {
    id: 2,
    title: 'Confidence / Knowledge Level',
    question: 'How confident do you feel about understanding and managing your vaginal health?',
    options: [
      'Very confident - I know my body well',
      'Somewhat confident - I\'d like more clarity',
      'Not confident - I often feel unsure or lost'
    ]
  },
  {
    id: 3,
    title: 'Preventive vs Reactive Behavior',
    question: 'How often do you monitor your vaginal health (monitor discharge, do at-home tests, track symptoms)?',
    options: [
      'Only when there\'s a problem',
      'I try to check things occasionally',
      'I like to stay proactive and track changes regularly'
    ]
  },
  {
    id: 4,
    title: 'Desired Involvement',
    question: 'How much effort would you like to put into tracking your vaginal health?',
    options: [
      'I prefer something simple and occasional',
      'I don\'t mind testing regularly if it keeps me balanced',
      'I want full visibility and personalized insights every month'
    ]
  }
];

export default function QuizPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecking: false,
    error: '',
    domainValid: false
  });
  const [rateLimit, setRateLimit] = useState({
    attempts: 0,
    lastAttempt: 0,
    blocked: false,
    cooldownEnd: 0
  });
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  useEffect(() => {
    if (!rateLimit.blocked) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= rateLimit.cooldownEnd) {
        setRateLimit(prev => ({
          ...prev,
          blocked: false,
          cooldownEnd: 0
        }));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [rateLimit.blocked, rateLimit.cooldownEnd]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff4fa3', '#721422', '#F7A8B8', '#721422', '#18321f'],
      shapes: ['circle', 'square'],
      gravity: 0.8,
      ticks: 200
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#ff4fa3', '#721422', '#F7A8B8'],
        shapes: ['circle'],
        gravity: 1,
        ticks: 150
      });
    }, 200);
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmailDomain = async (email: string): Promise<boolean> => {
    const domain = email.split('@')[1];
    if (!domain) return false;
    
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      const data = await response.json();
      return data.Answer && data.Answer.length > 0;
    } catch (error) {
      console.error('Domain validation error:', error);
      return false;
    }
  };

  const validateEmail = async (email: string) => {
    if (!email) {
      setEmailValidation({
        isValid: false,
        isChecking: false,
        error: '',
        domainValid: false
      });
      return;
    }

    const formatValid = validateEmailFormat(email);
    if (!formatValid) {
      setEmailValidation({
        isValid: false,
        isChecking: false,
        error: 'Please enter a valid email address',
        domainValid: false
      });
      return;
    }

    setEmailValidation(prev => ({ ...prev, isChecking: true }));
    const domainValid = await validateEmailDomain(email);
    
    setEmailValidation({
      isValid: formatValid && domainValid,
      isChecking: false,
      error: domainValid ? '' : 'This email domain appears to be invalid',
      domainValid
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    
    const timeout = setTimeout(() => {
      validateEmail(e.target.value);
    }, 500);
    
    setValidationTimeout(timeout);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleSelectAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save quiz answers immediately when completing the quiz
      try {
        setIsSubmitting(true);
        
        // Map answers to integers for database (1-based indices)
        const answerIndices = Object.keys(answers).reduce((acc, key) => {
          const questionIndex = parseInt(key);
          const answerIndex = quizQuestions[questionIndex].options.indexOf(answers[questionIndex]);
          acc[`q${questionIndex + 1}`] = answerIndex + 1; // Add 1 to make it 1-based
          return acc;
        }, {} as Record<string, number>);

        // Save quiz answers to database without email
        const quizResponse = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: answerIndices,
            signup: false // Will be updated to true when email is submitted
          })
        });

        if (!quizResponse.ok) {
          throw new Error('Failed to save quiz answers');
        }

        const quizData = await quizResponse.json();
        setQuizId(quizData.data[0].id); // Store the quiz ID for later update
        
        setIsSubmitting(false);
        // Show plan selection after successfully saving quiz
        setShowPlans(true);
      } catch (error) {
        console.error('Error saving quiz:', error);
        setIsSubmitting(false);
        // Show plan selection anyway to not block the user
        setShowPlans(true);
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    
    // Rate limiting checks
    if (rateLimit.blocked && now < rateLimit.cooldownEnd) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }
    
    // Check for rapid submissions
    const timeWindow = 60000; // 60 seconds
    const maxAttempts = 3;
    
    if (now - rateLimit.lastAttempt < timeWindow) {
      const newAttempts = rateLimit.attempts + 1;
      
      if (newAttempts > maxAttempts) {
        const cooldownTime = 300000; // 5 minutes
        setRateLimit({
          attempts: newAttempts,
          lastAttempt: now,
          blocked: true,
          cooldownEnd: now + cooldownTime
        });
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
        return;
      }
      
      setRateLimit(prev => ({
        ...prev,
        attempts: newAttempts,
        lastAttempt: now
      }));
    } else {
      setRateLimit(prev => ({
        ...prev,
        attempts: 1,
        lastAttempt: now,
        blocked: false,
        cooldownEnd: 0
      }));
    }
    
    if (!emailValidation.isValid) {
      setEmailValidation(prev => ({ ...prev, error: 'Please enter a valid email address' }));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Update the existing quiz record with email and signup status
      // (plan was already saved when user selected it)
      if (quizId) {
        const updateResponse = await fetch('/api/quiz', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: quizId,
            email: email,
            signup: true
          })
        });

        if (!updateResponse.ok) {
          console.error('Failed to update quiz with email');
        }
      }

      // Subscribe to waitlist
      const subscribeResponse = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          screenData: {
            width: window.screen.width,
            height: window.screen.height
          }
        })
      });

      if (!subscribeResponse.ok) {
        const errorData = await subscribeResponse.json();
        throw new Error(errorData.error || 'Failed to subscribe to waitlist');
      }

      // Track with analytics
      analytics.trackWaitlistSignup(email, {
        device: { type: 'desktop' },
        browser: { name: navigator.userAgent },
        timestamp: new Date().toISOString(),
        source: 'quiz',
        selectedPlan: selectedPlan
      });
      
      setIsSubmitting(false);
      setSubmitStatus('success');
      triggerConfetti();
      
      // Reset and redirect after success
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers[currentQuestion];
  const calculateRecommendedPlan = (): number => {
    // Plans: 0=Proactive (Monthly), 1=Balanced (Bi-Monthly), 2=Essential (Quarterly)
    // Convert to levels: 3=Monthly, 2=Bi-Monthly, 1=Quarterly
    
    // Rule 1: Frequency Baseline (Q1)
    let planLevel = 1; // Default to Quarterly
    
    const q1Answer = Object.keys(answers).length > 0 ? 
      quizQuestions[0].options.indexOf(answers[0]) + 1 : 1;
    
    if (q1Answer === 4) { // 4 or more times per year
      planLevel = 3; // Monthly
    } else if (q1Answer === 3) { // 2-4 times per year
      planLevel = 2; // Bi-Monthly
    } else { // 1-2 times per year or less than once
      planLevel = 1; // Quarterly
    }
    
    // Rule 2: Adjustments
    // Q2 - Confidence
    const q2Answer = quizQuestions[1].options.indexOf(answers[1]) + 1;
    if (q2Answer === 3) { // Not confident
      planLevel = Math.min(3, planLevel + 1); // Upgrade
    } else if (q2Answer === 1) { // Very confident
      planLevel = Math.max(1, planLevel - 1); // Downgrade
    }
    
    // Q3 - Behavior
    const q3Answer = quizQuestions[2].options.indexOf(answers[2]) + 1;
    if (q3Answer === 3) { // Regularly
      planLevel = Math.min(3, planLevel + 1); // Upgrade
    } else if (q3Answer === 1) { // Only when there's a problem
      planLevel = Math.max(1, planLevel - 1); // Downgrade
    }
    
    // Q4 - Effort
    const q4Answer = quizQuestions[3].options.indexOf(answers[3]) + 1;
    if (q4Answer === 3) { // Full visibility
      planLevel = Math.min(3, planLevel + 1); // Upgrade
    } else if (q4Answer === 1) { // Simple & occasional
      planLevel = Math.max(1, planLevel - 1); // Downgrade
    }
    
    // Convert level to plan index: 3=0 (Proactive), 2=1 (Balanced), 1=2 (Essential)
    return 3 - planLevel;
  };

  const handlePlanSelect = async (plan: string) => {
    setSelectedPlan(plan);
    
    // Save the selected plan immediately
    if (quizId) {
      try {
        const updateResponse = await fetch('/api/quiz', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: quizId,
            plan: plan // Save plan name directly as text
          })
        });

        if (!updateResponse.ok) {
          console.error('Failed to update quiz with plan');
        }
      } catch (error) {
        console.error('Error saving plan:', error);
      }
    }
    
    setShowPlans(false);
    setShowEmailForm(true);
  };

  const canProceed = currentAnswer !== undefined;
  const recommendedPlanIndex = showPlans ? calculateRecommendedPlan() : 1;

  const allPlans = [
    {
      name: 'Proactive',
      frequency: 'Monthly Kit',
      price: '€12.99',
      period: 'month',
      yearlyPrice: '€129.99 / year',
      originalIndex: 0
    },
    {
      name: 'Balanced',
      frequency: 'Bi-Monthly Kit',
      price: '€16.99',
      period: '2 months',
      yearlyPrice: '€79.99 / year',
      originalIndex: 1
    },
    {
      name: 'Essential',
      frequency: 'Quarterly Kit',
      price: '€19.99',
      period: 'quarter',
      yearlyPrice: '€59.99 / year',
      originalIndex: 2
    }
  ];

  // On mobile, sort plans to show recommended first
  const plans = [...allPlans].sort((a, b) => {
    if (a.originalIndex === recommendedPlanIndex) return -1;
    if (b.originalIndex === recommendedPlanIndex) return 1;
    return a.originalIndex - b.originalIndex;
  });

  const commonFeatures = [
    'Full access to app',
    '30% off on extra kits'
  ];

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
      {!quizStarted ? (
        <div className="relative z-10 w-[95%] max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#721422] mb-6">
            Let&apos;s find the perfect Santelle plan for you.
          </h1>
          <p className="text-xl text-[#721422]/80 mb-8">
            Answer four quick questions to discover how to better understand and care for your intimate health.
          </p>
          <button
            onClick={handleStartQuiz}
            className="inline-block bg-[#721422] text-white font-bold px-8 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 cursor-pointer"
          >
            Start now
          </button>
        </div>
      ) : showPlans ? (
        <div className="relative z-10 w-[95%] mx-auto px-4 py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-4 text-center">
            Based on your answers, this plan helps you stay balanced and in control.
          </h1>
          <p className="text-lg text-[#721422]/80 mb-12 text-center">
            Choose the plan that best fits your needs.
          </p>
          
          <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isRecommended = plan.originalIndex === recommendedPlanIndex;
              return (
              <div
                key={plan.name}
                className={`bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col ${
                  isRecommended ? 'border-[#721422] shadow-lg' : 'border-white/50'
                }`}
              >
                {isRecommended && (
                  <div className="text-center mb-4">
                    <span className="bg-[#721422] text-white px-4 py-1 rounded-full text-sm font-bold">
                      RECOMMENDED FOR YOU
                    </span>
                  </div>
                )}
                
                <h2 className="text-2xl md:text-3xl font-bold text-[#721422] mb-4 text-center">
                  {plan.name}
                </h2>
                
                <div className="mb-6">
                  <p className="text-lg text-[#721422] font-semibold text-center">
                    {plan.frequency}
                  </p>
                </div>
                
                <div className="mt-auto">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-[#721422]">
                      {plan.price}
                      <span className="text-lg font-normal"> / {plan.period}</span>
                    </div>
                    <div className="text-sm text-[#721422]/70 mt-1">
                      {plan.yearlyPrice}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => window.location.href = '/checkout'}
                    className={`w-full font-bold px-6 py-4 rounded-full transition-colors duration-200 ${
                      isRecommended
                        ? 'bg-[#721422] text-white hover:bg-[#8a1a2a]'
                        : 'bg-white text-[#721422] border-2 border-[#721422] hover:bg-[#721422] hover:text-white'
                    }`}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            )})}
            </div>

            {/* Common Features - Below Plan Cards */}
            <div className="flex justify-center">
              <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50">
                <h3 className="text-xl font-bold text-[#721422] mb-4 text-center">
                  All Plans Include:
                </h3>
                <ul className="flex flex-wrap gap-6 justify-center">
                  {commonFeatures.map((feature, idx) => (
                    <li key={idx} className="text-[#721422] flex items-center">
                      <span className="mr-2 text-lg">✓</span>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : showEmailForm ? (
        <div className="relative z-10 w-[95%] max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-4 text-center">
              Join the waitlist
            </h1>
            <p className="text-lg text-[#721422]/80 mb-4 text-center">
              Enter your email to get early access to your personalized Santelle plan and exclusive updates.
            </p>
            {selectedPlan && (
              <div className="text-center mb-8">
                <span className="inline-block bg-[#721422] text-white px-6 py-2 rounded-full font-semibold">
                  Selected: {selectedPlan} Plan
                </span>
              </div>
            )}
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                  className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none text-[#721422] bg-white/80 placeholder:text-[#721422]/50 transition ${
                    emailValidation.error ? 'border-red-500' : 
                    emailValidation.isValid ? 'border-green-500' : 
                    'border-[#721422]/20 focus:border-[#721422]'
                  }`}
                />
                
                {/* Validation feedback */}
                <div className="mt-2 text-center">
                  {emailValidation.isChecking && (
                    <div className="text-blue-600 text-sm">Checking email domain...</div>
                  )}
                  {emailValidation.error && (
                    <div className="text-red-600 text-sm">{emailValidation.error}</div>
                  )}
                  {emailValidation.isValid && !emailValidation.isChecking && (
                    <div className="text-green-600 text-sm">✓ Valid email address</div>
                  )}
                  {rateLimit.blocked && (
                    <div className="text-red-600 text-sm">
                      Too many attempts. Please wait {Math.ceil((rateLimit.cooldownEnd - Date.now()) / 1000)} seconds before trying again.
                    </div>
                  )}
                  {submitStatus === 'success' && (
                    <div className="text-green-600 font-semibold">
                      ✓ You&apos;ve been added to the waitlist!
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="text-red-600 font-semibold">
                      {rateLimit.blocked ? 'Too many submission attempts. Please wait before trying again.' : 'Something went wrong. Please try again.'}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || (!!email && !emailValidation.isValid) || rateLimit.blocked}
                className={`w-full bg-[#721422] text-white font-bold px-8 py-4 rounded-full transition-colors duration-200 ${
                  isSubmitting || (!!email && !emailValidation.isValid) || rateLimit.blocked
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#8a1a2a] cursor-pointer'
                }`}
              >
                {isSubmitting ? 'Submitting...' : rateLimit.blocked ? 'Rate limited' : 'Join waitlist'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-[95%] max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="text-sm text-[#721422] mb-2">
                <div className="text-center mb-1">Question {currentQuestion + 1} of {quizQuestions.length}</div>
                <div className="font-semibold text-center">{quizQuestions[currentQuestion].title}</div>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div 
                  className="bg-[#721422] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-[#721422] mb-8 text-center">
              {quizQuestions[currentQuestion].question}
            </h2>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {quizQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-200 ${
                    currentAnswer === option
                      ? 'bg-[#721422] text-white shadow-lg'
                      : 'bg-white/60 text-[#721422] hover:bg-white/80 hover:shadow-md'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`px-6 py-3 rounded-full font-bold transition-colors duration-200 ${
                  currentQuestion === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-[#721422] hover:bg-gray-100'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`px-6 py-3 rounded-full font-bold transition-colors duration-200 ${
                  canProceed
                    ? 'bg-[#721422] text-white hover:bg-[#8a1a2a]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentQuestion === quizQuestions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

