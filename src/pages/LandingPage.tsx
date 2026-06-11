import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, ChartColumn, Target, Leaf, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const features = [
  { icon: BrainCircuit, title: 'AI-Powered Insights', description: 'Gemini turns your activity data into simple next steps.' },
  { icon: ChartColumn, title: 'Real-time Tracking', description: 'See your emissions, streaks, and progress in one place.' },
  { icon: Target, title: 'Personal Goals', description: 'Set goals that fit your lifestyle and keep improving.' },
];

const steps = [
  'Sign in with Google',
  'Log your daily activities',
  'Reduce your footprint with AI guidance',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-gray-900/80 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-4 h-4" />
              Built for Prompt Wars by Google x Hack2Skill
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-950 dark:text-white">
                Track Your Carbon Footprint.
                <span className="block text-emerald-600 dark:text-emerald-400">Save The Planet.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-xl">
                EcoTrack uses AI to help you understand and reduce your environmental impact, one simple action at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="btn-primary px-6 py-3 text-base"
              >
                Start For Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/learn" className="btn-secondary px-6 py-3 text-base">
                Learn More
              </Link>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Google Sign-In, Firebase, Gemini AI, Maps, and Firestore
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <div className="card p-6 sm:p-8 shadow-2xl bg-white/90 dark:bg-gray-900/90">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Live eco progress</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Join thousands of eco-warriors</h2>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['2,400+', 'users'],
                  ['45 tonnes', 'saved'],
                  ['12,000+', 'activities'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{value}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="card p-6">
                <Icon className="w-6 h-6 text-emerald-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <article key={step} className="card p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Step {index + 1}</p>
                <h3 className="font-semibold text-gray-900 dark:text-white">{step}</h3>
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          Built for Prompt Wars by Google x Hack2Skill
        </footer>
      </section>
    </main>
  );
}
