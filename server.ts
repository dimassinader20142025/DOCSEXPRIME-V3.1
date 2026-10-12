import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import {
  getAllQuestions,
  insertQuestion,
  answerQuestion,
  getAllArticles,
  insertArticle,
  deleteArticle,
  DBArticle,
  db,
} from './src/db.js';
import { articles as staticArticles } from './src/data/articles.js';

dotenv.config();


// Initialize the Google GenAI SDK securely on the server
// Note: User-Agent headers are set as instructed for AI Studio build telemetry
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const app = express();
app.use(express.json());

const PORT = 3000;

// ─── Helpers : conversion DB → format API ─────────────────────────────────────

/** Convertit une ligne DB (snake_case) vers le format QAPair utilisé par le frontend */
function dbRowToQAPair(row: any) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer ?? undefined,
    language: row.language,
    authorAge: row.author_age ?? undefined,
    authorGender: row.author_gender ?? undefined,
    clinicalNote: row.clinical_note ?? undefined,
    createdAt: row.created_at,
    answeredAt: row.answered_at ?? undefined,
  };
}

/** Convertit une ligne DB (snake_case) vers le format Article utilisé par le frontend */
function dbRowToArticle(row: any) {
  return {
    id: row.id,
    rubricId: row.rubric_id,
    title:   { fr: row.title_fr,   ar: row.title_ar,   en: row.title_en   },
    summary: { fr: row.summary_fr ?? '', ar: row.summary_ar ?? '', en: row.summary_en ?? '' },
    content: { fr: row.content_fr, ar: row.content_ar, en: row.content_en },
    imageUrl:   row.image_url   ?? undefined,
    isVideo:    row.is_video === 1,
    videoUrl:   row.video_url  ?? undefined,
    references: row.references  ?? undefined,
    scientific: row.scientific  === 1,
  };
}

// ─── Seeding initial (s'exécute une seule fois si la DB est vide) ─────────────

