import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle, Info, School } from 'lucide-react';
import { MMSCLogo } from '../components/MMSCLogo';

interface LoginPageProps {
  initialMode?: 'student' | 'admin';
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'student',
  onNavigate,
}) => {
  const { loginAsStudent, loginAsAdmin } = useAuth();
  const [mode, setMode] = useState<'student' | 'admin'>(initialMode);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'student') {
      if (!studentId.trim() || !password.trim()) {
        setError('Please enter both your Student ID and password.');
        setLoading(false);
        return;
      }

      const res = loginAsStudent(studentId, password);
      if (!res.success) {
        setError(res.error || 'Invalid Student ID or password. Please try again.');
        setLoading(false);
      } else {
        onNavigate('student-dashboard');
      }
    } else {
      // Admin Mode
      if (!studentId.trim() || !password.trim()) {
        setError('Please enter your Administrator ID and password.');
        setLoading(false);
        return;
      }

      const res = loginAsAdmin(studentId, password);
      if (!res.success) {
        setError(res.error || 'Invalid Administrator credentials. Please try again.');
        setLoading(false);
      } else {
        onNavigate('admin-dashboard');
      }
    }
  };

  const handleQuickDemo = (type: 'jasmine' | 'mark' | 'admin') => {
    setError(null);
    if (type === 'jasmine') {
      setMode('student');
      setStudentId('MMSC-2026-1042');
      setPassword('password123');
      const res = loginAsStudent('MMSC-2026-1042', 'password123');
      if (res.success) onNavigate('student-dashboard');
    } else if (type === 'mark') {
      setMode('student');
      setStudentId('MMSC-2026-1088');
      setPassword('password123');
      const res = loginAsStudent('MMSC-2026-1088', 'password123');
      if (res.success) onNavigate('student-dashboard');
    } else if (type === 'admin') {
      setMode('admin');
      setStudentId('LIB-ADMIN');
      setPassword('admin123');
      const res = loginAsAdmin('LIB-ADMIN', 'admin123');
      if (res.success) onNavigate('admin-dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Branding Card */}
      <div className="text-center space-y-2">
        <MMSCLogo className="w-20 h-20 mx-auto" />
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif-display">
          My Messiah School of Cavite, Inc.
        </h1>
        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
          Delas Alas Campus · Library Management System
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
        {/* Mode Selector Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('student');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'student'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Senior High Student
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mode === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Authorized Personnel
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {mode === 'student' ? 'Student ID Number' : 'Staff / Administrator ID'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={mode === 'student' ? 'e.g. MMSC-2026-1042' : 'e.g. LIB-ADMIN'}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
              />
            </div>
            {mode === 'student' && (
              <p className="text-[11px] text-slate-400 mt-1">
                Official Delas Alas Senior High School ID format: MMSC-2026-XXXX
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              {mode === 'student' && (
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-[11px] text-blue-900 hover:underline font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your confidential password"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : mode === 'student' ? 'Sign In to Student Portal' : 'Access Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials for Reviewers & Evaluators */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-blue-900" />
            <span>Research Evaluator Quick Logins:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('jasmine')}
              className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <span className="font-semibold text-slate-800 block">Jasmine Alcantara</span>
              <span className="text-slate-500 font-mono text-[10px]">STEM · Active Borrows</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('mark')}
              className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <span className="font-semibold text-slate-800 block">Mark Bautista</span>
              <span className="text-slate-500 font-mono text-[10px]">ABM · Good Standing</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="sm:col-span-2 p-2 text-center bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 rounded-md font-semibold transition-colors cursor-pointer"
            >
              Log in as Head Librarian (Mrs. Elena Santos)
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Forgot Password Assistance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For student account security and official school record integrity, student passwords are reset
              in person at the <strong>Delas Alas Campus Library Circulation Desk</strong> upon verification
              of your Senior High School student ID card.
            </p>
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-900">
              <span className="font-semibold block mb-0.5">Campus Circulation Desk:</span>
              <p>2nd Floor SHS Building, Delas Alas Campus (7:30 AM – 5:00 PM)</p>
            </div>
            <button
              onClick={() => setForgotPasswordOpen(false)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
