import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaPaperPlane, FaTimes, FaLightbulb } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const QUICK_QUESTIONS = [
  { emoji: '🐕', text: 'Dog hit by a vehicle - what do I do?', category: 'Emergency' },
  { emoji: '🐈', text: 'Found a kitten with eyes closed and shaking', category: 'Emergency' },
  { emoji: '🐦', text: 'A bird flew into a window and is stunned', category: 'First Aid' },
  { emoji: '🐄', text: 'Cow has a deep wound and is limping', category: 'First Aid' },
  { emoji: '🏠', text: 'How do I prepare my home to adopt a dog?', category: 'Adoption' },
  { emoji: '💉', text: 'What vaccines does a new puppy need?', category: 'Health' },
  { emoji: '🐍', text: 'How do I safely handle an injured snake?', category: 'Rescue' },
  { emoji: '🐒', text: 'A monkey is injured near my building', category: 'Rescue' },
];

const WELCOME = {
  role: 'model',
  content: `🐾 **Welcome to AniBot — Your AI Animal Welfare Expert!**

I'm powered by **Google Gemini AI** and trained to help with:

- 🩹 **First Aid** — Step-by-step emergency guidance for injured animals
- 🚨 **Rescue** — Safe handling and transport instructions  
- 🏥 **Veterinary Advice** — When and how to seek professional help
- 🏠 **Adoption** — Readiness, care guides, and what to expect
- 💊 **Health & Nutrition** — Vaccination schedules, diet plans
- 🐾 **Specific Animal Care** — Dogs, cats, birds, wildlife and more

👇 **Pick a quick question below or type your own!**`,
  timestamp: new Date(),
};

function renderMarkdown(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) return <div key={i} className="flex gap-2 my-1"><span className="font-bold text-primary-600 shrink-0">{numMatch[1]}.</span><span dangerouslySetInnerHTML={{ __html: inlineFormat(numMatch[2]) }} /></div>;
    const bulletMatch = line.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) return <div key={i} className="flex gap-2 my-1"><span className="text-primary-500 shrink-0">•</span><span dangerouslySetInnerHTML={{ __html: inlineFormat(bulletMatch[1]) }} /></div>;
    if (line.startsWith('### ')) return <p key={i} className="font-bold text-base mt-3 mb-1" dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(4)) }} />;
    if (line.startsWith('## ')) return <p key={i} className="font-bold text-lg mt-3 mb-1" dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(3)) }} />;
    if (!line.trim()) return <div key={i} className="h-2" />;
    return <p key={i} className="my-0.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />;
  });
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg = { role: 'user', content: msgText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setLoading(true);

    try {
      const history = messages.filter((m) => m !== WELCOME).map((m) => ({ role: m.role, content: m.content }));
      const { data } = await axios.post('/api/chat', { message: msgText, sessionId, history });
      setMessages((prev) => [...prev, { role: 'model', content: data.reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'model',
        content: '⚠️ Unable to connect to AI service. Please check your internet connection and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const [isTyping, setIsTyping] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-0 flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex flex-col flex-1 pb-0">
        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Gemini 2.5 Flash · Online
          </div>
          <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white mb-2">
            AI Animal <span className="gradient-text">Rescue Assistant</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Powered by Google Gemini — expert animal welfare guidance, 24/7</p>
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q.text} onClick={() => sendMessage(q.text)}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-left hover:border-primary-400 hover:shadow-md transition-all card-hover group">
                <div className="text-2xl mb-2">{q.emoji}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">{q.category}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{q.text}</p>
              </button>
            ))}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden shadow-sm mb-6" style={{ minHeight: '400px', maxHeight: '60vh' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'model' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shrink-0 shadow-md">
                      <FaRobot className="text-white" size={14} />
                    </div>
                  )}
                  <div className={`max-w-2xl rounded-2xl px-5 py-4 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm ml-auto'
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                  }`}>
                    <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
                    </div>
                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-md">
                  <FaRobot className="text-white" size={14} />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-100 dark:border-gray-800 p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask anything about animal rescue, first aid, adoption..."
                rows={1}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none leading-relaxed"
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="w-12 h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-lg self-end">
                <FaPaperPlane size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><FaLightbulb size={10} /> Press Enter to send · Shift+Enter for new line</span>
              <button onClick={() => setMessages([WELCOME])} className="hover:text-primary-500 transition-colors flex items-center gap-1">
                <FaTimes size={10} /> Clear chat
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 pb-6">
          🤖 Powered by Google Gemini 2.5 Flash · For life-threatening emergencies, always contact a professional veterinarian immediately.
        </p>
      </div>
    </div>
  );
}