function seedDatabase() {
  // Seeder les questions de démonstration
  const questionCount = (db as any).prepare('SELECT COUNT(*) as c FROM questions').get() as { c: number };
  if (questionCount.c === 0) {
    const seedQuestions = [
      {
        id: randomUUID(),
        question: "Est-ce qu'on est obligé de faire sa première fois juste après le mariage ? J'ai un peu peur.",
        answer: "Absolument pas. Il n'y a aucune obligation de consommer le mariage dès le premier soir. C'est une fausse croyance très répandue qui génère de l'anxiété de performance. Prenez le temps de communiquer avec votre partenaire, d'installer un climat de confiance réciproque et d'agir uniquement lorsque vous vous sentez tous les deux pleinement prêts physiquement et émotionnellement.",
        language: 'fr', authorAge: 22, authorGender: 'femme',
        clinicalNote: "Anxiété sexuelle liée à la pression de la 'nuit de noces' (vaginisme psychologique potentiel).",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        answeredAt: new Date(Date.now() - 3600000 * 24 * 2.5).toISOString(),
      },
      {
        id: randomUUID(),
        question: "كيفاش نحمي روحي وصاحبتي من الأمراض المنقولة جنسياً والواقي الذكري وين يتباع ؟",
        answer: "الواقي الذكري (Préservatif) هو الوسيلة الوحيدة والفعالة لحمايتك أنت وشريكتك من الأمراض المنقولة جنسياً. الواقي متوفر في كل الصيدليات التونسية والمغازات الكبرى، وكذلك مجاناً في مراكز الديوان الوطني للأسرة (ONFP).",
        language: 'ar', authorAge: 19, authorGender: 'homme',
        clinicalNote: "Besoin d'éducation préventive sur l'accessibilité de la double protection.",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        answeredAt: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      },
      {
        id: randomUUID(),
        question: "Is sexual harassment punished by law in Tunisia? Someone is blackmailing me with a photo.",
        answer: "Yes, sexual harassment and blackmail are heavily punished by Tunisian Law. Under Organic Law 58 of 2017, sending or distributing private pictures without consent is a severe crime. Call the free national hotline 1899 available 24/7.",
        language: 'en', authorAge: 20, authorGender: 'femme',
        clinicalNote: "Cyberharcèlement avec chantage. Accompagnement juridique via la Loi 58-2017.",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        answeredAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      },
    ];

    const stmt = (db as any).prepare(`
      INSERT INTO questions (id, question, answer, language, author_age, author_gender, clinical_note, created_at, answered_at)
      VALUES (@id, @question, @answer, @language, @authorAge, @authorGender, @clinicalNote, @createdAt, @answeredAt)
    `);
    for (const q of seedQuestions) stmt.run(q);
    console.log('[DB] ✅ Questions de démonstration seedées');
  }

  // Seeder les articles scientifiques de démonstration
  const articleCount = (db as any).prepare('SELECT COUNT(*) as c FROM articles').get() as { c: number };
  if (articleCount.c === 0) {
    const seedArticles = [
      {
        id: 'sci-ed-physiology',
        rubric_id: 'body',
        title_fr: "Physiologie de la réponse sexuelle et dysfonctions cliniques",
        title_ar: "الفيزيولوجيا الطبية للاستجابة الجنسية والاضطرابات السريرية",
        title_en: "Medical Physiology of Sexual Response and Clinical Dysfunctions",
        summary_fr: "Une étude scientifique détaillée sur les phases d'excitation, de plateau, d'orgasme et de résolution selon les modèles de Masters & Johnson et Kaplan.",
        summary_ar: "دراسة علمية مفصلة حول مراحل الإثارة، الهضبة، الرعشة، والارتخاء وفقاً للنماذج الطبية لـ Masters & Johnson.",
        summary_en: "A detailed scientific study on the phases of excitement, plateau, orgasm, and resolution according to Masters & Johnson and Kaplan's clinical models.",
        content_fr: "La réponse sexuelle humaine est un processus neuro-vasculo-hormonal complexe.\n\n**1. Phase d'Excitation :** Vasodilatation médiée par l'oxyde nitrique (NO).\n**2. Phase de Plateau :** Augmentation de la tension musculaire (myotonie).\n**3. Phase d'Orgasme :** Contractions rythmiques involontaires des muscles pelviens.\n**4. Phase de Résolution :** Retour à l'état homéostatique.",
        content_ar: "تعتبر الاستجابة الجنسية البشرية عملية عصبية وعائية وهرمونية معقدة.\n\n**1. مرحلة الإثارة:** إفراز أكسيد النيتريك.\n**2. مرحلة الهضبة:** زيادة التوتر العضلي.\n**3. مرحلة الرعشة:** انقباضات لاإرادية.\n**4. مرحلة الارتخاء:** العودة للحالة الطبيعية.",
        content_en: "Human sexual response is a complex neuro-vasculo-hormonal process.\n\n**1. Excitement Phase:** Nitric oxide (NO) mediated vasodilation.\n**2. Plateau Phase:** Myotonia and increased heart rate.\n**3. Orgasm Phase:** Involuntary rhythmic pelvic contractions.\n**4. Resolution Phase:** Return to basal homeostatic state.",
        image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
        is_video: 0, video_url: null,
        references: "Masters, W. H., & Johnson, V. E. (1966). Human Sexual Response.\nKaplan, H. S. (1979). Disorders of Sexual Desire.",
        scientific: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'sci-vaginismus-therapy',
        rubric_id: 'abuse',
        title_fr: "Prise en charge clinique du vaginisme et de la dyspareunie",
        title_ar: "العلاج العيادي التخصصي للتشنج المهبلي وعسر الجماع",
        title_en: "Clinical Management of Vaginismus and Dyspareunia",
        summary_fr: "Approche thérapeutique interdisciplinaire combinant TCC, rééducation pelvi-périnéale et dilatateurs gradués.",
        summary_ar: "مقاربة علاجية متعددة الاختصاصات تجمع بين العلاج المعرفي السلوكي وإعادة تأهيل الحوض.",
        summary_en: "Interdisciplinary approach combining CBT, pelvic floor physical therapy, and gradual dilators.",
        content_fr: "Le vaginisme est une contraction involontaire des muscles du tiers externe du vagin.\n\n**Étiologie :** Phobie de la pénétration, croyances erronées, ou traumatismes antérieurs.\n\n**Prise en charge :**\n1. Psychoéducation anatomique.\n2. Désensibilisation progressive avec dilatateurs.\n3. Thérapie Cognitive (TCC).\n4. Exercices de Kegel inversés.",
        content_ar: "التشنج المهبلي هو تشنج لاإرادي لعضلات قاع الحوض.\n\n**الأسباب:** الخوف، المعتقدات الخاطئة، أو الصدمات.\n\n**الخطة العلاجية:**\n1. التربية النفسية الجنسية.\n2. العلاج السلوكي التدريجي.\n3. العلاج المعرفي.\n4. تمارين كيجيل العكسية.",
        content_en: "Vaginismus is an involuntary contraction of the outer third vaginal muscles.\n\n**Etiology:** Penetration phobia, misconceptions, or prior trauma.\n\n**Clinical Protocol:**\n1. Psychoeducation.\n2. Progressive desensitization with dilators.\n3. Cognitive Therapy (CBT).\n4. Reverse Kegel exercises.",
        image_url: "https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&w=800&q=80",
        is_video: 0, video_url: null,
        references: "DSM-5-TR.\nBinik, Y. M. (2010). Archives of Sexual Behavior.\nWHO Guidelines on Sexual Health Care.",
        scientific: 1,
        created_at: new Date().toISOString(),
      },
      // Injecter également les articles statiques du frontend
      ...staticArticles.map((a: any) => ({
        id: a.id,
        rubric_id: a.rubricId,
        title_fr: a.title.fr, title_ar: a.title.ar, title_en: a.title.en,
        summary_fr: a.summary?.fr ?? '', summary_ar: a.summary?.ar ?? '', summary_en: a.summary?.en ?? '',
        content_fr: a.content.fr, content_ar: a.content.ar, content_en: a.content.en,
        image_url: a.imageUrl ?? null,
        is_video: a.isVideo ? 1 : 0,
        video_url: a.videoUrl ?? null,
        references: a.references ?? null,
        scientific: a.scientific ? 1 : 0,
        created_at: new Date().toISOString(),
      })),
    ];

    const artStmt = (db as any).prepare(`
      INSERT OR IGNORE INTO articles (
        id, rubric_id, title_fr, title_ar, title_en,
        summary_fr, summary_ar, summary_en,
        content_fr, content_ar, content_en,
        image_url, is_video, video_url, "references", scientific, created_at
      ) VALUES (
        @id, @rubric_id, @title_fr, @title_ar, @title_en,
        @summary_fr, @summary_ar, @summary_en,
        @content_fr, @content_ar, @content_en,
        @image_url, @is_video, @video_url, @references, @scientific, @created_at
      )
    `);
    for (const a of seedArticles) artStmt.run(a);
    console.log(`[DB] ✅ ${seedArticles.length} articles seedés`);
  }
}

