import React, { createContext, useState, useMemo, ReactNode } from 'react';
import { translations } from '../lib/translations';

type Language = 'pl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  loadingMessages: string[];
  languageName: string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pl');

  const value = useMemo(() => {
    const currentTranslations = translations[language];
    
    const t = (key: string): string => {
      return (currentTranslations as any)[key] || key;
    };

    const loadingMessages = (currentTranslations as any).loadingMessages || [];
    const languageName = (currentTranslations as any).languageName || 'English';


    return {
      language,
      setLanguage,
      t,
      loadingMessages,
      languageName,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};