import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TTSHookReturn {
    ttsEnabled: boolean;
    setTtsEnabled: (value: boolean | ((prev: boolean) => boolean)) => void;
    playTTS: (text: string, lang?: string) => Promise<void>;
    playCourtTTS: (names: string[], number: string, lang?: string) => Promise<void>;
}

export const useTTS = (onError?: (message: string) => void): TTSHookReturn => {
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const { t, i18n } = useTranslation();

    const playTTS = async (text: string, lang: string = 'zh-TW'): Promise<void> => {
        if (!ttsEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve, reject) => {
            if (!window.speechSynthesis) {
                onError?.('瀏覽器不支援語音合成');
                reject();
                return;
            }

            const utter = new window.SpeechSynthesisUtterance(text);
            utter.lang = lang;
            utter.rate = 1;
            utter.pitch = 1;
            utter.volume = 1;
            utter.onend = () => resolve();
            utter.onerror = (e) => reject(e);

            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                const match = voices.find(v => v.lang === lang);
                if (match) utter.voice = match;
            }

            window.speechSynthesis.speak(utter);
        });
    };

    const playCourtTTS = async (names: string[], number: string, lang?: string) => {
        if (!ttsEnabled) return;
        
        try {
            let ttsLang = lang;
            if (!ttsLang) {
                ttsLang = i18n.language === 'zh-TW' || i18n.language === 'zh' ? 'zh-TW' : 'en';
            }

            const msg = t('court.ttsCallToCourt', {
                names: names.join('、'),
                number: number
            });

            await playTTS(msg, ttsLang);
        } catch (e) {
            onError?.('語音服務暫時無法使用，請稍後再試');
        }
    };

    return {
        ttsEnabled,
        setTtsEnabled,
        playTTS,
        playCourtTTS
    };
}; 