'use client';

import { useState } from 'react';

// GTM Event Tracking Helper
const trackGTMEvent = (eventName: string, eventData: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    const dataLayer = (window as any).dataLayer as Array<Record<string, any>> | undefined;
    if (dataLayer) {
      dataLayer.push({
        event: eventName,
        ...eventData,
      });
    }
  }
};

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
    title: 'Motivation',
    question: 'What made you curious about Santelle?',
    options: [
      'I want to prevent recurring infections',
      'I\'m trying to get pregnant',
      'I want discreet insights into my vaginal health',
      'I\'m just curious about my vaginal health'
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
  },
  {
    id: 5,
    title: 'Interest in Product',
    question: 'Would you be interested in a subscription for vaginal health test kits with an AI companion app?',
    options: [
      'Definitely, I\'d love that!',
      'Absolutely!',
      'Yesss!',
      'No (I hate puppies)'
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
    // Track quiz start
    trackGTMEvent('quiz_started', {
      quiz_name: 'Santelle Plan Quiz',
      total_questions: quizQuestions.length,
    });
  };

  const handleSelectAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      // Track moving to next question
      const currentAnswer = answers[currentQuestion];
      const currentQ = quizQuestions[currentQuestion];
      trackGTMEvent('quiz_question_next', {
        quiz_name: 'Santelle Plan Quiz',
        from_question: currentQuestion + 1,
        to_question: currentQuestion + 2,
        total_questions: quizQuestions.length,
        answer_selected: currentAnswer || null,
        answer_index: currentAnswer ? currentQ.options.indexOf(currentAnswer) + 1 : null,
        question_id: currentQ.id,
        question_title: currentQ.title,
      });
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
        console.log('Quiz completed, recommended plan:', recommendedPlan, 'Answers:', answers);
        
        // Track quiz completion
        const planNames: { [key: number]: string } = {
          0: 'Monthly',
          1: 'Bi-Monthly',
          2: 'Quarterly',
          [-1]: 'Opt-out',
        };
        
        trackGTMEvent('quiz_completed', {
          quiz_name: 'Santelle Plan Quiz',
          total_questions: quizQuestions.length,
          recommended_plan: recommendedPlan,
          recommended_plan_name: planNames[recommendedPlan] || 'Unknown',
          quiz_id: quizIdFromResponse,
          answers: answerIndices,
        });
        
        // Check for opt-out case
        if (recommendedPlan === -1) {
          // User opted out - show thank you message
          setIsSubmitting(false);
          alert('Thank you for your honesty! We appreciate your time 💜');
          // Redirect to home page
          window.location.href = '/';
          return;
        }
        
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
      // Track going back to previous question
      trackGTMEvent('quiz_question_previous', {
        quiz_name: 'Santelle Plan Quiz',
        from_question: currentQuestion + 1,
        to_question: currentQuestion,
        total_questions: quizQuestions.length,
      });
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers[currentQuestion];
  const calculateRecommendedPlan = (): number => {
    // Check for opt-out first (Q5 = "No (I hate puppies)")
    const q5Answer = answers[4];
    if (q5Answer === 'No (I hate puppies)') {
      return -1; // Special case for opt-out
    }

    // Get answer indices (0-based)
    const q1Index = quizQuestions[0].options.indexOf(answers[0]);
    const q2Index = quizQuestions[1].options.indexOf(answers[1]);
    const q3Index = quizQuestions[2].options.indexOf(answers[2]);
    const q4Index = quizQuestions[3].options.indexOf(answers[3]);

    // Rule 1: Main driver - Frequency of discomfort (Q1)
    let baseScore = 0;
    if (q1Index === 3) { // "4 or more times per year"
      baseScore = 5; // Always Monthly
    } else if (q1Index === 2) { // "2-4 times per year"
      baseScore = 3;
    } else if (q1Index === 1) { // "1-2 times per year"
      baseScore = 2;
    } else { // "Less than once"
      baseScore = 1;
    }

    // Rule 2: Motivation (Q3) - strong modifier
    let motivationModifier = 0;
    if (q3Index === 0) { // "Prevent recurring infections"
      motivationModifier = 2;
    } else if (q3Index === 1) { // "Trying to get pregnant"
      motivationModifier = 2;
    } else if (q3Index === 2) { // "Discreet insights"
      motivationModifier = 1;
    } else if (q3Index === 3) { // "Just curious"
      motivationModifier = 0;
    }

    // Rule 3: Confidence (Q2) and Involvement (Q4) adjustments
    let confidenceAdjustment = 0;
    if (q2Index === 0) { // "Very confident"
      confidenceAdjustment = -1;
    } else if (q2Index === 1) { // "Somewhat confident"
      confidenceAdjustment = 0;
    } else if (q2Index === 2) { // "Not confident"
      confidenceAdjustment = 1;
    }

    let involvementAdjustment = 0;
    if (q4Index === 0) { // "Simple and occasional"
      involvementAdjustment = 0;
    } else if (q4Index === 1) { // "Regular testing"
      involvementAdjustment = 1;
    } else if (q4Index === 2) { // "Full visibility"
      involvementAdjustment = 2;
    }

    // Calculate total score
    let totalScore = baseScore + motivationModifier + confidenceAdjustment + involvementAdjustment;

    // Rule 4: Determine initial recommendation based on score
    let recommendation = 2; // Default to Quarterly
    if (totalScore >= 5) {
      recommendation = 0; // Monthly
    } else if (totalScore >= 3) {
      recommendation = 1; // Bi-Monthly
    }

    // Rule 5: If Q1 = "4 or more times per year," always Monthly
    if (q1Index === 3) {
      recommendation = 0; // Monthly
    }

    // Rule 6: If "full visibility," upgrade one tier
    if (q4Index === 2) { // "Full visibility"
      if (recommendation === 2) { // Quarterly → Bi-Monthly
        recommendation = 1;
      } else if (recommendation === 1) { // Bi-Monthly → Monthly
        recommendation = 0;
      }
      // Monthly stays Monthly
    }

    // Rule 7: If "Very confident" AND "Just curious," downgrade one tier
    if (q2Index === 0 && q3Index === 3) { // Very confident AND Just curious
      if (recommendation === 0) { // Monthly → Bi-Monthly
        recommendation = 1;
      } else if (recommendation === 1) { // Bi-Monthly → Quarterly
        recommendation = 2;
      }
      // Quarterly stays Quarterly
    }

    // Rule 8: If Q1 ≥ 2 (2-4 times per year) but result is Quarterly, upgrade to Bi-Monthly
    if (q1Index >= 2 && recommendation === 2) { // 2-4 times per year but Quarterly
      recommendation = 1; // Upgrade to Bi-Monthly
    }

    return recommendation;
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
            Answer five quick questions to discover how to better understand and care for your intimate health.
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