seedDatabase();

// ─── Routes API Articles ──────────────────────────────────────────────────────

// GET tous les articles
app.get('/api/articles', (_req, res) => {
  const rows = getAllArticles();
  res.json(rows.map(dbRowToArticle));
});

// POST créer un article (Dashboard Admin)
app.post('/api/articles', (req, res) => {
  const { rubricId, title, summary, content, imageUrl, isVideo, videoUrl, references, scientific } = req.body;

  if (!title?.fr || !title?.ar || !title?.en) {
    return res.status(400).json({ error: 'Multi-language title is required (fr, ar, en)' });
  }
  if (!content?.fr || !content?.ar || !content?.en) {
    return res.status(400).json({ error: 'Multi-language content is required (fr, ar, en)' });
  }

  const newArticle: DBArticle = {
    id: randomUUID(),
    rubric_id:  rubricId || 'body',
    title_fr:   title.fr,
    title_ar:   title.ar,
    title_en:   title.en,
    summary_fr: summary?.fr ?? '',
    summary_ar: summary?.ar ?? '',
    summary_en: summary?.en ?? '',
    content_fr: content.fr,
    content_ar: content.ar,
    content_en: content.en,
    image_url:  imageUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    is_video:   isVideo ? 1 : 0,
    video_url:  videoUrl || null,
    references: references || null,
    scientific: scientific ? 1 : 0,
    created_at: new Date().toISOString(),
  };

  insertArticle(newArticle);
  res.status(201).json(dbRowToArticle(newArticle));
});

