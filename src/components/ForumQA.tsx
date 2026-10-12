import React, { useState, useEffect } from 'react';
import { Send, HelpCircle, CheckCircle, User, Calendar, MessageCircle, AlertCircle } from 'lucide-react';
import { QAPair, Language } from '../types';
import { translations } from '../data/translations';
import { fetchWithRetry } from '../utils/api';

interface ForumQAProps {
  language: Language;
  initialQuestionId?: string | null;
  onClearInitialQuestion?: () => void;
}

export default function ForumQA({ language, initialQuestionId, onClearInitialQuestion }: ForumQAProps) {
  const [questions, setQuestions] = useState<QAPair[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [authorAge, setAuthorAge] = useState<number | ''>('');
  const [authorGender, setAuthorGender] = useState('non_precise');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'answered' | 'unanswered'>('answered');
  const [error, setError] = useState<string | null>(null);

  // Fetch questions on load
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
    // Set up polling for real-time synchronization every 10 seconds (slightly relaxed)
    const interval = setInterval(fetchQuestions, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (initialQuestionId && questions.length > 0) {
      const q = questions.find(item => item.id === initialQuestionId);
      if (q) {
        if (q.answer) {
          setActiveTab('answered');
        } else {
          setActiveTab('unanswered');
        }
        // Scroll to element after state change
        setTimeout(() => {
          const element = document.getElementById(`qa-card-${initialQuestionId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-indigo-500/50', 'border-indigo-500', 'bg-indigo-50/10');
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-indigo-500/50', 'border-indigo-500', 'bg-indigo-50/10');
            }, 3000);
          }
        }, 300);
      }
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestionId, questions, onClearInitialQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          language: language,
          authorAge: authorAge || undefined,
          authorGender: authorGender !== 'non_precise' ? authorGender : undefined
        })
      });

      if (response.ok) {
        setQuestionText('');
        setAuthorAge('');
        setAuthorGender('non_precise');
        await fetchQuestions();
        setActiveTab('unanswered');
        alert(language === 'fr' 
          ? "Votre question a été soumise avec succès de manière 100% anonyme ! Elle apparaîtra ici dès qu'un sexologue clinicien y aura répondu." 
          : language === 'ar' 
          ? "تم إرسال سؤالك بنجاح وبسرية تامة 100%! سيظهر في المنتدى فور إجابة طبيب أو أخصائي عيادي عليه." 
          : "Your question has been successfully submitted 100% anonymously! It will appear here once a clinical sexologist answers it.");
      } else {
        throw new Error('Failed to submit question');
      }
    } catch (err) {
      setError(language === 'fr' ? "Erreur de soumission." : "فشل الإرسال.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredList = questions.filter(q => q.answer);
  const unansweredList = questions.filter(q => !q.answer);

  const getGenderLabel = (g?: string) => {
    if (!g) return '';
    const labels: Record<string, Record<Language, string>> = {
      homme: { fr: 'Homme', ar: 'شاب', en: 'Male' },
      femme: { fr: 'Femme', ar: 'شابة', en: 'Female' },
      autre: { fr: 'Autre', ar: 'آخر', en: 'Other' }
    };
    return labels[g]?.[language] || '';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Disclaimer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 shadow-sm">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">Anonymat Absolu Garanti</h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {language === 'fr' 
              ? "Aucune adresse IP, aucun compte et aucune donnée personnelle ne sont collectés. Posez vos questions sur la puberté, le corps, la contraception, les IST, la sexualité clinique, ou le consentement en toute liberté."
              : language === 'ar'
              ? "لا نجمع عناوين الـ IP، ولا نطلب حسابات أو أي بيانات شخصية. اطرح سؤالك حول البلوغ، الجسد، منع الحمل، الأمراض المنقولة جنسياً، أو العلاقات بكل حرية وسرية."
              : "No IP addresses, accounts, or personal details are logged. Write freely about puberty, contraception, STIs, or emotional intimacy. Your privacy is protected."}
          </p>
        </div>
      </div>

      {/* Form Submission */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-display font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <HelpCircle className="text-indigo-600" />
          {translations[language].askAnonymously}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={translations[language].questionPlaceholder}
            required
            rows={3}
            className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-800 rounded-xl px-4 py-3 text-sm transition-all"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {language === 'fr' ? 'Âge (Optionnel)' : language === 'ar' ? 'العمر (اختياري)' : 'Age (Optional)'}
              </label>
              <input
                type="number"
                min="10"
                max="99"
                value={authorAge}
                onChange={(e) => setAuthorAge(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Ex: 18"
                className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-800 rounded-xl px-4 py-2 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {language === 'fr' ? 'Identité de genre (Optionnel)' : language === 'ar' ? 'الجنس (اختياري)' : 'Gender (Optional)'}
              </label>
              <select
                value={authorGender}
                onChange={(e) => setAuthorGender(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-750 rounded-xl px-4 py-2 text-sm transition-all"
              >
                <option value="non_precise">
                  {language === 'fr' ? 'Préfère ne pas préciser' : language === 'ar' ? 'يفضل عدم التحديد' : 'Prefer not to say'}
                </option>
                <option value="femme">
                  {language === 'fr' ? 'Femme / Fille' : language === 'ar' ? 'شابة / فتاة' : 'Female / Girl'}
                </option>
                <option value="homme">
                  {language === 'fr' ? 'Homme / Garçon' : language === 'ar' ? 'شاب / فتى' : 'Male / Boy'}
                </option>
                <option value="autre">
                  {language === 'fr' ? 'Autre' : language === 'ar' ? 'آخر' : 'Other'}
                </option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!questionText.trim() || isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
            >
              <Send size={16} />
              {isSubmitting 
                ? (language === 'fr' ? 'Envoi...' : 'جاري الإرسال...') 
                : translations[language].submitQuestion}
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      </div>

      {/* Q&A Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('answered')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'answered'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {translations[language].answeredQuestions} ({answeredList.length})
          </button>
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'unanswered'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {translations[language].unansweredQuestions} ({unansweredList.length})
          </button>
        </div>

        {activeTab === 'answered' ? (
          answeredList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {language === 'fr' ? "Aucune question répondue pour le moment." : "لا توجد أسئلة تمت الإجابة عنها بعد."}
            </div>
          ) : (
            <div className="space-y-4">
              {answeredList.map((qa) => (
                <div key={qa.id} id={`qa-card-${qa.id}`} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm transition-all duration-500">
                  {/* User Question */}
                  <div className="flex gap-3">
                    <div className="p-2 bg-slate-50 text-indigo-600 rounded-lg h-fit border border-slate-100">
                      <HelpCircle size={18} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-slate-100">
                          <User size={10} />
                          Anonyme {qa.authorAge ? `, ${qa.authorAge} ans` : ''} {qa.authorGender ? `(${getGenderLabel(qa.authorGender)})` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(qa.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[15px] font-medium text-slate-900 leading-relaxed pt-1">{qa.question}</p>
                    </div>
                  </div>

                  {/* Clinician Answer */}
                  <div className="flex gap-3 pl-4 md:pl-8 border-l-2 border-indigo-200 pt-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg h-fit">
                      <MessageCircle size={18} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-indigo-100/50">
                          <CheckCircle size={10} />
                          Sexologue Clinicien
                        </span>
                        {qa.answeredAt && (
                          <span className="text-[10px] text-slate-450">
                            {new Date(qa.answeredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap pt-1">{qa.answer}</p>
                      {qa.clinicalNote && (
                        <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                          <p className="text-xs font-semibold text-indigo-600 font-display">Note Sexologique Clinique :</p>
                          <p className="text-xs text-slate-500 italic mt-0.5">{qa.clinicalNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          unansweredList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {language === 'fr' 
                ? "Aucune question en attente. Tout est traité !" 
                : "لا توجد أسئلة في الانتظار حالياً. تم الرد على الجميع!"}
            </div>
          ) : (
            <div className="space-y-4">
              {unansweredList.map((qa) => (
                <div key={qa.id} id={`qa-card-${qa.id}`} className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-3 shadow-sm transition-all duration-500">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg h-fit animate-pulse border border-slate-100">
                    <HelpCircle size={18} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-100">
                        Anonyme {qa.authorAge ? `, ${qa.authorAge} ans` : ''} {qa.authorGender ? `(${getGenderLabel(qa.authorGender)})` : ''}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(qa.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        {language === 'fr' ? 'En attente' : 'في الانتظار'}
                      </span>
                    </div>
                    <p className="text-[15px] text-slate-500 leading-relaxed pt-1 italic">"{qa.question}"</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
