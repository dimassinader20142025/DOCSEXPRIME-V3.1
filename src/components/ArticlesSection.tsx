import { useState, useEffect } from 'react';
import { Search, ChevronRight, X, Heart, ShieldAlert, BookOpen, Layers, Video, Play, Pause, Square, Volume2, Sparkles, VolumeX } from 'lucide-react';
import { RubricId, Article, Language } from '../types';
import { rubrics, articles as staticArticles } from '../data/articles';
import { translations } from '../data/translations';
import { fetchWithRetry } from '../utils/api';

interface ArticlesSectionProps {
  language: Language;
  initialArticleId?: string | null;
  onClearInitialArticle?: () => void;
}

export default function ArticlesSection({ language, initialArticleId, onClearInitialArticle }: ArticlesSectionProps) {
  const [selectedRubric, setSelectedRubric] = useState<RubricId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openedArticleId, setOpenedArticleId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>(staticArticles);

  // TTS & Audio State
  const [ttsMode, setTtsMode] = useState<'amel' | 'browser'>('amel');
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [isPausedTts, setIsPausedTts] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // HTML5 Audio ref for Amel AI
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  // Browser Speech Synthesis voices
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState<string>('');

  // Format audio seconds helper
  const formatAudioTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Load Speech Synthesis Voices for browser mode
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setBrowserVoices(availableVoices);

        // Find a default voice for the current language
        const defaultVoice = availableVoices.find(v =>
          v.lang.startsWith(language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'fr')
        );
        if (defaultVoice) {
          setSelectedBrowserVoice(defaultVoice.name);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, openedArticleId]);

  // Clean up previous HTML5 audio and speech synthesis if article changes or modal closes
  useEffect(() => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTts(false);
    setIsPausedTts(false);
    setTtsError(null);
    setAudioCurrentTime(0);
  }, [openedArticleId]);

  const playTts = async () => {
    const openedArticle = articles.find((a) => a.id === openedArticleId);
    if (!openedArticle) return;
    setTtsError(null);

    const textToSpeak = `${openedArticle.title[language]}. ${openedArticle.summary[language]}. ${openedArticle.content[language]}`;

    if (ttsMode === 'browser') {
      // Browser Speech Synthesis
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setTtsError(language === 'fr'
          ? "Votre navigateur ne supporte pas la synthèse vocale."
          : "متصفحك لا يدعم توليد الصوت.");
        return;
      }

      if (isPausedTts) {
        window.speechSynthesis.resume();
        setIsPausedTts(false);
        setIsPlayingTts(true);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      if (selectedBrowserVoice) {
        const voiceObj = browserVoices.find(v => v.name === selectedBrowserVoice);
        if (voiceObj) utterance.voice = voiceObj;
      }

      utterance.lang = language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = ttsSpeed;

      utterance.onend = () => {
        setIsPlayingTts(false);
        setIsPausedTts(false);
      };

      utterance.onerror = () => {
        setIsPlayingTts(false);
        setIsPausedTts(false);
      };

      setIsPlayingTts(true);
      setIsPausedTts(false);
      window.speechSynthesis.speak(utterance);

    } else {
      // Amel AI Voice (Gemini backend)
      if (audioElement) {
        audioElement.play();
        setIsPlayingTts(true);
        setIsPausedTts(false);
        return;
      }

      setTtsLoading(true);
      try {
        const response = await fetch('/api/articles/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSpeak,
            language
          })
        });

        if (!response.ok) {
          throw new Error('TTS service failed');
        }

        const data = await response.json();
        if (!data.audio) {
          throw new Error('No audio returned');
        }

        const audio = new Audio(data.audio);
        audio.playbackRate = ttsSpeed;

        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
          setAudioCurrentTime(audio.currentTime);
        });

        audio.addEventListener('ended', () => {
          setIsPlayingTts(false);
          setIsPausedTts(false);
          setAudioCurrentTime(0);
        });

        audio.addEventListener('error', () => {
          setTtsError(language === 'fr' ? 'Erreur lors de la lecture audio.' : 'فشل تشغيل الملف الصوتي.');
          setIsPlayingTts(false);
          setIsPausedTts(false);
        });

        setAudioElement(audio);
        audio.play();
        setIsPlayingTts(true);
        setIsPausedTts(false);
      } catch (err) {
        console.error(err);
        // Automatically fallback to browser mode on API failure
        setTtsError(language === 'fr'
          ? "L'assistant vocal intelligent est indisponible. Basculement sur la voix système..."
          : "الخدمة الصوتية الذكية غير متاحة حالياً. تم الانتقال إلى الصوت المحلي للنظام...");
        setTtsMode('browser');
      } finally {
        setTtsLoading(false);
      }
    }
  };

  const pauseTts = () => {
    if (ttsMode === 'browser') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.pause();
        setIsPausedTts(true);
        setIsPlayingTts(false);
      }
    } else {
      if (audioElement) {
        audioElement.pause();
        setIsPausedTts(true);
        setIsPlayingTts(false);
      }
    }
  };

  const stopTts = () => {
    if (ttsMode === 'browser') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlayingTts(false);
        setIsPausedTts(false);
      }
    } else {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        setIsPlayingTts(false);
        setIsPausedTts(false);
        setAudioCurrentTime(0);
      }
    }
  };

  const handleTtsSpeedChange = () => {
    const nextSpeed = ttsSpeed === 1 ? 1.25 : ttsSpeed === 1.25 ? 1.5 : ttsSpeed === 1.5 ? 0.85 : 1;
    setTtsSpeed(nextSpeed);

    if (ttsMode === 'browser') {
      if (isPlayingTts || isPausedTts) {
        window.speechSynthesis.cancel();
        setIsPlayingTts(false);
        setIsPausedTts(false);
        setTimeout(() => {
          // Re-trigger with new rate
          const openedArticle = articles.find((a) => a.id === openedArticleId);
          if (!openedArticle) return;
          const textToSpeak = `${openedArticle.title[language]}. ${openedArticle.summary[language]}. ${openedArticle.content[language]}`;
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          if (selectedBrowserVoice) {
            const voiceObj = browserVoices.find(v => v.name === selectedBrowserVoice);
            if (voiceObj) utterance.voice = voiceObj;
          }
          utterance.lang = language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR';
          utterance.rate = nextSpeed;
          utterance.onend = () => {
            setIsPlayingTts(false);
            setIsPausedTts(false);
          };
          utterance.onerror = () => {
            setIsPlayingTts(false);
            setIsPausedTts(false);
          };
          setIsPlayingTts(true);
          setIsPausedTts(false);
          window.speechSynthesis.speak(utterance);
        }, 100);
      }
    } else {
      if (audioElement) {
        audioElement.playbackRate = nextSpeed;
      }
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetchWithRetry('/api/articles', undefined, 4, 800);
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
      }
    };
    fetchArticles();
    // Poll for real-time additions/deletions every 10 seconds (slightly relaxed)
    const interval = setInterval(fetchArticles, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (initialArticleId && articles.length > 0) {
      const article = articles.find((a) => a.id === initialArticleId);
      if (article) {
        setSelectedRubric('all');
        setOpenedArticleId(initialArticleId);
      }
      if (onClearInitialArticle) {
        onClearInitialArticle();
      }
    }
  }, [initialArticleId, articles, onClearInitialArticle]);

  // Search filter
  const filteredArticles = articles.filter((article) => {
    // Rubric filter
    if (selectedRubric !== 'all' && article.rubricId !== selectedRubric) {
      return false;
    }
    // Query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const title = article.title[language].toLowerCase();
      const summary = article.summary[language].toLowerCase();
      const content = article.content[language].toLowerCase();
      return title.includes(query) || summary.includes(query) || content.includes(query);
    }
    return true;
  });

  const openedArticle = articles.find((a) => a.id === openedArticleId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={translations[language].searchPlaceholder}
          className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Rubrics Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Layers size={16} className="text-indigo-600" />
          {translations[language].rubricsTitle}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedRubric('all')}
            className={`px-4 py-3 rounded-xl border text-xs font-semibold text-center transition-all ${
              selectedRubric === 'all'
                ? 'bg-indigo-600 text-white border-transparent'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
          >
            {language === 'fr' ? 'Tous les articles' : language === 'ar' ? 'جميع المقالات' : 'All articles'}
          </button>
          {rubrics.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRubric(r.id)}
              className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                selectedRubric === r.id
                  ? 'bg-indigo-600 text-white border-transparent'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
              }`}
            >
              {r.title[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-600" />
          {translations[language].articlesTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm">
              {language === 'fr' 
                ? "Aucun article trouvé correspondant à vos critères." 
                : "لم نجد أي مقال يطابق بحثك."}
            </div>
          ) : (
            filteredArticles.map((article) => {
              const rubric = rubrics.find((r) => r.id === article.rubricId);
              return (
                <div
                  key={article.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100/50">
                        {rubric?.title[language]}
                      </span>
                      {article.scientific && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100/50 flex items-center gap-1">
                          🔬 {language === 'fr' ? 'Sexologie Clinique (Scientifique)' : language === 'ar' ? 'علم الجنس السريري (علمي)' : 'Clinical Sexology (Scientific)'}
                        </span>
                      )}
                      {article.videoUrl && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100/50 flex items-center gap-1">
                          <Video size={10} />
                          {language === 'fr' ? 'Vidéo incluse' : language === 'ar' ? 'فيديو متاح' : 'Video available'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-display font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {article.title[language]}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {article.summary[language]}
                    </p>
                  </div>
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setOpenedArticleId(article.id)}
                      className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      {language === 'fr' ? 'Lire la suite' : language === 'ar' ? 'اقرأ المقال كاملاً' : 'Read Article'}
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Article Detail Modal */}
      {openedArticle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex justify-between items-start gap-4 bg-slate-50">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                    {rubrics.find((r) => r.id === openedArticle.rubricId)?.title[language]}
                  </span>
                  {openedArticle.scientific && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                      🔬 {language === 'fr' ? 'Ressource Scientifique Clinique' : language === 'ar' ? 'مصدر علمي عيادي' : 'Clinical Scientific Resource'}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mt-2.5">
                  {openedArticle.title[language]}
                </h3>
              </div>
              <button
                onClick={() => setOpenedArticleId(null)}
                className="p-2 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full border border-slate-200 shadow-sm transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-700 leading-relaxed text-[15px]">
              {/* Image banner if present */}
              {openedArticle.imageUrl && !openedArticle.videoUrl && (
                <img
                  src={
                    openedArticle.imageUrl.startsWith('http')
                      ? openedArticle.imageUrl
                      : `https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80`
                  }
                  alt={openedArticle.title[language]}
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-cover rounded-2xl border border-slate-200"
                />
              )}

              {/* Video Embed block */}
              {openedArticle.videoUrl && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Video size={14} className="text-emerald-600" />
                    {language === 'fr' ? 'Vidéo Éducative de Sexologie' : language === 'ar' ? 'فيديو توضيحي في علم الجنس' : 'Educational Sexology Video'}
                  </span>
                  <div className="rounded-2xl overflow-hidden shadow-md bg-black aspect-video relative border border-slate-200">
                    {openedArticle.videoUrl.includes('youtube') || openedArticle.videoUrl.includes('embed') || openedArticle.videoUrl.includes('vimeo') ? (
                      <iframe
                        src={openedArticle.videoUrl}
                        className="w-full h-full absolute inset-0 border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        src={openedArticle.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Clinical summary accent */}
              <div className="bg-indigo-50/50 border-l-4 border-indigo-600 rounded-r-xl p-4 italic text-slate-600 text-sm">
                "{openedArticle.summary[language]}"
              </div>

              {/* Listen to Article Audio Player */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Volume2 size={20} className={isPlayingTts ? "animate-pulse" : ""} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {language === 'fr' ? "Lecture vocale de l'article" : language === 'ar' ? "الاستماع الصوتي للمقال" : "Listen to Article"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {language === 'fr' ? "Faites lire l'article à voix haute" : language === 'ar' ? "استمع للمقال بصوت طبيعي" : "Listen to the full article text"}
                      </p>
                    </div>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex bg-slate-200/60 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
                    <button
                      onClick={() => { stopTts(); setTtsMode('amel'); }}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        ttsMode === 'amel'
                          ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Sparkles size={12} className="text-indigo-500" />
                      {language === 'fr' ? 'Voix Amel (IA)' : language === 'ar' ? 'صوت أمل (ذكاء)' : 'Amel AI Voice'}
                    </button>
                    <button
                      onClick={() => { stopTts(); setTtsMode('browser'); }}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        ttsMode === 'browser'
                          ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Volume2 size={12} />
                      {language === 'fr' ? 'Système' : language === 'ar' ? 'صوت النظام' : 'System Voice'}
                    </button>
                  </div>
                </div>

                {ttsError && (
                  <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl p-3 flex gap-2">
                    <span className="font-bold">⚠️</span>
                    <p className="leading-relaxed">{ttsError}</p>
                  </div>
                )}

                {/* Controls Area */}
                <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Play/Pause Button */}
                    <button
                      onClick={playTts}
                      disabled={ttsLoading}
                      className={`p-3.5 rounded-full text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                        ttsLoading 
                          ? 'bg-slate-300' 
                          : isPlayingTts 
                            ? 'bg-amber-500 hover:bg-amber-600' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                      title={isPlayingTts ? "Pause" : "Play"}
                    >
                      {ttsLoading ? (
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-white rounded-full animate-spin"></div>
                      ) : isPlayingTts ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    {/* Stop Button */}
                    <button
                      onClick={stopTts}
                      disabled={!isPlayingTts && !isPausedTts}
                      className={`p-3.5 rounded-full border bg-white shadow-sm transition-all cursor-pointer ${
                        isPlayingTts || isPausedTts
                          ? 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:scale-105'
                          : 'border-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                      title="Stop"
                    >
                      <Square size={18} fill="currentColor" />
                    </button>

                    {/* Speed Badge Button */}
                    <button
                      onClick={handleTtsSpeedChange}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                    >
                      <span>⚡</span>
                      <span>{ttsSpeed}x</span>
                    </button>
                  </div>

                  {/* Browser voice selector if mode is browser */}
                  {ttsMode === 'browser' && browserVoices.length > 0 && (
                    <div className="w-full md:w-auto flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 whitespace-nowrap">
                        {language === 'fr' ? 'Voix :' : 'الصوت :'}
                      </span>
                      <select
                        value={selectedBrowserVoice}
                        onChange={(e) => {
                          stopTts();
                          setSelectedBrowserVoice(e.target.value);
                        }}
                        className="bg-white border border-slate-200 text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 cursor-pointer max-w-[200px]"
                      >
                        {browserVoices
                          .filter(v => v.lang.startsWith(language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'fr'))
                          .map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Audio status tracker */}
                  <div className="flex items-center gap-2">
                    {isPlayingTts && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        {language === 'fr' ? 'Lecture' : language === 'ar' ? 'تشغيل' : 'Playing'}
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {ttsLoading ? (
                        language === 'fr' ? 'Génération IA...' : language === 'ar' ? 'جاري التوليد...' : 'Generating...'
                      ) : isPlayingTts ? (
                        language === 'fr' ? 'Lecture en cours' : language === 'ar' ? 'جاري التشغيل' : 'Playing'
                      ) : isPausedTts ? (
                        language === 'fr' ? 'En pause' : language === 'ar' ? 'موقوف مؤقتاً' : 'Paused'
                      ) : (
                        language === 'fr' ? 'Prêt à lire' : language === 'ar' ? 'جاهز للاستماع' : 'Ready'
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress bar for Amel AI Mode */}
                {ttsMode === 'amel' && audioElement && (audioDuration > 0 || isPlayingTts) && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{formatAudioTime(audioCurrentTime)}</span>
                      <span>{formatAudioTime(audioDuration || 0)}</span>
                    </div>
                    <div 
                      onClick={(e) => {
                        if (!audioElement || audioDuration === 0) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const width = rect.width;
                        const clickPercent = clickX / width;
                        audioElement.currentTime = clickPercent * audioDuration;
                        setAudioCurrentTime(audioElement.currentTime);
                      }}
                      className="w-full bg-slate-200 hover:bg-slate-300 h-1.5 rounded-full overflow-hidden cursor-pointer relative"
                    >
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-100 pointer-events-none" 
                        style={{ width: `${(audioCurrentTime / (audioDuration || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rich Body Text */}
              <div className="whitespace-pre-wrap space-y-4 text-sm md:text-base">
                {openedArticle.content[language]}
              </div>

              {/* References Section */}
              {openedArticle.references && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-2.5">
                  <h5 className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen size={14} />
                    {language === 'fr' ? 'Références Scientifiques & Bibliographiques' : language === 'ar' ? 'المراجع والمصادر العلمية' : 'Scientific & Bibliographical References'}
                  </h5>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-mono">
                    {openedArticle.references}
                  </p>
                </div>
              )}

              {/* Support Hotline Info in Modal */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3 text-xs text-slate-600">
                <ShieldAlert size={18} className="text-indigo-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">
                    {language === 'fr' ? 'Besoin d\'un accompagnement direct ?' : 'هل تحتاج لمساعدة فورية؟'}
                  </p>
                  <p className="mt-0.5">
                    {language === 'fr'
                      ? 'Appelez gratuitement le 1899 (Tunisie) 24h/24 pour un soutien psychologique ou juridique.'
                      : 'اتصل مجاناً بالرقم الأخضر الوطني 1899 (تونس) على مدار الساعة لتلقي الدعم النفسي والقانوني والاجتماعي.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button
                onClick={() => setOpenedArticleId(null)}
                className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Fermer' : language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
