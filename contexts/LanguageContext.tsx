import React, { createContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { translations } from '../lib/translations';

type Language = 'pl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  loadingMessages: string[];
  languageName: string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLanguage = localStorage.getItem('nightrider-language');
      return (savedLanguage === 'en' || savedLanguage === 'pl') ? savedLanguage : 'pl';
    } catch (error) {
      console.error("Failed to read language from localStorage", error);
      return 'pl'; // Default on error
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nightrider-language', language);
    } catch (error) {
      console.error("Failed to save language to localStorage", error);
    }
  }, [language]);


  const value = useMemo(() => {
    const currentTranslations = translations[language];
    
    const t = (key: string, replacements?: { [key: string]: string | number }): string => {
      let translation = (currentTranslations as any)[key] || key;
      if (replacements) {
        Object.keys(replacements).forEach(rKey => {
          const regex = new RegExp(`{{${rKey}}}`, 'g');
          translation = translation.replace(regex, String(replacements[rKey]));
        });
      }
      return translation;
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