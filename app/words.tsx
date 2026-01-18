import { Design } from "@/constants/Design";

import mandarinData from "@/assets/data/mandarin.json";
import { useScriptStorage } from "@/hooks/useScriptStorage";
import { speak } from "@/utils/speech";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MandarinData } from "./_layout";

export default function ShowWordsScreen() {
  const [words] = useState<MandarinData[]>(mandarinData);

  const script = useScriptStorage((s) => s.script);
  const [search, setSearch] = useState("");

  const filteredWords = useMemo(() => {
    if (!words) {
      return [];
    }
    const trimmed = search.trim().toLowerCase();
    if ("" === trimmed) {
      return words;
    }
    return words.filter((word) =>
      word.english.toLowerCase().includes(trimmed) ||
      word.normalizedPinyin.toLowerCase().includes(trimmed) ||
      word.pinyin.toLowerCase().includes(trimmed)
    );
  }, [search, words]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Search"
        placeholderTextColor={Design.ColorBlue}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
      <FlatList
        style={styles.flatList}
        showsVerticalScrollIndicator={false}
        data={filteredWords}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <TouchableOpacity style={styles.wordContainer} onPress={() => speak(item.simplified_hanzi)} >
          <Text style={styles.word}>{item.english}</Text>
          <Text style={styles.word}>{item[script]}</Text>
          <Text style={styles.word}>{item.pinyin}</Text>
        </TouchableOpacity>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    alignItems: "center"
  },
  flatList: {
    width: "100%"
  },
  wordContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 72,
    alignSelf: "center",
  },
  word: {
    fontSize: 18,
    color: Design.ColorBlue,
    fontFamily: Design.FontFamily,
    textAlign: "center"
  },
  textInput: {
    borderWidth: 1,
    borderStyle: "dotted",
    borderColor: Design.ColorBlue,
    color: Design.ColorBlue,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 18,
    fontFamily: Design.FontFamily,
    textAlign: "center",
    width: "80%"
  },
});
