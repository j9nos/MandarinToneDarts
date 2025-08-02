import { Design } from "@/constants/Design";
import { MAX_NAME_LENGTH, usePlayerStorage } from "@/hooks/usePlayerStorage";
import { SIMPLIFIED_HANZI, useScriptStorage } from "@/hooks/useScriptStorage";

import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const changeName = usePlayerStorage((s) => s.changeName);
  const script = useScriptStorage((s) => s.script);
  const toggleScript = useScriptStorage((state) => state.toggleScript);

  const [newName, setNewName] = useState("");

  const handleSubmit = async (): Promise<void> => {
    const trimmed = newName.trim();
    if (!trimmed) { return };

    const success = await changeName(trimmed);
    if (!success) {
      Alert.alert("Name too long", `Maximum ${MAX_NAME_LENGTH} characters allowed.`);
      return;
    }
    router.push("/");
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <TextInput
            style={styles.textInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Change name"
            placeholderTextColor={Design.ColorBlue}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            onSubmitEditing={() => void handleSubmit()}
          />
          <TouchableOpacity style={styles.button} onPress={toggleScript}>
            <Text style={styles.text}>{SIMPLIFIED_HANZI === script ? "Simplified 汉字" : "Traditional 漢字"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderWidth: 1,
    borderColor: Design.ColorBlue,
    padding: 10,
    borderRadius: 3,
    alignItems: "center",
    width: "80%",
  },
  text: {
    fontFamily: Design.FontFamily,
    color: Design.ColorBlue,
    fontSize: 18,
  },
  textInput: {
    borderWidth: 1,
    borderStyle: "dotted",
    color: Design.ColorBlue,
    borderColor: Design.ColorBlue,
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
