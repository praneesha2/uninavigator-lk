import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getLanguage, setLanguage as saveLanguage } from "@/lib/storage";

type Language = "en" | "si" | "ta";

interface Translations {
  [key: string]: {
    en: string;
    si: string;
    ta: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", si: "මුල් පිටුව", ta: "முகப்பு" },
  "nav.eligibility": { en: "Eligibility", si: "සුදුසුකම්", ta: "தகுதி" },
  "nav.chat": { en: "Chat", si: "සංවාදය", ta: "அரட்டை" },
  
  // Hero
  "hero.tagline": { 
    en: "Know your chances. Choose your future.", 
    si: "ඔබේ අවස්ථා දැනගන්න. ඔබේ අනාගතය තෝරන්න.", 
    ta: "உங்கள் வாய்ப்புகளை அறியுங்கள். உங்கள் எதிர்காலத்தைத் தேர்ந்தெடுங்கள்." 
  },
  "hero.subtitle": { 
    en: "Your AI-powered guide to Sri Lankan university admissions", 
    si: "ශ්‍රී ලංකා විශ්ව විද්‍යාල ප්‍රවේශය සඳහා AI බලගැන්වූ මාර්ගෝපදේශය", 
    ta: "இலங்கை பல்கலைக்கழக அனுமதிக்கான AI வழிகாட்டி" 
  },
  "hero.checkEligibility": { en: "Check Eligibility", si: "සුදුසුකම් පරීක්ෂා කරන්න", ta: "தகுதி சரிபார்க்கவும்" },
  "hero.askGuide": { en: "Ask the Guide", si: "මාර්ගෝපදේශකගෙන් අසන්න", ta: "வழிகாட்டியிடம் கேளுங்கள்" },
  
  // Features
  "feature.eligibility.title": { en: "Eligibility Checker", si: "සුදුසුකම් පරීක්ෂකය", ta: "தகுதி சரிபார்ப்பாளர்" },
  "feature.eligibility.desc": { 
    en: "Find universities and courses you qualify for based on your Z-score and district.", 
    si: "ඔබේ Z-ලකුණු සහ දිස්ත්‍රික්කය මත පදනම්ව ඔබට සුදුසුකම් ලබන විශ්ව විද්‍යාල සහ පාඨමාලා සොයන්න.", 
    ta: "உங்கள் Z-மதிப்பெண் மற்றும் மாவட்டத்தின் அடிப்படையில் நீங்கள் தகுதி பெறும் பல்கலைக்கழகங்கள் மற்றும் படிப்புகளைக் கண்டறியுங்கள்." 
  },
  "feature.guidance.title": { en: "Career Guidance", si: "වෘත්තීය මාර්ගෝපදේශනය", ta: "தொழில் வழிகாட்டுதல்" },
  "feature.guidance.desc": { 
    en: "Get personalized advice on courses, careers, and alternatives from our AI assistant.", 
    si: "අපගේ AI සහකාරියාගෙන් පාඨමාලා, වෘත්තීන් සහ විකල්ප පිළිබඳ පුද්ගලික උපදෙස් ලබා ගන්න.", 
    ta: "எங்கள் AI உதவியாளரிடமிருந்து படிப்புகள், தொழில்கள் மற்றும் மாற்றுகள் குறித்த தனிப்பயனாக்கப்பட்ட ஆலோசனையைப் பெறுங்கள்." 
  },
  "feature.alternatives.title": { en: "Explore Alternatives", si: "විකල්ප ගවේෂණය කරන්න", ta: "மாற்றுகளை ஆராயுங்கள்" },
  "feature.alternatives.desc": { 
    en: "Discover scholarships, private universities, and vocational training options.", 
    si: "ශිෂ්‍යත්ව, පෞද්ගලික විශ්ව විද්‍යාල සහ වෘත්තීය පුහුණු විකල්ප සොයා ගන්න.", 
    ta: "உதவித்தொகைகள், தனியார் பல்கலைக்கழகங்கள் மற்றும் தொழிற்பயிற்சி விருப்பங்களைக் கண்டறியுங்கள்." 
  },
  
  // Eligibility form
  "eligibility.title": { en: "Check Your Eligibility", si: "ඔබේ සුදුසුකම් පරීක්ෂා කරන්න", ta: "உங்கள் தகுதியை சரிபார்க்கவும்" },
  "eligibility.zscore": { en: "Z-Score", si: "Z-ලකුණු", ta: "Z-மதிப்பெண்" },
  "eligibility.zscorePlaceholder": { en: "Enter your Z-score (0-4)", si: "ඔබේ Z-ලකුණු ඇතුළත් කරන්න (0-4)", ta: "உங்கள் Z-மதிப்பெண் உள்ளிடவும் (0-4)" },
  "eligibility.district": { en: "District", si: "දිස්ත්‍රික්කය", ta: "மாவட்டம்" },
  "eligibility.selectDistrict": { en: "Select your district", si: "ඔබේ දිස්ත්‍රික්කය තෝරන්න", ta: "உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்" },
  "eligibility.year": { en: "Year (Optional)", si: "වසර (විකල්ප)", ta: "ஆண்டு (விரும்பினால்)" },
  "eligibility.selectYear": { en: "Select year", si: "වසර තෝරන්න", ta: "ஆண்டைத் தேர்ந்தெடுக்கவும்" },
  "eligibility.submit": { en: "Check Eligibility", si: "සුදුසුකම් පරීක්ෂා කරන්න", ta: "தகுதி சரிபார்க்கவும்" },
  "eligibility.checking": { en: "Checking...", si: "පරීක්ෂා කරමින්...", ta: "சரிபார்க்கிறது..." },
  "eligibility.resultsFor": { en: "Results for", si: "ප්‍රතිඵල", ta: "முடிவுகள்" },
  "eligibility.eligibleFor": { en: "You are eligible for", si: "ඔබ සුදුසුකම් ලබයි", ta: "நீங்கள் தகுதி பெறுகிறீர்கள்" },
  "eligibility.courses": { en: "courses", si: "පාඨමාලා", ta: "படிப்புகள்" },
  "eligibility.noResults": { en: "No eligible courses found", si: "සුදුසුකම් පාඨමාලා හමු නොවීය", ta: "தகுதியான படிப்புகள் எதுவும் இல்லை" },
  "eligibility.noResultsHint": { 
    en: "Try adjusting your Z-score or selecting a different district.", 
    si: "ඔබේ Z-ලකුණු සකස් කිරීමට හෝ වෙනත් දිස්ත්‍රික්කයක් තෝරා ගැනීමට උත්සාහ කරන්න.", 
    ta: "உங்கள் Z-மதிப்பெண்ணை சரிசெய்யவும் அல்லது வேறு மாவட்டத்தைத் தேர்ந்தெடுக்கவும்." 
  },
  "eligibility.cutoff": { en: "Cutoff", si: "කට්-ඕෆ්", ta: "கட்-ஆஃப்" },
  
  // Chat
  "chat.title": { en: "Career Guide", si: "වෘත්තීය මාර්ගෝපදේශය", ta: "தொழில் வழிகாட்டி" },
  "chat.newChat": { en: "New Chat", si: "නව සංවාදය", ta: "புதிய அரட்டை" },
  "chat.placeholder": { en: "Ask about universities, courses, or careers...", si: "විශ්ව විද්‍යාල, පාඨමාලා හෝ වෘත්තීන් ගැන විමසන්න...", ta: "பல்கலைக்கழகங்கள், படிப்புகள் அல்லது தொழில்கள் பற்றி கேளுங்கள்..." },
  "chat.send": { en: "Send", si: "යවන්න", ta: "அனுப்பு" },
  "chat.thinking": { en: "Thinking...", si: "සිතමින්...", ta: "சிந்திக்கிறது..." },
  "chat.sources": { en: "Sources", si: "මූලාශ්‍ර", ta: "ஆதாரங்கள்" },
  "chat.suggestedPrompts": { en: "Suggested Questions", si: "යෝජිත ප්‍රශ්න", ta: "பரிந்துரைக்கப்பட்ட கேள்விகள்" },
  "chat.prompt1": { en: "What courses can I apply for with my Z-score?", si: "මගේ Z-ලකුණු වලට අයදුම් කළ හැකි පාඨමාලා මොනවාද?", ta: "என் Z-மதிப்பெண்ணுடன் எந்த படிப்புகளுக்கு விண்ணப்பிக்கலாம்?" },
  "chat.prompt2": { en: "What are the career prospects for engineering?", si: "ඉංජිනේරු විද්‍යාව සඳහා වෘත්තීය අවස්ථා මොනවාද?", ta: "பொறியியலுக்கான தொழில் வாய்ப்புகள் என்ன?" },
  "chat.prompt3": { en: "Tell me about scholarship opportunities", si: "ශිෂ්‍යත්ව අවස්ථා ගැන කියන්න", ta: "உதவித்தொகை வாய்ப்புகள் பற்றி சொல்லுங்கள்" },
  
  // Footer
  "footer.disclaimer": { 
    en: "This is not official UGC results. Information is based on publicly available data.", 
    si: "මෙය නිල UGC ප්‍රතිඵල නොවේ. තොරතුරු පොදු දත්ත මත පදනම් වේ.", 
    ta: "இது அதிகாரப்பூர்வ UGC முடிவுகள் அல்ல. தகவல்கள் பொதுவில் கிடைக்கும் தரவுகளின் அடிப்படையில் உள்ளன." 
  },
  
  // Common
  "common.loading": { en: "Loading...", si: "පූරණය වෙමින්...", ta: "ஏற்றுகிறது..." },
  "common.error": { en: "Something went wrong", si: "යමක් වැරදී ඇත", ta: "ஏதோ தவறு நடந்தது" },
  "common.retry": { en: "Try again", si: "නැවත උත්සාහ කරන්න", ta: "மீண்டும் முயற்சிக்கவும்" },
  "common.save": { en: "Save", si: "සුරකින්න", ta: "சேமி" },
  "common.cancel": { en: "Cancel", si: "අවලංගු කරන්න", ta: "ரத்து செய்" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  useEffect(() => {
    const savedLanguage = getLanguage();
    if (savedLanguage !== language) {
      setLanguageState(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
