// agent-notes: { ctx: "Main App Component redesigned with modern interactive cartoon visual style, Sparky avatar integration & playful navigation", deps: ["lucide-react", "./context/AuthContext", "./components/common/AIAssistantAvatar", "./components/common/CartoonDecorations"], state: "active", last: "anti@2026-08-25" }
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
  Brain,
  Layers,
  Star,
  Trophy,
  Flame,
  ChevronRight
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import TaskFlowAuth from './components/TaskFlowAuth';
import OnboardingWizard from './components/OnboardingWizard';
import NotificationsDrawer from './components/NotificationsDrawer';
import AIAssistantAvatar from './components/common/AIAssistantAvatar';
import CartoonDecorations from './components/common/CartoonDecorations';

import Dashboard from './components/Dashboard';

// Dynamic lazy route imports for optimal bundle splitting
const ResumeAnalyzer = React.lazy(() => import('./pages/ResumeAnalyzer'));
const JobAnalyzer = React.lazy(() => import('./components/JobAnalyzer'));
const SkillGapDashboard = React.lazy(() => import('./components/SkillGapDashboard'));
const LearningRoadmap = React.lazy(() => import('./components/LearningRoadmap'));
const CareerMentor = React.lazy(() => import('./components/CareerMentor'));
const ProjectRecommender = React.lazy(() => import('./components/ProjectRecommender'));
const MockInterview = React.lazy(() => import('./components/MockInterview'));
const CodingPractice = React.lazy(() => import('./components/CodingPractice'));
const AptitudeDashboard = React.lazy(() => import('./components/aptitude/AptitudeDashboard'));
const SkillVerificationModal = React.lazy(() => import('./components/resume/SkillVerificationModal'));

const TabLoadingFallback = () => (
  <div className="cartoon-card p-12 text-center space-y-4 my-6">
    <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto" />
    <p className="text-xs font-black text-purple-300">Loading module...</p>
  </div>
);

import { RESUME_PRESETS } from './utils/mockData';

