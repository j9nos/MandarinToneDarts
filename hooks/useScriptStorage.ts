import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const SIMPLIFIED_HANZI = "simplified_hanzi";
const TRADITIONAL_HANZI = "traditional_hanzi";
type Script = typeof SIMPLIFIED_HANZI | typeof TRADITIONAL_HANZI;
const SCRIPT_KEY = "script";
const DEFAULT_SCRIPT: Script = SIMPLIFIED_HANZI;



interface ScriptStorage {
  script: Script;
  loadScript: () => Promise<void>;
  toggleScript: () => Promise<void>;
};

export const useScriptStorage = create<ScriptStorage>((set, get) => ({
  script: DEFAULT_SCRIPT,

  loadScript: async () => {
    try {
      const stored = await AsyncStorage.getItem(SCRIPT_KEY);
      if (SIMPLIFIED_HANZI === stored || TRADITIONAL_HANZI === stored) {
        set({ script: stored });
      } else {
        set({ script: DEFAULT_SCRIPT });
      }
    } catch (err) {
      console.error("Failed to load script from storage:", err);
    }
  },

  toggleScript: async () => {
    try {
      const currentScript = get().script;
      const nextScript = SIMPLIFIED_HANZI === currentScript ? TRADITIONAL_HANZI : SIMPLIFIED_HANZI;
      await AsyncStorage.setItem(SCRIPT_KEY, nextScript);
      set({ script: nextScript });
    } catch (err) {
      console.error("Failed to toggle script:", err);
    }
  },
}));
