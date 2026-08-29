// agent-notes: { ctx: "Main App Component with clean minimal SaaS visual design, unified navigation including AI Roleplay Simulator", deps: ["lucide-react", "./context/AuthContext", "./components/common/AIAssistantAvatar", "./components/common/CartoonDecorations", "./components/roleplay/RoleplayHub"], state: "active", last: "anti@2026-08-29" }
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
  Bell,
  LogOut,
  LogIn,
  Sparkles,
  Zap,
  Brain,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  User,
  CheckCircle2,
  Bot
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
const RoleplayHub = React.lazy(() => import('./components/roleplay/RoleplayHub'));
const SkillVerificationModal = React.lazy(() => import('./components/resume/SkillVerificationModal'));

const TabLoadingFallback = () => (
  <div className="saas-card p-12 text-center space-y-3 my-6">
    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
    <p className="text-xs font-medium text-slate-500">Loading module...</p>
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'skillgap', label: 'Skill Gap Analysis', icon: Briefcase },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText },
    { id: 'job', label: 'Job Matrix', icon: Layers },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
    { id: 'chat', label: 'Career Mentor', icon: MessageSquare },
    { id: 'projects', label: 'Project Lab', icon: Code },
    { id: 'interview', label: 'Mock Interview', icon: Award },
    { id: 'roleplay', label: 'AI Roleplay', icon: Bot },
    { id: 'coding', label: 'Coding Practice', icon: Zap },
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

    return (
      <React.Suspense fallback={<TabLoadingFallback />}>
        <div>
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
          <div className={activeTab === 'roleplay' ? 'block' : 'hidden'}>
            <RoleplayHub />
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

  // Unauthenticated Hero & Landing Section
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col justify-between relative overflow-hidden">
        <CartoonDecorations />

        {/* Minimal Navigation Header */}
        <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              SB
            </div>
            <span className="font-semibold text-slate-900 text-base tracking-tight">SkillBridge AI</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setTaskFlowMode('signup'); setIsTaskFlowAuthOpen(true); }}
              className="saas-btn-primary text-sm px-4 py-2"
            >
              Get Started
            </button>
          </div>
        </header>

        {/* Hero Content Section */}
        <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-8 relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Career & Skill Gap Intelligence</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              Bridge the gap between your skills and your dream career.
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Analyze job descriptions, assess readiness, get verified certificates, and follow personalized learning roadmaps designed for placement success.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => { setTaskFlowMode('signup'); setIsTaskFlowAuthOpen(true); }}
              className="saas-btn-primary w-full sm:w-auto px-6 py-3 text-sm font-medium gap-2"
            >
              Start Free Assessment <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { setTaskFlowMode('login'); setIsTaskFlowAuthOpen(true); }}
              className="saas-btn-secondary w-full sm:w-auto px-6 py-3 text-sm font-medium gap-2"
            >
              <LogIn className="w-4 h-4 text-slate-500" /> Sign In to Account
            </button>
          </div>

          {/* Clean Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left border-t border-slate-200/80">
            <div className="saas-card p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-medium">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">ATS Resume Optimizer</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan your resume against live job descriptions to find keyword gaps and formatting issues.
              </p>
            </div>

            <div className="saas-card p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-medium">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Skill Gap Benchmarking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compare your current skills with industry standards and target roles in real-time.
              </p>
            </div>

            <div className="saas-card p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-medium">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Curated Learning Roadmaps</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Follow structured milestone roadmaps and earn verifiable skill badges through testing.
              </p>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="max-w-6xl w-full mx-auto px-6 py-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <p>© 2026 SkillBridge AI. Professional career intelligence platform.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }} className="hover:text-slate-900">Log In</button>
            <button onClick={() => { setTaskFlowMode('signup'); setIsTaskFlowAuthOpen(true); }} className="hover:text-slate-900">Sign Up</button>
          </div>
        </footer>

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
              setActiveTab('dashboard');
            }
          }}
        />

        {/* Standard Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialTab={authModalTab}
          onStartOnboarding={() => setShowOnboarding(true)}
        />
      </div>
    );
  }

  // Authenticated App Layout
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex relative overflow-x-hidden">
      <CartoonDecorations />

      {/* Minimal SaaS Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'}`}>
        <div className="overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                SB
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-900 tracking-tight block">SkillBridge AI</span>
                <span className="text-[11px] text-slate-500 font-normal block">Career Engine</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
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
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-slate-100 bg-white space-y-2">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
            <AIAssistantAvatar size="sm" state={avatarState} onClick={() => setAvatarState('success')} />
            <div className="overflow-hidden flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-900 block truncate">
                {activeProfile.name?.split(' - ')[0] || 'User Profile'}
              </span>
              <span className="text-[11px] text-slate-500 font-normal block truncate">
                {activeProfile.careerGoal || 'Frontend Developer'}
              </span>
            </div>
            
            {isAuthenticated && (
              <button 
                onClick={logout}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full py-1.5 px-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" /> Edit Profile Setup
          </button>
        </div>
      </aside>

      {/* Main Content Wrap */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Top Header */}
        <header className="px-6 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span>SkillBridge</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-900 capitalize">{navigationItems.find(i => i.id === activeTab)?.label || 'Dashboard'}</span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 text-xs">
            {/* Placement Readiness Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Readiness: {activeProfile.scores?.placementReadiness || 81}%</span>
            </div>

            {/* Notifications Toggle */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
            </button>

            {/* User status */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-medium text-slate-700 truncate max-w-[120px] sm:max-w-none">
                {activeProfile.name?.split(' - ')[0]}
              </span>
            </div>
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

      {/* Standard Auth Modal Overlay */}
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
