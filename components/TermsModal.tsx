import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface TermsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isVisible, onClose }) => {
  const { t } = useLanguage();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" 
      style={{ animationDuration: '300ms' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#111111] border border-amber-400/30 rounded-lg shadow-lg p-6 md:p-8 text-gray-300 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="font-display text-xl md:text-2xl text-amber-400 mb-4 pr-10">
          {t('termsTitle')}
        </h2>
        
        <div className="max-h-[60vh] overflow-y-auto pr-4 text-sm font-sans space-y-3">
          {t('termsContent').split('\n').map((paragraph, index) => (
              <p key={index} className="leading-relaxed">{paragraph}</p>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-amber-400 rounded-full transition-colors"
          aria-label={t('closeButton')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};