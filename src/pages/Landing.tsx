import { Settings, api } from '../lib/api';

interface LandingProps {
  settings: Settings;
  onEnter: () => void;
}

export function Landing({ settings, onEnter }: LandingProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: settings.landing_bg_color || '#ffffff' }}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <h1
          className="font-bold text-center"
          style={{
            fontSize: '32px',
            color: '#1f2937',
          }}
        >
          {settings.header_title || 'Ürün Kataloğu'}
        </h1>

        <button
          onClick={onEnter}
          className="px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{
            backgroundColor: '#3b82f6',
            color: '#ffffff',
          }}
        >
          Kategorileri Görüntüle
        </button>
      </div>
    </div>
  );
}
