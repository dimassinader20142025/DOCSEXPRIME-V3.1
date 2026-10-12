import { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, AlertTriangle, ArrowRight, Award } from 'lucide-react';
import { quizzes } from '../data/quizzes';
import { Language } from '../types';

interface QuizSectionProps {
  language: Language;
  initialQuizId?: string | null;
  onClearInitialQuiz?: () => void;
}

export default function QuizSection({ language, initialQuizId, onClearInitialQuiz }: QuizSectionProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (initialQuizId) {
      const idx = quizzes.findIndex(q => q.id === initialQuizId);
      if (idx !== -1) {
        setCurrentIdx(idx);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizCompleted(false);
      }
      if (onClearInitialQuiz) {
        onClearInitialQuiz();
      }
    }
  }, [initialQuizId, onClearInitialQuiz]);

  const currentQuestion = quizzes[currentIdx];

  const handleAnswer = (userGuess: boolean) => {
    if (isAnswered) return;
    setSelectedAnswer(userGuess);
    setIsAnswered(true);

    const isCorrect = (userGuess === !currentQuestion.isMyth);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < quizzes.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const isUserCorrect = selectedAnswer === !currentQuestion?.isMyth;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {!quizCompleted ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-indigo-600">
              {language === 'fr' ? 'Démystifier les rumeurs' : language === 'ar' ? 'تفنيد الإشاعات' : 'Debunking Myths'}
            </span>
            <span>
              {language === 'fr' 
                ? `Question ${currentIdx + 1} sur ${quizzes.length}` 
                : language === 'ar' 
                ? `السؤال ${currentIdx + 1} من ${quizzes.length}` 
                : `Question ${currentIdx + 1} of ${quizzes.length}`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / quizzes.length) * 100}%` }}
            />
          </div>

          {/* Question Statement */}
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-display font-bold text-slate-800 leading-relaxed text-center">
              "{currentQuestion.statement[language]}"
            </h3>
          </div>

          {/* Myth / Reality Actions */}
          {!isAnswered ? (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleAnswer(false)} // User guess: It's a MYTH
                className="py-4 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl font-bold text-center transition-all shadow-sm flex flex-col items-center gap-2 cursor-pointer"
              >
                <AlertTriangle size={20} />
                <span>
                  {language === 'fr' ? 'Mythe (Faux)' : language === 'ar' ? 'خرافة (خاطئ)' : 'Myth (False)'}
                </span>
              </button>
              <button
                onClick={() => handleAnswer(true)} // User guess: It's a REALITY
                className="py-4 bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-center transition-all shadow-sm flex flex-col items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={20} />
                <span>
                  {language === 'fr' ? 'Réalité (Vrai)' : language === 'ar' ? 'حقيقة (صحيح)' : 'Reality (True)'}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-6 pt-4 animate-fade-in">
              {/* Answer Feedback Banner */}
              <div
                className={`p-4 rounded-xl flex items-center gap-3 border ${
                  isUserCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {isUserCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                <div>
                  <p className="font-bold text-sm">
                    {isUserCorrect 
                      ? (language === 'fr' ? 'Bonne réponse !' : 'إجابة صحيحة!') 
                      : (language === 'fr' ? 'Mauvaise réponse.' : 'إجابة خاطئة.')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'fr' ? 'Voici l\'explication clinique de nos experts :' : 'إليك التوضيح العلمي من أخصائيينا :'}
                  </p>
                </div>
              </div>

              {/* Explanatory Panel */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 leading-relaxed text-sm text-slate-700">
                <p className="font-semibold text-slate-800 mb-2">
                  {language === 'fr' ? 'Pourquoi ?' : 'لماذا؟'}
                </p>
                {currentQuestion.explanation[language]}
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-100 group cursor-pointer"
                >
                  {language === 'fr' ? 'Suivant' : language === 'ar' ? 'السؤال التالي' : 'Next'}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Screen */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm animate-scale-up">
          <Award size={64} className="mx-auto text-yellow-500 animate-bounce" />
          <div className="space-y-2">
            <h3 className="text-xl font-display font-bold text-slate-900">
              {language === 'fr' ? 'Félicitations ! Quiz terminé.' : 'تهانينا! اكتمل الاختبار.'}
            </h3>
            <p className="text-sm text-slate-600">
              {language === 'fr' 
                ? `Vous avez obtenu un score de ${score} sur ${quizzes.length}.` 
                : `لقد حصلت على نتيجة ${score} من أصل ${quizzes.length}.`}
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-650 leading-relaxed">
            {score === quizzes.length ? (
              language === 'fr'
                ? "Excellent ! Vous possédez de solides connaissances en sexologie clinique. Vous comprenez parfaitement le corps humain et les comportements sains."
                : "ممتاز! معلوماتك حول علم الجنس عيادياً ممتازة ولديك وعي صحي كامل ومثالي."
            ) : score >= quizzes.length / 2 ? (
              language === 'fr'
                ? "Bon score ! Vous connaissez les bases mais certains mythes tenaces méritent d'être lus en consultant nos fiches thématiques."
                : "نتيجة جيدة! لديك معرفة بالأساسيات، لكن هناك بعض الخرافات الشائعة التي ننصحك بمراجعتها عبر مقالاتنا لتعميق وعيك."
            ) : (
              language === 'fr'
                ? "Ne vous inquiétez pas, l'éducation sexuelle s'apprend à tout âge. Nous vous conseillons de parcourir nos rubriques et de poser vos questions à Amel pour clarifier les choses."
                : "لا تقلق، الثقافة الجنسية الصحية تكتسب بالتعلم. ننصحك بتصفح مقالاتنا وسؤال المستشارة أمل لتوضيح كل المفاهيم بطرق علمية آمنة."
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              {language === 'fr' ? 'Recommencer le Quiz' : 'إعادة الاختبار'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
