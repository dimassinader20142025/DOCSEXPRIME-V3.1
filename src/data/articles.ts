import { Rubric, Article } from '../types';

export const rubrics: Rubric[] = [
  {
    id: 'body',
    title: {
      fr: "Les corps et leurs changements",
      ar: "الجسد والتغيرات العميقة",
      en: "Bodies and Their Changes"
    },
    description: {
      fr: "Découvrir la puberté, les hormones, l'hygiène et le fonctionnement de l'appareil reproducteur.",
      ar: "فهم فترة البلوغ، الهرمونات، النظافة الشخصية وكيفية عمل الجهاز التناسلي.",
      en: "Explore puberty, hormones, hygiene, and reproductive biology."
    },
    bgColor: "bg-emerald-50 text-emerald-900 border-emerald-200",
    imageUrl: "body_changes"
  },
  {
    id: 'relations',
    title: {
      fr: "Les relations et l'amour",
      ar: "العلاقات والمشاعر العاطفية",
      en: "Relationships and Love"
    },
    description: {
      fr: "Amitié, amour, communication, respect mutuel et notion essentielle de consentement.",
      ar: "الصداقة، الحب، التواصل الفعال، الاحترام المتبادل والمفهوم الجوهري للموافقة والرضا.",
      en: "Friendship, love, communication, mutual respect, and the core concept of consent."
    },
    bgColor: "bg-blue-50 text-blue-900 border-blue-200",
    imageUrl: "relations"
  },
  {
    id: 'standards',
    title: {
      fr: "Les critères et réseaux sociaux",
      ar: "المعايير المفروضة وسائل التواصل",
      en: "Standards and Social Media"
    },
    description: {
      fr: "Décoder la 'normalité', l'impact du porno, des réseaux sociaux et de la comparaison sur l'estime de soi.",
      ar: "تفكيك مفهوم 'الجسد المثالي'، تأثير الإباحية ومواقع التواصل والمقارنة على الثقة بالنفس.",
      en: "Decoding 'normality', the impact of pornography, social media, and body comparisons on self-esteem."
    },
    bgColor: "bg-amber-50 text-amber-900 border-amber-200",
    imageUrl: "social_standards"
  },
  {
    id: 'protection',
    title: {
      fr: "Se protéger & Contraception",
      ar: "الوقاية وطرق تحديد النسل",
      en: "Protection and Contraception"
    },
    description: {
      fr: "Préservatifs, pilule, double protection, prévention des IST/Sida et adresses utiles en Tunisie.",
      ar: "الواقي الذكري، حبوب منع الحمل، الوقاية من الأمراض المنقولة جنسياً (IST) ومراكز المساعدة في تونس.",
      en: "Condoms, birth control, double protection, STI prevention, and clinics in Tunisia."
    },
    bgColor: "bg-pink-50 text-pink-900 border-pink-200",
    imageUrl: "protection"
  },
  {
    id: 'abuse',
    title: {
      fr: "Faire face aux abus et Loi 58",
      ar: "مواجهة الاعتداءات والقانون عدد 58",
      en: "Dealing with Abuse & Law 58"
    },
    description: {
      fr: "Détecter le harcèlement, la violence, connaître la Loi 58 de 2017 et savoir vers qui se tourner en Tunisie.",
      ar: "كشف التحرش، العنف، فهم القانون التونسي عدد 58 لسنة 2017 ومراكز الدعم والإرشاد المتاحة.",
      en: "Detecting harassment, violence, understanding Tunisian Law 58 of 2017, and access to support networks."
    },
    bgColor: "bg-rose-50 text-rose-900 border-rose-200",
    imageUrl: "abuse_prevention"
  }
];

