// agent-notes: { ctx: "Main App Component with AuthProvider, TaskFlowAuth, AuthModal & Navigation including SkillGapAnalysis", deps: ["lucide-react", "./context/AuthContext", "./components/TaskFlowAuth", "./components/AuthModal", "./components/SkillGapAnalysis"], state: "active", last: "anti@2026-08-06" }
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Map, 
  MessageSquare, 
  Award, 
  Code,
  Menu,
  X,
  GraduationCap,
  Bell,
  LogOut,
  LogIn,
  Sparkles,
  Zap,
  Brain
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import TaskFlowAuth from './components/TaskFlowAuth';
import OnboardingWizard from './components/OnboardingWizard';
import NotificationsDrawer from './components/NotificationsDrawer';

import Dashboard from './components/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobAnalyzer from './components/JobAnalyzer';
import SkillGapAnalysis from './components/SkillGapAnalysis';
import LearningRoadmap from './components/LearningRoadmap';
import CareerMentor from './components/CareerMentor';
import ProjectRecommender from './components/ProjectRecommender';
import MockInterview from './components/MockInterview';
import CodingPractice from './components/CodingPractice';
import AptitudeDashboard from './components/aptitude/AptitudeDashboard';

import { RESUME_PRESETS } from './utils/mockData';

function MainLayout() {
  const { currentUser, isAuthenticated, isOnboarded, logout, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [missingSkillsList, setMissingSkillsList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals & Overlays
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isTaskFlowAuthOpen, setIsTaskFlowAuthOpen] = useState(false);
  const [taskFlowMode, setTaskFlowMode] = useState('signup');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const activeProfile = currentUser || RESUME_PRESETS[0];

  const handleProfileChange = (newProfile) => {
    updateProfile(newProfile);
  };

  const handleGenerateRoadmap = (missingSkills) => {
    setMissingSkillsList(missingSkills);
    setActiveTab('roadmap');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText },
    { id: 'job', label: 'Job & Skill Gap', icon: Briefcase },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
    { id: 'chat', label: 'Career Mentor', icon: MessageSquare },
    { id: 'projects', label: 'Project Recommendations', icon: Code },
    { id: 'interview', label: 'Mock Interview', icon: Award },
    { id: 'coding', label: 'Coding Practice', icon: Code },
    { id: 'aptitude', label: 'Aptitude Practice', icon: Brain }
  ];

  const renderActiveView = () => {
    if (showOnboarding || (!isOnboarded && isAuthenticated)) {
      return (
        <OnboardingWizard 
          onComplete={() => {
            setShowOnboarding(false);
            setActiveTab('dashboard');
          }} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            profile={activeProfile} 
            setProfile={handleProfileChange} 
            onNavigate={setActiveTab} 
          />
        );
      case 'resume':
        return (
          <ResumeAnalyzer 
            profile={activeProfile} 
            setProfile={handleProfileChange} 
            onNavigate={setActiveTab}
          />
        );
      case 'job':
        return (
          <JobAnalyzer 
            profile={activeProfile}
            onGenerateRoadmap={handleGenerateRoadmap}
            onNavigate={setActiveTab}
          />
        );
      case 'roadmap':
        return (
          <LearningRoadmap 
            profile={activeProfile} 
            missingSkillsList={missingSkillsList} 
          />
        );
      case 'chat':
        return (
          <CareerMentor 
            profile={activeProfile} 
          />
        );
      case 'projects':
        return (
          <ProjectRecommender 
            profile={activeProfile} 
          />
        );
      case 'interview':
        return (
          <MockInterview 
            profile={activeProfile} 
            setProfile={handleProfileChange} 
            onNavigate={setActiveTab}
          />
        );
      case 'coding':
        return (
          <CodingPractice 
            profile={activeProfile} 
          />
        );
      case 'aptitude':
        return (
          <AptitudeDashboard />
        );
      default:
        return <Dashboard profile={activeProfile} setProfile={handleProfileChange} onNavigate={setActiveTab} />;
    }
  };

  // Gatekeeper: If user is not authenticated, require Task Flow login/signup first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-dark text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-pink/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Hero Card */}
        <div className="max-w-xl w-full glass border border-card-border rounded-3xl p-8 text-center space-y-6 shadow-2xl z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-pink flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-accent-purple/40">
            SB
          </div>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide mb-2">Welcome to SkillBridge AI</h1>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              Your AI-powered career placement engine & personalized learning roadmap platform.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" /> Mandatory Task Flow Auth Enabled
            </div>
            <p className="text-gray-400 leading-normal">
              Please complete the Task Flow Login or Sign Up process below to unlock your dashboard, resume analyzer, learning roadmaps, and mock interview tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => { setTaskFlowMode('signup'); setIsTaskFlowAuthOpen(true); }}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-current" /> Start Task Flow Sign Up
            </button>

            <button
              onClick={() => { setTaskFlowMode('login'); setIsTaskFlowAuthOpen(true); }}
              className="flex-1 py-3 px-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-accent-purple text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:bg-gray-800"
            >
              <LogIn className="w-4 h-4 text-accent-purple" /> User Sign In
            </button>
          </div>
        </div>

        {/* Task Flow Modal */}
        <TaskFlowAuth 
          isOpen={isTaskFlowAuthOpen} 
          onClose={() => setIsTaskFlowAuthOpen(false)} 
          initialMode={taskFlowMode}
          onComplete={() => setShowOnboarding(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-gray-200 flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-card-border flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Brand Logo Header */}
          <div className="px-6 py-5 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-pink flex items-center justify-center text-white font-extrabold shadow-md shadow-accent-purple/35">
                SB
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-wide block">SkillBridge AI</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Placement Engine</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded bg-gray-800 text-gray-400 hover:text-white md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !showOnboarding;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setShowOnboarding(false);
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${isActive ? 'bg-gradient-to-r from-accent-purple/20 to-accent-pink/10 text-white border-l-2 border-accent-purple' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 bg-transparent'}`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-accent-purple' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-card-border bg-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-purple/40 to-accent-pink/40 border border-accent-purple/30 flex items-center justify-center text-white font-bold shrink-0 text-xs">
                {activeProfile.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-bold text-white block truncate leading-none">{activeProfile.name?.split(' - ')[0] || 'Student'}</span>
                <span className="text-[9px] text-accent-purple block truncate mt-1 font-semibold">{activeProfile.careerGoal || 'Placement Prep'}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                className="p-1.5 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple hover:text-white transition-all text-xs font-bold"
                title="Sign In"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full py-1.5 px-2 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-accent-purple text-[10px] font-bold text-gray-400 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3 h-3 text-accent-purple" /> Edit Student Onboarding
          </button>
        </div>
      </aside>

      {/* Main Body Wrap */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="px-6 py-4 glass border-b border-card-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <GraduationCap className="w-4 h-4 text-accent-purple" />
              <span>Academic Year 2026-27</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 text-xs">
            {/* Notifications Toggle Button */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-accent-purple text-gray-400 hover:text-white relative transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-pink animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-pink"></span>
            </button>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setTaskFlowMode('signup'); setIsTaskFlowAuthOpen(true); }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-xs shadow-md shadow-purple-600/25 flex items-center gap-1.5 animate-pulse"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" /> Task Flow Auth
                </button>
                <button
                  onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                  className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthModalTab('register'); setIsAuthModalOpen(true); }}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold text-xs"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Authenticated
                </span>
                <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-none">
                  {activeProfile.name?.split(' - ')[0]} ({activeProfile.scores?.placementReadiness || 80}% Ready)
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Task Flow Auth Overlay */}
      <TaskFlowAuth 
        isOpen={isTaskFlowAuthOpen} 
        onClose={() => setIsTaskFlowAuthOpen(false)} 
        initialMode={taskFlowMode}
        onComplete={() => setShowOnboarding(true)}
      />

      {/* Legacy/Standard Auth Modal Overlay */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialTab={authModalTab}
        onStartOnboarding={() => setShowOnboarding(true)}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
