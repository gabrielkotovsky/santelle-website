'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface QuizResponse {
  id: number;
  created_at: string;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  q5: number | null;
  email: string | null;
  plan: string | null;
  'signup?': boolean | null;
}

const quizQuestions = [
  {
    id: 1,
    title: 'Fréquence de l\'inconfort',
    question: 'À quelle fréquence avez-vous des infections vaginales ou de l\'inconfort chaque année ?',
    options: [
      'Moins d\'une fois',
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
      'Plutôt confiante – j\'aimerais plus de clarté',
      'Peu confiante – je me sens souvent incertaine ou perdue'
    ]
  },
  {
    id: 3,
    title: 'Motivation',
    question: 'Qu\'est-ce qui vous a donné envie de découvrir Santelle ?',
    options: [
      'Je veux prévenir les infections récurrentes',
      'J\'essaie de tomber enceinte',
      'Je veux des informations discrètes',
      'Je suis simplement curieuse de ma santé vaginale'
    ]
  },
  {
    id: 4,
    title: 'Implication souhaitée',
    question: 'Quel niveau d\'implication souhaitez-vous pour suivre votre santé vaginale ?',
    options: [
      'Je préfère quelque chose de simple et ponctuel',
      'Tester régulièrement ne me dérange pas si cela m\'aide à rester équilibrée',
      'Je veux une visibilité complète et des informations personnalisées chaque mois'
    ]
  }
];

const PASSWORD = 'Santelle2025!';

export default function QuizAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    withSignup: 0,
    withEmail: 0,
    withPlan: 0,
  });

  useEffect(() => {
    // Check if already authenticated from sessionStorage
    const authStatus = sessionStorage.getItem('quizAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function fetchQuizResponses() {
      try {
        const response = await fetch('/api/quiz/admin');
        
        if (!response.ok) {
          setError('Failed to fetch quiz responses');
          setLoading(false);
          return;
        }

        const result = await response.json();
        if (result.success && result.data) {
          setQuizResponses(result.data);
          
          // Calculate stats
          setStats({
            total: result.data.length,
            withSignup: result.data.filter((r: QuizResponse) => r['signup?'] === true).length,
            withEmail: result.data.filter((r: QuizResponse) => r.email).length,
            withPlan: result.data.filter((r: QuizResponse) => r.plan).length,
          });
        }
      } catch (err) {
        console.error('Error fetching quiz responses:', err);
        setError('An error occurred while fetching quiz responses');
      } finally {
        setLoading(false);
      }
    }

    fetchQuizResponses();
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('quizAdminAuth', 'true');
      setPasswordError('');
      setLoading(true);
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  // Calculate chart data
  const chartData = useMemo(() => {
    if (quizResponses.length === 0) return null;

    // Answer distribution for each question
    const questionDistributions = quizQuestions.map((question) => {
      const distribution: Record<string, number> = {};
      question.options.forEach((_, index) => {
        distribution[question.options[index]] = 0;
      });

      quizResponses.forEach((response) => {
        const questionKey = `q${question.id}` as keyof QuizResponse;
        const answerValue = response[questionKey] as number | null;
        if (answerValue !== null) {
          const optionIndex = answerValue - 1;
          if (optionIndex >= 0 && optionIndex < question.options.length) {
            const optionText = question.options[optionIndex];
            distribution[optionText] = (distribution[optionText] || 0) + 1;
          }
        }
      });

      return {
        questionId: question.id,
        questionTitle: question.title,
        data: Object.entries(distribution).map(([name, value]) => ({
          name: name,
          value,
        })),
      };
    });

    // Responses over time (grouped by date)
    const timeDistribution: Record<string, { count: number; timestamp: number }> = {};
    quizResponses.forEach((response) => {
      const dateObj = new Date(response.created_at);
      const date = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!timeDistribution[date]) {
        timeDistribution[date] = { count: 0, timestamp: dateObj.getTime() };
      }
      timeDistribution[date].count += 1;
    });
    const timeData = Object.entries(timeDistribution)
      .map(([date, data]) => ({ date, count: data.count, timestamp: data.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ date, count }) => ({ date, count }));

    return {
      questionDistributions,
      timeData,
    };
  }, [quizResponses]);

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
            <h1 className="text-2xl font-bold text-[#721422] mb-6 text-center">
              Quiz Admin Dashboard
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Please enter the password to access the dashboard
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#721422] focus:border-transparent"
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-[#721422] text-white rounded-lg hover:bg-[#5a0f1a] transition-colors font-medium"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#721422] text-xl">Loading quiz responses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#721422] mb-8">Quiz Responses Dashboard</h1>
        
        {/* Charts Section */}
        {chartData && (
          <div className="space-y-8 mb-8">
            {/* Responses Over Time */}
            {chartData.timeData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[#721422] mb-4">Responses Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.timeData.filter(d => d.date !== 'Nov 12')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#721422"
                      strokeWidth={2}
                      name="Responses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Answer Distribution for Each Question */}
            {chartData.questionDistributions.map((dist) => (
              <div key={dist.questionId} className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[#721422] mb-2">
                  Q{dist.questionId}: {dist.questionTitle}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {quizQuestions.find((q) => q.id === dist.questionId)?.question}
                </p>
                <ResponsiveContainer width="100%" height={Math.max(300, dist.data.length * 60)}>
                  <BarChart data={dist.data} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={300}
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value: number) => `${value} responses`}
                      labelStyle={{ color: '#721422', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="#721422" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

