import { useState, useEffect, useRef, useCallback } from 'react';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  startListening: (options?: { append?: boolean; initialText?: string }) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (
  defaultOptions: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const optionsRef = useRef(defaultOptions);
  optionsRef.current = defaultOptions;

  const isManuallyStoppedRef = useRef<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        setIsSupported(true);
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(
    (startConfig?: { append?: boolean; initialText?: string }) => {
      setError(null);
      isManuallyStoppedRef.current = false;

      if (typeof window === 'undefined') {
        setError('El entorno no soporta SpeechRecognition.');
        return;
      }

      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        setError('Tu navegador no soporta SpeechRecognition nativo.');
        optionsRef.current.onError?.('SpeechRecognition no soportado.');
        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      try {
        const recognition = new SpeechRecognitionClass();
        recognitionRef.current = recognition;

        recognition.lang = optionsRef.current.lang || 'es-PE';
        recognition.continuous = optionsRef.current.continuous ?? true;
        recognition.interimResults = optionsRef.current.interimResults ?? true;
        recognition.maxAlternatives = 1;

        if (!startConfig?.append) {
          setTranscript(startConfig?.initialText || '');
        }

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalPiece = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0]?.transcript || '';
            if (result.isFinal) {
              finalPiece += text;
            } else {
              currentInterim += text;
            }
          }

          setInterimTranscript(currentInterim);

          if (finalPiece.trim().length > 0) {
            setTranscript((prev) => {
              const cleanedPrev = prev.trim();
              const newTranscript = cleanedPrev ? `${cleanedPrev} ${finalPiece.trim()}` : finalPiece.trim();
              optionsRef.current.onResult?.(newTranscript, true);
              return newTranscript;
            });
          } else if (currentInterim.trim().length > 0) {
            optionsRef.current.onResult?.(currentInterim.trim(), false);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') return;
          let userMsg = 'Error en reconocimiento de voz.';
          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            userMsg = 'Permiso de micrófono denegado.';
          }
          setError(userMsg);
          optionsRef.current.onError?.(userMsg);
        };

        recognition.onend = () => {
          setInterimTranscript('');
          if (isManuallyStoppedRef.current) {
            setIsListening(false);
            optionsRef.current.onEnd?.();
          } else {
            try {
              recognition.start();
            } catch {
              setIsListening(false);
              optionsRef.current.onEnd?.();
            }
          }
        };

        recognition.start();
      } catch (err: any) {
        console.error('Error starting speech recognition:', err);
        setError(err.message || 'No se pudo iniciar el micrófono.');
        setIsListening(false);
      }
    },
    []
  );

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