// DELETE supprimer un article
app.delete('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteArticle(id);
  if (!deleted) return res.status(404).json({ error: 'Article not found' });
  res.json({ success: true, message: 'Article deleted successfully' });
});

// ─── Routes API Questions ─────────────────────────────────────────────────────

// GET toutes les questions
app.get('/api/questions', (_req, res) => {
  const rows = getAllQuestions();
  res.json(rows.map(dbRowToQAPair));
});

// POST soumettre une nouvelle question anonyme
app.post('/api/questions', (req, res) => {
  const { question, language, authorAge, authorGender } = req.body;
  if (!question?.trim()) {
    return res.status(400).json({ error: 'Question text is required' });
  }

  const newQ = {
    id:          randomUUID(),
    question:    question.trim(),
    language:    language || 'fr',
    authorAge:   authorAge ? parseInt(authorAge) : undefined,
    authorGender: authorGender || undefined,
    createdAt:   new Date().toISOString(),
  };

  insertQuestion(newQ);
  res.status(201).json(dbRowToQAPair({ ...newQ, author_age: newQ.authorAge, author_gender: newQ.authorGender, created_at: newQ.createdAt, answer: null, clinical_note: null, answered_at: null }));
});

// POST publier une réponse de clinicien
app.post('/api/questions/:id/answer', (req, res) => {
  const { id } = req.params;
  const { answer, clinicalNote } = req.body;

  if (!answer?.trim()) {
    return res.status(400).json({ error: 'Answer text is required' });
  }

  const answeredAt = new Date().toISOString();
  const updated = answerQuestion(id, answer.trim(), clinicalNote?.trim() ?? null, answeredAt);

  if (!updated) return res.status(404).json({ error: 'Question not found' });

  // Retourner la question mise à jour
  const rows = getAllQuestions();
  const q = rows.find(r => r.id === id);
  res.json(dbRowToQAPair(q));
});

// ─── Route Authentification & Sécurité Praticien ─────────────────────────────
app.post('/api/auth/clinician', (req, res) => {
  const { passcode } = req.body;
  const validPasscode = process.env.CLINICIAN_PASSCODE || 'DOCSEXPRIME2026';
  if (passcode && passcode.trim().toUpperCase() === validPasscode.toUpperCase()) {
    return res.json({ success: true, token: 'clinician-session-token-v3', role: 'certified_clinician' });
  }
  return res.status(401).json({ success: false, error: 'Code d\'accès clinicien invalide.' });
});

// ─── Route Export Données Cliniques (JSON) ───────────────────────────────────
app.get('/api/export/qa', (_req, res) => {
  const questions = getAllQuestions().map(dbRowToQAPair);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="docsexprime_qa_export.json"');
  res.json({
    platform: "DocSexprime Tunisia v3.0",
    exportedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    questions,
  });
});

