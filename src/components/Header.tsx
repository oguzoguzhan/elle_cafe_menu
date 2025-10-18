import { ArrowLeft } from 'lucide-react';
import { Settings } from '../lib/supabase';
import { useLanguage } from '../lib/languageContext';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  settings: Settings;
  onLogoClick: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showLanguageSelector?: boolean;
}

export function Header({ settings, onLogoClick, showBackButton = false, onBackClick, showLanguageSelector = false }: HeaderProps) {
  const { language } = useLanguage();
  const backButtonText = language === 'en' ? 'Back' : 'Geri';

  return (
    <>
      {showLanguageSelector && (
        <div
          className="sticky top-0 z-20 border-b border-gray-200"
          style={{ backgroundColor: settings.language_bar_bg_color }}
        >
          <div className="max-w-4xl mx-auto px-4 py-2 flex justify-end">
            <LanguageSelector />
          </div>
        </div>
      )}
      <header
        className={showLanguageSelector ? "sticky top-[48px] z-10 shadow-sm flex items-center justify-center relative" : "sticky top-0 z-10 shadow-sm flex items-center justify-center relative"}
        style={{
          backgroundColor: settings.header_bg_color,
          height: `${settings.header_height}px`,
        }}
      >
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="absolute left-4 flex items-center gap-2 px-3 py-1 rounded shadow-sm hover:shadow-md transition-shadow"
            style={{
              backgroundColor: settings.back_button_bg_color,
              color: settings.back_button_text_color
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span style={{ fontSize: `${settings.nav_font_size}px` }}>{backButtonText}</span>
          </button>
        )}

        {settings.header_logo_url ? (
          <button onClick={onLogoClick} className="focus:outline-none">
            <img
              src={settings.header_logo_url}
              alt="Logo"
              style={{ width: `${settings.header_logo_width}px` }}
              className="object-contain"
            />
          </button>
        ) : (
          <button
            onClick={onLogoClick}
            className="text-xl font-bold text-gray-900 hover:text-gray-700"
          >
            Menü
          </button>
        )}
      </header>
    </>
  );
}
