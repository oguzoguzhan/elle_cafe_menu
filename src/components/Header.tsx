import { ArrowLeft } from 'lucide-react';
import { Settings } from '../lib/api';

interface HeaderProps {
  settings: Settings;
  onLogoClick: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function Header({ settings, onLogoClick, showBackButton = false, onBackClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 shadow-sm flex items-center justify-center relative"
      style={{
        backgroundColor: settings.header_bg_color || '#3b82f6',
        height: '80px',
      }}
    >
      {showBackButton && onBackClick && (
        <button
          onClick={onBackClick}
          className="absolute left-4 flex items-center gap-2 px-3 py-1 rounded shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: settings.back_button_bg_color || '#3b82f6',
            color: settings.back_button_text_color || '#ffffff'
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
      )}

      <button
        onClick={onLogoClick}
        className="text-xl font-bold hover:opacity-80 transition-opacity"
        style={{ color: settings.header_text_color || '#ffffff' }}
      >
        {settings.header_title || 'Ürün Kataloğu'}
      </button>
    </header>
  );
}
