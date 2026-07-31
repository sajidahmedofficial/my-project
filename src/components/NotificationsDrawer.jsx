// agent-notes: { ctx: "Notifications Drawer for daily study reminders, milestones & alerts", deps: ["lucide-react"], state: "active", last: "anti@2026-07-30" }
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
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    id: 2,
    title: 'Weekly Milestone Reached 🚀',
    message: 'Congratulations! You achieved 80% completion in Microservices & Express REST APIs.',
    time: 'Yesterday',
    type: 'milestone',
    icon: CheckCircle,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 3,
    title: 'New AI Recommended Course 💡',
    message: 'Based on your gap analysis: "Docker Containerization Essentials" is now available.',
    time: '2 days ago',
    type: 'course',
    icon: BookOpen,
    color: 'text-accent-purple border-accent-purple/30 bg-accent-purple/10'
  },
  {
    id: 4,
    title: 'Certification Alert 🏆',
    message: 'Google Cloud Associate Engineer readiness score reached 88%. Ready for exam simulation.',
    time: '3 days ago',
    type: 'certification',
    icon: Award,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  }
];

export default function NotificationsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm h-full glass border-l border-card-border p-6 flex flex-col justify-between shadow-2xl text-gray-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-card-border mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-accent-purple/20 text-accent-purple">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {MOCK_NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className={`p-3.5 rounded-2xl border ${n.color} space-y-1 transition-all`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-snug">{n.message}</p>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 text-center"
        >
          Close Notifications
        </button>
      </div>
    </div>
  );
}
