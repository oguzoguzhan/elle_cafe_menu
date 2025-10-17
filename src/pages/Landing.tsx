import { useEffect, useState } from 'react';
import { Settings } from '../lib/supabase';
import { api } from '../lib/api';
import { useLanguage } from '../lib/languageContext';
import { LanguageSelector } from '../components/LanguageSelector';

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2D7D5]">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2D7D5]">
        <div className="text-red-600">Ayarlar yüklenemedi</div>
      </div>
    );
  }

  const welcomeText = language === 'en' && settings.welcome_text_en
    ? settings.welcome_text_en
    : settings.welcome_text_tr || settings.welcome_text;

  const buttonText = language === 'en' && settings.button_text_en
    ? settings.button_text_en
    : settings.button_text_tr || settings.button_text;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: settings.bg_color }}
    >
      <div className="absolute top-6 right-6">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {settings.logo_url && (
          <img
            src={settings.logo_url}
            alt="Logo"
            style={{ width: `${settings.logo_width}px` }}
            className="object-contain"
          />
        )}

        <h1
          className="font-bold text-center"
          style={{
            fontSize: `${settings.welcome_font_size}px`,
            color: settings.welcome_color,
          }}
        >
          {welcomeText}
        </h1>

        <button
          onClick={onEnter}
          className="px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{
            backgroundColor: settings.button_bg_color,
            color: settings.button_text_color,
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
