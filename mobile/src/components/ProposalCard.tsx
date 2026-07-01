import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import type { ProposalCard as ProposalCardType } from "../data/proposals";

interface Props {
  card: ProposalCardType;
}

export default function ProposalCard({ card }: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: card.image }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.body}>
        <View style={styles.meta}>
          <Text style={styles.category}>{card.functionalCategory}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.updated}>{card.updated}</Text>
        </View>
        <Text style={styles.title}>{card.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {card.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",

    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 140,
  },
  body: {
    padding: 14,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  category: {
    fontFamily: "Poppins_500Medium",
    fontSize: 11,
    color: "#2563eb",
  },
  dot: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#9ca3af",
    marginHorizontal: 6,
  },
  updated: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#6b7280",
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 19,
  },
});
