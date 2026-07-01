import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { useState } from "react";
import { dashboardSections, type DashboardSection, type ProposalCard as ProposalCardType } from "../../../../shared/data/proposals";
import ProposalCard from "../../components/ProposalCard";
import Filters from "../../components/Filters";

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

  console.log("Rendering DashboardScreen", {
    searchQuery,
    selectedCategory,
    selectedDepartment,
    sortBy,
    includeArchived,
  });

  const filteredSections = dashboardSections.map((section) => {
    // We ignore the dynamic "Your Followed Projects" section in mobile for now if it is empty
    if (section.dynamic) return { ...section, cards: [] };
    if (!section.cards) return section;

    // Category filter: sections ARE categories — hide/empty out section if title doesn't match
    if (selectedCategory && section.title !== selectedCategory) {
      return { ...section, cards: [] };
    }

    // Apply search + department filters
    let filtered = section.cards.filter((card) => {
      // 1. Search Query
      const matchesSearch =
        searchQuery === "" ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Department
      const matchesDepartment =
        !selectedDepartment || card.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });

    return { ...section, cards: filtered };
  });

  const renderSection = (section: DashboardSection, idx: number) => {
    const cards: ProposalCardType[] = section.cards || [];
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
      <Text style={styles.pageTitle}>Project Tracking</Text>

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

      {/* Interactive Filters */}
      <Filters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        includeArchived={includeArchived}
        onToggleIncludeArchived={setIncludeArchived}
      />

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
    marginBottom: 16,
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
