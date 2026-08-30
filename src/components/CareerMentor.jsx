// agent-notes: { ctx: "Clean minimal SaaS AI Career Mentor with text chat, speech synthesis & voice input", deps: ["lucide-react", "./common/AIAssistantAvatar", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-27" }
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bot
} from 'lucide-react';
import AIAssistantAvatar from './common/AIAssistantAvatar';
import { generateMentorResponse } from '../utils/aiSimulator';

export default function CareerMentor({ profile }) {
  const candidateName = profile?.name ? profile.name.split(' - ')[0] : 'Developer';

  // Mode: 'chat' | 'voice'
  const [activeMode, setActiveMode] = useState('chat');
  const [avatarState, setAvatarState] = useState('idle');

  const userStorageKey = `sb_mentor_chat_${profile?.id || profile?.email || 'default'}`;

  // Messages State with LocalStorage Persistence
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
        text: `Hi **${candidateName}**! I'm your **AI Career Mentor** for **${profile?.careerGoal || 'Full Stack Engineering'}**.\n\nI can help you build custom learning roadmaps, evaluate skill gaps, prepare for technical interviews, and discuss career strategies based on your uploaded resume.\n\nWhat would you like to explore today?`
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
  const [isSpeakingMsgId, setIsSpeakingMsgId] = useState(null);

  // Voice AI State
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Click the microphone to speak with your mentor");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const suggestionChips = [
    `How to prepare for ${profile?.careerGoal || 'Full Stack'} roles?`,
    "What are my highest priority skill gaps?",
    "Recommend production project ideas for my stack",
    "Prepare me for a system design technical round"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setAvatarState('listening');
        setVoiceStatus("Listening... Speak clearly.");
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setAvatarState('error');
        setVoiceStatus("Could not detect audio. Please click to try again.");
        setTimeout(() => setAvatarState('idle'), 2000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionSupported(false);
    }
  }, []);

  // Toggle Voice Recording
  const handleToggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAvatarState('idle');
      if (voiceTranscript.trim()) {
        handleSend(voiceTranscript);
      }
    } else {
      setVoiceTranscript("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        setIsListening(true);
        setAvatarState('listening');
        setVoiceStatus("Listening (simulating input)...");
        setTimeout(() => {
          setIsListening(false);
          handleSend("How to prepare for campus technical placement interviews?");
        }, 2500);
      }
    }
  };

  // Text-To-Speech Playback
  const handleSpeakText = (text, msgId) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeakingMsgId(null);
        setAvatarState('idle');
        return;
      }

      const cleanText = text.replace(/[*#`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;

      utterance.onstart = () => {
        setIsSpeakingMsgId(msgId);
        setAvatarState('speaking');
      };

      utterance.onend = () => {
        setIsSpeakingMsgId(null);
        setAvatarState('idle');
      };

      utterance.onerror = () => {
        setIsSpeakingMsgId(null);
        setAvatarState('idle');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setVoiceTranscript("");
    setTyping(true);
    setAvatarState('thinking');
    setVoiceStatus("Analyzing your query...");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          messages: [...messages, userMsg],
          userContext: {
            name: candidateName,
            targetRole: profile?.careerGoal || "Full Stack Developer",
            skills: profile?.skills || ["React", "JavaScript", "HTML/CSS"],
            missingSkills: profile?.missingSkills || ["TypeScript", "Docker", "AWS"],
            scores: profile?.scores || { resumeScore: 85, placementReadiness: 80 }
          }
        })
      });

      const data = await res.json();
      let responseText = data?.response;
      if (!responseText || responseText.includes("Local Mentor response fallback trigger")) {
        responseText = generateMentorResponse(messages, query);
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('speaking');
      setVoiceStatus("Response ready.");

      if (activeMode === 'voice') {
        handleSpeakText(responseText, botMsg.id);
      } else {
        setTimeout(() => setAvatarState('idle'), 2500);
      }
    } catch (err) {
      console.warn("Career Mentor notice (using fallback):", err.message);
      const responseText = generateMentorResponse(messages, query);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
      setAvatarState('idle');
    } finally {
      setTyping(false);
    }
  };

  const formatText = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>');
      content = content.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono text-indigo-700 border border-slate-200">$1</code>');

      if (content.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-semibold text-slate-900 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: content.substring(4) }} />;
      }
      if (content.startsWith('#### ')) {
        return <h5 key={idx} className="text-xs font-semibold text-slate-800 mt-2 mb-1 uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: content.substring(5) }} />;
      }
      
      if (content.startsWith('- ') || content.startsWith('* ')) {
        return (
          <li key={idx} className="list-disc ml-4 my-0.5 text-xs text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
        );
      }
      
      const numMatch = content.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex gap-1.5 my-1 text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
          </div>
        );
      }

      return <p key={idx} className="my-1 text-xs text-slate-700 leading-relaxed min-h-[1em]" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <div className="saas-card h-[calc(100vh-160px)] flex flex-col overflow-hidden text-slate-900">
      {/* Header Bar with Mode Toggle */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <AIAssistantAvatar size="sm" state={avatarState} onClick={() => setAvatarState('success')} />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span>AI Career Mentor</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-xs">
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeMode === 'chat'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Text Chat
          </button>
          
          <button
            onClick={() => setActiveMode('voice')}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeMode === 'voice'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Voice Mode
          </button>
        </div>
      </div>

      {/* Mode 1: Voice AI Interface */}
      {activeMode === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-slate-50 overflow-y-auto">
          <AIAssistantAvatar 
            size="lg" 
            state={avatarState} 
            showSpeechBubble={true} 
            speechText={voiceStatus} 
          />

          <div className="space-y-1 max-w-md">
            <h2 className="text-base font-semibold text-slate-900">Voice Assistant Mode</h2>
            <p className="text-xs text-slate-500">
              {voiceTranscript ? `"${voiceTranscript}"` : voiceStatus}
            </p>
          </div>

          {/* Simple Clean Microphone Button */}
          <div className="pt-2">
            <button
              onClick={handleToggleVoice}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-sm ${
                isListening
                  ? 'bg-rose-600 ring-4 ring-rose-200'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
            <span className="block text-[11px] font-medium text-slate-500 mt-2">
              {isListening ? "Listening... click to send" : "Click to speak"}
            </span>
          </div>

          {/* Quick Voice Prompt Suggestions */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-md pt-2">
            {suggestionChips.slice(0, 3).map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="saas-badge text-xs hover:border-slate-300 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Modern SaaS Chat Interface */}
      {activeMode === 'chat' && (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={msg.id} className={`flex items-start gap-3 ${isBot ? 'max-w-2xl' : 'max-w-2xl ml-auto flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className="shrink-0 mt-0.5">
                    {isBot ? (
                      <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs">
                        <Bot className="w-4 h-4 text-indigo-400" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                        {candidateName?.[0] || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Speech Bubble */}
                  <div className={`p-4 rounded-xl space-y-1.5 border text-xs leading-relaxed ${
                    isBot 
                      ? 'bg-white border-slate-200 text-slate-800 shadow-sm' 
                      : 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  }`}>
                    <div>{formatText(msg.text)}</div>

                    {/* Bot Message Action Toolbar */}
                    {isBot && (
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        <button
                          onClick={() => handleSpeakText(msg.text, msg.id)}
                          className={`hover:text-slate-700 flex items-center gap-1 font-medium transition-colors ${
                            isSpeakingMsgId === msg.id ? 'text-indigo-600 font-semibold' : ''
                          }`}
                          title="Listen with voice"
                        >
                          {isSpeakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeakingMsgId === msg.id ? "Stop Voice" : "Listen"}</span>
                        </button>

                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="hover:text-slate-700 flex items-center gap-1 font-medium transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex items-start gap-3 max-w-2xl">
                <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 shadow-sm flex items-center gap-2">
                  <span>Mentor is formulating answer...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length <= 2 && !typing && (
            <div className="px-5 py-2 bg-white border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Suggested Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="saas-badge text-xs hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input container */}
          <div className="p-3.5 border-t border-slate-200 bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about career roadmaps, interview questions, or system design..."
                className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />

              <button
                type="button"
                onClick={() => setActiveMode('voice')}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title="Switch to Voice Mode"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputVal.trim() || typing}
                className="saas-btn-primary py-2 px-3.5 text-xs font-medium gap-1.5 disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
