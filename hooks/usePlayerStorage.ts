import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export interface Player {
  name: string;
  streak: number;
};

interface PlayerStorage  {
  player: Player;
  loadPlayer: () => Promise<void>;
  setPlayer: (p: Player) => Promise<void>;
  changeName: (name: string) => Promise<boolean>;
  updateStreak: (streak: number) => Promise<void>;
};

const PLAYER_KEY = "player";
const DEFAULT_PLAYER: Player = { name: "PlayerX", streak: 0 };
export const MAX_NAME_LENGTH = 15;

export const usePlayerStorage = create<PlayerStorage>((set) => ({
  player: DEFAULT_PLAYER,

  loadPlayer: async () => {
    try {
      const stored = await AsyncStorage.getItem(PLAYER_KEY);
      const parsed = stored ? JSON.parse(stored) : DEFAULT_PLAYER;
      set({ player: parsed });
    } catch (err) {
      console.error("Failed to load player:", err);
    }
  },

  setPlayer: async (player) => {
    try {
      await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(player));
      set({ player });
    } catch (err) {
      console.error("Failed to set player:", err);
    }
  },

  changeName: async (name) => {
    if (name.length > MAX_NAME_LENGTH) {
      return false;
    }

    try {
      const stored = await AsyncStorage.getItem(PLAYER_KEY);
      const player: Player = stored ? JSON.parse(stored) : DEFAULT_PLAYER;
      player.name = name;
      await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(player));
      set({ player });
      return true;
    } catch (err) {
      console.error("Failed to change name:", err);
      return false;
    }
  },

  updateStreak: async (streak) => {
    try {
      const stored = await AsyncStorage.getItem(PLAYER_KEY);
      let player: Player = stored ? JSON.parse(stored) : DEFAULT_PLAYER;
      if (streak > player.streak) {
        player.streak = streak;
        await AsyncStorage.setItem(PLAYER_KEY, JSON.stringify(player));
        set({ player });
      }
    } catch (err) {
      console.error("Failed to update streak:", err);
    }
  },
}));
