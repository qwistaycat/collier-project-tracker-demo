import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect, useCallback } from "react";
import {
  dashboardSections,
  proposalRegistry,
  type DashboardSection,
  type ProposalCard as ProposalCardType,
} from "../../../../shared/data/proposals";
import ProposalCard from "../../components/ProposalCard";
import Filters from "../../components/Filters";

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "followed">("all");

  // Load from localStorage if on web
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = window.localStorage.getItem("collier_followed");
        if (stored) {
          setFollowedIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load followed projects", e);
      }
    }
  }, []);

  const toggleFollow = useCallback((id: string) => {
    setFollowedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem("collier_followed", JSON.stringify(next));
        } catch (e) {
          console.error("Failed to save followed projects", e);
        }
      }
      return next;
    });
  }, []);

  console.log("Rendering DashboardScreen", {
    searchQuery,
    selectedCategory,
    selectedDepartment,
    sortBy,
    includeArchived,
    followedIds,
    activeTab,
  });

  const filteredSections = dashboardSections.map((section) => {
    // Build followed cards dynamically
    if (section.dynamic) {
      const cards = followedIds
        .map((id) => proposalRegistry[id])
        .filter((c): c is ProposalCardType => !!c);
      return { ...section, cards };
    }
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

    // Empty-state for followed section
    if (cards.length === 0) {
      if (section.dynamic) {
        return (
          <View key={idx} style={styles.section}>
            <Text style={styles.emptyFollowedText}>
              You haven't followed any projects yet. Tap the follow button on a project to track it here.
            </Text>
          </View>
        );
      }
      return null;
    }

    return (
      <View key={idx} style={styles.section}>
        {!section.dynamic && <Text style={styles.sectionTitle}>{section.title}</Text>}
        {cards.map((card) => (
          <ProposalCard
            key={card.id}
            card={card}
            isFollowing={followedIds.includes(card.id)}
            onToggleFollow={toggleFollow}
          />
        ))}
      </View>
    );
  };

  // Split into tabs
  const exploreSections = filteredSections.filter((section) => !section.dynamic);
  const followedSection = filteredSections.find((section) => section.dynamic);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      stickyHeaderIndices={[1]}
    >
      {/* Index 0: Page Title */}
      <Text style={styles.pageTitle}>Project Tracking</Text>

      {/* Index 1: Sticky Tab Bar */}
      <View style={styles.stickyTabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "all" && styles.activeTabButton]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
              All Projects
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "followed" && styles.activeTabButton]}
            onPress={() => setActiveTab("followed")}
          >
            <Text style={[styles.tabText, activeTab === "followed" && styles.activeTabText]}>
              Followed Projects
            </Text>
            {followedIds.length > 0 && (
              <Text
                style={[
                  styles.tabCountText,
                  activeTab === "followed" ? styles.activeTabCountText : styles.inactiveTabCountText,
                ]}
              >
                ({followedIds.length})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Index 2: Tab Content */}
      {activeTab === "all" ? (
        <View style={styles.tabContent}>
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

          {/* Explore Sections */}
          {exploreSections.map((section, idx) => renderSection(section, idx))}
        </View>
      ) : (
        <View style={styles.tabContent}>
          {/* Followed Section */}
          {followedSection && renderSection(followedSection, 0)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingBottom: 40,
  },
  pageTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#111827",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 16,
  },
  stickyTabContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tabBar: {
    flexDirection: "row",
    gap: 12,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  activeTabButton: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  tabText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#4b5563",
  },
  activeTabText: {
    color: "#2563eb",
  },
  tabCountText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    marginLeft: 4,
  },
  activeTabCountText: {
    color: "#2563eb",
  },
  inactiveTabCountText: {
    color: "#9ca3af",
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
  emptyFollowedText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
    paddingVertical: 8,
  },
});
