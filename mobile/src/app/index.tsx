import { View, Text, StyleSheet, Linking } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DemoCard from "../components/DemoCard";

export default function ChooseDemoScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Mobile Demo</Text>

        <Text style={styles.description}>
          The Project Tracker mobile app only supports resident-facing view. If you're looking for the township official-facing demo, view this on Desktop.
        </Text>

        <View style={styles.cards}>
          <DemoCard
            title="Log in as Resident"
            description="This view shows how information layout is shown to the public and how residents can interact."
            href="/(resident)/dashboard"
            onPress={() => router.push("/(resident)/dashboard")}
          />
        </View>

        <Text style={styles.contact}>
          Need help? Contact:{" "}
          <Text
            style={styles.contactLink}
            onPress={() => Linking.openURL("mailto:colliertownship@andrew.cmu.edu")}
          >
            colliertownship@andrew.cmu.edu
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#003d7a",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 40,
    color: "#ffffff",
    marginBottom: 16,
  },
  description: {
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
    color: "#ffffff",
    lineHeight: 28,
    marginBottom: 32,
  },
  cards: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 40,
  },
  contact: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#b0c4de",
    textAlign: "center",
  },
  contactLink: {
    fontFamily: "Poppins_600SemiBold",
    color: "#ffffff",
  },
});
