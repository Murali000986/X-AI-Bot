import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Overview from './pages/Overview';
import Users from './pages/Users';
import Conversations from './pages/Conversations';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Requests from './pages/Requests';
import Health from './pages/Health';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc] text-slate-900 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/"         element={<ProtectedRoute><Layout><Overview      /></Layout></ProtectedRoute>} />
            <Route path="/users"    element={<ProtectedRoute><Layout><Users         /></Layout></ProtectedRoute>} />
            <Route path="/search"   element={<ProtectedRoute><Layout><Conversations /></Layout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Layout><Requests      /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings      /></Layout></ProtectedRoute>} />
            <Route path="/analytics"element={<ProtectedRoute><Layout><Analytics     /></Layout></ProtectedRoute>} />
            <Route path="/health"   element={<ProtectedRoute><Layout><Health        /></Layout></ProtectedRoute>} />
            {/* Legacy redirects */}
            <Route path="/conversations" element={<Navigate to="/search"   replace />} />
            <Route path="/requests"      element={<Navigate to="/messages" replace />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

