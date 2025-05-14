// TypeScript type declarations for browser SpeechRecognition

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useEffect, useRef, useState } from 'react';

export function useSpeechRecognition(onResult: (transcript: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      onResult(transcript);
    };
    recognitionRef.current = recognition;
  }, [onResult]);

  function start() {
    setListening(true);
    (recognitionRef.current as any)?.start();
  }
  function stop() {
    setListening(false);
    (recognitionRef.current as any)?.stop();
  }

  return { listening, start, stop };
} 
