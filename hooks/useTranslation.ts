import useAppStore from '../store/useAppStore';
import { translations, Language } from '../utils/translations';

export const useTranslation = () => {
    const { settings } = useAppStore();
    const language = (settings.language as Language) || 'rw'; // Default to Kinyarwanda if invalid

    const t = (key: string) => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if translation missing
                let fallback: any = translations['en'];
                for (const fk of keys) {
                    if (fallback && fallback[fk]) fallback = fallback[fk];
                    else return key; // Return key if not found in fallback either
                }
                return fallback;
            }
        }

        return value as string;
    };

    return { t, language };
};
