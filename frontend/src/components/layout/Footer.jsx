import { Link } from 'react-router-dom';
import { Activity, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 hidden md:block" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary-600 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Medi<span className="text-primary-400">Predict</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              An AI-powered health assistant that helps you understand symptoms,
              evaluate risk factors, and stay aware of weather-related diseases.
              Built as a learning project to explore ML in healthcare.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/symptoms" className="hover:text-white transition-colors">Check your symptoms</Link></li>
              <li><Link to="/risk" className="hover:text-white transition-colors">Assess health risk</Link></li>
              <li><Link to="/weather" className="hover:text-white transition-colors">Weather disease alerts</Link></li>
              <li><Link to="/diseases" className="hover:text-white transition-colors">Disease encyclopedia</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard & history</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">How it works</Link></li>
            </ul>
          </nav>

          {/* Built With */}
          <div>
            <h3 className="text-white font-semibold mb-4">Built With</h3>
            <ul className="space-y-2 text-sm">
              <li>React 18 + TailwindCSS</li>
              <li>FastAPI + Python</li>
              <li>scikit-learn (RF + Gradient Boosting)</li>
              <li>Docker + Vite</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-red-400" aria-hidden="true" /> for learning.
            &copy; {new Date().getFullYear()} MediPredict AI.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5 text-sm"
              aria-label="View source code on GitHub"
            >
              <Github className="h-4 w-4" aria-hidden="true" /> Source Code
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs text-gray-500 text-center">
            This is an educational project, not a medical tool. It should never replace
            professional medical advice. If you have real health concerns, please see a doctor.
          </p>
        </div>
      </div>
    </footer>
  );
}
