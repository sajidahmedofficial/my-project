// agent-notes: { ctx: "Cartoon Notifications Drawer for daily study reminders, milestones & alerts", deps: ["lucide-react"], state: "active", last: "anti@2026-08-21" }
import React from 'react';
import { Bell, X, CheckCircle, Clock, BookOpen, Award, Sparkles } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Daily Study Streak Active 🔥',
    message: 'Maintain your 5-day streak! Complete today\'s 45-minute TypeScript generics module.',
    time: '2 hours ago',
    type: 'reminder',
    icon: Clock,
    badgeClass: 'cartoon-badge-yellow'
  },
  {
    id: 2,
    title: 'Weekly Milestone Reached 🚀',
    message: 'Congratulations! You achieved 80% completion in Microservices & Express REST APIs.',
    time: 'Yesterday',
    type: 'milestone',
    icon: CheckCircle,
    badgeClass: 'cartoon-badge-mint'
  },
  {
    id: 3,
    title: 'New AI Recommended Course 💡',
    message: 'Based on your gap analysis: "Docker Containerization Essentials" is now available.',
    time: '2 days ago',
    type: 'course',
    icon: BookOpen,
    badgeClass: 'cartoon-badge-purple'
  },
  {
    id: 4,
    title: 'Certification Alert 🏆',
    message: 'Google Cloud Associate Engineer readiness score reached 88%. Ready for exam simulation.',
    time: '3 days ago',
    type: 'certification',
    icon: Award,
    badgeClass: 'cartoon-badge-cyan'
  }
];

export default function NotificationsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-sm h-full cartoon-card border-l-2 border-purple-500/30 p-6 flex flex-col justify-between shadow-2xl text-gray-200 bg-[#121727]/95 rounded-none md:rounded-l-3xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-purple-500/20 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>Notifications</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </h3>
                <span className="text-[10px] text-purple-300 font-bold">Daily Study Alerts</span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {MOCK_NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className="cartoon-card p-4 border-2 border-purple-500/20 space-y-1.5 bg-[#0d1220]/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-black text-xs text-white">
                      <Icon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium leading-relaxed">{n.message}</p>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="cartoon-btn cartoon-btn-purple w-full py-2.5 text-xs font-black"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