export const articles: Article[] = [
  {
    id: 'puberty-basics',
    rubricId: 'body',
    title: {
      fr: "La puberté : Comprendre la révolution du corps",
      ar: "البلوغ: فهم الثورة الفيزيولوجية للجسد",
      en: "Puberty: Understanding the Body's Revolution"
    },
    summary: {
      fr: "La puberté apporte des changements physiques et psychologiques majeurs. Voici ce qui se passe.",
      ar: "تأتي فترة البلوغ بتغيرات جسدية ونفسية كبرى. إليك ما يحدث لجسدك وهرموناتك بالتفصيل.",
      en: "Puberty brings major physical and psychological changes. Here is a scientific guide to what happens."
    },
    content: {
      fr: `La puberté est l'étape de transition entre l'enfance et l'âge adulte. Elle commence généralement entre 9 et 14 ans, déclenchée par des signaux du cerveau (l'hypothalamus) qui stimulent la production d'hormones.

**Chez les personnes avec une vulve et un utérus :**
- Développement des seins (bourgeon mammaire).
- Apparition de la pilosité (pubis, aisselles).
- Les premières règles (menstruations), signe du début du cycle d'ovulation. Il est normal que les cycles soient irréguliers au début.

**Chez les personnes avec un pénis et des testicules :**
- Augmentation de la taille des testicules et du pénis.
- Changement de la voix (la mue), dû à l'épaississement des cordes vocales sous l'effet de la testostérone.
- Premières éjaculations, parfois nocturnes et involontaires (pollutions nocturnes).

**Pour tout le monde :**
- Poussée de croissance rapide.
- Changements cutanés (apparition d'acné, peau plus grasse) et odeur corporelle plus forte.
- Changements d'humeur liés aux fluctuations hormonales et à la restructuration cérébrale.

C'est une période de questionnements intenses. Prendre soin de son hygiène, manger sainement et en parler à un professionnel de santé (médecin scolaire, généraliste ou pédiatre) aide à vivre cette transition sereinement.`,
      ar: `البلوغ هو مرحلة الانتقال من الطفولة إلى الرشد. تبدأ هذه المرحلة عادة بين سن 9 و14 عاماً، عندما يرسل الدماغ إشارات للهرمونات لتبدأ بالنشاط.

**عند الإناث (الجسد ذو الرحم والـمبيضين):**
- نمو الثديين تدريجياً.
- ظهور الشعر في منطقة العانة وتحت الإبطين.
- بداية الدورة الشهرية (الطمث)، وهي علامة على بدء نضج المبيضين. من الطبيعي جداً أن تكون الدورة غير منتظمة في السنوات الأولى.

**عند الذكور (الجسد ذو الخصيتين والقضيب):**
- كبر حجم الخصيتين والقضيب.
- تغير طبقة الصوت (خشونة الصوت) بسبب تضخم الحبال الصوتية بتأثير هرمون التستوستيرون.
- حدوث الاحتلام (القذف اللاإرادي أثناء النوم)، وهو أمر طبيعي وعادي جداً ولا داعي للخجل منه.

**بالنسبة للجميع:**
- نمو سريع في الطول والوزن.
- تغيرات في البشرة (ظهور حب الشباب، زيادة إفراز الدهون) وتغير رائحة عرق الجسم.
- تقلبات مزاجية ناتجة عن التغيرات الهرمونية العميقة وتطور خلايا الدماغ.

هذه المرحلة طبيعية ويمر بها كل إنسان. من المهم العناية بالنظافة الشخصية، تناول غذاء متوازن، والتحدث مع أخصائي صحي أو شخص ناضج وموثوق عند الشعور بالقلق.`,
      en: `Puberty is the developmental transition from childhood to adulthood. Usually starting between ages 9 and 14, it is triggered by brain signals (the hypothalamus) activating sexual hormones.

**In individuals with a vulva and uterus:**
- Breast development (breast buds).
- Growth of pubic and underarm hair.
- First menstruation (periods), signaling the start of the ovulation cycle. Irregular cycles are completely normal at the beginning.

**In individuals with a penis and testes:**
- Growth of the testes and penis.
- Voice deepening, caused by vocal cords thickening due to testosterone.
- First ejaculations, which can happen involuntarily during sleep (wet dreams). This is normal and healthy.

**For everyone:**
- Growth spurts (rapid height and weight increase).
- Skin changes (acne, oily skin) and stronger body odor.
- Mood swings driven by hormonal fluctuations and neurological restructuring.

Understanding these biological steps helps navigate puberty confidently. Consult school doctors or clinicians if you have any medical concerns.`
    },
    imageUrl: "body_basics"
  },
  {
    id: 'consent-explained',
    rubricId: 'relations',
    title: {
      fr: "Le Consentement : La base d'une relation saine",
      ar: "الموافقة والرضا: أساس كل علاقة سليمة",
      en: "Consent: The Foundation of Healthy Relationships"
    },
    summary: {
      fr: "Qu'est-ce que le consentement ? Comment s'assurer qu'il est libre, éclairé et enthousiaste ?",
      ar: "ما هي الموافقة والرضا في العلاقات؟ كيف نضمن أنها نابعة من حرية، وعي وحماس متبادل؟",
      en: "What is consent? How do we ensure it is free, informed, and enthusiastic?"
    },
    content: {
      fr: `Le consentement est l'accord explicite, libre et volontaire donné par une personne pour s'engager dans une activité spécifique, notamment sexuelle ou physique. Il est indispensable à chaque étape et pour chaque pratique.

Pour être valable, le consentement doit respecter la règle du **F.R.E.S.H.** :
1. **F - Freely given (Libre) :** Donné sans pression, chantage, menace ou manipulation. Si l'autre dit oui par peur ou pour 'faire plaisir', ce n'est pas du consentement.
2. **R - Reversible (Rétractable) :** On a le droit de changer d'avis à tout moment, même au milieu d'un rapport. 'Oui' un jour ne veut pas dire 'Oui' pour toujours.
3. **E - Enthusiastic (Enthousiaste) :** L'autre doit exprimer un désir réel. Un silence ou l'absence de 'Non' ne vaut pas un 'Oui'.
4. **S - Specific (Spécifique) :** Accepter un baiser ne veut pas dire accepter d'autres gestes intimes. Chaque acte nécessite un accord.
5. **H - Honest & Informed (Éclairé) :** Pas de mensonge ou de dissimulation (comme retirer discrètement un préservatif, ce qui constitue une agression appelée "stealthing").

**Le rôle du consentement en couple :**
Être en couple ou marié ne donne aucun droit automatique sur le corps de l'autre. Le viol conjugal existe et est puni par la loi. La communication ouverte et l'écoute attentive des signaux verbaux et non-verbaux de son partenaire sont les clés d'une vie affective et sexuelle épanouie.`,
      ar: `الموافقة والرضا (Consentement) هي الاتفاق الصريح والحر والطوعي الذي يعطيه الشخص للمشاركة في أي نشاط، وخاصة النشاط العاطفي أو الجنسي. إنها ضرورية في كل خطوة ومع كل ممارسة.

لكي تكون الموافقة صحيحة وحقيقية، يجب أن تستوفي الشروط التالية:
1. **حرية تامة:** تُعطى دون ضغط، ابتزاز، تهديد أو تلاعب. إذا قال الطرف الآخر 'نعم' خوفاً أو لإرضائك فقط، فهذا لا يعتبر رضا حقيقياً.
2. **قابلة للتراجع:** يحق لأي طرف تغيير رأيه والتراجع في أي لحظة، حتى أثناء الممارسة. قول 'نعم' اليوم لا يعني 'نعم' دائماً.
3. **متحمسة وواضحة:** يجب أن يعبر الشريك عن رغبة حقيقية. الصمت أو عدم قول 'لا' لا يعني أبداً 'نعم'.
4. **محددة وخاصة:** الموافقة على القبلة لا تعني الموافقة على مداعبات أخرى. كل فعل يحتاج إلى موافقة مستقلة.
5. **صادقة وواعية:** خالية من الخداع والكذب (مثل نزع الواقي الذكري سراً دون علم الطرف الآخر، وهو اعتداء يعاقب عليه القانون).

**الرضا في إطار العلاقة:**
العلاقة العاطفية أو حتى الزواج لا يمنح أي حق تلقائي في جسد الطرف الآخر. التواصل المفتوح والاستماع بجدية لإشارات الشريك هما المفتاح لعلاقة عاطفية وجنسية متوازنة وسعيدة.`,
      en: `Consent is the explicit, free, and voluntary agreement given by a person to engage in a specific physical or sexual activity. It must be present at every single stage.

True consent follows the **F.R.E.S.H.** framework:
1. **F - Freely given:** Given without peer pressure, blackmail, or manipulation.
2. **R - Reversible:** Anyone can change their mind at any point, even in the middle of an intimacy.
3. **E - Enthusiastic:** There must be genuine mutual desire. Silence or 'not saying no' is not a 'Yes'.
4. **S - Specific:** Consenting to one act (like kissing) does not imply consent to other actions.
5. **H - Honest & Informed:** No deception (such as stealthing, which is removing a condom without consent).

Consent is dynamic. Being in a relationship or married does not grant automated access to another's body. Healthy communication protects both partners.`
    },
    imageUrl: "consent"
  },
  {
    id: 'social-media-body',
    rubricId: 'standards',
    title: {
      fr: "Réseaux Sociaux & Image corporelle : Sortir du filtre",
      ar: "مواقع التواصل وصورة الجسد: التحرر من الفلاتر",
      en: "Social Media and Body Image: Breaking the Filter"
    },
    summary: {
      fr: "Comment Instagram, TikTok et les filtres altèrent notre perception du corps réel.",
      ar: "كيف تؤثر تطبيقات إنستغرام وتيك توك والفلاتر على نظرتنا لأجسادنا الحقيقية وكيف نتجاوز ذلك.",
      en: "How Instagram, TikTok, and filters alter our perception of real human bodies."
    },
    content: {
      fr: `Aujourd'hui, nous passons des heures à faire défiler des photos et vidéos sur les réseaux sociaux. Ces images montrent souvent des corps modifiés par des filtres, des angles de prise de vue calculés ou de la chirurgie esthétique. 

**L'effet de comparaison sociale :**
Notre cerveau a tendance à se comparer inconsciemment. En voyant des images de corps 'parfaits', nous développons une insatisfaction corporelle (dysmorphophobie), une baisse de l'estime de soi et, dans certains cas, des troubles du comportement alimentaire (anorexie, boulimie).

**La réalité derrière l'écran :**
- Les pores de la peau, les vergetures, la cellulite, la dissymétrie et les boutons sont **complètement normaux** et sains. Ils sont pourtant systématiquement gommés en ligne.
- Les algorithmes mettent en avant les contenus qui suscitent des réactions fortes, favorisant les stéréotypes de beauté irréalistes.

**Conseils pour une relation saine avec son corps :**
- **Faites un tri numérique (Digital Detox) :** Désabonnez-vous des comptes qui vous font vous sentir mal dans votre peau.
- **Valorisez votre corps pour ce qu'il fait :** Son utilité (marcher, danser, respirer, ressentir) est bien plus importante que son apparence esthétique.
- **Rappelez-vous :** La beauté réelle réside dans la diversité. Aucun corps n'est une erreur de la nature.`,
      ar: `نقضي اليوم ساعات طويلة في تصفح الصور ومقاطع الفيديو على منصات التواصل الاجتماعي. تعرض هذه المنصات غالباً صوراً معدلة بالفلاتر، وإضاءات مدروسة، أو حتى عمليات تجميلية.

**أثر المقارنة الاجتماعية:**
يقوم دماغنا لاإرادياً بمقارنة أنفسنا بما نراه. رؤية الأجساد 'المثالية' المزيفة تولد شعوراً بعدم الرضا عن الجسد الخاص، ضعف الثقة بالنفس، وفي بعض الحالات اضطرابات في الأكل (مثل فقدان الشهية العصبي).

**الحقائق خلف الشاشة:**
- مسام الجلد، علامات التمدد، السيلوليت، عدم التماثل البسيط، والحبوب هي أمور **طبيعية تماماً** وصحية، لكن يتم إخفاؤها بانتظام على الإنترنت.
- الخوارزميات تروج للصور التي تجلب تفاعلاً أكبر، مما يرسخ معايير جمالية خيالية وغير واقعية.

**خطوات لعلاقة أفضل مع جسدك:**
- **تنقية حساباتك:** ألغِ متابعة الحسابات التي تجعلك تشعر بالدونية أو الخجل من جسدك.
- **تثمين وظائف الجسد:** جسدك أداة لتعيش، تمشي، تتنفس، وتستمتع بالحياة، وليس مجرد لوحة للعرض.
- **تذكر دائماً:** الجمال الحقيقي يكمن في الاختلاف والتنوع الطبيعي بين البشر.`,
      en: `We spend hours scrolling through perfectly curated feeds. These spaces showcase bodies highly altered by filters, poses, or digital enhancement.

**The Comparison Trap:**
Subconsciously, we compare our normal offline bodies with highly optimized online representations. This can lead to body dissatisfaction, low self-esteem, or disordered eating behaviors.

**The Reality Check:**
- Skin pores, stretch marks, asymmetry, and blemishes are **completely normal** biological realities.
- Algorithms prioritize extreme aesthetic images to boost engagement, trapping users in unrealistic loops.

**Take Back Control:**
- **Curate your feed:** Unfollow profiles that trigger negative feelings about your body.
- **Focus on function:** Appreciate your body for what it lets you do—breathing, dancing, running, and feeling.
- **Embrace diversity:** Human bodies naturally come in all shapes and sizes.`
    },
    imageUrl: "social_media"
  },
  {
    id: 'contraception-methods',
    rubricId: 'protection',
    title: {
      fr: "Les Méthodes de Contraception disponibles en Tunisie",
      ar: "طرق منع الحمل والوقاية الـمتاحة في تونس",
      en: "Contraception Methods Available in Tunisia"
    },
    summary: {
      fr: "Préservatifs, pilule, implants... Guide clinique des méthodes de contraception et de protection contre les IST.",
      ar: "الواقي الذكري، الحبوب، الغرسة... دليل طبي شامل لطرق منع الحمل والوقاية من الأمراض الجنسية في تونس.",
      en: "Condoms, pills, implants... A clinical guide to family planning and STI prevention in Tunisia."
    },
    content: {
      fr: `Choisir sa méthode de contraception est un droit fondamental. En Tunisie, plusieurs méthodes efficaces sont disponibles et souvent subventionnées par l'État dans les structures publiques (dispensaires, centres de l'ONFP).

**1. Le Préservatif Externe (Masculin) :**
- **Avantage crucial :** C'est la **seule** méthode (avec le préservatif interne) qui protège à la fois d'une grossesse non désirée et des IST (Sida, Chlamydia, Syphilis, Hépatites).
- **Utilisation :** Doit être utilisé systématiquement à chaque rapport, dès le début de la pénétration.

**2. La Pilule Contraceptive (Hormonale) :**
- **Comment ça marche :** Prise quotidienne à heure fixe pour bloquer l'ovulation. Très efficace si elle n'est pas oubliée. Ne protège pas des IST.

**3. Le DIU (Stérilet - Dispositif Intra-Utérin) :**
- **Description :** Petit dispositif en cuivre ou hormonal inséré dans l'utérus par un médecin ou une sage-femme. Offre une protection à long terme (3 à 10 ans). Pratique car il n'y a pas de risque d'oubli.

**4. L'Implant Contraceptif :**
- **Description :** Petit bâtonnet hormonal placé sous la peau du bras, efficace pendant 3 ans.

**La Double Protection :**
Pour une sécurité maximale, il est fortement conseillé de combiner l'usage du préservatif (pour les IST) avec un autre moyen contraceptif hautement efficace comme la pilule ou le stérilet (pour éviter une grossesse en cas de rupture du préservatif).

**Où consulter en Tunisie ?**
- Les centres de l'Office National de la Famille et de la Population (ONFP) présents dans tous les gouvernorats tunisiens. Ils offrent des consultations gratuites ou à tarif très réduit, confidentielles, pour les jeunes.
- Les gynécologues, médecins généralistes ou sages-femmes du secteur public ou privé.`,
      ar: `اختيار وسيلة منع الحمل والوقاية هو حق أساسي لكل شخص. في تونس، تتوفر وسائل فعالة متعددة ومدعومة من الدولة في الهياكل الصحية العمومية (مثل مراكز الديوان الوطني للأسرة والعمران البشري ONFP والمستوصفات).

**1. الواقي الذكري (Préservatif):**
- **ميزة جوهرية:** هو الوسيلة **الوحيدة** التي تمنع الحمل غير المرغوب فيه وتحمي في نفس الوقت من الأمراض المنقولة جنسياً (مثل السيدا، الكلاميديا، السيلان، السيفيليس والتهاب الكبد ب).
- **الاستخدام:** يجب استخدامه بانتظام وبطريقة صحيحة منذ بداية العلاقة الجنسية.

**2. حبوب منع الحمل (Contraception hormonale):**
- **طريقة العمل:** تؤخذ يومياً في نفس الوقت لتعطيل عملية الإباضة. فعالة جداً شريطة عدم النسيان. لا تحمي من الأمراض المنقولة جنسياً.

**3. اللولب الرحمي (Stérilet / DIU):**
- **الوصف:** جهاز صغير جداً من النحاس أو يفرز الهرمونات، يضعه الطبيب أو القابلة داخل الرحم. يوفر حماية طويلة الأمد (من 3 إلى 10 سنوات) وهو ممتاز لأنه يزيل خطر النسيان.

**الوقاية المزدوجة (Double Protection):**
لأقصى درجات الأمان، يُنصح بشدة بدمج استخدام الواقي الذكري (للوقاية من الأمراض المنقولة جنسياً) مع وسيلة منع حمل أخرى كالحبوب أو اللولب (لتجنب الحمل في حال تمزق الواقي).

**أين تتوجه في تونس؟**
- مراكز الديوان الوطني للأسرة والعمران البشري (ONFP) المتواجدة في كل ولايات الجمهورية التونسية، حيث تقدم خدمات واستشارات مجانية أو شبه مجانية، وتضمن السرية التامة للشباب.
- أطباء النساء والتوليد، الأطباء العامون والقابلات في القطاعين العام والخاص.`,
      en: `Choosing a contraceptive method is a fundamental healthcare right. In Tunisia, highly effective methods are available and heavily subsidized by the government in public health networks (ONFP centers and dispensaries).

**1. The Male Condom:**
- **Crucial Benefit:** It is the **only** method (alongside female condoms) that simultaneously prevents unintended pregnancy and blocks STIs (HIV, Chlamydia, Syphilis, Hepatitis B).
- **Usage:** Must be used consistently and correctly from the very start of any physical penetration.

**2. The Birth Control Pill (Hormonal):**
- **How it works:** A daily pill taken at a fixed hour to block ovulation. Highly effective when taken consistently. Does not protect against STIs.

**3. The IUD (Intrauterine Device):**
- **Description:** A small copper or hormonal device inserted into the uterus by a doctor or midwife. Provides long-term protection (3 to 10 years).

**Double Protection Strategy:**
For maximum safety, combine condoms (for STI block) with another highly reliable contraceptive like the pill or IUD (to secure pregnancy protection in case of condom slippage).

**Where to go in Tunisia?**
- National Family Planning Office (ONFP) clinics are available across all Tunisian governorates. They offer confidential, free, or low-cost services specifically for youth.`
    },
    imageUrl: "contraception"
  },
  {
    id: 'law-58-tunisia',
    rubricId: 'abuse',
    title: {
      fr: "La Loi 58 de 2017 : Protection contre les violences",
      ar: "القانون عدد 58 لسنة 2017: حماية من العنف ضد المرأة",
      en: "Law 58 of 2017: Protection Against Violence in Tunisia"
    },
    summary: {
      fr: "Tout savoir sur le cadre juridique tunisien historique protégeant contre le harcèlement et les abus.",
      ar: "دليل قانوني مبسط للقانون التونسي التاريخي عدد 58 لحماية الأفراد من العنف والتحرش والاعتداءات.",
      en: "A legal guide to Tunisia's historic framework protecting individuals against harassment and abuse."
    },
    content: {
      fr: `La Tunisie a adopté en juillet 2017 la **Loi organique n°2017-58** relative à l'élimination de la violence à l'égard des femmes. C'est un texte pionnier qui redéfinit la protection de l'intégrité physique et morale des personnes, en particulier des femmes et des mineurs.

**Ce que la Loi 58 punit sévèrement :**
- **Le Harcèlement sexuel :** Toute parole, geste ou comportement à connotation sexuelle répété qui porte atteinte à la dignité de la personne ou crée un environnement hostile (punissable d'emprisonnement et d'amendes).
- **Le Cyberharcèlement et le chantage (Revenge Porn) :** Diffuser des photos privées, des messages intimes ou des nudes sans l'accord de la personne, même s'ils ont été envoyés volontairement au départ, est un délit grave passible de prison.
- **Le Viol et les agressions sexuelles :** La loi élimine les anciennes failles juridiques (comme le fait que l'agresseur puisse épouser sa victime mineure pour échapper aux poursuites).
- **La violence conjugale :** Les violences physiques ou psychologiques au sein du couple sont lourdement sanctionnées.

**Comment réagir en cas d'abus en Tunisie ?**
- **Numéro vert national (gratuit, 24h/24) : 1899** pour signaler les violences et obtenir une écoute psychologique et juridique.
- Se rendre dans un poste de police ou de garde nationale : la loi impose la création de **brigades spécialisées dans la lutte contre les violences faites aux femmes et aux enfants** formées pour accueillir les victimes avec dignité.
- Contacter les associations de la société civile (ATFD, AFTURD) qui offrent un soutien juridique et d'hébergement.`,
      ar: `اعتمدت تونس في جويلية 2017 **القانون الأساسي عدد 58 لسنة 2017** المتعلق بالقضاء على العنف ضد المرأة. وهو قانون ريادي وتاريخي يهدف إلى حماية السلامة الجسدية والمعنوية للأفراد، وخاصة النساء والأطفال القصر.

**ما يعاقب عليه القانون عدد 58 بصرامة:**
- **التحرش الجنسي:** كل فعل، قول أو إشارة ذات إيحاء جنسي تتكرر وتمس من كرامة الشخص أو تخلق مناخاً مهيناً أو عدائياً (تصل العقوبات للسجن والخطايا المالية).
- **الابتزاز الرقمي ونشر الصور الخاصة (Revenge Porn):** نشر صور خاصة، رسائل حميمة أو لقطات عارية دون موافقة واضحة من صاحبها، حتى لو تم إرسالها طواعية في البداية، هي جريمة يعاقب عليها القانون التونسي بالسجن.
- **الاغتصاب والاعتداءات الجنسية:** ألغى القانون فصولاً قديمة كانت تسمح للجاني بالإفلات من العقاب في حال زواجه من الضحية القاصر.
- **العنف الزوجي:** العنف الجسدي أو النفسي داخل الأسرة أو بين الزوجين يعاقب عليه القانون بصرامة مضاعفة.

**كيف تتصرف في حال التعرض لاعتداء في تونس؟**
- **الرقم الأخضر الوطني المجاني (24/24 ساعة): 1899** للتبليغ عن حالات العنف وتلقي الإرشاد النفسي والقانوني.
- التوجه لأقرب مركز أمن أو حرس وطني: يفرض القانون وجود **فرق مختصة في مكافحة العنف ضد المرأة والطفل** مدربة خصيصاً لاستقبال الضحايا والاستماع إليهم في كنف السرية والاحترام.
- الاتصال بالجمعيات النسوية والحقوقية الناشطة في تونس (مثل الجمعية التونسية للنساء الديمقراطيات ATFD) للحصول على الدعم القانوني والنفسي والإيواء عند الحاجة.`,
      en: `In July 2017, Tunisia enacted **Organic Law No. 2017-58** on the elimination of violence against women. This landmark legislation offers extensive protection for the physical, psychological, and sexual integrity of individuals, particularly women and minors.

**Key criminalized actions under Law 58:**
- **Sexual Harassment:** Any repeated gesture, word, or behaviour with a sexual connotation that harms dignity or creates a hostile environment (punishable by imprisonment and high fines).
- **Cyberharassment and Revenge Porn:** Distributing private photos, intimate messages, or nudes without explicit consent—even if originally sent voluntarily—is a criminal offense.
- **Marital Violence:** Physical or psychological abuse within marriage is heavily sanctioned; marriage no longer grants legal immunity.
- **Rape & Assault:** The law abolished old loopholes (such as allowing a rapist to escape prosecution by marrying his minor victim).

**How to get help in Tunisia:**
- **National Toll-Free Helpline (24/7): 1899** for reporting violence and getting confidential legal/psychological support.
- Specialized Police Units: Police and National Guard stations host **specialized brigades trained specifically** to support victims.`
    },
    imageUrl: "law_58"
  }
];