// ─── Fallback Clinique Sexologique si Gemini n'est pas configuré ─────────────
function getClinicalFallbackResponse(prompt: string, language: string): string {
  const p = prompt.toLowerCase();
  
  if (p.includes('pilule') || p.includes('contracep') || p.includes('lendemain') || p.includes('حبل') || p.includes('منع الحمل') || p.includes('حبوب')) {
    if (language === 'ar') {
      return "حبة الصباح التالي (حبوب منع الحمل الاستعجالية) فعالة جداً إذا تم تناولها في أقرب وقت بعد العلاقة غير المحمية (خلال 72 ساعة). في تونس، هي متوفرة بالصيدليات دون وصفة طبية، ومراكز الديوان الوطني للأسرة والعمران البشري (ONFP) توفر خدمات واستشارات مجانية وسرية في كامل الولايات.";
    } else if (language === 'en') {
      return "Emergency contraception (morning-after pill) is most effective when taken as early as possible after unprotected intercourse (ideally within 24–72 hours). In Tunisia, it is accessible without a prescription in pharmacies, and ONFP centers offer confidential, free reproductive care.";
    }
    return "La contraception d'urgence (pilule du lendemain) est hautement efficace lorsqu'elle est prise le plus rapidement possible après un rapport non ou mal protégé (dans les 72h). En Tunisie, elle est disponible en pharmacie sans ordonnance, et les centres de l'ONFP (Office National de la Famille et de la Population) offrent des consultations gratuites, anonymes et bienveillantes dans tous les gouvernorats.";
  }

  if (p.includes('hymen') || p.includes('virg') || p.includes('عذر') || p.includes('بكار') || p.includes('sang') || p.includes('première fois') || p.includes('دم')) {
    if (language === 'ar') {
      return "طبياً وعلمياً، غشاء البكارة هو غشاء مرن به فتحات طبيعية، وتختلف أشكاله من امرأة لأخرى. عدم نزول دم في أول علاقة هو أمر طبيعي وشائع جداً (غشاء مطاطي). العذرية مفهوم اجتماعي وليست فحصاً تشريحياً. أول علاقة يجب أن تبنى على التراضي، الراحة النفسية وغياب الألم.";
    } else if (language === 'en') {
      return "Medically, the hymen is a flexible, highly elastic mucous tissue with natural openings. The absence of bleeding during a first intercourse is entirely normal and common. Virginity is a social construct rather than a physiological marker. Comfort, trust, and mutual consent are paramount.";
    }
    return "Sur le plan anatomique, l'hymen est une membrane élastique souple dotée d'ouvertures naturelles pour l'écoulement des règles. L'absence de saignement lors d'un premier rapport est très fréquente et parfaitement normale (hymen élastique ou complaisant). La virginité est un concept socioculturel et non un diagnostic médical. Le premier rapport doit avant tout reposer sur le désir partagé, la confiance et l'écoute mutuelle.";
  }

  if (p.includes('loi 58') || p.includes('harc') || p.includes('chantage') || p.includes('viol') || p.includes('قانون 58') || p.includes('ابتزاز') || p.includes('تحرش') || p.includes('1899') || p.includes('blackmail')) {
    if (language === 'ar') {
      return "في تونس، الابتزاز الجنسي بالصور والتحرش الإلكتروني أو الجسدي مجرّم بشدة تحت طائلة القانون الأساسي عدد 58 لسنة 2017. لستِ أو لستَ وحدك: يمكنك الاتصال فوراً بالرقم الأخضر الوطني المجاني 1899 (شغال 24/24) للحصول على المرافقة القانونية والنفسية، أو التوجه لأقرب فرقة مختصة للبحث في جرائم العنف.";
    } else if (language === 'en') {
      return "Tunisian Organic Law 58 of 2017 heavily penalizes digital blackmail, non-consensual sharing of intimate pictures, and any form of harassment. You can call the free national hotline 1899 available 24/7 for legal and psychological assistance.";
    }
    return "En Tunisie, le chantage aux photos intimes, le cyberharcèlement et toutes les formes d'agression sont sévèrement réprimés par la Loi Organique n°58 de 2017. Vous n'avez pas à porter cette culpabilité : contactez sans délai le numéro vert national gratuit 1899 (actif 24h/24 et 7j/7) pour une prise en charge juridique, psychologique et médicale protégée.";
  }

  if (p.includes('ist') || p.includes('mst') || p.includes('condom') || p.includes('préservatif') || p.includes('sida') || p.includes('vih') || p.includes('واقي') || p.includes('أمراض جنسية')) {
    if (language === 'ar') {
      return "الواقي الذكري هو الحماية الوحيدة والفعالة ضد الأمراض المنقولة جنسياً (السيدا، السيلان، الكلاميديا...). في تونس، الفحص المجاني والسري متاح في مراكز ديوان الأسرة (ONFP) ومراكز الإرشاد والفحص مجهول الهوية. إذا شعرت بحرقان أو لاحظت إفرازات غريبة، استشر طبيباً فوراً.";
    } else if (language === 'en') {
      return "Condoms provide vital dual protection against STIs (HIV, Hepatitis, Chlamydia, etc.) and unplanned pregnancy. Free and anonymous STI testing is accessible in Tunisia at ONFP health centers.";
    }
    return "Le préservatif est la seule protection barrière efficace contre les Infections Sexuellement Transmissibles (VIH, hépatite B, chlamydia, gonorrhée, HPV). En Tunisie, le dépistage est entièrement anonyme et gratuit dans les centres de l'ONFP et les CDAG. En cas de brûlure mictionnelle ou d'écoulement anormal, consultez rapidement un médecin.";
  }

  if (p.includes('vaginisme') || p.includes('douleur') || p.includes('ألم') || p.includes('تشنج مهبلي') || p.includes('dyspareunie')) {
    if (language === 'ar') {
      return "التشنج المهبلي هو انقباض لاإرادي لعضلات قاع الحوض يعيق الإيلاج. هذا الاضطراب شائع جداً وله علاج سريري فعال بنسبة نجاح عالية جداً بالتعاون مع أخصائي علم جنس عبر التمارين السلوكية والاسترخاء وإعادة تأهيل عضلات الحوض.";
    } else if (language === 'en') {
      return "Vaginismus is an involuntary pelvic floor muscle spasm making penetration painful or impossible. It is highly treatable through clinical sex therapy, CBT, and progressive pelvic therapy.";
    }
    return "Le vaginisme est une contraction réflexe et involontaire des muscles pelvi-périnéaux lors d'une tentative de pénétration. C'est un motif de consultation très fréquent qui se traite avec un excellent taux de réussite grâce à une approche pluridisciplinaire (TCC, rééducation périnéale, dilatateurs progressifs). N'hésitez pas à en parler à un sexologue ou un gynécologue.";
  }

  if (language === 'ar') {
    return "مرحباً بك، أنا أمل مستشارتك في علم الجنس العيادي. أستمع إليك بكل سرية وتفهّم. صحتك وراحتك النفسية أولويتنا. يمكنك تصفح مقالاتنا العلمية، أو طرح سؤالك دون كشف هويتك في منتدى الأسئلة، أو التوجه لأحد مراكز الديوان الوطني للأسرة (ONFP) القريبة منك لخدمات طبية مجانية.";
  } else if (language === 'en') {
    return "Hello, I am Amel, your clinical sexology advisor. I am here to help in complete confidentiality. Feel free to explore our clinical articles, submit an anonymous question to our specialists, or reach out to an ONFP center for free health services.";
  }
  return "Bonjour, je suis Amel, votre conseillère en sexologie clinique pour DocSexprime Tunisie. Je réponds à toutes vos interrogations avec bienveillance et rigueur médicale, sans aucun tabou. Vous pouvez explorer nos articles scientifiques, poser une question anonyme sur le forum ou vous orienter vers le centre ONFP le plus proche de votre gouvernorat pour une consultation confidentielle et gratuite.";
}

