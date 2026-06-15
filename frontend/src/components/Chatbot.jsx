import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaw, FaTimes, FaPaperPlane, FaRobot, FaExpand, FaCompress } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const QUICK_ACTIONS = [
  '🐕 Dog First Aid',
  '🐈 Cat Emergency',
  '🐦 Bird Rescue',
  '🏥 Find Vet Nearby',
  '🏠 Adoption Info',
  '📞 Emergency Contact',
];

const WELCOME_MESSAGE = {
  role: 'model',
  content: `🐾 **Hello! I'm AniBot**, your Animal Rescue & Welfare Assistant!

I'm here to help you with:
- 🩹 **First Aid** for injured animals
- 🚨 **Emergency rescue** guidance  
- 🏥 **Veterinary recommendations**
- 🏠 **Shelter information**
- 💚 **Adoption guidance**
- 🐾 **Animal care tips**

How can I assist you today? Use the quick actions below or type your question!`,
  timestamp: new Date(),
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shrink-0">
        <FaRobot className="text-white text-xs" />
      </div>
      <div className="chat-bubble-bot flex items-center gap-1.5 py-3">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function renderMarkdown(text) {
  // Process line by line for lists, then inline for bold/italic
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return <div key={i} className="flex gap-2 my-0.5"><span className="font-bold text-primary-500 shrink-0">{numMatch[1]}.</span><span dangerouslySetInnerHTML={{ __html: inlineFormat(numMatch[2]) }} /></div>;
    }
    // Bullet list
    const bulletMatch = line.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      return <div key={i} className="flex gap-2 my-0.5"><span className="text-primary-500 shrink-0 mt-0.5">•</span><span dangerouslySetInnerHTML={{ __html: inlineFormat(bulletMatch[1]) }} /></div>;
    }
    // Heading
    if (line.startsWith('### ')) return <p key={i} className="font-bold text-sm mt-2" dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(4)) }} />;
    if (line.startsWith('## ')) return <p key={i} className="font-bold text-sm mt-2" dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(3)) }} />;
    // Empty line = spacing
    if (!line.trim()) return <div key={i} className="h-1" />;
    // Normal line
    return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />;
  });
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">$1</code>');
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shrink-0">
          <FaRobot className="text-white text-xs" />
        </div>
      )}
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}>
        <div className="text-sm leading-relaxed">
          {isUser ? msg.content : renderMarkdown(msg.content)}
        </div>
        <p className={`text-xs mt-1 ${isUser ? 'text-primary-200' : 'text-gray-400'}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading) return;

    const userMsg = { role: 'user', content: msgText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m !== WELCOME_MESSAGE)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await axios.post('/api/chat', {
        message: msgText,
        sessionId,
        history,
      });

      const botMsg = {
        role: 'model',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: '⚠️ Sorry, I couldn\'t connect to the AI service. Please check your internet connection or try again later.\n\nFor emergencies, call your local animal rescue helpline.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white dark:bg-gray-800 text-sm px-3 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              🐾 Need help rescuing an animal?
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Open AI Assistant"
          className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-2xl shadow-primary-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
                <FaTimes className="text-white text-xl" />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }}>
                <FaPaw className="text-white text-2xl" />
              </motion.span>
            )}
          </AnimatePresence>
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`fixed z-50 bottom-28 right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-[90vw] h-[80vh] max-w-2xl'
                : 'w-80 sm:w-96 h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaRobot className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AniBot</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-primary-100 text-xs">Animal Welfare AI</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsExpanded((e) => !e)}
                  className="text-white/70 hover:text-white p-1 transition-colors" title="Expand">
                  {isExpanded ? <FaCompress size={13} /> : <FaExpand size={13} />}
                </button>
                <button onClick={clearChat}
                  className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  Clear
                </button>
                <button onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white p-1 transition-colors">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-3 pb-2 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="shrink-0 text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 shrink-0">
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about animal rescue..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none resize-none max-h-24 leading-relaxed"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors shrink-0 self-end"
                >
                  <FaPaperPlane size={13} />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-1.5">
                Powered by Google Gemini AI 🤖
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
