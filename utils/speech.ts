import * as Speech from 'expo-speech';

export const speak = (toBeSpoken: string) => {
    Speech.speak(toBeSpoken, {
        language: 'zh-CN',
        pitch: 1.0,
        rate: 0.75,
    });
};

export const initSpeech = async (): Promise<void> => {
    return new Promise<void>((resolve) => {
        Speech.speak('', {
            language: 'zh-CN',
            rate: 0.75,
            pitch: 1.0,
            onDone: resolve,
            onStopped: resolve,
            onError: resolve,
        });
    });
}
