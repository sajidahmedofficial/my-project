// agent-notes: { ctx: "Clean professional SaaS AI Assistant badge with subtle status indicator", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { Sparkles, Bot, Check, AlertCircle } from 'lucide-react';

/**
 * AIAssistantAvatar: Clean minimal SaaS AI Assistant indicator
 * States: 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error'
 * Sizes: 'sm' (32px) | 'md' (40px) | 'lg' (48px) | 'xl' (64px)
 */
export default function AIAssistantAvatar({ 
  state = 'idle', 
  size = 'md', 
  interactive = true, 
  onClick = null,
  showSpeechBubble = false,
  speechText = "",
  className = "" 
}) {
  const [internalState, setInternalState] = React.useState(state);

  React.useEffect(() => {
    setInternalState(state);
  }, [state]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const handlePoke = () => {
    if (onClick) {
      onClick();
    } else {
      setInternalState('success');
      setTimeout(() => setInternalState('idle'), 2000);
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Tooltip */}
      {showSpeechBubble && speechText && (
        <div className="absolute -top-12 bg-white text-slate-800 px-3 py-1.5 rounded-lg shadow-dropdown border border-slate-200 font-medium text-xs max-w-xs z-20 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{speechText}</span>
          </div>
          {/* Tooltip caret */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-slate-200 transform rotate-45" />
        </div>
      )}

      {/* Modern SaaS Avatar Icon */}
      <div 
        onClick={interactive ? handlePoke : undefined}
        className={`relative ${sizeClasses[size]} rounded-xl bg-slate-900 text-white flex items-center justify-center border border-slate-700/50 shadow-sm transition-all duration-150 ${interactive ? 'cursor-pointer hover:bg-slate-800 active:scale-95' : ''}`}
      >
        <Bot className={`${iconSizes[size]} text-indigo-400`} />

        {/* Live Status Indicator Dot */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
          {internalState === 'thinking' || internalState === 'listening' ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border-2 border-white"></span>
            </>
          ) : internalState === 'success' ? (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
          ) : internalState === 'error' ? (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
          ) : (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
          )}
        </span>
      </div>
    </div>
  );
}
