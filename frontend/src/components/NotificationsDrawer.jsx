// agent-notes: { ctx: "Clean minimal SaaS Notifications Drawer for study updates, reminders & alerts", deps: ["lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { Bell, X, CheckCircle, Clock, BookOpen, Award } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Daily Study Streak Active',
    message: 'Maintain your 5-day streak! Complete today\'s 45-minute TypeScript module.',
    time: '2 hours ago',
    type: 'reminder',
    icon: Clock
  },
  {
    id: 2,
    title: 'Weekly Milestone Reached',
    message: 'You achieved 80% completion in Microservices & Express REST APIs.',
    time: 'Yesterday',
    type: 'milestone',
    icon: CheckCircle
  },
  {
    id: 3,
    title: 'Recommended Course',
    message: 'Based on your gap analysis: "Docker Containerization Essentials" is available.',
    time: '2 days ago',
    type: 'course',
    icon: BookOpen
  },
  {
    id: 4,
    title: 'Readiness Milestone',
    message: 'Cloud Associate Engineer readiness score reached 88%. Ready for exam simulation.',
    time: '3 days ago',
    type: 'certification',
    icon: Award
  }
];

export default function NotificationsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="w-full max-w-sm h-full saas-card p-5 flex flex-col justify-between rounded-none shadow-modal bg-white border-l border-slate-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Notifications</h3>
                <span className="text-[11px] text-slate-500">Activity & Alerts</span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {MOCK_NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-xs text-slate-900">
                      <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="saas-btn-secondary w-full py-2 text-xs"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
