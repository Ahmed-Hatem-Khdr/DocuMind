import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  appSubtitle: string;
  navDashboard: string;
  navArchive: string;
  navUpload: string;
  navAskArchive: string;
  navCompare: string;
  navSettings: string;
  searchPlaceholder: string;
  uploadFirstDoc: string;
  totalDocuments: string;
  categories: string;
  recentActivity: string;
  noDocsTitle: string;
  noDocsSub: string;
  startBuilding: string;
  filterAll: string;
  gridView: string;
  listView: string;
  confidenceWarning: string;
  askDocument: string;
  askArchiveTitle: string;
  setReminder: string;
  sourceDocuments: string;
  download: string;
  delete: string;
  edit: string;
  save: string;
  cancel: string;
  demoMode: string;
  signOut: string;
  signIn: string;
  googleSignIn: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'DocuMind',
    appSubtitle: 'Intelligent Digital Archive & Document Intelligence',
    navDashboard: 'Dashboard',
    navArchive: 'Digital Archive',
    navUpload: 'Upload Document',
    navAskArchive: 'Ask My Archive',
    navCompare: 'Compare Documents',
    navSettings: 'Settings',
    searchPlaceholder: 'Search by filename, OCR text, tags, institution, dates...',
    uploadFirstDoc: 'Upload Your First Document',
    totalDocuments: 'Total Documents',
    categories: 'Categories',
    recentActivity: 'Recent Activity',
    noDocsTitle: 'Your archive is empty',
    noDocsSub: 'Start transforming your static documents into actionable intelligence.',
    startBuilding: 'Start Building My Archive',
    filterAll: 'All Categories',
    gridView: 'Grid View',
    listView: 'List View',
    confidenceWarning: 'Please verify this information',
    askDocument: 'Ask This Document',
    askArchiveTitle: 'Ask My Digital Archive',
    setReminder: 'Set Smart Reminder',
    sourceDocuments: 'Source Documents',
    download: 'Download Original',
    delete: 'Delete Document',
    edit: 'Edit Fields',
    save: 'Save Changes',
    cancel: 'Cancel',
    demoMode: 'Demo Account',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    googleSignIn: 'Sign in with Google',
  },
  ar: {
    appName: 'دوكيو مايند',
    appSubtitle: 'الأرشيف الرقمي الذكي ومعالجة المستندات',
    navDashboard: 'لوحة التحكم',
    navArchive: 'الأرشيف الرقمي',
    navUpload: 'رفع مستند',
    navAskArchive: 'اسأل أرشيفي',
    navCompare: 'مقارنة المستندات',
    navSettings: 'الإعدادات',
    searchPlaceholder: 'ابحث باسم الملف، نص OCR، الوسوم، الجهة المصدرة، التواريخ...',
    uploadFirstDoc: 'ارفع مستندك الأول',
    totalDocuments: 'إجمالي المستندات',
    categories: 'التصنيفات',
    recentActivity: 'النشاط الأخير',
    noDocsTitle: 'أرشيفك فارغ حالياً',
    noDocsSub: 'ابدأ بتحويل مستنداتك الورقية والجامدة إلى معلومات منظمة وذكية.',
    startBuilding: 'ابدأ بناء أرشيفك الذكي',
    filterAll: 'جميع التصنيفات',
    gridView: 'عرض شبكي',
    listView: 'عرض القائمة',
    confidenceWarning: 'يرجى مراجعة وتأكيد هذه المعلومة',
    askDocument: 'اسأل هذا المستند',
    askArchiveTitle: 'اسأل أرشيفي الرقمي',
    setReminder: 'ضبط تذكير ذكي',
    sourceDocuments: 'المستندات المصدرية',
    download: 'تحميل الأصل',
    delete: 'حذف المستند',
    edit: 'تعديل البيانات',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    demoMode: 'حساب تجريبي',
    signOut: 'تسجيل الخروج',
    signIn: 'تسجيل الدخول',
    googleSignIn: 'الدخول باستخدام Google',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
    isRTL: language === 'ar',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
