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

    // Date threshold for filtering (Nov 13 onwards)
    const nov13Threshold = new Date('2024-11-13T00:00:00Z').getTime();

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

    // Responses over time (grouped by date, from Nov 13 onwards)
    const timeDistribution: Record<string, { count: number; timestamp: number }> = {};
    quizResponses
      .filter((response) => {
        const responseDate = new Date(response.created_at).getTime();
        return responseDate >= nov13Threshold;
      })
      .forEach((response) => {
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

    // Most common answer per question per day (from Nov 13 onwards)
    const filteredResponses = quizResponses.filter((response) => {
      const responseDate = new Date(response.created_at).getTime();
      return responseDate >= nov13Threshold;
    });

    // Group responses by date
    const responsesByDate: Record<string, QuizResponse[]> = {};
    filteredResponses.forEach((response) => {
      const dateObj = new Date(response.created_at);
      const date = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!responsesByDate[date]) {
        responsesByDate[date] = [];
      }
      responsesByDate[date].push(response);
    });

    // For each date, find the most common answer for each question
    const dailyMostCommonAnswers: Array<{
      date: string;
      timestamp: number;
      question1: string;
      question2: string;
      question3: string;
      question4: string;
      q1Count: number;
      q2Count: number;
      q3Count: number;
      q4Count: number;
    }> = [];

    Object.entries(responsesByDate).forEach(([date, responses]) => {
      const dateObj = new Date(responses[0].created_at);
      const timestamp = dateObj.getTime();

      const dailyAnswers: Record<string, Record<number, number>> = {
        q1: {},
        q2: {},
        q3: {},
        q4: {},
      };

      // Count answers for each question on this date
      responses.forEach((response) => {
        [1, 2, 3, 4].forEach((qNum) => {
          const questionKey = `q${qNum}` as keyof QuizResponse;
          const answerValue = response[questionKey] as number | null;
          if (answerValue !== null) {
            const key = `q${qNum}`;
            dailyAnswers[key][answerValue] = (dailyAnswers[key][answerValue] || 0) + 1;
          }
        });
      });

      // Find most common answer for each question
      const getMostCommon = (qNum: number): { answer: string; count: number } => {
        const counts = dailyAnswers[`q${qNum}`];
        if (Object.keys(counts).length === 0) return { answer: 'N/A', count: 0 };
        
        const [mostCommonValue, count] = Object.entries(counts).reduce((a, b) => 
          counts[parseInt(b[0])] > counts[parseInt(a[0])] ? b : a
        );
        
        // count is already a number from Object.entries, but TypeScript sees it as string | number
        const countNum = typeof count === 'number' ? count : parseInt(count);
        
        const question = quizQuestions.find((q) => q.id === qNum);
        if (!question) return { answer: `Q${qNum}: ${mostCommonValue}`, count: countNum };
        
        const optionIndex = parseInt(mostCommonValue) - 1;
        if (optionIndex >= 0 && optionIndex < question.options.length) {
          return { answer: question.options[optionIndex], count: countNum };
        }
        return { answer: 'N/A', count: 0 };
      };

      const q1 = getMostCommon(1);
      const q2 = getMostCommon(2);
      const q3 = getMostCommon(3);
      const q4 = getMostCommon(4);

      dailyMostCommonAnswers.push({
        date,
        timestamp,
        question1: q1.answer,
        question2: q2.answer,
        question3: q3.answer,
        question4: q4.answer,
        q1Count: q1.count,
        q2Count: q2.count,
        q3Count: q3.count,
        q4Count: q4.count,
      });
    });

    // Sort by timestamp
    dailyMostCommonAnswers.sort((a, b) => a.timestamp - b.timestamp);

    return {
      questionDistributions,
      timeData,
      dailyMostCommonAnswers,
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
                  <LineChart data={chartData.timeData}>
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

            {/* Most Common Answer Per Question Per Day (From Nov 13) */}
            {chartData.dailyMostCommonAnswers && chartData.dailyMostCommonAnswers.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[#721422] mb-2">
                  Most Common Answer Per Question Per Day (From Nov 13)
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Shows the most selected answer for each question on each day since November 13
                </p>
                <div className="overflow-x-auto mb-6">
                  <div style={{ minWidth: '800px' }}>
                    <ResponsiveContainer width="100%" height={Math.max(400, chartData.dailyMostCommonAnswers.length * 50)}>
                      <BarChart
                        data={chartData.dailyMostCommonAnswers}
                        layout="vertical"
                        margin={{ left: 120, right: 20, top: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 'dataMax']} />
                        <YAxis
                          dataKey="date"
                          type="category"
                          width={100}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [`${value} responses`, name]}
                          labelStyle={{ color: '#721422', fontWeight: 'bold' }}
                        />
                        <Legend />
                        <Bar dataKey="q1Count" fill="#721422" name="Q1: Fréquence" />
                        <Bar dataKey="q2Count" fill="#a8324f" name="Q2: Confiance" />
                        <Bar dataKey="q3Count" fill="#d45a7a" name="Q3: Motivation" />
                        <Bar dataKey="q4Count" fill="#e88ba5" name="Q4: Implication" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-[#721422]">Date</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#721422]">Q1: Fréquence</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#721422]">Q2: Confiance</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#721422]">Q3: Motivation</th>
                        <th className="text-left py-2 px-3 font-semibold text-[#721422]">Q4: Implication</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.dailyMostCommonAnswers.map((day, index) => (
                        <tr key={day.date} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-3 font-medium text-gray-900">{day.date}</td>
                          <td className="py-2 px-3 text-gray-600 max-w-xs">
                            <div className="truncate" title={day.question1}>
                              {day.question1} <span className="text-gray-400">({day.q1Count})</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-gray-600 max-w-xs">
                            <div className="truncate" title={day.question2}>
                              {day.question2} <span className="text-gray-400">({day.q2Count})</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-gray-600 max-w-xs">
                            <div className="truncate" title={day.question3}>
                              {day.question3} <span className="text-gray-400">({day.q3Count})</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-gray-600 max-w-xs">
                            <div className="truncate" title={day.question4}>
                              {day.question4} <span className="text-gray-400">({day.q4Count})</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

