import { View, Text, StyleSheet, Pressable } from "react-native";
import { SymbolView } from "expo-symbols";

export default function HeaderRight() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.iconButton}>
        <SymbolView
          name={{ ios: "bell", android: "notifications", web: "notifications" }}
          size={22}
          tintColor="#ffffff"
        />
        <View style={styles.badge} />
      </Pressable>

      <View style={styles.profileContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  iconButton: {
    position: "relative",
    marginRight: 16,
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: "#ef4444",
    borderRadius: 4,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#60a5fa",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
