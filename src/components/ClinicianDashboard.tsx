import React, { useState, useEffect } from 'react';
import { HelpCircle, AlertCircle, CheckSquare, MessageSquare, Clipboard, BookOpen, Shield, Play, Pause, Square, Volume2, Sparkles, VolumeX } from 'lucide-react';
import { QAPair, Language } from '../types';
import ArticlesManagementDashboard from './ArticlesManagementDashboard';
import { fetchWithRetry } from '../utils/api';

interface ClinicianDashboardProps {
  language: Language;
}

export default function ClinicianDashboard({ language }: ClinicianDashboardProps) {
  const [questions, setQuestions] = useState<QAPair[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [clinicalNote, setClinicalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TTS State variables
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [activeSpeechLang, setActiveSpeechLang] = useState<Language>(language);

  // Load Speech Synthesis Voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Find a default voice for the current language if possible
        const defaultVoice = availableVoices.find(v => 
          v.lang.startsWith(activeSpeechLang === 'ar' ? 'ar' : activeSpeechLang === 'en' ? 'en' : 'fr')
        );
        if (defaultVoice) {
          setSelectedVoice(defaultVoice.name);
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
  }, [activeSpeechLang]);

  // Handle activeSpeechLang update when parent language changes
  useEffect(() => {
    setActiveSpeechLang(language);
  }, [language]);

  const audioScripts = {
    fr: "Chers collègues, bienvenue sur DocSexprime Tunisie. Ce projet numérique s'inscrit dans un cadre clinique et éthique rigoureux. Notre mission est d'assurer un accès équitable, anonyme et gratuit à l'éducation sexuelle et au soutien psychologique pour la jeunesse tunisienne. Notre posture repose sur quatre piliers déontologiques fondamentaux : premièrement, une neutralité bienveillante et scientifique absolue, exempte de tout jugement moral ou religieux. Deuxièmement, le secret professionnel et le respect strict de l'anonymat pour instaurer une confiance solide. Troisièmement, le respect du cadre légal tunisien, notamment la loi 58 de protection des mineurs en cas de violences ou d'abus. Enfin, l'utilisation exclusive d'informations validées scientifiquement par l'OMS et l'ONFP. Ensemble, construisons un espace de santé bienveillant, inclusif et sécurisé pour nos jeunes.",
    ar: "زميلاتي وزملائي الأعزاء، مرحبًا بكم في منصة دوق سيكسبريم تونس. يندرج هذا المشروع الرقمي في إطار عيادي وأخلاقي صارم. رسالتنا هي ضمان النفاذ العادل، المجاني والسري للثقافة والصحة الجنسية والإرشاد النفسي للشباب التونسي. ترتكز عيادتنا على أربعة أسس أخلاقية: أولاً، الحياد العلمي الإيجابي الخالي من أي أحكام أخلاقية أو دينية. ثانياً، السرية التامة وحماية الهوية لبناء ثقة متينة. ثالثاً، الالتزام التام بالقانون التونسي وخاصة القانون عدد 58 لحماية الأطفال والقصّر من الاعتداءات. رابعاً، الاستناد الحصري للمعلومات الطبية المعتمدة من منظمة الصحة العالمية والديوان الوطني للأسرة. معاً، نؤسس لفضاء صحي، آمن ومسؤول لشبابنا.",
    en: "Dear colleagues, welcome to DocSexprime Tunisia. This digital project is grounded in a rigorous clinical and ethical framework. Our mission is to provide equitable, free, and anonymous access to sexual health education and psychological support for Tunisian youth. Our approach rests on four core ethical pillars: first, absolute non-judgmental neutrality and scientific objectivity, free from any moral or religious judgment. Second, strict professional secrecy and anonymity protection. Third, adherence to Tunisian laws, specifically Law 58 regarding child protection against violence and abuse. Fourth, relying exclusively on evidence-based data approved by the WHO and ONFP. Together, let us build a safe, inclusive, and responsible health space for our youth."
  };

  const speakSummary = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert(language === 'fr' 
        ? "Votre navigateur ne supporte pas la synthèse vocale." 
        : "متصفحك لا يدعم توليد الصوت.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = audioScripts[activeSpeechLang];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (selectedVoice) {
      const voiceObj = voices.find(v => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    } else {
      const fallbackVoice = voices.find(v => 
        v.lang.startsWith(activeSpeechLang === 'ar' ? 'ar' : activeSpeechLang === 'en' ? 'en' : 'fr')
      );
      if (fallbackVoice) utterance.voice = fallbackVoice;
    }

    utterance.lang = activeSpeechLang === 'ar' ? 'ar-TN' : activeSpeechLang === 'en' ? 'en-US' : 'fr-FR';
    utterance.rate = audioSpeed;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleSpeedChange = () => {
    const nextSpeed = audioSpeed === 1 ? 1.25 : audioSpeed === 1.25 ? 1.5 : audioSpeed === 1.5 ? 0.8 : 1;
    setAudioSpeed(nextSpeed);
    
    if (isPlaying || isPaused) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const textToSpeak = audioScripts[activeSpeechLang];
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        if (selectedVoice) {
          const voiceObj = voices.find(v => v.name === selectedVoice);
          if (voiceObj) utterance.voice = voiceObj;
        }
        utterance.lang = activeSpeechLang === 'ar' ? 'ar-TN' : activeSpeechLang === 'en' ? 'en-US' : 'fr-FR';
        utterance.rate = nextSpeed;
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        setIsPlaying(true);
        setIsPaused(false);
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetchWithRetry('/api/questions', undefined, 4, 800);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 10000); // slightly increase interval to lower load
    return () => clearInterval(interval);
  }, []);

  const handlePublishAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionId || !answerText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/questions/${selectedQuestionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: answerText,
          clinicalNote: clinicalNote || undefined
        })
      });

      if (response.ok) {
        setAnswerText('');
        setClinicalNote('');
        setSelectedQuestionId(null);
        await fetchQuestions();
        alert(language === 'fr' 
          ? "Réponse publiée en temps réel avec succès !" 
          : "تم نشر الإجابة بنجاح وفي الوقت الحقيقي!");
      } else {
        throw new Error('Failed to publish answer');
      }
    } catch (err) {
      setError(language === 'fr' ? "Erreur de publication." : "فشل النشر.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [activeDashboardTab, setActiveDashboardTab] = useState<'qa' | 'articles'>('qa');

  const unansweredQuestions = questions.filter(q => !q.answer);
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
    <div className="space-y-6">
      {/* Clinician Dashboard Tab Header */}
      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveDashboardTab('qa')}
          className={`pb-3 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeDashboardTab === 'qa'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <MessageSquare size={14} />
          {language === 'fr' ? 'Questions & Réponses Forum' : 'الأسئلة والأجوبة للمنتدى'}
        </button>
        <button
          onClick={() => setActiveDashboardTab('articles')}
          className={`pb-3 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeDashboardTab === 'articles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <BookOpen size={14} />
          {language === 'fr' ? 'Gestion des Articles Cliniques' : 'إدارة المقالات العلمية'}
        </button>
      </div>

      {activeDashboardTab === 'qa' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Left Column: List of Questions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-600" />
                {language === 'fr' 
                  ? `Questions en attente (${unansweredQuestions.length})` 
                  : `الأسئلة في الانتظار (${unansweredQuestions.length})`}
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {unansweredQuestions.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-xl text-slate-400 text-xs shadow-sm">
                  {language === 'fr' ? "Aucune question en attente." : "لا توجد أسئلة معلقة."}
                </div>
              ) : (
                unansweredQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestionId(q.id);
                      setAnswerText('');
                      setClinicalNote('');
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedQuestionId === q.id
                        ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {q.authorAge ? `${q.authorAge} ans` : 'Âge non précisé'}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-2 mt-2 leading-relaxed">
                      "{q.question}"
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Center & Right Column: Answer Form and Sexology Guidelines */}
          <div className="lg:col-span-2 space-y-6">
            {selectedQuestion ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100/50">
                    Question à traiter ({selectedQuestion.language.toUpperCase()})
                  </span>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed mt-2">
                    "{selectedQuestion.question}"
                  </p>
                </div>

                <form onSubmit={handlePublishAnswer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      {language === 'fr' ? 'Votre réponse clinique (Jeunes)' : 'الإجابة الطبية الموجهة للشباب'}
                    </label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder={language === 'fr' 
                        ? "Rédigez une réponse claire, bienveillante, scientifique, sans jargon et exempte de jugement moral..."
                        : "اكتب إجابة واضحة ولطيفة ومبنية على أسس علمية ومناسبة للثقافة ومفهومة..."}
                      required
                      rows={6}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-800 rounded-xl px-4 py-3 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                      <Clipboard size={14} className="text-indigo-600" />
                      {language === 'fr' ? 'Note Clinique et Théorique (Optionnel — Espace Étudiants/Pro)' : 'ملاحظات علمية وعلاجية (اختياري - لفضاء الطلبة والمهنيين)'}
                    </label>
                    <textarea
                      value={clinicalNote}
                      onChange={(e) => setClinicalNote(e.target.value)}
                      placeholder={language === 'fr'
                        ? "Ajoutez des bases théoriques de sexologie clinique (psychanalytique, cognitivo-comportementale, etc.) pour vos collègues..."
                        : "أضف أسساً نظرية أو علاجية خاصة بزملاء المهنة والطلبة حول هذه الحالة..."}
                      rows={3}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-700 rounded-xl px-4 py-3 text-xs transition-all"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQuestionId(null)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {language === 'fr' ? 'Annuler' : 'إلغاء'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !answerText.trim()}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-all shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      {isSubmitting ? 'Publication...' : 'Publier la réponse'}
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </form>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-4 shadow-sm">
                <CheckSquare size={48} className="mx-auto text-slate-300" />
                <div>
                  <p className="font-semibold text-slate-800">
                    {language === 'fr' ? 'Sélectionnez une question pour y répondre' : 'اختر سؤالاً من القائمة للإجابة عليه'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {language === 'fr' 
                      ? "Les réponses que vous publiez seront instantanément visibles par tous les jeunes Tunisiens sur le forum de discussion."
                      : "الإجابات التي تنشرها ستظهر فوراً لكل الشباب على منتدى النقاش وتساهم في نشر الثقافة والوعي الصحي السليم."}
                  </p>
                </div>
              </div>
            )}

            {/* Clinical sexology ethics section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-150 pb-3 gap-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                  <Shield size={16} className="text-emerald-600" />
                  {language === 'fr' ? 'Charte Éthique & Déontologique' : 'ميثاق أخلاقيات عيادة علم الجنس'}
                </h4>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-lg text-[10px] font-bold text-slate-600">
                  <span className="px-2 py-0.5 bg-white shadow-xs rounded border border-slate-200/50 flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-500" />
                    Tunisia ONFP/WHO compliant
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
                <div className="space-y-2">
                  <p className="font-medium text-slate-800">1. Neutralité Bienveillante</p>
                  <p>L'accompagnement doit s'affranchir de tout jugement moral ou religieux. L'approche est purement scientifique, médicale et thérapeutique.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-slate-800">2. Secret Professionnel</p>
                  <p>La confidentialité est le pilier central. Aucun recoupement ne doit être fait pour identifier l'auteur anonyme.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-slate-800">3. Cadre Légal (Loi 58)</p>
                  <p>En cas de signalement d'abus sexuel sur mineur, orientez systématiquement vers les autorités compétentes (Délégué à la Protection de l'Enfance en Tunisie).</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-slate-800">4. Pratique basée sur l'Évidence (EBP)</p>
                  <p>Toutes les réponses contraceptives ou anatomiques doivent s'appuyer sur des données validées par l'OMS et l'ONFP.</p>
                </div>
              </div>

              {/* Interactive Audio Introduction Summary Player for Colleagues */}
              <div className="border border-indigo-100 rounded-xl bg-indigo-50/20 p-5 space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Volume2 size={15} className={`text-indigo-600 ${isPlaying ? 'animate-bounce' : ''}`} />
                      {language === 'fr' 
                        ? "Résumé Audio d'Introduction Clinique" 
                        : language === 'ar' 
                          ? "ملخص صوتي تقديمي لإطار المشروع" 
                          : "Clinical Introduction Audio Summary"}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'fr'
                        ? "Générez et écoutez le résumé audio d'introduction clinique et éthique à partager avec vos collègues sexologues et psychologues."
                        : "قم بتوليد والاستماع إلى الملخص الصوتي للمشروع لمشاركته مع زملائك المختصين."}
                    </p>
                  </div>

                  {/* Language selection tab inside player */}
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(['fr', 'ar', 'en'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          stopSpeech();
                          setActiveSpeechLang(lang);
                        }}
                        className={`text-[9px] font-bold px-2 py-1 rounded transition-colors uppercase ${
                          activeSpeechLang === lang 
                            ? 'bg-white text-indigo-600 shadow-xs border border-indigo-100' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Animated Equalizer soundwave visualizer */}
                <div className="bg-white border border-slate-200/60 rounded-xl p-3 flex flex-col justify-center items-center shadow-xs">
                  <div className="flex items-center gap-1 h-10 justify-center">
                    {[12, 28, 38, 20, 10, 32, 44, 24, 14, 36, 40, 18, 12, 28, 16, 32, 42, 14, 8, 22].map((baseHeight, i) => {
                      // If playing, fluctuate heights. If paused, show steady medium lines. If stopped, show flat line
                      let heightPercent = 4;
                      if (isPlaying) {
                        // Generate fluctuating heights using a pulse & delay simulation
                        heightPercent = baseHeight;
                      } else if (isPaused) {
                        heightPercent = 10;
                      }
                      return (
                        <span 
                          key={i} 
                          style={{ 
                            height: `${heightPercent}px`,
                            transition: 'height 0.15s ease-in-out'
                          }}
                          className={`w-1 rounded-full ${
                            isPlaying 
                              ? 'bg-indigo-600 animate-pulse' 
                              : isPaused 
                                ? 'bg-indigo-300' 
                                : 'bg-slate-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                    {isPlaying ? (
                      <>
                        <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        {language === 'fr' ? 'Lecture en cours' : 'جاري الاستماع الآن'} ({audioSpeed}x)
                      </>
                    ) : isPaused ? (
                      language === 'fr' ? 'En pause' : 'موقوف مؤقتاً'
                    ) : (
                      language === 'fr' ? 'Prêt à lire' : 'جاهز للتشغيل'
                    )}
                  </span>
                </div>

                {/* Custom Interactive Player Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {isPlaying ? (
                      <button
                        onClick={pauseSpeech}
                        className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors cursor-pointer"
                        title="Pause"
                      >
                        <Pause size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={speakSummary}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                        title="Play"
                      >
                        <Play size={15} />
                      </button>
                    )}

                    <button
                      onClick={stopSpeech}
                      disabled={!isPlaying && !isPaused}
                      className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Stop"
                    >
                      <Square size={15} />
                    </button>

                    <button
                      onClick={handleSpeedChange}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Modifier la vitesse"
                    >
                      {audioSpeed}x
                    </button>
                  </div>

                  {/* Speech Synthesis Voice selector dropdown */}
                  {voices.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">Voice:</span>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px] cursor-pointer"
                      >
                        {voices
                          .filter(v => v.lang.startsWith(activeSpeechLang === 'ar' ? 'ar' : activeSpeechLang === 'en' ? 'en' : 'fr'))
                          .map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Read-Along script box */}
                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 max-h-[100px] overflow-y-auto">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                    {language === 'fr' ? 'Texte à lire :' : 'النص المقروء :'}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic select-all">
                    "{audioScripts[activeSpeechLang]}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ArticlesManagementDashboard language={language} />
      )}
    </div>
  );
}
