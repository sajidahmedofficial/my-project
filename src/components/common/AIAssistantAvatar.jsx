// agent-notes: { ctx: "Interactive cartoon AI Assistant Character avatar with animated expressive states", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-21" }
import React from 'react';
import { Sparkles, Zap, Heart, Star, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

/**
 * AIAssistantAvatar: Modern interactive cartoon robot companion ("Sparky / BridgeBot")
 * States: 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error'
 * Sizes: 'sm' (48px) | 'md' (80px) | 'lg' (120px) | 'xl' (160px)
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
  const [isHovered, setIsHovered] = React.useState(false);
  const [internalState, setInternalState] = React.useState(state);

  React.useEffect(() => {
    setInternalState(state);
  }, [state]);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-44 h-44"
  };

  const handlePoke = () => {
    if (onClick) {
      onClick();
    } else {
      setInternalState('success');
      setTimeout(() => setInternalState('idle'), 2000);
    }
  };

  // State-based accent color
  const stateColors = {
    idle: "from-purple-500 to-indigo-600 border-purple-400",
    listening: "from-cyan-400 to-blue-600 border-cyan-300",
    thinking: "from-amber-400 to-pink-500 border-yellow-300",
    speaking: "from-fuchsia-500 to-pink-600 border-pink-300",
    success: "from-emerald-400 to-teal-500 border-emerald-300",
    error: "from-rose-500 to-orange-500 border-rose-300"
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Optional Cartoon Speech Bubble */}
      {showSpeechBubble && speechText && (
        <div className="absolute -top-14 bg-white text-gray-900 px-4 py-2 rounded-2xl shadow-xl border-2 border-purple-500 font-bold text-xs max-w-xs animate-bounce-happy z-20 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{speechText}</span>
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
        </div>
      )}

      {/* Robot Container */}
      <div 
        onClick={handlePoke}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative ${sizeClasses[size]} cursor-pointer transition-all duration-300 transform ${
          internalState === 'speaking' ? 'animate-bounce-happy' : 'animate-float-gentle'
        } ${isHovered ? 'scale-110' : 'scale-100'}`}
      >
        {/* Glow Aura */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-40 bg-gradient-to-tr ${stateColors[internalState]}`} />

        {/* Robot Head SVG */}
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg relative z-10">
          <defs>
            {/* Gradients */}
            <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a334d" />
              <stop offset="50%" stopColor="#1e263d" />
              <stop offset="100%" stopColor="#151b2e" />
            </linearGradient>

            <linearGradient id="faceScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0b0f19" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>

            <linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <linearGradient id="purpleNeon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <linearGradient id="pinkNeon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>

            <linearGradient id="goldNeon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Antenna */}
          <line x1="60" y1="22" x2="60" y2="10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
          <circle 
            cx="60" 
            cy="8" 
            r={internalState === 'listening' ? '7' : '5'} 
            fill={internalState === 'listening' ? '#38bdf8' : internalState === 'thinking' ? '#facc15' : '#ec4899'} 
            className="animate-pulse"
          />
          <circle cx="60" cy="8" r="9" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6" />

          {/* Headphones / Ears */}
          <rect x="8" y="44" width="12" height="32" rx="6" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="2" />
          <rect x="100" y="44" width="12" height="32" rx="6" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="2" />
          <path d="M 14 44 Q 60 12 106 44" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />

          {/* Head Base Box */}
          <rect x="16" y="24" width="88" height="74" rx="26" fill="url(#robotBodyGrad)" stroke="#8b5cf6" strokeWidth="3" />

          {/* Screen Visor */}
          <rect x="24" y="32" width="72" height="56" rx="18" fill="url(#faceScreenGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

          {/* Cheeks Blush */}
          <ellipse cx="34" cy="68" rx="5" ry="3" fill="#f472b6" opacity="0.6" />
          <ellipse cx="86" cy="68" rx="5" ry="3" fill="#f472b6" opacity="0.6" />

          {/* EYES BY STATE */}
          {internalState === 'idle' && (
            <g className="animate-blink">
              {/* Left Eye */}
              <circle cx="44" cy="52" r="7" fill="url(#cyanNeon)" />
              <circle cx="46" cy="50" r="2.5" fill="#ffffff" />
              {/* Right Eye */}
              <circle cx="76" cy="52" r="7" fill="url(#cyanNeon)" />
              <circle cx="78" cy="50" r="2.5" fill="#ffffff" />
              {/* Smile Mouth */}
              <path d="M 52 68 Q 60 74 68 68" fill="none" stroke="url(#cyanNeon)" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {internalState === 'listening' && (
            <g>
              {/* Curious Wide Eyes */}
              <ellipse cx="44" cy="50" rx="8" ry="9" fill="url(#cyanNeon)" />
              <circle cx="46" cy="48" r="3" fill="#ffffff" />
              <ellipse cx="76" cy="50" rx="8" ry="9" fill="url(#cyanNeon)" />
              <circle cx="78" cy="48" r="3" fill="#ffffff" />
              {/* Listening O-mouth */}
              <circle cx="60" cy="68" r="4" fill="url(#cyanNeon)" />
              {/* Soundwaves around ears */}
              <path d="M 4 52 Q 0 60 4 68" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 116 52 Q 120 60 116 68" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {internalState === 'thinking' && (
            <g>
              {/* Thinking Wink / Spiral */}
              <path d="M 38 52 Q 44 46 50 52" fill="none" stroke="url(#goldNeon)" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="76" cy="50" r="6" fill="url(#goldNeon)" />
              <circle cx="77" cy="48" r="2" fill="#ffffff" />
              {/* Curved Pondering Mouth */}
              <path d="M 52 70 Q 60 64 68 68" fill="none" stroke="url(#goldNeon)" strokeWidth="3" strokeLinecap="round" />
              {/* Thinking dots */}
              <circle cx="92" cy="24" r="3" fill="#facc15" className="animate-ping" />
            </g>
          )}

          {internalState === 'speaking' && (
            <g>
              {/* Happy Arc Eyes */}
              <path d="M 38 54 Q 44 46 50 54" fill="none" stroke="url(#pinkNeon)" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 70 54 Q 76 46 82 54" fill="none" stroke="url(#pinkNeon)" strokeWidth="3.5" strokeLinecap="round" />
              {/* Open Animated Talking Mouth */}
              <path d="M 50 64 Q 60 76 70 64 Z" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          )}

          {internalState === 'success' && (
            <g>
              {/* Star Eyes */}
              <polygon points="44,44 46,49 51,49 47,53 49,58 44,55 39,58 41,53 37,49 42,49" fill="url(#goldNeon)" />
              <polygon points="76,44 78,49 83,49 79,53 81,58 76,55 71,58 73,53 69,49 74,49" fill="url(#goldNeon)" />
              {/* Big Joyful Smile */}
              <path d="M 48 66 Q 60 78 72 66" fill="none" stroke="url(#goldNeon)" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {internalState === 'error' && (
            <g>
              {/* Worried Eyes */}
              <ellipse cx="44" cy="52" rx="6" ry="7" fill="#f87171" />
              <ellipse cx="76" cy="52" rx="6" ry="7" fill="#f87171" />
              {/* Wavy Mouth */}
              <path d="M 48 70 Q 54 66 60 70 T 72 70" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}
        </svg>

        {/* Small floating status badge */}
        <div className="absolute -bottom-1 -right-1 bg-[#1e263d] p-1.5 rounded-full border-2 border-purple-500 shadow-md">
          {internalState === 'idle' && <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
          {internalState === 'listening' && <span className="flex h-3.5 w-3.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span></span>}
          {internalState === 'thinking' && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
          {internalState === 'speaking' && <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />}
          {internalState === 'success' && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
          {internalState === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
        </div>
      </div>
    </div>
  );
}
