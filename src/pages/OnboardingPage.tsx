import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { COLLECTIONS } from '../constants/emissions';
import { calculateScore } from '../utils/sustainabilityScore';
import { Leaf, ArrowRight } from 'lucide-react';

type Step = 0 | 1 | 2 | 3;

const questions = [
  {
    id: 'commute',
    title: 'How do you usually commute?',
    options: ['Car', 'Bus / Metro', 'Walk / Cycle', 'Mix'],
  },
  {
    id: 'diet',
    title: 'What best describes your diet?',
    options: ['Vegan', 'Vegetarian', 'Mixed', 'Meat heavy'],
  },
  {
    id: 'flights',
    title: 'How many flights do you take per year?',
    options: ['0', '1-3', '4-10', '10+'],
  },
  {
    id: 'electricity',
    title: 'Your monthly electricity bill range?',
    options: ['<500', '500-1500', '1500-3000', '3000+'],
  },
  {
    id: 'shopping',
    title: 'How often do you shop for new items?',
    options: ['Rarely', 'Monthly', 'Weekly', 'Daily'],
  },
] as const;

const goalOptions = [
  'Reduce transport emissions by 20% this month',
  'Go meat-free 3 days a week',
  'Reduce electricity by 10 kWh this month',
];

function estimateBaselineKg(answers: Record<string, string>): number {
  const commute = { Car: 4200, 'Bus / Metro': 2600, 'Walk / Cycle': 1200, Mix: 3000 }[answers.commute] ?? 3000;
  const diet = { Vegan: 1800, Vegetarian: 2600, Mixed: 4000, 'Meat heavy': 5600 }[answers.diet] ?? 4000;
  const flights = { '0': 0, '1-3': 700, '4-10': 1800, '10+': 4200 }[answers.flights] ?? 700;
  const electricity = { '<500': 900, '500-1500': 1600, '1500-3000': 2800, '3000+': 4200 }[answers.electricity] ?? 1600;
  const shopping = { Rarely: 500, Monthly: 1000, Weekly: 1800, Daily: 2800 }[answers.shopping] ?? 1000;
  return commute + diet + flights + electricity + shopping;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedGoal, setSelectedGoal] = useState(goalOptions[0]);
  const [saving, setSaving] = useState(false);

  const baselineKg = useMemo(() => estimateBaselineKg(answers), [answers]);
  const yearlyTonne = (baselineKg / 1000).toFixed(1);
  const isFinalStep = step === 3;

  const chooseAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const saveAndContinue = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profileRef = doc(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.PROFILE, 'data');
      await setDoc(
        profileRef,
        {
          onboardingCompleted: true,
          baselineFootprintKg: baselineKg,
          onboardingAnswers: answers,
          activeGoal: selectedGoal,
          sustainabilityScore: calculateScore(baselineKg / 52),
        },
        { merge: true }
      );
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Step {step + 1} of 4</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to EcoTrack! 🌱
              </h1>
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">Let&apos;s understand your current carbon footprint.</p>
              <button className="btn-primary" onClick={() => setStep(1)}>
                Get Started
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              {questions.map(question => (
                <fieldset key={question.id} className="space-y-3">
                  <legend className="font-semibold text-gray-900 dark:text-white">{question.title}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {question.options.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => chooseAnswer(question.id, option)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors text-left ${
                          answers[question.id] === option
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
                            : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
              <button className="btn-primary" onClick={() => setStep(2)}>
                See Baseline
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-5 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your estimated annual footprint is {yearlyTonne} tonnes CO₂</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  This is equivalent to driving about {(baselineKg * 4.5).toFixed(0)} km by car.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  That&apos;s roughly the impact of {(baselineKg / 8.4).toFixed(1)} return flights from Hyderabad to Delhi.
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">India avg</p>
                    <p className="font-bold">1.9 t</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">You</p>
                    <p className="font-bold">{yearlyTonne} t</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">World avg</p>
                    <p className="font-bold">4.8 t</p>
                  </div>
                </div>
              </div>
              <button className="btn-primary" onClick={() => setStep(3)}>
                Set Goal
              </button>
            </div>
          )}

          {isFinalStep && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Let&apos;s set your first reduction goal</h2>
              <div className="grid gap-3">
                {goalOptions.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSelectedGoal(goal)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium text-left transition-colors ${
                      selectedGoal === goal
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
                        : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <button onClick={() => void saveAndContinue()} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Start Tracking! 🚀'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{step === 2 ? 'Baseline comparison' : step === 3 ? 'Goal selection' : 'Welcome'}</span>
            <button
              type="button"
              onClick={() => setStep(prev => (prev > 0 ? ((prev - 1) as Step) : prev))}
              className="inline-flex items-center gap-2 hover:text-emerald-600"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
