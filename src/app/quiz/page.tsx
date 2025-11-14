'use client';

import { useEffect, useRef, useState } from 'react';

type GTMPrimitive = string | number | boolean | null | undefined;
type GTMStructuredValue =
  | GTMPrimitive
  | GTMPrimitive[]
  | Record<string, GTMPrimitive | GTMPrimitive[]>;
type GTMEventData = Record<string, GTMStructuredValue>;
type GTMWindow = Window & { dataLayer?: Array<GTMEventData & { event?: string }> };

// GTM Event Tracking Helper
const trackGTMEvent = (eventName: string, eventData: GTMEventData) => {
  if (typeof window !== 'undefined') {
    const dataLayer = (window as GTMWindow).dataLayer;
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
    title: 'Fréquence de l’inconfort',
    question: 'À quelle fréquence avez-vous des infections vaginales ou de l’inconfort chaque année ?',
    options: [
      'Moins d’une fois',
      '1 à 2 fois par an',
      '2 à 4 fois par an',
      '4 fois ou plus par an'
    ]
  },
  {
    id: 2,
    title: 'Niveau de confiance / connaissance',
    question: 'Quel est votre niveau de confiance dans la compréhension et la gestion de votre santé vaginale ?',
    options: [
      'Très confiante – je connais bien mon corps',
      'Plutôt confiante – j’aimerais plus de clarté',
      'Peu confiante – je me sens souvent incertaine ou perdue'
    ]
  },
  {
    id: 3,
    title: 'Motivation',
    question: 'Qu’est-ce qui vous a donné envie de découvrir Santelle ?',
    options: [
      'Je veux prévenir les infections récurrentes',
      'J’essaie de tomber enceinte',
      'Je veux des informations discrètes',
      'Je suis simplement curieuse de ma santé vaginale'
    ]
  },
  {
    id: 4,
    title: 'Implication souhaitée',
    question: 'Quel niveau d’implication souhaitez-vous pour suivre votre santé vaginale ?',
    options: [
      'Je préfère quelque chose de simple et ponctuel',
      'Tester régulièrement ne me dérange pas si cela m’aide à rester équilibrée',
      'Je veux une visibilité complète et des informations personnalisées chaque mois'
    ]
  }
];

