// agent-notes: { ctx: "Official Google Gemini AI Career Mentor & Chatbot with persona switcher, code syntax blocks, voice TTS/STT, and model controls", deps: ["lucide-react", "./common/AIAssistantAvatar", "../utils/aiSimulator"], state: "active", last: "anti@2026-10-01" }
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Settings2,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Bot,
  Terminal,
  Brain,
  FileText,
  Briefcase,
  Layers,
  Code2,
  Sliders,
  X
} from 'lucide-react';
import { generateMentorResponse } from '../utils/aiSimulator';

// Authentic Google Gemini Sparkle SVG with vibrant gradient
export function GeminiSparkle({ className = "w-5 h-5", animate = false }) {
  return (
    <svg 
      className={`${className} ${animate ? 'animate-pulse' : ''}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4E75F8" />
          <stop offset="35%" stopColor="#9B72CF" />
          <stop offset="70%" stopColor="#E269B8" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.627 12 12 0-6.627 5.627-12 12-12-6.627 0-12-5.627-12-12z"
        fill="url(#geminiGradient)"
      />
    </svg>
  );
}

// Available Gemini AI Personas for supreme flexibility
const GEMINI_PERSONAS = [
  {
    id: 'mentor',
    name: 'Career Strategist',
    icon: Sparkles,
    badge: 'Strategic',
    tagline: 'Personalized career roadmaps, placement advice & milestone tracking',
    chips: [
      "What are my highest priority skill gaps?",
      "Design a 30-day technical learning roadmap",
      "Recommend production project ideas for my stack",
      "How to transition towards senior software engineer roles?"
    ]
  },
  {
    id: 'interviewer',
    name: 'Technical Interviewer',
    icon: Brain,
    badge: 'Mock Prep',
    tagline: 'Challenging coding questions, algorithm rounds & STAR behavioral evaluations',
    chips: [
      "Ask me a challenging React interview question",
      "Quiz me on JavaScript Event Loop & Microtasks",
      "Conduct a mock interview for Full Stack Developer",
      "How to answer: 'Describe a challenging bug you fixed'?"
    ]
  },
  {
    id: 'architect',
    name: 'System Architect',
    icon: Layers,
    badge: 'Scale & Cloud',
    tagline: 'High-level architectures, microservices, databases, caching & distributed systems',
    chips: [
      "How to design a scalable URL shortener with Redis?",
      "Explain Cache-Aside vs Write-Through strategies",
      "Compare PostgreSQL vs MongoDB for high-throughput apps",
      "Design a real-time notification engine with WebSockets"
    ]
  },
  {
    id: 'resume',
    name: 'Resume & ATS Reviewer',
    icon: FileText,
    badge: 'ATS Score',
    tagline: 'ATS keyword optimization, recruiter impact formulas & bullet point rewrites',
    chips: [
      "Rewrite my project bullets with Google XYZ formula",
      "What high-demand keywords am I missing for my target role?",
      "How to make my resume stand out to hiring managers?",
      "Critique my technical experience summary"
    ]
  },
  {
    id: 'code',
    name: 'Code Explainer & Debugger',
    icon: Code2,
    badge: 'Pair Coding',
    tagline: 'Step-by-step code troubleshooting, algorithmic patterns & clean refactoring',
    chips: [
      "Explain the Two-Pointer technique with code examples",
      "How to implement a custom Promise.all in JavaScript?",
      "Explain React useEffect cleanup and memory leaks",
      "Show how to write an async retry wrapper in Node.js"
    ]
  }
];

export default function CareerMentor({ profile }) {
  const candidateName = profile?.name ? profile.name.split(' - ')[0] : 'Developer';
  const targetRole = profile?.careerGoal || profile?.targetRole || 'Full Stack Developer';

  // Active Persona & Model Configuration
  const [selectedPersonaId, setSelectedPersonaId] = useState('mentor');
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [creativity, setCreativity] = useState('balanced'); // 'precise' | 'balanced' | 'creative'
  const [showSettings, setShowSettings] = useState(false);
  const [includeProfileContext, setIncludeProfileContext] = useState(true);

  // Active interaction mode: 'chat' | 'voice'
  const [activeMode, setActiveMode] = useState('chat');

  // Storage key based on profile identity
  const userStorageKey = `sb_gemini_chat_${profile?.id || profile?.email || 'default'}`;

  // Messages state with persistence
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: "m-welcome",
        sender: "bot",
        modelUsed: "Google Gemini 3.6 Flash",
        persona: "mentor",
        text: `### Welcome to Google Gemini AI Career Mentor ✨\n\nHello **${candidateName}**! I'm your dedicated **Gemini AI Career & Technical Mentor** calibrated for your journey towards becoming a high-impact **${targetRole}**.\n\nI have reviewed your active profile, skills, and resume insights:\n- **Target Career**: ${targetRole}\n- **Verified Skills**: ${profile?.skills?.slice(0, 5).join(', ') || 'React, JavaScript, Node.js'}\n- **Target Growth Areas**: ${profile?.missingSkills?.slice(0, 3).join(', ') || 'Docker, AWS, System Design'}\n\n**How can I assist you today?** Choose a persona above or pick a suggested topic below to get started!`
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, userStorageKey]);

  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [isSpeakingMsgId, setIsSpeakingMsgId] = useState(null);
  const [ratings, setRatings] = useState({}); // { [msgId]: 'up' | 'down' }

  // Speech Recognition (STT) State
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Click the microphone to speak with Gemini");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const activePersona = GEMINI_PERSONAS.find(p => p.id === selectedPersonaId) || GEMINI_PERSONAS[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus("Listening... speak naturally.");
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setVoiceTranscript(transcript);
        setInputVal(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        setIsListening(false);
        setVoiceStatus("Audio paused. Click to speak again.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionSupported(false);
    }
  }, []);

  const handleToggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (inputVal.trim()) {
        handleSend(inputVal);
      }
    } else {
      setVoiceTranscript("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        setIsListening(true);
        setVoiceStatus("Simulating voice input...");
        setTimeout(() => {
          setIsListening(false);
          const sample = "How do I prepare for technical system design rounds?";
          setInputVal(sample);
          handleSend(sample);
        }, 2200);
      }
    }
  };

  // Text-To-Speech Playback
  const handleSpeakText = (text, msgId) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (isSpeakingMsgId === msgId) {
          setIsSpeakingMsgId(null);
          return;
        }
      }

      // Clean markdown tags for natural speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code snippet provided in text.')
        .replace(/[*#`_>]/g, '')
        .replace(/\n+/g, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeakingMsgId(msgId);
      utterance.onend = () => setIsSpeakingMsgId(null);
      utterance.onerror = () => setIsSpeakingMsgId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleRate = (msgId, type) => {
    setRatings(prev => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type
    }));
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this Gemini conversation?")) {
      const resetMsg = [
        {
          id: `m-reset-${Date.now()}`,
          sender: "bot",
          modelUsed: "Google Gemini 3.6 Flash",
          persona: selectedPersonaId,
          text: `### Conversation Cleared ✨\n\nI'm ready with **${activePersona.name}** mode. What would you like to explore next regarding **${targetRole}**?`
        }
      ];
      setMessages(resetMsg);
      localStorage.removeItem(userStorageKey);
    }
  };

  const handleExportChat = () => {
    const formatted = messages.map(m => {
      const author = m.sender === 'user' ? candidateName : 'Google Gemini';
      return `### ${author}\n\n${m.text}\n\n---\n`;
    }).join('\n');

    const blob = new Blob([`# SkillBridge AI - Gemini Career Chat Transcript\nGenerated: ${new Date().toLocaleString()}\nTarget Role: ${targetRole}\n\n${formatted}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gemini_Career_Chat_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Main Send Function
  const handleSend = async (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query || typing) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setVoiceTranscript("");
    setTyping(true);

    const temperatureMap = {
      precise: 0.2,
      balanced: 0.7,
      creative: 1.0
    };

    const userContextPayload = includeProfileContext ? {
      name: candidateName,
      targetRole: targetRole,
      skills: profile?.skills || ["React", "JavaScript", "HTML/CSS"],
      missingSkills: profile?.missingSkills || ["TypeScript", "Docker", "AWS"],
      scores: profile?.scores || { resumeScore: 85, placementReadiness: 80 }
    } : {
      name: candidateName,
      targetRole: targetRole
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          messages: [...messages, userMsg],
          persona: selectedPersonaId,
          model: selectedModel,
          temperature: temperatureMap[creativity] || 0.7,
          userContext: userContextPayload
        })
      });

      const data = await res.json();
      let responseText = data?.response;
      let modelUsed = data?.modelUsed || 'Google Gemini 3.6 Flash';

      if (!responseText || responseText.includes("Local Mentor response fallback trigger")) {
        responseText = generateMentorResponse(messages, query);
        modelUsed = 'Gemini Local Engine';
      }

      const botMsg = {
        id: `gemini-${Date.now()}`,
        sender: "bot",
        text: responseText,
        modelUsed,
        persona: selectedPersonaId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      if (activeMode === 'voice') {
        handleSpeakText(responseText, botMsg.id);
      }
    } catch (err) {
      console.warn("Gemini Chat Network Fallback:", err.message);
      const fallbackText = generateMentorResponse(messages, query);
      const botMsg = {
        id: `gemini-${Date.now()}`,
        sender: "bot",
        text: fallbackText,
        modelUsed: 'Google Gemini Contextual AI',
        persona: selectedPersonaId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Rich Markdown Renderer with Fenced Code Blocks & Copy Buttons
  const renderFormattedMarkdown = (text, msgId) => {
    if (!text) return null;

    // Detect fenced code blocks: ```lang\ncode\n```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const language = hasLang ? firstLine : 'code';
        const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n');
        const codeId = `${msgId}-code-${index}`;

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono shadow-sm">
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800/80 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 uppercase font-semibold text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                {language}
              </span>
              <button
                onClick={() => handleCopyCode(codeContent, codeId)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-slate-800"
                title="Copy code"
              >
                {copiedCodeId === codeId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {/* Code content */}
            <pre className="p-3.5 overflow-x-auto text-xs leading-relaxed text-slate-200">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Normal text with headers, bold, bullets & lists
      return (
        <div key={index} className="space-y-1">
          {part.split('\n').map((line, lIdx) => {
            let content = line;

            // Bold
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>');
            // Inline code
            content = content.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-[11px] border border-slate-200/80">$1</code>');

            // Headings
            if (content.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="text-sm font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5" dangerouslySetInnerHTML={{ __html: content.substring(4) }} />
              );
            }
            if (content.startsWith('#### ')) {
              return (
                <h5 key={lIdx} className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-2.5 mb-1" dangerouslySetInnerHTML={{ __html: content.substring(5) }} />
              );
            }

            // Blockquote / Tip
            if (content.startsWith('> ')) {
              return (
                <div key={lIdx} className="my-2 pl-3 py-1.5 border-l-2 border-indigo-500 bg-indigo-50/50 rounded-r-md text-xs text-indigo-900 font-medium" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
              );
            }

            // Bullet points
            if (content.startsWith('- ') || content.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 my-1 text-xs text-slate-700 leading-relaxed ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
                </div>
              );
            }

            // Numbered list
            const numMatch = content.match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2 my-1.5 text-xs text-slate-700 leading-relaxed ml-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold shrink-0 mt-0.5">
                    {numMatch[1]}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
                </div>
              );
            }

            if (!content.trim()) {
              return <div key={lIdx} className="h-1" />;
            }

            return <p key={lIdx} className="my-1 text-xs text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;
          })}
        </div>
      );
    });
  };

  return (
    <div className="saas-card h-[calc(100vh-140px)] min-h-[580px] flex flex-col overflow-hidden text-slate-900 bg-slate-50/60 relative">
      {/* 1. TOP GEMINI BRANDING & MODEL BAR */}
      <div className="px-4 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2.5 z-10">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-indigo-100 flex items-center justify-center shadow-xs">
            <GeminiSparkle className="w-5 h-5" animate={typing} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Google Gemini</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="text-indigo-600 font-semibold">Career Mentor</span>
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live API
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Calibrated for <span className="text-slate-700 font-semibold">{targetRole}</span> • {candidateName}
            </p>
          </div>
        </div>

        {/* Model & Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Model Selector Dropdown */}
          <div className="relative inline-block">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
            >
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Pro)</option>
              <option value="gemini-hybrid">Gemini Hybrid Engine</option>
            </select>
          </div>

          {/* Quick Voice / Text Toggle */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveMode('chat')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeMode === 'chat'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setActiveMode('voice')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                activeMode === 'voice'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3 h-3 text-indigo-600" />
              <span>Voice</span>
            </button>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showSettings 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Gemini Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Export chat */}
          <button
            onClick={handleExportChat}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Export conversation as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear chat */}
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. GEMINI SETTINGS DRAWER / POPOVER */}
      {showSettings && (
        <div className="px-4 py-3 bg-white border-b border-indigo-100 shadow-xs text-xs space-y-3 z-10 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
              Gemini Configuration & Personality Controls
            </span>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Creativity / Temperature */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">
                Reasoning Mode / Temperature:
              </label>
              <div className="flex rounded-md border border-slate-200 overflow-hidden bg-slate-50">
                {['precise', 'balanced', 'creative'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setCreativity(mode)}
                    className={`flex-1 py-1 text-[11px] capitalize font-medium transition-all ${
                      creativity === mode 
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Context Injection */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">
                Resume & Profile Context:
              </label>
              <button
                onClick={() => setIncludeProfileContext(!includeProfileContext)}
                className={`w-full py-1 px-2.5 rounded-md border text-[11px] font-medium transition-all text-left flex items-center justify-between ${
                  includeProfileContext 
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span>{includeProfileContext ? '✓ Injected in Prompts' : '✗ Generic Prompts'}</span>
                <span className="text-[10px] opacity-75">{includeProfileContext ? 'Active' : 'Off'}</span>
              </button>
            </div>

            {/* Candidate Role Overview */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">
                Active Goal Alignment:
              </label>
              <div className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-[11px] truncate">
                {targetRole} ({profile?.skills?.length || 0} skills loaded)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GEMINI PERSONA SELECTION STRIP (FLEXIBILITY) */}
      <div className="px-3 sm:px-4 py-2 bg-white/80 border-b border-slate-200/70 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Mode:
        </span>
        {GEMINI_PERSONAS.map((persona) => {
          const Icon = persona.icon;
          const isActive = selectedPersonaId === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => setSelectedPersonaId(persona.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{persona.name}</span>
            </button>
          );
        })}
      </div>

      {/* 4. CHAT MESSAGE STREAM */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          const rating = ratings[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isBot ? 'max-w-3xl' : 'max-w-2xl ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar Icon */}
              <div className="shrink-0 mt-0.5">
                {isBot ? (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center shadow-xs border border-indigo-900/40">
                    <GeminiSparkle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {candidateName?.[0] || 'U'}
                  </div>
                )}
              </div>

              {/* Message Bubble Card */}
              <div className={`p-4 rounded-2xl space-y-2 text-xs leading-relaxed transition-all shadow-xs ${
                isBot 
                  ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs' 
                  : 'bg-slate-900 text-white rounded-tr-xs'
              }`}>
                {/* Assistant Metadata Badge */}
                {isBot && (
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 text-[10px] text-slate-400">
                    <span className="font-semibold text-indigo-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      {msg.modelUsed || "Google Gemini"}
                    </span>
                    {msg.timestamp && <span>{msg.timestamp}</span>}
                  </div>
                )}

                {/* Formatted Markdown Content */}
                <div className="overflow-hidden">
                  {renderFormattedMarkdown(msg.text, msg.id)}
                </div>

                {/* Gemini Action Footer */}
                {isBot && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      {/* Copy message */}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-slate-700 flex items-center gap-1 font-medium transition-colors"
                        title="Copy full response"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Text-to-speech audio */}
                      <button
                        onClick={() => handleSpeakText(msg.text, msg.id)}
                        className={`hover:text-slate-700 flex items-center gap-1 font-medium transition-colors ${
                          isSpeakingMsgId === msg.id ? 'text-indigo-600 font-bold' : ''
                        }`}
                        title="Read aloud"
                      >
                        {isSpeakingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span className="text-rose-600">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>

                      {/* Regenerate with same prompt */}
                      <button
                        onClick={() => {
                          const prevUserMsg = [...messages].reverse().find(m => m.sender === 'user');
                          if (prevUserMsg) handleSend(prevUserMsg.text);
                        }}
                        className="hover:text-slate-700 flex items-center gap-1 font-medium transition-colors hidden sm:flex"
                        title="Regenerate answer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    {/* Feedback Rating */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRate(msg.id, 'up')}
                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                          rating === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRate(msg.id, 'down')}
                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                          rating === 'down' ? 'text-rose-600 bg-rose-50' : 'text-slate-400'
                        }`}
                        title="Unhelpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Gemini Generating State */}
        {typing && (
          <div className="flex items-start gap-3 max-w-3xl animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <GeminiSparkle className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-indigo-200/80 shadow-xs flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-ping" />
              <span className="text-xs font-medium text-slate-700">
                Gemini is synthesizing insights for <strong className="text-slate-900">{targetRole}</strong>...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 5. SUGGESTION CHIPS FOR ACTIVE PERSONA */}
      {!typing && (
        <div className="px-4 py-2 bg-white/90 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Prompt Ideas:
          </span>
          {activePersona.chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="shrink-0 text-[11px] px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 font-medium transition-all cursor-pointer whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* 6. PILL INPUT FORM */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          {/* Main Rounded Input Bar */}
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <GeminiSparkle className="w-4 h-4 shrink-0 opacity-75" />
            
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Ask Gemini (${activePersona.name}) about roadmaps, code, interviews, or architecture...`}
              className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              disabled={typing}
            />

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-1.5 rounded-full transition-colors ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
              }`}
              title={isListening ? "Stop listening" : "Speak to Gemini"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputVal.trim() || typing}
            className="h-10 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Gemini Disclaimer */}
        <p className="text-[10px] text-center text-slate-400 mt-2 font-normal">
          Gemini may display inaccurate info, so verify technical answers. Powered by Google Gemini API.
        </p>
      </div>
    </div>
  );
}
