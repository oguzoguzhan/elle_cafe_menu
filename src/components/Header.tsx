import { Settings } from '../lib/supabase';

interface HeaderProps {
  settings: Settings;
  onLogoClick: () => void;
}

export function Header({ settings, onLogoClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 shadow-sm flex items-center justify-center"
      style={{
        backgroundColor: settings.header_bg_color,
        height: `${settings.header_height}px`,
      }}
    >
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
  );
}
