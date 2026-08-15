import React from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  Sparkles
} from 'lucide-react';
import { generateMentorResponse } from '../utils/aiSimulator';

export default function CareerMentor({ profile }) {
  const candidateName = profile?.name ? profile.name.split(' - ')[0] : 'Developer';

  const [messages, setMessages] = React.useState([
    {
      id: "m-welcome",
      sender: "bot",
      text: `Hi **${candidateName}**! I am your AI Career Mentor. 💡

I can help you build learning roadmaps, recommend projects, suggest course materials, share placement checklists, and offer salary insights.

How can I help you today?`
    }
  ]);
  const [inputVal, setInputVal] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const chatEndRef = React.useRef(null);

  const suggestionChips = [
    "How to become a Full Stack Developer?",
    "What should I study for a Frontend interview?",
    "Recommend backend projects to build",
    "How to prepare for placement interviews?"
  ];

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
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
    } catch (err) {
      console.warn("Career Mentor API fallback:", err);
      const responseText = generateMentorResponse(messages, query);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setTyping(false);
    }
  };

  // Convert simple markdown headings, lists, bold text to basic HTML for premium formatting
  const formatText = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      
      // Bold text formatting
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-900 text-xs font-mono border border-gray-800 text-accent-pink">$1</code>');

      // Headings
      if (content.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-white mt-4 mb-2 first:mt-0 flex items-center gap-1.5" dangerouslySetInnerHTML={{ __html: content.substring(4) }} />;
      }
      if (content.startsWith('#### ')) {
        return <h5 key={idx} className="text-xs font-bold text-gray-200 mt-3 mb-1.5 uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: content.substring(5) }} />;
      }
      
      // Unordered lists
      if (content.startsWith('- ') || content.startsWith('* ')) {
        return <li key={idx} className="list-none ml-4 pl-1.5 border-l border-accent-purple/30 my-1 text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />;
      }
      
      // Ordered lists (numbered)
      const numMatch = content.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex gap-2 my-2 text-xs leading-relaxed">
            <span className="text-accent-purple font-bold">{numMatch[1]}.</span>
            <span className="text-gray-300" dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
          </div>
        );
      }

      return <p key={idx} className="my-1.5 text-xs text-gray-300 leading-relaxed min-h-[1em]" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <div className="glass rounded-2xl h-[calc(100vh-200px)] flex flex-col overflow-hidden animate-fade-in border border-gray-800">
      {/* Chat header */}
      <div className="px-5 py-4 border-b border-gray-800 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">AI Career Mentor</h3>
            <span className="text-[10px] text-accent-emerald flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" /> Online & Ready
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-800/50 px-2 py-1 rounded">
          <Sparkles className="w-3.5 h-3.5 text-accent-pink" /> Powered by Gemini LLM
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isBot ? 'max-w-2xl' : 'max-w-2xl ml-auto flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isBot ? 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
              </div>
              <div className={`p-4 rounded-xl space-y-1 ${isBot ? 'bg-white/5 border border-gray-800 text-gray-200' : 'bg-accent-purple/10 border border-accent-purple/20 text-white'}`}>
                {formatText(msg.text)}
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex items-start gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple shrink-0">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-gray-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && !typing && (
        <div className="px-5 pb-3">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Suggested Inquiries</span>
          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-lg border border-gray-800 hover:border-accent-purple/30 bg-transparent hover:bg-accent-purple/5 text-gray-300 hover:text-white transition-colors text-xs text-left"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input container */}
      <div className="p-4 border-t border-gray-800 bg-white/5">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="flex gap-2.5"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type your career query (e.g. How do I prepare for technical placements?)..."
            className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 focus:border-accent-purple rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none leading-relaxed"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || typing}
            className="px-4 py-2.5 rounded-xl bg-accent-purple text-white hover:bg-opacity-95 disabled:opacity-50 transition-opacity flex items-center justify-center text-xs font-semibold shrink-0 gap-1.5 shadow-lg shadow-accent-purple/10"
          >
            Send <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
