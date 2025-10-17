import { useLanguage } from '../lib/languageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-2">
      <button
        onClick={() => setLanguage('tr')}
        className={`px-3 py-1 rounded transition-colors ${
          language === 'tr'
            ? 'bg-gray-800 text-white font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        TR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded transition-colors ${
          language === 'en'
            ? 'bg-gray-800 text-white font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        EN
      </button>
    </div>
  );
}
