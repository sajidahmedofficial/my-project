// agent-notes: { ctx: "Playful modern cartoon AI Career Mentor & interactive Voice AI Assistant with Sparky avatar, speech recognition & waveform", deps: ["lucide-react", "./common/AIAssistantAvatar", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-25" }
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
  RotateCcw,
  Copy,
  Check,
  Radio,
  Zap,
  Bot
} from 'lucide-react';
import AIAssistantAvatar from './common/AIAssistantAvatar';
import { generateMentorResponse } from '../utils/aiSimulator';

export default function CareerMentor({ profile }) {
  const candidateName = profile?.name ? profile.name.split(' - ')[0] : 'Developer';

  // Mode: 'chat' | 'voice'
  const [activeMode, setActiveMode] = useState('chat');
  const [avatarState, setAvatarState] = useState('idle');

  // Messages State
  const [messages, setMessages] = useState([
    {
      id: "m-welcome",
      sender: "bot",
      text: `Hi **${candidateName}**! I'm **Sparky**, your AI Career Mentor! 🤖✨\n\nI can help you build custom roadmaps, review technical skills, prep for campus interviews, and share real-time salary benchmarks.\n\nWhat would you like to explore today?`
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isSpeakingMsgId, setIsSpeakingMsgId] = useState(null);

  // Voice AI State
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Tap the microphone to speak with Sparky");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const suggestionChips = [
    "How to prepare for Frontend Placements?",
    "Recommend High-Impact React Projects",
    "What are top 5 System Design questions?",
    "Generate a 30-day DSA study roadmap"
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
        setVoiceStatus("Listening to your voice... Speak clearly!");
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
        setVoiceStatus("Didn't catch that. Please tap to try again!");
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
        // Fallback simulation for browsers blocking mic
        setIsListening(true);
        setAvatarState('listening');
        setVoiceStatus("Listening... (Simulating: 'How can I become a Full Stack Developer?')");
        setTimeout(() => {
          setIsListening(false);
          handleSend("How to prepare for campus technical placement interviews?");
        }, 3000);
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

      // Strip markdown asterisks and code backticks for clean speech
      const cleanText = text.replace(/[*#`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.1; // Friendly slightly higher cartoon pitch

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
    setVoiceStatus("Sparky is thinking & generating your answer...");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, messages: [...messages, userMsg] })
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
      setVoiceStatus("Answer ready!");

      // If in Voice Mode, automatically speak response
      if (activeMode === 'voice') {
        handleSpeakText(responseText, botMsg.id);
      } else {
        setTimeout(() => setAvatarState('idle'), 3000);
      }
    } catch (err) {
      console.warn("Career Mentor API notice (using simulator):", err.message);
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

  // Convert simple markdown headings, lists, bold text to basic HTML
  const formatText = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>');
      content = content.replace(/`(.*?)`/g, '<code class="px-2 py-0.5 rounded-lg bg-[#0d1220] text-xs font-mono border border-purple-500/30 text-pink-400 font-bold">$1</code>');

      if (content.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-black text-purple-300 mt-3 mb-1.5 flex items-center gap-1.5" dangerouslySetInnerHTML={{ __html: content.substring(4) }} />;
      }
      if (content.startsWith('#### ')) {
        return <h5 key={idx} className="text-xs font-black text-cyan-300 mt-2.5 mb-1 uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: content.substring(5) }} />;
      }
      
      if (content.startsWith('- ') || content.startsWith('* ')) {
        return (
          <li key={idx} className="list-none ml-3 pl-2 border-l-2 border-purple-400 my-1 text-xs text-gray-200 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
        );
      }
      
      const numMatch = content.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex gap-2 my-1.5 text-xs leading-relaxed font-medium">
            <span className="text-yellow-400 font-black">{numMatch[1]}.</span>
            <span className="text-gray-200" dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
          </div>
        );
      }

      return <p key={idx} className="my-1.5 text-xs text-gray-200 leading-relaxed font-medium min-h-[1em]" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <div className="cartoon-card h-[calc(100vh-170px)] flex flex-col overflow-hidden border-2 border-purple-500/30 shadow-2xl relative select-none animate-fade-in">
      {/* Header Bar with Mode Toggle */}
      <div className="px-6 py-4 border-b-2 border-purple-500/20 bg-[#12172a]/90 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <AIAssistantAvatar size="sm" state={avatarState} onClick={() => setAvatarState('success')} />
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>Sparky AI Career Mentor</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h3>
            <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ready & Listening
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#0b0f19] p-1.5 rounded-2xl border border-purple-500/30">
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeMode === 'chat'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Text Chat
          </button>
          
          <button
            onClick={() => setActiveMode('voice')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeMode === 'voice'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md animate-pulse'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Voice Assistant
          </button>
        </div>
      </div>

      {/* Mode 1: Voice AI Interface */}
      {activeMode === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-b from-[#151b2e] to-[#0d111e] overflow-y-auto">
          {/* Big Cartoon Avatar */}
          <AIAssistantAvatar 
            size="xl" 
            state={avatarState} 
            showSpeechBubble={true} 
            speechText={voiceStatus} 
          />

          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-black text-white">Voice Conversation Mode</h2>
            <p className="text-xs text-gray-300 font-medium">
              {voiceTranscript ? `"${voiceTranscript}"` : voiceStatus}
            </p>
          </div>

          {/* Pulsing Audio Waveform Indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 h-10">
              {[40, 70, 100, 60, 90, 45, 80, 55, 95, 30].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-pink-500 animate-pulse"
                  style={{ 
                    height: `${h}%`,
                    animationDuration: `${0.4 + (i % 4) * 0.2}s`
                  }} 
                />
              ))}
            </div>
          )}

          {/* Large Cartoon Microphone Button */}
          <div className="pt-2">
            <button
              onClick={handleToggleVoice}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white border-4 shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 to-pink-600 border-rose-300 shadow-rose-500/50 animate-bounce-happy'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-300 shadow-purple-500/40'
              }`}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 text-white animate-spin" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
            <span className="block text-[11px] font-bold text-gray-400 mt-3">
              {isListening ? "Listening... Click to send" : "Tap to Speak"}
            </span>
          </div>

          {/* Quick Voice Prompt Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 max-w-lg pt-2">
            {suggestionChips.slice(0, 3).map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="cartoon-badge cartoon-badge-purple hover:scale-105 transition-transform text-[11px] cursor-pointer"
              >
                ✨ {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Modern Cartoon Chat Interface */}
      {activeMode === 'chat' && (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={msg.id} className={`flex items-start gap-3.5 ${isBot ? 'max-w-2xl' : 'max-w-2xl ml-auto flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div className="shrink-0 mt-1">
                    {isBot ? (
                      <AIAssistantAvatar size="sm" state={isSpeakingMsgId === msg.id ? 'speaking' : 'idle'} />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 border-2 border-white/20 flex items-center justify-center text-white font-black text-sm shadow-md">
                        {candidateName?.[0] || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Speech Bubble */}
                  <div className={`p-4 md:p-5 rounded-3xl space-y-2 relative border-2 ${
                    isBot 
                      ? 'bg-[#182035] border-purple-500/25 text-gray-100 shadow-lg' 
                      : 'bg-gradient-to-r from-purple-700 to-indigo-700 border-purple-300/40 text-white shadow-lg'
                  }`}>
                    {/* Content */}
                    <div>{formatText(msg.text)}</div>

                    {/* Bot Message Action Toolbar */}
                    {isBot && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[10px] text-gray-400">
                        <button
                          onClick={() => handleSpeakText(msg.text, msg.id)}
                          className={`p-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1 font-bold transition-all ${
                            isSpeakingMsgId === msg.id ? 'text-pink-400 animate-pulse' : 'text-gray-300'
                          }`}
                          title="Listen with Voice"
                        >
                          {isSpeakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeakingMsgId === msg.id ? "Stop Voice" : "Listen"}</span>
                        </button>

                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1 font-bold text-gray-300 transition-all"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Bouncy Typing Indicator */}
            {typing && (
              <div className="flex items-start gap-3 max-w-2xl">
                <AIAssistantAvatar size="sm" state="thinking" />
                <div className="p-4 rounded-3xl bg-[#182035] border-2 border-purple-500/20 flex items-center gap-2">
                  <span className="text-xs text-purple-300 font-bold">Sparky is typing</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length <= 2 && !typing && (
            <div className="px-6 pb-2">
              <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider block mb-2">
                ✨ Suggested Inquiries
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="cartoon-badge cartoon-badge-purple hover:scale-105 transition-transform text-xs cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input container */}
          <div className="p-4 border-t-2 border-purple-500/20 bg-[#12172a]/95">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Sparky anything about roadmaps, interviews, or coding..."
                className="flex-1 px-5 py-3 bg-[#0b0f19] border-2 border-purple-500/30 focus:border-purple-400 rounded-2xl text-xs text-white placeholder-gray-400 focus:outline-none font-medium"
              />

              <button
                type="button"
                onClick={() => setActiveMode('voice')}
                className="p-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 border-2 border-purple-500/30 text-purple-300 hover:text-white transition-all"
                title="Switch to Voice Mode"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputVal.trim() || typing}
                className="cartoon-btn cartoon-btn-purple py-3 px-5 text-xs font-black gap-1.5 disabled:opacity-50"
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
