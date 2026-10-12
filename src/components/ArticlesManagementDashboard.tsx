import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Globe, FileText, CheckCircle, Video, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { Article, Language, RubricId } from '../types';
import { rubrics } from '../data/articles';
import { fetchWithRetry } from '../utils/api';

interface ArticlesManagementDashboardProps {
  language: Language;
}

export default function ArticlesManagementDashboard({ language }: ArticlesManagementDashboardProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Tab selection (French, Arabic, English inputs)
  const [formLang, setFormLang] = useState<'fr' | 'ar' | 'en'>('fr');

  // Form States
  const [rubricId, setRubricId] = useState<RubricId>('body');
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [summaryFr, setSummaryFr] = useState('');
  const [summaryAr, setSummaryAr] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentFr, setContentFr] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [references, setReferences] = useState('');
  const [scientific, setScientific] = useState(true);

  // Fetch articles
  const fetchArticles = async () => {
    try {
      const response = await fetchWithRetry('/api/articles', undefined, 4, 800);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Error loading articles in dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate that at least the French fields are filled, then autofill if others are empty
    if (!titleFr.trim()) {
      setError(language === 'fr' ? 'Le titre en Français est obligatoire.' : 'Title in French is required.');
      return;
    }
    if (!contentFr.trim()) {
      setError(language === 'fr' ? 'Le contenu en Français est obligatoire.' : 'Content in French is required.');
      return;
    }

    setIsSubmitting(true);

    const newArticleBody = {
      rubricId,
      title: {
        fr: titleFr.trim(),
        ar: titleAr.trim() || titleFr.trim() + " (ترجمة معلقة)",
        en: titleEn.trim() || titleFr.trim() + " (Translation pending)"
      },
      summary: {
        fr: summaryFr.trim(),
        ar: summaryAr.trim() || summaryFr.trim(),
        en: summaryEn.trim() || summaryFr.trim()
      },
      content: {
        fr: contentFr.trim(),
        ar: contentAr.trim() || contentFr.trim(),
        en: contentEn.trim() || contentFr.trim()
      },
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      isVideo: !!videoUrl.trim(),
      references: references.trim() || undefined,
      scientific
    };

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticleBody)
      });

      if (response.ok) {
        setSuccess(language === 'fr' ? 'Article scientifique ajouté avec succès !' : 'Scientific article added successfully!');
        // Reset form
        setTitleFr('');
        setTitleAr('');
        setTitleEn('');
        setSummaryFr('');
        setSummaryAr('');
        setSummaryEn('');
        setContentFr('');
        setContentAr('');
        setContentEn('');
        setImageUrl('');
        setVideoUrl('');
        setReferences('');
        setScientific(true);
        // Refresh articles list
        await fetchArticles();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create article');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm(language === 'fr' ? 'Voulez-vous vraiment supprimer cet article ?' : 'Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchArticles();
        setSuccess(language === 'fr' ? 'Article supprimé.' : 'Article deleted.');
      } else {
        alert('Failed to delete article');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in text-left">
      {/* Create New Article Form Panel */}
      <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-150 pb-4">
          <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
            <Plus className="text-indigo-600" size={18} />
            {language === 'fr' ? 'Ajouter un nouvel article clinique' : 'إضافة مقال عيادي جديد'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'fr' 
              ? 'Rédigez des articles à caractère scientifique avec références et supports vidéos pour les cliniciens et étudiants.' 
              : 'اكتب مقالات علمية وطبية مع المراجع والفيديوهات الموجهة للأخصائيين والطلبة.'}
          </p>
        </div>

        <form onSubmit={handleCreateArticle} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle size={16} className="text-emerald-600" />
              {success}
            </div>
          )}

          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'fr' ? 'Rubrique de l\'article' : 'ركن المقال'}
              </label>
              <select
                value={rubricId}
                onChange={(e) => setRubricId(e.target.value as RubricId)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
              >
                {rubrics.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title[language]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={scientific}
                  onChange={(e) => setScientific(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  🔬 {language === 'fr' ? 'Marquer comme Scientifique (Clinique)' : 'تصنيف كمقال علمي عيادي'}
                </span>
              </label>
            </div>
          </div>

          {/* Translation Lang Tab Selector */}
          <div className="space-y-4">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/60">
              <button
                type="button"
                onClick={() => setFormLang('fr')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formLang === 'fr' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe size={13} />
                Français (Required)
              </button>
              <button
                type="button"
                onClick={() => setFormLang('ar')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formLang === 'ar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe size={13} />
                العربية
              </button>
              <button
                type="button"
                onClick={() => setFormLang('en')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formLang === 'en' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe size={13} />
                English
              </button>
            </div>

            {/* Translation Fields */}
            {formLang === 'fr' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Titre de l'article (Français)</label>
                  <input
                    type="text"
                    value={titleFr}
                    onChange={(e) => setTitleFr(e.target.value)}
                    placeholder="Ex: Prise en charge clinique du vaginisme..."
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Résumé court (Français)</label>
                  <textarea
                    value={summaryFr}
                    onChange={(e) => setSummaryFr(e.target.value)}
                    placeholder="Bref descriptif clinique pour la liste d'articles..."
                    rows={2}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Corps de l'article (Français)</label>
                  <textarea
                    value={contentFr}
                    onChange={(e) => setContentFr(e.target.value)}
                    placeholder="Rédigez l'article scientifique en détail..."
                    rows={8}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {formLang === 'ar' && (
              <div className="space-y-4 animate-fade-in text-right" dir="rtl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان المقال (العربية)</label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: العلاج العيادي التخصصي للتشنج المهبلي..."
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الملخص الوجيز (العربية)</label>
                  <textarea
                    value={summaryAr}
                    onChange={(e) => setSummaryAr(e.target.value)}
                    placeholder="وصف طبي وجيز يظهر في قائمة المقالات..."
                    rows={2}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">محتوى المقال بالتفصيل (العربية)</label>
                  <textarea
                    value={contentAr}
                    onChange={(e) => setContentAr(e.target.value)}
                    placeholder="اكتب المحتوى السريري بالتفصيل هنا..."
                    rows={8}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none text-right"
                  />
                </div>
              </div>
            )}

            {formLang === 'en' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Article Title (English)</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Ex: Clinical Management of Vaginismus..."
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Summary (English)</label>
                  <textarea
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    placeholder="Brief description for grid cards..."
                    rows={2}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Content (English)</label>
                  <textarea
                    value={contentEn}
                    onChange={(e) => setContentEn(e.target.value)}
                    placeholder="Write the full scientific content..."
                    rows={8}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Media and References Panel */}
          <div className="border-t border-slate-150 pt-5 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              {language === 'fr' ? 'Médias & Sources Bibliographiques' : 'الوسائط والمصادر العلمية'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'fr' ? 'URL de l\'image (Optionnel)' : 'رابط الصورة التوضيحية'}
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'fr' ? 'URL de la vidéo courte (YouTube Embed)' : 'رابط فيديو قصير (يوتيوب)'}
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Ex: https://www.youtube.com/embed/..."
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <FileText size={14} className="text-indigo-600" />
                {language === 'fr' ? 'Références Scientifiques (Format APA, PubMed DOI)' : 'المراجع والكتب الطبية المستند إليها (APA, PubMed)'}
              </label>
              <textarea
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="Ex: Diagnostic and Statistical Manual of Mental Disorders (DSM-5-TR)..."
                rows={3}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-xl px-3.5 py-2.5 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting 
                ? (language === 'fr' ? 'Création...' : 'جاري الحفظ...') 
                : (language === 'fr' ? 'Publier l\'article clinique' : 'نشر المقال العيادي')}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Articles List (Deletion Console) */}
      <div className="xl:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[780px]">
        <div className="border-b border-slate-150 pb-4 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={16} />
            {language === 'fr' ? `Articles Publiés (${articles.length})` : `المقالات المنشورة (${articles.length})`}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'fr' ? 'Consultez et supprimez les articles du serveur.' : 'عرض وحذف المقالات المتاحة على الخادم.'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chargement...
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Aucun article disponible.
            </div>
          ) : (
            articles.map((art) => (
              <div
                key={art.id}
                className="p-3 border border-slate-150 rounded-2xl hover:bg-slate-50 transition-all flex flex-col justify-between gap-3 bg-white shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {rubrics.find((r) => r.id === art.rubricId)?.title[language] || art.rubricId}
                    </span>
                    {art.scientific && (
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                        🔬 Sci
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {art.title[language] || art.title.fr}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {art.summary[language] || art.summary.fr}
                  </p>
                </div>

                <div className="flex justify-end pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => handleDeleteArticle(art.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                    {language === 'fr' ? 'Supprimer' : 'حذف'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
