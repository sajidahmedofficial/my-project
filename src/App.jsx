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
  User,
  GraduationCap
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import JobAnalyzer from './components/JobAnalyzer';
import LearningRoadmap from './components/LearningRoadmap';
import CareerMentor from './components/CareerMentor';
import ProjectRecommender from './components/ProjectRecommender';
import MockInterview from './components/MockInterview';

import { RESUME_PRESETS } from './utils/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(RESUME_PRESETS[0]); // Default to Aarav Sharma
  const [missingSkillsList, setMissingSkillsList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync profile when preset is selected in ResumeAnalyzer
  const handleProfileChange = (newProfile) => {
    setProfile(newProfile);
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
    { id: 'interview', label: 'Mock Interview', icon: Award }
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            profile={profile} 
            setProfile={handleProfileChange} 
            onNavigate={setActiveTab} 
          />
        );
      case 'resume':
        return (
          <ResumeAnalyzer 
            profile={profile} 
            setProfile={handleProfileChange} 
          />
        );
      case 'job':
        return (
          <JobAnalyzer 
            profile={profile} 
            onGenerateRoadmap={handleGenerateRoadmap} 
          />
        );
      case 'roadmap':
        return (
          <LearningRoadmap 
            profile={profile} 
            missingSkillsList={missingSkillsList} 
          />
        );
      case 'chat':
        return (
          <CareerMentor 
            profile={profile} 
          />
        );
      case 'projects':
        return (
          <ProjectRecommender 
            profile={profile} 
          />
        );
      case 'interview':
        return (
          <MockInterview 
            profile={profile} 
            setProfile={handleProfileChange} 
          />
        );
      default:
        return <Dashboard profile={profile} setProfile={handleProfileChange} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-gray-200 flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-card-border flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
            
            {/* Close sidebar button mobile */}
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
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
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
        <div className="p-4 border-t border-card-border bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-white block truncate leading-none">{profile.name.split(' - ')[0]}</span>
              <span className="text-[9px] text-gray-400 block truncate mt-1">Ready for placement</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Body Wrap */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="px-6 py-4 glass border-b border-card-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <GraduationCap className="w-4 h-4 text-accent-purple" />
              <span>Academic Year 2026-27</span>
            </div>
          </div>

          {/* Quick switcher preview */}
          <div className="flex items-center gap-3 text-xs bg-gray-900/60 border border-gray-800 px-3.5 py-1.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Demo Profile:</span>
            <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-none">
              {profile.name.split(' - ')[0]} ({profile.scores.placementReadiness}% Ready)
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
