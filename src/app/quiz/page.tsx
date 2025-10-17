'use client';

import { useState } from 'react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Save quiz answers and redirect to plans page
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
        const quizIdFromResponse = quizData.data[0].id;
        
        // Calculate recommended plan
        const recommendedPlan = calculateRecommendedPlan();
        
        // Store quiz ID in sessionStorage for later use
        sessionStorage.setItem('quizId', quizIdFromResponse.toString());
        
        setIsSubmitting(false);
        
        // Redirect to plans page with recommended plan
        window.location.href = `/plans?recommended=${recommendedPlan}`;
      } catch (error) {
        console.error('Error saving quiz:', error);
        setIsSubmitting(false);
        // Redirect to plans page anyway to not block the user
        window.location.href = '/plans';
      }
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


  const canProceed = currentAnswer !== undefined;

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

