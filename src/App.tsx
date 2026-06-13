import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import SkeletonCard from './components/SkeletonCard';
import ErrorBoundary from './components/ErrorBoundary';
import QuickLogFAB from './components/QuickLogFAB';

// Lazy-load all page components for code splitting
const AuthPage = lazy(() => import('./pages/AuthPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LogActivity = lazy(() => import('./pages/LogActivity'));
const Insights = lazy(() => import('./pages/Insights'));
const History = lazy(() => import('./pages/History'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

function PageLoader() {
  return (
    <div className="p-6 space-y-4" aria-busy="true" aria-live="polite">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

function AuthRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  // Dark mode init
  useEffect(() => {
    const stored = localStorage.getItem('ecotrack-theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {user && <Navbar />}
      {user && <QuickLogFAB />}

      <main id="main-content" tabIndex={-1} className="outline-none">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <LandingPage />
                  )
                }
              />
            <Route
              path="/auth"
              element={
                <AuthRoute>
                  <AuthPage />
                </AuthRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn"
              element={<LearnPage />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/log"
              element={
                <ProtectedRoute>
                  <LogActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

// AuthProvider pattern — wrap with a single auth context
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
