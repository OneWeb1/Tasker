import { useCallback, useEffect, useRef, useState } from 'react';
import { punctuateTranscript } from '../lib/punctuateTranscript';
import type { TimedSegment } from '../lib/punctuateTranscript';

export type VoiceStatus = 'idle' | 'listening' | 'review' | 'error';

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResult {
  readonly length: number;
  [index: number]: RecognitionAlternative;
}

interface RecognitionEvent {
  results: ArrayLike<RecognitionResult>;
}

interface RecognitionErrorEvent {
  error: string;
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionConstructor = new () => Recognition;

const RECOGNITION_LANG = 'uk-UA';
const RESTART_DELAY_MS = 150;
const RECOVERABLE_ERRORS: readonly string[] = ['no-speech', 'aborted'];

const getRecognitionConstructor = (): RecognitionConstructor | null => {
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
};

export function useNoteVoiceInput() {
  const recognitionRef = useRef<Recognition | null>(null);
  const segmentsRef = useRef(new Map<number, TimedSegment>());
  const isWantedRef = useRef(false);
  const offsetRef = useRef(0);
  const restartTimer = useRef<number | null>(null);
  const launchRef = useRef<() => void>(() => undefined);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const isSupported = getRecognitionConstructor() !== null;

  const detach = useCallback(() => {
    isWantedRef.current = false;
    if (restartTimer.current !== null) window.clearTimeout(restartTimer.current);
    restartTimer.current = null;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  }, []);

  const launch = useCallback(() => {
    const Constructor = getRecognitionConstructor();
    if (!Constructor) return;

    const offset = offsetRef.current;
    let sessionLength = 0;
    const recognition = new Constructor();
    recognition.lang = RECOGNITION_LANG;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const now = Date.now();
      const known = segmentsRef.current;
      sessionLength = event.results.length;
      for (let index = 0; index < event.results.length; index += 1) {
        const key = offset + index;
        const text = event.results[index][0].transcript;
        const previous = known.get(key);
        if (!previous) known.set(key, { text, firstAt: now, lastAt: now });
        else if (previous.text !== text) known.set(key, { ...previous, text, lastAt: now });
      }
      setTranscript(punctuateTranscript([...known.values()], false));
    };
    recognition.onerror = (event) => {
      if (RECOVERABLE_ERRORS.includes(event.error)) return;
      isWantedRef.current = false;
      setStatus('error');
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      offsetRef.current = offset + sessionLength;

      if (isWantedRef.current) {
        restartTimer.current = window.setTimeout(() => {
          restartTimer.current = null;
          if (isWantedRef.current) launchRef.current();
        }, RESTART_DELAY_MS);
        return;
      }

      setTranscript(punctuateTranscript([...segmentsRef.current.values()], true));
      setStatus((current) => (current === 'listening' ? 'review' : current));
    };
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      isWantedRef.current = false;
      recognitionRef.current = null;
      setStatus('error');
    }

  }, []);

  useEffect(() => {
    launchRef.current = launch;
  }, [launch]);

  const start = useCallback(() => {
    if (!getRecognitionConstructor()) return;
    detach();
    segmentsRef.current.clear();
    offsetRef.current = 0;
    isWantedRef.current = true;
    setTranscript('');
    setStatus('listening');
    launch();
  }, [detach, launch]);

  const stop = useCallback(() => {
    isWantedRef.current = false;
    if (restartTimer.current !== null) {
      window.clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
      return;
    }
    setTranscript(punctuateTranscript([...segmentsRef.current.values()], true));
    setStatus((current) => (current === 'listening' ? 'review' : current));
  }, []);

  const reset = useCallback(() => {
    detach();
    segmentsRef.current.clear();
    offsetRef.current = 0;
    setTranscript('');
    setStatus('idle');
  }, [detach]);

  useEffect(() => detach, [detach]);

  return { isSupported, status, transcript, start, stop, reset };
}