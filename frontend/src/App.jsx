import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const RiskAssessment = lazy(() => import('./pages/RiskAssessment'));
const WeatherAlerts = lazy(() => import('./pages/WeatherAlerts'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Diseases = lazy(() => import('./pages/Diseases'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-gray-500 dark:text-gray-400 font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/symptoms" element={<SymptomChecker />} />
              <Route path="/risk" element={<RiskAssessment />} />
              <Route path="/weather" element={<WeatherAlerts />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/diseases" element={<Diseases />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
