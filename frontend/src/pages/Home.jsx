import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Stethoscope,
  HeartPulse,
  CloudRain,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  Activity,
  Search,
  BarChart3,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import StatCounter from '../components/ui/StatCounter';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const features = [
  {
    icon: Stethoscope,
    title: 'Symptom Checker',
    subtitle: 'Feeling unwell?',
    description:
      "Tell us what you're experiencing, and our AI will help you understand what might be going on. No medical jargon needed -- just pick your symptoms from a simple list.",
    link: '/symptoms',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-100',
    cta: 'Check Symptoms',
  },
  {
    icon: HeartPulse,
    title: 'Health Risk Assessment',
    subtitle: 'Know your numbers',
    description:
      'Enter basic health metrics like blood pressure, BMI, or glucose levels, and get a personalized risk breakdown for diabetes, heart disease, and stroke.',
    link: '/risk',
    lightColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-100',
    cta: 'Assess My Risk',
  },
  {
    icon: CloudRain,
    title: 'Weather Disease Alerts',
    subtitle: 'Stay one step ahead',
    description:
      "Heading somewhere tropical? Check if current weather conditions put you at risk for dengue, malaria, or chikungunya -- before you pack your bags.",
    link: '/weather',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-100',
    cta: 'Check Weather Risk',
  },
];

const howItWorks = [
  {
    step: 1,
    icon: Search,
    title: 'Tell us how you feel',
    description: 'Select symptoms, enter health data, or provide weather conditions for your area.',
  },
  {
    step: 2,
    icon: Brain,
    title: 'AI does the heavy lifting',
    description: 'Our ensemble ML models (Random Forest + Gradient Boosting) analyze your input in real time.',
  },
  {
    step: 3,
    icon: BarChart3,
    title: 'Get clear, actionable results',
    description: 'Receive predictions with confidence scores, risk factors, and personalized recommendations.',
  },
];

const stats = [
  { value: '41+', label: 'Diseases covered', icon: Activity },
  { value: '130+', label: 'Symptoms recognized', icon: CheckCircle2 },
  { value: '95%+', label: 'Model accuracy', icon: Sparkles },
  { value: '<1s', label: 'Prediction speed', icon: Clock },
];

export default function Home() {
  const greeting = getGreeting();

  return (
    <div>
      <Helmet>
        <title>Disease Prediction System — AI-Powered Disease Prediction</title>
        <meta name="description" content="AI-powered health assistant: symptom checker, risk assessment, and weather-based disease alerts." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <Activity className="h-4 w-4" aria-hidden="true" />
              {greeting} -- let's check on your health
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Your health questions,
              <br />
              <span className="text-primary-200">answered by AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              Not sure what's going on with your body? Disease Prediction System helps you make sense
              of symptoms, understand your risk factors, and stay informed about
              weather-related diseases -- all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/symptoms" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                Check My Symptoms <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all duration-200"
              >
                How Does It Work?
              </Link>
            </div>
            <p className="text-primary-200/60 text-sm mt-6">
              Free to use. No sign-up required. For educational purposes only.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="h-5 w-5 text-primary-500 mx-auto mb-2" aria-hidden="true" />
                  <div className="text-2xl font-extrabold text-gray-900">
                    <StatCounter value={stat.value} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="section-title">Three tools, one goal: your peace of mind</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Each module tackles a different angle of health prediction, so you
            get a fuller picture -- not just a single data point.
          </p>
        </div>

        {/* Disease Encyclopedia CTA */}
        <div className="mb-8 text-center">
          <Link to="/diseases" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Browse all 41 diseases in our encyclopedia <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className={`card block group hover:scale-[1.02] transition-transform duration-300 border-2 ${feature.borderColor} hover:shadow-lg h-full`}
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.lightColor} mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
              </div>
              <p className={`text-sm font-medium ${feature.textColor} mb-1`}>
                {feature.subtitle}
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {feature.description}
              </p>
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${feature.textColor} group-hover:gap-2.5 transition-all`}>
                {feature.cta} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-stone-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle">
              Three simple steps. No account needed. Results in under a second.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary-200 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 mb-5 relative">
                  <step.icon className="h-7 w-7" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Transparency */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="section-title">Built with care, powered by science</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            We believe health tools should be transparent. Here's what's under the hood.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              icon: Brain,
              title: 'Explainable predictions',
              description: 'Every prediction comes with a confidence score and matching symptoms, so you know exactly why the AI reached its conclusion.',
            },
            {
              icon: Shield,
              title: 'Your privacy matters',
              description: "Nothing is stored. Your health data stays in your browser and is sent to the AI only for the instant it takes to generate a prediction.",
            },
            {
              icon: Zap,
              title: 'Ensemble ML for accuracy',
              description: 'We combine Random Forest and Gradient Boosting models, then weight their predictions to minimize false positives and missed conditions.',
            },
            {
              icon: Users,
              title: 'Open source and auditable',
              description: 'Every line of code, training script, and model weight is open source. You can inspect, modify, or contribute to the project.',
            },
          ].map((h) => (
            <div key={h.title} className="card flex items-start gap-4">
              <div className="inline-flex p-3 bg-primary-50 rounded-xl shrink-0">
                <h.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{h.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{h.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Curious about your health?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            It takes less than 30 seconds. Pick your symptoms, enter a few numbers,
            or check the weather -- and let the AI do the rest.
          </p>
          <Link to="/symptoms" className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition-colors text-lg shadow-lg hover:shadow-xl">
            Get Started -- It's Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
