import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, Bike, Utensils, Zap, Droplets, ShoppingBag, Bird } from 'lucide-react';

const reductionItems = [
  { icon: Bike, title: 'Use less driving', description: 'Short trips add up quickly. Walking and cycling save the most on everyday emissions.' },
  { icon: Utensils, title: 'Eat lighter meals', description: 'Plant-based meals are usually much lower carbon than beef-heavy meals.' },
  { icon: Zap, title: 'Cut energy waste', description: 'Switch off unused lights, devices, and appliances to reduce hidden emissions.' },
  { icon: Droplets, title: 'Save water', description: 'Water pumping and treatment uses energy, so saving water also saves carbon.' },
  { icon: ShoppingBag, title: 'Buy less often', description: 'Buying fewer new items reduces manufacturing and shipping emissions.' },
];

const funFacts = [
  'A small lifestyle change repeated daily can beat a big change done once.',
  'Transport, food, and electricity are usually the biggest footprint drivers.',
  'The best carbon action is the one you can keep doing consistently.',
];

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Leaf className="w-4 h-4 text-emerald-500" />
            Learn Eco Basics
          </div>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white">What is a carbon footprint?</h1>
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            A carbon footprint is the total amount of greenhouse gases created by the things we do in daily life.
            This includes how we travel, what we eat, how much energy we use, and what we buy. The more fuel,
            electricity, and manufacturing involved, the bigger the footprint.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            Understanding your footprint helps you spot the biggest changes you can make first. EcoTrack turns
            the numbers into simple actions so reducing emissions feels practical instead of overwhelming.
          </p>
        </header>

        <section className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why it matters</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            Carbon emissions trap heat in the atmosphere and contribute to global warming. Small changes,
            repeated consistently, can reduce the harm while also saving money and resources.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            The goal is not perfection. It is progress, awareness, and building habits that are easier to keep
            than to break.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top 5 ways to reduce</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {reductionItems.map(item => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="card p-5 flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-6">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fun facts</h2>
          <ul className="space-y-3">
            {funFacts.map(fact => (
              <li key={fact} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <Bird className="w-5 h-5 text-emerald-500 mt-0.5" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
