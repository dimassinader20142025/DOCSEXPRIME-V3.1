import React, { useState, useMemo } from 'react';
import { 
  MapPin, Phone, Clock, Search, ShieldAlert, Globe, 
  ExternalLink, Layers, Heart, Check, Navigation, Sparkles, AlertCircle,
  TrendingUp, BarChart3, Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Language } from '../types';

interface ResourceMapProps {
  language: Language;
}

interface ClinicalCenter {
  id: string;
  name: Record<Language, string>;
  type: 'clinic' | 'screening' | 'youth_support';
  governorate: Record<Language, string>;
  address: Record<Language, string>;
  phone: string;
  services: Record<Language, string[]>;
  hours: Record<Language, string>;
  lat: number;
  lng: number;
}

export default function ResourceMap({ language }: ResourceMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  
  // Bookmarks & Favorites State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('docsexprime_bookmarked_clinics');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    return [];
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [filterScreening, setFilterScreening] = useState(false);
  const [filterCounseling, setFilterCounseling] = useState(false);
  const [filterHealth, setFilterHealth] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2500);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(item => item !== id);
      showToast(t.toastRemoved);
    } else {
      updated = [...bookmarkedIds, id];
      showToast(t.toastSaved);
    }
    setBookmarkedIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('docsexprime_bookmarked_clinics', JSON.stringify(updated));
    }
  };

  // Localized dictionaries
  const dict = {
    fr: {
      title: "Centres de Santé Sexuelle & d'Écoute en Tunisie",
      subtitle: "Trouvez un accompagnement médical et psychologique gratuit, anonyme et sans jugement.",
      hotlineBanner: "Ligne Verte Nationale ONFP (Aide & Écoute) : Appelez le 1899 (Gratuit & Anonyme)",
      searchPlaceholder: "Rechercher par nom, ville ou service...",
      filterAll: "Tous les types",
      filterClinic: "Cliniques ONFP",
      filterScreening: "Dépistage Anonyme (ATL/ADLI)",
      filterYouth: "Centres d'Écoute Jeunes",
      govAll: "Toutes les régions",
      servicesTitle: "Services Cliniques Proposés :",
      hoursTitle: "Horaires d'ouverture :",
      addressTitle: "Adresse :",
      phoneTitle: "Téléphone :",
      callButton: "Appeler le centre",
      directionsButton: "Simuler l'itinéraire",
      noResults: "Aucun centre ne correspond à vos critères de recherche.",
      disclaimer: "Tous les centres répertoriés garantissent la confidentialité absolue de vos échanges. Les dépistages IST/VIH sont gratuits, anonymes et réalisés sans accord parental requis pour les mineurs.",
      legendTitle: "Légende de la carte",
      sidebarTitle: "Centres disponibles",
      pinSelected: "Centre sélectionné",
      bookmarkedOnly: "Mes Favoris",
      bookmarkEmpty: "Vous n'avez pas encore enregistré de centres. Cliquez sur l'icône de cœur d'un centre pour le sauvegarder.",
      toastSaved: "Centre enregistré dans vos favoris !",
      toastRemoved: "Centre retiré de vos favoris.",
      serviceFilterTitle: "Filtrer par types de services :",
      serviceScreening: "Dépistage & Tests",
      serviceCounseling: "Conseils & Écoute",
      serviceHealth: "Contraception & Soins",
      analyticsTitle: "Statistiques d'Affluence & Capacité",
      analyticsSub: "Moyenne hebdomadaire de rendez-vous et niveau d'occupation estimé",
      chartAppointments: "Rendez-vous / sem",
      chartOccupancy: "Taux d'occupation (%)",
      availTrendsTitle: "Tendances de Disponibilité",
      availTrendsSub: "Plages de rendez-vous libres restants par rapport à la demande estimée",
      availFreeSlots: "Créneaux Libres",
      availDemands: "Demande Estimée"
    },
    ar: {
      title: "مراكز الصحة الجنسية والإصغاء في تونس",
      subtitle: "ابحث عن مرافقة طبية ونفسية مجانية، سرية وبدون أي أحكام مسبقة.",
      hotlineBanner: "الرقم الأخضر الوطني للديوان الوطني للأسرة (إصغاء وتوجيه): اتصل بـ 1899 (مجاني وسري)",
      searchPlaceholder: "ابحث باسم المركز، المدينة أو الخدمة...",
      filterAll: "جميع الأنواع",
      filterClinic: "عيادات الديوان الوطني للأسرة",
      filterScreening: "تقصي مجهول وسري (ATL/ADLI)",
      filterYouth: "مراكز الإصغاء للشباب",
      govAll: "جميع الولايات",
      servicesTitle: "الخدمات الطبية والعيادية المتوفرة:",
      hoursTitle: "أوقات العمل:",
      addressTitle: "العنوان:",
      phoneTitle: "الهاتف:",
      callButton: "اتصل بالمركز",
      directionsButton: "محاكاة المسار",
      noResults: "لم نجد أي مركز يطابق معايير البحث الخاصة بك.",
      disclaimer: "جميع المراكز المذكورة تضمن السرية المطلقة لمحادثاتكم. تحاليل تقصي السيدا والأمراض المنقولة جنسياً مجانية، سرية، وتتم دون الحاجة لموافقة الأولياء بالنسبة للقصر.",
      legendTitle: "مفاتيح الخريطة",
      sidebarTitle: "المراكز المتوفرة",
      pinSelected: "المركز المحدد",
      bookmarkedOnly: "مفضلتي",
      bookmarkEmpty: "لم تقم بحفظ أي مركز بعد. اضغط على رمز القلب الخاص بالمركز لحفظه.",
      toastSaved: "تم حفظ المركز في مفضلتك!",
      toastRemoved: "تمت إزالة المركز من مفضلتك.",
      serviceFilterTitle: "تصفية حسب نوع الخدمات:",
      serviceScreening: "تقصي واختبارات",
      serviceCounseling: "إرشاد وإصغاء",
      serviceHealth: "منع حمل وعلاج",
      analyticsTitle: "إحصائيات الإقبال والقدرة الاستيعابية",
      analyticsSub: "المعدل الأسبوعي للمواعيد ومستوى الإشغال المقدر",
      chartAppointments: "موعد / أسبوع",
      chartOccupancy: "نسبة الإشغال (%)",
      availTrendsTitle: "توجهات توفر المواعيد",
      availTrendsSub: "الحصص الشاغرة المتبقية مقارنة بالطلب المتوقع",
      availFreeSlots: "الحصص الشاغرة",
      availDemands: "الطلب المتوقع"
    },
    en: {
      title: "Sexual Health & Youth Support Centers in Tunisia",
      subtitle: "Find free, confidential, and judgment-free medical and psychological support.",
      hotlineBanner: "ONFP National Green Helpline (Support & Listening): Call 1899 (Free & Anonymous)",
      searchPlaceholder: "Search by name, city, or services...",
      filterAll: "All types",
      filterClinic: "ONFP Family Clinics",
      filterScreening: "Anonymous Testing (ATL/ADLI)",
      filterYouth: "Youth Listening Centers",
      govAll: "All regions",
      servicesTitle: "Clinical Services Provided:",
      hoursTitle: "Operating Hours:",
      addressTitle: "Address:",
      phoneTitle: "Phone:",
      callButton: "Call Center",
      directionsButton: "Simulate Directions",
      noResults: "No centers match your search criteria.",
      disclaimer: "All listed centers guarantee absolute confidentiality. STI/HIV screenings are free, anonymous, and performed without requiring parental consent for minors.",
      legendTitle: "Map Legend",
      sidebarTitle: "Available Centers",
      pinSelected: "Selected Center",
      bookmarkedOnly: "My Bookmarks",
      bookmarkEmpty: "You haven't bookmarked any centers yet. Click the heart icon on any clinic to save it.",
      toastSaved: "Center saved to bookmarks!",
      toastRemoved: "Center removed from bookmarks.",
      serviceFilterTitle: "Filter by services:",
      serviceScreening: "Screening & Testing",
      serviceCounseling: "Counseling & Listening",
      serviceHealth: "Contraception & Care",
      analyticsTitle: "Capacity & Booking Analytics",
      analyticsSub: "Weekly average appointments and estimated occupancy level",
      chartAppointments: "Appts. / week",
      chartOccupancy: "Occupancy Rate (%)",
      availTrendsTitle: "Availability Trends",
      availTrendsSub: "Remaining free appointment slots vs. estimated demand",
      availFreeSlots: "Free Slots",
      availDemands: "Estimated Demand"
    }
  };

  const t = dict[language];

  // Tunisian Clinical Centers Data
  const centers: ClinicalCenter[] = [
    {
      id: "onfp-bab-saadoun",
      name: {
        fr: "Centre d'Écoute et de Conseil de Bab Saadoun (ONFP)",
        ar: "مركز الإصغاء والإرشاد بباب سعدون (الديوان الوطني للأسرة)",
        en: "Bab Saadoun Youth Listening & Counseling Center (ONFP)"
      },
      type: "youth_support",
      governorate: { fr: "Tunis", ar: "تونس", en: "Tunis" },
      address: {
        fr: "Rue Jebel Lakhdar, Bab Saadoun, Tunis 1006",
        ar: "شارع جبل الأخضر، باب سعدون، تونس 1006",
        en: "Jebel Lakhdar Street, Bab Saadoun, Tunis 1006"
      },
      phone: "+216 71 561 220",
      services: {
        fr: ["Contraception d'urgence", "Consultations en sexologie", "Écoute psychologique pour jeunes", "Tests de grossesse"],
        ar: ["منع الحمل الاستعجالي", "عيادات استشارية في علم الجنس", "إصغاء ودعم نفسي للشباب", "اختبارات الحمل"],
        en: ["Emergency contraception", "Sexology clinical consultations", "Psychological youth listening", "Pregnancy testing"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00 | Sam : 8:00 - 12:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00 | السبت: 8:00 - 12:00",
        en: "Mon-Fri: 8:00 - 14:00 | Sat: 8:00 - 12:00"
      },
      lat: 36.8065,
      lng: 10.1583
    },
    {
      id: "atl-rome",
      name: {
        fr: "ATL MST Sida - Section Tunis",
        ar: "الجمعية التونسية لمكافحة الأمراض المنقولة جنسيا والسيدا - فرع تونس",
        en: "ATL MST Sida - Tunis Branch"
      },
      type: "screening",
      governorate: { fr: "Tunis", ar: "تونس", en: "Tunis" },
      address: {
        fr: "12 Rue de Rome, Lafayette, Tunis 1000",
        ar: "12 نهج روما، لافاييت، تونس 1000",
        en: "12 Rome Street, Lafayette, Tunis 1000"
      },
      phone: "+216 71 332 026",
      services: {
        fr: ["Dépistage anonyme & gratuit VIH/Syphilis/Hépatites", "Distribution gratuite de préservatifs", "Soutien psychologique", "Conseils de prévention"],
        ar: ["تقصي مجاني وسري للسيدا والزهري والالتهاب الكبدي", "توزيع واقي ذكري مجاناً", "إسناد نفسي وعلاجي", "نصائح وإرشادات وقائية"],
        en: ["Free anonymous HIV/Syphilis/Hepatitis testing", "Free condom distribution", "Psychological counseling", "Prevention advice"]
      },
      hours: {
        fr: "Lun-Ven : 9:00 - 17:00",
        ar: "الإثنين-الجمعة: 9:00 - 17:00",
        en: "Mon-Fri: 9:00 - 17:00"
      },
      lat: 36.8001,
      lng: 10.1800
    },
    {
      id: "adli-lafayette",
      name: {
        fr: "Association Tunisienne de Défense des Libertés Individuelles (ADLI)",
        ar: "الجمعية التونسية للدفاع عن الحريات الفردية",
        en: "ADLI Support & Screening Center"
      },
      type: "screening",
      governorate: { fr: "Tunis", ar: "تونس", en: "Tunis" },
      address: {
        fr: "18 Rue d'Autriche, Lafayette, Tunis 1002",
        ar: "18 نهج النمسا، لافاييت، تونس 1002",
        en: "18 Austria Street, Lafayette, Tunis 1002"
      },
      phone: "+216 71 845 233",
      services: {
        fr: ["Dépistage anonyme", "Assistance juridique pour l'orientation", "Conseils en santé sexuelle", "Écoute bienveillante"],
        ar: ["تقصي مجهول وسري", "مرافقة قانونية وإرشاد وتوجيه", "نصائح في الصحة الجنسية", "إصغاء ودعم دون أحكام"],
        en: ["Anonymous testing", "Legal navigation assistance", "Sexual health counseling", "Compassionate listening"]
      },
      hours: {
        fr: "Lun-Ven : 9:00 - 16:30",
        ar: "الإثنين-الجمعة: 9:00 - 16:30",
        en: "Mon-Fri: 9:00 - 16:30"
      },
      lat: 36.8150,
      lng: 10.1820
    },
    {
      id: "onfp-sousse",
      name: {
        fr: "Centre de Planification Familiale de Sousse (ONFP)",
        ar: "مركز التنظيم العائلي بسوسة (الديوان الوطني للأسرة)",
        en: "Sousse Family Planning Clinic (ONFP)"
      },
      type: "clinic",
      governorate: { fr: "Sousse", ar: "سوسة", en: "Sousse" },
      address: {
        fr: "Boulevard du 14 Janvier, Sousse 4000",
        ar: "شارع 14 جانفي، سوسة 4000",
        en: "14th January Boulevard, Sousse 4000"
      },
      phone: "+216 73 225 813",
      services: {
        fr: ["Consultations gynécologiques", "Prescription de contraception", "Dépistage des IST", "Conseils conjugaux"],
        ar: ["عيادات طب النساء", "وصفات منع الحمل واللولب", "تقصي الأمراض المنقولة جنسياً", "استشارات للمقبلين على الزواج"],
        en: ["Gynecological consultations", "Contraceptive prescriptions", "STI screenings", "Couple & marital counseling"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 35.8256,
      lng: 10.6369
    },
    {
      id: "atl-sousse",
      name: {
        fr: "ATL MST Sida - Section Sousse",
        ar: "الجمعية التونسية لمكافحة الأمراض المنقولة جنسيا والسيدا - فرع سوسة",
        en: "ATL MST Sida - Sousse Branch"
      },
      type: "screening",
      governorate: { fr: "Sousse", ar: "سوسة", en: "Sousse" },
      address: {
        fr: "Avenue Léopold Senghor, Sousse 4000",
        ar: "شارع ليوبولد سينغور، سوسة 4000",
        en: "Leopold Senghor Avenue, Sousse 4000"
      },
      phone: "+216 73 210 200",
      services: {
        fr: ["Dépistage rapide et anonyme", "Distribution de préservatifs", "Sensibilisation et éducation sexuelle", "Espace de discussion pour jeunes"],
        ar: ["تقصي سريع وسري مجهول الهوية", "توزيع مجاني للواقي الذكري", "توعية وتثقيف جنسي وعيادي", "فضاء حواري مخصص للشباب"],
        en: ["Rapid anonymous testing", "Condom distribution", "Awareness workshops", "Youth discussion circle"]
      },
      hours: {
        fr: "Lun-Ven : 8:30 - 15:30",
        ar: "الإثنين-الجمعة: 8:30 - 15:30",
        en: "Mon-Fri: 8:30 - 15:30"
      },
      lat: 35.8300,
      lng: 10.6300
    },
    {
      id: "onfp-sfax",
      name: {
        fr: "Centre d'Écoute et de Planification Familiale de Sfax (ONFP)",
        ar: "مركز الإصغاء والتنظيم العائلي بصفاقس (الديوان الوطني للأسرة)",
        en: "Sfax Family Planning & Listening Center (ONFP)"
      },
      type: "clinic",
      governorate: { fr: "Sfax", ar: "صفاقس", en: "Sfax" },
      address: {
        fr: "Route d'El Ain, Km 1, Sfax 3000",
        ar: "طريق العين، كلم 1، صفاقس 3000",
        en: "El Ain Road, Km 1, Sfax 3000"
      },
      phone: "+216 74 220 544",
      services: {
        fr: ["Contraception & Planning", "Éducation sexuelle clinique", "Suivi gynécologique", "Consultations d'aide aux couples"],
        ar: ["وسائل منع الحمل والتنظيم العائلي", "التثقيف الجنسي العيادي", "متابعة طب النساء والولادة", "استشارات ودعم الشريكين"],
        en: ["Contraception & Planning", "Clinical sex education", "Gynecological follow-up", "Couples therapy & support"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 34.7400,
      lng: 10.7600
    },
    {
      id: "atup-sfax",
      name: {
        fr: "Association Tunisienne de Planning Familial (ATUP Sfax)",
        ar: "الجمعية التونسية للتخطيط العائلي بصفاقس",
        en: "Tunisian Family Planning Association (ATUP Sfax)"
      },
      type: "screening",
      governorate: { fr: "Sfax", ar: "صفاقس", en: "Sfax" },
      address: {
        fr: "Rue Hédi Nouira, Sfax 3000",
        ar: "نهج الهادي نويرة، صفاقس 3000",
        en: "Hedi Nouira Street, Sfax 3000"
      },
      phone: "+216 74 402 110",
      services: {
        fr: ["Consultations gynécologiques gratuites", "Dépistage des infections", "Groupes de parole pour adolescents", "Soutien sexologique"],
        ar: ["عيادات طب نساء وتوليد مجانية", "تقصي التعفنات البولية والمنقولة جنسياً", "حلقات حوار مخصصة للمراهقين", "دعم وإرشاد في علم الجنس"],
        en: ["Free gynecological checkups", "Infection screening", "Adolescent discussion groups", "Sexology clinical guidance"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 34.7350,
      lng: 10.7550
    },
    {
      id: "onfp-kairouan",
      name: {
        fr: "Centre de Planification et d'Écoute de Kairouan (ONFP)",
        ar: "مركز الإصغاء والتنظيم العائلي بالقيروان (الديوان الوطني للأسرة)",
        en: "Kairouan Listening & Family Planning Center (ONFP)"
      },
      type: "youth_support",
      governorate: { fr: "Kairouan", ar: "القيروان", en: "Kairouan" },
      address: {
        fr: "Avenue de la République, Kairouan 3100",
        ar: "شارع الجمهورية، القيروان 3100",
        en: "Republic Avenue, Kairouan 3100"
      },
      phone: "+216 77 230 411",
      services: {
        fr: ["Écoute des adolescents et des jeunes", "Conseils en puberté et sexualité saine", "Contraception", "Soutien psychologique gratuit"],
        ar: ["الإصغاء للمراهقين والشباب", "إرشاد حول البلوغ والعلاقات السليمة", "وسائل منع الحمل وتوفيرها", "إسناد ودعم نفسي مجاني"],
        en: ["Adolescent & youth listening", "Puberty and sexual health guidance", "Contraception access", "Free psychological support"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 35.6780,
      lng: 10.0963
    },
    {
      id: "onfp-monastir",
      name: {
        fr: "Centre Régional de l'ONFP de Monastir",
        ar: "المركز الجهوي للديوان الوطني للأسرة بالمنستير",
        en: "Monastir Regional ONFP Center"
      },
      type: "clinic",
      governorate: { fr: "Monastir", ar: "المنستير", en: "Monastir" },
      address: {
        fr: "Rue de la Liberté, Monastir 5000",
        ar: "نهج الحرية، المنستير 5000",
        en: "Liberty Street, Monastir 5000"
      },
      phone: "+216 73 461 311",
      services: {
        fr: ["Dépistage des cancers féminins", "Prescription contraceptive", "Conseils en éducation sexuelle", "Consultations médicales"],
        ar: ["تقصي الأورام والسرطانات النسائية", "تقديم ووصف وسائل منع الحمل", "إرشاد في التربية الجنسية السليمة", "عيادات طبية متخصصة"],
        en: ["Female cancer screenings", "Contraceptive counseling", "Sexual education advice", "General medical visits"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 35.7780,
      lng: 10.8263
    },
    {
      id: "onfp-gafsa",
      name: {
        fr: "Centre d'Écoute ONFP de Gafsa",
        ar: "مركز الإصغاء والتوجيه للشباب بقفصة (الديوان الوطني للأسرة)",
        en: "Gafsa ONFP Listening Center"
      },
      type: "youth_support",
      governorate: { fr: "Gafsa", ar: "قفصة", en: "Gafsa" },
      address: {
        fr: "Rue Ahmed Amin, Gafsa 2100",
        ar: "نهج أحمد أمين، قفصة 2100",
        en: "Ahmed Amin Street, Gafsa 2100"
      },
      phone: "+216 76 221 455",
      services: {
        fr: ["Accueil des jeunes et adolescents", "Conseils en planification et contraception", "Écoute psychologique", "Prévention IST"],
        ar: ["استقبال الشباب والمراهقين والطلبة", "استشارات في التنظيم العائلي ومنع الحمل", "دعم ومرافقة نفسية", "وقاية من الأمراض المنقولة جنسياً"],
        en: ["Youth and adolescent advisory", "Family planning and contraception guidance", "Psychological support", "STI prevention counseling"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 34.4250,
      lng: 8.7842
    },
    {
      id: "onfp-jendouba",
      name: {
        fr: "Centre de Planification ONFP de Jendouba",
        ar: "مركز التنظيم العائلي بجندوبة (الديوان الوطني للأسرة)",
        en: "Jendouba ONFP Family Clinic"
      },
      type: "clinic",
      governorate: { fr: "Jendouba", ar: "جندوبة", en: "Jendouba" },
      address: {
        fr: "Avenue Habib Bourguiba, Jendouba 8100",
        ar: "شارع الحبيب بورقيبة، جندوبة 8100",
        en: "Habib Bourguiba Avenue, Jendouba 8100"
      },
      phone: "+216 78 603 144",
      services: {
        fr: ["Planification familiale", "Information et prévention IST", "Orientation médicale", "Soutien des jeunes vulnérables"],
        ar: ["التنظيم العائلي والصحة الإنجابية", "إعلام ووقاية من الأمراض الجنسية", "توجيه طبي مخصص", "دعم ومساعدة الشباب المستضعف"],
        en: ["Family planning", "STI information & prevention", "Medical navigation", "Support for vulnerable youth"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 36.5024,
      lng: 8.7801
    },
    {
      id: "onfp-bizerte",
      name: {
        fr: "Centre de Planification ONFP de Bizerte",
        ar: "مركز التنظيم العائلي ببنزرت (الديوان الوطني للأسرة)",
        en: "Bizerte ONFP Family Clinic"
      },
      type: "clinic",
      governorate: { fr: "Bizerte", ar: "بنزرت", en: "Bizerte" },
      address: {
        fr: "Avenue Hassan Nouri, Bizerte 7000",
        ar: "شارع حسن النوري، بنزرت 7000",
        en: "Hassan Nouri Avenue, Bizerte 7000"
      },
      phone: "+216 72 431 200",
      services: {
        fr: ["Contraception et suivi gynécologique", "Dépistage frottis (FCV)", "Espace d'écoute adolescents", "Information santé sexuelle"],
        ar: ["وسائل منع الحمل والمتابعة الطبية", "تحاليل مسحة عنق الرحم (FCV)", "فضاء مخصص لإصغاء المراهقين", "إعلام في الصحة الجنسية"],
        en: ["Contraception & gynecological follow-up", "Pap smear testing (FCV)", "Adolescent listening space", "Sexual health info"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 37.2744,
      lng: 9.8739
    },
    {
      id: "onfp-gabes",
      name: {
        fr: "Centre d'Écoute ONFP de Gabès",
        ar: "مركز الإصغاء وتوجيه الشباب بقابس (الديوان الوطني للأسرة)",
        en: "Gabes ONFP Youth Support Center"
      },
      type: "youth_support",
      governorate: { fr: "Gabès", ar: "قابس", en: "Gabes" },
      address: {
        fr: "Rue de la République, Gabès 6000",
        ar: "نهج الجمهورية، قابس 6000",
        en: "Republic Street, Gabes 6000"
      },
      phone: "+216 75 272 500",
      services: {
        fr: ["Soutien et écoute psychologique", "Conseils contraception & relations", "Orientation vers soins médicaux", "Prévention IST/VIH"],
        ar: ["إصغاء ودعم ومرافقة نفسية", "إرشادات حول منع الحمل والعلاقات", "توجيه نحو المراكز الطبية المتخصصة", "وقاية من التعفنات الجنسية والسيدا"],
        en: ["Psychological listening and support", "Contraception & relational advice", "Medical referral assistance", "STI/HIV prevention"]
      },
      hours: {
        fr: "Lun-Ven : 8:00 - 14:00",
        ar: "الإثنين-الجمعة: 8:00 - 14:00",
        en: "Mon-Fri: 8:00 - 14:00"
      },
      lat: 33.8814,
      lng: 10.0983
    }
  ];

  // Live calculated data for Recharts trends
  const analyticsData = useMemo(() => {
    const clinicsCount = centers.filter(c => c.type === 'clinic').length;
    const screeningCount = centers.filter(c => c.type === 'screening').length;
    const youthCount = centers.filter(c => c.type === 'youth_support').length;

    const getTypeName = (type: string) => {
      if (type === 'clinic') return language === 'fr' ? 'Cliniques ONFP' : language === 'ar' ? 'العيادات' : 'ONFP Clinics';
      if (type === 'screening') return language === 'fr' ? 'Dépistage' : language === 'ar' ? 'التقصي' : 'Screening';
      return language === 'fr' ? 'Écoute Jeunes' : language === 'ar' ? 'الإصغاء' : 'Youth Support';
    };

    return [
      {
        name: getTypeName('clinic'),
        appointments: clinicsCount * 12 + 15,
        occupancy: 78,
        count: clinicsCount,
      },
      {
        name: getTypeName('screening'),
        appointments: screeningCount * 22 + 28,
        occupancy: 85,
        count: screeningCount,
      },
      {
        name: getTypeName('youth_support'),
        appointments: youthCount * 14 + 12,
        occupancy: 92,
        count: youthCount,
      }
    ];
  }, [language]);

  const availabilityTrendsData = useMemo(() => {
    const days = language === 'fr' 
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] 
      : language === 'ar' 
        ? ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] 
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const freeSlotsLabel = language === 'fr' ? 'Créneaux Libres' : language === 'ar' ? 'الحصص الشاغرة' : 'Free Slots';
    const estimatedDemandLabel = language === 'fr' ? 'Demande Estimée' : language === 'ar' ? 'الطلب المتوقع' : 'Estimated Demand';

    return days.map((day, idx) => {
      const freeSlots = [42, 38, 55, 30, 24, 60][idx];
      const estimatedDemand = [80, 85, 70, 95, 110, 50][idx];
      return {
        day,
        [freeSlotsLabel]: freeSlots,
        [estimatedDemandLabel]: estimatedDemand
      };
    });
  }, [language]);

  // Mathematical Coordinate Projection System
  const mapLatitudeToY = (lat: number) => {
    const minLat = 33.2;
    const maxLat = 37.5;
    const height = 480;
    const padding = 30;
    return height - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding) - padding;
  };

  const mapLongitudeToX = (lng: number) => {
    const minLng = 8.4;
    const maxLng = 11.2;
    const width = 280;
    const padding = 35;
    return ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding) + padding;
  };

  // Get governorates list
  const governorates = useMemo(() => {
    const set = new Set(centers.map(c => c.governorate[language]));
    return Array.from(set);
  }, [language]);

  const hasScreeningService = (c: ClinicalCenter) => {
    return c.services[language].some(s => {
      const low = s.toLowerCase();
      return (
        low.includes('dépistage') || low.includes('depistage') || low.includes('test') || low.includes('infection') ||
        low.includes('تقصي') || low.includes('اختبار') || low.includes('كشف') || low.includes('فحص') ||
        low.includes('screening') || low.includes('testing') || low.includes('test')
      );
    });
  };

  const hasCounselingService = (c: ClinicalCenter) => {
    return c.services[language].some(s => {
      const low = s.toLowerCase();
      return (
        low.includes('écoute') || low.includes('ecoute') || low.includes('soutien') || low.includes('conseil') || 
        low.includes('groupe') || low.includes('parole') || low.includes('psychologique') || low.includes('relation') || low.includes('conjugaux') ||
        low.includes('إصغاء') || low.includes('دعم') || low.includes('إرشاد') || low.includes('استشار') || low.includes('حوار') || low.includes('نفسي') || low.includes('مرافقة') ||
        low.includes('listening') || low.includes('support') || low.includes('counselling') || low.includes('counseling') || low.includes('counsel') || low.includes('group') || low.includes('therapy') || low.includes('advice') || low.includes('guidance')
      );
    });
  };

  const hasHealthService = (c: ClinicalCenter) => {
    return c.services[language].some(s => {
      const low = s.toLowerCase();
      return (
        low.includes('contraception') || low.includes('planning') || low.includes('gynéco') || low.includes('gyneco') || 
        low.includes('médical') || low.includes('medical') || low.includes('sexologie') || low.includes('cancer') || 
        low.includes('préservatif') || low.includes('preservatif') || low.includes('grossesse') || low.includes('soins') || low.includes('prescription') ||
        low.includes('منع الحمل') || low.includes('التنظيم العائلي') || low.includes('التخطيط العائلي') || low.includes('نساء') || low.includes('توليد') || low.includes('طبي') || low.includes('طب') || low.includes('علم الجنس') || low.includes('الأورام') || low.includes('الواقي') || low.includes('الحمل') ||
        low.includes('contraceptive') || low.includes('gynecological') || low.includes('sexology') || low.includes('condom') || low.includes('pregnancy') || low.includes('care') || low.includes('prescriptions') || low.includes('checkups')
      );
    });
  };

  // Filter Centers
  const filteredCenters = useMemo(() => {
    return centers.filter(c => {
      const matchesSearch = 
        c.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.governorate[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.services[language].some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'all' || c.type === selectedType;
      const matchesGov = selectedGov === 'all' || c.governorate[language] === selectedGov;
      const matchesBookmarks = !showOnlyBookmarks || bookmarkedIds.includes(c.id);

      const hasActiveServiceFilters = filterScreening || filterCounseling || filterHealth;
      let matchesServices = true;
      if (hasActiveServiceFilters) {
        matchesServices = false;
        if (filterScreening && hasScreeningService(c)) matchesServices = true;
        if (filterCounseling && hasCounselingService(c)) matchesServices = true;
        if (filterHealth && hasHealthService(c)) matchesServices = true;
      }

      return matchesSearch && matchesType && matchesGov && matchesBookmarks && matchesServices;
    });
  }, [searchQuery, selectedType, selectedGov, showOnlyBookmarks, bookmarkedIds, filterScreening, filterCounseling, filterHealth, language]);

  const activeCenter = useMemo(() => {
    return centers.find(c => c.id === selectedCenterId) || null;
  }, [selectedCenterId]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ONFP Helpline Banner */}
      <div className="bg-indigo-600 text-white rounded-2xl p-4 shadow-md flex items-center gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="p-2.5 bg-white/20 rounded-xl shrink-0">
          <Phone className="animate-bounce" size={24} />
        </div>
        <div className="flex-1">
          <p className="text-xs md:text-sm font-semibold tracking-wide">
            {t.hotlineBanner}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Search & List (7 cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col h-full justify-between">
          
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm transition-all shadow-sm"
              />
            </div>

            {/* Service Filter Toggles */}
            <div className="bg-slate-50/70 border border-slate-150 rounded-xl p-3.5 space-y-2.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.serviceFilterTitle}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterScreening(!filterScreening)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    filterScreening 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-[1.02]' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filterScreening ? 'bg-white' : 'bg-emerald-500'}`} />
                  {t.serviceScreening}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCounseling(!filterCounseling)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    filterCounseling 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-[1.02]' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filterCounseling ? 'bg-white' : 'bg-indigo-500'}`} />
                  {t.serviceCounseling}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterHealth(!filterHealth)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    filterHealth 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs scale-[1.02]' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filterHealth ? 'bg-white' : 'bg-amber-500'}`} />
                  {t.serviceHealth}
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Type select */}
              <div className="flex-1">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-750 text-xs font-semibold rounded-xl px-3.5 py-3 transition-all cursor-pointer shadow-sm"
                >
                  <option value="all">{t.filterAll}</option>
                  <option value="clinic">{t.filterClinic}</option>
                  <option value="screening">{t.filterScreening}</option>
                  <option value="youth_support">{t.filterYouth}</option>
                </select>
              </div>

              {/* Gov select */}
              <div className="flex-1">
                <select
                  value={selectedGov}
                  onChange={(e) => setSelectedGov(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-slate-750 text-xs font-semibold rounded-xl px-3.5 py-3 transition-all cursor-pointer shadow-sm"
                >
                  <option value="all">{t.govAll}</option>
                  {governorates.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              {/* Bookmarks Toggle */}
              <button
                type="button"
                onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border font-bold text-xs transition-all cursor-pointer shadow-sm shrink-0 sm:w-auto w-full ${
                  showOnlyBookmarks 
                    ? 'bg-rose-50 border-rose-300 text-rose-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Heart size={14} className={showOnlyBookmarks ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-slate-400'} />
                <span>{t.bookmarkedOnly} ({bookmarkedIds.length})</span>
              </button>
            </div>
          </div>

          {/* List section */}
          <div className="flex-1 space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto pr-2 mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
              <Layers size={14} className="text-indigo-600" />
              {t.sidebarTitle} ({filteredCenters.length})
            </h3>

            {filteredCenters.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-12 px-6 text-center space-y-3 shadow-sm">
                <AlertCircle className="mx-auto text-slate-300" size={36} />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {showOnlyBookmarks ? t.bookmarkEmpty : t.noResults}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCenters.map((center) => {
                  const isSelected = selectedCenterId === center.id;
                  const typeLabel = 
                    center.type === 'clinic' ? t.filterClinic :
                    center.type === 'screening' ? t.filterScreening :
                    t.filterYouth;

                  const colorStyles = 
                    center.type === 'clinic' ? 'bg-indigo-50 text-indigo-700 border-indigo-100/50' :
                    center.type === 'screening' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                    'bg-amber-50 text-amber-700 border-amber-100/50';

                  const isBookmarked = bookmarkedIds.includes(center.id);

                  return (
                    <div
                      key={center.id}
                      onClick={() => setSelectedCenterId(center.id)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left flex flex-col gap-2.5 relative group ${
                        isSelected 
                          ? 'bg-indigo-50/30 border-indigo-500 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${colorStyles}`}>
                          {typeLabel}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <MapPin size={10} />
                            {center.governorate[language]}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(center.id, e)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 ${
                              isBookmarked
                                ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                            title={isBookmarked ? t.toastRemoved : t.toastSaved}
                          >
                            <Heart size={12} className={isBookmarked ? 'fill-rose-500' : ''} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-display font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {center.name[language]}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 leading-relaxed">
                          {center.address[language]}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="pt-3 border-t border-indigo-100/50 space-y-3 animate-fade-in">
                          {/* Services */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {t.servicesTitle}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {center.services[language].map((srv, idx) => (
                                <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <Check size={10} className="text-emerald-500" />
                                  {srv}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Hours & Contact */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2 text-slate-600">
                            <p className="flex items-center gap-1.5">
                              <Clock size={13} className="text-indigo-500" />
                              {center.hours[language]}
                            </p>
                            <p className="flex items-center gap-1.5 font-semibold text-indigo-700">
                              <Phone size={13} />
                              {center.phone}
                            </p>
                          </div>

                          {/* CTA buttons */}
                          <div className="flex gap-2 pt-1.5">
                            <a
                              href={`tel:${center.phone.replace(/\s+/g, '')}`}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] py-2 rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
                            >
                              <Phone size={12} />
                              {t.callButton}
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Navigation simulée vers : ${center.name[language]}\nCoordonnées : ${center.lat}, ${center.lng}`);
                              }}
                              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-[11px] py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                              <Navigation size={12} className="text-indigo-500" />
                              {t.directionsButton}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Custom Interactive Map (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none"></div>

            <div className="w-full flex justify-between items-center mb-3 pb-2 border-b border-slate-100 z-10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Globe size={14} className="text-indigo-600 animate-spin-slow" />
                {language === 'fr' ? 'Carte interactive de la Tunisie' : language === 'ar' ? 'خريطة تونس التفاعلية' : 'Interactive Map of Tunisia'}
              </h4>
            </div>

            {/* SVG Interactive Container */}
            <div className="relative w-full flex justify-center z-10 select-none">
              <svg 
                viewBox="0 0 280 480" 
                className="w-full max-w-[280px] h-auto drop-shadow-md"
              >
                {/* Styled outline representation of Tunisia */}
                <path
                  d="M 110,65 C 112,62 118,60 120,60 C 122,60 125,50 128,45 C 131,40 141,35 145,35 C 149,35 155,42 160,42 C 165,42 170,48 175,48 C 180,48 190,52 195,58 C 200,64 205,62 210,62 C 215,62 220,70 220,75 C 220,80 215,82 210,88 C 205,94 202,100 200,105 C 198,110 200,115 205,120 C 210,125 215,125 220,130 C 225,135 228,140 228,145 C 228,150 220,155 215,160 C 210,165 212,170 215,175 C 218,180 220,185 220,190 C 220,195 215,198 210,202 C 205,206 205,212 210,218 C 215,224 220,230 220,235 C 220,240 215,245 210,250 C 205,255 208,260 212,265 C 216,270 220,275 220,280 C 220,285 215,290 210,295 C 205,300 210,310 215,315 C 220,320 222,325 222,330 C 222,335 215,338 210,342 C 205,346 200,350 195,355 C 190,360 185,370 180,380 C 175,390 170,410 165,430 C 160,450 155,470 150,490 C 145,510 140,520 135,530 C 130,540 120,535 115,530 C 110,525 108,515 105,500 C 102,485 100,470 98,450 C 96,430 95,410 95,390 C 95,370 98,350 100,330 C 102,310 105,290 105,270 C 105,250 102,230 100,210 C 98,190 98,170 100,150 C 102,130 105,110 105,95 C 105,80 108,70 110,65 Z"
                  fill="url(#tunisiaGradient)"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                  className="transition-colors duration-300"
                />

                {/* SVG Gradients definitions */}
                <defs>
                  <linearGradient id="tunisiaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F1F5F9" />
                    <stop offset="50%" stopColor="#EEF2F6" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                  </linearGradient>
                  
                  {/* Glowing filter for selected pin */}
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Plotting Governorates Text Labels for Context */}
                <text x="145" y="90" fontSize="10" fill="#94A3B8" fontWeight="bold" textAnchor="middle">Tunis</text>
                <text x="175" y="165" fontSize="9" fill="#94A3B8" fontWeight="bold" textAnchor="middle">Sousse</text>
                <text x="178" y="300" fontSize="9" fill="#94A3B8" fontWeight="bold" textAnchor="middle">Sfax</text>
                <text x="110" y="325" fontSize="9" fill="#94A3B8" fontWeight="bold" textAnchor="middle">Gafsa</text>
                <text x="100" y="195" fontSize="9" fill="#94A3B8" fontWeight="bold" textAnchor="middle">Jendouba</text>

                {/* Render interactive coordinate pins */}
                {filteredCenters.map((center) => {
                  const cx = mapLongitudeToX(center.lng);
                  const cy = mapLatitudeToY(center.lat);
                  const isSelected = selectedCenterId === center.id;

                  // Color scheme based on center type
                  const color = 
                    center.type === 'clinic' ? '#4F46E5' : // Indigo
                    center.type === 'screening' ? '#10B981' : // Emerald
                    '#F59E0B'; // Amber

                  return (
                    <g 
                      key={center.id}
                      className="cursor-pointer group"
                      onClick={() => setSelectedCenterId(center.id)}
                    >
                      {/* Outer pulsing ring for selected center */}
                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="16"
                          fill={color}
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}

                      {/* Interactive Pin Hover Circle helper */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? "11" : "8"}
                        fill={color}
                        opacity={isSelected ? "0.35" : "0.15"}
                        className="transition-all group-hover:scale-150"
                      />

                      {/* Actual core center point */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? "6" : "4.5"}
                        fill={color}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        filter={isSelected ? "url(#glow)" : undefined}
                        className="transition-all"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Custom Interactive Map Legend */}
            <div className="w-full mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-[11px] z-10">
              <p className="font-semibold text-slate-700">{t.legendTitle} :</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white shrink-0"></span>
                  <span className="text-slate-600 font-medium">{t.filterClinic}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shrink-0"></span>
                  <span className="text-slate-600 font-medium">{t.filterScreening}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shrink-0"></span>
                  <span className="text-slate-600 font-medium">{t.filterYouth}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <BarChart3 size={16} className="text-indigo-600 animate-pulse" />
                  {t.analyticsTitle}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {t.analyticsSub}
                </p>
              </div>
              <Activity size={16} className="text-indigo-500 shrink-0" />
            </div>

            {/* Grid for charts */}
            <div className="space-y-6">
              {/* Chart 1: Appointments and Occupancy Bar Chart */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'fr' ? 'Niveaux de Fréquentation & Taux d\'Occupation' : language === 'ar' ? 'مستويات الإقبال ونسب الإشغال' : 'Booking Frequency & Occupancy'}
                </span>
                <div className="h-[200px] w-full text-[10px] font-semibold font-sans">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94A3B8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94A3B8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: 'none', 
                          borderRadius: '8px', 
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconSize={8}
                        iconType="circle"
                        fontSize={10}
                      />
                      <Bar 
                        name={t.chartAppointments} 
                        dataKey="appointments" 
                        fill="#4F46E5" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={32}
                      />
                      <Bar 
                        name={t.chartOccupancy} 
                        dataKey="occupancy" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Weekly Availability trends Area Chart */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t.availTrendsTitle}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {language === 'fr' ? '6 Jours Estimés' : language === 'ar' ? 'توقعات 6 أيام' : '6-Day Estimate'}
                  </span>
                </div>
                <div className="h-[180px] w-full text-[10px] font-semibold font-sans">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={availabilityTrendsData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        stroke="#94A3B8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94A3B8" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: 'none', 
                          borderRadius: '8px', 
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={32} 
                        iconSize={8}
                        iconType="circle"
                      />
                      <Area 
                        type="monotone" 
                        name={t.availFreeSlots} 
                        dataKey={language === 'fr' ? 'Créneaux Libres' : language === 'ar' ? 'الحصص الشاغرة' : 'Free Slots'} 
                        stroke="#4F46E5" 
                        fillOpacity={1} 
                        fill="url(#colorFree)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        name={t.availDemands} 
                        dataKey={language === 'fr' ? 'Demande Estimée' : language === 'ar' ? 'الطلب المتوقع' : 'Estimated Demand'} 
                        stroke="#F59E0B" 
                        fillOpacity={1} 
                        fill="url(#colorDemand)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Legal and confidentiality reminder */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-3 shadow-sm text-xs leading-relaxed text-slate-600">
            <ShieldAlert size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-1">
                <Sparkles size={14} className="text-indigo-600" />
                {language === 'fr' ? 'Garanties et Législation Tunisienne' : 'الضمانات القانونية التونسية'}
              </p>
              <p className="mt-1 text-slate-500">
                {t.disclaimer}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Elegant Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3.5 rounded-xl shadow-2xl flex items-center gap-2 z-50 border border-slate-800 animate-fade-in">
          <Heart size={13} className="fill-rose-500 text-rose-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
