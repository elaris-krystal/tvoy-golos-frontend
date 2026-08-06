import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Озвучивание текста через нативный SpeechSynthesis API браузера —
 * полностью на устройстве, ничего не уходит на сервер, работает даже
 * офлайн. Особенно полезно для длинного официального текста обращения:
 * проще проверить на слух, чем вычитывать плотный юридический текст
 * с экрана, а для части нашей аудитории (пенсионеры, люди с проблемами
 * со зрением) это не просто удобство, а реальная разница в доступности.
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const pickRussianVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.startsWith('ru')) ?? null;
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel(); // не накладываем несколько чтений друг на друга

    const startSpeaking = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const ruVoice = pickRussianVoice();
      if (ruVoice) utterance.voice = ruVoice;
      utterance.lang = 'ru-RU';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    // getVoices() в некоторых браузерах (особенно Chrome при первом вызове
    // после загрузки страницы) возвращает пустой список до события
    // voiceschanged — без этого "ru-голос" мог бы не найтись только из-за
    // тайминга, а не его реального отсутствия.
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', startSpeaking, { once: true });
    } else {
      startSpeaking();
    }
  }, [isSupported, pickRussianVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const toggle = useCallback((text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  }, [isSpeaking, speak, stop]);

  return { isSpeaking, isSupported, speak, stop, toggle };
}
