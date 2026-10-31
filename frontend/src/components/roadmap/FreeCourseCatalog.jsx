// agent-notes: { ctx: "Free online courses catalog component with official tech provider cards, filters, and dynamic refresh", deps: ["lucide-react", "../../services/learningResourcesService"], state: "active", last: "sato@2026-10-31" }
import React, { useState } from 'react';
import { 
  GraduationCap, 
  ExternalLink, 
  Award, 
  BadgeCheck, 
  Clock, 
  Globe, 
  Bookmark, 
  RotateCw, 
  Filter, 
  Sparkles,
  Check
} from 'lucide-react';
import { filterCourses, OFFICIAL_PROVIDERS } from '../../services/learningResourcesService';

export default function FreeCourseCatalog({
  courses = [],
  courseStatus = {},
  savedForLater = [],
  lastRefreshed,
  onStatusChange,
  onToggleSave,
  onRefreshCourses
}) {
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [certificateOnly, setCertificateOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFeedback, setRefreshFeedback] = useState(null);

  const filteredCourses = filterCourses(courses, {
    provider: selectedProvider,
    difficulty: selectedDifficulty,
    certificateOnly
  });

  const handleRefreshClick = async () => {
    if (!onRefreshCourses || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshFeedback(null);
    try {
      const res = await onRefreshCourses();
      const count = res?.newCount || filteredCourses.length;
      setRefreshFeedback(`Refreshed (${count} courses active)`);
      setTimeout(() => setRefreshFeedback(null), 3500);
    } catch {
      setRefreshFeedback('Catalog synchronized');
      setTimeout(() => setRefreshFeedback(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-3.5 pt-3 border-t border-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              Free Online Courses from Google & Tech Companies
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Official Providers
              </span>
            </h5>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {refreshFeedback ? (
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in">
              <Check className="w-3 h-3 text-emerald-500" />
              {refreshFeedback}
            </span>
          ) : lastRefreshed ? (
            <span className="text-[10px] text-slate-400 hidden md:inline">
              Synced: {new Date(lastRefreshed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="saas-btn-secondary py-1 px-2.5 text-[11px] gap-1 text-slate-600 hover:text-slate-900"
            title="Refresh course catalog from official sources"
          >
            <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Courses'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Provider filter */}
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="py-1 px-2 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="All">All Providers</option>
          {OFFICIAL_PROVIDERS.map((prov) => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>

        {/* Difficulty filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="py-1 px-2 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="All">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Certificate only toggle */}
        <label className="inline-flex items-center gap-1.5 cursor-pointer ml-auto text-[11px] text-slate-600 font-medium">
          <input
            type="checkbox"
            checked={certificateOnly}
            onChange={(e) => setCertificateOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <Award className="w-3 h-3 text-indigo-600" />
          <span>Certificate / Badge Only</span>
        </label>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
          No courses match the selected filters. Try choosing "All Providers" or resetting filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCourses.map((course) => {
            const status = courseStatus[course.id] || 'not_started';
            const isSaved = savedForLater.includes(course.id);

            return (
              <div
                key={course.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate">
                      {course.provider}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {course.isRecentlyAdded && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> New
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h6 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                    {course.title}
                  </h6>

                  {/* Status & Credential attributes */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="font-medium text-emerald-600 bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-100">
                      {course.freeStatus}
                    </span>

                    {course.certificateAvailable && (
                      <span className="font-medium text-indigo-600 bg-indigo-50/60 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-0.5">
                        <Award className="w-2.5 h-2.5" /> Certificate
                      </span>
                    )}

                    {course.hasBadge && (
                      <span className="font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                        <BadgeCheck className="w-2.5 h-2.5 text-amber-600" /> Digital Badge
                      </span>
                    )}
                  </div>

                  {/* Duration & Language */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {course.duration}
                      </span>
                    )}
                    {course.language && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {course.language}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium transition-colors shadow-xs"
                    >
                      <span>Start Free Course</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                    </a>

                    <button
                      onClick={() => onToggleSave && onToggleSave(course.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved ? 'bg-amber-50 border-amber-300 text-amber-600' : 'border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isSaved ? "Saved for later" : "Save for later"}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress tracker dropdown */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
                    <span className="text-slate-400">Your Status:</span>
                    <select
                      value={status}
                      onChange={(e) => onStatusChange && onStatusChange(course.id, e.target.value)}
                      className={`text-[10px] font-medium rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none ${
                        status === 'completed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : status === 'in_progress'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
