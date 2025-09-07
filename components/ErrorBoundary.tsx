import React, { Component, ErrorInfo, ReactNode } from 'react';
import { translations } from '../lib/translations';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// A simple language detector for the fallback UI
const getLang = () => (localStorage.getItem('nightrider-language') === 'en' ? 'en' : 'pl');

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const lang = getLang();
      const t = translations[lang];

      return (
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold text-amber-400 font-display mb-4">
              {t.errorBoundaryTitle}
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              {t.errorBoundaryMessage}
            </p>
            <button
              onClick={this.handleRefresh}
              className="px-6 py-2 font-display text-lg tracking-wider text-black bg-amber-400 border-2 border-amber-400 rounded-md transition-all duration-300 hover:bg-amber-500 hover:border-amber-500"
            >
              {t.refreshButton}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
