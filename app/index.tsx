import { Design } from "@/constants/Design";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <TouchableOpacity
            style={styles.touchableOpacity}
            onPress={() => router.push("/game")}
          >
            <Ionicons name="game-controller-outline" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touchableOpacity}
            onPress={() => router.push("/words")}
          >
            <MaterialIcons name="list" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touchableOpacity}
            onPress={() => router.push("/settings")}
          >
            <MaterialIcons name="settings" style={styles.icon} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  touchableOpacity: {
    marginVertical: 10,
  },
  icon: {
    color: Design.ColorBlue,
    fontSize: 50,
  },
});