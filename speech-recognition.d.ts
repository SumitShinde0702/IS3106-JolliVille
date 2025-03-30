declare global {
  interface Window {
    SpeechRecognition: typeof globalThis.SpeechRecognition;
    webkitSpeechRecognition: typeof globalThis.SpeechRecognition; // For webkit-based browsers (e.g., Chrome)
    recognition: SpeechRecognition | webkitSpeechRecognition; // Properly typed as either SpeechRecognition or webkitSpeechRecognition
  }
}

export {};