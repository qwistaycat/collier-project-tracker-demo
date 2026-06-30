import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { useState } from "react";
import { dashboardSections, type DashboardSection } from "@/data/proposals";
import ProposalCard from "@/components/ProposalCard";

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = dashboardSections.map((section) => {
    if (!section.cards) return section;
    const filtered = section.cards.filter(
      (card) =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...section, cards: filtered };
  });

  const renderSection = (section: DashboardSection, idx: number) => {
    const cards = section.cards || [];
    if (cards.length === 0) return null;

    return (
      <View key={idx} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {cards.map((card) => (
          <ProposalCard key={card.id} card={card} />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Policy Tracking</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sections */}
      {filteredSections.map((section, idx) => renderSection(section, idx))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#111827",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#111827",
    paddingVertical: 10,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#111827",
    marginBottom: 14,
  },
});
