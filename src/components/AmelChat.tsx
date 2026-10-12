import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { translations } from '../data/translations';

interface AmelChatProps {
  language: Language;
}

export default function AmelChat({ language }: AmelChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message depending on language
  useEffect(() => {
    const welcomeMessages = {
      fr: "Bonjour ! Je suis Amel, votre conseillère en sexologie clinique. Posez-moi vos questions en toute confidentialité, sans tabou. Comment puis-je vous aider aujourd'hui ?",
      ar: "عسلامة! أنا أمل، مستشارتك الافتراضية في علم الجنس العيadi. تنجم تسألني أي سؤال بكل سرية وبدون حرج. كيفاش ننجم نعاونك اليوم؟",
      en: "Hello! I am Amel, your virtual clinical sexology advisor. Feel free to ask your questions in complete confidentiality and without judgment. How can I help you today?"
    };

    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeMessages[language],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue;
    setInputValue('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/amel-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessageText,
          language: language,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('API server error');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: language === 'fr' 
          ? "Désolé, j'ai rencontré un problème de connexion. Veuillez réessayer." 
          : language === 'ar' 
          ? "عذراً، حدث خطأ في الاتصال بالسيرفر. يرجى المحاولة مرة أخرى." 
          : "Sorry, I encountered a connection issue. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm(language === 'fr' ? "Effacer la conversation ?" : language === 'ar' ? "حذف المحادثة؟" : "Clear conversation?")) {
      const welcomeMessages = {
        fr: "Bonjour ! Je suis Amel, votre conseillère en sexologie clinique. Posez-moi vos questions en toute confidentialité, sans tabou. Comment puis-je vous aider aujourd'hui ?",
        ar: "عسلامة! أنا أمل، مستشارتك الافتراضية في علم الجنس العيادي. تنجم تسألني أي سؤال بكل سرية وبدون حرج. كيفاش ننجم نعاونك اليوم؟",
        en: "Hello! I am Amel, your virtual clinical sexology advisor. Feel free to ask your questions in complete confidentiality and without judgment. How can I help you today?"
      };
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: welcomeMessages[language],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div id="amel-chat-container" className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
            A
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-slate-800">Amel</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'fr' ? 'Conseillère IA Clinique' : language === 'ar' ? 'مستشارة عيادية ذكية' : 'Clinical AI Advisor'}
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
          title={language === 'fr' ? 'Effacer la conversation' : language === 'ar' ? 'مسح المحادثة' : 'Clear conversation'}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Warning Alert */}
      <div className="bg-indigo-50/40 border-b border-indigo-100/50 px-4 py-2.5 flex items-center gap-2 text-xs text-indigo-700 font-medium">
        <Sparkles size={14} className="text-indigo-600 shrink-0" />
        <span>
          {language === 'fr' 
            ? "Anonymat garanti. Réponses fondées sur la sexologie clinique et adaptées à notre culture."
            : language === 'ar'
            ? "سرية تامة ومضمونة. إجابات علمية مستندة لعلم الجنس العيادي ومتوافقة مع مجتمعنا."
            : "Guaranteed anonymity. Scientifically grounded answers adapted to our Tunisian cultural context."}
        </span>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((message) => {
          const isAssistant = message.sender === 'assistant';
          return (
            <div
              key={message.id}
              className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  isAssistant
                    ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <div className="mt-1 flex items-center justify-end">
                  <span className={`text-[10px] ${isAssistant ? 'text-slate-400' : 'text-indigo-200'}`}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200 shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-indigo-600" size={16} />
              <span className="text-xs text-slate-500">
                {language === 'fr' ? 'Amel réfléchit...' : language === 'ar' ? 'أمل تفكر...' : 'Amel is writing...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions suggestion */}
      {messages.length === 1 && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-150 flex gap-2 overflow-x-auto no-scrollbar">
          {(language === 'fr' ? [
            "Qu'est-ce que la puberté ?",
            "Parler de consentement en couple",
            "La Loi 58 tunisienne protège-t-elle les nudes ?",
            "Où faire un test IST à Tunis ?"
          ] : language === 'ar' ? [
            "شنوة يعنى البلوغ ؟",
            "شنوة يقول القانون 58 على الابتزاز ؟",
            "كيفاش نسأل الطبيب على منع الحمل ؟",
            "أين توجد مراكز الديوان الوطني للأسرة ?"
          ] : [
            "What happens during puberty?",
            "How does Law 58 protect my privacy?",
            "Where can I find free contraception?",
            "What is healthy relationship consent?"
          ]).map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInputValue(q)}
              className="shrink-0 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-800 text-xs px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-150 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={translations[language].chatInputPlaceholder}
          disabled={isLoading}
          className="flex-1 bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-800 rounded-xl px-4 py-3 text-sm transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
