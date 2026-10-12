import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  LogOut, 
  Globe, 
  User, 
  CheckSquare, 
  Search,
  Menu,
  X,
  PhoneCall,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Lock,
  Unlock,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { translations } from './data/translations';
import { Language } from './types';
import ArticlesSection from './components/ArticlesSection';
import AmelChat from './components/AmelChat';
import ForumQA from './components/ForumQA';
import QuizSection from './components/QuizSection';
import ClinicianDashboard from './components/ClinicianDashboard';
import ResourceMap from './components/ResourceMap';
import { articles } from './data/articles';
import { quizzes } from './data/quizzes';
import { fetchWithRetry } from './utils/api';

export default function App() {
  const [language, setLanguage] = useState<Language>('fr');
  const [userRole, setUserRole] = useState<'youth' | 'pro'>('youth');
  const [activeTab, setActiveTab] = useState<'home' | 'articles' | 'chat' | 'qa' | 'quizzes' | 'map'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clinician Authentication & Security State
  const [isClinicianAuth, setIsClinicianAuth] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Global search and dynamic data states
  const [searchQuery, setSearchQuery] = useState('');
  const [qaQuestions, setQaQuestions] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>(articles);
  const [initialArticleId, setInitialArticleId] = useState<string | null>(null);
  const [initialQuizId, setInitialQuizId] = useState<string | null>(null);
  const [initialQuestionId, setInitialQuestionId] = useState<string | null>(null);

  // Fetch all questions for real-time global search index
  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const res = await fetchWithRetry('/api/questions', undefined, 4, 800);
        if (res.ok) {
          const data = await res.json();
          setQaQuestions(data);
        }
      } catch (err) {
        console.error("Error fetching questions in App:", err);
      }
    };
    fetchAllQuestions();
    const interval = setInterval(fetchAllQuestions, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dynamic articles from SQLite to include newly published clinician articles
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const res = await fetchWithRetry('/api/articles', undefined, 4, 800);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllArticles(data);
          }
        }
      } catch (err) {
        console.error("Error fetching dynamic articles in App:", err);
      }
    };
    fetchAllArticles();
    const interval = setInterval(fetchAllArticles, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute matched resources across the platform using dynamic allArticles
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();

    const matchedArticles = allArticles.filter((article) => {
      const title = (article.title[language] || '').toLowerCase();
      const summary = (article.summary[language] || '').toLowerCase();
      const content = (article.content[language] || '').toLowerCase();
      return title.includes(query) || summary.includes(query) || content.includes(query);
    });

    const matchedQuizzes = quizzes.filter((quiz) => {
      const statement = (quiz.statement[language] || '').toLowerCase();
      const explanation = (quiz.explanation[language] || '').toLowerCase();
      return statement.includes(query) || explanation.includes(query);
    });

    const matchedQA = qaQuestions.filter((qa) => {
      const question = (qa.question || '').toLowerCase();
      const answer = (qa.answer || '').toLowerCase();
      return question.includes(query) || answer.includes(query);
    });

    return {
      articles: matchedArticles,
      quizzes: matchedQuizzes,
      qa: matchedQA,
      totalCount: matchedArticles.length + matchedQuizzes.length + matchedQA.length
    };
  }, [searchQuery, language, qaQuestions, allArticles]);

  const handleSelectArticle = (id: string) => {
    setInitialArticleId(id);
    setActiveTab('articles');
    setSearchQuery('');
  };

  const handleSelectQuiz = (id: string) => {
    setInitialQuizId(id);
    setActiveTab('quizzes');
    setSearchQuery('');
  };

  const handleSelectQA = (id: string) => {
    setInitialQuestionId(id);
    setActiveTab('qa');
    setSearchQuery('');
  };

  const t = translations[language];

  // Helper for bottom nav or general tab switching
  const handleTabChange = (tab: 'home' | 'articles' | 'chat' | 'qa' | 'quizzes' | 'map') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Bouton d'urgence : redirection discrète immédiate
  const handleQuickExit = () => {
    window.location.replace('https://fr.wikipedia.org/wiki/Tunisie');
  };

  const handleSelectProRole = () => {
    if (isClinicianAuth) {
      setUserRole('pro');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleClinicianLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/auth/clinician', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsClinicianAuth(true);
        sessionStorage.setItem('docsexprime_clinician_auth', 'true');
        setShowAuthModal(false);
        setUserRole('pro');
        setPasscodeInput('');
        return;
      }

      setAuthError(data.error || (language === 'fr' ? 'Code d\'accès incorrect' : 'رمز غير صحيح'));
    } catch {
      setAuthError(language === 'fr' ? 'Erreur de connexion au service d\'authentification.' : 'خطأ في خدمة المصادقة.');
    }
  };

  const handleClinicianLogout = () => {
    setIsClinicianAuth(false);
    sessionStorage.removeItem('docsexprime_clinician_auth');
    setUserRole('youth');
    setActiveTab('home');
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-900 pb-16 md:pb-0">
      
      {/* National Emergency Hotline Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white text-[11px] py-1 px-4 text-center border-b border-indigo-900/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 mx-auto">
          <PhoneCall size={12} className="text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {language === 'ar' 
              ? 'طوارئ وطنية مجانية: 1899 (استماع وحماية 24/24) | ديوان الأسرة (ONFP) في 24 ولاية'
              : language === 'en'
              ? 'Free National Helpline: 1899 (Violence & Support 24/7) | ONFP Centers in all 24 governorates'
              : 'Ligne Verte Nationale Gratuite : 1899 (Écoute & violences 24h/24) | Centres ONFP dans les 24 gouvernorats'}
          </span>
        </div>
        <span className="text-[10px] text-indigo-400 font-bold hidden lg:block bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
          v3.0 Mobile
        </span>
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800/80 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-950/40">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold tracking-tight text-white text-base md:text-lg">
                  DocSexprime
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-900/30">
                  v3.0 🇹🇳
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Master Sexologie Clinique
              </p>
            </div>
          </div>

          {/* Right Controls: Desktop Nav & Lang Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Quick Exit Confidentiality Button */}
            <button
              onClick={handleQuickExit}
              title={t.quickExit}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
            >
              <ShieldAlert size={14} />
              <span className="hidden sm:inline">{t.quickExit}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'fr' ? 'bg-slate-850 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'ar' ? 'bg-slate-850 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'en' ? 'bg-slate-850 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                EN
              </button>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                onClick={() => {
                  setUserRole('youth');
                  setActiveTab('home');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  userRole === 'youth'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User size={13} />
                <span className="hidden md:inline">{t.roleYouth}</span>
              </button>
              <button
                onClick={handleSelectProRole}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  userRole === 'pro'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isClinicianAuth ? <Unlock size={13} /> : <Lock size={13} />}
                <span className="hidden md:inline">{t.rolePro}</span>
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl md:hidden transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] bg-[#0F172A] z-30 p-6 flex flex-col gap-6 border-b border-slate-800 md:hidden animate-fade-in text-white">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3">
              Navigation
            </h4>
            <button
              onClick={() => handleTabChange('home')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => handleTabChange('articles')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'articles' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.articlesTitle}
            </button>
            <button
              onClick={() => handleTabChange('chat')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.chat}
            </button>
            <button
              onClick={() => handleTabChange('qa')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'qa' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.anonymousQA}
            </button>
            <button
              onClick={() => handleTabChange('quizzes')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'quizzes' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.quizzes}
            </button>
            <button
              onClick={() => handleTabChange('map')}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'map' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.map}
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* Real-time Global Search Bar Section */}
        {userRole === 'youth' && (
          <div className="relative max-w-2xl mx-auto mb-8 z-20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'fr' 
                    ? "Rechercher un article, un quiz ou une question..." 
                    : language === 'ar' 
                      ? "ابحث عن مقال، اختبار، أو سؤال وجواب..." 
                      : "Search for an article, quiz, or Q&A topic..."
                }
                className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none text-slate-800 rounded-2xl pl-11 pr-12 py-3.5 text-sm transition-all shadow-md font-medium"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              ) : (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-350 pointer-events-none text-[10px] font-bold">
                  CTRL + K
                </div>
              )}
            </div>

            {/* Real-time Search Results Panel */}
            {searchResults && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-[480px] overflow-y-auto overflow-x-hidden p-4 space-y-4 animate-scale-up">
                
                {/* Search Header Info */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>
                    {language === 'fr' ? 'Résultats de recherche' : language === 'ar' ? 'نتائج البحث' : 'Search Results'}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-extrabold text-[10px]">
                    {searchResults.totalCount} {language === 'fr' ? 'trouvés' : language === 'ar' ? 'تم العثور عليها' : 'found'}
                  </span>
                </div>

                {searchResults.totalCount === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    {language === 'fr' 
                      ? "Aucun résultat trouvé pour votre recherche. Essayez d'autres mots-clés !" 
                      : language === 'ar' 
                        ? "لم نجد أي نتائج لبحثك. جرب كلمات مفاتيح أخرى!" 
                        : "No results found. Try using different keywords!"}
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    {/* Articles Category */}
                    {searchResults.articles.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block bg-indigo-50/50 px-2.5 py-1 rounded-md w-fit">
                          {translations[language].articlesTitle} (📚)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {searchResults.articles.map(art => (
                            <button
                              key={art.id}
                              onClick={() => handleSelectArticle(art.id)}
                              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center justify-between gap-3 group"
                            >
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                  {art.title[language]}
                                </h5>
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate leading-relaxed">
                                  {art.summary[language]}
                                </p>
                              </div>
                              <ChevronRight size={14} className="text-slate-450 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quizzes Category */}
                    {searchResults.quizzes.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block bg-emerald-50/50 px-2.5 py-1 rounded-md w-fit">
                          {translations[language].quizTitle} (🧠)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {searchResults.quizzes.map(quiz => (
                            <button
                              key={quiz.id}
                              onClick={() => handleSelectQuiz(quiz.id)}
                              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center justify-between gap-3 group"
                            >
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                                  "{quiz.statement[language]}"
                                </h5>
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate leading-relaxed">
                                  {quiz.explanation[language]}
                                </p>
                              </div>
                              <ChevronRight size={14} className="text-slate-450 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Q&A Topics Category */}
                    {searchResults.qa.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block bg-amber-50/50 px-2.5 py-1 rounded-md w-fit">
                          {translations[language].anonymousQA} (💬)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {searchResults.qa.map(qaItem => (
                            <button
                              key={qaItem.id}
                              onClick={() => handleSelectQA(qaItem.id)}
                              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center justify-between gap-3 group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                    {qaItem.answer ? (language === 'fr' ? 'Répondu' : 'تمت الإجابة') : (language === 'fr' ? 'En attente' : 'في الانتظار')}
                                  </span>
                                  {qaItem.authorAge && (
                                    <span className="text-[9px] text-slate-400 font-medium">
                                      Anonyme, {qaItem.authorAge} ans
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate">
                                  {qaItem.question}
                                </h5>
                                {qaItem.answer && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 truncate leading-relaxed italic">
                                    {qaItem.answer}
                                  </p>
                                )}
                              </div>
                              <ChevronRight size={14} className="text-slate-450 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Intro Hero Section (Visible only on Home for Youth) */}
        {userRole === 'youth' && activeTab === 'home' && (
          <div className="space-y-8 mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 md:p-12 shadow-sm">
              {/* Subtle indigo gradient blob */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative max-w-2xl space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full border border-indigo-100">
                  Projet Master Sexologie Clinique 🎓
                </span>
                <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-slate-900 leading-tight">
                  {t.title}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  {t.headerDesc}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleTabChange('chat')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-200"
                  >
                    <Sparkles size={14} />
                    {t.chat}
                  </button>
                  <button
                    onClick={() => handleTabChange('qa')}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 shadow-sm"
                  >
                    <HelpCircle size={14} />
                    {t.anonymousQA}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick stats and help banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">3 Langues</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Français, Derja et Anglais</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">100% Anonyme</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Pas d'inscription requise</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <PhoneCall size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Aide & Soutien : 1899</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Numéro vert national Tunisie</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Desktop only) */}
        {userRole === 'youth' && (
          <div className="hidden md:flex items-center gap-2 border-b border-slate-200 mb-8 pb-px">
            <button
              onClick={() => handleTabChange('home')}
              className={`px-5 py-3 text-xs font-bold border-b-2 tracking-wide transition-all ${
                activeTab === 'home'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => handleTabChange('articles')}
              className={`px-5 py-3 text-xs font-bold border-b-2 tracking-wide transition-all ${
                activeTab === 'articles'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.articlesTitle}
            </button>
            <button
              onClick={() => handleTabChange('chat')}
              className={`px-5 py-3 text-xs font-bold border-b-2 tracking-wide transition-all ${
                activeTab === 'chat'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.chat}
            </button>
            <button
              onClick={() => handleTabChange('qa')}
              className={`px-5 py-3 text-xs font-bold border-b-2 tracking-wide transition-all ${
                activeTab === 'qa'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.anonymousQA}
            </button>
            <button
              onClick={() => handleTabChange('quizzes')}
              className={`px-5 py-3 text-xs font-bold border-b-2 tracking-wide transition-all ${
                activeTab === 'quizzes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.quizzes}
            </button>
            <button
              onClick={() => handleTabChange('map')}
              className={`px-5 py-3 text-xs font-bold border-b-2 tracking-wide transition-all ${
                activeTab === 'map'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.map}
            </button>
          </div>
        )}

        {/* Dynamic Youth Content tabs */}
        {userRole === 'youth' && (
          <div>
            {activeTab === 'home' && (
              <div className="space-y-12">
                <ArticlesSection 
                  language={language} 
                  initialArticleId={initialArticleId}
                  onClearInitialArticle={() => setInitialArticleId(null)}
                />
              </div>
            )}
            {activeTab === 'articles' && (
              <ArticlesSection 
                language={language} 
                initialArticleId={initialArticleId}
                onClearInitialArticle={() => setInitialArticleId(null)}
              />
            )}
            {activeTab === 'chat' && <AmelChat language={language} />}
            {activeTab === 'qa' && (
              <ForumQA 
                language={language} 
                initialQuestionId={initialQuestionId}
                onClearInitialQuestion={() => setInitialQuestionId(null)}
              />
            )}
            {activeTab === 'quizzes' && (
              <QuizSection 
                language={language} 
                initialQuizId={initialQuizId}
                onClearInitialQuiz={() => setInitialQuizId(null)}
              />
            )}
            {activeTab === 'map' && <ResourceMap language={language} />}
          </div>
        )}

        {/* Clinician Dashboard (Visible only to Pro) */}
        {userRole === 'pro' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <UserCheck size={12} />
                    Espace Praticien Certifié
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Session sécurisée</span>
                </div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-slate-800 mt-2">
                  {t.clinicianPortal}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t.clinicianPortalDesc}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/export/qa"
                  download="docsexprime_qa_export.json"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {t.exportData}
                </a>
                <button
                  onClick={handleClinicianLogout}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock size={13} />
                  {t.authLock}
                </button>
              </div>
            </div>

            <ClinicianDashboard language={language} />
          </div>
        )}

      </main>

      {/* Clinician Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <Lock size={20} />
                <h3 className="font-bold text-base text-slate-900">{t.authModalTitle}</h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.authModalDesc}
            </p>

            <form onSubmit={handleClinicianLogin} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder={t.authPasscodePlaceholder}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  autoFocus
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Code praticien démo : <code className="font-bold text-slate-600">DOCSEXPRIME2026</code>
                </span>
              </div>

              {authError && (
                <p className="text-xs text-rose-600 font-medium">{authError}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  {t.authUnlock}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Native Bottom Navigation Bar */}
      {userRole === 'youth' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around py-2 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => handleTabChange('home')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'home' ? 'bg-indigo-50' : ''}`}>
              <Heart size={18} />
            </div>
            <span className="text-[10px]">{t.home}</span>
          </button>

          <button
            onClick={() => handleTabChange('articles')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'articles' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'articles' ? 'bg-indigo-50' : ''}`}>
              <BookOpen size={18} />
            </div>
            <span className="text-[10px]">{t.articlesTitle}</span>
          </button>

          <button
            onClick={() => handleTabChange('chat')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'chat' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'chat' ? 'bg-indigo-50' : ''}`}>
              <Sparkles size={18} />
            </div>
            <span className="text-[10px]">Amel IA</span>
          </button>

          <button
            onClick={() => handleTabChange('qa')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'qa' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'qa' ? 'bg-indigo-50' : ''}`}>
              <MessageSquare size={18} />
            </div>
            <span className="text-[10px]">{t.qa}</span>
          </button>

          <button
            onClick={() => handleTabChange('quizzes')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'quizzes' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'quizzes' ? 'bg-indigo-50' : ''}`}>
              <CheckSquare size={18} />
            </div>
            <span className="text-[10px]">{t.quizzes}</span>
          </button>

          <button
            onClick={() => handleTabChange('map')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'map' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'map' ? 'bg-indigo-50' : ''}`}>
              <MapPin size={18} />
            </div>
            <span className="text-[10px]">{t.map}</span>
          </button>
        </nav>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
            <div>
              <p className="font-bold text-slate-800 text-sm">DocSexprime Tunisie v3.0</p>
              <p className="mt-1">{t.headerDesc}</p>
            </div>
            <div className="flex gap-4">
              <span className="text-indigo-600 font-semibold">ADLI & ONFP Partner 🇹🇳</span>
              <span>Master Sexologie Clinique — 2026</span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-slate-600">
            {t.legalDisclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}