export default function QuizPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef<{ [key: number]: string }>({});
  const questionRef = useRef<number>(currentQuestion);
  const quizStartedRef = useRef<boolean>(quizStarted);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    quizStartedRef.current = quizStarted;
  }, [quizStarted]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const existingState = window.history.state ?? {};
    if (existingState.quizQuestionIndex === undefined) {
      window.history.replaceState(
        {
          ...existingState,
          quizQuestionIndex: -1,
        },
        '',
        window.location.pathname
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }

      const state = (event.state as { quizQuestionIndex?: number } | null) ?? null;
      const previousQuestionIndex = questionRef.current;

      if (!state || state.quizQuestionIndex === undefined || state.quizQuestionIndex === -1) {
        if (quizStartedRef.current) {
          setQuizStarted(false);
        }
        if (previousQuestionIndex !== 0) {
          setCurrentQuestion(0);
        }
        return;
      }

      const targetIndex = Math.min(
        Math.max(state.quizQuestionIndex, 0),
        quizQuestions.length - 1
      );

      const goingBack = targetIndex < previousQuestionIndex;
      const goingForward = targetIndex > previousQuestionIndex;

      if (!quizStartedRef.current) {
        setQuizStarted(true);
      }

      if (goingBack) {
        const returningQuestion = quizQuestions[targetIndex];
        const returningAnswer = answersRef.current[targetIndex];

        trackGTMEvent('quiz_question_previous', {
          quiz_name: 'Santelle Plan Quiz',
          from_question: previousQuestionIndex + 1,
          to_question: targetIndex + 1,
          total_questions: quizQuestions.length,
          returning_to_question_id: returningQuestion.id,
          returning_to_question_title: returningQuestion.title,
          answer_selected: returningAnswer || null,
          answer_index: returningAnswer
            ? returningQuestion.options.indexOf(returningAnswer) + 1
            : null,
        });
      } else if (goingForward) {
        const leavingIndex = previousQuestionIndex;
        const boundedLeavingIndex = Math.min(
          Math.max(leavingIndex, 0),
          quizQuestions.length - 1
        );
        const leavingQuestion = quizQuestions[boundedLeavingIndex];
        const selectedAnswer = answersRef.current[boundedLeavingIndex];

        trackGTMEvent('quiz_question_next', {
          quiz_name: 'Santelle Plan Quiz',
          from_question: boundedLeavingIndex + 1,
          to_question: targetIndex + 1,
          total_questions: quizQuestions.length,
          answer_selected: selectedAnswer || null,
          answer_index: selectedAnswer
            ? leavingQuestion.options.indexOf(selectedAnswer) + 1
            : null,
          question_id: leavingQuestion.id,
          question_title: leavingQuestion.title,
        });
      }

      setCurrentQuestion(targetIndex);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const submitQuiz = async (answersState: { [key: number]: string }) => {
    try {
      setIsSubmitting(true);

      const answerIndices = Object.keys(answersState).reduce((acc, key) => {
        const questionIndex = parseInt(key, 10);
        const answerIndex = quizQuestions[questionIndex].options.indexOf(answersState[questionIndex]);
        acc[`q${questionIndex + 1}`] = answerIndex + 1;
        return acc;
      }, {} as Record<string, number>);

      const quizResponse = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answerIndices,
          signup: false,
        }),
      });

      if (!quizResponse.ok) {
        throw new Error('Failed to save quiz answers');
      }

      const quizData = await quizResponse.json();
      const quizIdFromResponse = quizData.data[0].id;

      const recommendedPlan = calculateRecommendedPlan(answersState);

        const planNames: { [key: number]: string } = {
          0: 'Mensuel',
          1: 'Bimestriel',
          2: 'Trimestriel',
          [-1]: 'Sans recommandation',
        };

      trackGTMEvent('Quiz_Completed', {
        quiz_name: 'Santelle Plan Quiz',
        total_questions: quizQuestions.length,
        recommended_plan: recommendedPlan,
        recommended_plan_name: planNames[recommendedPlan] || 'Unknown',
        quiz_id: quizIdFromResponse,
        answers: answerIndices,
      });

      sessionStorage.setItem('quizId', quizIdFromResponse.toString());

      setIsSubmitting(false);
      window.location.href = `/plans?recommended=${recommendedPlan}`;
    } catch (error: unknown) {
      console.error('Error saving quiz:', error);
      setIsSubmitting(false);
      window.location.href = '/plans';
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    // Track quiz start
    trackGTMEvent('Quiz_Started', {
      quiz_name: 'Santelle Plan Quiz',
      total_questions: quizQuestions.length,
    });

    if (typeof window !== 'undefined') {
      const existingState = window.history.state ?? {};
      window.history.replaceState(
        {
          ...existingState,
          quizQuestionIndex: -1,
        },
        '',
        window.location.pathname
      );

      window.history.pushState(
        {
          quizQuestionIndex: 0,
        },
        '',
        window.location.pathname
      );
    }
  };

  const handleSelectAnswer = async (answer: string) => {
    if (isSubmitting) {
      return;
    }

    const questionIndex = currentQuestion;
    const currentQ = quizQuestions[questionIndex];
    const updatedAnswers = { ...answers, [questionIndex]: answer };
    setAnswers(updatedAnswers);

    if (questionIndex < quizQuestions.length - 1) {
      const selectedIndex = currentQ.options.indexOf(answer);
      trackGTMEvent('quiz_question_next', {
        quiz_name: 'Santelle Plan Quiz',
        from_question: questionIndex + 1,
        to_question: questionIndex + 2,
        total_questions: quizQuestions.length,
        answer_selected: answer,
        answer_index: selectedIndex + 1,
        question_id: currentQ.id,
        question_title: currentQ.title,
      });

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.history.pushState(
            {
              quizQuestionIndex: questionIndex + 1,
            },
            '',
            window.location.pathname
          );
        }

        setCurrentQuestion(questionIndex + 1);
        transitionTimeoutRef.current = null;
      }, 150);
    } else {
      await submitQuiz(updatedAnswers);
    }
  };

  function calculateRecommendedPlan(answersState: { [key: number]: string }): number {
    // Get answer indices (0-based)
    const q1Index = quizQuestions[0].options.indexOf(answersState[0]);
    const q2Index = quizQuestions[1].options.indexOf(answersState[1]);
    const q3Index = quizQuestions[2].options.indexOf(answersState[2]);
    const q4Index = quizQuestions[3].options.indexOf(answersState[3]);

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
    const totalScore = baseScore + motivationModifier + confidenceAdjustment + involvementAdjustment;

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
  }

  const currentAnswer = answers[currentQuestion];

  return (
    <main className="relative min-h-[100svh] w-full">
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
            backgroundAttachment: 'scroll',
            width: '100vw',
            height: '100svh'
          }}
        />
        
        {/* Overlay - Blur only, no color */}
        <div className="bg-white/30 absolute inset-0 backdrop-blur-lg" />
      </div>

      {/* Content */}
      {!quizStarted ? (
        <div className="relative z-10 flex min-h-[100svh] w-full items-center justify-center px-6 py-12 text-center">
          <div className="w-full max-w-4xl rounded-3xl border border-white/50 bg-white/40 px-8 py-16 md:px-16 md:py-20 backdrop-blur-md">
            <h1 className="text-4xl md:text-5xl font-bold text-[#721422] mb-6">
              Trouvons l’offre Santelle idéale pour vous.
            </h1>
            <p className="text-xl text-[#721422]/80 mb-10">
              Répondez à quatre questions rapides pour mieux comprendre et prendre soin de votre intimité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button
                onClick={handleStartQuiz}
                className="inline-block bg-[#721422] text-white font-bold px-10 py-4 rounded-full hover:bg-[#8a1a2a] transition-colors duration-200 cursor-pointer text-lg"
              >
                Commencer le quiz
              </button>
              <button
                onClick={() => {
                  trackGTMEvent('Quiz_Skipped', {
                    quiz_name: 'Santelle Plan Quiz',
                  });
                  window.location.href = '/plans';
                }}
                className="inline-block bg-white/60 text-[#721422] font-bold px-10 py-4 rounded-full hover:bg-white/80 transition-colors duration-200 cursor-pointer text-lg border-2 border-[#721422]"
              >
                Commander le kit directement
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full min-h-[100svh]">
          <div className="relative flex min-h-[100svh] w-full flex-col border border-white/50 bg-white/40 px-6 py-10 text-[#721422] backdrop-blur-md md:px-16 md:py-16">
            <div className="flex flex-1 flex-col items-center gap-6 pt-4 pb-6 md:gap-10 md:pt-0 md:pb-0 justify-start md:justify-center">
              {/* Progress Bar */}
              <div className="w-full max-w-2xl">
                <div className="mb-4 text-sm">
                  <div className="mb-1 text-center">
                    Question {currentQuestion + 1} sur {quizQuestions.length}
                  </div>
                  <div className="text-center font-semibold">
                    {quizQuestions[currentQuestion].title}
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/50">
                  <div
                    className="h-1 rounded-full bg-[#721422] transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="w-full max-w-2xl text-center">
                <h2 className="text-2xl font-bold md:text-3xl">
                  {quizQuestions[currentQuestion].question}
                </h2>
              </div>

              {/* Options */}
              <div className="w-full max-w-2xl space-y-2">
                {quizQuestions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={isSubmitting}
                    className={`w-full rounded-full px-5 py-5 text-center text-md font-medium transition-all duration-200 ${
                      currentAnswer === option
                        ? 'bg-[#721422] text-white shadow-lg'
                        : 'bg-white/60 text-[#721422] hover:bg-white/80 hover:shadow-md'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

