import { Design } from "@/constants/Design";

import { useScriptStorage } from "@/hooks/useScriptStorage";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { DataContext, MandarinData } from "./_layout";

export default function ShowWordsScreen() {
  const words = useContext(DataContext);

  const script = useScriptStorage((s) => s.script);
  const [search, setSearch] = useState("");
  const [filteredWords, setFilteredWords] = useState<MandarinData[]>();

  useEffect(() => {
    if (!words) { return };
    if ("" === search.trim()) {
      setFilteredWords(words);
    } else {
      const lowercased = search.toLowerCase();
      const filtered = words.filter((word) =>
        word.english.toLowerCase().includes(lowercased) ||
        word.normalizedPinyin.toLowerCase().includes(lowercased)
      );
      setFilteredWords(filtered);
    }
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
        style={{width:"100%"}}
        showsVerticalScrollIndicator={false}
        data={filteredWords}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <View style={styles.wordContainer}>
          <Text style={styles.word}>{item?.english}</Text>
          <Text style={styles.word}>{item?.[script]}</Text>
          <Text style={styles.word}>{item?.pinyin}</Text>
        </View>}
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
