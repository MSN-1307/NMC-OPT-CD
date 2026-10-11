import React, { useState } from 'react';
import { X, User, Lock, LogIn, LogOut, CheckCircle2, Shield, GraduationCap, Award } from 'lucide-react';
import type { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (profile: UserProfile) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Student' | 'Researcher' | 'Faculty'>('Student');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    onLogin({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@univ.edu`,
      role,
      avatarInitials: initials || 'CD',
      isLoggedIn: true,
    });
    onClose();
  };

  const handleQuickDemo = (demoRole: 'Student' | 'Researcher' | 'Faculty') => {
    if (demoRole === 'Student') {
      onLogin({
        name: 'Alex Chen',
        email: 'alex.chen@compiler.edu',
        role: 'Student',
        avatarInitials: 'AC',
        isLoggedIn: true,
      });
    } else if (demoRole === 'Researcher') {
      onLogin({
        name: 'Dr. Priya Nair',
        email: 'priya.nair@pim-research.org',
        role: 'Researcher',
        avatarInitials: 'PN',
        isLoggedIn: true,
      });
    } else {
      onLogin({
        name: 'Prof. Miller',
        email: 'david.miller@cdlab.edu',
        role: 'Faculty',
        avatarInitials: 'DM',
        isLoggedIn: true,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white rounded-xl text-teal-700 border border-slate-300 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {currentUser.isLoggedIn ? 'Account Profile' : 'Sign In to NMC-Opt Studio'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser.isLoggedIn ? 'Manage session & access' : 'Save experiments & export compiler logs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {currentUser.isLoggedIn ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3.5 p-4 rounded-md bg-white border border-slate-200 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {currentUser.avatarInitials}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{currentUser.name}</h3>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-teal-800 border border-teal-400 font-bold">
                    {currentUser.role} Account
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-300 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Active session: Workspace analyses and custom uploaded kernels are saved to your profile.</span>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border-2 border-rose-300 bg-white text-rose-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Demo Logins */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  1-Click Demo Profiles:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickDemo('Student')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 text-center transition-all bg-white text-xs shadow-2xs hover:shadow-xs group"
                  >
                    <GraduationCap className="w-4 h-4 mx-auto mb-1 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold block text-slate-800">Student</span>
                    <span className="text-[10px] text-slate-400">Alex Chen</span>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('Researcher')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 text-center transition-all bg-white text-xs shadow-2xs hover:shadow-xs group"
                  >
                    <Award className="w-4 h-4 mx-auto mb-1 text-teal-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold block text-slate-800">Researcher</span>
                    <span className="text-[10px] text-slate-400">Dr. Priya</span>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('Faculty')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 text-center transition-all bg-white text-xs shadow-2xs hover:shadow-xs group"
                  >
                    <Shield className="w-4 h-4 mx-auto mb-1 text-purple-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold block text-slate-800">Faculty</span>
                    <span className="text-[10px] text-slate-400">Prof. Miller</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-[11px] text-slate-400 uppercase font-semibold">Or Custom Name</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* Custom Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sam Taylor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Role / Category
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900"
                  >
                    <option value="Student">Compiler Student</option>
                    <option value="Researcher">Systems Researcher</option>
                    <option value="Faculty">Lab Instructor</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
