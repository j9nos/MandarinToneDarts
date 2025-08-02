
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import mandarin from "@/assets/data/mandarin.json";
import TopBar from "@/components/TopBar";
import { Design } from "@/constants/Design";
import { usePlayerStorage } from "@/hooks/usePlayerStorage";
import { useScriptStorage } from "@/hooks/useScriptStorage";
import { Slot } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


SplashScreen.preventAutoHideAsync();


const TEST_DATA = [
  {
    english: "A red dragon is holding a dartboard.",
    simplified_hanzi: "一条红龙手持镖盘。",
    traditional_hanzi: "一隻紅龍手持鏢盤。",
    pinyin: "Yī zhī hóng lóng shǒuchí biāo pán.",
    normalizedPinyin: "Yi zhi hong long souchi biao pan.",
    accentedIndexes: [
      1, 5, 8, 13, 18, 22, 26, 30
    ]
  }
];

export type MandarinData = typeof TEST_DATA[number];

export const DataContext = createContext<MandarinData[]>(TEST_DATA);

export default function RootLayout() {

  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [words, setWords] = useState<MandarinData[]>(TEST_DATA);
  const loadPlayer = usePlayerStorage((s) => s.loadPlayer);
  const player = usePlayerStorage((s) => s.player);
  const loadScript = useScriptStorage((s) => s.loadScript);


  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        await Font.loadAsync({
          "WDXLLubrifontSC-Regular": require("../assets/fonts/WDXLLubrifontSC-Regular.ttf"),
          ...AntDesign.font,
          ...Entypo.font,
          ...FontAwesome.font,
          ...FontAwesome5.font,
          ...FontAwesome6.font,
          ...Ionicons.font,
          ...MaterialIcons.font,
        });
        setFontsLoaded(true);
        setWords(mandarin);
        loadPlayer();
        loadScript();
      } catch (e) {
        console.warn("Initialization error", e);
      }
    };

    initializeApp();
  }, []);



  useEffect(() => {
    if (fontsLoaded && words && player) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, words, player]);

  if (!fontsLoaded || !words || !player) {
    return null;
  }


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <TopBar player={player} />
        <DataContext.Provider value={words}>
          <Slot />
        </DataContext.Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Design.ColorYellow,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  text: {
    fontSize: 18,
    color: Design.ColorBlue,
    fontFamily: Design.FontFamily,
  },
  name: {
    fontSize: 18,
    color: Design.ColorBlue,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakIcon: {
    fontSize: 18,
    color: Design.ColorBlue,
    marginRight: 4,
  },
  streakText: {
    fontSize: 18,
    color: Design.ColorBlue,
    fontFamily: Design.FontFamily,
  },
});
