import { Design } from "@/constants/Design";
import { Player } from "@/hooks/usePlayerStorage";
import { ScrollView, StyleSheet, Text, View } from "react-native";


type TopBarProps = {
    player: Player;
};


export default function TopBar({ player }: TopBarProps) {
    return (
        <View style={styles.topBar}>
            <View style={styles.nameContainer} >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}>
                    <Text style={styles.text}>{player.name}</Text>
                </ScrollView>
            </View>
            <View style={styles.streakContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}>
                    <Text style={styles.text}>{player.streak}</Text>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: "row",
        padding: 10,
    },
    nameContainer: {
        flex: 1,
    },
    streakContainer: {
        flex: 1,
        alignItems: "flex-end",
    },
    scrollView: {
        maxWidth: "100%",
    },
    text: {
        fontSize: 18,
        color: Design.ColorBlue,
        fontFamily: Design.FontFamily,
    },
});