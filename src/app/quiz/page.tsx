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
    question: 'How confident do you feel about understanding and managing your intimate health?',
    options: [
      'Very confident - I know my body well',
      'Somewhat confident - I\'d like more clarity',
      'Not confident - I often feel unsure or lost'
    ]
  },
  {
    id: 3,
    title: 'Preventive vs Reactive Behavior',
    question: 'How do you usually take care of your intimate health?',
    options: [
      'Only when there\'s a problem',
      'I try to check things occasionally',
      'I like to stay proactive and track changes regularly'
    ]
  },
  {
    id: 4,
    title: 'Desired Involvement',
    question: 'How much effort would you like to put into tracking your intimate health?',
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
        // Show email form after successfully saving quiz
        setShowEmailForm(true);
      } catch (error) {
        console.error('Error saving quiz:', error);
        setIsSubmitting(false);
        // Show email form anyway to not block the user
        setShowEmailForm(true);
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
        source: 'quiz'
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
  const canProceed = currentAnswer !== undefined;

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - Video for Desktop, Image for Mobile */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
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
            height: '100vh'
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
            width: '100vw',
            height: '100vh'
          }}
        />
        
        {/* Overlay - Blur only, no color */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
      </div>

      {/* Content */}
      {!quizStarted ? (
        <div className="relative z-10 w-[95%] max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#721422] mb-6">
            Let's find the perfect Santelle plan for you.
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
      ) : showEmailForm ? (
        <div className="relative z-10 w-[95%] max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-[#721422] mb-4 text-center">
              Join the waitlist
            </h1>
            <p className="text-lg text-[#721422]/80 mb-8 text-center">
              Enter your email to get early access to your personalized Santelle plan and exclusive updates.
            </p>
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
                      ✓ You've been added to the waitlist!
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

