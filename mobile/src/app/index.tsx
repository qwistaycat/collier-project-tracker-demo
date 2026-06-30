import { View, Text, StyleSheet, Linking } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChooseDemoScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Choose Demo</Text>

        <Text style={styles.description}>
          The Project Tracker web app offers different experiences. If you're
          unsure, choose resident to see the default view.
        </Text>

        <View style={styles.cards}>
          {/* Resident Card */}
          <Link
            href="/(resident)/dashboard"
            style={[styles.card, styles.cardActive]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeading}>Log in as Resident</Text>
              <Text style={styles.cardText}>
                This view shows how information layout is shown to the public and
                how residents can interact.
              </Text>
            </View>
          </Link>

          {/* Township Card — disabled */}
          <View style={[styles.card, styles.cardDisabled]}>
            <Text style={styles.cardHeading}>Log in as Township</Text>
            <Text style={styles.cardText}>
              This view shows all management and editing tools, as well as all
              feedback.
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMING SOON</Text>
            </View>
          </View>
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
  card: {
    flex: 1,
    backgroundColor: "#e8edf4",
    borderRadius: 15,
    padding: 22,
  },
  cardActive: {},
  cardDisabled: {
    opacity: 0.55,
  },
  cardHeading: {
    fontFamily: "Poppins_700Bold",
    fontSize: 17,
    color: "#003d7a",
    marginBottom: 10,
  },
  cardText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#3a5a80",
    lineHeight: 20,
  },
  badge: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 61, 122, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    color: "#ffffff",
    letterSpacing: 0.5,
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
