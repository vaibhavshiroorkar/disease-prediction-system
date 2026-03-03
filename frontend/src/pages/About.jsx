import { Helmet } from 'react-helmet-async';
import {
  Brain,
  Code2,
  Database,
  Layers,
  Stethoscope,
  HeartPulse,
  CloudRain,
  Github,
  Target,
  BookOpen,
  Lightbulb,
  Heart,
} from 'lucide-react';

const techStack = [
  { icon: Code2, name: 'React 18', description: 'Modern UI with hooks & routing' },
  { icon: Layers, name: 'TailwindCSS', description: 'Utility-first responsive design' },
  { icon: Database, name: 'FastAPI', description: 'High-performance Python API' },
  { icon: Brain, name: 'scikit-learn', description: 'ML model training & inference' },
];

const models = [
  {
    icon: Stethoscope,
    name: 'Symptom-Based Prediction',
    story: "The first piece of the puzzle. Given a set of symptoms, can AI narrow down what's going on? This model uses an ensemble of Random Forest and Gradient Boosting classifiers trained on 41 diseases and 130+ symptoms. It predicts the most likely conditions and explains which symptoms matched.",
    metrics: ['41 diseases', '130+ symptoms', '~95% accuracy', 'Explainable results'],
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  {
    icon: HeartPulse,
    name: 'Health Risk Assessment',
    story: "Numbers tell stories. Your blood pressure, glucose, BMI, and cholesterol together paint a picture of your risk for diabetes, heart disease, and stroke. This module runs three independent ML models -- each trained on data modeled after real clinical datasets (Pima Indians, Cleveland, stroke prediction). It doesn't just give you a risk score -- it tells you why, and what you can do about it.",
    metrics: ['3 disease models', 'Risk factor analysis', 'Personalized tips', '89-95% accuracy'],
    color: 'bg-rose-50',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-100',
  },
  {
    icon: CloudRain,
    name: 'Weather-Based Disease Alerts',
    story: "Dengue, malaria, and chikungunya don't happen randomly -- they follow weather patterns. This multi-output classifier takes temperature, humidity, rainfall, time of year, and geography to estimate your risk for vector-borne diseases. Built on epidemiological research data about where and when these diseases thrive.",
    metrics: ['3 vector-borne diseases', '5 region types', 'Seasonal patterns', '93-95% accuracy'],
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-100',
  },
];

const learnings = [
  {
    icon: Target,
    title: 'ML pipeline design',
    description: 'End-to-end: data generation, feature engineering, model training, serialization, and serving via REST API.',
  },
  {
    icon: Brain,
    title: 'Ensemble methods',
    description: 'Combining Random Forest and Gradient Boosting with weighted averaging for better generalization.',
  },
  {
    icon: BookOpen,
    title: 'Health informatics',
    description: 'Understanding clinical parameters, disease symptomatology, and epidemiological patterns.',
  },
  {
    icon: Lightbulb,
    title: 'Responsible AI',
    description: 'Building with disclaimers, explainability, and clear communication that AI is a tool, not a doctor.',
  },
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>About | MediPredict AI</title>
        <meta name="description" content="Learn about how MediPredict AI uses machine learning to predict diseases from symptoms, health metrics, and weather data." />
      </Helmet>

      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          The Story Behind <span className="gradient-text">MediPredict AI</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          This project started with a simple question: <em>"Can machine learning
          help ordinary people make sense of health data -- without needing a medical degree?"</em>
          The result is a 3-in-1 system that covers symptoms, chronic disease risk, and weather-based alerts.
        </p>
      </div>

      {/* Why This Exists */}
      <div className="card mb-16 bg-gradient-to-r from-primary-50 to-white border-primary-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Why I built this</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          Most health AI demos predict a single disease from a handful of features. I wanted to build something
          more complete -- a system that combines multiple ML models, each tackling a different aspect of health.
          The symptom checker handles acute conditions. The risk assessor evaluates chronic disease likelihood.
          And the weather module addresses vector-borne diseases that depend on environmental factors.
          Together, they demonstrate how AI can support -- not replace -- medical judgment.
        </p>
      </div>

      {/* Architecture */}
      <div className="mb-16">
        <h2 className="section-title text-center">How it all fits together</h2>
        <p className="section-subtitle text-center">
          Full-stack application with three specialized ML pipelines
        </p>
        <div className="card bg-gradient-to-r from-gray-50 to-white">
          <pre className="text-xs sm:text-sm text-gray-600 overflow-x-auto font-mono leading-relaxed">
{`                    React Frontend (Vite + TailwindCSS)
  +-----------+   +-----------------+   +----------------+
  |  Symptom  |   |   Health Risk   |   |    Weather     |
  |  Checker  |   |   Assessment    |   |    Alerts      |
  +-----+-----+   +-------+---------+   +-------+--------+
        |                 |                     |
  ------+-----------------+---------------------+---- REST API
        |                 |                     |
  +-----v-----+   +-------v---------+   +-------v--------+
  |  Symptom  |   |   Risk Models   |   |    Weather     |
  |  Model    |   |  (3 separate)   |   |    Model       |
  |  RF + GB  |   |   RF + GB x3    |   |  Multi-Output  |
  +-----------+   +-----------------+   +----------------+
                    FastAPI Backend (Python)`}
          </pre>
        </div>
      </div>

      {/* ML Models - Deep Dive */}
      <div className="mb-16">
        <h2 className="section-title text-center">The three ML models</h2>
        <p className="section-subtitle text-center">
          Each one tells a different part of the health story
        </p>
        <div className="space-y-6">
          {models.map((model) => (
            <div key={model.name} className={`card border-2 ${model.borderColor}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${model.color} shrink-0`}>
                  <model.icon className={`h-6 w-6 ${model.iconColor}`} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{model.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{model.story}</p>
                  <div className="flex flex-wrap gap-2">
                    {model.metrics.map((m) => (
                      <span key={m} className="badge bg-gray-100 text-gray-700">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What I Learned */}
      <div className="mb-16">
        <h2 className="section-title text-center">What I learned building this</h2>
        <p className="section-subtitle text-center">
          Skills and concepts I deepened through this project
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {learnings.map((l) => (
            <div key={l.title} className="card flex items-start gap-4">
              <div className="p-3 bg-primary-50 rounded-xl shrink-0">
                <l.icon className="h-5 w-5 text-primary-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{l.title}</h3>
                <p className="text-sm text-gray-500">{l.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mb-16">
        <h2 className="section-title text-center">Tech Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <div key={tech.name} className="card text-center">
              <tech.icon className="h-8 w-8 text-primary-600 mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-bold text-gray-900">{tech.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card bg-amber-50 border-amber-200 border-2">
        <div className="flex items-start gap-3">
          <Heart className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">A word about responsibility</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              MediPredict AI is a learning project built to demonstrate machine learning in healthcare.
              It is <strong>not</strong> a medical device, and should never be used for actual diagnosis or treatment.
              The models are trained on synthetic data designed to mirror real clinical distributions --
              they're meant to teach ML concepts, not practice medicine.
              If you have health concerns, please talk to a real doctor. Always.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