function MainLayout() {
  const { currentUser, isAuthenticated, isOnboarded, logout, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [missingSkillsList, setMissingSkillsList] = useState([]);
  const [targetRole, setTargetRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalVerifyingSkill, setGlobalVerifyingSkill] = useState(null);
  const [avatarState, setAvatarState] = useState('idle');

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

  const handleGenerateRoadmap = (missingSkills, role) => {
    setMissingSkillsList(missingSkills || []);
    if (role) {
      setTargetRole(role);
    }
    setActiveTab('roadmap');
  };

  const handleOpenGlobalVerification = (skillName) => {
    setGlobalVerifyingSkill(skillName);
  };

  const handleCompleteGlobalVerification = ({ skillName, certificateCode, score }) => {
    const updatedSkills = Array.from(new Set([...(activeProfile.skills || []), skillName]));
    const updatedCertificates = [
      ...(activeProfile.certificates || []),
      { skillName, certificateCode, score: score || 95, date: new Date().toLocaleDateString() }
    ];
    handleProfileChange({
      ...activeProfile,
      skills: updatedSkills,
      certificates: updatedCertificates
    });
    setGlobalVerifyingSkill(null);
    setActiveTab('resume');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { id: 'skillgap', label: 'Skill Gap Hub', icon: Briefcase, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { id: 'job', label: 'Job Matrix', icon: Layers, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Map, color: 'text-mint-400', bg: 'bg-emerald-500/20' },
    { id: 'chat', label: 'Career Mentor & Voice', icon: MessageSquare, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20' },
    { id: 'projects', label: 'Project Lab', icon: Code, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: 'interview', label: 'Mock Interview', icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { id: 'coding', label: 'Coding Practice', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { id: 'aptitude', label: 'Aptitude Practice', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/20' }
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

    return (
      <React.Suspense fallback={<TabLoadingFallback />}>
        <div className="transition-all duration-300">
        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          <Dashboard 
            profile={activeProfile} 
            setProfile={handleProfileChange} 
            onNavigate={setActiveTab} 
            onOpenVerification={handleOpenGlobalVerification}
          />
        </div>
        <div className={activeTab === 'skillgap' ? 'block' : 'hidden'}>
          <SkillGapDashboard 
            profile={activeProfile} 
            onGenerateRoadmap={handleGenerateRoadmap} 
            onNavigate={setActiveTab} 
            onOpenVerification={handleOpenGlobalVerification}
          />
        </div>
        <div className={activeTab === 'resume' ? 'block' : 'hidden'}>
          <ResumeAnalyzer 
            profile={activeProfile} 
            setProfile={handleProfileChange} 
            onNavigate={setActiveTab}
          />
        </div>
        <div className={activeTab === 'job' ? 'block' : 'hidden'}>
          <JobAnalyzer 
            profile={activeProfile}
            onGenerateRoadmap={handleGenerateRoadmap}
            onNavigate={setActiveTab}
            onOpenVerification={handleOpenGlobalVerification}
          />
        </div>
        <div className={activeTab === 'roadmap' ? 'block' : 'hidden'}>
          <LearningRoadmap 
            profile={activeProfile} 
            missingSkillsList={missingSkillsList} 
            targetRole={targetRole || activeProfile?.careerGoal || "Frontend Developer"}
            onOpenVerification={handleOpenGlobalVerification}
          />
        </div>
        <div className={activeTab === 'chat' ? 'block' : 'hidden'}>
          <CareerMentor 
            profile={activeProfile} 
          />
        </div>
        <div className={activeTab === 'projects' ? 'block' : 'hidden'}>
          <ProjectRecommender 
            profile={activeProfile} 
          />
        </div>
        <div className={activeTab === 'interview' ? 'block' : 'hidden'}>
          <MockInterview 
            profile={activeProfile} 
            setProfile={handleProfileChange} 
            onNavigate={setActiveTab}
          />
        </div>
        <div className={activeTab === 'coding' ? 'block' : 'hidden'}>
          <CodingPractice 
            profile={activeProfile} 
          />
        </div>
        <div className={activeTab === 'aptitude' ? 'block' : 'hidden'}>
          <AptitudeDashboard />
        </div>
      </div>
      </React.Suspense>
    );
  };

  // Gatekeeper: If user is not authenticated, require Task Flow login/signup first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <CartoonDecorations />

        {/* Hero Cartoon Card */}
        <div className="max-w-xl w-full cartoon-card p-8 md:p-10 text-center space-y-6 relative z-10 animate-fade-in">
          {/* Avatar Icon */}
          <div className="flex justify-center">
            <AIAssistantAvatar 
              size="lg" 
              state="speaking" 
              showSpeechBubble={true} 
              speechText="Hi friend! Let's get started!" 
            />
          </div>
          
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide mb-2 flex items-center justify-center gap-2">
              <span>SkillBridge AI</span>
              <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              Your playful AI-powered career assistant & interactive placement roadmap platform!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/40 border-2 border-purple-500/30 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-yellow-300 font-extrabold text-sm">
              <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 
              <span>Interactive Task Flow Sign In</span>
            </div>
            <p className="text-gray-300 leading-normal font-medium">
              Log in or register to unlock your personalized cartoon dashboard, AI resume builder, skill gap challenges, and mock interviews!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => { setTaskFlowMode('signup'); setIsTaskFlowAuthOpen(true); }}
              className="cartoon-btn cartoon-btn-purple flex-1 py-3 px-5 text-sm font-bold gap-2"
            >
              <Zap className="w-4 h-4 fill-current" /> Start Sign Up
            </button>

            <button
              onClick={() => { setTaskFlowMode('login'); setIsTaskFlowAuthOpen(true); }}
              className="cartoon-btn cartoon-btn-dark flex-1 py-3 px-5 text-sm font-bold gap-2"
            >
              <LogIn className="w-4 h-4 text-purple-400" /> User Sign In
            </button>
          </div>

          {/* Quick Demo Access */}
          <div className="pt-2 border-t border-purple-500/20">
            <button
              onClick={async () => {
                try {
                  const { login } = useAuth; // hook in scope
                } catch {}
                setTaskFlowMode('login');
                setIsTaskFlowAuthOpen(true);
              }}
              className="text-xs text-purple-300 hover:text-white font-bold flex items-center justify-center gap-1.5 mx-auto py-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Open Guided Task Flow Authentication
            </button>
          </div>
        </div>

        {/* Task Flow Modal */}
        <TaskFlowAuth 
          isOpen={isTaskFlowAuthOpen} 
          onClose={() => setIsTaskFlowAuthOpen(false)} 
          initialMode={taskFlowMode}
          onComplete={(completedMode) => {
            if (completedMode === 'signup') {
              setShowOnboarding(true);
            } else {
              setShowOnboarding(false);
              setActiveTab('dashboard');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex relative overflow-x-hidden">
      {/* Background Cartoon Shapes */}
      <CartoonDecorations />

      {/* Cartoon Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#121727]/95 border-r-2 border-purple-500/20 backdrop-blur-xl flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="px-6 py-5 border-b-2 border-purple-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/40 border-2 border-white/20 transform -rotate-3 hover:rotate-0 transition-transform">
                SB
              </div>
              <div>
                <span className="font-black text-base text-white tracking-wide block flex items-center gap-1.5">
                  SkillBridge
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </span>
                <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-wider block">
                  Cartoon AI Career Engine
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white md:hidden border border-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all group ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border-2 border-purple-300/40 translate-x-1' 
                      : 'text-gray-300 hover:text-white hover:bg-purple-900/20 hover:translate-x-1'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Animated Sparky Avatar */}
        <div className="p-4 border-t-2 border-purple-500/10 bg-[#0d1220]/80 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/20">
            <AIAssistantAvatar size="sm" state={avatarState} onClick={() => setAvatarState('success')} />
            <div className="overflow-hidden flex-1">
              <span className="text-xs font-black text-white block truncate">
                {activeProfile.name?.split(' - ')[0] || 'Student'}
              </span>
              <span className="text-[10px] text-purple-300 font-bold block truncate flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                Level 4 Scholar
              </span>
            </div>
            
            {isAuthenticated && (
              <button 
                onClick={logout}
                className="p-2 rounded-xl bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-gray-700 transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full py-2 px-3 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 border-2 border-purple-500/30 text-xs font-bold text-purple-200 hover:text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Edit Profile Wizard
          </button>
        </div>
      </aside>

      {/* Main Body Wrap */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Header */}
        <header className="px-6 py-4 bg-[#121727]/80 backdrop-blur-md border-b-2 border-purple-500/10 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-2xl bg-gray-800 border-2 border-gray-700 text-gray-300 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Sparky Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border-2 border-purple-500/30 text-xs font-bold text-purple-200">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Sparky AI Assistant Active</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 text-xs">
            {/* Gamified Placement Readiness Pill */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-pink-500/30">
              <Trophy className="w-4 h-4 text-yellow-400 animate-bounce" />
              <span className="font-extrabold text-white">
                {activeProfile.scores?.placementReadiness || 81}% Ready
              </span>
            </div>

            {/* Notifications Toggle Button */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2.5 rounded-2xl bg-gray-900 border-2 border-purple-500/20 hover:border-purple-500/50 text-gray-300 hover:text-white relative transition-all hover:scale-105"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 border border-white"></span>
            </button>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setTaskFlowMode('signup'); setIsTaskFlowAuthOpen(true); }}
                  className="cartoon-btn cartoon-btn-purple py-2 px-4 text-xs font-bold gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" /> Sign Up
                </button>
                <button
                  onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                  className="cartoon-btn cartoon-btn-dark py-2 px-3 text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-900/80 border-2 border-purple-500/20 px-3.5 py-1.5 rounded-2xl">
                <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </span>
                <span className="text-white font-bold truncate max-w-[120px] sm:max-w-none text-xs">
                  {activeProfile.name?.split(' - ')[0]}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Task Flow Auth Overlay */}
      <TaskFlowAuth 
        isOpen={isTaskFlowAuthOpen} 
        onClose={() => setIsTaskFlowAuthOpen(false)} 
        initialMode={taskFlowMode}
        onComplete={(completedMode) => {
          if (completedMode === 'signup') {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
          }
        }}
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

      {/* Global Skill Verification Modal */}
      {globalVerifyingSkill && (
        <React.Suspense fallback={null}>
          <SkillVerificationModal
            skillName={globalVerifyingSkill}
            onClose={() => setGlobalVerifyingSkill(null)}
            onCompleteVerification={handleCompleteGlobalVerification}
          />
        </React.Suspense>
      )}
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
