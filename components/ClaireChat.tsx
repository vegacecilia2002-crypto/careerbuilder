import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { createClaireChat } from '../services/geminiService';
import { useJobContext } from '../context/JobContext';
import { GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ClaireChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Claire, your AI career companion. I can help with resume tips, interview prep, or just analyzing your job search progress. How can I help today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { jobs } = useJobContext();
  const chatSession = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session
  useEffect(() => {
    if (!chatSession.current) {
      chatSession.current = createClaireChat();
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const getJobStatsContext = () => {
    const applied = jobs.length;
    const interviews = jobs.filter(j => j.status === 'Interview').length;
    const offers = jobs.filter(j => j.status === 'Offer').length;
    // Calculate simple conversion rate
    const conversion = applied > 0 ? ((interviews / applied) * 100).toFixed(0) : 0;
    
    return `
      Current Job Stats:
      - Total Applications: ${applied}
      - Interviews: ${interviews}
      - Offers: ${offers}
      - Interview Conversion Rate: ${conversion}%
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Inject context seamlessly into the message if it's the first time or periodically? 
      // A simple way is to prepend stats to the user message invisibly or just send it.
      // For this implementation, we prepend stats context to the prompt if it's a "status" related question, 
      // but to be robust, let's just prepend it always but ask the model to ignore if irrelevant.
      // Actually, standard practice: Send context as part of the message.
      
      const context = getJobStatsContext();
      const fullMessage = `[System Context: ${context}]\n\nUser Query: ${userMsg}`;

      const result = await chatSession.current.sendMessageStream({ message: fullMessage });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1].text = fullResponse;
            return newArr;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-emerald-600 text-white rounded-full shadow-xl hover:bg-emerald-700 transition-all z-50 hover:scale-105 group"
        >
          <Sparkles size={24} className="group-hover:animate-pulse" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold">Claire</h3>
                <p className="text-xs text-emerald-100">AI Career Companion</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm prose prose-sm prose-p:my-1 prose-ul:my-1'
                }`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                 </div>
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask for advice..."
                className="flex-1 px-4 py-2 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-900"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};