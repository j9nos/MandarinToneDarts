import { Design } from "@/constants/Design";

import { usePlayerStorage } from "@/hooks/usePlayerStorage";
import { useScriptStorage } from "@/hooks/useScriptStorage";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DataContext, MandarinData } from "./_layout";

function getRandomWord(words: MandarinData[]): MandarinData {
    return words[Math.floor(Math.random() * words.length)];
}



type Tone = 1 | 2 | 3 | 4;

function addAccent(vowel: string, tone: Tone): string {
    const tones = {
        1: "\u0304",
        2: "\u0301",
        3: "\u030C",
        4: "\u0300"
    } as const;

    return (vowel.normalize("NFD") + tones[tone]).normalize("NFC");
}



function replaceCharAt(str: string, index: number, replacement: string): string {
    if (index < 0 || index >= str.length) { return str };
    return str.slice(0, index) + replacement + str.slice(index + 1);
}



export default function StartGameScreen() {
    const router = useRouter();
    const words = useContext(DataContext);
    const persistStreak = usePlayerStorage((s) => s.updateStreak);
    const script = useScriptStorage((s) => s.script);

    const [word, setWord] = useState(getRandomWord(words));
    const [accentedIndexes, setAccentedIndexes] = useState<number[]>(word.accentedIndexes);
    const [userPinyin, setUserPinyin] = useState(word.normalizedPinyin);
    const [streak, setStreak] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);



    useEffect(() => {
        if (0 === accentedIndexes.length) {
            if (word.pinyin !== userPinyin) {
                Alert.alert("Game Over",
                    `Your streak this round: ${streak}`);
                router.push("/");
                return;
            }
            setStreak(streak + 1);
            setModalVisible(true);
            setTimeout(() => {
                setModalVisible(false);
                const randomWord = getRandomWord(words);
                setWord(randomWord);
                setAccentedIndexes(randomWord.accentedIndexes);
                setUserPinyin(randomWord.normalizedPinyin);
            }, 750);
        }
    }, [accentedIndexes]);

    useEffect(() => {
        persistStreak(streak);
    }, [streak]);


    function selectAccent(accent: Tone) {
        if (accentedIndexes.length) {
            setUserPinyin(replaceCharAt(userPinyin, accentedIndexes[0], addAccent(userPinyin[accentedIndexes[0]], accent)));
            setAccentedIndexes(prev => prev.slice(1));
        }
    }


    return (
        <>
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={styles.centeredView}>
                    <Text style={styles.correct}>{streak}</Text>
                </View>
            </Modal>

            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                >
                    <Text style={[styles.text, styles.english]}>{word.english}</Text>
                    <Text style={[styles.text, styles.hanzi]}>{word[script]}</Text>
                    <Text style={[styles.text, styles.pinyin]}>
                        {userPinyin.split("").map((char: string, index: number) => (
                            <Text key={index} style={index === accentedIndexes[0] && styles.pinyinFocused}>
                                {char}
                            </Text>
                        ))}
                    </Text>
                </ScrollView>
            </View>

            <View style={styles.toneButtonContainer}>
                <TouchableOpacity style={styles.toneButton} onPress={() => selectAccent(1)}>
                    <Entypo name="minus" style={styles.tone} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toneButton} onPress={() => selectAccent(2)}>
                    <AntDesign name="arrowup" style={styles.tone} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toneButton} onPress={() => selectAccent(3)}>
                    <FontAwesome6 name="wave-square" style={styles.tone} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toneButton} onPress={() => selectAccent(4)}>
                    <AntDesign name="arrowdown" style={styles.tone} />
                </TouchableOpacity>
            </View >
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Design.ColorTransparentGreen,
    },
    correct: {
        fontSize: 70,
        fontFamily: Design.FontFamily,
        color: Design.ColorYellow
    },
    scrollViewContent: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        flexShrink: 1,
        flexWrap: "wrap",
        width: "100%",
        color: Design.ColorBlue,
        textAlign: "center",
        fontFamily: Design.FontFamily,
    },
    english: {
        fontSize: 50
    },
    hanzi: {
        fontSize: 70
    },
    pinyin: {
        fontSize: 50,
    },
    pinyinFocused: {
        color: Design.ColorRed
    },
    toneButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        flexWrap: "wrap",
    },
    toneButton: {
        width: 70,
        alignItems: "center",
        justifyContent: "center",
    },
    tone: {
        fontSize: 50,
        color: Design.ColorBlue,
    },
});