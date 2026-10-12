import { QuizQuestion } from '../types';

export const quizzes: QuizQuestion[] = [
  {
    id: 'myth-virginity',
    type: 'myth_reality',
    statement: {
      fr: "L'hymen d'une femme doit obligatoirement saigner lors du premier rapport sexuel.",
      ar: "غشاء البكارة يجب بالضرورة أن ينزف دماً عند أول علاقة جنسية كاملة.",
      en: "A woman's hymen must bleed during her first physical intercourse."
    },
    isMyth: true,
    explanation: {
      fr: "C'est un mythe scientifiquement faux. L'hymen n'est pas une membrane fermée qui se 'déchire', mais une petite collerette de tissu souple et élastique qui entoure l'entrée du vagin. Dans de nombreux cas, il est tellement souple qu'il s'étire sans saigner, ou il a déjà été distendu par des activités quotidiennes, le sport ou l'usage de tampons. Moins de 50% des femmes saignent lors de leur première pénétration. Les saignements sont souvent dus à l'anxiété et au manque de lubrification.",
      ar: "هذه خرافة خاطئة علمياً وطبياً. غشاء البكارة ليس غشاءً مغلقاً بالكامل يحتاج إلى 'تمزيق'، بل هو حلقة مرنة ولينة من الأنسجة تحيط بفتحة المهبل وبها فتحات طبيعية لمرور دم الدورة الشهرية. في كثير من الحالات، يكون الغشاء مطاطياً ومرناً لدرجة أنه يتمدد دون أن ينزف، أو قد يتمدد بسبب الأنشطة الرياضية اليومية. تشير الدراسات الطبية إلى أن أقل من 50% من النساء ينزفن عند أول جماع. وغالباً ما يكون النزيف الطفيف ناتجاً عن التوتر، الخوف، وقلة الإفرازات المرطبة الطبيعية للمهبل.",
      en: "This is scientifically false. The hymen is not a fully sealed membrane that needs to 'tear'; it is a flexible, elastic ring of tissue around the vaginal opening with natural passages. In many cases, it is elastic enough to stretch without bleeding, or it has been naturally stretched through sports, daily activities, or tampon use. Less than 50% of women experience bleeding during their first intercourse. Bleeding is often caused by anxiety, tension, or lack of natural lubrication."
    }
  },
  {
    id: 'myth-withdrawal',
    type: 'myth_reality',
    statement: {
      fr: "La méthode du retrait (se retirer avant l'éjaculation) est une contraception fiable à 100%.",
      ar: "طريقة القذف الخارجي (الانسحاب قبل القذف) هي وسيلة مضمونة 100% لمنع الحمل.",
      en: "The withdrawal method (pulling out before ejaculation) is a 100% reliable contraceptive."
    },
    isMyth: true,
    explanation: {
      fr: "C'est un mythe dangereux. Le retrait présente un taux d'échec d'environ 22% en utilisation courante. Avant l'éjaculation, les glandes sécrètent le liquide pré-éjaculatoire. Ce liquide nettoie l'urètre et peut contenir des spermatozoïdes actifs capables de féconder un ovule. De plus, cela demande un contrôle extrême que l'on ne maîtrise pas toujours. Le préservatif reste indispensable.",
      ar: "هذه خرافة خطيرة. نسبة فشل طريقة الانسحاب تصل إلى 22% في الاستخدام الواقعي. قبل حدوث القذف، يفرز القضيب سائل المذي (Liquide pré-éjaculatoire) لتنظيف وتسهيل المرور. هذا السائل قد يحتوي على حيوانات منوية نشطة قادرة تماماً على إخصاب البويضة وحدوث الحمل. بالإضافة إلى ذلك، تتطلب هذه الطريقة تحكماً عصبياً وجسدياً فائقاً لا يمكن ضمانه دائماً. استخدام الواقي الذكري هو الخيار الآمن والموثوق.",
      en: "This is a dangerous myth. In real-world use, the withdrawal method has a failure rate of around 22%. Before ejaculation, the pre-ejaculatory fluid is released, which can contain active, viable sperm. Furthermore, pulling out requires extreme self-control that is not always guaranteed. Consistent condom use is far safer."
    }
  },
  {
    id: 'myth-sti-appearance',
    type: 'myth_reality',
    statement: {
      fr: "On peut savoir si un partenaire a une IST (infection sexuellement transmissible) juste en le regardant.",
      ar: "يمكن معرفة ما إذا كان الشريك مصاباً بمرض منقول جنسياً بمجرد النظر إليه.",
      en: "You can tell if a partner has an STI simply by looking at them."
    },
    isMyth: true,
    explanation: {
      fr: "C'est totalement faux. La grande majorité des IST (comme le Chlamydia, le VIH/Sida à ses débuts, ou l'Hépatite B) sont totalement asymptomatiques, c'est-à-dire qu'elles ne provoquent aucun symptôme visible ni aucune douleur pendant des mois, voire des années. Une personne peut se sentir en parfaite santé tout en étant porteuse d'une IST et en pouvant la transmettre. Seul un test de dépistage sanguin ou d'urine permet de savoir.",
      ar: "هذا غير صحيح بتاتاً. الغالبية العظمى من الأمراض المنقولة جنسياً (مثل الكلاميديا، فيروس نقص المناعة البشرية/السيدا في مراحله الأولى، أو التهاب الكبد ب) تكون صامتة تماماً (Asymptomatique)، أي أنها لا تظهر أي أعراض مرئية أو آلام لعدة أشهر أو سنوات. يمكن للشخص أن يبدو في صحة ممتازة ومظهر لائق وهو حامل للعدوى وينقلها لشريكه دون علم. التحليل الطبي (تحليل الدم أو البول) هو الوسيلة الوحيدة للتأكد.",
      en: "This is completely false. The majority of STIs (such as Chlamydia, early-stage HIV, or Hepatitis B) are asymptomatic. This means a carrier can look and feel perfectly healthy, showing no external signs or pain for months or years, while still being contagious. Clinical testing (blood or urine tests) is the only definitive way to know."
    }
  },
  {
    id: 'myth-hiv-saliva',
    type: 'myth_reality',
    statement: {
      fr: "Le VIH/Sida peut se transmettre en buvant dans le même verre ou par la salive.",
      ar: "يمكن أن ينتقل فيروس السيدا (VIH) عن طريق اللعاب أو الشرب من نفس الكأس.",
      en: "HIV can be transmitted through saliva or sharing a drinking glass."
    },
    isMyth: true,
    explanation: {
      fr: "C'est un mythe scientifiquement réfuté. Le VIH ne se transmet pas par la salive, la sueur, les larmes, les baisers, ou en partageant de la vaisselle, des vêtements ou des toilettes. Il se transmet uniquement par quatre liquides corporels : le sang, le sperme (et liquide pré-séminal), les sécrétions vaginales et le lait maternel. Les modes de transmission principaux sont les rapports sexuels non protégés et le partage de seringues.",
      ar: "هذه شائعة خاطئة علمياً وتم دحضها تماماً. لا ينتقل فيروس السيدا عن طريق اللعاب، العرق، الدموع، القبلات العادية، الشرب من نفس الكأس، أو مشاركة الملابس والمراحيض. ينتقل الفيروس حصرياً عن طريق أربعة سوائل جسدية محددة: الدم، السائل المنوي (والمذي)، الإفرازات المهبلية، وحليب الأم. طرق الانتقال الرئيسية هي العلاقات الجنسية غير المحمية ومشاركة الإبر الملوثة.",
      en: "This is a scientifically debunked myth. HIV is not transmitted through saliva, sweat, tears, kissing, or sharing drinking glasses, clothing, or toilets. It is only transmitted through four specific body fluids: blood, semen (including pre-seminal fluid), vaginal secretions, and breast milk. Unprotected sex remains the primary transmission vector."
    }
  },
  {
    id: 'myth-condom-size',
    type: 'myth_reality',
    statement: {
      fr: "Mettre deux préservatifs l'un sur l'autre protège deux fois mieux.",
      ar: "وضع واقيين ذكريين فوق بعضهما البعض يوفر حماية مضاعفة.",
      en: "Wearing two condoms at the same time provides double protection."
    },
    isMyth: true,
    explanation: {
      fr: "C'est une idée fausse très dangereuse. Mettre deux préservatifs l'un sur l'autre augmente considérablement le risque qu'ils glissent ou se déchirent à cause des frottements répétés du latex contre le latex. Un seul préservatif bien ajusté et correctement déroulé suffit largement et garantit une sécurité optimale.",
      ar: "هذا خطأ فادح وخطير جداً. وضع واقيين ذكريين معاً يزيد بشكل كبير من احتمالية انزلاقهما أو تمزقهما بسبب الاحتكاك المتكرر لمادة اللاتكس (Latex) ضد بعضها البعض أثناء العلاقة. واقٍ ذكري واحد مناسب الحجم ومستعمل بطريقة صحيحة كافٍ تماماً ويوفر الحماية القصوى والأمان التام.",
      en: "This is a dangerous misconception. Layering two condoms actually increases friction between the latex layers, making them highly susceptible to slipping or tearing. A single, correctly applied condom is safe and provides optimal protection."
    }
  }
];