// API Route: Call Gemini as Virtual Sexologist Advisor "Amel"
app.post('/api/amel-advisor', async (req, res) => {
  const { prompt, language = 'fr', history } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Si aucune clé Gemini n'est définie, utiliser le moteur clinique de fallback intelligent
  const ai = getGenAI();
  if (!ai) {
    const fallbackReply = getClinicalFallbackResponse(prompt, language);
    return res.json({ reply: fallbackReply, isFallback: true });
  }

  try {
    const systemInstruction = `You are "Amel", a senior clinical sexology virtual advisor for "DocSexprime Tunisie", a pioneer sex education platform.
Your target audience is young Tunisians (aged 15-25) as well as Tunisian healthcare professionals.
You operate under the guidance of a Master's degree in Clinical Sexology. Your tone must be clinical, medically precise, non-judgmental, warm, empathetic, and strictly scientifically objective.
Do not introduce any moralizing, religious judgment, or social stigma. Be educational and clear.

Language guidelines:
- If the user talks to you in Tunisian Arabic (Derja / Arabic script / Latin keyboard), respond in friendly, reassuring, and clear Tunisian Derja (using Arabic script primarily, or latin script if appropriate, but Arabic script is preferred).
- If they write in French, respond in elegant and precise French.
- If they write in English, respond in English.

Cultural adaptation for Tunisia:
- Respect medical laws. Refer to Tunisian public health resources such as the Office National de la Famille et de la Population (ONFP) which exists across all governorates and offers free, confidential, non-stigmatizing consultations and contraception for youth.
- Mention Tunisian Organic Law 58 of 2017 for the elimination of violence against women, which strictly criminalizes sexual harassment, marital rape, cyberbullying, and blackmail (revenge porn).
- Avoid unnecessary dry clinical jargon when talking to youth, explain concepts like virginity, hymen, puberty, masturbation, and contraception using factual medical analogies to reduce anxiety.
- Always add a humble medical warning at the end of critical symptoms, advising them to consult a gynecologist, urologist, or clinical sexologist.
`;

    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === 'assistant' ? 'model' : h.role,
      parts: [{ text: h.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || '';
    res.json({ reply });
  } catch (error) {
    console.warn('Gemini API Warning (utilisant le fallback clinique):', error);
    const fallbackReply = getClinicalFallbackResponse(prompt, language);
    res.json({ reply: fallbackReply, isFallback: true });
  }
});

// API Route: Text-To-Speech for Articles using gemini-2.5-flash-preview-tts
app.post('/api/articles/tts', async (req, res) => {
  const { text, language, voice } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for synthesis' });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json({
      fallback: true,
      audio: null,
      message: 'GEMINI_API_KEY non configurée. Bascule automatique vers le moteur SpeechSynthesis du navigateur.'
    });
  }

  try {
    const sanitizedText = text
      .replace(/\*\*|#|_|🔬/g, '')
      .trim();

    let voiceName = voice || 'Zephyr';
    if (!voice) {
      if (language === 'ar') voiceName = 'Kore';
      else if (language === 'en') voiceName = 'Puck';
      else voiceName = 'Zephyr';
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Synthesize clearly: ${sanitizedText}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS model');
    }

    const pcmBuffer = Buffer.from(base64Audio, 'base64');
    const sampleRate = 24000;
    const header = Buffer.alloc(44);
    const dataLength = pcmBuffer.length;
    const fileLength = 36 + dataLength;

    header.write('RIFF', 0);
    header.writeUInt32LE(fileLength, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);

    const wavBuffer = Buffer.concat([header, pcmBuffer]);
    const wavBase64 = wavBuffer.toString('base64');

    res.json({
      audio: `data:audio/wav;base64,${wavBase64}`
    });
  } catch (err: any) {
    console.warn('TTS API warning (fallback navigateur):', err.message);
    res.json({
      fallback: true,
      audio: null,
      message: 'Erreur lors de la synthèse serveur, utilisation du moteur local.'
    });
  }
});

// Setup Vite Dev Server Middleware or Production Static Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DocSexprime Tunisia Server] Running on port http://localhost:${PORT}`);
  });
}

startServer();
